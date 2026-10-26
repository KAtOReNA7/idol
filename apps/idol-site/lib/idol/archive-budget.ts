import {AppError} from './feishu';
import {nativeDb} from './native-storage';
// Whole migration <=1.3 GB: photos get <=1.27 GB, with 30 MB reserved
// for JSON archives, shadow rows, manifests and phase checkpoints.
// Each continuation grants <=90 MB of photos, leaving >=10 MB headroom
// below the approved 100 MB stage ceiling for non-photo bookkeeping.
export const ARCHIVE_LIMITS={maxTotalBytes:1300000000,maxPhotoBytes:1270000000,phasePhotoBytes:90000000,phaseTotalBytes:100000000,otherBytesReserve:30000000};
export type ArchivePhase={id:string;run_id:string;phase:number;photo_bytes_limit:number;photo_count_limit:number;start_photo_bytes:number;start_photo_count:number;start_other_bytes:number;report_json:string;created_at:number};
export async function currentArchiveBudget(id:string){return nativeDb().prepare('SELECT * FROM idol_archive_phases WHERE run_id = ? ORDER BY phase DESC LIMIT 1').bind(id).first<ArchivePhase>();}
// Account for migration-owned D1 UTF-8 payload plus a conservative per-row
// allowance. Source journal/cache rows predate migration and are not duplicated.
export async function archiveD1Bytes(){
 const columns:Record<string,string[]>={
 idol_archive_quarantine:['id','run_id','owner_id','candidate_id','old_operation_id','old_created_at','old_epoch','resume_epoch','manifest_json','object_key','reserve_bytes','evidence_json','status','created_at'],
 idol_archive_phases:['id','run_id','phase','photo_bytes_limit','photo_count_limit','start_photo_bytes','start_photo_count','start_other_bytes','report_json','created_at'],
 idol_archive_runs:['id','owner_id','status','snapshot_id','backup_key','cursor','restore_report_json','created_at','updated_at'],
 idol_native_snapshots:['id','owner_id','status','captured_at','data_hash','manifest_json','created_at'],
 idol_native_fields:['key','snapshot_id','table_key','fields_json'],
 idol_native_media:['key','snapshot_id','file_token','status','object_key','sha256','byte_length','content_type','error','updated_at'],
 idol_native_records:['key','snapshot_id','table_key','record_id','fields_json','revision','version','updated_at'],
 idol_storage_control:['id','owner_id','mode','epoch','active_snapshot','run_id','updated_at'],
 idol_archive_step_locks:['id','operation_id','created_at'],
 };
 // Fixed single-table reads avoid relying on compound-query response behavior.
 // Keep the exact UTF-8 payload + per-row allowance, and fail closed on any
 // missing/malformed measurement instead of silently treating it as zero.
 let total=0;
 for(const [table,fields] of Object.entries(columns)){
  const sql=`SELECT coalesce(sum(length(CAST(${fields.map(f=>`coalesce(${f},'')`).join(' || ')} AS BLOB))+1024),0) AS n FROM ${table}`;
  const row=await nativeDb().prepare(sql).first<{n:number}>();
  if(!row||!Number.isSafeInteger(row.n)||row.n<0||!Number.isSafeInteger(total+row.n))throw new AppError('ARCHIVE_BUDGET_UNAVAILABLE','备份容量暂时未能核对，已停止传输。',503);
  total+=row.n;
 }
 return total;
}
export async function withArchiveStepLock<T>(id:string,work:()=>Promise<T>,failClosed=false):Promise<T>{
 const db=nativeDb(),op=crypto.randomUUID();
 await db.prepare('INSERT OR IGNORE INTO idol_archive_step_locks (id,operation_id,created_at) VALUES (?,?,?)').bind(id,op,Date.now()).run();
 const lock=await db.prepare('SELECT operation_id FROM idol_archive_step_locks WHERE id=?').bind(id).first<{operation_id:string}>();
 if(lock?.operation_id!==op)throw new AppError('ARCHIVE_BUSY','上一项传输尚未确认，请先读取进度，不要重复启动。',409);
 // No automatic expiry/lock stealing: an interrupted unknown write fails closed.
 let completed=false;try{const value=await work();completed=true;return value;}finally{if(completed||!failClosed)await db.prepare('DELETE FROM idol_archive_step_locks WHERE id=? AND operation_id=?').bind(id,op).run();}
}
