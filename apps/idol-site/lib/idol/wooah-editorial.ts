import design from '../../data/wooah-editorial.json';
import navigation from '../../data/wooah-native-navigation.json';
import {safeArtistReturn} from './artist-navigation';
import {artistWorkUrl,artistMemberUrl} from './artist-preview';
import {stageHasValidBinding,stageSourceKey} from './stage-source';
import type {CatalogView,Member,Work} from './types';
export {design};
export type EditorialMember=typeof design.members[number];
export type EditorialRelease=typeof design.releases[number];
export type EditorialVideo=typeof design.videos[number];
export type EditorialImage=typeof design.hero;
export type WooahRoute={section:'overview'|'members'|'works'|'records'|'updates';member:string|null;release:string|null;media:string|null;format:'all'|'mv'|'stage';queue:'all'|'tonight'|'rewatch'|'unrated';search:string};
export const WOOAH_PATH='/artists/wooah';
export const emptyWooahRoute:WooahRoute={section:'overview',member:null,release:null,media:null,format:'all',queue:'all',search:''};
const sections=['overview','members','works','records','updates'],queues=['all','tonight','rewatch','unrated'];
/** Strict local identity constraints supplement, never replace, the existing host sanitizer. */
export function readWooahRoute(value:string):WooahRoute|null{
 try{const u=new URL(value,'https://site.invalid'),p=u.searchParams;
  if(u.origin!=='https://site.invalid'||u.pathname!==WOOAH_PATH||value.split('?')[0]!==u.pathname||u.hash||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u0020]/.test(value))return null;
  for(const k of p.keys())if(!['section','member','release','media','format','queue','q'].includes(k)||p.getAll(k).length!==1)return null;
  const section=p.get('section')??'overview',format=p.get('format')??'all',queue=p.get('queue')??'all',search=p.get('q')??'';
  const member=p.get('member'),release=p.get('release'),media=p.get('media');
  if(!sections.includes(section)||!['all','mv','stage'].includes(format)||!queues.includes(queue)||search.length>200)return null;
  if(member&&(!navigation.memberIds.includes(member)||release||media||section!=='members'))return null;
  if(p.has('member')&&!member||p.has('release')&&!release||p.has('media')&&!media)return null;
  if(release&&(!navigation.releases.includes(release)||section!=='works'||p.has('format')||member||media))return null;
  if(media&&(!navigation.media.some(v=>v.key===media&&v.kind===format)||section!=='works'||member||release))return null;
  return {section,member,release,media,format,queue,search} as WooahRoute;
 }catch{return null;}
}
export function wooahRouteUrl(route:WooahRoute){const p=new URLSearchParams();if(route.section!=='overview')p.set('section',route.section);if(route.member)p.set('member',route.member);if(route.queue!=='all')p.set('queue',route.queue);if(route.search)p.set('q',route.search);if(route.release)p.set('release',route.release);else if(route.format!=='all')p.set('format',route.format);if(route.media)p.set('media',route.media);return WOOAH_PATH+(p.size?'?'+p:'');}
const object=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const strings=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(item=>typeof item==='string');
const nullableScore=(value:unknown)=>value===null||typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10;
const parseableDate=(value:unknown)=>typeof value==='string'&&value.length<=128&&value.trim().length>0&&Number.isFinite(Date.parse(value));
/** The shared helpers consume typed values. Reject malformed wire data before any regex, Date.parse, or comparison. */
function validStageWire(value:unknown):boolean{
 if(value===null||value===undefined)return true;
 if(!object(value)||typeof value.videoId!=='string'||typeof value.url!=='string')return false;
 if(value.sourceClass!==undefined&&value.sourceClass!=='official'||value.platform!==undefined&&value.platform!=='youtube'||value.completeness!==undefined&&value.completeness!=='full'||value.scorePolicy!==undefined&&value.scorePolicy!=='view_only')return false;
 const clip=value.clip;
 if(clip!==null&&clip!==undefined&&(!object(clip)||!['startSeconds','endSeconds','sourceDurationSeconds'].every(key=>Number.isSafeInteger(clip[key]))))return false;
 const binding=value.scoreBinding;
 return binding===null||binding===undefined||object(binding)&&typeof binding.videoId==='string'&&(binding.sourceKey===undefined||typeof binding.sourceKey==='string'&&binding.sourceKey.length>0)&&binding.initialScore===null&&parseableDate(binding.initializedAt);
}
/** Validate every wire field consumed by this native page or its unchanged shared helpers; never coerce JSON. */
export function validWooahCatalog(value:unknown):value is CatalogView{
 if(!object(value))return false;
 if(value.scope!==undefined&&(!object(value.scope)||value.scope.type!=='artist'||value.scope.groupId!==design.groupId))return false;
 if(!Array.isArray(value.groups)||value.groups.length!==1||!object(value.groups[0])||value.groups[0].id!==design.groupId)return false;
 if(!Array.isArray(value.members)||!value.members.every(m=>object(m)&&typeof m.id==='string'&&strings(m.groupIds)&&(m.formerGroupIds===undefined||m.formerGroupIds===null||strings(m.formerGroupIds))))return false;
 if(!Array.isArray(value.works)||!value.works.every(w=>object(w)&&typeof w.id==='string'&&strings(w.groupIds)&&typeof w.url==='string'&&typeof w.watched==='string'&&nullableScore(w.score)&&nullableScore(w.stageScore)&&(w.placeholder===undefined||w.placeholder===null||object(w.placeholder))&&validStageWire(w.stage)))return false;
 return Array.isArray(value.ratings);
}
export function youtubeIdentity(value:string):string|null{try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):['www.youtube.com','youtube.com'].includes(u.hostname)&&u.pathname==='/watch'&&u.searchParams.getAll('v').length===1?u.searchParams.get('v'):null;return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;}catch{return null;}}
/** No title matching, inferred membership, candidate release ID, or alternate video binding. */
export function boundWooahWork(data:CatalogView|null,video:EditorialVideo):Work|null{
 if(!data||!validWooahCatalog(data))return null;
 if(!design.videos.some(v=>v.key===video.key&&v.kind===video.kind&&v.workId===video.workId&&v.videoId===video.videoId&&v.url===video.url))return null;
 const rows=data.works.filter(w=>w.id===video.workId);if(rows.length!==1)return null;const work=rows[0];
 if(work.placeholder||!Array.isArray(work.groupIds)||!work.groupIds.includes(design.groupId))return null;
 if(data.works.some(w=>w.id!==work.id&&(youtubeIdentity(w.url)===video.videoId||youtubeIdentity(w.stage?.url??'')===video.videoId)))return null;
 if(video.kind==='mv')return youtubeIdentity(work.url)===video.videoId?work:null;
 const stage=work.stage;
 return stage&&stage.videoId===video.videoId&&youtubeIdentity(stage.url)===video.videoId&&stageSourceKey(stage)===video.videoId&&!stage.clip?work:null;
}
export function wooahVideoScore(data:CatalogView|null,video:EditorialVideo){const w=boundWooahWork(data,video);if(!w)return null;if(video.kind==='stage'&&!stageHasValidBinding(w.stage))return null;const n=video.kind==='stage'?w.stageScore:w.score;return typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=10?n:null;}
export function wooahRecordHref(data:CatalogView|null,video:EditorialVideo,returnTo:string){const w=boundWooahWork(data,video);const safe=safeArtistReturn(returnTo);return w&&readWooahRoute(returnTo)&&safe?artistWorkUrl(w,video.kind==='stage',safe):null;}
export function boundWooahMember(data:CatalogView|null,memberId:string):Member|null{
 if(!data||!validWooahCatalog(data)||!design.members.some(m=>m.id===memberId))return null;
 const rows=data.members.filter(m=>m.id===memberId),member=rows.length===1?rows[0]:null;
 return member&&[...member.groupIds,...(member.formerGroupIds??[])].includes(design.groupId)?member:null;
}
export function wooahMemberRecordHref(data:CatalogView|null,member:EditorialMember,returnTo:string){const m=boundWooahMember(data,member.id),safe=safeArtistReturn(returnTo);return m&&safe&&readWooahRoute(returnTo)?artistMemberUrl(m.id,safe):null;}
/** Only unambiguous existing single-member/single-work rows establish participation.
 * Duplicate record IDs or duplicate pairs are unresolved, even if their scores agree.
 * No roster inference, score aggregation, synthetic relation, or stage cast is created.
 */
