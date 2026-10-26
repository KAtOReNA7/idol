import design from '../../data/izna-editorial.json';
import assets from '../../data/izna-assets.json';
import {stageHasValidBinding,stageSourceKey} from './stage-source';
import type {CatalogView,Member,Work} from './types';
import type {AssetContext,AssetBinding,NativeBinding} from './izna-runtime/host.mjs';
export {design};
export type IznaVideo=typeof design.works[number];
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string');
const score=(v:unknown)=>v===null||typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=10;
function stageWire(v:unknown){
 if(v===null||v===undefined)return true;
 if(!object(v)||typeof v.videoId!=='string'||typeof v.url!=='string'||typeof v.kind!=='string')return false;
 if(v.sourceClass!==undefined&&v.sourceClass!=='official'||v.platform!==undefined&&v.platform!=='youtube'||v.completeness!==undefined&&v.completeness!=='full'||v.scorePolicy!==undefined&&v.scorePolicy!=='view_only')return false;
 if(v.clip!==null&&v.clip!==undefined&&(!object(v.clip)||!['startSeconds','endSeconds','sourceDurationSeconds'].every(k=>Number.isSafeInteger((v.clip as Record<string,unknown>)[k]))))return false;
 const b=v.scoreBinding;
 return b===null||b===undefined||object(b)&&typeof b.videoId==='string'&&(b.sourceKey===undefined||typeof b.sourceKey==='string')&&b.initialScore===null&&typeof b.initializedAt==='string'&&b.initializedAt.length<128&&Number.isFinite(Date.parse(b.initializedAt));
}
/** Validate the wire fields consumed below; no private catalog is imported into
 * the public editorial renderer, and no missing identity is synthesized. */
export function validIznaCatalog(v:unknown):v is CatalogView{
 if(!object(v)||v.scope!==undefined&&(!object(v.scope)||v.scope.type!=='artist'||v.scope.groupId!==design.group.id))return false;
 if(!Array.isArray(v.groups)||v.groups.length!==1||!object(v.groups[0])||v.groups[0].id!==design.group.id)return false;
 if(!Array.isArray(v.members)||!v.members.every(m=>object(m)&&typeof m.id==='string'&&strings(m.groupIds)&&(m.formerGroupIds==null||strings(m.formerGroupIds))))return false;
 if(!Array.isArray(v.works)||!v.works.every(w=>object(w)&&typeof w.id==='string'&&strings(w.groupIds)&&typeof w.url==='string'&&typeof w.videoType==='string'&&typeof w.watched==='string'&&score(w.score)&&score(w.stageScore)&&stageWire(w.stage)))return false;
 return Array.isArray(v.ratings);
}
export function iznaYoutubeIdentity(value:string):string|null{
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return null;
 const id=u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com'].includes(u.hostname)&&u.pathname==='/watch'&&u.searchParams.getAll('v').length===1?u.searchParams.get('v'):null;
 return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;}catch{return null;}
}
export function boundIznaMember(catalog:CatalogView|null,id:string):Member|null{
 if(!catalog||!validIznaCatalog(catalog)||!design.members.some(m=>m.id===id))return null;
 const rows=catalog.members.filter(m=>m.id===id),m=rows.length===1?rows[0]:null;
 return m&&[...m.groupIds,...(m.formerGroupIds??[])].includes(design.group.id)?m:null;
}
export function boundIznaWork(catalog:CatalogView|null,video:IznaVideo):Work|null{
 if(!catalog||!validIznaCatalog(catalog)||!design.works.some(v=>v.key===video.key&&v.id===video.id&&v.videoId===video.videoId&&v.type===video.type&&v.videoType===video.videoType&&v.url===video.url))return null;
 const rows=catalog.works.filter(w=>w.id===video.id),w=rows.length===1?rows[0]:null;
 if(!w||w.placeholder||!w.groupIds.includes(design.group.id))return null;
 if(catalog.works.some(other=>other.id!==w.id&&(iznaYoutubeIdentity(other.url)===video.videoId||iznaYoutubeIdentity(other.stage?.url??'')===video.videoId)))return null;
 if(video.type==='MV')return iznaYoutubeIdentity(w.url)===video.videoId&&w.videoType===video.videoType?w:null;
 const stage=w.stage;
 return stage&&stage.videoId===video.videoId&&iznaYoutubeIdentity(stage.url)===video.videoId&&stage.kind===video.videoType&&stageSourceKey(stage)===video.videoId&&!stage.clip?w:null;
}
export function iznaNativeBindings(catalog:CatalogView|null):NativeBinding[]{
 const bindings:NativeBinding[]=[];
 for(const m of design.members)if(boundIznaMember(catalog,m.id))bindings.push({kind:'member',groupId:design.group.id,memberId:m.id,evidence:'catalog:unique-member-and-group'});
 for(const v of design.works){const w=boundIznaWork(catalog,v);if(w)bindings.push({kind:'video',groupId:design.group.id,workId:w.id,videoId:v.videoId,videoType:v.videoType,slotType:v.type as 'MV'|'STAGE',sourceKey:v.videoId,parentWorkIds:[w.id],clip:null,scoreBindingVerified:v.type==='MV'||stageHasValidBinding(w.stage),evidence:'catalog:unique-work-exact-video-slot'});}
 return bindings;
}
/** A record relationship is not cast evidence: both the independently reviewed
 * exact-video participant list and an unambiguous existing record are required.
 * Other existing rating rows remain untouched in the shared notebook. */
export function iznaVideoMemberIds(catalog:CatalogView|null,video:IznaVideo):string[]{
 if(!catalog||!boundIznaWork(catalog,video)||video.type!=='MV')return [];
 const ids=new Map<string,number>();
 for(const row of catalog.ratings)if(object(row)&&typeof row.id==='string')ids.set(row.id,(ids.get(row.id)??0)+1);
 return design.members.filter(m=>{
   if(!(video.memberIds as readonly string[]).includes(m.id)||!boundIznaMember(catalog,m.id))return false;
   const rows=catalog.ratings.filter(row=>object(row)&&typeof row.id==='string'&&/^rec[A-Za-z0-9]+$/.test(row.id)&&strings(row.memberIds)&&row.memberIds.length===1&&row.memberIds[0]===m.id&&strings(row.workIds)&&row.workIds.length===1&&row.workIds[0]===video.id);
   return rows.length===1&&ids.get(rows[0].id)===1;
 }).map(m=>m.id);
}
export function prepareIznaDisplayData(catalog:CatalogView|null){
 // The public editorial list has its own exact-video evidence. Do not expand it
 // using personal record rows, even when those records have stable native IDs.
 return {...design,publicAccounts:(catalog?.groups.find(g=>g.id===design.group.id)?.social??[]).map(({platform,url,subjectName,countLabel,observedAt})=>({platform,url,subjectName,countLabel,observedAt}))};
}
/** Every address is a checked-in public file with the exact candidate digest.
 * No private image API, original-source fallback or external download occurs. */
export function iznaAssetResolver(_asset:unknown,context:AssetContext):AssetBinding|null{
 if(context.slug!=='izna'||context.groupId!==design.group.id)return null;
 const matches=assets.filter(a=>['assetKey','groupId','sha256','bytes','width','height'].every(k=>a[k as keyof typeof a]===context.identity[k as keyof typeof context.identity]));
 return matches.length===1?Object.freeze({...matches[0]}):null;
}
