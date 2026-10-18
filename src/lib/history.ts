import type {Session,SetMetrics,Slot} from './types';

export interface PreviousExercise {
 date:string;
 sessionId:string;
 completedSets:Array<{index:number;metrics:SetMetrics}>;
}
/** The most recent earlier *performed* instance of this exact exercise.
 * Never use uncompleted sets, skipped movements or data from the active workout.
 * This also recognizes performed sets in abandoned sessions.
 */
export function previousExercise(sessions:Session[],active:Session,exerciseId:string):PreviousExercise|null{
 const instances=sessions
  .filter(session=>session.id!==active.id&&Date.parse(session.createdAt)<=Date.parse(active.createdAt))
  .flatMap(session=>session.slots.filter(slot=>slot.exerciseId===exerciseId&&slot.phase==='strength'&&!slot.skipped)
   .map(slot=>({session,slot})))
  .filter(({slot})=>slot.setDone.some(Boolean))
  .sort((a,b)=>Date.parse(b.session.completedAt||b.session.createdAt)-Date.parse(a.session.completedAt||a.session.createdAt));
 if(!instances.length)return null;
 const {session,slot}=instances[0];
 return {sessionId:session.id,date:session.completedAt||session.createdAt,
  completedSets:slot.setDone.flatMap((done,index)=>done?[{index,metrics:slot.metrics[index]||{}}]:[])};
}
export function previousSetLabel(previous:PreviousExercise|null,index:number,kind:'band'|'weight'|'other'){
 if(!previous)return null;
 const recorded=previous.completedSets.find(s=>s.index===index);
 if(!recorded)return 'No previous set';
 const m=recorded.metrics;
 if(kind==='band')return m.bandLevel?`${m.bandLevel[0].toUpperCase()+m.bandLevel.slice(1)} band × ${m.bandCount??1}`:'Resistance not recorded';
 if(kind==='weight')return m.weightKg!==undefined?`${m.weightKg} kg`:'Weight not recorded';
 return 'Completed';
}
