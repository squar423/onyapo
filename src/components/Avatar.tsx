import {useId} from 'react';
import type {AvatarConfig} from '../lib/types';
import {normalizeAvatar} from '../lib/avatar';

/**
 * Onyapo's original flat cartoon avatar. No external image assets, fonts, or image API.
 * All existing avatar profile values remain compatible with this renderer.
 * Hair shapes are stylized, not claims about ethnicity or individual appearance.
 */
export function Avatar({config,size=56}:{config?:Partial<AvatarConfig>|null;size?:number}){
  const a=normalizeAvatar(config);
  const prefix=useId().replace(/:/g,'');
  const skin=a.skin;
  const hair=a.hairColor;
  const noHair=['bald','none'].includes(a.hairStyle);
  const longHair=['long','locs','loc-bob','braids','box-braids','cornrows-side'].includes(a.hairStyle);
  const face={
    oval:'M49 69 Q49 49 80 48 Q111 49 111 69 L110 94 Q108 118 80 127 Q52 118 50 94Z',
    round:'M47 72 Q47 49 80 49 Q113 49 113 72 L111 98 Q104 123 80 125 Q56 123 49 98Z',
    square:'M49 64 Q49 49 80 49 Q111 49 111 64 L110 109 Q101 124 80 126 Q59 124 50 109Z',
    heart:'M47 72 Q47 47 80 49 Q113 47 113 72 Q110 111 80 128 Q50 111 47 72Z'
  }[a.faceShape] || 'M49 69 Q49 49 80 48 Q111 49 111 69 L110 94 Q108 118 80 127 Q52 118 50 94Z';
  const isCurly=a.texture==='curly';
  const eyebrow=(x:number)=>{
    const y=a.expression==='focused'?77:75;
    if(a.eyebrowStyle==='straight')return <path d={`M${x-8} ${y} L${x+8} ${y}`} />;
    if(a.eyebrowStyle==='arched')return <path d={`M${x-8} ${y+2} Q${x} ${y-6} ${x+8} ${y+2}`} />;
    return <path d={`M${x-8} ${y+1} Q${x} ${y-3} ${x+8} ${y+1}`} />;
  };
  const eye=(x:number)=>{
    if(a.eyeStyle==='happy') return <path key={x} d={`M${x-7} 88 Q${x} 79 ${x+7} 88`} stroke="#27353b" strokeWidth="2.8" fill="none" strokeLinecap="round"/>;
    if(a.eyeStyle==='wink'&&x===66)return <path key={x} d="M59 87 Q66 89 73 87" stroke="#27353b" strokeWidth="2.8" fill="none" strokeLinecap="round"/>;
    const rx=a.eyeStyle==='wide'?6:a.eyeStyle==='sleepy'?6.5:a.eyeStyle==='round'?5.6:6;
    const ry=a.eyeStyle==='wide'?6.5:a.eyeStyle==='sleepy'?3.6:5;
    return <g key={x}><ellipse cx={x} cy="87" rx={rx} ry={ry} fill="#fff" stroke="#2c3941" strokeWidth="1.6"/><circle cx={x} cy="87" r={a.eyeStyle==='sleepy'?2.2:3.1} fill={a.eyeColor}/><circle cx={x+0.9} cy="85.8" r="1" fill="#fff"/></g>;
  };
  const strand=(x:number,short=false,index=0)=>{
    const y2=short?(index%2?73:66):(index%2?144:132);
    const drift=x<80?-3:3;
    return <path key={`${x}-${index}`} d={`M${x} 45 Q${x+drift*2} ${short?57:92} ${x+drift} ${y2}`} stroke={hair} strokeWidth={short?8.2:8.8} strokeLinecap="round" fill="none"/>;
  };
  const braid=(x:number,i:number,big=false)=>{
    const y2=big?148:119;
    return <g key={`${x}-${i}`}><path d={`M${x} 53 Q${x+(x<80?-4:4)} 81 ${x} ${y2}`} fill="none" stroke={hair} strokeWidth="7" strokeLinecap="round"/>
      {Array.from({length:big?8:5},(_,j)=><path key={j} d={`M${x-3} ${70+j*9} l6 4`} stroke="#fff" strokeWidth="1.2" strokeOpacity=".16" strokeLinecap="round"/>)}
    </g>;
  };
  const topHair=()=>{
    switch(a.hairStyle){
      case 'bald':case 'none': return null;
      case 'afro':return <g fill={hair}><path d="M37 68 Q28 55 34 45 Q29 28 47 25 Q55 10 70 19 Q86 9 99 22 Q117 20 120 41 Q131 51 121 67 L113 71 Q113 50 103 48 Q79 37 56 48 Q47 53 47 72Z"/><circle cx="41" cy="45" r="10"/><circle cx="56" cy="26" r="12"/><circle cx="79" cy="21" r="13"/><circle cx="101" cy="29" r="12"/><circle cx="117" cy="51" r="10"/></g>;
      case 'high-top':return <path d="M48 64 L46 20 Q61 13 80 14 Q99 13 114 20 L112 66 Q102 48 80 49 Q58 48 48 64Z" fill={hair}/>;
      case 'taper':return <g fill={hair}><path d="M51 69 Q43 58 49 46 Q53 28 80 28 Q108 28 111 46 L109 67 Q105 58 103 55 Q79 43 56 55Z"/><path d="M49 62 Q48 75 53 78 L56 58Z M111 62 Q112 75 107 78 L104 58Z" opacity=".45"/></g>;
      case 'cornrows':case 'cornrows-side':return <g><path d="M45 72 Q39 31 78 26 Q118 30 115 73 L107 66 Q103 47 80 47 Q56 47 53 66Z" fill={hair}/>{[-2,-1,0,1,2].map(i=><path key={i} d={`M${80+i*8} 28 Q${80+i*12} 44 ${80+i*13} ${i===0?49:55}`} stroke={skin} strokeWidth="2.4" fill="none" strokeLinecap="round"/>)}<path d="M48 57 Q56 50 65 50 M95 50 Q104 50 112 57" fill="none" stroke={hair} strokeWidth="5" strokeLinecap="round"/></g>;
      case 'short-locs':return <g><path d="M47 69 Q41 31 79 28 Q119 31 113 69 Q103 49 80 48 Q56 49 47 69Z" fill={hair}/>{[50,61,72,84,96,107].map((x,i)=><path key={x} d={`M${x} ${i%2?49:44} q${i%2?4:-4} 10 ${i%2?1:-1} ${i%3===0?28:21}`} stroke={hair} strokeWidth="8.5" strokeLinecap="round" fill="none"/>)}</g>;
      case 'locs':case 'loc-bob':return <g><path d="M45 71 Q41 29 80 25 Q119 29 115 71 Q104 49 80 48 Q56 49 45 71Z" fill={hair}/>{[44,52,108,116].map((x,i)=>strand(x,a.hairStyle==='loc-bob',i))}</g>;
      case 'box-braids':case 'braids':return <g><path d="M44 70 Q42 28 80 26 Q118 28 116 70 Q100 49 80 48 Q58 49 44 70Z" fill={hair}/>{[44,52,108,116].map((x,i)=>braid(x,i,a.hairStyle==='box-braids'))}</g>;
      case 'twists':return <g><path d="M47 65 Q40 28 80 28 Q120 28 113 65 Q94 45 80 45 Q58 45 47 65Z" fill={hair}/>{[50,60,71,82,94,106].map((x,i)=><path key={x} d={`M${x} 47 q${i%2?6:-6} 8 ${i%2?-1:2} 19`} stroke={hair} strokeWidth="8" strokeLinecap="round" fill="none"/>)}</g>;
      case 'curly-fringe':return <g fill={hair}><path d="M46 66 Q40 27 77 26 Q116 25 114 64 Q100 51 80 50 Q57 51 46 66Z"/>{[52,66,79,92,105].map((x,i)=><circle key={x} cx={x} cy={i%2?50:56} r={isCurly?9:7}/>)}</g>;
      case 'long':return <g fill={hair}><path d="M45 70 Q38 27 80 27 Q122 27 115 70 Q107 53 96 49 Q80 48 63 48 Q52 53 45 70Z"/><path d="M46 58 Q36 93 40 135 L54 135 L54 61Z M114 58 Q125 94 120 135 L106 135 L106 61Z"/></g>;
      case 'bun':return <g fill={hair}><circle cx="106" cy="38" r="17"/><path d="M47 66 Q42 27 80 28 Q114 28 114 65 Q94 48 80 47 Q57 48 47 66Z"/></g>;
      case 'pixie':return <path d="M46 68 Q41 34 72 29 Q105 23 114 53 Q104 49 101 45 Q83 61 57 55Z" fill={hair}/>;
      case 'short':return <path d="M46 68 Q40 37 66 31 Q96 22 113 45 L113 64 Q92 45 74 50 Q57 50 46 68Z" fill={hair}/>;
      default:return <path d="M46 67 Q39 26 80 27 Q120 27 114 67 Q104 50 80 49 Q56 50 46 67Z" fill={hair}/>;
    }
  };

  return <svg className="avatar-svg" width={size} height={size} viewBox="0 0 160 160" role="img" aria-label={`Onyapo cartoon avatar with ${a.hairStyle} hair and a ${a.expression} expression`}>
    <title>Onyapo customizable cartoon avatar</title>
    <defs><clipPath id={`${prefix}-clip`}><circle cx="80" cy="80" r="78"/></clipPath></defs>
    <g clipPath={`url(#${prefix}-clip)`}>
      <circle cx="80" cy="80" r="79" fill="#e8f6f3"/>
      <circle cx="134" cy="20" r="36" fill="#cceaf3" opacity=".85"/>
      <path d="M0 146 Q35 126 80 138 Q125 126 160 146 V165 H0Z" fill="#b8e5dc"/>
      <g transform={`translate(80 136) scale(${.92+a.width/600} ${.90+a.height/750}) translate(-80 -136)`}>
        <path d="M31 163 Q30 140 49 134 L67 128 H93 L111 134 Q130 140 129 163Z" fill="#217b8b"/>
        <path d="M65 117 H95 V138 Q80 145 65 138Z" fill={skin}/>
        {longHair&&<path d="M47 59 Q35 23 79 23 Q120 23 113 60 L123 146 H104 L103 65 H57 L56 146 H36Z" fill={hair}/>}
        <ellipse cx="49" cy="90" rx="7" ry="12" fill={skin}/><ellipse cx="111" cy="90" rx="7" ry="12" fill={skin}/>
        <path d={face} fill={skin} stroke="#3d3a3d" strokeOpacity=".14" strokeWidth="1.5"/>
        {!noHair&&topHair()}
        <g stroke={hair} strokeWidth={a.eyebrowStyle==='bold'?3.6:2.7} fill="none" strokeLinecap="round">{eyebrow(66)}{eyebrow(94)}</g>
        {eye(66)}{eye(94)}
        <path d="M80 89 q-3 10 2 11" stroke="#784e42" strokeWidth="1.8" opacity=".65" fill="none" strokeLinecap="round"/>
        {a.facialHair!=='none'&&<g fill={hair} stroke={hair} strokeLinecap="round">
          {['beard','short-beard'].includes(a.facialHair)&&<path d={a.facialHair==='beard'?"M51 106 Q54 127 80 133 Q106 127 109 106 Q101 117 80 121 Q59 117 51 106Z":"M54 110 Q57 124 80 127 Q103 124 106 110 Q99 120 80 122 Q61 120 54 110Z"} stroke="none"/>}
          {a.facialHair==='stubble'&&<path d="M54 109 Q60 124 80 126 Q100 124 106 109" fill="none" strokeWidth="5" strokeOpacity=".23" strokeDasharray="1.4 4"/>}
          {a.facialHair==='goatee'&&<path d="M72 116 Q80 121 88 116 L85 126 Q80 129 75 126Z" stroke="none"/>}
          {['beard','short-beard','mustache','goatee'].includes(a.facialHair)&&<path d="M68 108 Q74 104 80 108 Q86 104 92 108 Q83 113 80 110 Q76 113 68 108Z" stroke="none"/>}
        </g>}
        {a.expression==='smile'&&<path d="M69 112 Q80 122 91 112" stroke="#853e44" strokeWidth="2.8" fill="none" strokeLinecap="round"/>}
        {a.expression==='calm'&&<path d="M71 115 Q80 118 89 115" stroke="#853e44" strokeWidth="2.4" fill="none" strokeLinecap="round"/>}
        {a.expression==='neutral'&&<path d="M73 116 H87" stroke="#853e44" strokeWidth="2.4" strokeLinecap="round"/>}
        {a.expression==='focused'&&<path d="M72 116 Q80 113 88 116" stroke="#853e44" strokeWidth="2.4" fill="none" strokeLinecap="round"/>}
        {a.expression==='excited'&&<path d="M69 110 Q80 130 91 110Z" fill="#913d4f" stroke="#913d4f" strokeWidth="1.5"/>}
        {a.expression==='surprised'&&<ellipse cx="80" cy="114" rx="5" ry="7" fill="#913d4f"/>}
        {a.earrings==='studs'&&<><circle cx="48" cy="100" r="2.5" fill="#f3cf77"/><circle cx="112" cy="100" r="2.5" fill="#f3cf77"/></>}
        {a.earrings==='hoops'&&<><circle cx="48" cy="104" r="5" fill="none" stroke="#e3b65f" strokeWidth="2"/><circle cx="112" cy="104" r="5" fill="none" stroke="#e3b65f" strokeWidth="2"/></>}
        {a.glasses==='round'&&<g stroke="#244f58" strokeWidth="2.8" fill="none"><circle cx="66" cy="88" r="11"/><circle cx="94" cy="88" r="11"/><path d="M77 87 Q80 85 83 87 M55 86 L48 85 M105 86 L112 85"/></g>}
        {a.glasses==='square'&&<g stroke="#244f58" strokeWidth="2.8" fill="none"><rect x="54" y="78" width="24" height="18" rx="5"/><rect x="82" y="78" width="24" height="18" rx="5"/><path d="M78 84 H82 M54 84 L49 83 M106 84 L111 83"/></g>}
        {a.glasses==='sunglasses'&&<g fill="#263b4a"><rect x="54" y="79" width="24" height="17" rx="6"/><rect x="82" y="79" width="24" height="17" rx="6"/><path d="M78 84 H82" stroke="#263b4a" strokeWidth="4"/></g>}
        {a.hat==='cap'&&<><path d="M44 52 Q43 18 80 18 Q117 18 116 52Z" fill="#247c90"/><path d="M48 51 Q84 43 127 56 Q99 63 59 57Z" fill="#185b75"/></>}
        {a.hat==='beanie'&&<><path d="M43 54 Q40 16 80 16 Q120 16 117 54Z" fill="#386d82"/><path d="M43 49 Q80 43 117 49 L117 58 Q80 53 43 58Z" fill="#24576d"/></>}
        {a.hat==='bucket'&&<><path d="M51 28 Q80 19 109 28 L116 53 H44Z" fill="#3f987d"/><path d="M34 52 Q80 43 126 52 Q121 62 80 62 Q39 62 34 52Z" fill="#2f806e"/></>}
      </g>
    </g>
    <circle cx="80" cy="80" r="78" fill="none" stroke="#9ec9bf" strokeWidth="1.6"/>
  </svg>;
}
