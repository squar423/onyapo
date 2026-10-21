import type React from 'react';

type Region = {name:string;front?:string;back?:string};
/** Original, intentionally simplified anatomical-position figure, not a diagnostic muscle map. */
const regions:Region[] = [
 {name:'Neck',front:'M117 67 L143 67 149 89 131 101 112 89Z',back:'M117 67 L143 67 153 94 130 110 107 94Z'},
 {name:'Chest / shoulder',front:'M82 103 Q97 89 124 105 L129 142 Q110 156 84 139 Z M136 105 Q163 89 178 103 L176 139 Q151 156 131 142Z M81 101 Q66 105 65 128 L76 151 Q91 133 94 105Z M179 101 Q194 105 195 128 L184 151 Q169 133 166 105Z',back:'M81 98 Q65 106 66 130 L79 154 Q93 133 96 101Z M179 98 Q195 106 194 130 L181 154 Q167 133 164 101Z'},
 {name:'Back',back:'M104 88 Q120 103 129 110 Q140 103 156 88 L173 104 173 151 154 171 149 221 131 241 111 221 106 171 87 151 87 104 Z'},
 {name:'Arms',front:'M64 131 L77 150 68 188 58 226 44 224 50 178Z M196 131 L183 150 192 188 202 226 216 224 210 178Z',back:'M64 131 L77 150 68 188 58 226 44 224 50 178Z M196 131 L183 150 192 188 202 226 216 224 210 178Z'},
 {name:'Hands / wrists',front:'M42 230 L57 234 50 271 46 280 41 263 37 273 34 251 29 242 33 235Z M218 230 L203 234 210 271 214 280 219 263 223 273 226 251 231 242 227 235Z',back:'M42 230 L57 234 50 271 46 280 41 263 37 273 34 251 29 242 33 235Z M218 230 L203 234 210 271 214 280 219 263 223 273 226 251 231 242 227 235Z'},
 {name:'Core',front:'M90 157 Q110 168 130 159 Q150 168 170 157 L169 216 147 240 130 225 113 240 91 216Z'},
 {name:'Hips / glutes',front:'M92 224 L117 243 130 231 143 243 168 224 175 274 149 295 133 278 127 278 111 295 85 274Z',back:'M90 219 Q111 239 130 228 Q149 239 170 219 L176 274 153 294 130 278 107 294 84 274Z'},
 {name:'Thigh / knee',front:'M88 280 L126 298 123 373 111 402 91 392 84 343Z M134 298 L172 280 176 343 169 392 149 402 137 373Z',back:'M88 280 L126 298 123 373 111 402 91 392 84 343Z M134 298 L172 280 176 343 169 392 149 402 137 373Z'},
 {name:'Calves / ankles',front:'M91 401 L112 409 119 475 116 495 91 495 87 470Z M148 409 L169 401 173 470 169 495 144 495 141 475Z',back:'M91 401 L112 409 119 475 116 495 91 495 87 470Z M148 409 L169 401 173 470 169 495 144 495 141 475Z'}
];
function AnatomyDetails({back}:{back:boolean}){
 return <g fill="none" stroke="#456b6c" strokeOpacity=".42" strokeWidth="1.1" strokeLinecap="round" pointerEvents="none">
  {back?<>
   <path d="M130 93 V242 M88 118 Q109 127 126 142 M172 118 Q150 127 134 142 M94 153 Q109 169 122 182 M166 153 Q151 169 138 182 M100 196 L127 221 M160 196 L133 221 M103 250 Q115 260 127 271 M157 250 Q145 260 133 271"/>
   <path d="M99 302 Q108 339 112 378 M161 302 Q152 339 148 378 M97 414 Q106 443 102 472 M163 414 Q154 443 158 472"/>
  </>:<>
   <path d="M130 116 V227 M103 164 Q115 172 127 171 M133 171 Q146 172 157 164 M104 188 H123 M137 188 H156 M104 206 H122 M138 206 H156 M112 225 L130 234 148 225"/>
   <path d="M102 289 Q112 326 109 374 M158 289 Q148 326 151 374 M97 414 L103 474 M163 414 L157 474"/>
  </>}
  <path d="M62 157 L49 212 M198 157 L211 212 M94 398 L113 402 M147 402 L166 398"/>
 </g>
}
export function AnatomicalBody({back,selected,onSelect,count}:{back:boolean;selected:string;onSelect:(region:string)=>void;count:Record<string,number>}){
 return <div className="figure-wrap anatomical-figure"><div className="figure-label">{back?'POSTERIOR VIEW':'ANTERIOR VIEW'}</div>
  <svg viewBox="0 0 260 535" role="img" aria-label={`${back?'Posterior':'Anterior'} anatomical-position human body with interactive regions`}>
   <defs><linearGradient id={back?'bodyBack':'bodyFront'} x1="0" x2="1"><stop stopColor="#e2efe8"/><stop offset=".52" stopColor="#f0f4ed"/><stop offset="1" stopColor="#cce6df"/></linearGradient></defs>
   <ellipse cx="130" cy="38" rx="22" ry="29" fill="#e7eee8" stroke="#759c94" strokeWidth="1.7"/>
   <path d="M116 66 L144 66 L149 83 Q176 85 190 104 Q200 116 206 145 L224 225 Q233 243 219 248 L206 244 184 178 177 152 176 235 Q185 268 174 292 L172 365 169 466 Q169 479 178 494 L178 502 147 502 Q137 488 139 467 L132 376 130 304 128 376 121 467 Q123 488 113 502 L82 502 82 494 Q91 479 91 466 L88 365 86 292 Q75 268 84 235 L83 152 76 178 54 244 41 248 Q27 243 36 225 L54 145 Q60 116 70 104 Q84 85 111 83Z" fill={`url(#${back?'bodyBack':'bodyFront'})`} stroke="#759c94" strokeWidth="1.6" strokeLinejoin="round"/>
   {regions.map(r=>{
    const path=back?r.back:r.front;
    if(!path)return null;
    const n=count[r.name]||0,active=selected===r.name;
    const color=active?'#138c86':n>7?'#328db2':n>3?'#76bfb0':n>0?'#a4d8c8':'#dce8e0';
    return <path key={r.name} d={path} fill={color} fillOpacity=".93" stroke={active?'#125e6d':'#f8fcfa'} strokeWidth={active?2.2:1.2}
     className="body-region" role="button" tabIndex={0}
     aria-label={`${r.name}: ${n} logged exercise appearances`} onClick={()=>onSelect(r.name)} onMouseEnter={()=>onSelect(r.name)} onFocus={()=>onSelect(r.name)}
     onKeyDown={(e:React.KeyboardEvent<SVGPathElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(r.name)}}}>
     <title>{r.name}: {n} completed exercise appearances</title>
    </path>;
   })}
   <AnatomyDetails back={back}/>
   {/* Simple head and anatomical landmarks. Intentionally no cartoon facial features. */}
   <path d="M115 61 Q130 71 145 61 M111 18 Q130 8 149 18 M119 70 L119 82 M141 70 L141 82" stroke="#759c94" strokeWidth="1" fill="none" opacity=".65"/>
   <path d="M90 498 Q101 506 115 502 M145 502 Q159 506 170 498" stroke="#759c94" strokeWidth="1.4" fill="none"/>
  </svg></div>;
}
