import {listAll,listFields,AppError,TABLES,TableKey,FeishuRecord} from './feishu';
import {EDITABLE} from './fields';
import {asText,asNumber,asEditableText} from './values';
export type Field={field_id:string;field_name:string;type:number;property?:{table_id?:string;options?:{id:string;name:string}[]}};
const schemaCache=new Map<TableKey,{time:number;fields:Field[]}>();
export async function schema(table:TableKey,force=false,signal?:AbortSignal):Promise<Field[]>{const old=schemaCache.get(table);if(!force&&old&&Date.now()-old.time<60000)return old.fields;const fields=await listFields(table,signal);schemaCache.set(table,{time:Date.now(),fields});return fields;}
export function byId(record:FeishuRecord,fields:Field[]){const values:Record<string,unknown>={};for(const f of fields)values[f.field_id]=record.fields[f.field_id]??record.fields[f.field_name]??null;return values;}
export async function liveTables(signal?:AbortSignal){
 const result:Record<string,unknown>={};
 // Start the longest page-token chains first. Both slots share feishu.api's
 // existing request gate; pagination within each table stays serial.
 const order:TableKey[]=['ratings','works','groups','members'];let next=0,failed=false;
 async function readSlot(){
  while(!failed&&next<order.length){const key=order[next++];try{
   const fields=await schema(key,false,signal);const records=await listAll(key,signal);
   result[key]={fields,records:records.map(r=>({recordId:r.record_id,fields:byId(r,fields)}))};
  }catch(error){failed=true;throw error;}}
 }
 await Promise.all([readSlot(),readSlot()]);
 // No partial catalog on failure, and completion order never changes output order.
 return Object.fromEntries((Object.keys(TABLES) as TableKey[]).map(key=>[key,result[key]])) as Record<TableKey,{fields:Field[];records:{recordId:string;fields:Record<string,unknown>}[]}>;
}
export function editableValues(table:TableKey,record:FeishuRecord,fields:Field[]){const values=byId(record,fields);return Object.fromEntries(Object.entries(EDITABLE[table]).map(([key,def])=>[key,def.type==='number'||def.type==='numeric_text'?asNumber(values[def.id]):asEditableText(values[def.id])]));}
export function validatePatch(table:TableKey,input:unknown,fields:Field[]){if(!input||Array.isArray(input)||typeof input!=='object')throw new AppError('INVALID_PATCH','保存内容无效。',400);const entries=Object.entries(input);if(!entries.length||entries.length>4)throw new AppError('INVALID_PATCH','每次只保存当前记录的评分或备注。',400);const patch:Record<string,unknown>={};for(const [key,value] of entries){const def=EDITABLE[table][key];if(!def)throw new AppError('FIELD_NOT_ALLOWED','该字段不允许通过手帐修改。',400);const f=fields.find(x=>x.field_id===def.id);if(!f||!def.types.includes(f.type))throw new AppError('SCHEMA_CHANGED','飞书字段结构已变化，本次未保存。',409);if(def.type==='number'||def.type==='numeric_text'){if(value!==null&&(typeof value!=='number'||!Number.isFinite(value)||value<0||value>10))throw new AppError('INVALID_SCORE','评分须为 0 到 10，留空表示未评分。',400);patch[f.field_name]=f.type===1?(value===null?'':String(value)):value;}else{if(typeof value!=='string'||value.length>20000)throw new AppError('INVALID_TEXT','备注过长或格式无效。',400);if(def.type==='select'&&!f.property?.options?.some(o=>o.name===value))throw new AppError('INVALID_STATUS','请选择飞书已有的观看状态。',400);patch[f.field_name]=value;}}return patch;}
export function matchesPatch(record:FeishuRecord,patch:Record<string,unknown>){return Object.entries(patch).every(([key,value])=>typeof value==='number'?asNumber(record.fields[key])===value:value===null?record.fields[key]===null||record.fields[key]===undefined||asText(record.fields[key])==='':asText(record.fields[key])===String(value));}
