import {commitMemberRow} from './member-row-write';
import {AppError} from './feishu';
import {F} from './fields';
import {asText} from './values';
import {hash} from './hash';
import {nativeDb,ownControl,nativeRow,nativeSchema,assertSourceUnchanged} from './native-storage';
import {nativeRevision} from './native-save';
import type {Field} from './live';
const FACTS={cnName:{id:F.members.cnName,type:1},country:{id:F.members.country,type:4},birthDate:{id:F.members.birthDate,type:5},role:{id:F.members.role,type:4},status:{id:F.members.status,type:3}} as const;
function choices(v:unknown){return Array.isArray(v)?v.map(asText).filter(Boolean):v?[asText(v)]:[];}
function dateText(v:unknown){if(v===null||v===undefined||v==='')return '';const n=typeof v==='number'?v:Number(v);if(!Number.isFinite(n))throw new AppError('FACT_DATE_INVALID','原生日格式需要先整理，未改动资料。',409);return new Date(n).toISOString().slice(0,10);}
export function factValues(raw:Record<string,unknown>){return {cnName:asText(raw[F.members.cnName]),country:choices(raw[F.members.country]),birthDate:dateText(raw[F.members.birthDate]),role:choices(raw[F.members.role]),status:asText(raw[F.members.status])};}
function options(fields:Field[],id:string){return (fields.find(f=>f.field_id===id)?.property?.options??[]).map(o=>o.name);}
export function validateFacts(values:unknown,raw:Record<string,unknown>,fields:Field[]){
 if(!values||typeof values!=='object'||Array.isArray(values)||!Object.keys(values).length)throw new AppError('INVALID_FACTS','请选择需要修改的资料。',400);
 const next={...raw};
 for(const [key,value] of Object.entries(values)){
  const spec=FACTS[key as keyof typeof FACTS];if(!spec)throw new AppError('FIELD_NOT_ALLOWED','这项资料不能在这里修改。',400);
  if(!fields.some(f=>f.field_id===spec.id&&f.type===spec.type))throw new AppError('SCHEMA_CHANGED','资料格式已变化，请重新打开。',409);
  if(spec.type===4){const allowed=new Set([...options(fields,spec.id),...choices(raw[spec.id])]);if(!Array.isArray(value)||value.length>40||value.some(v=>typeof v!=='string'||!allowed.has(v))||new Set(value).size!==value.length)throw new AppError('INVALID_FACTS','请使用已有选项，可以选择多个。',400);next[spec.id]=value;}
  else if(spec.type===5){if(value===''){next[spec.id]=null;continue;}if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value||value<'1900-01-01'||value>new Date().toISOString().slice(0,10))throw new AppError('INVALID_FACT_DATE','请填写完整、有效的出生日期。',400);next[spec.id]=Date.parse(value+'T00:00:00Z');}
  else if(spec.type===3){if(typeof value!=='string'||value!==''&&![...options(fields,spec.id),asText(raw[spec.id])].includes(value))throw new AppError('INVALID_FACTS','请选择已有活动状态。',400);next[spec.id]=value||null;}
  else {if(typeof value!=='string'||value.length>200)throw new AppError('INVALID_FACTS','中文名过长或格式无效。',400);next[spec.id]=value;}
 }
 return next;
}
export async function memberFactDetail(userId:string,id:string){const c=await ownControl(userId);if(c?.mode!=='native'||!c.active_snapshot)return {ready:false};const [row,fields]=await Promise.all([nativeRow(c.active_snapshot,'members',id),nativeSchema(c.active_snapshot,'members')]);const raw=JSON.parse(row.fields_json);await assertSourceUnchanged(userId,c);return {ready:true,recordId:id,revision:row.revision,name:asText(raw[F.members.stageName])||asText(raw[F.members.name]),values:factValues(raw),options:{country:options(fields,F.members.country),role:options(fields,F.members.role),status:options(fields,F.members.status)}};}
export async function saveMemberFacts(userId:string,input:any){
 const {recordId,revision,operationId,values}=input??{};if(typeof recordId!=='string'||typeof revision!=='string'||typeof operationId!=='string'||!/^rec[A-Za-z0-9]+$/.test(recordId??'')||!/^[a-f0-9]{64}$/.test(revision??'')||!/^[a-f0-9-]{36}$/.test(operationId??'')||Object.keys(input??{}).some(k=>!['recordId','revision','operationId','values'].includes(k)))throw new AppError('INVALID_FACTS','保存内容无效，请重新打开成员。',400);
 const c=await ownControl(userId);
 const db=nativeDb(),requestHash=await hash({kind:'member-facts',recordId,revision,values}),prior=await db.prepare('SELECT user_id,request_hash,status,result_json FROM idol_saves WHERE id=?').bind(operationId).first<{user_id:string;request_hash:string;status:string;result_json:string}>();
 if(prior){if(prior.user_id!==userId||prior.request_hash!==requestHash)throw new AppError('IDEMPOTENCY_CONFLICT','同一次保存内容不同，未重复修改。',409);if(prior.status!=='done')throw new AppError('SAVE_UNRESOLVED','上次保存还未确认，修改已保留。',409);return JSON.parse(prior.result_json);}
 if(c?.mode!=='native'||!c.active_snapshot)throw new AppError('STORAGE_CHANGING','资料正在整理，修改已保留，请稍后再试。',409);
 const [row,fields]=await Promise.all([nativeRow(c.active_snapshot,'members',recordId),nativeSchema(c.active_snapshot,'members')]);if(row.revision!==revision)throw new AppError('EDIT_CONFLICT','成员资料刚刚更新，修改已保留。请重新打开后再保存。',409);
 const raw=JSON.parse(row.fields_json),next=validateFacts(values,raw,fields),version=row.version+1,nextRevision=await nativeRevision(c.active_snapshot,'members',recordId,version,next),now=Date.now(),result={saved:true,verified:true,recordId,operationId,revision:nextRevision,values:factValues(next),savedAt:new Date(now).toISOString()};
 return JSON.parse(JSON.stringify(await commitMemberRow({userId,control:c,row,operationId,requestHash,next,nextRevision,before:{kind:'member-facts',fields:raw,nativeStorage:{snapshot:c.active_snapshot,version:row.version,epoch:c.epoch}},patch:{kind:'member-facts',values},result})));
}
