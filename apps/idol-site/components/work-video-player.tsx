'use client';

import {useEffect,useRef,useState} from 'react';
import {Play, RotateCcw} from 'lucide-react';

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
 const sessionKey=JSON.stringify([props.workId,props.view,props.url,props.videoId,props.embedUrl,props.posterSrc,props.platform,props.sourceKey]);
 return <VideoSession key={sessionKey} {...props}/>;
}

function VideoSession({view,url,videoId,embedUrl,title,platform='youtube',sourceKey,playbackCredit,playbackLabel,posterSrc,posterLabel,posterIsReference,posterFit,posterSize,posterZoom=1}:PlayerProps){
 const rangedStage=view==='stage'&&((sourceKey&&sourceKey!==videoId)||/[?&#](?:t|start|end|time_continue)=/.test(url+' '+(embedUrl??'')));
 const wholeVideo=platform==='youtube'&&videoId&&!rangedStage;
 const externalBili=platform==='bilibili'&&!embedUrl;
 const coverSrc=posterSrc||(wholeVideo?`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`:undefined);
 const playControl=useRef<HTMLButtonElement>(null);
 const frameRef=useRef<HTMLIFrameElement>(null);
 const focusOnStart=useRef(false);
 const [attempt,setAttempt]=useState(0);
 const [failedAttempt,setFailedAttempt]=useState<number|null>(null);
 const [waitingAttempt,setWaitingAttempt]=useState<number|null>(null);
 const [coverFailed,setCoverFailed]=useState(false);
 const [coverRetried,setCoverRetried]=useState(false);
 const failed=failedAttempt===attempt;
 useEffect(()=>{
  if(!attempt||failed||!embedUrl?.startsWith('https://rutube.ru/play/embed/'))return;
  const frame=frameRef.current;
  if(!frame)return;
  let awaitingStart=true,requestedPlay=false,previousTime=0;
  const timer=window.setTimeout(()=>{
   if(awaitingStart&&frameRef.current===frame)setWaitingAttempt(attempt);
  },8000);
  function onPlayerMessage(event:MessageEvent){
   if(!frame?.contentWindow||frameRef.current!==frame||event.origin!=='https://rutube.ru'||event.source!==frame.contentWindow)return;
   let message=event.data;
   if(typeof message==='string'){
    try{message=JSON.parse(message);}catch{return;}
   }
   if(message?.type==='player:error'){
    awaitingStart=false;
    window.clearTimeout(timer);
    setFailedAttempt(attempt);
    return;
   }
   if(!awaitingStart)return;
   // The player may announce a start or quality before its clock advances.
   if(message?.type==='player:changeState'&&(message.data?.state==='paused'||message.data?.state==='stopped'))previousTime=0;
   if(message?.type==='player:currentTime'){
    const time=message.data?.time;
    if(typeof time==='number'&&Number.isFinite(time)){
     if(previousTime>0&&time>previousTime){
      awaitingStart=false;
      window.clearTimeout(timer);
      setWaitingAttempt(null);
     }
     previousTime=time;
    }
    return;
   }
   if(message?.type==='player:ready'&&!requestedPlay){
    requestedPlay=true;
    frame.contentWindow.postMessage(JSON.stringify({type:'player:play',data:{}}),event.origin);
   }
  }
  window.addEventListener('message',onPlayerMessage);
  return ()=>{
   awaitingStart=false;
   window.clearTimeout(timer);
   window.removeEventListener('message',onPlayerMessage);
  };
 },[attempt,embedUrl,failed]);
 // Some providers render their own error document without firing an iframe error.
 // Retrying always reopens the exact selected edit and leaves the editors mounted.
 if(attempt>0&&embedUrl)return <>
  <div className="video-stage">
   {failed?<p className="video-cover-fallback" role="status">视频暂时无法播放。请稍后重试。</p>:
    <iframe key={attempt} src={embedUrl} title={title} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
     onError={event=>{if(event.currentTarget===frameRef.current)setFailedAttempt(attempt);}}
     ref={frame=>{frameRef.current=frame;if(frame&&focusOnStart.current){focusOnStart.current=false;frame.focus({preventScroll:true});}}}/>}
  </div>
  {!failed&&waitingAttempt===attempt&&<p className="video-start-notice" role="status">如果仍未出画，可以继续等待或重新加载视频。</p>}
  {playbackCredit&&<small className="video-source-credit">{playbackCredit}</small>}
  <button type="button" className="video-reload" onClick={()=>setAttempt(n=>n+1)}>
   <RotateCcw aria-hidden="true" size={16}/>重新加载视频
  </button>
 </>;
 return <><div className="video-stage">
  {coverSrc&&!coverFailed?<img src={coverSrc} alt={posterLabel?title+' · '+posterLabel:title+' 视频封面'} style={posterFit?{position:'absolute',inset:0,width:'100%',height:'100%',maxWidth:posterSize?.width??'100%',maxHeight:posterSize?.height??'100%',margin:posterSize?'auto':undefined,objectFit:posterFit,transform:posterZoom>1?`scale(${posterZoom})`:undefined,transformOrigin:'50% 50%'}:undefined} referrerPolicy="no-referrer" onError={()=>setCoverFailed(true)}/>:<div className="video-cover-fallback"><span>{title}</span>{!externalBili&&<small>{!coverSrc?(embedUrl?'可直接播放视频':'在原站观看此视频'):coverRetried?(embedUrl?'封面仍未加载，可直接播放视频':'封面仍未加载，可在原站观看'):'封面暂时打不开'}</small>}</div>}
  {coverSrc&&!coverFailed&&posterIsReference&&<small className="work-preview-label">{posterLabel}</small>}
  {coverSrc&&coverFailed&&!coverRetried&&<button type="button" className="video-cover-retry" onClick={event=>{if(event.currentTarget===event.currentTarget.ownerDocument.activeElement)playControl.current?.focus({preventScroll:true});setCoverRetried(true);setCoverFailed(false);}}>重试封面</button>}
  {externalBili?<span className="video-unavailable">此舞台暂无站内高清片源</span>:<button ref={playControl} type="button" className="video-play" onClick={()=>{
   if(!embedUrl){window.open(url,'_blank','noopener,noreferrer');return;}
   const play=playControl.current;
   focusOnStart.current=!!play&&play===play.ownerDocument?.activeElement;
   setAttempt(1);
  }}><Play fill="currentColor" size={25}/><span>{!embedUrl&&platform==='x'?'在 X 观看':view==='stage'?'播放舞台视频':'播放视频'}{playbackLabel&&`（${playbackLabel}）`}</span></button>}
 </div>{playbackCredit&&<small className="video-source-credit">{playbackCredit}</small>}</>;
}
