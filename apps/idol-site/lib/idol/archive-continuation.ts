import {archiveOtherObjectBytes} from './archive-quarantine';
import {env} from 'cloudflare:workers';
import {AppError} from './feishu';
import {nativeDb,ownControl} from './native-storage';
import {getArchiveRun,archiveStatus} from './archive-transfer';
import {backupManifest} from './archive-backup';
import {currentArchiveBudget,ARCHIVE_LIMITS,archiveD1Bytes,withArchiveStepLock} from './archive-budget';
import {hash} from './hash';
export async function continueArchive(userId:string,id:string,operationId:string,report:unknown){await getArchiveRun(userId,id);return withArchiveStepLock(id,()=>continueArchiveLocked(userId,id,operationId,report));}
async function continueArchiveLocked(userId:string,id:string,operationId:string,report:unknown){
 let diagnosticStage='read-run';
 try{
 const run=await getArchiveRun(userId,id),db=nativeDb();
 if(!/^[a-f0-9-]{36}$/.test(operationId))throw new AppError('INVALID_ARCHIVE_ID','续传标识无效。',400);
 diagnosticStage='read-grant';
 const existing=await db.prepare('SELECT run_id,report_json FROM idol_archive_phases WHERE id = ?').bind(operationId).first<{run_id:string;report_json:string}>();
 if(existing){if(existing.run_id!==id||await hash(JSON.parse(existing.report_json))!==await hash(report))throw new AppError('IDEMPOTENCY_CONFLICT','同一次续传参数不同，未增加容量。',409);return archiveStatus(userId,id);}
 if(run.status!=='pilot-ready')throw new AppError('ARCHIVE_STATE','本阶段还未完成，请先检查当前进度。',409);
 diagnosticStage='read-control';
 const control=await ownControl(userId);if(control?.mode!=='feishu')throw new AppError('ARCHIVE_STATE','本次迁移只能在原资料仍为主来源时继续。',409);
 diagnosticStage='read-unresolved';
 const unresolved=await db.prepare("SELECT count(*) n FROM idol_native_media WHERE snapshot_id = ? AND status IN ('error','reserved')").bind(run.snapshot_id).first<{n:number}>();
 if(unresolved?.n)throw new AppError('PHOTO_UNRESOLVED','有照片尚未核对，未开放下一阶段。',409);
 diagnosticStage='read-manifest';
 const manifest=await backupManifest(userId,id),r=report as Record<string,unknown>,summary=JSON.parse((await db.prepare('SELECT manifest_json FROM idol_native_snapshots WHERE id = ?').bind(run.snapshot_id).first<{manifest_json:string}>())!.manifest_json);
 diagnosticStage='validate-report';
 const photoBytes=manifest.photos.reduce((n,p)=>n+p.byteLength,0),recordCount=Object.values(summary.counts as Record<string,number>).reduce((a,b)=>a+b,0);
 if(!r||typeof r!=='object'||r.formatVersion!=='idol.pilot-restore-report.v1'||r.completeBackup!==false||r.archiveId!==id||r.manifestHash!==manifest.manifestHash||r.dataSha256!==manifest.data.sha256||r.restoredRecords!==recordCount||r.journalRows!==summary.journalCount||r.photoTokens!==manifest.photos.length||r.photoBytes!==photoBytes||r.decodedUniqueImages!==new Set(manifest.photos.map(p=>p.sha256)).size||r.fieldMismatches!==0||r.photoFailures!==0||r.sqliteIntegrity!=='ok'||r.sourceNetworkUsed!==false||!Number.isFinite(Date.parse(String(r.verifiedAt))))throw new AppError('RESTORE_CHECK_REQUIRED','请先完成本阶段独立下载、图片解码和资料恢复核对。',409);
 diagnosticStage='read-previous-phase';
 const previous=await currentArchiveBudget(id),phase=(previous?.phase??0)+1;
 if(previous&&JSON.parse(previous.report_json).manifestHash===manifest.manifestHash)throw new AppError('MIGRATION_NO_PROGRESS','这一阶段没有新增可验证照片，已停止增加阶段。',409);
 diagnosticStage='read-data-size';
 const dataHead=await env.BUCKET?.head(run.backup_key);
 diagnosticStage='measure-budget';
 const otherBytes=await archiveOtherObjectBytes(dataHead?.size??0)+await archiveD1Bytes();if(!dataHead||otherBytes+2*new TextEncoder().encode(JSON.stringify(report)).length+4000>ARCHIVE_LIMITS.otherBytesReserve)throw new AppError('MIGRATION_LIMIT','非照片资料已达到本轮容量边界，已停止。',409);
 const cap=Math.min(ARCHIVE_LIMITS.maxPhotoBytes,photoBytes+ARCHIVE_LIMITS.phasePhotoBytes);
 if(cap<=photoBytes)throw new AppError('MIGRATION_LIMIT','已达到本轮批准的总容量，请先核对。',409);
 diagnosticStage='commit-grant';
 await db.batch([
 db.prepare(`INSERT INTO idol_archive_phases (id,run_id,phase,photo_bytes_limit,photo_count_limit,start_photo_bytes,start_photo_count,start_other_bytes,report_json,created_at)
 SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM idol_archive_runs WHERE id=? AND owner_id=? AND status='pilot-ready')
 AND coalesce((SELECT max(phase) FROM idol_archive_phases WHERE run_id=?),0)=?`).bind(operationId,id,phase,cap,10000,photoBytes,manifest.photos.length,otherBytes,JSON.stringify(report),Date.now(),id,userId,id,phase-1),
 db.prepare("UPDATE idol_archive_runs SET status='photos',restore_report_json=?,updated_at=? WHERE id=? AND owner_id=? AND status='pilot-ready' AND EXISTS (SELECT 1 FROM idol_archive_phases WHERE id=? AND run_id=?)").bind(JSON.stringify(report),Date.now(),id,userId,operationId,id),
 ]);
 diagnosticStage='verify-grant';
 const grant=await db.prepare('SELECT id,report_json FROM idol_archive_phases WHERE id=? AND run_id=?').bind(operationId,id).first<{id:string;report_json:string}>();
 if(!grant)throw new AppError('ARCHIVE_CHANGED','阶段已变化，请重新读取，未重复增加容量。',409);
 if(await hash(JSON.parse(grant.report_json))!==await hash(report))throw new AppError('IDEMPOTENCY_CONFLICT','重复续传报告不同，未增加容量。',409);
 diagnosticStage='read-status';
 return await archiveStatus(userId,id);
 }catch(error){
  if(error instanceof AppError)throw error;
  // Static operation names only: never include upstream messages, SQL, notes or credentials.
  throw new AppError('ARCHIVE_STEP_FAILED',`备份步骤暂时未完成（${diagnosticStage}），请先核对进度。`,502);
 }
}
