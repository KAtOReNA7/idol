import {F} from './fields';
import {groupPlaceholderFor,wasAuditedGroupPlaceholder} from './placeholders';
import {stageSupplementForWork} from './supplements';
import {stageForWork,stageResearchForWork} from './stage';
import {asText,asNumber,asIds,asUrl,videoId} from './values';
import {configured,TableKey} from './feishu';
import {liveTables} from './live';
import type {Catalog,Photo,Rating,StageResearch} from './types';
import {approvedMvLookPhoto} from './mv-look-policy';
import {selectReviewedMvLookPhoto,type QualifiedMvLookPhoto} from './mv-look-successor-policy';
import {photoDisplayFocus} from './photo-display-focus';
import {personalMvPhoto} from './member-works';
type Row={recordId:string;fields:Record<string,unknown>};
export type Tables=Record<TableKey,{records:Row[]}>;
function photo(table:'members'|'ratings',r:Row,fieldId:string,works:Row[]):Photo|null{const raw=r.fields[fieldId];if(!Array.isArray(raw)||!raw.length||!raw[0]||typeof raw[0]!=='object'||raw[0].source_kind==='mv_look_photo')return null;const recognition=asText(r.fields[F.ratings.recognition]);return {table,recordId:r.recordId,fieldId,index:0,...(table==='ratings'&&raw[0].source_kind==='mv_still'&&/^native_photo_[a-f0-9]{64}$/.test(raw[0].file_token)&&typeof raw[0].member_id==='string'&&typeof raw[0].work_id==='string'&&typeof raw[0].exact_video_id==='string'&&videoId(asUrl(works.find(w=>w.recordId===raw[0].work_id)?.fields[F.works.url]))===raw[0].exact_video_id?{nativeIdentity:{memberId:raw[0].member_id,workId:raw[0].work_id,videoId:raw[0].exact_video_id}}:{}),kind:table==='ratings'&&raw[0].source_kind==='mv_still'?'本 MV 截图':table==='ratings'?(recognition.includes('全员拼图')?'本 MV 具名全员拼图':recognition.includes('粉丝')?'粉丝具名 MV 截图':'本 MV 认人图'):undefined};}
function ratingPhotos(r:Row,t:Tables):{photo:Photo|null;referencePhoto?:Photo|null}{
 const legacy=photo('ratings',r,F.ratings.photo,t.works.records),raw=r.fields[F.ratings.photo];
 if(!Array.isArray(raw))return {photo:legacy};
 const memberIds=asIds(r.fields[F.ratings.members]),workIds=asIds(r.fields[F.ratings.works]);
 const works=t.works.records.filter(w=>w.recordId===workIds[0]);
 const target={ratingId:r.recordId,memberIds,workIds,videoId:videoId(asUrl(works[0]?.fields[F.works.url])),memberExists:t.members.records.filter(m=>m.recordId===memberIds[0]).length===1,workExists:works.length===1};
 const qualified=raw.map((attachment,index)=>({index,approval:approvedMvLookPhoto(attachment,target)})).filter((x):x is QualifiedMvLookPhoto=>x.approval!==null);
 // Competing approvals remain unresolved unless an exact reviewed pair applies.
 const selected=selectReviewedMvLookPhoto(qualified,target);
 if(!selected)return {photo:legacy};
 const {index,approval}=selected,identity={memberId:approval.memberId,workId:approval.workId,videoId:approval.videoId};
 const displayFocus=photoDisplayFocus(approval.candidateId,approval.sha256);
 const projected:Photo={...(displayFocus?{displayFocus}:{}),table:'ratings',recordId:r.recordId,fieldId:F.ratings.photo,index,sourceKind:'mv_look_photo',kind:'本 MV 同造型照片',approvedLookIdentity:{...identity,sameLook:true}};
 const referenceRow={id:r.recordId,memberIds,workIds,photo:legacy,recognition:asText(r.fields[F.ratings.recognition])} as Rating;
 let referencePhoto=personalMvPhoto(referenceRow,memberIds[0],workIds[0]);
 if(referencePhoto?.nativeIdentity&&(referencePhoto.nativeIdentity.memberId!==memberIds[0]||referencePhoto.nativeIdentity.workId!==workIds[0]))referencePhoto=null;
 if(!referencePhoto){
  const stillIndex=raw.findIndex(a=>a&&a.source_kind==='mv_still'&&/^native_photo_[a-f0-9]{64}$/.test(a.file_token)&&a.member_id===memberIds[0]&&a.work_id===workIds[0]&&a.exact_video_id===target.videoId);
  if(stillIndex>=0)referencePhoto={table:'ratings',recordId:r.recordId,fieldId:F.ratings.photo,index:stillIndex,kind:'本 MV 截图',sourceKind:'mv_still',nativeIdentity:identity};
 }
 return {photo:projected,...(referencePhoto?{referencePhoto}:{})};
}

