'use client';

import {useEffect,useRef,useState} from 'react';
import {Play, RotateCcw} from 'lucide-react';
import type {PlaybackSource} from '../lib/idol/work-playback';

type PlayerProps = {
 workId:string;
 view:'mv'|'stage';
 platform?:'youtube'|'bilibili'|'x';
 sourceKey?:string|null;
 url:string;
 videoId:string|null;
 embedUrl:string|null;
 title:string;
 playbackCredit?:string;
 playbackLabel?:string;
 fallbackPlayers?:readonly PlaybackSource[];
 posterSrc?:string;
 posterLabel?:string;
 posterIsReference?:boolean;
 posterFit?:'contain'|'cover';
 posterZoom?:number;
 posterSize?:{width:number;height:number};
};

export function WorkVideoPlayer(props:PlayerProps){
 // Reset only the media session. The surrounding scoring editors stay mounted.
 // Include the full source URL and embed range, even when the video ID is reused.
 const sessionKey=JSON.stringify([props.workId,props.view,props.url,props.videoId,props.embedUrl,props.posterSrc,props.platform,props.sourceKey,props.fallbackPlayers?.map(source=>source.embedUrl)]);
 return <VideoSession key={sessionKey} {...props}/>;
}

function VideoSession({view,url,videoId,embedUrl,title,platform='youtube',sourceKey,playbackCredit,playbackLabel,fallbackPlayers=[],posterSrc,posterLabel,posterIsReference,posterFit,posterSize,posterZoom=1}:PlayerProps){
 const rangedStage=view==='stage'&&((sourceKey&&sourceKey!==videoId)||/[?&#](?:t|start|end|time_continue)=/.test(url+' '+(embedUrl??'')));
 const wholeVideo=platform==='youtube'&&videoId&&!rangedStage;
 const coverSrc=posterSrc||(wholeVideo?`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`:undefined);
 const playControl=useRef<HTMLButtonElement>(null);
 const frameRef=useRef<HTMLIFrameElement>(null);
 const focusOnStart=useRef(false);
 const [attempt,setAttempt]=useState(0);
 const sources=[{label:playbackLabel,credit:playbackCredit,embedUrl},...fallbackPlayers];
 const currentIndex=attempt>0?(attempt-1)%sources.length:0;
 const {embedUrl:currentEmbed,credit}=sources[currentIndex];
 const nextLabel=sources.length>1?sources[(currentIndex+1)%sources.length].label:undefined;
 const [coverFailed,setCoverFailed]=useState(false);
 const [coverRetried,setCoverRetried]=useState(false);
 useEffect(()=>{
  if(!attempt||!currentEmbed?.startsWith('https://rutube.ru/play/embed/'))return;
  const frame=frameRef.current;
  function onReady(event:MessageEvent){
   if(!frame?.contentWindow||event.origin!=='https://rutube.ru'||event.source!==frame.contentWindow)return;
   let message=event.data;
   if(typeof message==='string'){
    try{message=JSON.parse(message);}catch{return;}
   }
   if(message?.type!=='player:ready')return;
   window.removeEventListener('message',onReady);
   frame.contentWindow.postMessage(JSON.stringify({type:'player:play',data:{}}),event.origin);
  }
  window.addEventListener('message',onReady);
  return ()=>window.removeEventListener('message',onReady);
 },[attempt,currentEmbed]);
 // Cross-origin players may render an error page without an iframe error event.
 // An explicit click switches verified sources or retries the same embed.
 if(attempt>0&&currentEmbed)return <>
  <div className="video-stage">
   <iframe key={attempt} src={currentEmbed} title={title} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
    ref={frame=>{frameRef.current=frame;if(frame&&focusOnStart.current){focusOnStart.current=false;frame.focus({preventScroll:true});}}}/>
  </div>
  {credit&&<small className="video-source-credit">{credit}</small>}
  <button type="button" className="video-reload" onClick={()=>setAttempt(n=>n+1)}>
   <RotateCcw aria-hidden="true" size={16}/>{nextLabel?`切换到 ${nextLabel}`:'重新加载视频'}
  </button>
 </>;
 return <><div className="video-stage">
  {coverSrc&&!coverFailed?<img src={coverSrc} alt={posterLabel?title+' · '+posterLabel:title+' 视频封面'} style={posterFit?{position:'absolute',inset:0,width:'100%',height:'100%',maxWidth:posterSize?.width??'100%',maxHeight:posterSize?.height??'100%',margin:posterSize?'auto':undefined,objectFit:posterFit,transform:posterZoom>1?`scale(${posterZoom})`:undefined,transformOrigin:'50% 50%'}:undefined} referrerPolicy="no-referrer" onError={()=>setCoverFailed(true)}/>:<div className="video-cover-fallback"><span>{title}</span><small>{!coverSrc?(embedUrl?'可直接播放视频':'在原站观看此视频'):coverRetried?(embedUrl?'封面仍未加载，可直接播放视频':'封面仍未加载，可在原站观看'):'封面暂时打不开'}</small></div>}
  {coverSrc&&!coverFailed&&posterIsReference&&<small className="work-preview-label">{posterLabel}</small>}
  {coverSrc&&coverFailed&&!coverRetried&&<button type="button" className="video-cover-retry" onClick={event=>{if(event.currentTarget===event.currentTarget.ownerDocument.activeElement)playControl.current?.focus({preventScroll:true});setCoverRetried(true);setCoverFailed(false);}}>重试封面</button>}
  <button ref={playControl} type="button" className="video-play" onClick={()=>{
   if(!embedUrl){window.open(url,'_blank','noopener,noreferrer');return;}
   const play=playControl.current;
   focusOnStart.current=!!play&&play===play.ownerDocument?.activeElement;
   setAttempt(1);
  }}><Play fill="currentColor" size={25}/><span>{!embedUrl&&platform==='bilibili'?'在 B站观看（登录后选择最高画质）':!embedUrl&&platform==='x'?'在 X 观看':view==='stage'?'播放舞台视频':'播放视频'}{playbackLabel&&`（${playbackLabel}）`}</span></button>
 </div>{credit&&<small className="video-source-credit">{credit}</small>}</>;
}
