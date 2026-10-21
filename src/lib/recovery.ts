import type {Session} from './types';
/** Deliberately uses the visitor's local calendar day, not UTC midnight. */
export function completedWorkoutToday(sessions:Session[],now:Date=new Date()):boolean{
 const date=now.toDateString();
 return sessions.some(s=>Boolean(s.completedAt)&&new Date(s.completedAt as string).toDateString()===date);
}