export function wooahVideoMembers(data:CatalogView|null,video:EditorialVideo):EditorialMember[]{
 const work=boundWooahWork(data,video);if(!data||!work||video.kind!=='mv')return [];
 const ids=new Map<string,number>();
 for(const row of data.ratings)if(object(row)&&typeof row.id==='string')ids.set(row.id,(ids.get(row.id)??0)+1);
 const rows=data.ratings.filter(row=>object(row)&&typeof row.id==='string'&&/^rec[A-Za-z0-9]+$/.test(row.id)&&strings(row.memberIds)&&row.memberIds.length===1&&strings(row.workIds)&&row.workIds.length===1&&row.workIds[0]===work.id);
 return design.members.filter(member=>{
  if(!boundWooahMember(data,member.id))return false;
  const matches=rows.filter(row=>row.memberIds[0]===member.id);
  return matches.length===1&&ids.get(matches[0].id)===1;
 });
}
export function wooahMemberVideos(data:CatalogView|null,memberId:string):EditorialVideo[]{
 if(!boundWooahMember(data,memberId))return [];
 return design.videos.filter(video=>video.kind==='mv'&&wooahVideoMembers(data,video).some(member=>member.id===memberId));
}
/** Watching is work-level; ratings and queue eligibility are always specific to the exact video version. */
export function wooahVideoInQueue(data:CatalogView|null,video:EditorialVideo,queue:WooahRoute['queue']){
 if(queue==='all')return true;
 const work=boundWooahWork(data,video);if(!work||video.kind==='stage'&&!stageHasValidBinding(work.stage))return false;
 const score=wooahVideoScore(data,video);
 if(queue==='rewatch')return score!==null&&score>=9;
 if(queue==='unrated')return work.watched==='已观看'&&score===null;
 return queue==='tonight'&&work.watched!=='已观看'&&score===null;
}
export function wooahCatalog(data:CatalogView|null,route:WooahRoute){const q=route.search.trim().toLocaleLowerCase();const releases=route.format==='all'&&route.queue==='all'?design.releases.filter(r=>`${r.title} ${r.artistCredit}`.toLocaleLowerCase().includes(q)):[];const videos=route.section==='records'?[]:design.videos.filter(v=>(route.format==='all'||v.kind===route.format)&&`${v.title} ${v.officialTitle} ${v.version}`.toLocaleLowerCase().includes(q)&&wooahVideoInQueue(data,v,route.queue));return {releases,videos,total:releases.length+videos.length};}
export function wooahRelatedVideos(release:EditorialRelease){const ids=design.releaseLinks.find(l=>l.releaseCandidateKey===release.key)?.workIds??[];return design.videos.filter(v=>ids.includes(v.workId));}
export function wooahRelatedReleases(video:EditorialVideo){const keys=design.releaseLinks.filter(l=>l.workIds.includes(video.workId)).map(l=>l.releaseCandidateKey);return design.releases.filter(r=>keys.includes(r.key));}
export function wooahRelatedVideoVersions(video:EditorialVideo){return design.videos.filter(v=>v.key!==video.key&&v.workId===video.workId);}
