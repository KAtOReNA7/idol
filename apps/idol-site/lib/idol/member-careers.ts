import acceptedClaims from '@/data/runtime/member-careers/accepted-claims.json';
import trustedHashes from '@/data/runtime/member-careers/trusted-hashes.json';
import sourceIds from '@/data/runtime/member-careers/source-ids.json';
import {hash as researchHash,planBatch,PUBLIC_FIELDS} from '../../research/member-careers/guard.mjs';
import {F} from './fields';
import {asText,asIds} from './values';
import {AppError} from './feishu';
import {nativeDb,ownControl,nativeRow,assertSourceUnchanged,type NativeRow} from './native-storage';
import {nativeRevision} from './native-save';
import {commitMemberRow} from './member-row-write';
import type {Field} from './live';
const claims=acceptedClaims;
const memberIds=[...new Set(claims.map(c=>c.memberId))].sort();
const batchHash=researchHash(claims),kind='member-careers-v1';
const publicIds=F.members as Record<string,string>;
const rowId=(operationId:string,id:string,rollback=false)=>researchHash({kind,operationId,id,rollback});
const equal=(a:unknown,b:unknown)=>researchHash(a)===researchHash(b);
function fail(code:string,message:string):never{throw new AppError(code,message,409);}
function operation(value:unknown):asserts value is string{if(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value))throw new AppError('INVALID_OPERATION','请重新打开本次资料更新。',400);}
export function careerProjection(id:string,raw:Record<string,unknown>){
 const publicFields=Object.fromEntries(PUBLIC_FIELDS.map((k:string)=>[k,asText(raw[publicIds[k]])]));
 const url=raw[F.members.officialUrl];if(url&&typeof url==='object'&&!Array.isArray(url))publicFields.officialUrl=String((url as any).link??(url as any).url??'');
 const currentGroupIds=asIds(raw[F.members.groups]),formerGroupIds=asIds(raw[F.members.formerGroups]);
 return {memberId:id,publicFields,currentGroupIds,formerGroupIds,groupIds:[...currentGroupIds,...formerGroupIds],roleLabels:raw[F.members.role]};
}
function schemaCheck(fields:Field[]){
 const types:Record<string,number>={name:1,stageName:1,cnName:1,role:4,status:3,profile:1,officialUrl:15,groups:21,formerGroups:18};
 for(const [key,type]of Object.entries(types))if(!fields.some(f=>f.field_id===publicIds[key]&&f.type===type))fail('SCHEMA_CHANGED','成员资料格式已变化，本次更新已暂停。');
}
type Journal={id:string;user_id:string;record_id:string;request_hash:string;status:string;before_json:string;patch_json:string;result_json:string};
async function context(userId:string){const control=await ownControl(userId);if(control?.mode!=='native'||!control.active_snapshot)fail('STORAGE_CHANGING','资料正在整理，请稍后再试。');const schema=await nativeDb().prepare('SELECT fields_json FROM idol_native_fields WHERE key=?').bind(control.active_snapshot+':members').first<{fields_json:string}>();if(!schema)fail('SCHEMA_CHANGED','资料格式暂时不可用。');const fields:Field[]=JSON.parse(schema.fields_json);schemaCheck(fields);return {control,schemaJSON:schema.fields_json,fields};}
async function journal(userId:string,operationId:string,id:string,rollback=false){const j=await nativeDb().prepare('SELECT * FROM idol_saves WHERE id=?').bind(rowId(operationId,id,rollback)).first<Journal>();if(j&&j.user_id!==userId)fail('IDEMPOTENCY_CONFLICT','这次更新无法核对。');return j;}
async function readBatch(userId:string,operationId:string,snapshot:string){
 const db=nativeDb();const [records,saves]=await db.batch([
  db.prepare("SELECT * FROM idol_native_records WHERE snapshot_id=? AND table_key='members'").bind(snapshot),
  db.prepare("SELECT * FROM idol_saves WHERE user_id=? AND json_extract(patch_json,'$.operationId')=?").bind(userId,operationId),
 ]);
 return {rows:new Map((records.results as NativeRow[]).map(r=>[r.record_id,r])),journals:new Map((saves.results as Journal[]).map(j=>[j.id,j]))};
}
function checkedJournal(j:Journal,operationId:string,id:string){const before=JSON.parse(j.before_json),patch=JSON.parse(j.patch_json);if(j.status!=='done'||before.kind!==kind||patch.kind!==kind||patch.batchHash!==batchHash||patch.operationId!==operationId||j.record_id!==id||!equal(patch.claimIds,claims.filter(c=>c.memberId===id).map(c=>c.id)))fail('JOURNAL_CONFLICT','这次更新的记录无法核对，已暂停。');const expected={...before.fields,...patch.fields};return {before,patch,expected};}
/** Status always reads the actual row; a journal's verified flag is never evidence. */
export async function careerStatus(userId:string,operationId:string){
 operation(operationId);const {control}=await context(userId),read=await readBatch(userId,operationId,control.active_snapshot!),rows=[];
 for(const id of memberIds){
  const j=read.journals.get(rowId(operationId,id));if(!j){rows.push({memberId:id,state:'pending',rollbackEligible:false,conflictReason:null});continue;}
  const {before,patch,expected}=checkedJournal(j,operationId,id),row=read.rows.get(id),raw=row?JSON.parse(row.fields_json):{},rollback=read.journals.get(rowId(operationId,id,true));
  const sameSnapshot=before.nativeStorage.snapshot===control.active_snapshot;
  const targetsMatch=Object.keys(patch.fields).every(k=>equal(raw[k]??null,(rollback?before.fields:patch.fields)[k]??null));
  const rollbackEligible=!!row&&sameSnapshot&&!rollback&&targetsMatch;
  const state=!row||!sameSnapshot?'conflict':rollback?targetsMatch?'rolled_back':'conflict':equal(raw,expected)?'verified':'conflict';
  const conflictReason=state!=='conflict'?null:!row?'missing_row':!sameSnapshot?'snapshot_changed':!targetsMatch?'target_fields_changed':'untouched_fields_changed';
  rows.push({memberId:id,state,rollbackEligible,conflictReason});
 }
 await assertSourceUnchanged(userId,control);return {operationId,rows,complete:rows.every(r=>r.state==='verified'),applied:rows.filter(r=>r.state==='verified').length,recorded:rows.filter(r=>r.state!=='pending').length,total:memberIds.length};
}

