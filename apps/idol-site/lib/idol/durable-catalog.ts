import {env} from 'cloudflare:workers';
import {getCatalogSnapshot,projectCatalog,type Tables} from './catalog';
import {AppError,configured} from './feishu';
import type {Catalog} from './types';
const TTL=5*60*1000,PART_CHARS=450000,MAX_PARTS=64,MAX_JSON_BYTES=24*1024*1024;
type State={generation:number;snapshot_id:string|null;checksum:string|null;part_count:number|null;captured_at:string|null};
type Payload={formatVersion:1;capturedAt:string;tables:Tables};
function db(){if(!env.DB)throw new AppError('STORAGE_NOT_READY','最近读取缓存暂不可用，请稍后重新读取。',503);return env.DB;}
async function ensure(userId:string){await db().prepare('INSERT OR IGNORE INTO idol_catalog_state (user_id,generation) VALUES (?,0)').bind(userId).run();}
async function state(userId:string){return db().prepare('SELECT generation,snapshot_id,checksum,part_count,captured_at FROM idol_catalog_state WHERE user_id = ?').bind(userId).first<State>();}
async function checksum(bytes:Uint8Array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function b64(bytes:Uint8Array){let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);}
function bytes64(text:string){const value=atob(text);return Uint8Array.from(value,c=>c.charCodeAt(0));}
export async function encodeCatalogSnapshot(payload:Payload){const json=JSON.stringify(payload);if(new TextEncoder().encode(json).byteLength>MAX_JSON_BYTES)throw new Error('Catalog snapshot exceeds bounded cache size');const compressed=new Uint8Array(await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());const encoded=b64(compressed);const parts=[];for(let i=0;i<encoded.length;i+=PART_CHARS)parts.push(encoded.slice(i,i+PART_CHARS));if(parts.length>MAX_PARTS)throw new Error('Catalog snapshot exceeds bounded cache part count');return {parts,checksum:await checksum(compressed)};}
export async function readDurableSnapshot(userId:string):Promise<Payload|null>{
 const before=await state(userId);if(!before?.snapshot_id||!before.checksum||!before.part_count||before.part_count>MAX_PARTS)return null;
 const rows=await db().prepare('SELECT part_index,payload FROM idol_catalog_parts WHERE user_id = ? AND snapshot_id = ? ORDER BY part_index').bind(userId,before.snapshot_id).all<{part_index:number;payload:string}>();
 if(rows.results.length!==before.part_count||rows.results.some((r,i)=>r.part_index!==i||r.payload.length>PART_CHARS))return null;
 try{
  const bytes=bytes64(rows.results.map(r=>r.payload).join(''));if(await checksum(bytes)!==before.checksum)return null;
  const response=new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
  const buffer=await response.arrayBuffer();if(buffer.byteLength>MAX_JSON_BYTES)return null;
  const payload=JSON.parse(new TextDecoder().decode(buffer)) as Payload;
  if(payload.formatVersion!==1||payload.capturedAt!==before.captured_at||!Number.isFinite(Date.parse(payload.capturedAt))||['groups','members','works','ratings'].some(k=>!Array.isArray(payload.tables?.[k as keyof Tables]?.records)))return null;
  // A save or another completed refresh must not return the previous snapshot.
  const after=await state(userId);if(!after||after.generation!==before.generation||after.snapshot_id!==before.snapshot_id)return null;
  return payload;
 }catch{return null;}
}
export async function invalidateDurableCatalog(userId:string){await ensure(userId);await db().prepare('UPDATE idol_catalog_state SET generation = generation + 1,snapshot_id = NULL,checksum = NULL,part_count = NULL,captured_at = NULL WHERE user_id = ?').bind(userId).run();refreshes.delete(userId);}
export async function beginCatalogRefresh(userId:string){await ensure(userId);const row=await db().prepare('UPDATE idol_catalog_state SET generation = generation + 1 WHERE user_id = ? RETURNING generation').bind(userId).first<{generation:number}>();if(!row)throw new Error('Missing catalog state');return row.generation;}
export async function publishCatalogSnapshot(userId:string,generation:number,payload:Payload,sourceEpoch?:number){
 const encoded=await encodeCatalogSnapshot(payload),snapshotId=crypto.randomUUID(),now=Date.now();
 // Parts and pointer are one transaction. Readers only accept the exact pointer,
 // complete ordered parts and checksum. A late refresh cannot cross a save epoch.
 const statements=encoded.parts.map((part,index)=>db().prepare('INSERT INTO idol_catalog_parts (id,user_id,snapshot_id,part_index,payload,created_at) VALUES (?,?,?,?,?,?)').bind(`${userId}:${snapshotId}:${index}`,userId,snapshotId,index,part,now));
 const sourceCondition=sourceEpoch===undefined?'':" AND NOT EXISTS (SELECT 1 FROM idol_storage_control WHERE id='main' AND (owner_id<>? OR mode<>'feishu' OR epoch<>?))";
 statements.push(db().prepare('UPDATE idol_catalog_state SET snapshot_id = ?,checksum = ?,part_count = ?,captured_at = ? WHERE user_id = ? AND generation = ?'+sourceCondition+' RETURNING snapshot_id').bind(snapshotId,encoded.checksum,encoded.parts.length,payload.capturedAt,userId,generation,...(sourceEpoch===undefined?[]:[userId,sourceEpoch])));
 const results=await db().batch(statements);const published=!!results.at(-1)?.results?.length;
 if(!published){await db().prepare('DELETE FROM idol_catalog_parts WHERE user_id = ? AND snapshot_id = ?').bind(userId,snapshotId).run();return false;}
 // Reclaim only old cache generations. These are expendable derived read copies,
 // never the user's records or the save journal. Keep concurrent recent writers.
 try{await db().prepare('DELETE FROM idol_catalog_parts WHERE user_id = ? AND created_at < ? AND snapshot_id NOT IN (SELECT snapshot_id FROM idol_catalog_state WHERE user_id = ? AND snapshot_id IS NOT NULL)').bind(userId,now-10*60*1000,userId).run();}catch{/* cleanup never changes a successful read */}
 return true;
}
const refreshes=new Map<string,Promise<Catalog>>();
export async function getReadableCatalog(userId:string,force=false):Promise<Catalog>{
 const source=await db().prepare("SELECT owner_id,mode,epoch,active_snapshot FROM idol_storage_control WHERE id='main'").first<{owner_id:string;mode:string;epoch:number;active_snapshot:string|null}>();if(source&&(source.owner_id!==userId||source.mode!=='feishu'&&!(source.mode==='frozen'&&!source.active_snapshot)))throw new AppError('STORAGE_CHANGING','资料刚刚更新，请重新读取。',409);
 if(!configured())return (await getCatalogSnapshot()).catalog;
 // Frozen pre-cutover readers may browse Feishu; never publish a new cache.
 if(source?.mode==='frozen')return (await getCatalogSnapshot(force)).catalog;
 if(!force){const saved=await readDurableSnapshot(userId);if(saved)return {...projectCatalog(saved.tables,'live',saved.capturedAt),cache:{source:'persistent',refreshRecommended:Date.now()-Date.parse(saved.capturedAt)>TTL}};}
 // Repeated concurrent UI reads in this isolate share a refresh. Cross-isolate
 // commits are guarded by D1 generation CAS, not this in-memory map.
 const existing=refreshes.get(userId);if(existing)return existing;
 const promise=(async()=>{
  const generation=await beginCatalogRefresh(userId);const result=await getCatalogSnapshot(true);
  if(result.catalog.mode!=='live')return result.catalog;
  const published=await publishCatalogSnapshot(userId,generation,{formatVersion:1,capturedAt:result.capturedAt,tables:result.tables},source?.epoch??0);
  if(!published)throw new AppError('REFRESH_SUPERSEDED','这次读取已被较新的刷新或保存替代，请保留当前页面并重新读取。',409);
  return {...result.catalog,cache:{source:'live' as const,refreshRecommended:false}};
 })();refreshes.set(userId,promise);try{return await promise;}finally{if(refreshes.get(userId)===promise)refreshes.delete(userId);}
}
