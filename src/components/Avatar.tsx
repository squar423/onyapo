import {useId} from 'react';
import type {AvatarConfig} from '../lib/types';
import {normalizeAvatar} from '../lib/avatar';

/** All avatar features are original SVG shapes; no user-uploaded assets required. */
export function Avatar({config,size=56}:{config?:Partial<AvatarConfig>|null;size?:number}){
 const clipId=useId();
 const a=normalizeAvatar(config),hair=a.hairColor,skin=a.skin;
 const bodyWidth=25+(a.width-50)*.13;
 const tall=.96+(a.height-50)*.002;
 const noHair=a.hairStyle==='bald'||a.hairStyle==='none';
 const longHair=['long','locs','braids','twists'].includes(a.hairStyle);
 const circles=(xs:number[],y:number,r:number)=>xs.map((x,i)=><circle key={i} cx={x} cy={y+(i%2?2:-1)} r={r} fill={hair}/>);
 return <svg className="avatar-svg" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Avatar with ${a.hairStyle} hair, ${a.expression} expression, ${a.eyeStyle} eyes${a.glasses!=='none'?', '+a.glasses+' glasses':''}${a.hat!=='none'?', '+a.hat:''}`}>
  <title>Your customizable Onyapo avatar</title>
  <defs><clipPath id={clipId}><circle cx="60" cy="60" r="59"/></clipPath></defs>
  <g clipPath={`url(#${clipId})`}>
   <circle cx="60" cy="60" r="59" fill="#d8f3e6"/>
   <circle cx="100" cy="18" r="29" fill="#b8dfeb" opacity=".55"/>
   <g transform={`translate(0 ${60*(1-tall)}) scale(1 ${tall})`}>
    <path d={`M${60-bodyWidth} 123 Q${60-bodyWidth-3} 97 49 94 L49 87 H71 V94 Q${60+bodyWidth+3} 97 ${60+bodyWidth} 123Z`} fill="#0b8582"/>
    <path d="M49 89 L60 105 71 89" fill="#d1f0e5" opacity=".85"/>
    {longHair&&<path d="M34 60 Q23 22 59 15 Q98 20 87 67 L96 112 77 111 73 40 44 40 42 109 23 111Z" fill={hair}/>}
    <ellipse cx="60" cy="57" rx="25" ry="31" fill={skin}/>
    <ellipse cx="35" cy="60" rx="4.5" ry="8" fill={skin}/><ellipse cx="85" cy="60" rx="4.5" ry="8" fill={skin}/>
    {!noHair&&<>
      {a.hairStyle==='short'&&<path d="M35 42 Q39 20 61 22 Q82 20 85 43 L78 37 Q63 32 42 43Z" fill={hair}/>}
      {a.hairStyle==='rounded'&&<path d="M35 45 Q28 15 60 19 Q91 15 87 46 Q77 29 61 32 Q47 29 35 45Z" fill={hair}/>}
      {a.hairStyle==='afro'&&<>{circles([35,42,50,59,68,77,85],28,10)}{circles([34,42,50,58,67,77,87],37,8)}</>}
      {a.hairStyle==='pixie'&&<path d="M34 45 Q30 25 53 25 L61 18 66 24 Q84 21 87 43 L74 34 65 38 51 32Z" fill={hair}/>}
      {a.hairStyle==='bun'&&<><circle cx="77" cy="22" r="12" fill={hair}/><path d="M34 45 Q30 20 60 21 Q88 21 87 45 L79 35 Q58 27 40 42Z" fill={hair}/></>}
      {a.hairStyle==='long'&&<path d="M35 45 Q27 18 61 19 Q92 20 86 46 L78 35 Q55 28 40 44Z" fill={hair}/>}
      {a.hairStyle==='cornrows'&&<><path d="M34 46 Q31 22 60 19 Q91 19 86 46 Q75 38 67 38 Q52 34 34 46Z" fill={hair}/>{[-2,-1,0,1,2].map((n)=><path key={n} d={`M${60+n*10} 22 Q${59+n*9} 30 ${60+n*6} 39`} stroke="#b9a38a" strokeOpacity=".7" strokeWidth="1.8" fill="none" strokeLinecap="round"/>)}<path d="M35 46 Q58 38 85 46" stroke={hair} strokeWidth="4" fill="none"/></>}
      {(a.hairStyle==='locs'||a.hairStyle==='short-locs')&&<><path d="M34 43 Q30 17 60 18 Q90 17 87 43 L77 33 Q59 30 43 42Z" fill={hair}/>{[34,39,45,52,60,68,76,82,87].map((x,i)=>{const short=a.hairStyle==='short-locs';return <path key={i} d={`M${x} ${i%2?32:36} Q${x+(i%2?3:-2)} ${short?44:61} ${x+(i%3-1)*2} ${short?53+(i%3)*3:94+(i%3)*3}`} stroke={hair} strokeWidth={short?5:4.5} strokeLinecap="round" fill="none"/>})}</>}
      {(a.hairStyle==='braids'||a.hairStyle==='twists')&&<><path d="M34 46 Q28 17 60 18 Q92 19 87 46 L79 37 Q60 28 41 45Z" fill={hair}/>{[34,41,79,86].map((x,i)=><path key={i} d={a.hairStyle==='braids'?`M${x} 42 l-2 11 4 8 -4 10 4 9 -2 14`:`M${x} 42 q-5 12 1 21 q-5 13 1 30`} stroke={hair} strokeWidth="4.5" strokeLinecap="round" fill="none"/>)}</>}
      {a.texture==='curly'&&['rounded','short','long'].includes(a.hairStyle)&&circles([39,47,55,63,71,79],29,4.6)}
      {a.texture==='wavy'&&['rounded','long'].includes(a.hairStyle)&&<path d="M37 37 Q42 32 48 37 T60 37 T72 37 T83 37" stroke="#fff" strokeOpacity=".17" strokeWidth="2" fill="none"/>}
    </>}
    {/* Eyebrows change along with the selected facial expression. */}
    <path d={a.expression==='focused'?"M46 52 L56 55 M64 55 L74 52":a.expression==='surprised'?"M47 50 Q52 45 57 50 M63 50 Q68 45 73 50":"M46 52 Q51 49 56 52 M64 52 Q69 49 74 52"} stroke="#40302e" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {a.eyeStyle==='happy'?<><path d="M46 60 Q51 54 56 60 M64 60 Q69 54 74 60" stroke="#26343b" strokeWidth="2" strokeLinecap="round" fill="none"/></>:
     a.eyeStyle==='wink'?<><path d="M46 59 L56 59" stroke="#26343b" strokeWidth="2" strokeLinecap="round"/><ellipse cx="69" cy="59" rx="3" ry="4" fill="#27323a"/></>:
     a.eyeStyle==='sleepy'?<><path d="M46 58 Q51 56 56 58 M64 58 Q69 56 74 58" stroke="#27323a" strokeWidth="2" fill="none"/><circle cx="51" cy="60" r="1.3" fill="#27323a"/><circle cx="69" cy="60" r="1.3" fill="#27323a"/></>:
     a.eyeStyle==='wide'?<><ellipse cx="51" cy="59" rx="4.4" ry="5.5" fill="#fff"/><ellipse cx="69" cy="59" rx="4.4" ry="5.5" fill="#fff"/><circle cx="51" cy="60" r="2.6" fill="#26343b"/><circle cx="69" cy="60" r="2.6" fill="#26343b"/></>:
     a.eyeStyle==='round'?<><circle cx="51" cy="59" r="3.2" fill="#26343b"/><circle cx="69" cy="59" r="3.2" fill="#26343b"/></>:
     <><path d="M46 59 Q51 54 56 59 M64 59 Q69 54 74 59" fill="none" stroke="#26343b" strokeWidth="1.9" strokeLinecap="round"/><circle cx="51" cy="59" r="2" fill="#26343b"/><circle cx="69" cy="59" r="2" fill="#26343b"/></>}
    <path d="M59 63 Q57 69 60 70 L63 70" stroke="#7b5145" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    {a.facialHair==='beard'&&<path d="M36 69 Q36 87 50 91 Q60 102 70 91 Q84 87 84 69 L78 79 Q72 90 60 91 Q48 90 42 79Z" fill={hair} opacity=".90"/>}
    {a.facialHair==='stubble'&&<path d="M42 74 Q39 88 60 93 Q81 88 78 74" fill="none" stroke={hair} strokeWidth="5" opacity=".3" strokeDasharray="1 3"/>}
    {a.facialHair==='goatee'&&<path d="M53 79 Q60 84 67 79 L65 90 Q60 96 55 90Z" fill={hair} opacity=".9"/>}
    {['mustache','beard','goatee'].includes(a.facialHair)&&<path d="M48 75 Q54 72 60 76 Q66 72 72 75 Q67 80 60 77 Q53 80 48 75Z" fill={hair}/>}
    {a.expression==='smile'&&<path d="M51 81 Q60 88 69 81" stroke="#783e36" strokeWidth="2" strokeLinecap="round" fill="none"/>}
    {a.expression==='neutral'&&<path d="M53 83 L67 83" stroke="#783e36" strokeWidth="1.8" strokeLinecap="round"/>}
    {a.expression==='excited'&&<><path d="M50 80 Q60 96 70 80Z" fill="#7e3634"/><path d="M53 81 L67 81" stroke="#f5dad0" strokeWidth="2.2"/></>}
    {a.expression==='focused'&&<path d="M53 83 Q60 81 67 83" stroke="#783e36" strokeWidth="1.8" strokeLinecap="round" fill="none"/>}
    {a.expression==='surprised'&&<ellipse cx="60" cy="83" rx="4" ry="5.5" fill="#793d38"/>}
    {a.expression==='calm'&&<path d="M53 82 Q60 85 67 82" stroke="#783e36" strokeWidth="1.7" strokeLinecap="round" fill="none"/>}
    {/* Glasses can be combined with any haircut or hat. */}
    {a.glasses==='round'&&<g stroke="#244858" strokeWidth="2.1" fill="#d8f3e6" fillOpacity=".16"><circle cx="51" cy="59" r="8"/><circle cx="69" cy="59" r="8"/><path d="M59 57 Q60 56 61 57 M43 58 L36 56 M77 58 L84 56" fill="none"/></g>}
    {a.glasses==='square'&&<g stroke="#244858" strokeWidth="2" fill="#d8f3e6" fillOpacity=".12"><rect x="42" y="52" width="17" height="13" rx="4"/><rect x="61" y="52" width="17" height="13" rx="4"/><path d="M59 56 L61 56 M42 55 L36 54 M78 55 L84 54" fill="none"/></g>}
    {a.glasses==='sunglasses'&&<g fill="#1b4950" opacity=".96"><rect x="42" y="53" width="17" height="12" rx="5"/><rect x="61" y="53" width="17" height="12" rx="5"/><path d="M59 55 L61 55" stroke="#1b4950" strokeWidth="3"/></g>}
    {a.hat==='cap'&&<><path d="M31 34 Q33 11 60 12 Q88 11 89 34 L87 42 Q61 35 33 42Z" fill="#187f98"/><path d="M33 40 Q63 32 94 42 Q81 49 53 46Z" fill="#0d5f7a"/></>}
    {a.hat==='beanie'&&<><path d="M31 41 Q28 11 60 10 Q90 11 89 41Z" fill="#27788e"/><path d="M31 35 Q60 30 89 35 L89 44 Q60 39 31 44Z" fill="#124f64"/></>}
    {a.hat==='bucket'&&<><path d="M37 16 Q59 9 83 16 L89 39 31 39Z" fill="#2c9988"/><path d="M27 39 Q60 32 93 39 Q89 45 60 46 Q31 45 27 39Z" fill="#176c6a"/></>}
   </g>
  </g>
  <circle cx="60" cy="60" r="59" fill="none" stroke="#8bbcac" strokeOpacity=".5"/>
 </svg>;
}
