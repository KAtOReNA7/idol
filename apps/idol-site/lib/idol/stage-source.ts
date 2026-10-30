import type {StageAlternative,StageVideo} from './types';

/** Only explicit, scoped evidence can expose a partial/other-version new source. */
export function validSameSongFallback(stage:Pick<StageVideo,'sameSongFallback'|'completeness'>,requireEvidence=false):boolean{
 const f=stage.sameSongFallback;
 if('versionMatch' in stage&&(stage.versionMatch===true||stage.versionMatch==='exact'))return false;
 if(!f||typeof f!=='object'||f.sameSong!==true||!/^rec[A-Za-z0-9]+$/.test(f.targetWorkId)||!/^rec[A-Za-z0-9]+$/.test(f.groupId))return false;
 if(f.sourceWorkId!==undefined&&(!/^rec[A-Za-z0-9]+$/.test(f.sourceWorkId)||f.sourceWorkId===f.targetWorkId))return false;
 if(!['full','excerpt'].includes(f.completeness)||f.completeness!==stage.completeness||!['exact','different'].includes(f.version)||f.completeness==='full'&&f.version==='exact')return false;
 if(!['full_group','subunit','solo'].includes(f.performerScope)||f.originalPerformerScope!==f.performerScope)return false;
 if(![f.targetSong,f.performedSong,f.reason].every(v=>typeof v==='string'&&v.trim()))return false;
 if(!Array.isArray(f.differences)||f.differences.length<1||f.differences.length>8||!f.differences.every(v=>typeof v==='string'&&v.trim()&&v.length<=300))return false;
 if(!f.evidence||typeof f.evidence.note!=='string'||!Array.isArray(f.evidence.urls)||requireEvidence&&(!f.evidence.note.trim()||!f.evidence.urls.length))return false;
 return f.evidence.urls.every(raw=>{try{const u=new URL(raw);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}});
}

function validClip(c:NonNullable<StageVideo['clip']>){
 return Number.isSafeInteger(c.startSeconds)&&Number.isSafeInteger(c.endSeconds)&&c.startSeconds>=0&&c.endSeconds>c.startSeconds&&Number.isSafeInteger(c.sourceDurationSeconds)&&c.sourceDurationSeconds>0&&c.sourceDurationSeconds<=86400&&c.endSeconds<=c.sourceDurationSeconds&&!!c.evidence&&typeof c.evidence.note==='string'&&Array.isArray(c.evidence.urls);
}

