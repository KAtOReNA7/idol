import {env} from 'cloudflare:workers';
import {AppError,type TableKey,type FeishuRecord} from './feishu';
import type {Field} from './live';
import {namedFields,nativeKey,type NativeTables} from './native-format';
export type StorageControl={id:string;owner_id:string;mode:'feishu'|'frozen'|'native';epoch:number;active_snapshot:string|null;run_id:string|null;updated_at:number};
export function nativeDb(){if(!env.DB)throw new AppError('STORAGE_NOT_READY','资料暂时无法打开，请稍后重试。',503);return env.DB;}
export async function storageControl(){return nativeDb().prepare("SELECT * FROM idol_storage_control WHERE id = 'main'").first<StorageControl>();}
export async function ownControl(userId:string){const control=await storageControl();if(control&&control.owner_id!==userId)throw new AppError('OWNER_ONLY','此资料仅供所有者使用。',403);return control;}
export async function activeNative(userId?:string){const control=userId?await ownControl(userId):await storageControl();return control&&(control.mode==='native'||control.mode==='frozen'&&!!control.active_snapshot)?control:null;}
export async function nativeSchema(snapshotId:string,table:TableKey):Promise<Field[]>{const row=await nativeDb().prepare('SELECT fields_json FROM idol_native_fields WHERE key = ?').bind(snapshotId+':'+table).first<{fields_json:string}>();if(!row)throw new AppError('NATIVE_SCHEMA_MISSING','资料格式暂时不可用。',503);return JSON.parse(row.fields_json);}
export type NativeRow={key:string;snapshot_id:string;table_key:TableKey;record_id:string;fields_json:string;revision:string;version:number;updated_at:number;source_order:number};
export async function nativeRow(snapshotId:string,table:TableKey,id:string){if(!/^rec[A-Za-z0-9]+$/.test(id))throw new AppError('INVALID_RECORD','记录无效。',400);const row=await nativeDb().prepare('SELECT * FROM idol_native_records WHERE key = ?').bind(nativeKey(snapshotId,table,id)).first<NativeRow>();if(!row)throw new AppError('RECORD_NOT_FOUND','这条资料不存在。',404);return row;}
export async function nativeRecord(snapshotId:string,table:TableKey,id:string):Promise<FeishuRecord>{const [row,fields]=await Promise.all([nativeRow(snapshotId,table,id),nativeSchema(snapshotId,table)]);return {record_id:id,fields:namedFields(JSON.parse(row.fields_json),fields)};}
export async function nativeTables(snapshotId:string):Promise<NativeTables>{
 const result={} as NativeTables;const [schemas,rows]=await Promise.all([
 nativeDb().prepare('SELECT table_key,fields_json FROM idol_native_fields WHERE snapshot_id = ?').bind(snapshotId).all<{table_key:TableKey;fields_json:string}>(),
 nativeDb().prepare('SELECT table_key,record_id,fields_json FROM idol_native_records WHERE snapshot_id = ? ORDER BY table_key,source_order,record_id').bind(snapshotId).all<{table_key:TableKey;record_id:string;fields_json:string}>(),
 ]);
 for(const table of ['groups','members','works','ratings'] as TableKey[]){const fields=schemas.results.find(r=>r.table_key===table);if(!fields)throw new AppError('NATIVE_SCHEMA_MISSING','资料格式暂时不可用。',503);result[table]={fields:JSON.parse(fields.fields_json),records:rows.results.filter(r=>r.table_key===table).map(r=>({recordId:r.record_id,fields:JSON.parse(r.fields_json)}))};}return result;
}

export function sourceStamp(control:StorageControl|null){return JSON.stringify({mode:control?.mode??'feishu',epoch:control?.epoch??0,activeSnapshot:control?.active_snapshot??null});}
export async function assertSourceUnchanged(userId:string,before:StorageControl|null){if(sourceStamp(await ownControl(userId))!==sourceStamp(before))throw new AppError('STORAGE_CHANGING','资料刚刚更新，请重新读取，输入已保留。',409);}
export async function nativeExportSnapshot(userId:string){
 const before=await activeNative(userId);if(!before)return null;if(!before.active_snapshot)throw new AppError('NATIVE_DATA_MISSING','资料暂时无法打开，请稍后重试。',503);
 const snapshot=before.active_snapshot,db=nativeDb();
 const results=await db.batch([
  db.prepare("SELECT * FROM idol_storage_control WHERE id='main' AND owner_id=?").bind(userId),
  db.prepare('SELECT table_key,fields_json FROM idol_native_fields WHERE snapshot_id=?').bind(snapshot),
  db.prepare('SELECT table_key,record_id,fields_json FROM idol_native_records WHERE snapshot_id=? ORDER BY table_key,source_order,record_id').bind(snapshot),
  db.prepare('SELECT * FROM idol_saves WHERE user_id=? ORDER BY created_at,id').bind(userId),
  db.prepare("SELECT file_token,sha256,byte_length,content_type FROM idol_native_media WHERE snapshot_id=? AND status='complete' ORDER BY file_token").bind(snapshot),
 ]);
 const at=results[0].results[0] as StorageControl|undefined;if(!at||sourceStamp(at)!==sourceStamp(before))throw new AppError('STORAGE_CHANGING','资料刚刚更新，请重新下载。',409);
 const schemas=results[1].results as {table_key:TableKey;fields_json:string}[],rows=results[2].results as {table_key:TableKey;record_id:string;fields_json:string}[],tables={} as NativeTables;
 for(const table of ['groups','members','works','ratings'] as TableKey[]){const schema=schemas.find(x=>x.table_key===table);if(!schema)throw new AppError('NATIVE_SCHEMA_MISSING','资料格式暂时不可用。',503);tables[table]={fields:JSON.parse(schema.fields_json),records:rows.filter(x=>x.table_key===table).map(x=>({recordId:x.record_id,fields:JSON.parse(x.fields_json)}))};}
 return {tables,journal:results[3].results,photos:results[4].results};
}