function date(v:unknown){if(typeof v==='number'){try{return new Date(v).toISOString().slice(0,10);}catch{return '';}}return asText(v).replace(/T.*$/,'');}
export function projectCatalog(t:Tables,mode:'snapshot'|'live',capturedAt:string,warning:string|null=null):Catalog{
 const members=t.members.records.map(r=>{const v=r.fields;const f=F.members;return {id:r.recordId,name:asText(v[f.name]),cnName:asText(v[f.cnName]),stageName:asText(v[f.stageName]),groupIds:asIds(v[f.groups]),formerGroupIds:asIds(v[f.formerGroups]),photo:photo('members',r,f.photo,t.works.records),favorite:asNumber(v[f.favorite]),note:asText(v[f.note]),profile:asText(v[f.profile]),status:asText(v[f.status]),country:asText(v[f.country]),role:asText(v[f.role]),officialUrl:asUrl(v[f.officialUrl]),birthDate:date(v[f.birthDate])};});
 const ratings=t.ratings.records.map(r=>{const v=r.fields;const f=F.ratings;return {id:r.recordId,name:asText(v[f.name]),memberIds:asIds(v[f.members]),workIds:asIds(v[f.works]),score:asNumber(v[f.score]),stylingScore:asNumber(v[f.stylingScore]),memory:asText(v[f.memory]),note:asText(v[f.note]),...ratingPhotos(r,t),verification:asText(v[f.verification]),source:asUrl(v[f.source]),recognition:asText(v[f.recognition])};});
 const works=t.works.records.map(r=>{const v=r.fields;const f=F.works;const ratingIds=ratings.filter(x=>x.workIds.includes(r.recordId)).map(x=>x.id);const placeholder=groupPlaceholderFor(r,ratingIds);const research=stageResearchForWork(r.recordId);const stageResearch:StageResearch=!placeholder&&wasAuditedGroupPlaceholder(r.recordId)&&research.status==='missing_song_identity'?{status:'pending',reason:'这条原占位记录资料已变化，已恢复展示；作品身份和舞台来源需重新核验。',checkedAt:null}:research;return {placeholder,stageSupplement:stageSupplementForWork(r.recordId),stage:stageForWork(r.recordId),stageResearch,id:r.recordId,name:asText(v[f.name]),song:asText(v[f.song]),groupIds:asIds(v[f.groups]),url:asUrl(v[f.url]),score:asNumber(v[f.score]),stageScore:asNumber(v[f.stageScore]),note:asText(v[f.note]),watched:asText(v[f.watched]),videoType:asText(v[f.videoType]),version:asText(v[f.version]),releaseDate:date(v[f.releaseDate]),verification:asText(v[f.verification]),officialTitle:asText(v[f.officialTitle]),channel:asText(v[f.channel]),ratingIds,source:asText(v[f.source])};});
 const groups=t.groups.records.map(r=>{const v=r.fields;const f=F.groups;const gw=works.filter(w=>w.groupIds.includes(r.recordId));const rated=gw.filter(w=>w.score!==null);return {id:r.recordId,name:asText(v[f.name]),generation:asText(v[f.generation]),company:asText(v[f.company]),country:asText(v[f.country]),note:asText(v[f.note]),debut:date(v[f.debut]),currentName:asText(v[f.currentName]),status:asText(v[f.status]),officialUrl:asUrl(v[f.officialUrl]),channelUrl:asUrl(v[f.channelUrl]),memberIds:members.filter(m=>m.groupIds.includes(r.recordId)).map(m=>m.id),workIds:gw.map(w=>w.id),average:rated.length?rated.reduce((n,w)=>n+w.score!,0)/rated.length:null,ratedCount:rated.length};});
 const rated=works.filter(x=>x.score!==null);return {mode,capturedAt,loadedAt:new Date().toISOString(),warning,groups,members,works,ratings,counts:{groups:groups.length,members:members.length,works:works.length,ratings:ratings.filter(r=>r.memberIds.length>0&&r.workIds.length>0).length,ratedWorks:rated.length,scoreSum:rated.reduce((n,w)=>n+w.score!,0)}};
}
// In-isolate coalescing still guards superseded reads. Durable snapshots use the raw
// tables so each deployment always projects its current stage/source metadata.
const CATALOG_CACHE_MS=5*60*1000;
export type CatalogSnapshot={tables:Tables;capturedAt:string;catalog:Catalog};
let generation=0;
let cache:{at:number;generation:number;snapshot:CatalogSnapshot}|null=null;
let pending:{generation:number;promise:Promise<CatalogSnapshot>}|null=null;
export function invalidateCatalog(){generation++;cache=null;}
export async function getCatalogSnapshot(force=false):Promise<CatalogSnapshot>{
 if(!configured()){const {loadFallbackSnapshot}=await import('./snapshot-fallback');const snapshot=await loadFallbackSnapshot();const tables=snapshot.tables as Tables;return {tables,capturedAt:snapshot.capturedAt,catalog:projectCatalog(tables,'snapshot',snapshot.capturedAt,'飞书连接待完成。当前为只读迁移快照，评分保存尚未开放。')};}
 if(force)invalidateCatalog();
 const current=generation;
 if(cache&&cache.generation===current&&Date.now()-cache.at<CATALOG_CACHE_MS)return cache.snapshot;
 if(pending?.generation===current)return pending.promise;
 const entry={generation:current,promise:null as unknown as Promise<CatalogSnapshot>};
 entry.promise=(async()=>{
  const tables=await liveTables();
  if(current!==generation)return getCatalogSnapshot();
  const capturedAt=new Date().toISOString();
  const snapshot={tables,capturedAt,catalog:projectCatalog(tables,'live',capturedAt)};
  cache={at:Date.now(),generation:current,snapshot};return snapshot;
 })();
 pending=entry;
 try{return await entry.promise;}finally{if(pending===entry)pending=null;}
}
export async function getCatalog(force=false):Promise<Catalog>{return (await getCatalogSnapshot(force)).catalog;}
