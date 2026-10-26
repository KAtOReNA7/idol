'use client';

import {useState} from 'react';
import {Play} from 'lucide-react';

type PlayerProps = {
 workId:string;
 view:'mv'|'stage';
 url:string;
 videoId:string|null;
 embedUrl:string|null;
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
 const sessionKey=JSON.stringify([props.workId,props.view,props.url,props.videoId,props.embedUrl,props.posterSrc]);
 return <VideoSession key={sessionKey} {...props}/>;
}

function VideoSession({view,url,videoId,embedUrl,title,posterSrc,posterLabel,posterFit,posterSize,posterZoom=1}:PlayerProps){
 const [playing,setPlaying]=useState(false);
 const [coverFailed,setCoverFailed]=useState(false);
 const [coverRetried,setCoverRetried]=useState(false);
 // Removing this iframe on a session change releases its browsing context and audio.
 if(playing&&embedUrl)return <iframe src={embedUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>;
 return <>
  {videoId&&!coverFailed?<img src={posterSrc||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt={posterLabel?title+' · '+posterLabel:title+' 视频封面'} style={posterFit?{position:'absolute',inset:0,width:'100%',height:'100%',maxWidth:posterSize?.width??'100%',maxHeight:posterSize?.height??'100%',margin:posterSize?'auto':undefined,objectFit:posterFit,transform:posterZoom>1?`scale(${posterZoom})`:undefined,transformOrigin:'50% 50%'}:undefined} referrerPolicy="no-referrer" onError={()=>setCoverFailed(true)}/>:<div className="video-cover-fallback"><span>{title}</span><small>{coverRetried?'封面仍未加载，可直接播放视频':'封面暂时打不开'}</small></div>}
  {videoId&&coverFailed&&!coverRetried&&<button type="button" className="video-cover-retry" onClick={()=>{setCoverRetried(true);setCoverFailed(false);}}>重试封面</button>}
  <button className="video-play" onClick={()=>embedUrl?setPlaying(true):window.open(url,'_blank','noopener,noreferrer')}><Play fill="currentColor" size={25}/><span>{view==='stage'?'播放舞台视频':'播放视频'}</span></button>
 </>;
}
