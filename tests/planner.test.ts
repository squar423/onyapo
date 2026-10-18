import {describe,it,expect} from 'vitest';
import {exercises,exerciseById,isIsolation,isStretch} from '../src/lib/catalog';
import {generatePlan,completion,canFinish} from '../src/lib/planner';
import {levelInfo} from '../src/lib/level';
import type {Session} from '../src/lib/types';
const now=new Date('2026-10-17T18:00:00Z');
describe('sourced movement dataset',()=>{
 it('retains all source records with stable IDs',()=>{expect(exercises.length).toBe(376);expect(new Set(exercises.map(x=>x.id)).size).toBe(376)});
 it('has 310 home and 66 gym activities',()=>{expect(exercises.filter(x=>x.setting==='home').length).toBe(310);expect(exercises.filter(x=>x.setting==='gym').length).toBe(66)});
});
describe('workout rotation',()=>{
 for(const mode of ['home','gym'] as const){
 it(`${mode} generates 4/8/4 with 3 exercise sets`,()=>{
  const p=generatePlan(mode,[],now);expect(p.slots.filter(s=>s.phase==='warmup').length).toBe(4);
  expect(p.slots.filter(s=>s.phase==='strength').length).toBe(8);expect(p.slots.filter(s=>s.phase==='cooldown').length).toBe(4);
  expect(p.slots.filter(s=>s.phase==='strength').every(s=>s.setDone.length===3)).toBe(true);
  expect(new Set(p.slots.map(s=>s.exerciseId)).size).toBe(16);
  if(mode==='home')expect(p.slots.every(s=>exerciseById.get(s.exerciseId)?.setting==='home')).toBe(true);
  expect(p.slots.filter(s=>s.phase!=='strength').every(s=>isStretch(exerciseById.get(s.exerciseId)!))).toBe(true);
  const strength=p.slots.filter(s=>s.phase==='strength').map(s=>exerciseById.get(s.exerciseId)!);
  for(const a of strength.filter(isIsolation)){for(const b of strength.filter(x=>x!==a)){expect(a.primary.filter(m=>[...b.primary,...b.assisting].includes(m))).toEqual([])}}
 });
 }
 it('varies movements after a completed session',()=>{const a=generatePlan('home',[],now);const done:Session={...a,completedAt:now.toISOString(),slots:a.slots.map(s=>({...s,setDone:s.setDone.map(()=>true)}))};const b=generatePlan('home',[done],new Date('2026-10-19T18:00:00Z'));expect(b.slots.map(s=>s.exerciseId).join()).not.toBe(a.slots.map(s=>s.exerciseId).join())});
 it('counts sets, requires at least four exercises to finish',()=>{const s=generatePlan('home',[],now);expect(canFinish(s)).toBe(false);const done:Session={...s,slots:s.slots.map(slot=>({...slot,setDone:slot.setDone.map(()=>true)}))};expect(canFinish(done)).toBe(true);expect(completion(done).percent).toBe(100)});
});
describe('levels',()=>{it('uses sequential thresholds',()=>{expect(levelInfo(0).level).toBe(1);expect(levelInfo(100).level).toBe(2);expect(levelInfo(500).level).toBe(3);expect(levelInfo(1500).level).toBe(4);expect(levelInfo(3000).level).toBe(5);expect(levelInfo(5000).level).toBe(6);expect(levelInfo(10000).level).toBe(7);expect(levelInfo(15000).level).toBe(8)})});
