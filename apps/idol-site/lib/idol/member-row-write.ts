import {AppError} from './feishu';
import {nativeDb,type NativeRow,type StorageControl} from './native-storage';
/** Shared member-facts transaction: row CAS, recoverable journal and cache invalidation are atomic. */
export async function commitMemberRow(args:{userId:string;control:StorageControl;row:NativeRow;operationId:string;requestHash:string;next:Record<string,unknown>;nextRevision:string;before:unknown;patch:unknown;result:unknown;schemaJSON?:string}){
 const {userId,control:c,row,operationId,requestHash,next,nextRevision,before,patch,result,schemaJSON}=args,db=nativeDb(),now=Date.now();
 await db.batch([
 db.prepare(`INSERT INTO idol_saves (id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at)
 SELECT ?,?,'members',?,?,'done',?,?,?,?,? FROM idol_native_records r JOIN idol_storage_control c ON c.id='main'
 WHERE r.key=? AND r.revision=? AND r.fields_json=? AND c.owner_id=? AND c.mode='native' AND c.active_snapshot=? AND c.epoch=?
 AND (? IS NULL OR EXISTS (SELECT 1 FROM idol_native_fields WHERE key=? AND fields_json=?))`).bind(operationId,userId,row.record_id,requestHash,JSON.stringify(before),JSON.stringify(patch),JSON.stringify(result),now,now,row.key,row.revision,row.fields_json,userId,c.active_snapshot,c.epoch,schemaJSON??null,c.active_snapshot+':members',schemaJSON??null),
 db.prepare('UPDATE idol_native_records SET fields_json=?,revision=?,version=?,updated_at=? WHERE key=? AND revision=? AND EXISTS (SELECT 1 FROM idol_saves WHERE id=? AND request_hash=?)').bind(JSON.stringify(next),nextRevision,row.version+1,now,row.key,row.revision,operationId,requestHash),
 db.prepare('UPDATE idol_catalog_state SET generation=generation+1,snapshot_id=NULL,checksum=NULL,part_count=NULL,captured_at=NULL WHERE user_id=? AND EXISTS (SELECT 1 FROM idol_saves WHERE id=? AND request_hash=?)').bind(userId,operationId,requestHash),
 ]);
 const committed=await db.prepare('SELECT request_hash,result_json FROM idol_saves WHERE id=? AND user_id=?').bind(operationId,userId).first<{request_hash:string;result_json:string}>();
 if(!committed)throw new AppError('EDIT_CONFLICT','成员资料刚刚更新，请重新核对。',409);
 if(committed.request_hash!==requestHash)throw new AppError('IDEMPOTENCY_CONFLICT','同一次保存内容不同，未重复修改。',409);
 return JSON.parse(committed.result_json);
}
