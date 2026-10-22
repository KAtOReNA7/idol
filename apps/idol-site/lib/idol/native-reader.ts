import {withVerifiedVersionDisplay} from './verified-version-display';
import {withGroupMilestones} from './group-milestones';
import {withSocialFacts} from './social-facts';
import {env} from 'cloudflare:workers';
import {AppError,type TableKey} from './feishu';
import {activeNative,nativeDb,nativeRow,nativeSchema,nativeTables,type StorageControl} from './native-storage';
import type {Catalog} from './types';
import {namedFields} from './native-format';
import {editableValues} from './live';
import {projectCatalog} from './catalog';
import {F} from './fields';
// Private per-isolate read-through cache. All writes retain their existing D1
// transactions; generation is incremented atomically alongside committed changes.
// This does not persist private data in browser storage or share it across owners.
const NATIVE_CATALOG_TTL=5*60*1000,MAX_NATIVE_OWNERS=4;
type NativeCatalogStamp={state:StorageControl;generation:number;key:string};
type NativeCatalogEntry={key:string;created:number;value?:Catalog;pending?:Promise<Catalog>};
const nativeCatalogEntries=new Map<string,NativeCatalogEntry>();
async function catalogStamp(userId:string):Promise<NativeCatalogStamp|null>{
 const row=await nativeDb().prepare("SELECT c.*, g.generation AS catalog_generation FROM idol_storage_control c LEFT JOIN idol_catalog_state g ON g.user_id = c.owner_id WHERE c.id = 'main'").first<StorageControl&{catalog_generation:number|null}>();
 if(row&&row.owner_id!==userId)throw new AppError('OWNER_ONLY','此资料仅供所有者使用。',403);
 if(!row||!(row.mode==='native'||row.mode==='frozen'&&!!row.active_snapshot))return null;
 if(!Number.isSafeInteger(row.catalog_generation)||row.catalog_generation===null||row.catalog_generation<0)throw new AppError('NATIVE_DATA_MISSING','资料暂时无法读取，请稍后重试。',503);
 return {state:row,generation:row.catalog_generation,key:JSON.stringify([userId,row.mode,row.epoch,row.active_snapshot,row.catalog_generation])};
}
function catalogTiming(result:'hit'|'miss'|'joined',started:number){console.info(JSON.stringify({event:'idol_native_catalog',result,elapsedMs:Math.max(0,Date.now()-started)}));}
export async function readNativeCatalog(userId:string,force=false,retry=0):Promise<Catalog|null>{
 const started=Date.now(),before=await catalogStamp(userId);if(!before){nativeCatalogEntries.delete(userId);return null;}
 let entry=nativeCatalogEntries.get(userId),result:'hit'|'miss'|'joined'='miss';
 if(!force&&entry?.key===before.key&&Date.now()-entry.created<NATIVE_CATALOG_TTL){result=entry.value?'hit':'joined';}
 else{
  entry={key:before.key,created:Date.now()};nativeCatalogEntries.delete(userId);nativeCatalogEntries.set(userId,entry);
  while(nativeCatalogEntries.size>MAX_NATIVE_OWNERS)nativeCatalogEntries.delete(nativeCatalogEntries.keys().next().value!);
  const current=entry;
  current.pending=(async()=>{
   const snapshot=await nativeDb().prepare('SELECT captured_at FROM idol_native_snapshots WHERE id = ? AND owner_id = ?').bind(before.state.active_snapshot,userId).first<{captured_at:string}>();
   if(!snapshot)throw new AppError('NATIVE_DATA_MISSING','资料暂时无法读取，请稍后重试。',503);
   const tables=await nativeTables(before.state.active_snapshot!);
   const value:Catalog={...await withSocialFacts(withGroupMilestones(withVerifiedVersionDisplay(projectCatalog(tables,'live',new Date().toISOString()),tables)),tables),cache:{source:'live',refreshRecommended:false}};
   const after=await catalogStamp(userId);
   if(!after||after.key!==before.key)throw new AppError('CATALOG_SUPERSEDED','资料刚刚更新，请重新读取。',409);
   // A newer force read may replace even an identical generation. Old promises
   // must not clear, publish over, or be returned instead of that newer entry.
   if(nativeCatalogEntries.get(userId)===current){current.value=value;current.pending=undefined;}
   return value;
  })();
 }
 const selected=entry!;
 try{
  const value=selected.value??await selected.pending!;
  const after=await catalogStamp(userId);
  if(!after||after.key!==before.key||nativeCatalogEntries.get(userId)!==selected){
   if(retry<1)return readNativeCatalog(userId,false,retry+1);
   throw new AppError('STORAGE_CHANGING','资料刚刚更新，请重新读取，输入已保留。',409);
  }
  catalogTiming(result,started);return value;
 }catch(error){
  if(nativeCatalogEntries.get(userId)===selected)nativeCatalogEntries.delete(userId);
  if(error instanceof AppError&&error.code==='CATALOG_SUPERSEDED'&&retry<1)return readNativeCatalog(userId,false,retry+1);
  throw error;
 }
}
export async function readNativeDetail(userId:string,table:TableKey,id:string){const state=await activeNative(userId);if(!state)return null;const fields=await nativeSchema(state.active_snapshot!,table),row=await nativeRow(state.active_snapshot!,table,id),record={record_id:id,fields:namedFields(JSON.parse(row.fields_json),fields)};return {table,recordId:id,mode:'live',pendingSave:null,revision:row.revision,values:editableValues(table,record,fields),watchedOptions:table==='works'?(fields.find(f=>f.field_id===F.works.watched)?.property?.options??[]).map(o=>o.name):[]};}
export async function readNativeMedia(userId:string,table:TableKey,id:string,index:number){const state=await activeNative(userId);if(!state)return null;if(table!=='members'&&table!=='ratings')throw new AppError('INVALID_MEDIA','图片类型无效。',400);const row=await nativeRow(state.active_snapshot!,table,id),raw=JSON.parse(row.fields_json),attachments=raw[table==='members'?F.members.photo:F.ratings.photo],token=Array.isArray(attachments)?attachments[index]?.file_token:null;if(typeof token!=='string')throw new AppError('MISSING_MEDIA','暂无这张照片。',404);const photo=await nativeDb().prepare("SELECT object_key,content_type,byte_length FROM idol_native_media WHERE snapshot_id = ? AND file_token = ? AND status = 'complete'").bind(state.active_snapshot,token).first<{object_key:string;content_type:string;byte_length:number}>();if(!photo||!env.BUCKET)throw new AppError('MISSING_MEDIA','照片暂时无法读取。',404);const object=await env.BUCKET.get(photo.object_key);if(!object||object.size!==photo.byte_length)throw new AppError('MEDIA_UNAVAILABLE','照片暂时无法读取。',503);return new Response(object.body,{headers:{'Content-Type':photo.content_type,'Content-Length':String(photo.byte_length),'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});}
