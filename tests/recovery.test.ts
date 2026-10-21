import {describe,it,expect} from 'vitest';
import {completedWorkoutToday} from '../src/lib/recovery';
import type {Session} from '../src/lib/types';
const session=(at?:string):Session=>({id:'x',createdAt:'2026-10-20T01:00:00Z',setting:'home',slots:[],completedAt:at});
describe('once-per-day recovery reminder',()=>{
 it('does not warn for an unfinished plan',()=>expect(completedWorkoutToday([session()],new Date('2026-10-20T16:00:00Z'))).toBe(false));
 it('warns for a completed plan on the same local day',()=>expect(completedWorkoutToday([session('2026-10-20T14:00:00Z')],new Date('2026-10-20T16:00:00Z'))).toBe(true));
 it('does not warn for a past completed session',()=>expect(completedWorkoutToday([session('2026-10-18T14:00:00Z')],new Date('2026-10-20T16:00:00Z'))).toBe(false));
});
