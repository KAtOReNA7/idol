import {withVerifiedVersionDisplay} from './verified-version-display';
import {withGroupMilestones} from './group-milestones';
import {withSocialFacts} from './social-facts';
import {env} from 'cloudflare:workers';
import {AppError,type TableKey} from './feishu';
import {activeNative,nativeDb,nativeRow,nativeSchema,nativeTables,sourceStamp,type StorageControl,type NativeTableStep} from './native-storage';
import type {Catalog} from './types';
import {namedFields} from './native-format';
import {editableValues} from './live';
import {projectCatalog} from './catalog';
import {F} from './fields';
// Private per-isolate read-through cache. All writes retain their existing D1
// transactions; generation is incremented atomically alongside committed changes.
// This does not persist private data in browser storage or share it across owners.
const NATIVE_CATALOG_TTL=5*60*1000,MAX_NATIVE_OWNERS=4;
type NativeSource={native:true;state:StorageControl;key:string};
type LegacySource={native:false;state:StorageControl|null};
type CatalogReadKind='hit'|'miss'|'joined';
type ColdReadStep='snapshot'|'tables'|NativeTableStep|'catalog-project'|'social-facts'|'cache-generation';
type NativeCatalogEntry={key:string;created:number;step:ColdReadStep;value?:Catalog;pending?:Promise<Catalog>};
export type NativeCatalogTrace={step?:'source-generation'|ColdReadStep|'response-generation';cache?:CatalogReadKind};
const nativeCatalogEntries=new Map<string,NativeCatalogEntry>();

async function catalogSource(userId:string):Promise<NativeSource|LegacySource>{
 const row=await nativeDb().prepare("SELECT c.*, g.generation AS catalog_generation FROM idol_storage_control c LEFT JOIN idol_catalog_state g ON g.user_id = c.owner_id WHERE c.id = 'main'").first<StorageControl&{catalog_generation:number|null}>();
 if(row&&row.owner_id!==userId)throw new AppError('OWNER_ONLY','此资料仅供所有者使用。',403);
 if(!row||!(row.mode==='native'||row.mode==='frozen'&&!!row.active_snapshot))return {native:false,state:row};
 if(!Number.isSafeInteger(row.catalog_generation)||row.catalog_generation===null||row.catalog_generation<0)throw new AppError('NATIVE_DATA_MISSING','资料暂时无法读取，请稍后重试。',503);
 return {native:true,state:row,key:JSON.stringify([userId,row.mode,row.epoch,row.active_snapshot,row.catalog_generation])};
}
function catalogTiming(result:CatalogReadKind,started:number){console.info(JSON.stringify({event:'idol_native_catalog',result,elapsedMs:Math.max(0,Date.now()-started)}));}

function selectCatalogEntry(userId:string,before:NativeSource,force:boolean):{entry:NativeCatalogEntry;result:CatalogReadKind}{
 const prior=nativeCatalogEntries.get(userId);
 if(!force&&prior?.key===before.key&&Date.now()-prior.created<NATIVE_CATALOG_TTL){
  return {entry:prior,result:prior.value?'hit':'joined'};
 }
 const entry:NativeCatalogEntry={key:before.key,created:Date.now(),step:'snapshot'};
 nativeCatalogEntries.delete(userId);
 nativeCatalogEntries.set(userId,entry);
 while(nativeCatalogEntries.size>MAX_NATIVE_OWNERS)nativeCatalogEntries.delete(nativeCatalogEntries.keys().next().value!);
 entry.pending=(async()=>{
  const snapshot=await nativeDb().prepare('SELECT captured_at FROM idol_native_snapshots WHERE id = ? AND owner_id = ?').bind(before.state.active_snapshot,userId).first<{captured_at:string}>();
  if(!snapshot)throw new AppError('NATIVE_DATA_MISSING','资料暂时无法读取，请稍后重试。',503);
  entry.step='tables';
  const tables=await nativeTables(before.state.active_snapshot!,step=>{entry.step=step;});
  entry.step='catalog-project';
  const catalog=withGroupMilestones(withVerifiedVersionDisplay(projectCatalog(tables,'live',new Date().toISOString()),tables));
  entry.step='social-facts';
  const value:Catalog={...await withSocialFacts(catalog,tables),cache:{source:'live',refreshRecommended:false}};
  entry.step='cache-generation';
  const after=await catalogSource(userId);
  if(!after.native||after.key!==before.key)throw new AppError('CATALOG_SUPERSEDED','资料刚刚更新，请重新读取。',409);
  if(nativeCatalogEntries.get(userId)===entry){entry.value=value;entry.pending=undefined;}
  return value;
 })();
 return {entry,result:'miss'};
}

