'use client';

import {useRef,useState} from 'react';
import {ArrowUpRight, Play, RotateCcw} from 'lucide-react';
import type {workPlaybackMirror} from '@/lib/idol/stage-source';

type PlayerProps = {
 workId:string;
 view:'mv'|'stage';
 platform?:'youtube'|'bilibili'|'x';
 sourceKey?:string|null;
 url:string;
 videoId:string|null;
 embedUrl:string|null;
 mirror?:ReturnType<typeof workPlaybackMirror>;
 title:string;
 posterSrc?:string;
 posterLabel?:string;
 posterFit?:'contain'|'cover';
 posterZoom?:number;
 posterSize?:{width:number;height:number};
};

export function WorkVideoPlayer(props:PlayerProps){
 // Reset only the media session. The surrounding scoring editors stay mounted.
 // Include the full source URL and embed range, even when the video ID is reused.
 const sessionKey=JSON.stringify([props.workId,props.view,props.url,props.videoId,props.embedUrl,props.posterSrc,props.platform,props.sourceKey,props.mirror?.embedUrl]);
 return <VideoSession key={sessionKey} {...props}/>;
}

function VideoSession({view,url,videoId,embedUrl,mirror,title,platform='youtube',posterSrc,posterLabel,posterFit,posterSize,posterZoom=1}:PlayerProps){
 const coverSrc=posterSrc||(platform==='youtube'&&videoId?`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`:undefined);
 const playControl=useRef<HTMLButtonElement>(null);
 const focusOnStart=useRef(false);
 const [attempt,setAttempt]=useState(0);
 const [provider,setProvider]=useState<'original'|'mirror'>(mirror?'mirror':'original');
 const [coverFailed,setCoverFailed]=useState(false);
 const [coverRetried,setCoverRetried]=useState(false);
 const playerUrl=provider==='mirror'&&mirror?mirror.embedUrl:embedUrl;
 const playing=attempt>0&&!!playerUrl;
 function playFrom(next:'original'|'mirror'){
  if(playing&&next===provider)return;
  setProvider(next);
  setAttempt(n=>n+1);
 }
 // Cross-origin players may render an error page without an iframe error event.
 return <>
  {playing?<div className="video-stage">
   <iframe key={attempt} src={playerUrl!} title={mirror?title+(provider==='mirror'?' · B站同版转载':' · YouTube 官方原片'):title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
    ref={frame=>{if(frame&&focusOnStart.current){focusOnStart.current=false;frame.focus({preventScroll:true});}}}/>
  </div>:<div className="video-stage">
  {coverSrc&&!coverFailed?<img src={coverSrc} alt={posterLabel?title+' · '+posterLabel:title+' 视频封面'} style={posterFit?{position:'absolute',inset:0,width:'100%',height:'100%',maxWidth:posterSize?.width??'100%',maxHeight:posterSize?.height??'100%',margin:posterSize?'auto':undefined,objectFit:posterFit,transform:posterZoom>1?`scale(${posterZoom})`:undefined,transformOrigin:'50% 50%'}:undefined} referrerPolicy="no-referrer" onError={()=>setCoverFailed(true)}/>:<div className="video-cover-fallback"><span>{title}</span><small>{!coverSrc?'在原站观看此视频':coverRetried?(embedUrl?'封面仍未加载，可直接播放视频':'封面仍未加载，可在原站观看'):'封面暂时打不开'}</small></div>}
  {coverSrc&&coverFailed&&!coverRetried&&<button type="button" className="video-cover-retry" onClick={event=>{if(event.currentTarget===event.currentTarget.ownerDocument.activeElement)playControl.current?.focus({preventScroll:true});setCoverRetried(true);setCoverFailed(false);}}>重试封面</button>}
  <button ref={playControl} type="button" className="video-play" onClick={()=>{
   if(!playerUrl){window.open(url,'_blank','noopener,noreferrer');return;}
   const play=playControl.current;
   focusOnStart.current=!!play&&play===play.ownerDocument?.activeElement;
   setAttempt(1);
  }}><Play fill="currentColor" size={25}/><span>{mirror?'播放视频 · B站':platform==='bilibili'?'在 B站观看':platform==='x'?'在 X 观看':view==='stage'?'播放舞台视频':'播放视频'}</span></button>
 </div>}
 {mirror&&<div className="video-sources" role="group" aria-label="播放来源">
  <span>播放来源</span>
  <button type="button" aria-pressed={provider==='mirror'} onClick={()=>playFrom('mirror')}>B站 · 同版转载</button>
  <button type="button" aria-pressed={provider==='original'} onClick={()=>playFrom('original')}>YouTube · 官方原片</button>
  <a href={mirror.watchUrl} target="_blank" rel="noopener noreferrer">在 B站打开<ArrowUpRight size={14} aria-hidden="true"/></a>
 </div>}
 {playing&&<button type="button" className="video-reload" onClick={()=>setAttempt(n=>n+1)}>
  <RotateCcw aria-hidden="true" size={16}/>重新加载视频
 </button>}
 </>;
}
