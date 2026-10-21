import {useId} from 'react';
import type {AvatarConfig} from '../lib/types';
import {normalizeAvatar} from '../lib/avatar';

const strandOffsets=[-24,-17,-10,-3,4,11,18,25];
/** Original friendly portrait avatar, using configurable vector hair and face elements. */
export function Avatar({config,size=56}:{config?:Partial<AvatarConfig>|null;size?:number}){
 const a=normalizeAvatar(config),prefix=useId().replace(/:/g,'');
 const skin=a.skin, hair=a.hairColor;
 const fullHeight=1+(a.height-50)*.0017;
 const bodyHalf=30+(a.width-50)*.11;
 const bald=['bald','none'].includes(a.hairStyle);
 const long=['long','locs','braids','box-braids','twists','loc-bob'].includes(a.hairStyle);
 const foreheadColor=a.skin;
 const face=a.faceShape==='round'?'M43 58 Q43 28 70 29 Q97 28 97 58 Q99 93 70 102 Q41 93 43 58Z':a.faceShape==='square'?'M44 45 Q46 30 70 29 Q94 30 96 45 L94 84 Q91 99 70 101 Q49 99 46 84Z':a.faceShape==='heart'?'M44 52 Q42 30 69 29 Q97 29 96 52 Q96 84 70 102 Q44 85 44 52Z':'M44 49 Q45 27 70 28 Q95 27 96 49 Q99 87 70 102 Q41 87 44 49Z';
 const brows=a.eyebrowStyle==='straight'?['M52 56 L63 56','M77 56 L88 56']:a.eyebrowStyle==='arched'?['M51 55 Q56 48 63 54','M77 54 Q84 48 89 55']:['M52 55 Q57 52 63 54','M77 54 Q83 52 88 55'];
 const lid=a.expression==='surprised'||a.eyeStyle==='wide'?5.7:a.eyeStyle==='sleepy'?2.7:4;
 const eyes=(center:number)=>a.eyeStyle==='happy'?<path d={`M${center-6} 67 Q${center} 59 ${center+6} 67`} stroke="#302c2d" strokeWidth="2.1" fill="none" strokeLinecap="round"/>:<g><path d={`M${center-6} 67 Q${center} ${67-lid} ${center+6} 67`} stroke="#473934" strokeWidth="1.7" fill="none"/>{a.eyeStyle==='wink'&&center===57?<path d="M51 67 L63 67" stroke="#302c2d" strokeWidth="2.5"/>:<><ellipse cx={center} cy="67" rx={a.eyeStyle==='wide'?3.6:2.9} ry={a.eyeStyle==='sleepy'?1.9:3.8} fill="#fff"/><circle cx={center} cy="67" r="2.4" fill={a.eyeColor}/><circle cx={center+.6} cy="66.1" r=".8" fill="white"/></>}</g>;
 const curls=(xs:number[],ys:number[],r:number)=>xs.flatMap((x,j)=>ys.map((y,i)=><circle key={`${j}-${i}`} cx={x+(i%2?2:-1)} cy={y+(j%2?-1:1)} r={r-(i%3)*.45} fill={hair} stroke="#e9d6bb" strokeOpacity=".12" strokeWidth=".7"/>));
 const locs=(short:boolean)=>strandOffsets.map((x,i)=> <g key={i}><path d={`M${70+x} ${32+(i%3)} Q${70+x+(i%2?5:-4)} ${short?48:63} ${70+x+(i%3-1)*3} ${short?61+(i%3)*4:99+(i%3)*2}`} stroke={hair} strokeWidth={short?6.1:5.3} strokeLinecap="round" fill="none"/><path d={`M${70+x-1.1} 40 L${70+x+(i%2?1:-2)} ${short?57:85}`} stroke="#ffffff" strokeOpacity=".13" strokeWidth="1" fill="none"/></g>);
 const braids=(count:number,twist:boolean)=>Array.from({length:count},(_,i)=>{const x=count===6?43+i*10:39+i*8,stop=i===0||i===count-1?113:91;return <g key={i}><path d={`M${x} 39 Q${x+(i%2?2:-3)} 68 ${x+(i%3)-1} ${stop}`} fill="none" stroke={hair} strokeWidth="5.4" strokeLinecap="round"/>{Array.from({length:Math.floor((stop-46)/6)},(_,j)=><path key={j} d={`M${x-2.3+(j%2?1:0)} ${47+j*6} l${twist?4.2:5} ${twist?3:-.3}`} stroke="#e1bb93" strokeOpacity=".44" strokeWidth="1.2"/>)}</g>});
 return <svg className="avatar-svg" width={size} height={size} viewBox="0 0 140 140" role="img" aria-label={`Custom Onyapo avatar, ${a.hairStyle} hairstyle, ${a.expression} expression`}>
  <title>Onyapo customizable portrait</title>
  <defs>
   <clipPath id={`${prefix}-clip`}><circle cx="70" cy="70" r="69"/></clipPath>
   <linearGradient id={`${prefix}-face`} x1="0" y1="0" x2="1" y2=".15"><stop stopColor="#fff" stopOpacity=".12"/><stop offset=".65" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#3a1d12" stopOpacity=".14"/></linearGradient>
  </defs>
  <g clipPath={`url(#${prefix}-clip)`}>
   <circle cx="70" cy="70" r="69" fill="#dceee6"/><circle cx="119" cy="11" r="38" fill="#bfdde7" opacity=".68"/>
   <g transform={`translate(0 ${75*(1-fullHeight)}) scale(1 ${fullHeight})`}>
    <path d={`M${70-bodyHalf} 142 Q${70-bodyHalf-1} 119 55 114 L56 99 H84 V114 Q${70+bodyHalf+1} 119 ${70+bodyHalf} 142Z`} fill="#176b82"/>
    <path d="M56 110 L70 125 84 110" stroke="#8bd1bc" strokeWidth="3" fill="none"/>
    {long&&<path d="M43 52 Q34 21 69 17 Q105 19 97 56 L109 128 89 128 88 55 51 55 50 127 30 127Z" fill={hair}/>}
    <path d="M57 97 H83 V117 Q70 124 57 117Z" fill={skin}/>
    <path d={face} fill={foreheadColor}/><path d={face} fill={`url(#${prefix}-face)`}/>
    <ellipse cx="44" cy="71" rx="5.4" ry="8.5" fill={skin}/><ellipse cx="96" cy="71" rx="5.4" ry="8.5" fill={skin}/>
    <path d="M43 73 Q44 80 48 75 M97 73 Q96 80 92 75" stroke="#5c3b32" strokeOpacity=".32" strokeWidth="1.2" fill="none"/>
    {!bald&&<>
      {['rounded','short','pixie','bun','long','taper','high-top','curly-fringe'].includes(a.hairStyle)&&<>
       <path d={a.hairStyle==='high-top'?"M45 51 L43 20 Q48 10 92 14 L97 49 Q88 41 83 37 L54 39Z":a.hairStyle==='taper'?"M45 51 Q40 33 53 29 Q73 19 88 31 L95 48 Q78 37 66 39 Q50 37 45 51Z":"M44 51 Q35 19 69 18 Q106 21 96 53 Q87 39 72 40 Q55 36 44 51Z"} fill={hair}/>
       {a.hairStyle==='bun'&&<circle cx="91" cy="23" r="13" fill={hair}/>}
       {['rounded','high-top','curly-fringe'].includes(a.hairStyle)&&curls([47,54,62,70,78,86,92],a.hairStyle==='high-top'?[18,26]:[24,31],a.texture==='curly'?4.8:3.6)}
       {a.hairStyle==='taper'&&<path d="M45 43 Q50 32 62 30" stroke="#f2dfc4" strokeOpacity=".5" strokeWidth="1.8" fill="none"/>}
       {a.hairStyle==='curly-fringe'&&curls([50,58,66,74,82],[39,45],4.7)}
      </>}
      {a.hairStyle==='afro'&&<>{curls([40,48,56,64,72,80,88,96],[18,26,35],7.4)}</>}
      {['locs','short-locs','loc-bob'].includes(a.hairStyle)&&<>{locs(a.hairStyle==='short-locs')}{a.hairStyle==='loc-bob'&&<path d="M42 87 Q70 94 98 87" stroke={hair} strokeWidth="5" fill="none"/>}</>}
      {['braids','box-braids','twists'].includes(a.hairStyle)&&<>{braids(a.hairStyle==='box-braids'?8:6,a.hairStyle==='twists')}</>}
      {['cornrows','cornrows-side'].includes(a.hairStyle)&&<>
       <path d="M43 49 Q39 24 69 22 Q101 24 97 50 L90 43 Q69 40 50 47Z" fill={hair}/>
       {[-3,-2,-1,0,1,2,3].map((n)=><g key={n}>
        <path d={`M${70+n*6.9} 24 Q${70+n*(a.hairStyle==='cornrows-side'?5:6.3)} 33 ${70+n*(a.hairStyle==='cornrows-side'?3.5:4.4)} 45`} stroke="#dec5a4" strokeOpacity=".62" strokeWidth="1.1" fill="none"/>
        {[0,1,2,3].map(i=><path key={i} d={`M${69+n*(6.9-i*.8)} ${26+i*4} l3 2`} stroke="#000" strokeOpacity=".55" strokeWidth="1.45"/>) }
       </g>)}
       {a.hairStyle==='cornrows-side'&&<path d="M96 41 Q101 71 94 98" stroke={hair} strokeWidth="6" strokeLinecap="round" fill="none"/>}
      </>}
    </>}
    {brows.map((d,i)=><path key={i} d={d} stroke={hair} strokeWidth={a.eyebrowStyle==='bold'?3:2} strokeLinecap="round" fill="none"/>)}
    {eyes(57)}{eyes(83)}
    <path d="M69 67 Q66 76 69 79 Q72 81 74 78" stroke="#634034" strokeOpacity=".6" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    {a.facialHair!=='none'&&<>
     {['beard','short-beard','stubble'].includes(a.facialHair)&&<path d="M46 80 Q43 95 58 102 Q70 114 82 102 Q97 95 94 80 L90 87 Q81 99 70 100 Q59 99 50 87Z" fill={hair} fillOpacity={a.facialHair==='stubble'?.24:.9} stroke={hair} strokeOpacity=".35" strokeDasharray={a.facialHair==='stubble'?'1.2 2.5':'none'} strokeWidth={a.facialHair==='short-beard'?2:.6}/>}
     {a.facialHair==='goatee'&&<path d="M62 91 Q70 96 78 91 L76 103 Q70 108 64 103Z" fill={hair}/>}
     {['beard','short-beard','goatee','mustache'].includes(a.facialHair)&&<path d="M56 86 Q62 83 70 86 Q78 83 84 86 Q80 90 72 88 L70 88 Q61 90 56 86Z" fill={hair}/>}
     {a.facialHair==='stubble'&&Array.from({length:18},(_,i)=><circle key={i} cx={49+(i%9)*5.1} cy={91+Math.floor(i/9)*5} r=".65" fill={hair} opacity=".63"/>)}
    </>}
    {a.expression==='smile'&&<path d="M59 92 Q70 101 81 92" stroke="#7b3e3a" strokeWidth="2.4" fill="none" strokeLinecap="round"/>}
    {a.expression==='neutral'&&<path d="M61 96 L79 96" stroke="#7b3e3a" strokeWidth="2" strokeLinecap="round"/>}
    {a.expression==='calm'&&<path d="M61 94 Q70 97 79 94" stroke="#7b3e3a" strokeWidth="1.7" fill="none"/>}
    {a.expression==='focused'&&<path d="M62 96 Q70 94 78 96" stroke="#7b3e3a" strokeWidth="2" fill="none"/>}
    {a.expression==='excited'&&<><path d="M59 91 Q70 108 81 91Z" fill="#823d42"/><path d="M62 93 L78 93" stroke="#fbebe1" strokeWidth="2.8"/></>}
    {a.expression==='surprised'&&<ellipse cx="70" cy="95" rx="4.5" ry="6" fill="#823d42"/>}
    {a.earrings==='studs'&&<><circle cx="44" cy="79" r="2" fill="#d2a553"/><circle cx="96" cy="79" r="2" fill="#d2a553"/></>}
    {a.earrings==='hoops'&&<><ellipse cx="44" cy="83" rx="3.7" ry="6" fill="none" stroke="#d2a553" strokeWidth="2"/><ellipse cx="96" cy="83" rx="3.7" ry="6" fill="none" stroke="#d2a553" strokeWidth="2"/></>}
    {a.glasses==='round'&&<g stroke="#315363" strokeWidth="2.1" fill="#e9f7f7" fillOpacity=".15"><circle cx="57" cy="67" r="9"/><circle cx="83" cy="67" r="9"/><path d="M66 64 Q70 62 74 64 M48 66 L43 65 M92 66 L97 65" fill="none"/></g>}
    {a.glasses==='square'&&<g stroke="#315363" strokeWidth="2.1" fill="#e9f7f7" fillOpacity=".13"><rect x="47" y="60" width="20" height="14" rx="4"/><rect x="73" y="60" width="20" height="14" rx="4"/><path d="M67 64 L73 64 M47 64 L43 65 M93 64 L97 65" fill="none"/></g>}
    {a.glasses==='sunglasses'&&<g fill="#243b4b" opacity=".93"><rect x="47" y="61" width="20" height="13" rx="5"/><rect x="73" y="61" width="20" height="13" rx="5"/><path d="M67 64 L73 64" stroke="#243b4b" strokeWidth="3"/></g>}
    {a.hat==='cap'&&<><path d="M42 38 Q41 17 70 17 Q99 17 98 38 L95 47 Q70 40 45 47Z" fill="#176b86"/><path d="M44 44 Q73 37 107 48 Q88 53 64 51Z" fill="#104d69"/></>}
    {a.hat==='beanie'&&<><path d="M42 45 Q39 16 70 15 Q101 16 98 45Z" fill="#24748e"/><path d="M42 41 Q70 35 98 41 L98 48 Q70 43 42 48Z" fill="#145168"/></>}
    {a.hat==='bucket'&&<><path d="M47 24 Q70 14 93 24 L100 43 40 43Z" fill="#278f7f"/><path d="M37 42 Q70 35 103 42 Q99 50 70 50 Q41 50 37 42Z" fill="#16676c"/></>}
   </g>
  </g><circle cx="70" cy="70" r="69" fill="none" stroke="#8dbbac" strokeWidth="1.5"/>
 </svg>;
}
