import {describe,it,expect} from 'vitest';
import {previousExercise,previousSetLabel} from '../src/lib/history';
import type {Session} from '../src/lib/types';
const make=(id:string,exerciseId:string,done:boolean[],metrics:any[],createdAt:string,skipped?:string):Session=>({id,setting:'gym',createdAt,slots:[{slotId:id,exerciseId,phase:'strength',setDone:done,metrics,skipped}]});
describe('Last time you did ...',()=>{
 it('finds most recent completed sets, matching each set and ignoring future/current/empty',()=>{
  const a=make('old','EX0001',[true,true,false],[{weightKg:10},{weightKg:12},{}],'2025-01-01');
  const newer=make('newer','EX0001',[true,false,true],[{weightKg:20},{},{weightKg:22}],'2025-02-01');
  const blank=make('blank','EX0001',[false,false,false],[], '2025-02-02');
  const current=make('current','EX0001',[true],[{weightKg:99}],'2025-03-01');
  const latest=previousExercise([a,newer,blank,current],current,'EX0001');
  expect(latest?.sessionId).toBe('newer');
  expect(previousSetLabel(latest,0,'weight')).toBe('20 kg');
  expect(previousSetLabel(latest,1,'weight')).toBe('No previous set');
  expect(previousSetLabel(latest,2,'weight')).toBe('22 kg');
 });
 it('supports bands and excludes skipped sessions',()=>{
  const skipped=make('skipped','EX0002',[true],[{bandLevel:'heavy',bandCount:3}],'2025-02-02','unsafe');
  const older=make('older','EX0002',[true],[{bandLevel:'medium',bandCount:2}],'2025-02-01');
  const current=make('current','EX0002',[false],[{}],'2025-03-01');
  expect(previousSetLabel(previousExercise([skipped,older],current,'EX0002'),0,'band')).toBe('Medium band × 2');
  expect(previousExercise([],current,'EX0002')).toBeNull();
 });
});
