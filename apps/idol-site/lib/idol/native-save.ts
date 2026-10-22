import {AppError,isTable,type TableKey} from './feishu';
import {validatePatch,editableValues} from './live';
import {hash} from './hash';
import {nativeDb,ownControl,nativeRow,nativeSchema,type NativeRow} from './native-storage';
import {namedFields,patchById} from './native-format';
import {stageForWork,stageScoreIsBound} from './stage';
import {stageSourceKey as sourceKeyFor} from './stage-source';
export async function nativeRevision(snapshotId:string,table:TableKey,id:string,version:number,fields:Record<string,unknown>){return hash({snapshotId,table,id,version,fields});}
export async function saveNativeRecord(userId:string,input:any){
 const {table,recordId,revision,operationId,values,stageVideoId,stageSourceKey}=input??{};
 if(!isTable(table)||typeof recordId!=='string'||!/^rec[A-Za-z0-9]+$/.test(recordId)||typeof revision!=='string'||!/^[a-f0-9]{64}$/.test(revision)||typeof operationId!=='string'||!/^[a-f0-9-]{36}$/.test(operationId)||stageSourceKey!==undefined&&(typeof stageSourceKey!=='string'||stageSourceKey.length>80))throw new AppError('INVALID_SAVE','保存请求无效，请重新打开记录。',400);
 const control=await ownControl(userId);if(control?.mode!=='native'||!control.active_snapshot)throw new AppError('STORAGE_CHANGING','资料正在整理，请稍后再试，输入已保留。',409);
 const db=nativeDb(),requestHash=await hash({table,recordId,revision,values,...(stageVideoId?{stageVideoId}:{}),...(stageSourceKey!==undefined?{stageSourceKey}:{})});
 const prior=await db.prepare('SELECT user_id,request_hash,status,result_json FROM idol_saves WHERE id = ?').bind(operationId).first<{user_id:string;request_hash:string;status:string;result_json:string}>();
 if(prior){if(prior.user_id!==userId||prior.request_hash!==requestHash)throw new AppError('IDEMPOTENCY_CONFLICT','重复请求内容不同，本次未保存。',409);if(prior.status==='done')return JSON.parse(prior.result_json);throw new AppError('SAVE_UNRESOLVED','上次保存还未确认，请稍后再试，输入已保留。',409);}
 let sourceAudit:Record<string,unknown>|undefined;
 if(table==='works'&&values&&Object.hasOwn(values,'stageScore')){const selected=stageForWork(recordId),key=sourceKeyFor(selected);if(!stageScoreIsBound(selected)||stageVideoId!==selected?.videoId||(selected?.clip?stageSourceKey!==key:stageSourceKey!==undefined&&stageSourceKey!==key))throw new AppError('STAGE_SOURCE_CHANGED','舞台版本已变化，输入已保留。请重新打开后再保存。',409);sourceAudit={videoId:selected!.videoId,sourceKey:key,...(selected!.clip?{startSeconds:selected!.clip.startSeconds,endSeconds:selected!.clip.endSeconds}:{})};}
 const snapshot=control.active_snapshot,fields=await nativeSchema(snapshot,table),patch=validatePatch(table,values,fields),before=await nativeRow(snapshot,table,recordId);
 if(before.revision!==revision)throw new AppError('EDIT_CONFLICT','这条资料已更新，输入已保留。请重新打开后再保存。',409);
 const raw=JSON.parse(before.fields_json),next=patchById(raw,fields,patch),version=before.version+1,nextRevision=await nativeRevision(snapshot,table,recordId,version,next),now=Date.now();
 const record={record_id:recordId,fields:namedFields(next,fields)},result={saved:true,verified:true,operationId,table,recordId,revision:nextRevision,values:editableValues(table,record,fields),savedAt:new Date(now).toISOString(),...(sourceAudit?{stageSource:sourceAudit}:{})};
 // Conditional journal + CAS + cache fence are one D1 transaction. A stale
 // revision inserts no journal; a mid-batch exception rolls back all changes.
 await db.batch([
  db.prepare(`INSERT INTO idol_saves (id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at)
   SELECT ?,?,?,?,?,?,?,?,?,?,? FROM idol_native_records r JOIN idol_storage_control c ON c.id = 'main'
   WHERE r.key = ? AND r.revision = ? AND c.owner_id = ? AND c.mode = 'native' AND c.active_snapshot = ? AND c.epoch = ?`).bind(operationId,userId,table,recordId,requestHash,'done',JSON.stringify({record_id:recordId,fields:namedFields(raw,fields),nativeStorage:{snapshot,version:before.version,epoch:control.epoch},...(sourceAudit?{siteSourceBinding:sourceAudit}:{})}),JSON.stringify(patch),JSON.stringify(result),now,now,before.key,revision,userId,snapshot,control.epoch),
  db.prepare('UPDATE idol_native_records SET fields_json = ?,revision = ?,version = ?,updated_at = ? WHERE key = ? AND revision = ? AND EXISTS (SELECT 1 FROM idol_saves WHERE id = ? AND request_hash = ?)').bind(JSON.stringify(next),nextRevision,version,now,before.key,revision,operationId,requestHash),
  db.prepare('UPDATE idol_catalog_state SET generation = generation + 1,snapshot_id = NULL,checksum = NULL,part_count = NULL,captured_at = NULL WHERE user_id = ? AND EXISTS (SELECT 1 FROM idol_saves WHERE id = ? AND request_hash = ?)').bind(userId,operationId,requestHash),
 ]);
 const committed=await db.prepare('SELECT request_hash,result_json FROM idol_saves WHERE id = ? AND user_id = ?').bind(operationId,userId).first<{request_hash:string;result_json:string}>();
 if(!committed)throw new AppError('EDIT_CONFLICT','这条资料刚刚更新，输入已保留。请重新打开后再保存。',409);
 if(committed.request_hash!==requestHash)throw new AppError('IDEMPOTENCY_CONFLICT','重复请求内容不同，本次未保存。',409);
 return JSON.parse(committed.result_json);
}
