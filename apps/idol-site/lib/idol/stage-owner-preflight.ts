import {AppError} from './feishu';
import {nativeDb,ownControl,sourceStamp,assertSourceUnchanged,type StorageControl} from './native-storage';
import {stageSourceMetadata} from './stage';

// Owner-only, live, read-only. A single D1 batch observes scores and the complete
// journal together. Only target score emptiness and target log headers leave DB.
export async function stageOwnerPreflight(userId:string,workIds:unknown){
 if(!Array.isArray(workIds)||workIds.length<1||workIds.length>5||workIds.some(id=>typeof id!=='string'||!/^rec[A-Za-z0-9]+$/.test(id))||new Set(workIds).size!==workIds.length)throw new AppError('INVALID_WORK_IDS','请提供1至5个不重复的作品ID。',400);
 const ids=workIds as string[],capturedAt=new Date().toISOString();
 const before=await ownControl(userId);
 if(!before||before.mode!=='native'||!before.active_snapshot)throw new AppError('NATIVE_REQUIRED','当前资料状态不支持实时舞台核对。',409);
 const db=nativeDb(),snapshot=before.active_snapshot;
 const result=await db.batch([
  db.prepare("SELECT * FROM idol_storage_control WHERE id='main' AND owner_id=?").bind(userId),
  db.prepare("SELECT fields_json FROM idol_native_fields WHERE snapshot_id=? AND table_key='works'").bind(snapshot),
  db.prepare(`SELECT record_id,fields_json FROM idol_native_records WHERE snapshot_id=? AND table_key='works' AND record_id IN (${ids.map(()=>'?').join(',')})`).bind(snapshot,...ids),
  db.prepare('SELECT record_id,table_key,status FROM idol_saves WHERE user_id=? ORDER BY created_at,id').bind(userId),
 ]);
 if(result.some(r=>!r.success))throw new AppError('PREFLIGHT_INCOMPLETE','舞台核对读取不完整，请重试。',503);
 const at=result[0].results[0] as StorageControl|undefined;
 if(!at||sourceStamp(at)!==sourceStamp(before))throw new AppError('STORAGE_CHANGING','资料正在切换，请重试。',409);
 const schema=result[1].results[0] as {fields_json:string}|undefined;
 if(!schema||!JSON.parse(schema.fields_json).some((f:{field_id:string})=>f.field_id==='fld641ausT'))throw new AppError('PREFLIGHT_SCHEMA','舞台评分字段无法确认。',409);
 const rows=result[2].results as {record_id:string;fields_json:string}[];
 if(rows.length!==ids.length||new Set(rows.map(r=>r.record_id)).size!==ids.length||rows.some(r=>!ids.includes(r.record_id)))throw new AppError('PREFLIGHT_MISSING_WORK','作品记录不完整。',409);
 const journal=result[3].results as {record_id:string;table_key:string;status:string}[];
 if(journal.some(r=>!r.record_id||!r.table_key||!r.status))throw new AppError('PREFLIGHT_JOURNAL','保存日志无法完整确认。',409);
 const works=ids.map(recordId=>{
  const fields=JSON.parse(rows.find(r=>r.record_id===recordId)!.fields_json),value=fields.fld641ausT;
  // The native schema establishes the field; omitted values represent empty cells.
  return {recordId,scoreEmpty:value==null||(typeof value==='string'&&!value.trim())};
 });
 const sources=stageSourceMetadata as Record<string,unknown>;
 const payload={formatVersion:'idol.stage-owner-preflight.v1',source:'native',capturedAt,complete:true,workIds:ids,works,
  journalCheck:{complete:true,totalRows:journal.length,matches:journal.filter(r=>ids.includes(r.record_id))},
  stageVideos:Object.fromEntries(ids.map(id=>[id,sources[id]??null]))};
 await assertSourceUnchanged(userId,before);
 const bytes=new TextEncoder().encode(JSON.stringify(payload));
 if(bytes.length>16000)throw new AppError('PREFLIGHT_TOO_LARGE','核对结果过大，请减少本次作品数量；无需手动下载备份。',413);
 const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
 return {formatVersion:'idol.stage-preflight-envelope.v1',byteLength:bytes.length,sha256,payloadBase64:btoa(String.fromCharCode(...bytes))};
}
