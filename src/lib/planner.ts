import {exercises,exerciseById,isIsolation,isStrength,isStretch,regionGroup} from './catalog';
import type {Exercise,Session,Setting,Slot} from './types';

const mainGroups=['Chest / shoulder','Back','Thigh / knee','Hips / glutes','Core','Calves / ankles','Arms','Hands / wrists','Neck','Pelvic floor','Breathing'];
const safeMain=new Set(mainGroups);
// Conservative first-release screen: higher-skill or precarious setups remain in the library.
const avoidUnsupervised=(e:Exercise)=>/handstand|headstand|inverted table row|neck bridge|landmine|pistol squat|nordic hamstring|sissy squat/i.test(e.name+' '+e.equipment);
const match=(a:string[],b:string[])=>a.filter(x=>b.includes(x)).length;
const isoOverlap=(e:Exercise,selected:Exercise[])=>{
 const active=[...e.primary,...e.assisting];
 return selected.some(s=>isIsolation(s) ? s.primary.some(m=>active.includes(m)) : isIsolation(e) && e.primary.some(m=>[...s.primary,...s.assisting].includes(m)));
};
function priorUsage(history:Session[]){
 const last=new Map<string,number>(), muscleUses=new Map<string,number>();
 history.filter(h=>h.completedAt).forEach((h,age)=>h.slots.filter(s=>s.phase==='strength'&&!s.skipped&&s.setDone.every(Boolean)).forEach(s=>{
   const e=exerciseById.get(s.exerciseId);if(!e)return;
   last.set(e.id,Math.max(last.get(e.id)||0,new Date(h.completedAt||h.createdAt).getTime()));
   e.primary.forEach(m=>muscleUses.set(m,(muscleUses.get(m)||0)+1/(1+age)));
 }));
 return {last,muscleUses};
}
function pickStretches(phase:'warmup'|'cooldown',selected:Exercise[],mode:Setting,existing:Set<string>,count:number,history:Session[]){
 const recentlyUsed=new Map<string,number>();
 history.filter(s=>s.completedAt).forEach((s,age)=>s.slots.filter(x=>x.phase!=='strength'&&!x.skipped).forEach(x=>{recentlyUsed.set(x.exerciseId,(recentlyUsed.get(x.exerciseId)||0)+15/(age+1));}));
 const activeMuscles=[...new Set(selected.flatMap(e=>[...e.primary,...e.assisting]))];
 const scored=exercises.filter(e=>e.setting==='home'||mode==='gym').filter(e=>isStretch(e)&&e.stretched.length>0&&!existing.has(e.id)).map(e=>{
  const isPassive=e.category==='Passive stretch';
  const pref=phase==='warmup' ? (isPassive?0:10) : (isPassive?10:0);
  return {e,score:pref+match(e.stretched,activeMuscles)*4+match(e.primary,activeMuscles)*1.5-(recentlyUsed.get(e.id)||0)};
 }).sort((a,b)=>b.score-a.score||a.e.id.localeCompare(b.e.id));
 const chosen:Exercise[]=[];
 for(const row of scored){
  if(chosen.length>=count)break;
  const sameRegion=chosen.filter(e=>e.region===row.e.region).length;
  const sameType=chosen.filter(e=>e.category===row.e.category).length;
  // prefer diversity and a mix of static / dynamic work.
  if(sameRegion>=2 || sameType>=3)continue;
  chosen.push(row.e);existing.add(row.e.id);
 }
 for(const row of scored){if(chosen.length>=count)break;if(!existing.has(row.e.id)){chosen.push(row.e);existing.add(row.e.id)}}
 return chosen;
}
const makeSlot=(e:Exercise,phase:Slot['phase'],index:number):Slot=>{
 const n=phase==='strength'?3:1;
 return {slotId:`${phase}-${index}-${e.id}`,exerciseId:e.id,phase,setDone:Array(n).fill(false),metrics:Array.from({length:n},()=>({}))};
};
export function generatePlan(mode:Setting,history:Session[],now=new Date()):Session{
 const prior=priorUsage(history);
 // Respect user-provided safety feedback from previously saved plans.
 const excluded=new Set<string>();
 history.forEach(session=>{const days=(now.getTime()-new Date(session.createdAt).getTime())/86400000;session.slots.filter(slot=>Boolean(slot.skipped)).forEach(slot=>{if((slot.skipped==='This exercise seems dangerous or unsafe'&&days<30)||(slot.skipped==="I can't do this exercise today"&&days<2))excluded.add(slot.exerciseId);});});
 const completed=history.filter(x=>x.completedAt).length;
 const rotating=mainGroups.slice(0,7).concat(mainGroups.slice(7));
 const cycle=['Chest / shoulder','Back','Thigh / knee','Hips / glutes','Core','Calves / ankles','Arms'];
 const extra=rotating.slice(7)[completed%4];
 const targetGroups=[...cycle,extra];
 // Gym prefers gym-labelled movements, but allows at-home movements doable in any gym.
 const pool=exercises.filter(e=>isStrength(e)&&safeMain.has(regionGroup(e.region))&&!avoidUnsupervised(e)&&!excluded.has(e.id)&&(mode==='gym'||e.setting==='home'));
 const selected:Exercise[]=[];
 const usedIds=new Set<string>();
 function score(e:Exercise,group:string){
   const last=prior.last.get(e.id)||0;const days=last?(now.getTime()-last)/86400000:999;
   const novelty=last===0?20:Math.min(12,days*2)-15;
   const fatigue=e.primary.reduce((sum,m)=>sum+(prior.muscleUses.get(m)||0),0);
   const regionDup=selected.filter(x=>regionGroup(x.region)===regionGroup(e.region)).length;
   const modeFit=mode==='gym'&&e.setting==='gym'?7:0;
   return novelty+modeFit-fatigue*2-regionDup*14+(regionGroup(e.region)===group?20:0) + ((completed+parseInt(e.id.slice(2),10))%9)*.1;
 }
 for(const group of targetGroups){
   const candidates=pool.filter(e=>regionGroup(e.region)===group&&!usedIds.has(e.id)&&!isoOverlap(e,selected)).sort((a,b)=>score(b,group)-score(a,group));
   if(candidates[0]){selected.push(candidates[0]);usedIds.add(candidates[0].id)}
 }
 // Fall back when a category is missing or incompatible with isolated-muscle constraints.
 for(const e of [...pool].sort((a,b)=>score(b,'')-score(a,''))){
  if(selected.length>=8)break;
  if(!usedIds.has(e.id)&&!isoOverlap(e,selected)){selected.push(e);usedIds.add(e.id)}
 }
 const seen=new Set<string>([...selected.map(e=>e.id),...excluded]);
 const warm=pickStretches('warmup',selected,mode,seen,4,history);
 const cool=pickStretches('cooldown',selected,mode,seen,4,history);
 const slots=[...warm.map((e,i)=>makeSlot(e,'warmup',i)),...selected.slice(0,8).map((e,i)=>makeSlot(e,'strength',i)),...cool.map((e,i)=>makeSlot(e,'cooldown',i))];
 return {id:crypto.randomUUID(),createdAt:now.toISOString(),setting:mode,slots};
}
export function completion(session:Session){const active=session.slots.filter(s=>!s.skipped);const total=active.reduce((n,s)=>n+s.setDone.length,0);const done=active.reduce((n,s)=>n+s.setDone.filter(Boolean).length,0);return {done,total,percent:total?Math.round(done/total*100):0};}
export function canFinish(session:Session){const active=session.slots.filter(s=>!s.skipped);return active.filter(s=>s.phase==='strength'&&s.setDone.every(Boolean)).length>=4 && active.length>0 && active.every(s=>s.setDone.every(Boolean));}
export function coveredMuscles(session:Session){return [...new Set(session.slots.filter(s=>s.phase==='strength'&&!s.skipped&&s.setDone.some(Boolean)).flatMap(s=>exerciseById.get(s.exerciseId)?.primary||[]))];}