type Expectation={snapshot:string;epoch:number;schemaHash:string;batchHash:string};
function expectation(p:Awaited<ReturnType<typeof context>>):Expectation{return {snapshot:p.control.active_snapshot!,epoch:p.control.epoch,schemaHash:researchHash(p.schemaJSON),batchHash};}
async function prepare(userId:string,operationId:string,revisions?:Record<string,string>,expected?:Expectation){
 const c=await context(userId);if(revisions&&(!expected||!equal(expected,expectation(c))))fail('PREVIEW_CHANGED','预览之后资料存储或格式有变化，请重新预览。');const observedAtMs=Date.now(),read=await readBatch(userId,operationId,c.control.active_snapshot!),rows=new Map<string,NativeRow>(),current:Record<string,any>={},pendingClaims=[],completed=[];
 for(const id of memberIds){const row=read.rows.get(id);if(!row)fail('RECORD_NOT_FOUND','成员资料不存在，请重新核对。');const raw=JSON.parse(row.fields_json),j=read.journals.get(rowId(operationId,id));rows.set(id,row);if(j){const {before,expected}=checkedJournal(j,operationId,id);if(before.nativeStorage.snapshot!==c.control.active_snapshot||!equal(raw,expected)||read.journals.has(rowId(operationId,id,true)))fail('READBACK_CONFLICT','已更新的成员后来发生变化，请先核对本次状态。');completed.push(id);continue;}if(revisions&&revisions[id]!==row.revision)fail('PREVIEW_CHANGED','预览之后资料有变化，请重新预览。');current[id]=careerProjection(id,raw);pendingClaims.push(...claims.filter(claim=>claim.memberId===id));}
 const plan=planBatch(pendingClaims,current,{adoptedClaimHashes:trustedHashes,availableSourceIds:sourceIds,roleOptions:c.fields.find(f=>f.field_id===F.members.role)?.property?.options?.map(o=>o.name)??[],observedAtMs,nowMs:Date.now()});
 await assertSourceUnchanged(userId,c.control);if(!plan.ok)fail('CAREER_GUARD_REJECTED','当前公开资料与审核基线不同，本批未继续写入。');
 const groups=new Map<string,{row:NativeRow;fields:Record<string,unknown>;changes:any[]}>();
 for(const p of plan.plans as any[]){let entry=groups.get(p.memberId);if(!entry){entry={row:rows.get(p.memberId)!,fields:{},changes:[]};groups.set(p.memberId,entry);}entry.fields[publicIds[p.field]]=p.field==='officialUrl'?{link:p.value,text:p.value,type:'url'}:p.value;entry.changes.push({field:p.field,before:current[p.memberId].publicFields[p.field],after:p.value});}
 return {...c,rows,groups,completed};
}
export async function careerPreview(userId:string,operationId:string){operation(operationId);const p=await prepare(userId,operationId);return {operationId,expected:expectation(p),batchHash,claimCount:claims.length,memberCount:memberIds.length,revisions:Object.fromEntries([...p.rows].map(([id,row])=>[id,row.revision])),rows:[...p.groups].map(([id,g])=>({memberId:id,name:asText(JSON.parse(g.row.fields_json)[F.members.stageName]),changes:g.changes})),applied:p.completed.length};}
export async function careerApply(userId:string,operationId:string,revisions:Record<string,string>,expected:Expectation){operation(operationId);if(!revisions||typeof revisions!=='object'||Array.isArray(revisions)||Object.keys(revisions).length!==memberIds.length||memberIds.some(id=>typeof revisions[id]!=='string'||!/^[a-f0-9]{64}$/.test(revisions[id])))fail('PREVIEW_REQUIRED','请先预览这批资料。');const p=await prepare(userId,operationId,revisions,expected);
 for(const [id,g]of [...p.groups].slice(0,8)){const raw=JSON.parse(g.row.fields_json),next={...raw,...g.fields},operation=rowId(operationId,id),patch={kind,batchHash,operationId,claimIds:claims.filter(c=>c.memberId===id).map(c=>c.id),fields:g.fields},requestHash=researchHash({patch,revision:g.row.revision}),revision=await nativeRevision(p.control.active_snapshot!,'members',id,g.row.version+1,next);
 try{await commitMemberRow({userId,control:p.control,row:g.row,operationId:operation,requestHash,next,nextRevision:revision,schemaJSON:p.schemaJSON,before:{kind,fields:raw,nativeStorage:{snapshot:p.control.active_snapshot,version:g.row.version,epoch:p.control.epoch}},patch,result:{operationId,recordId:id,revision}});const actual=await nativeRow(p.control.active_snapshot!,'members',id);if(!equal(JSON.parse(actual.fields_json),next))fail('READBACK_CONFLICT','保存后的资料需要核对。');}catch{return {...await careerStatus(userId,operationId),interrupted:true};}
 }
 return careerStatus(userId,operationId);
}
/** Roll back only this batch's public keys, preserving every later unrelated edit. */
export async function careerRollback(userId:string,operationId:string){operation(operationId);const p=await context(userId);let written=0;for(const id of memberIds){if(written>=8)break;const j=await journal(userId,operationId,id);if(!j||await journal(userId,operationId,id,true))continue;const {before,patch}=checkedJournal(j,operationId,id);if(before.nativeStorage.snapshot!==p.control.active_snapshot)fail('STORAGE_CHANGING','资料存储已变化，不能恢复旧记录。');const row=await nativeRow(p.control.active_snapshot!,'members',id),raw=JSON.parse(row.fields_json);if(Object.keys(patch.fields).some(k=>!equal(raw[k]??null,patch.fields[k]??null)))fail('ROLLBACK_CONFLICT','本次更新的公开字段后来又被修改，请先核对。');const next={...raw};for(const key of Object.keys(patch.fields)){if(Object.hasOwn(before.fields,key))next[key]=before.fields[key];else delete next[key];}const revision=await nativeRevision(p.control.active_snapshot!,'members',id,row.version+1,next);await commitMemberRow({userId,control:p.control,row,operationId:rowId(operationId,id,true),requestHash:researchHash({kind,operationId,id,rollback:true}),next,nextRevision:revision,schemaJSON:p.schemaJSON,before:{kind:kind+'-rollback',fields:raw},patch:{kind:kind+'-rollback',operationId},result:{operationId,recordId:id,revision}});const actual=await nativeRow(p.control.active_snapshot!,'members',id);if(!equal(JSON.parse(actual.fields_json),next))fail('READBACK_CONFLICT','恢复后的资料需要核对。');written++;}return careerStatus(userId,operationId);}