export async function withNativeCatalog<T>(userId:string,force:boolean,read:(catalog:Catalog,control:StorageControl)=>T|Promise<T>,trace?:NativeCatalogTrace):Promise<{native:true;value:T}|{native:false;state:StorageControl|null}>{
 if(trace){trace.step='source-generation';delete trace.cache;}
 const started=Date.now(),initial=await catalogSource(userId);
 if(!initial.native){nativeCatalogEntries.delete(userId);return initial;}
 let before=initial;
 for(let attempt=0;attempt<2;attempt++){
  const {entry,result}=selectCatalogEntry(userId,before,force&&attempt===0);
  if(trace)trace.cache=result;
  let catalog:Catalog|null=null;
  try{
   catalog=entry.value??await entry.pending!;
  }catch(error){
   // Joiners observe the operation that failed in the shared cold read.
   if(trace)trace.step=entry.step;
   if(nativeCatalogEntries.get(userId)===entry)nativeCatalogEntries.delete(userId);
   if(!(error instanceof AppError&&error.code==='CATALOG_SUPERSEDED'&&attempt===0))throw error;
  }
  // This read belongs to the request. The shared entry never contains private rating rows or its response.
  const selection=catalog?{value:await read(catalog,before.state)}:null;
  if(trace)trace.step='response-generation';
  const after=await catalogSource(userId);
  if(!after.native||sourceStamp(after.state)!==sourceStamp(initial.state))break;
  if(selection&&after.key===before.key&&nativeCatalogEntries.get(userId)===entry){
   catalogTiming(result,started);
   return {native:true,value:selection.value};
  }
  before=after;
 }
 throw new AppError('STORAGE_CHANGING','资料刚刚更新，请重新读取，输入已保留。',409);
}

export async function readNativeCatalog(userId:string,force=false):Promise<Catalog|null>{
 const read=await withNativeCatalog(userId,force,catalog=>catalog);
 return read.native?read.value:null;
}
export async function readNativeDetail(userId:string,table:TableKey,id:string){const state=await activeNative(userId);if(!state)return null;const fields=await nativeSchema(state.active_snapshot!,table),row=await nativeRow(state.active_snapshot!,table,id),record={record_id:id,fields:namedFields(JSON.parse(row.fields_json),fields)};return {table,recordId:id,mode:'live',pendingSave:null,revision:row.revision,values:editableValues(table,record,fields),watchedOptions:table==='works'?(fields.find(f=>f.field_id===F.works.watched)?.property?.options??[]).map(o=>o.name):[]};}
export async function readNativeMedia(userId:string,table:TableKey,id:string,index:number){const state=await activeNative(userId);if(!state)return null;if(table!=='members'&&table!=='ratings')throw new AppError('INVALID_MEDIA','图片类型无效。',400);const row=await nativeRow(state.active_snapshot!,table,id),raw=JSON.parse(row.fields_json),attachments=raw[table==='members'?F.members.photo:F.ratings.photo],token=Array.isArray(attachments)?attachments[index]?.file_token:null;if(typeof token!=='string')throw new AppError('MISSING_MEDIA','暂无这张照片。',404);const photo=await nativeDb().prepare("SELECT object_key,content_type,byte_length FROM idol_native_media WHERE snapshot_id = ? AND file_token = ? AND status = 'complete'").bind(state.active_snapshot,token).first<{object_key:string;content_type:string;byte_length:number}>();if(!photo||!env.BUCKET)throw new AppError('MISSING_MEDIA','照片暂时无法读取。',404);const object=await env.BUCKET.get(photo.object_key);if(!object||object.size!==photo.byte_length)throw new AppError('MEDIA_UNAVAILABLE','照片暂时无法读取。',503);return new Response(object.body,{headers:{'Content-Type':photo.content_type,'Content-Length':String(photo.byte_length),'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});}
