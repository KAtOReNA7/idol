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
};

export function WorkVideoPlayer(props:PlayerProps){
 // Reset only the media session. The surrounding scoring editors stay mounted.
 // Include the full source URL and embed range, even when the video ID is reused.
 const sessionKey=JSON.stringify([props.workId,props.view,props.url,props.videoId,props.embedUrl]);
 return <VideoSession key={sessionKey} {...props}/>;
}

function VideoSession({view,url,videoId,embedUrl,title}:PlayerProps){
 const [playing,setPlaying]=useState(false);
 const [coverFailed,setCoverFailed]=useState(false);
 // Removing this iframe on a session change releases its browsing context and audio.
 if(playing&&embedUrl)return <iframe src={embedUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>;
 return <>
  {videoId&&!coverFailed?<img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt={title+' 视频封面'} referrerPolicy="no-referrer" onError={()=>setCoverFailed(true)}/>:<div className="video-cover-fallback"><span>{title}</span><small>封面暂时打不开</small></div>}
  <button className="video-play" onClick={()=>embedUrl?setPlaying(true):window.open(url,'_blank','noopener,noreferrer')}><Play fill="currentColor" size={25}/><span>{view==='stage'?'播放舞台视频':'播放视频'}</span></button>
 </>;
}
