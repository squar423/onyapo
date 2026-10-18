import {Play,VideoOff} from 'lucide-react';
import {videos} from '../lib/catalog';
export function MovementVideo({id,name,compact=false}:{id:string;name:string;compact?:boolean}){
 const v=videos[id];
 if(!v)return <div className={`video-placeholder ${compact?'compact':''}`}><span className="play-halo"><VideoOff size={21}/></span><div><strong>Demonstration coming soon</strong><small>Video slot ready for {name}</small></div></div>;
 const youtube=/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(v.src);
 return <div className="video-player">{youtube?<iframe title={`${name} demonstration`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen src={`https://www.youtube-nocookie.com/embed/${youtube[1]}`}/>:<video controls playsInline preload="none" poster={v.poster} aria-label={`${name} demonstration`} src={import.meta.env.BASE_URL==='/'?v.src:import.meta.env.BASE_URL.replace(/\/$/,'')+v.src}><track kind="captions" /></video>}{v.caption&&<small>{v.caption}</small>}</div>;
}
