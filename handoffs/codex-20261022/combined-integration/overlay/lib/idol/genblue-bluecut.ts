import data from '../../data/genblue-bluecut.json';
import {safeArtistReturn} from './artist-navigation';
import {artistMemberUrl, artistWorkUrl} from './artist-preview';
import {stageHasValidBinding, stageSourceKey} from './stage-source';
import {videoId} from './values';
import type {CatalogView, Member, Work} from './types';

export const GENBLUE_PATH = '/artists/genblue';
export const GENBLUE_GROUP_ID = data.groupId;
export type GenblueMedia = typeof data.media[number];
export type GenblueRelease = typeof data.releases[number];
export type GenblueRoute = {section:'overview'|'members'|'works'|'updates'; member:string|null; release:string|null; media:string|null; format:'all'|'mv'|'stage'; search:string; queue:'all'|'tonight'|'rewatch'|'unrated'; year:string|null;event:string|null;timelineType:'all'|'members'|'release'|'organization';timelineImportance:'all'|'major';timelineOrder:'earliest'|'recent';valid:boolean};
export const genblueDefaultRoute:GenblueRoute = {section:'overview',member:null,release:null,media:null,format:'all',search:'',queue:'all',year:null,event:null,timelineType:'all',timelineImportance:'all',timelineOrder:'earliest',valid:true};

export function readGenblueRoute(value:string):GenblueRoute {
  if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\x00-\x1f]/.test(value))return {...genblueDefaultRoute,valid:false};
  const safe=safeArtistReturn(value);
  if(!safe)return {...genblueDefaultRoute,valid:false};
  try {
    const u=new URL(safe,'https://site.invalid');
    if(u.pathname!==GENBLUE_PATH)return {...genblueDefaultRoute,valid:false};
    const p=u.searchParams,section=p.get('section');
    return {section:section==='members'||section==='works'||section==='updates'?section:section==='records'?'works':'overview',member:p.get('member'),release:p.get('release'),media:p.get('media'),format:p.get('format')==='mv'?'mv':p.get('format')==='stage'?'stage':'all',search:p.get('q')??'',queue:(p.get('queue')??'all') as GenblueRoute['queue'],year:p.get('year'),event:p.get('event'),timelineType:(p.get('timelineType')??'all') as GenblueRoute['timelineType'],timelineImportance:(p.get('timelineImportance')??'all') as GenblueRoute['timelineImportance'],timelineOrder:(p.get('timelineOrder')??'earliest') as GenblueRoute['timelineOrder'],valid:true};
  } catch {return {...genblueDefaultRoute,valid:false};}
}
export function genblueHref(patch:Partial<GenblueRoute> = {}, base:GenblueRoute=genblueDefaultRoute):string {
  const r={...base,...patch}, p=new URLSearchParams();
  if(r.section!=='overview')p.set('section',r.section);
  if(r.member)p.set('member',r.member);
  if(r.queue!=='all')p.set('queue',r.queue);
  if(r.search)p.set('q',r.search.slice(0,200));
  if(r.format!=='all')p.set('format',r.format);
  if(r.release)p.set('release',r.release);
  if(r.media)p.set('media',r.media);
  if(r.year)p.set('year',r.year);
  if(r.event)p.set('event',r.event);
  if(r.timelineType!=='all')p.set('timelineType',r.timelineType);
  if(r.timelineImportance!=='all')p.set('timelineImportance',r.timelineImportance);
  if(r.timelineOrder!=='earliest')p.set('timelineOrder',r.timelineOrder);
  return safeArtistReturn(GENBLUE_PATH+(p.size?'?'+p:''))??GENBLUE_PATH;
}
export const genblueMemberHref=(id:string,context?:GenblueRoute)=>genblueHref({section:'members',member:id,search:context?.section==='members'?context.search:''});
export const genblueReleaseHref=(key:string,context?:GenblueRoute)=>genblueHref({section:'works',release:key,search:context?.section==='works'?context.search:''});
export const genblueMediaHref=(media:GenblueMedia,context?:GenblueRoute)=>genblueHref({section:'works',format:media.kind as 'mv'|'stage',media:media.key,search:context?.section==='works'?context.search:'',queue:context?.section==='works'?context.queue:'all'});
const validScore=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=10;
export const genblueScoreLabel=(n:number|null)=>n===null?'未评分':n.toFixed(1);

