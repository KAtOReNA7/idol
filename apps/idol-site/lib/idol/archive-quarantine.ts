import {env} from 'cloudflare:workers';
import {AppError} from './feishu';
import {nativeDb} from './native-storage';
import {hash} from './hash';
import {sourcePartKey,advancePagedRead,type PagedRead,type SourcePart} from './cutover-pages';
export type Quarantine={id:string;run_id:string;owner_id:string;candidate_id:string;old_operation_id:string;old_created_at:number;old_epoch:number;resume_epoch:number;manifest_json:string;object_key:string;reserve_bytes:number;evidence_json:string;status:string;created_at:number};
export async function quarantines(){return(await nativeDb().prepare('SELECT * FROM idol_archive_quarantine ORDER BY id').all<Quarantine>()).results;}
async function boundedInflate(b:Uint8Array){const reader=new Blob([new Uint8Array(b)]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),parts:Uint8Array[]=[];let size=0;try{for(;;){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>12000000)throw Error('page output too large');parts.push(r.value);}}finally{await reader.cancel();}const raw=new Uint8Array(size);let i=0;for(const part of parts){raw.set(part,i);i+=part.length;}return raw;}
// The abandoned writer is already known terminated. Its only possible late
// effect is this one create-only key. Never include it in the general LIST sum.
export async function quarantineCharge(q:Quarantine){
 if(!env.BUCKET)throw new AppError('FILES_NOT_READY','照片存储暂不可用。',503);
 try{
  const m=JSON.parse(q.manifest_json),e=JSON.parse(q.evidence_json),r=m.pagedRead as PagedRead;
  if(q.status!=='isolated-unconfirmed'||!Number.isSafeInteger(q.reserve_bytes)||q.reserve_bytes<1||q.reserve_bytes>48000000||e.oldJsTerminated!==true||e.onlyOneCreateOnlyPagePut!==true||e.manifestHash!==await hash(m)||e.pageKeyHash!==await hash(q.object_key)||q.object_key!==sourcePartKey(r)||r.ownerId!==q.owner_id||r.candidateId!==q.candidate_id||r.sourceRunId!==q.run_id||r.epoch!==q.old_epoch)throw Error('invalid isolation binding');
  const o=await env.BUCKET.get(q.object_key);if(!o)return{bytes:q.reserve_bytes,kind:'reserved' as const};
  if(!Number.isSafeInteger(o.size)||o.size<1||o.size>q.reserve_bytes)throw Error('isolated object too large');
  const bytes=new Uint8Array(await o.arrayBuffer());if(bytes.length!==o.size)throw Error('short isolated object');
  const raw=await boundedInflate(bytes),p=JSON.parse(new TextDecoder().decode(raw)) as SourcePart;
  advancePagedRead(r,p,{key:q.object_key,sha256:'',byteLength:bytes.length,rawByteLength:raw.length});
  return{bytes:bytes.length,kind:'observed-object' as const};
 }catch{throw new AppError('MIGRATION_QUARANTINE_UNCONFIRMED','隔离检查点容量尚未确认，已停止继续。',409);}
}
export async function archiveObjectBytes(provisional:Quarantine[]=[]){
 if(!env.BUCKET)throw new AppError('FILES_NOT_READY','照片存储暂不可用。',503);
 const rows=[...await quarantines(),...provisional],excluded=new Set(rows.map(q=>q.object_key));if(excluded.size!==rows.length)throw new AppError('MIGRATION_QUARANTINE_UNCONFIRMED','隔离检查点存在重复计量。',409);
 let bytes=0,cursor:string|undefined;do{const list=await env.BUCKET.list({prefix:'archives/',cursor,limit:1000});for(const o of list.objects)if(!excluded.has(o.key)){if(!Number.isSafeInteger(o.size)||o.size<0)throw new AppError('MIGRATION_BUDGET_UNKNOWN','备份容量未能确认。',409);bytes+=o.size;}cursor=list.truncated?list.cursor:undefined;}while(cursor);
 for(const q of rows)bytes+=(await quarantineCharge(q)).bytes;
 if(!Number.isSafeInteger(bytes))throw new AppError('MIGRATION_BUDGET_UNKNOWN','备份容量未能确认。',409);return bytes;
}
// Legacy photo-stage accounting did not enumerate page archives. After any
// isolation it must use the same complete total including the late-write reserve.
export async function archiveOtherObjectBytes(fallback:number){return(await quarantines()).length?archiveObjectBytes():fallback;}
