import {AppError,type TableKey} from './feishu';
import {searchEquivalent,searchCellEquivalent,searchArchiveCellEquivalent} from './search-equivalence';
import {stable} from './hash';
import type {ArchiveData} from './native-format';
import type {SourcePart} from './cutover-pages';
const tables:TableKey[]=['groups','members','works','ratings'];
const protectedIds=new Set(['fld3SVWhWc','fld1yLzS5g','fld6bHl8sq','fld38CJY2U','fld641ausT','fld4yOdHT5','fld3QKrpLN','fld7E8yx1a','fld49NJY1j','fld1L5cSac','fld3y0fn7i']);
function kind(v:unknown){return v===null||v===undefined?'null':Array.isArray(v)?'array':typeof v;}
function fail(scope:string,counts:Record<string,number>){try{console.info(JSON.stringify({event:'idol_search_compatibility',scope,...counts}));}catch{}throw new AppError('SOURCE_READ_FAILED','新读取接口与完整备份的字段或记录尚未对应，已停止迁移核对。',503);}
// First real Search page must demonstrate ordinary values retain the existing
// representation. No automatic rich-text flattening or source data mutation.
const safeKeys=new Set(['text','type','ui_type','mentionType','mentionNotify','link','record_ids','link_record_ids','record_id','value','value_type','options','number','id','name','file_token','url','tmp_url','size','width','height','token','mime_type','en_name','zh_name','avatar_url','data']);
function shape(v:unknown,depth=0):string{const k=kind(v);if(depth>2)return k;if(Array.isArray(v))return 'array['+[...new Set(v.slice(0,20).map(x=>shape(x,depth+1)))].sort().join('|')+']';if(v&&typeof v==='object'){const o=v as Record<string,unknown>,keys=Object.keys(o);return 'object{'+keys.filter(x=>safeKeys.has(x)).sort().map(x=>x+':'+shape(o[x],depth+1)).join(',')+(keys.some(x=>!safeKeys.has(x))?',other-keys':'')+'}';}return k;}
export function inspectSearchGroupProbe(baseline:ArchiveData,p:SourcePart){
 const semantic=p.binding.readApi==='search-all-fields-open-id-no-auto-v2';
 const old=baseline.tables.groups,rows=p.items as {record_id:string;fields:Record<string,unknown>}[],byId=new Map(rows.map(r=>[r.record_id,r]));
 const counts={missingRows:old.records.filter(r=>!byId.has(r.recordId)).length,extraRows:rows.filter(r=>!old.records.some(x=>x.recordId===r.record_id)).length,duplicateRows:rows.length-byId.size,orderDifferences:old.records.filter((r,i)=>rows[i]?.record_id!==r.recordId).length,valueDifferences:0,typeDifferences:0,equivalentDifferences:0,unconfirmedDifferences:0};
 const reasons:Record<string,number>={};const types=new Map<string,{fieldType:number;before:string;after:string;count:number;plainTextEquivalent:number}>();
 for(const row of old.records){const now=byId.get(row.recordId);if(!now)continue;for(const f of old.fields){if(protectedIds.has(f.field_id))continue;const a=row.fields[f.field_id]??null,b=now.fields[f.field_id]??now.fields[f.field_name]??null;if(stable(a)!==stable(b)){counts.valueDifferences++;if(kind(a)!==kind(b))counts.typeDifferences++;const reason=semantic?searchCellEquivalent(f,a,b,row.fields,Object.fromEntries(old.fields.map(f=>[f.field_id,now.fields[f.field_id]??now.fields[f.field_name]??null])),old.fields):'unconfirmed';reasons[reason]=(reasons[reason]??0)+1;if(reason==='unconfirmed')counts.unconfirmedDifferences++;else counts.equivalentDifferences++;const before=shape(a),after=shape(b),fieldType=f.type,key=fieldType+':'+before+':'+after,item=types.get(key)??{fieldType,before,after,count:0,plainTextEquivalent:0};item.count++;if(typeof a==='string'&&Array.isArray(b)&&b.every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')==='text,type'&&x.type==='text'&&typeof x.text==='string')&&b.map(x=>x.text).join('')===a)item.plainTextEquivalent++;types.set(key,item);}}}
 return{compatible:!p.nextCursor&&counts.missingRows===0&&counts.extraRows===0&&counts.duplicateRows===0&&counts.orderDifferences===0&&counts.unconfirmedDifferences===0,counts,reasons,shapes:[...types.values()].sort((a,b)=>a.fieldType-b.fieldType||a.before.localeCompare(b.before)||a.after.localeCompare(b.after))};
}
export function assertSearchGroupProbe(baseline:ArchiveData,p:SourcePart){if(p.table!=='groups'||p.kind!=='records'||p.cursor!==null)return;const result=inspectSearchGroupProbe(baseline,p);if(!result.compatible)fail('first-groups-page',result.counts);}
// A successful empty/filtered response cannot become a migration baseline.
// New completed user patches are allowed only on original protected fields;
// unexplained factual/representation changes stop for review, never erase data.
export function inspectSearchArchive(baseline:ArchiveData,current:ArchiveData,readApi='search-all-fields-open-id-no-auto-v2'){
 const samples:unknown[]=[],shapes:Record<string,number>={},seen=new Set<string>();let bytes=0;
 const semantic=readApi==='search-all-fields-open-id-no-auto-v2';
 const counts={missingRows:0,extraRows:0,orderDifferences:0,schemaDifferences:0,valueDifferences:0,typeDifferences:0,journalDifferences:0,equivalentDifferences:0,unconfirmedDifferences:0,protectedUnconfirmed:0};
 const oldJournal=new Map(baseline.journal.map(r=>[r.id,r]));
 for(const [id,row]of oldJournal)if(!current.journal.some(r=>r.id===id&&stable(r)===stable(row)))counts.journalDifferences++;
 const patches=new Map<string,Record<string,unknown>>();
 for(const row of current.journal){if(oldJournal.has(row.id)||row.status!=='done')continue;const table=row.table_key as TableKey,source=baseline.tables[table];if(!source||typeof row.record_id!=='string'||typeof row.patch_json!=='string'){counts.journalDifferences++;continue;}let patch:Record<string,unknown>;try{patch=JSON.parse(row.patch_json);}catch{counts.journalDifferences++;continue;}if(!patch||typeof patch!=='object'||Array.isArray(patch)){counts.journalDifferences++;continue;}const key=table+':'+row.record_id,values=patches.get(key)??{};for(const [name,value]of Object.entries(patch)){const field=source.fields.find(f=>f.field_name===name);if(!field||!protectedIds.has(field.field_id)){counts.journalDifferences++;continue;}values[field.field_id]=value;}patches.set(key,values);}
 for(const table of tables){const old=baseline.tables[table],now=current.tables[table],rows=new Map(now.records.map(r=>[r.recordId,r.fields]));if(stable(old.fields)!==stable(now.fields))counts.schemaDifferences++;
 counts.orderDifferences+=old.records.filter((r,i)=>now.records[i]?.recordId!==r.recordId).length;counts.missingRows+=old.records.filter(r=>!rows.has(r.recordId)).length;counts.extraRows+=now.records.filter(r=>!old.records.some(x=>x.recordId===r.recordId)).length;
 for(const row of old.records){const actual=rows.get(row.recordId);if(!actual)continue;const expected={...row.fields,...patches.get(table+':'+row.recordId)};for(const field of old.fields){const a=expected[field.field_id]??null,b=actual[field.field_id]??null;if(stable(a)===stable(b))continue;const reason=semantic?searchArchiveCellEquivalent(table,field,a,b,row.fields,actual,old.fields,baseline.tables,current.tables):'unconfirmed';if(reason!=='unconfirmed'){counts.equivalentDifferences++;continue;}counts.unconfirmedDifferences++;if(protectedIds.has(field.field_id))counts.protectedUnconfirmed++;
 const signature=table+':'+field.field_id+':'+shape(a)+':'+shape(b);shapes[signature]=(shapes[signature]??0)+1;if(!protectedIds.has(field.field_id)&&!seen.has(signature)){seen.add(signature);const sample={table,recordId:row.recordId,field,before:a,after:b},size=new TextEncoder().encode(JSON.stringify(sample)).length;if(samples.length<20&&bytes+size<=32000){samples.push(sample);bytes+=size;}}
 // Derived changes also stop for review; a rating elsewhere is not proof
 // that Search retained this lookup/formula value.
 counts.valueDifferences++;if(kind(a)!==kind(b))counts.typeDifferences++;}}
 }
 return{counts,shapes,samples,sampleBytes:bytes};
}

// Private owner-only diagnostic, never logged or persisted. Only unresolved
// non-editable cells from the already stored first groups page are returned.
export function searchProbeDifferences(baseline:ArchiveData,p:SourcePart){
 const old=baseline.tables.groups,byId=new Map((p.items as {record_id:string;fields:Record<string,unknown>}[]).map(r=>[r.record_id,r]));
 const rows:{recordId:string;field:unknown;before:unknown;after:unknown}[]=[];let total=0,bytes=0;
 for(const row of old.records){const now=byId.get(row.recordId);if(!now)continue;for(const f of old.fields){if(protectedIds.has(f.field_id))continue;const before=row.fields[f.field_id]??null,after=now.fields[f.field_id]??now.fields[f.field_name]??null;if(searchCellEquivalent(f,before,after,row.fields,Object.fromEntries(old.fields.map(f=>[f.field_id,now.fields[f.field_id]??now.fields[f.field_name]??null])),old.fields)!=='unconfirmed')continue;total++;const item={recordId:row.recordId,field:f,before,after},size=new TextEncoder().encode(JSON.stringify(item)).length;if(rows.length<20&&bytes+size<=32000){rows.push(item);bytes+=size;}}}
 return{total,returned:rows.length,truncated:rows.length!==total,rows};
}

export function assertSearchArchiveCompatible(baseline:ArchiveData,current:ArchiveData,readApi='search-all-fields-open-id-no-auto-v2'){
 const {counts}=inspectSearchArchive(baseline,current,readApi);if(Object.entries(counts).some(([k,n])=>k!=='equivalentDifferences'&&n>0))fail('complete-archive',counts);return counts;
}