const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const strings=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(v=>typeof v==='string');
const optionalString=(value:unknown)=>value===undefined||typeof value==='string';
const parseableDate=(value:unknown)=>typeof value==='string'&&value.trim().length>0&&Number.isFinite(Date.parse(value));
/** Shared stage helpers assume typed data. Never let JSON coercion reach Date.parse or a regex. */
function stageShape(value:unknown):boolean {
  if(value==null)return true;
  if(!object(value)||typeof value.url!=='string'||typeof value.videoId!=='string')return false;
  if(!['sourceClass','platform','completeness','scorePolicy'].every(key=>optionalString(value[key])))return false;
  const clip=value.clip;
  if(clip!=null&&(!object(clip)||!['startSeconds','endSeconds','sourceDurationSeconds'].every(key=>Number.isSafeInteger(clip[key]))))return false;
  const binding=value.scoreBinding;
  return binding==null||object(binding)&&typeof binding.videoId==='string'&&optionalString(binding.sourceKey)&&binding.initialScore===null&&parseableDate(binding.initializedAt);
}
/** memberWorks also inspects photo metadata, although this page only displays its exact associations. */
function photoShape(value:unknown):boolean {
  if(value==null)return true;
  if(!object(value)||!['table','recordId','fieldId','kind','sourceKind'].every(key=>optionalString(value[key])))return false;
  for(const key of ['approvedLookIdentity','nativeIdentity']) {
    const identity=value[key];
    if(identity!=null&&(!object(identity)||!['memberId','workId','videoId'].every(field=>typeof identity[field]==='string')))return false;
  }
  return true;
}
/** Treat JSON as untrusted at the read boundary; no malformed row may expose a score or crash navigation. */
export function isGenblueCatalog(value:unknown):value is CatalogView {
  if(!object(value))return false;
  if(Object.hasOwn(value,'scope')&&(!object(value.scope)||value.scope.type!=='artist'||value.scope.groupId!==GENBLUE_GROUP_ID))return false;
  if(!Array.isArray(value.groups)||!value.groups.every(g=>object(g)&&typeof g.id==='string')||value.groups.filter(g=>g.id===GENBLUE_GROUP_ID).length!==1)return false;
  if(!Array.isArray(value.members)||!value.members.every(m=>object(m)&&typeof m.id==='string'&&strings(m.groupIds)))return false;
  if(!Array.isArray(value.works)||!value.works.every(w=>object(w)&&typeof w.id==='string'&&strings(w.groupIds)&&typeof w.url==='string'&&stageShape(w.stage)))return false;
  if(!Array.isArray(value.ratings)||!value.ratings.every(r=>object(r)&&typeof r.id==='string'&&strings(r.memberIds)&&strings(r.workIds)&&photoShape(r.photo)))return false;
  return true;
}

/** Current catalog identity is checked before exposing either a personal score or its record action. */
export function resolveGenblueMedia(catalog:CatalogView|null, media:GenblueMedia):{work:Work;score:number|null}|null {
  if(!isGenblueCatalog(catalog))return null;
  if(!data.media.some(m=>m.key===media.key&&m.workId===media.workId&&m.kind===media.kind&&m.videoId===media.videoId&&m.url===media.url&&m.sourceKey===media.sourceKey))return null;
  const rows=catalog.works.filter(w=>w.id===media.workId);
  if(rows.length!==1)return null;
  const work=rows[0];
  if(work.placeholder||!work.groupIds.includes(GENBLUE_GROUP_ID))return null;
  if(catalog.works.some(w=>w.id!==work.id&&(videoId(w.url)===media.videoId||videoId(w.stage?.url??'')===media.videoId)))return null;
  if(media.kind==='mv'){
    if(work.url!==media.url||videoId(work.url)!==media.videoId)return null;
    return {work,score:validScore(work.score)?work.score:null};
  }
  if(media.kind!=='stage'||!stageHasValidBinding(work.stage)||work.stage?.videoId!==media.videoId||work.stage.url!==media.url||videoId(work.stage.url)!==media.videoId||stageSourceKey(work.stage)!==media.sourceKey)return null;
  return {work,score:validScore(work.stageScore)?work.stageScore:null};
}
export function genblueRecordHref(catalog:CatalogView|null,media:GenblueMedia,returnTo:string):string|null {
  const binding=resolveGenblueMedia(catalog,media), safe=safeArtistReturn(returnTo);
  return binding&&safe?.startsWith(GENBLUE_PATH)?artistWorkUrl(binding.work,media.kind==='stage',safe):null;
}
export function resolveGenblueMember(catalog:CatalogView|null,id:string):Member|null {
  if(!isGenblueCatalog(catalog)||!data.members.some(m=>m.id===id))return null;
  const rows=catalog?.members.filter(m=>m.id===id)??[];
  return rows.length===1&&rows[0].groupIds.includes(GENBLUE_GROUP_ID)?rows[0]:null;
}
export function genblueMemberRecordHref(catalog:CatalogView|null,id:string,returnTo:string):string|null {
  const safe=safeArtistReturn(returnTo);
  return resolveGenblueMember(catalog,id)&&safe?.startsWith(GENBLUE_PATH)?artistMemberUrl(id,safe):null;
}
/** Watched is a shared Work field. Stage filters never borrow the MV score. */
export function genblueMediaMatches(catalog:CatalogView|null,media:GenblueMedia,route:GenblueRoute):boolean {
  if(route.format!=='all'&&media.kind!==route.format)return false;
  if(!`${media.title} ${media.typeLabel} ${media.date}`.toLowerCase().includes(route.search.trim().toLowerCase()))return false;
  if(route.queue==='all')return true;
  const binding=resolveGenblueMedia(catalog,media);
  if(!binding)return false;
  if(route.queue==='rewatch')return binding.score!==null&&binding.score>=9;
  if(route.queue==='unrated')return binding.score===null&&binding.work.watched==='已观看';
  return binding.score===null&&binding.work.watched!=='已观看';
}

