// Separate fixed batch deliberately preserves the completed five-relation operation byte-for-byte.
import {AppError} from './feishu';
import {F} from './fields';
import {asIds,asUrl,videoId} from './values';
import {hash} from './hash';
import {nativeDb,ownControl,nativeRow,nativeSchema,assertSourceUnchanged} from './native-storage';
import {nativeRevision} from './native-save';
import {nativeKey} from './native-format';
const batch='reviewed-billlie-zap-seven-relations-20261018';
export const billlieZapPairs=Object.freeze([
 {memberId:'recvxyICzHtQXk',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'SIYOON',song:'ZAP'},
 {memberId:'recvxyICzHs6DK',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'SHEON',song:'ZAP'},
 {memberId:'recvxyICzHBhTg',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'TSUKI',song:'ZAP'},
 {memberId:'recvxyICzHhav7',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'MOON SUA',song:'ZAP'},
 {memberId:'recvxyICzH9odN',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'HARAM',song:'ZAP'},
 {memberId:'recvxyICzHJHn8',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'SUHYEON',song:'ZAP'},
 {memberId:'recvxyICzH2hbG',workId:'recvxyH5pz722q',videoId:'iqCx5RfI6Tw',memberName:'HARUNA',song:'ZAP'},
].map(p=>Object.freeze(p)));
function fail(code:string,message:string):never{throw new AppError(code,message,409);}
type Row={key:string;record_id:string;revision:string;fields_json:string};
async function inspect(userId:string){
 const c=await ownControl(userId);if(c?.mode!=='native'||!c.active_snapshot)fail('STORAGE_CHANGING','资料正在整理，请稍后核对。');
 const db=nativeDb(),snapshot=c.active_snapshot;
 const generation=await db.prepare('SELECT generation FROM idol_catalog_state WHERE user_id=?').bind(userId).first<{generation:number}>();if(!generation)fail('NATIVE_DATA_MISSING','资料状态暂不可用。');
 const schemas=[];for(const table of ['ratings','members','works'] as const){const fields=await nativeSchema(snapshot,table);const schemaRow=await db.prepare('SELECT key,fields_json FROM idol_native_fields WHERE key=?').bind(snapshot+':'+table).first<{key:string;fields_json:string}>();if(!schemaRow)fail('SCHEMA_CHANGED','关联字段格式已变化。');schemas.push(schemaRow);if(table==='ratings')for(const [id,type]of [[F.ratings.name,1],[F.ratings.members,18],[F.ratings.works,18]] as const){if(!fields.some(f=>f.field_id===id&&(f.type===type||type===18&&f.type===21)))fail('SCHEMA_CHANGED','关联字段格式已变化，请重新核对。');}}
 const ratings=(await db.prepare("SELECT key,record_id,revision,fields_json FROM idol_native_records WHERE snapshot_id=? AND table_key='ratings' ORDER BY key").bind(snapshot).all<Row>()).results;
 const guards:Row[]=[],pairs=[];
 for(const p of billlieZapPairs){const member=await nativeRow(snapshot,'members',p.memberId),work=await nativeRow(snapshot,'works',p.workId);guards.push(member,work);if(videoId(asUrl(JSON.parse(work.fields_json)[F.works.url]))!==p.videoId)fail('RELATION_TARGET_CHANGED','作品视频已变化，请重新核对。');
 const matches=ratings.filter(r=>{const raw=JSON.parse(r.fields_json);return asIds(raw[F.ratings.members]).includes(p.memberId)&&asIds(raw[F.ratings.works]).includes(p.workId);});
 if(matches.length>1||matches.some(r=>{const raw=JSON.parse(r.fields_json);return asIds(raw[F.ratings.members]).length!==1||asIds(raw[F.ratings.works]).length!==1;}))fail('RELATION_AMBIGUOUS','已有重复或多成员关联，未新增。');
 pairs.push({...p,recordId:matches[0]?.record_id??null,revision:matches[0]?.revision??null});}
 await assertSourceUnchanged(userId,c);
 const token=await hash({batch,snapshot,epoch:c.epoch,generation:generation.generation,schemas,guards:guards.map(r=>[r.key,r.revision,r.fields_json]),ratings});
 return {c,snapshot,generation:generation.generation,schemas,guards,ratings,pairs,token};
}
export async function billlieZapPreview(userId:string){const s=await inspect(userId);return {batch,token:s.token,pairs:s.pairs,missing:s.pairs.filter(p=>!p.recordId).length};}
async function settled(userId:string,operationId:string,requestHash:string){
 const db=nativeDb(),j=await db.prepare('SELECT user_id,request_hash,status,result_json FROM idol_saves WHERE id=?').bind(operationId).first<any>();if(!j)return null;
 if(j.user_id!==userId||j.request_hash!==requestHash)fail('IDEMPOTENCY_CONFLICT','同一次操作内容不同，未重复处理。');if(j.status!=='done'||!j.result_json)fail('SAVE_UNRESOLVED','上次操作尚未确认。');
 const r=JSON.parse(j.result_json),c=await ownControl(userId);if(c?.active_snapshot!==r.snapshot)fail('STORAGE_CHANGING','资料来源已变化，请重新核对。');
 for(const p of r.pairs){const row=await nativeRow(r.snapshot,'ratings',p.recordId),raw=JSON.parse(row.fields_json);if(JSON.stringify(asIds(raw[F.ratings.members]))!==JSON.stringify([p.memberId])||JSON.stringify(asIds(raw[F.ratings.works]))!==JSON.stringify([p.workId]))fail('RELATION_TARGET_CHANGED','已创建关联发生变化，未重新创建。');}
 return r;
}
export async function applyBilllieZapRelations(userId:string,input:any){
 if(!input||Object.keys(input).sort().join(',')!=='operationId,token'||typeof input.operationId!=='string'||!/^[a-f0-9-]{36}$/.test(input.operationId)||typeof input.token!=='string'||!/^[a-f0-9]{64}$/.test(input.token))throw new AppError('INVALID_RELATION_OPERATION','关联操作无效。',400);
 await ownControl(userId);const {operationId,token}=input,requestHash=await hash({batch,token});const prior=await settled(userId,operationId,requestHash);if(prior)return prior;
 const s=await inspect(userId);if(token!==s.token)fail('EDIT_CONFLICT','资料刚刚更新，请重新预览。');if(s.pairs.some(p=>p.recordId))fail('RELATION_ALREADY_PRESENT','已有部分或全部关联，请核对当前结果，未新增。');
 // IDs identify genuine new native rows; they never claim to be Feishu IDs.
 const rows=await Promise.all(s.pairs.map(async p=>{const recordId='recNative'+crypto.randomUUID().replaceAll('-',''),raw={[F.ratings.name]:p.memberName+' · '+p.song,[F.ratings.members]:[p.memberId],[F.ratings.works]:[p.workId]};return {...p,recordId,raw,revision:await nativeRevision(s.snapshot,'ratings',recordId,1,raw)};}));
 const now=Date.now(),result={saved:true,verified:true,batch,operationId,snapshot:s.snapshot,pairs:rows.map(({raw,...p})=>p),savedAt:new Date(now).toISOString()},db=nativeDb();
 const guards=s.guards.map(r=>({key:r.key,revision:r.revision,fields_json:r.fields_json})),ratingGuards=s.ratings.map(r=>({key:r.key,revision:r.revision}));
 const gate="EXISTS(SELECT 1 FROM idol_saves WHERE id=? AND user_id=? AND request_hash=? AND status='done' AND result_json=?)",gateArgs=[operationId,userId,requestHash,JSON.stringify(result)];
 const statements=[db.prepare(`INSERT INTO idol_saves (id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at)
 SELECT ?,?,'ratings',?,?,'done',?,?,?,?,? FROM idol_storage_control c WHERE c.id='main' AND c.owner_id=? AND c.mode='native' AND c.active_snapshot=? AND c.epoch=?
 AND EXISTS(SELECT 1 FROM idol_catalog_state WHERE user_id=? AND generation=?)
 AND NOT EXISTS(SELECT 1 FROM json_each(?) g LEFT JOIN idol_native_records r ON r.key=json_extract(g.value,'$.key') WHERE r.revision IS NOT json_extract(g.value,'$.revision') OR r.fields_json IS NOT json_extract(g.value,'$.fields_json'))
 AND NOT EXISTS(SELECT 1 FROM json_each(?) g LEFT JOIN idol_native_fields f ON f.key=json_extract(g.value,'$.key') WHERE f.fields_json IS NOT json_extract(g.value,'$.fields_json'))
 AND (SELECT count(*) FROM idol_native_records WHERE snapshot_id=? AND table_key='ratings')=?
 AND NOT EXISTS(SELECT 1 FROM json_each(?) g LEFT JOIN idol_native_records r ON r.key=json_extract(g.value,'$.key') WHERE r.revision IS NOT json_extract(g.value,'$.revision'))
 AND NOT EXISTS(SELECT 1 FROM idol_native_records WHERE record_id IN (SELECT value FROM json_each(?)))
 AND NOT EXISTS(SELECT 1 FROM idol_saves WHERE user_id=? AND json_extract(patch_json,'$.relationBatch')=?)`).bind(operationId,userId,rows[0].recordId,requestHash,JSON.stringify({absent:true,snapshot:s.snapshot,epoch:s.c.epoch,pairs:s.pairs}),JSON.stringify({relationBatch:batch,origin:'native',action:'create-empty-relations',pairs:rows.map(p=>({recordId:p.recordId,fields:p.raw,videoId:p.videoId})),reviewedEvidenceSha256:'07cd3c5b1e0377c5f0684e96f53c9143aba44d5e59379af2b613883e6164154a',approvalMessageId:'Sentinel_e53732638034819180406bee0ef5c287'}),JSON.stringify(result),now,now,userId,s.snapshot,s.c.epoch,userId,s.generation,JSON.stringify(guards),JSON.stringify(s.schemas),s.snapshot,s.ratings.length,JSON.stringify(ratingGuards),JSON.stringify(rows.map(p=>p.recordId)),userId,batch)];
 for(const r of rows)statements.push(db.prepare(`INSERT INTO idol_native_records (key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at,source_order) SELECT ?,?,'ratings',?,?,?,1,?,(SELECT coalesce(max(source_order),-1)+1 FROM idol_native_records WHERE snapshot_id=? AND table_key='ratings') WHERE ${gate}`).bind(nativeKey(s.snapshot,'ratings',r.recordId),s.snapshot,r.recordId,JSON.stringify(r.raw),r.revision,now,s.snapshot,...gateArgs));
 statements.push(db.prepare(`UPDATE idol_catalog_state SET generation=generation+1,snapshot_id=NULL,checksum=NULL,part_count=NULL,captured_at=NULL WHERE user_id=? AND ${gate}`).bind(userId,...gateArgs));
 try{await db.batch(statements);}catch(e){const done=await settled(userId,operationId,requestHash);if(done)return done;throw e;}
 const done=await settled(userId,operationId,requestHash);if(!done)fail('EDIT_CONFLICT','资料已变化或本批曾执行，未新增。请核对现有记录。');return done;
}
