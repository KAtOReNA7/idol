import {ownControl} from './native-storage';
import {saveNativeRecord} from './native-save';
import {env} from 'cloudflare:workers';
import {getRecord,updateRecord,isTable,AppError,TableKey} from './feishu';
import {schema,validatePatch,matchesPatch,editableValues} from './live';
import {hash} from './hash';
import {invalidateCatalog} from './catalog';
import {invalidateDurableCatalog} from './durable-catalog';
import {stageForWork,stageScoreIsBound} from './stage';
import {stageSourceKey as sourceKeyFor} from './stage-source';
type SaveRow={id:string;user_id:string;table_key:TableKey;record_id:string;request_hash:string;status:string;before_json:string;patch_json:string;result_json:string|null};
export async function saveRecord(userId:string,input:any){
 const control=await ownControl(userId);if(control?.mode==='native')return saveNativeRecord(userId,input);if(control?.mode==='frozen')throw new AppError('STORAGE_CHANGING','资料正在整理，暂时无法保存；输入已保留，请稍后重试。',409);
 if(!env.DB)throw new AppError('STORAGE_NOT_READY','保存保护尚未就绪，本次没有写入。',503);
 const {table,recordId,revision,operationId,values,stageVideoId,stageSourceKey}=input??{};
 if(!isTable(table)||typeof recordId!=='string'||!/^rec[A-Za-z0-9]+$/.test(recordId)||typeof revision!=='string'||!/^[a-f0-9]{64}$/.test(revision)||typeof operationId!=='string'||!/^[a-f0-9-]{36}$/.test(operationId))throw new AppError('INVALID_SAVE','保存请求无效，请重新打开记录。',400);
 if(stageSourceKey!==undefined&&(typeof stageSourceKey!=='string'||stageSourceKey.length>80))throw new AppError('INVALID_SAVE','舞台范围标识无效，本次没有写入。',400);
 const db=env.DB;const requestHash=await hash({table,recordId,revision,values,...(stageVideoId?{stageVideoId}:{}),...(stageSourceKey!==undefined?{stageSourceKey}:{})});
 const prior=await db.prepare('SELECT * FROM idol_saves WHERE id = ?').bind(operationId).first<SaveRow>();
 if(prior){
  if(prior.user_id!==userId||prior.request_hash!==requestHash)throw new AppError('IDEMPOTENCY_CONFLICT','重复请求内容不同，本次未写入。',409);
  if(prior.status==='conflict')throw new AppError('EDIT_CONFLICT','飞书原值已变化，本次未覆盖，请重新读取。',409);
  if(prior.status==='preflight_failed')throw new AppError('PREFLIGHT_FAILED','提交前读取失败，本次未发出保存，请重新读取后再试。',503);
  if(prior.status==='done')return JSON.parse(prior.result_json!);
  if(prior.status==='acknowledged')return finalize(prior);
  throw new AppError('SAVE_UNRESOLVED','上次保存结果尚未确认，此条已暂停写入。请让助手核对保存记录后恢复，勿重复提交。',409);
 }
 let sourceAudit:Record<string,unknown>|undefined;
 if(table==='works'&&values&&Object.hasOwn(values,'stageScore')){const selected=stageForWork(recordId);const key=sourceKeyFor(selected);if(!stageScoreIsBound(selected)||stageVideoId!==selected?.videoId||(selected?.clip?stageSourceKey!==key:stageSourceKey!==undefined&&stageSourceKey!==key))throw new AppError('STAGE_SOURCE_CHANGED','舞台来源或片段范围尚未绑定或已更新，本次没有写入。草稿已保留，请核对当前视频范围后决定是否重新读取。',409);sourceAudit={videoId:selected!.videoId,sourceKey:key,...(selected!.clip?{startSeconds:selected!.clip.startSeconds,endSeconds:selected!.clip.endSeconds}:{})};}
 const fields=await schema(table,true);const patch=validatePatch(table,values,fields);const before=await getRecord(table,recordId);
 if(await hash(before.fields)!==revision)throw new AppError('EDIT_CONFLICT','这条记录已在别处更新。本次未覆盖，请重新读取后再保存。',409);
 const lockKey=table+':'+recordId;const now=Date.now();
 try{await db.batch([
  db.prepare('INSERT INTO idol_record_locks (key,save_id,created_at) VALUES (?,?,?)').bind(lockKey,operationId,now),
  db.prepare('INSERT INTO idol_saves (id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(operationId,userId,table,recordId,requestHash,'prepared',JSON.stringify({...before,...(sourceAudit?{siteSourceBinding:sourceAudit}:{})}),JSON.stringify(patch),now,now)
 ]);}catch{throw new AppError('SAVE_BUSY','这条记录有尚未完成的保存；请先核对上次结果。若持续未完成，请让助手检查恢复。',409);}
 // Re-read under our per-record lock. Native Feishu edits are outside this lock.
 let fresh;try{fresh=await getRecord(table,recordId);}catch(e){await db.batch([db.prepare('UPDATE idol_saves SET status = ?, updated_at = ? WHERE id = ?').bind('preflight_failed',Date.now(),operationId),db.prepare('DELETE FROM idol_record_locks WHERE key = ? AND save_id = ?').bind(lockKey,operationId)]);throw new AppError('PREFLIGHT_FAILED','提交前读取失败，本次未发出保存。请重新读取后再试。',503);}
 if(await hash(fresh.fields)!==revision){await db.batch([db.prepare('UPDATE idol_saves SET status = ?, updated_at = ? WHERE id = ?').bind('conflict',Date.now(),operationId),db.prepare('DELETE FROM idol_record_locks WHERE key = ? AND save_id = ?').bind(lockKey,operationId)]);throw new AppError('EDIT_CONFLICT','飞书原值刚刚变化。本次未覆盖，请重新读取。',409);}
 // Fence old read snapshots before dispatch; failure here sends no upstream write.
 try{await invalidateDurableCatalog(userId);invalidateCatalog();}catch{await db.batch([db.prepare('UPDATE idol_saves SET status = ?, updated_at = ? WHERE id = ?').bind('preflight_failed',Date.now(),operationId),db.prepare('DELETE FROM idol_record_locks WHERE key = ? AND save_id = ?').bind(lockKey,operationId)]);throw new AppError('PREFLIGHT_FAILED','读取缓存保护暂未就绪，本次未发出保存。请重新读取后再试。',503);}
 await db.prepare('UPDATE idol_saves SET status = ?, updated_at = ? WHERE id = ?').bind('dispatching',Date.now(),operationId).run();
 try{await updateRecord(table,recordId,patch);}catch{await db.prepare('UPDATE idol_saves SET status = ?, updated_at = ? WHERE id = ?').bind('uncertain',Date.now(),operationId).run();throw new AppError('SAVE_UNCERTAIN','飞书响应未确认，此条已暂停写入。请让助手核对保存记录后恢复，原输入已保留。',409);}
 await db.prepare('UPDATE idol_saves SET status = ?, updated_at = ? WHERE id = ?').bind('acknowledged',Date.now(),operationId).run();
 return finalize({id:operationId,user_id:userId,table_key:table,record_id:recordId,request_hash:requestHash,status:'acknowledged',before_json:JSON.stringify({...before,...(sourceAudit?{siteSourceBinding:sourceAudit}:{})}),patch_json:JSON.stringify(patch),result_json:null});
}
async function finalize(row:SaveRow){
 const db=env.DB!;const current=await getRecord(row.table_key,row.record_id);const patch=JSON.parse(row.patch_json);
 if(!matchesPatch(current,patch))throw new AppError('READBACK_MISMATCH','已收到飞书保存响应，但回读值不同。请核对原表；未自动重写。',409);
 const fields=await schema(row.table_key);const result={saved:true,verified:true,operationId:row.id,table:row.table_key,recordId:row.record_id,revision:await hash(current.fields),values:editableValues(row.table_key,current,fields),savedAt:new Date().toISOString(),...(JSON.parse(row.before_json).siteSourceBinding?{stageSource:JSON.parse(row.before_json).siteSourceBinding}:{})};
 await invalidateDurableCatalog(row.user_id);invalidateCatalog();
 await db.batch([db.prepare("UPDATE idol_saves SET status = ?, result_json = ?, updated_at = ? WHERE id = ? AND user_id = ? AND status = 'acknowledged' AND EXISTS (SELECT 1 FROM idol_record_locks WHERE key = ? AND save_id = ?)").bind('done',JSON.stringify(result),Date.now(),row.id,row.user_id,row.table_key+':'+row.record_id,row.id),db.prepare("DELETE FROM idol_record_locks WHERE key = ? AND save_id = ? AND EXISTS (SELECT 1 FROM idol_saves WHERE id = ? AND user_id = ? AND status = 'done')").bind(row.table_key+':'+row.record_id,row.id,row.id,row.user_id)]);
 const committed=await db.prepare('SELECT status,result_json FROM idol_saves WHERE id = ? AND user_id = ?').bind(row.id,row.user_id).first<{status:string;result_json:string|null}>();
 if(committed?.status!=='done'||!committed.result_json)throw new AppError('SAVE_UNRESOLVED','保存结果尚未确认，输入已保留。',409);
 return JSON.parse(committed.result_json);
}

export async function recoverRecordSave(userId:string,table:TableKey,recordId:string){if(!env.DB)return null;const row=await env.DB.prepare('SELECT s.* FROM idol_record_locks l JOIN idol_saves s ON s.id = l.save_id WHERE l.key = ? AND s.user_id = ?').bind(table+':'+recordId,userId).first<SaveRow>();if(!row)return null;if(row.status==='acknowledged'){await finalize(row);return null;}return {operationId:row.id,status:row.status,message:'此条有尚未确认的保存，已暂停再次写入。请让助手核对后恢复。'};}
