import {prepareCutover,prepareCutoverStep,cutoverStatus,preflightCutover,freezeCutover,captureCutover,importCutoverStep,finalBackupManifest,readFinalBackupFile,sealCutover,activateCutover,resumeFeishu,restartCutover} from './cutover';
import {inspectSource,createArchive,stepArchive,archiveStatus,retryArchivePhotos} from './archive-transfer';
import {backupManifest,readBackupFile} from './archive-backup';
import {AppError} from './feishu';
import {continueArchive} from './archive-continuation';
const id={type:'string',pattern:'^[a-f0-9-]{36}$'};
const schema=(properties:Record<string,unknown>,required:string[]=[])=>({type:'object',properties,required,additionalProperties:false});
const hint=(readOnlyHint:boolean)=>({readOnlyHint,destructiveHint:false,idempotentHint:true,openWorldHint:false});
export const siteTools=[
 {name:'idol_cutover_prepare',description:'Prepare one final native shadow only after the same migration run has a complete independently downloaded and restored backup. Owner-only; preserves original Feishu and all ratings. Does not pause saves or activate.',inputSchema:schema({id,sourceRunId:id,report:{type:'object'}},['id','sourceRunId','report']),annotations:hint(false)},
 {name:'idol_cutover_prepare_step',description:'Prepare one bounded migration write: import the existing shadow, then read one bounded fixed-table schema or record page and persist its private checkpoint. Two complete independent stable rounds are required. No source switch, Feishu change, save pause, or rating action.',inputSchema:schema({id},['id']),annotations:hint(false)},
 {name:'idol_cutover_status',description:'Read the exact owner-only cutover state before resuming any uncertain request.',inputSchema:schema({id},['id']),annotations:hint(true)},
 {name:'idol_cutover_preflight',description:'Read-only migration readiness check before any save pause: reads the four authorized Feishu tables twice, verifies stable source, preserved save history and backed photos, and returns counts and hashes only. Does not lock, store, freeze, activate or change any data.',inputSchema:schema({id},['id']),annotations:hint(true)},
 {name:'idol_cutover_freeze',description:'Briefly pause new Site saves for the agreed final reconciliation window. Requires the owner to have been notified in advance. Blocks unresolved user saves. Never deletes source data.',inputSchema:schema({id},['id']),annotations:hint(false)},
 {name:'idol_cutover_capture',description:'With the exact frozen lease, read one bounded fixed-table schema or record page per call. Archive one complete frozen snapshot for independent restore; activation must then reread every table and compare contents and original order before switching. Refuses changing data or unbacked new photos; never writes Feishu.',inputSchema:schema({id},['id']),annotations:hint(false)},
 {name:'idol_cutover_import_step',description:'Apply a bounded, conditional final delta to the pre-existing native shadow while saves are paused. All record IDs and original fields are preserved.',inputSchema:schema({id},['id']),annotations:hint(false)},
 {name:'idol_cutover_backup_manifest',description:'Read the complete immutable final-cutover backup manifest before independent download and recovery verification.',inputSchema:schema({id},['id']),annotations:hint(true)},
 {name:'idol_cutover_backup_read_file',description:'Read at most 1 MiB from an exact path in the final-cutover backup manifest. Owner-only, checksum included, no arbitrary URL or filesystem path.',inputSchema:schema({id,file:{type:'string'},offset:{type:'integer',minimum:0}},['id','file']),annotations:hint(true)},
 {name:'idol_cutover_seal',description:'Seal the final native shadow only after an actual complete offline restore report matches every file, photo, field and saved journal. Does not activate.',inputSchema:schema({id,report:{type:'object'}},['id','report']),annotations:hint(false)},
 {name:'idol_cutover_activate',description:'Read one bounded fixed-table source page per call, then explicitly activate the sealed native database and resume normal saves only after the complete final source comparison and restore verification. Exact sealHash and frozen epoch are protected; original Feishu remains untouched.',inputSchema:schema({id,sealHash:{type:'string',pattern:'^[a-f0-9]{64}$'}},['id','sealHash']),annotations:hint(false)},
 {name:'idol_cutover_resume_feishu',description:'Abort only the exact pre-activation freeze and resume existing Feishu-backed saves. Cannot roll back an active native database; retains unknown-operation locks and all evidence.',inputSchema:schema({id},['id']),annotations:hint(false)},
 {name:'idol_cutover_restart',description:'Restart an explicitly aborted pre-activation attempt using the same single shadow and a new operation ID. Keeps previous backup evidence. Only a fixed independently reviewed abandoned-page operation may be atomically isolated with its immutable unknown-outcome audit and storage reserve; every other unknown lock blocks restart.',inputSchema:schema({id,operationId:id},['id','operationId']),annotations:hint(false)},
 {name:'idol_archive_continue',description:'Continue the SAME authorized private migration only after a downloaded stage has passed independent SHA-256, image decode and offline restore verification. Grants at most 90 MB additional photos (100 MB total stage ceiling with bookkeeping headroom), with 1.3 GB total migration hard ceiling. No purchase, plan upgrade, source cutover, Feishu write or rating change. Stop on any quota/billing/upgrade error. Supply the actual verification report, never fabricated evidence.',inputSchema:schema({id,operationId:id,report:{type:'object'}},['id','operationId','report']),annotations:hint(false)},
 {name:'idol_storage_status',description:'Read this owner-private girl-group archive storage status. Does not change data, ratings, access, or subscriptions.',inputSchema:schema({}),annotations:hint(true)},
 {name:'idol_archive_begin',description:'Create a resumable private backup and shadow migration of the four existing girl-group tables, original IDs, save history and stage bindings. Reads existing Feishu API and writes only this Site native archive. Never changes Feishu records or user ratings. Requires available native photo storage.',inputSchema:schema({operationId:id},['operationId']),annotations:hint(false)},
 {name:'idol_archive_step',description:'Continue one bounded step of an already authorized girl-group backup: import shadow records or copy at most eight original photos with SHA-256 readback. Does not activate a new primary store or change ratings.',inputSchema:schema({id},['id']),annotations:{...hint(false),idempotentHint:false}},
 {name:'idol_archive_status',description:'Read progress of a private archive owned by the current user.',inputSchema:schema({id},['id']),annotations:hint(true)},
 {name:'idol_archive_retry_photos',description:'Retry only failed photo reads in an existing authorized backup. No source data mutation.',inputSchema:schema({id},['id']),annotations:hint(false)},
 {name:'idol_backup_manifest',description:'Read a complete or explicitly partial pilot backup manifest with original attachment links and checksums. No mutations.',inputSchema:schema({id},['id']),annotations:hint(true)},
 {name:'idol_backup_read_file',description:'Read up to 1 MiB of a file that belongs to the authenticated owner\'s complete or explicitly partial pilot backup. Use only manifest paths. Returns binary data as base64 for independent download and restore verification; no arbitrary URL or path.',inputSchema:schema({id,file:{type:'string'},offset:{type:'integer',minimum:0}},['id','file']),annotations:hint(true)},
];
export async function callSiteTool(userId:string,name:string,args:unknown){const tool=siteTools.find(t=>t.name===name);if(!tool)throw new AppError('UNKNOWN_TOOL','工具不存在。',404);if(!args||typeof args!=='object'||Array.isArray(args))throw new AppError('INVALID_TOOL_INPUT','参数无效。',400);const a=args as Record<string,any>,allowed=Object.keys(tool.inputSchema.properties);if(Object.keys(a).some(k=>!allowed.includes(k))||tool.inputSchema.required.some(k=>!Object.hasOwn(a,k)))throw new AppError('INVALID_TOOL_INPUT','参数不完整或包含不支持的字段。',400);
 if(name==='idol_cutover_prepare')return prepareCutover(userId,a.sourceRunId,a.id,a.report);
 if(name==='idol_cutover_prepare_step')return prepareCutoverStep(userId,a.id);
 if(name==='idol_cutover_status')return cutoverStatus(userId,a.id);
 if(name==='idol_cutover_preflight')return preflightCutover(userId,a.id);
 if(name==='idol_cutover_freeze')return freezeCutover(userId,a.id);
 if(name==='idol_cutover_capture')return captureCutover(userId,a.id);
 if(name==='idol_cutover_import_step')return importCutoverStep(userId,a.id);
 if(name==='idol_cutover_backup_manifest')return finalBackupManifest(userId,a.id);
 if(name==='idol_cutover_backup_read_file')return readFinalBackupFile(userId,a.id,a.file,a.offset??0);
 if(name==='idol_cutover_seal')return sealCutover(userId,a.id,a.report);
 if(name==='idol_cutover_activate')return activateCutover(userId,a.id,a.sealHash);
 if(name==='idol_cutover_resume_feishu')return resumeFeishu(userId,a.id);
 if(name==='idol_cutover_restart')return restartCutover(userId,a.id,a.operationId);
 if(name==='idol_archive_continue')return continueArchive(userId,a.id,a.operationId,a.report);
 if(name==='idol_storage_status')return inspectSource(userId);
 if(name==='idol_archive_begin')return createArchive(userId,a.operationId);
 if(name==='idol_archive_step')return stepArchive(userId,a.id);
 if(name==='idol_archive_status')return archiveStatus(userId,a.id);
 if(name==='idol_archive_retry_photos')return retryArchivePhotos(userId,a.id);
 if(name==='idol_backup_manifest')return backupManifest(userId,a.id);
 if(name==='idol_backup_read_file')return readBackupFile(userId,a.id,a.file,a.offset??0);
 throw new AppError('UNKNOWN_TOOL','工具不存在。',404);
}
