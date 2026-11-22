import {withVerifiedVersionDisplay} from './verified-version-display';
import {withGroupMilestones} from './group-milestones';
import {withSocialFacts} from './social-facts';
import {env} from 'cloudflare:workers';
import {AppError,type TableKey} from './feishu';
import {activeNative,nativeDb,nativeRow,nativeTables,sourceStamp,type StorageControl,type NativeTableStep} from './native-storage';
import type {Catalog} from './types';
import {namedFields,nativeKey} from './native-format';
import {editableValues,type Field} from './live';
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
type ColdReadProgress={step:ColdReadStep};
type ColdRead={progress:ColdReadProgress;pending:Promise<Catalog>};
type NativeCatalogEntry={key:string;created:number;value?:Catalog;reads:WeakMap<Request,ColdRead>};
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

function selectCatalogEntry(userId:string,before:NativeSource,force:boolean):NativeCatalogEntry{
 const prior=nativeCatalogEntries.get(userId);
 if(!force&&prior?.key===before.key&&Date.now()-prior.created<NATIVE_CATALOG_TTL)return prior;
 const entry:NativeCatalogEntry={key:before.key,created:Date.now(),reads:new WeakMap()};
 nativeCatalogEntries.delete(userId);
 nativeCatalogEntries.set(userId,entry);
 while(nativeCatalogEntries.size>MAX_NATIVE_OWNERS)nativeCatalogEntries.delete(nativeCatalogEntries.keys().next().value!);
 return entry;
}

async function loadNativeCatalog(userId:string,before:NativeSource,entry:NativeCatalogEntry,progress:ColdReadProgress):Promise<Catalog>{
 const snapshot=await nativeDb().prepare('SELECT captured_at FROM idol_native_snapshots WHERE id = ? AND owner_id = ?').bind(before.state.active_snapshot,userId).first<{captured_at:string}>();
 if(!snapshot)throw new AppError('NATIVE_DATA_MISSING','资料暂时无法读取，请稍后重试。',503);
 progress.step='tables';
 const tables=await nativeTables(before.state.active_snapshot!,step=>{progress.step=step;});
 progress.step='catalog-project';
 const catalog=withGroupMilestones(withVerifiedVersionDisplay(projectCatalog(tables,'live',new Date().toISOString()),tables));
 progress.step='social-facts';
 const value:Catalog={...await withSocialFacts(catalog,tables),cache:{source:'live',refreshRecommended:false}};
 progress.step='cache-generation';
 const after=await catalogSource(userId);
 if(!after.native||after.key!==before.key)throw new AppError('CATALOG_SUPERSEDED','资料刚刚更新，请重新读取。',409);
 if(nativeCatalogEntries.get(userId)===entry)entry.value??=value;
 return entry.value??value;
}

export async function withNativeCatalog<T>(userId:string,force:boolean,read:(catalog:Catalog,control:StorageControl)=>T|Promise<T>,trace?:NativeCatalogTrace,request?:Request):Promise<{native:true;value:T}|{native:false;state:StorageControl|null}>{
 if(trace){trace.step='source-generation';delete trace.cache;}
 const started=Date.now(),initial=await catalogSource(userId);
 if(!initial.native){nativeCatalogEntries.delete(userId);return initial;}
 let before=initial;
 for(let attempt=0;attempt<2;attempt++){
  const entry=selectCatalogEntry(userId,before,force&&attempt===0);
  let catalog=entry.value;
  let flight=request&&entry.reads.get(request);
  const result:CatalogReadKind=catalog?'hit':flight?'joined':'miss';
  if(trace)trace.cache=result;
  if(catalog===undefined){
   // Workerd may discard unresolved I/O when its HTTP request ends. Only a completed
   // projection can be reused by other requests; calls within one request can share I/O.
   if(!flight){
    const progress:ColdReadProgress={step:'snapshot'};
    flight={progress,pending:loadNativeCatalog(userId,before,entry,progress)};
    if(request)entry.reads.set(request,flight);
   }
   try{
    catalog=await flight.pending;
   }catch(error){
    if(trace)trace.step=flight.progress.step;
    if(!(error instanceof AppError&&error.code==='CATALOG_SUPERSEDED'&&attempt===0))throw error;
   }finally{
    if(request&&entry.reads.get(request)===flight)entry.reads.delete(request);
   }
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

export async function readNativeCatalog(userId:string,force=false,request?:Request):Promise<Catalog|null>{
 const read=await withNativeCatalog(userId,force,catalog=>catalog,undefined,request);
 return read.native?read.value:null;
}
export async function readNativeDetail(userId:string,table:TableKey,id:string){
 const state=await activeNative(userId);
 if(!state)return null;
 const snapshot=state.active_snapshot!;
 const row=await nativeDb().prepare(`
   SELECT f.fields_json AS schema_json,r.fields_json AS record_json,r.revision
   FROM idol_native_fields f LEFT JOIN idol_native_records r ON r.key=?
   WHERE f.key=?
 `).bind(nativeKey(snapshot,table,id),snapshot+':'+table)
   .first<{schema_json:string;record_json:string|null;revision:string|null}>();
 if(!row)throw new AppError('NATIVE_SCHEMA_MISSING','资料格式暂时不可用。',503);
 const fields:Field[]=JSON.parse(row.schema_json);
 if(!/^rec[A-Za-z0-9]+$/.test(id))throw new AppError('INVALID_RECORD','记录无效。',400);
 if(row.record_json===null||row.revision===null)throw new AppError('RECORD_NOT_FOUND','这条资料不存在。',404);
 const record={record_id:id,fields:namedFields(JSON.parse(row.record_json),fields)};
 const options=table==='works'?fields.find(field=>field.field_id===F.works.watched)?.property?.options:[];
 return {table,recordId:id,mode:'live',pendingSave:null,revision:row.revision,
   values:editableValues(table,record,fields),watchedOptions:(options??[]).map(option=>option.name)};
}
export async function readNativeMedia(userId:string,table:TableKey,id:string,index:number){const state=await activeNative(userId);if(!state)return null;if(table!=='members'&&table!=='ratings')throw new AppError('INVALID_MEDIA','图片类型无效。',400);const row=await nativeRow(state.active_snapshot!,table,id),raw=JSON.parse(row.fields_json),attachments=raw[table==='members'?F.members.photo:F.ratings.photo],token=Array.isArray(attachments)?attachments[index]?.file_token:null;if(typeof token!=='string')throw new AppError('MISSING_MEDIA','暂无这张照片。',404);const photo=await nativeDb().prepare("SELECT object_key,content_type,byte_length FROM idol_native_media WHERE snapshot_id = ? AND file_token = ? AND status = 'complete'").bind(state.active_snapshot,token).first<{object_key:string;content_type:string;byte_length:number}>();if(!photo||!env.BUCKET)throw new AppError('MISSING_MEDIA','照片暂时无法读取。',404);const object=await env.BUCKET.get(photo.object_key);if(!object||object.size!==photo.byte_length)throw new AppError('MEDIA_UNAVAILABLE','照片暂时无法读取。',503);return new Response(object.body,{headers:{'Content-Type':photo.content_type,'Content-Length':String(photo.byte_length),'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});}
