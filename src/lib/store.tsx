import React,{createContext,useCallback,useContext,useEffect,useState,useRef} from 'react';
import type {Profile,Stats,Session,Friend,FriendRequest,Encouragement,AvatarConfig,FriendActivity} from './types';
import {cloudEnabled,supabase} from './supabase';
import {DEFAULT_AVATAR,normalizeAvatar} from './avatar';
export {DEFAULT_AVATAR} from './avatar';

const makeProfile=():Profile=>({id:'demo',username:'trailblazer',friend_code:'DEMO-2026',bio:'One step stronger every day.',avatar:DEFAULT_AVATAR,tutorial_done:false,share_activity:false});
// Read demo saves from previous releases without deleting them; all new writes use Onyapo keys.
const localLoad=<T,>(key:string,fallback:T):T=>{try{const s=localStorage.getItem('onyapo_'+key)??localStorage.getItem('vm_'+key);return s?JSON.parse(s) as T:fallback}catch{return fallback}};
const localSave=(key:string,val:unknown)=>localStorage.setItem('onyapo_'+key,JSON.stringify(val));
const normalizeProfile=(profile:Profile):Profile=>({...profile,share_activity:profile.share_activity??false,avatar:normalizeAvatar(profile.avatar)});
const errorMessage=(error:unknown)=>error instanceof Error?error.message:String(error);
type Context={
 profile:Profile|null;stats:Stats;sessions:Session[];ready:boolean;demo:boolean;notice:string;
 signUp:(email:string,password:string,username:string)=>Promise<string>;
 signIn:(email:string,password:string)=>Promise<void>;signOut:()=>Promise<void>;startDemo:()=>void;
 updateProfile:(updates:Partial<Profile>)=>Promise<void>;saveSession:(session:Session)=>Promise<void>;
 finishSession:(session:Session)=>Promise<void>;searchPeople:(query:string)=>Promise<Friend[]>;
 requests:FriendRequest[];friends:Friend[];requestPeople:Record<string,Friend>;encouragements:Encouragement[];friendActivity:FriendActivity[];
 sendRequest:(userId:string)=>Promise<void>;respondRequest:(id:string,accept:boolean)=>Promise<void>;
 sendMessage:(toId:string,template:string,summary?:string)=>Promise<void>;
 refreshSocial:()=>Promise<void>;clearNotice:()=>void;
};
const C=createContext<Context|null>(null);
export function useApp(){const v=useContext(C);if(!v)throw new Error('Provider missing');return v}
export function AppProvider({children}:{children:React.ReactNode}){
 const [profile,setProfile]=useState<Profile|null>(null),[stats,setStats]=useState<Stats>({xp:0,completed_workouts:0}),[sessions,setSessions]=useState<Session[]>([]);
 const [ready,setReady]=useState(false),[notice,setNotice]=useState(''),[demo,setDemo]=useState(false);
 const [friendActivity,setFriendActivity]=useState<FriendActivity[]>([]),[friends,setFriends]=useState<Friend[]>([]),[requests,setRequests]=useState<FriendRequest[]>([]),[encouragements,setEncouragements]=useState<Encouragement[]>([]),[requestPeople,setRequestPeople]=useState<Record<string,Friend>>({});
 const cloudWriteQueue=useRef<Promise<unknown>>(Promise.resolve());
 const hydrate=useCallback(async(id:string)=>{
  if(!supabase)return;
  const [p,s,w]=await Promise.all([
   supabase.from('profiles').select('*').eq('id',id).single(),
   supabase.from('profile_stats').select('xp,completed_workouts').eq('id',id).single(),
   supabase.from('workouts').select('plan').eq('user_id',id).order('created_at',{ascending:false}).limit(300)
  ]);
  if(p.error)throw p.error;
  setProfile(normalizeProfile(p.data as Profile));
  setStats(s.data?{xp:s.data.xp,completed_workouts:s.data.completed_workouts}:{xp:0,completed_workouts:0});
  setSessions((w.data||[]).map(x=>x.plan as Session));
 },[]);
 const refreshSocial=useCallback(async()=>{
  if(!supabase||!profile||demo)return;
  const [q,m]=await Promise.all([
   supabase.from('friend_requests').select('*').or(`from_user.eq.${profile.id},to_user.eq.${profile.id}`).order('created_at',{ascending:false}),
   supabase.from('encouragements').select('*').eq('to_user',profile.id).order('created_at',{ascending:false}).limit(30)
  ]);
  const all=(q.data||[]) as FriendRequest[];
  setRequests(all);setEncouragements((m.data||[]) as Encouragement[]);
  // Migration 0002 adds this privacy-gated RPC. Until then, show an empty feed.
  const activity=await supabase.rpc('friend_activity_feed',{p_limit:30});
  if(!activity.error)setFriendActivity((activity.data||[]) as FriendActivity[]);
  const ids=all.filter(r=>r.status==='accepted').map(r=>r.from_user===profile.id?r.to_user:r.from_user);
  const allIds=[...new Set([...ids,...all.map(r=>r.from_user)])].filter(id=>id!==profile.id);
  if(allIds.length){const response=await supabase.from('profiles').select('id,username,friend_code,bio,avatar').in('id',allIds);const people=(response.data||[]) as Friend[];setFriends(people.filter(x=>ids.includes(x.id)));setRequestPeople(Object.fromEntries(people.map(x=>[x.id,x])))}else{setFriends([]);setRequestPeople({})}
 },[profile?.id,demo]);
 useEffect(()=>{
  if(!supabase){
   if(localLoad('demoActive',false)){setDemo(true);setProfile(normalizeProfile(localLoad('profile',makeProfile())));setStats(localLoad('stats',{xp:0,completed_workouts:0}));setSessions(localLoad('sessions',[]))}
   setReady(true);return;
  }
  let alive=true;
  supabase.auth.getUser().then(async({data})=>{if(alive&&data.user){try{await hydrate(data.user.id)}catch(e){setNotice(errorMessage(e))}}if(alive)setReady(true)});
  const sub=supabase.auth.onAuthStateChange((_,s)=>{
   if(!alive)return;
   if(s?.user)window.setTimeout(()=>hydrate(s.user.id).catch(e=>setNotice(errorMessage(e))),50);
   else {setProfile(null);setSessions([]);setFriends([]);setRequests([]);setEncouragements([]);setFriendActivity([]);setStats({xp:0,completed_workouts:0})}
  });
  return()=>{alive=false;sub.data.subscription.unsubscribe()};
 },[hydrate]);
 useEffect(()=>{if(demo&&profile){localSave('profile',profile);localSave('stats',stats);localSave('sessions',sessions)}},[demo,profile,stats,sessions]);
 useEffect(()=>{if(profile&&!demo)refreshSocial().catch(()=>{})},[profile?.id,demo,refreshSocial]);
 const signUp=async(email:string,password:string,username:string)=>{
  if(!supabase)throw new Error('Configure Supabase for verified accounts. You can explore demo mode without one.');
  const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+import.meta.env.BASE_URL,data:{username}}});
  if(error)throw error;return 'Check your inbox and click the confirmation link before signing in.';
 };
 const signIn=async(email:string,password:string)=>{if(!supabase)throw Error('Accounts need Supabase configuration');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;};
 const startDemo=()=>{const p=normalizeProfile(localLoad('profile',makeProfile()));setDemo(true);localSave('demoActive',true);setProfile(p);setStats(localLoad('stats',{xp:0,completed_workouts:0}));setSessions(localLoad('sessions',[]));};
 const signOut=async()=>{if(demo){localSave('demoActive',false);setDemo(false);setProfile(null);setSessions([]);setFriends([]);setRequests([]);setEncouragements([]);setFriendActivity([]);return;}if(supabase){await supabase.auth.signOut()}else{localSave('demoActive',false);setProfile(null)}};
 const updateProfile=async(updates:Partial<Profile>)=>{
  if(!profile)return;
  const updated=normalizeProfile({...profile,...updates});
  if(supabase&&!demo){const {error}=await supabase.from('profiles').update(updates).eq('id',profile.id);if(error)throw error;}
  setProfile(updated);
 };
 const saveSession=async(session:Session)=>{
  if(supabase&&!demo&&profile){
   // Preserve the non-null client across the queued async callback.
   const client=supabase;
   const task=cloudWriteQueue.current.then(async()=>{const {error}=await client.from('workouts').upsert({id:session.id,user_id:profile.id,setting:session.setting,plan:session,created_at:session.createdAt});if(error)throw error;});
   cloudWriteQueue.current=task.catch(()=>{});
   await task;
  }
  setSessions(prev=>[session,...prev.filter(s=>s.id!==session.id)].slice(0,300));
 };
 const finishSession=async(session:Session)=>{
  if(session.completedAt)return;
  await saveSession(session);
  if(supabase&&!demo){
   const {error}=await supabase.rpc('finish_workout',{p_workout_id:session.id});
   if(error)throw error;
   if(profile)await hydrate(profile.id);
  }else {const completed={...session,completedAt:new Date().toISOString()};setSessions(prev=>[completed,...prev.filter(s=>s.id!==session.id)]);setStats(prev=>({xp:prev.xp+20,completed_workouts:prev.completed_workouts+1}));}
 };
 const searchPeople=async(query:string):Promise<Friend[]>=>{
  if(!supabase||demo||!profile)return [];
  const term=query.trim().replace(/[%_,]/g,'');if(term.length<2)return [];
  const {data,error}=await supabase.from('profiles').select('id,username,friend_code,bio,avatar').or(`username.ilike.%${term}%,friend_code.ilike.%${term}%`).neq('id',profile.id).limit(20);
  if(error)throw error;return data as Friend[];
 };
 const sendRequest=async(toId:string)=>{if(!supabase||!profile)throw Error('Friend requests require a verified account');const {error}=await supabase.from('friend_requests').insert({from_user:profile.id,to_user:toId});if(error)throw error;await refreshSocial()};
 const respondRequest=async(id:string,accept:boolean)=>{if(!supabase)throw Error('Not signed in');const {error}=await supabase.from('friend_requests').update({status:accept?'accepted':'declined'}).eq('id',id);if(error)throw error;await refreshSocial()};
 const sendMessage=async(toId:string,template_key:string,workout_summary?:string)=>{if(!supabase||!profile)throw Error('Messages require a verified account');const {error}=await supabase.from('encouragements').insert({from_user:profile.id,to_user:toId,template_key,workout_summary:workout_summary||null});if(error)throw error;setNotice('Encouragement sent!')};
 return <C.Provider value={{profile,stats,sessions,ready,demo,notice,signUp,signIn,signOut,startDemo,updateProfile,saveSession,finishSession,searchPeople,requests,friends,requestPeople,encouragements,friendActivity,sendRequest,respondRequest,sendMessage,refreshSocial,clearNotice:()=>setNotice('')}}>{children}</C.Provider>;
}