/** Navigation-only same-tab opener. Never includes catalog, scores, drafts, or external URLs. */
export function genblueReturnPath(value:unknown,current:string):string|null {
  if(!object(value)||typeof value.path!=='string'||typeof value.from!=='string')return null;
  const here=readGenblueRoute(current),destination=readGenblueRoute(value.path),origin=readGenblueRoute(value.from);
  if(!here.valid||!destination.valid||!origin.valid||genblueHref(here)!==genblueHref(destination)||genblueHref(origin)===genblueHref(here))return null;
  return genblueHref(origin);
}

// Finite navigation-only focus keys. Repeated links to one media item have separate keys.
const linkFocusTargets=new Map<string,{kind:'release'|'media';key:string}>();
for(const release of data.releases){
  for(const prefix of ['release','feature-cover','feature-action'])linkFocusTargets.set(`${prefix}:${release.key}`,{kind:'release',key:release.key});
  const first=data.media.find(media=>media.releaseKey===release.key);
  if(first)linkFocusTargets.set(`release-primary:${release.key}`,{kind:'media',key:first.key});
}
for(const media of data.media)linkFocusTargets.set(`media:${media.key}`,{kind:'media',key:media.key});
for(const event of data.events){
  if(event.releaseKey)linkFocusTargets.set(`event-release:${event.id}`,{kind:'release',key:event.releaseKey});
  for(const media of data.media.filter(media=>event.workIds.some(id=>id===media.workId)&&media.releaseKey===event.releaseKey))linkFocusTargets.set(`event-media:${event.id}:${media.key}`,{kind:'media',key:media.key});
}
/** Source-entry focus preference only. Never accepts an arbitrary selector, foreign URL or record data. */
export function readGenblueLinkFocus(value:unknown,current:string):{path:string;href:string;key:string}|null {
  if(!object(value)||typeof value.path!=='string'||typeof value.href!=='string'||typeof value.key!=='string')return null;
  const source=readGenblueRoute(value.path),here=readGenblueRoute(current),destination=readGenblueRoute(value.href),target=linkFocusTargets.get(value.key);
  if(!source.valid||!here.valid||!destination.valid||!target||genblueHref(source)!==genblueHref(here)||genblueHref(source)===genblueHref(destination))return null;
  if(target.kind==='release'?destination.release!==target.key:destination.media!==target.key)return null;
  return {path:genblueHref(source),href:genblueHref(destination),key:value.key};
}

export function genblueTimelineEntries(route:GenblueRoute) {
  const rows=data.events.filter(e=>(!route.year||e.date.startsWith(route.year+'-'))&&(route.timelineImportance==='all'||e.importance==='major')&&(route.timelineType==='all'||route.timelineType==='release'&&e.eventType==='release'||route.timelineType==='members'&&['debut','member_join','member_departure','disband','rename'].includes(e.eventType)||route.timelineType==='organization'&&['agency_change','contract_end','hiatus','resume'].includes(e.eventType)));
  return route.timelineOrder==='recent'?[...rows].reverse():rows;
}
