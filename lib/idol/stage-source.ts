import type {StageVideo} from './types';
export function stageSourceKey(stage:StageVideo|null|undefined):string|null{
 if(stage&&'scorePolicy' in stage&&stage.scorePolicy==='view_only')return null;
 if(stage&&((stage.sourceClass!==undefined&&stage.sourceClass!=='official')||(stage.platform!==undefined&&stage.platform!=='youtube')||(stage.completeness!==undefined&&stage.completeness!=='full')))return null;
 if(!stage||!/^[A-Za-z0-9_-]{11}$/.test(stage.videoId))return null;
 if(!stage.clip)return stage.videoId;
 const {startSeconds:start,endSeconds:end,sourceDurationSeconds:total}=stage.clip;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<=start||!Number.isSafeInteger(total)||total<=0||total>86400||end>total)return null;
 return `${stage.videoId}@${start}-${end}`;
}
export function stageHasValidBinding(stage:StageVideo|null|undefined):boolean{
 const key=stageSourceKey(stage),b=stage?.scoreBinding;
 return !!key&&!!b&&b.videoId===stage?.videoId&&b.initialScore===null&&!!b.initializedAt&&Number.isFinite(Date.parse(b.initializedAt))&&(stage?.clip?b.sourceKey===key:!b.sourceKey||b.sourceKey===key);
}
export function formatStageTime(seconds:number){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
// Official caption preferences, not a forced translation API. Missing tracks remain missing.
export function youtubeEmbedUrl(videoId:string){if(!/^[A-Za-z0-9_-]{11}$/.test(videoId))return null;const url=new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);url.searchParams.set('autoplay','1');url.searchParams.set('cc_load_policy','1');url.searchParams.set('cc_lang_pref','zh-Hans');url.searchParams.set('hl','zh-CN');return url.href;}
export function stageEmbedUrl(stage:StageVideo){if(!stageSourceKey(stage))return null;const url=new URL(youtubeEmbedUrl(stage.videoId)!);if(stage.clip){url.searchParams.set('start',String(stage.clip.startSeconds));url.searchParams.set('end',String(stage.clip.endSeconds));}return url.href;}

export function stageWatchUrl(stage:StageVideo){if(!stageSourceKey(stage))return "";const url=new URL(stage.url);if(stage.clip)url.searchParams.set("t",String(stage.clip.startSeconds));return url.href;}