// CID identifies the media within a BV collection; page alone can be reordered.
// Keep legacy YouTube keys unchanged; never infer Bilibili CID from a URL.
export function validBilibiliSource(source:{videoId:string;url:string;bilibili?:{cid:string;page:number}}):boolean{
 const b=source.bilibili;
 if(!/^https:\/\/(?:www\.)?bilibili\.com\//.test(source.url)||!/^BV[A-Za-z0-9]{10}$/.test(source.videoId)||!b||typeof b.cid!=='string'||!/^[1-9]\d{0,19}$/.test(b.cid)||!Number.isSafeInteger(b.page)||b.page<1||Object.keys(b).some(k=>k!=='cid'&&k!=='page'))return false;
 try{const u=new URL(source.url);
  return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&['www.bilibili.com','bilibili.com'].includes(u.hostname)&&u.pathname.replace(/\/$/,'')===`/video/${source.videoId}`&&u.searchParams.getAll('p').length===1&&u.searchParams.get('p')===String(b.page)&&u.searchParams.getAll('cid').length<=1&&(!u.searchParams.has('cid')||u.searchParams.get('cid')===b.cid)&&[...u.searchParams.keys()].every(k=>k==='p'||k==='cid');
 }catch{return false;}
}
/** A post may contain several videos; bind the explicit public video index. */
export function validXSource(source:{videoId:string;url:string;xMedia?:{videoIndex:number};clip?:unknown;bilibili?:unknown}):boolean{
 const m=source.xMedia;
 if(!/^https:\/\/x\.com\//.test(source.url)||!/^[1-9]\d{0,19}$/.test(source.videoId)||!m||Object.keys(m).join(',')!=='videoIndex'||!Number.isSafeInteger(m.videoIndex)||m.videoIndex<1||m.videoIndex>4||source.clip!==undefined||source.bilibili!==undefined)return false;
 try{const u=new URL(source.url),p=u.pathname.match(/^\/[A-Za-z0-9_]{1,15}\/status\/([1-9]\d{0,19})\/video\/([1-4])$/);
  return u.protocol==='https:'&&u.hostname==='x.com'&&!u.username&&!u.password&&!u.port&&!u.search&&!u.hash&&!!p&&p[1]===source.videoId&&p[2]===String(m.videoIndex);
 }catch{return false;}
}
export function stageSourceKey(stage:StageVideo|null|undefined):string|null{
 if(!stage||'scorePolicy' in stage&&stage.scorePolicy==='view_only')return null;
 if(stage.sourceClass!==undefined&&!['official','reupload','third_party'].includes(stage.sourceClass)||stage.sameSongFallback!==undefined&&!validSameSongFallback(stage)||stage.completeness!==undefined&&stage.completeness!=='full'&&!validSameSongFallback(stage))return null;
 if(stage.platform==='x')return validXSource(stage)?`x:${stage.videoId}:video:${stage.xMedia!.videoIndex}`:null;
 if(stage.platform==='bilibili'){
  if(stage.xMedia!==undefined||!validBilibiliSource(stage)||stage.clip&&!validClip(stage.clip))return null;
  return `bilibili:${stage.videoId}:cid:${stage.bilibili!.cid}:p:${stage.bilibili!.page}`+(stage.clip?`@${stage.clip.startSeconds}-${stage.clip.endSeconds}`:'');
 }
 if(stage.bilibili!==undefined||stage.xMedia!==undefined||stage.platform!==undefined&&stage.platform!=='youtube'||!/^[A-Za-z0-9_-]{11}$/.test(stage.videoId))return null;
 if(!stage.clip)return stage.videoId;
 const {startSeconds:start,endSeconds:end,sourceDurationSeconds:total}=stage.clip;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<=start||!Number.isSafeInteger(total)||total<=0||total>86400||end>total)return null;
 return `${stage.videoId}@${start}-${end}`;
}
export function stageSourceMatchesUrl(stage:StageVideo):boolean{
 if(stage.platform==='x')return validXSource(stage);
 if(stage.platform==='bilibili')return validBilibiliSource(stage);
 try{const u=new URL(stage.url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)?u.searchParams.get('v')??u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]:null)===stage.videoId;}catch{return false;}
}
export function stageRequiresSourceKey(stage:StageVideo|null|undefined){return !!stage&&(!!stage.clip||stage.platform==='bilibili'||stage.platform==='x');}
export function stageHasValidBinding(stage:StageVideo|null|undefined):boolean{
 const key=stageSourceKey(stage),b=stage?.scoreBinding;
 return !!key&&!!b&&b.videoId===stage?.videoId&&b.initialScore===null&&!!b.initializedAt&&Number.isFinite(Date.parse(b.initializedAt))&&(stageRequiresSourceKey(stage)?b.sourceKey===key:!b.sourceKey||b.sourceKey===key);
}
export function stageMatchesAlternative(stage:StageVideo,a:StageAlternative){
 if(stage.clip||a.sourceId!==stage.videoId||a.platform!==(stage.platform??'youtube'))return false;
 if(a.platform!=='bilibili')return a.platform==='youtube';
 return !!a.bilibili&&validBilibiliSource({videoId:a.sourceId,url:a.url,bilibili:a.bilibili})&&a.bilibili.cid===stage.bilibili?.cid&&a.bilibili.page===stage.bilibili.page;
}
export function formatStageTime(seconds:number){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
// Caption preferences do not create missing translation tracks.
export function youtubeEmbedUrl(videoId:string){if(!/^[A-Za-z0-9_-]{11}$/.test(videoId))return null;const url=new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);url.searchParams.set('autoplay','1');url.searchParams.set('cc_load_policy','1');url.searchParams.set('cc_lang_pref','zh-Hans');url.searchParams.set('hl','zh-CN');return url.href;}
export function stageEmbedUrl(stage:StageVideo){
 if(!stageSourceKey(stage)||!stageSourceMatchesUrl(stage)||stage.platform==='bilibili'||stage.platform==='x')return null;
 const url=new URL(youtubeEmbedUrl(stage.videoId)!);if(stage.clip){url.searchParams.set('start',String(stage.clip.startSeconds));url.searchParams.set('end',String(stage.clip.endSeconds));}return url.href;
}
export function stageWatchUrl(stage:StageVideo){
 if(!stageSourceKey(stage)||!stageSourceMatchesUrl(stage))return '';
 if(stage.platform==='x')return stage.url;
 if(stage.platform==='bilibili')return `https://www.bilibili.com/video/${stage.videoId}/?p=${stage.bilibili!.page}&cid=${stage.bilibili!.cid}`;
 const url=new URL(stage.url);if(stage.clip)url.searchParams.set('t',String(stage.clip.startSeconds));return url.href;
}
