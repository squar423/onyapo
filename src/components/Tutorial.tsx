import {useState} from 'react';import {ArrowRight,ArrowLeft,X,Sprout,Dumbbell,Map,Users,UserRound,HeartHandshake,BookOpen} from 'lucide-react';
import {useApp} from '../lib/store';
const slides=[
 {title:'Movement belongs to everyone.',icon:Sprout,subtitle:'Welcome to Onyapo',body:'Build a sustainable relationship with your body. Explore 376 movements drawn from the anatomy atlases, without pressure to be perfect.'},
 {title:'Your day, your space.',icon:Dumbbell,subtitle:'Workout studio',body:'Choose home or gym. Plans aim for four preparation stretches, eight varied exercises, and four cooldown stretches. Use challenging-but-safe resistance and mark each set green.'},
 {title:'Learn what moves.',icon:Map,subtitle:'Muscle atlas & library',body:'Tap a muscle region to see recent activity and resistance notes. Browse every movement, review target muscles, and watch demonstrations as videos become available.'},
 {title:'Progress is personal.',icon:UserRound,subtitle:'Your profile',body:'Earn 20 XP for each completed workout, level up, and customize your avatar with hair, facial hair, eyes, expressions, hats, glasses, and body proportions. Repeated exercises show your last recorded resistance.'},
 {title:'Learn the approach.',icon:BookOpen,subtitle:'Tutorial page',body:'The permanent Tutorial page explains controlled reps, moderate resistance, deep-breath stretches, muscle rotation, and recovery. Start with one workout per day at most.'},
 {title:'Encourage each other.',icon:Users,subtitle:'Friends',body:'Search usernames or friend codes, exchange uplifting preset messages, and choose what workouts you share with accepted friends.'},
 {title:'Free, thoughtful, and growing.',icon:HeartHandshake,subtitle:'Our mission',body:'The resource is free to use, with optional community donations. Move within your abilities, and consult a clinician before starting if health concerns affect exercise.'}
];
export function Tutorial(){const {profile,updateProfile}=useApp();const [step,setStep]=useState(0);
 if(!profile||profile.tutorial_done)return null;
 const slide=slides[step],Icon=slide.icon;
 return <div className="modal-scrim" role="presentation"><div className="modal tutorial" role="dialog" aria-modal="true" aria-labelledby="tutorial-heading"><button className="icon-button close" aria-label="Skip tutorial" onClick={()=>updateProfile({tutorial_done:true})}><X size={20}/></button><div className="tutorial-icon"><Icon size={40}/></div><div className="eyebrow">{slide.subtitle} · {step+1} / {slides.length}</div><h2 id="tutorial-heading">{slide.title}</h2><p>{slide.body}</p><div className="tutorial-dots">{slides.map((_,i)=><span key={i} className={i===step?'active':''}/>)}</div><div className="tutorial-actions"><button className="button secondary" disabled={step===0} onClick={()=>setStep(s=>s-1)}><ArrowLeft size={16}/> Back</button><button className="button primary" onClick={()=>step===slides.length-1?updateProfile({tutorial_done:true}):setStep(s=>s+1)}>{step===slides.length-1?'Start moving':'Continue'} <ArrowRight size={17}/></button></div></div></div>
}
