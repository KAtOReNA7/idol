import {stable} from './hash';
import type {Field} from './live';
import type {NativeTables} from './native-format';
// Comparison only. The Search value is never flattened, rewritten, or discarded.
// Official model: bitable-record-data-structure-overview; legacy GET list.
function decimal(v:unknown):string|null{
 if(typeof v!=='string'&&typeof v!=='number'||typeof v==='number'&&(!Number.isFinite(v)||Number.isInteger(v)&&!Number.isSafeInteger(v)))return null;
 const s=String(v);if(s.length>512)return null;const m=/^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);if(!m)return null;
 let digits=(m[2]+(m[3]??'')).replace(/^0+/,'');if(!digits)return '0';let exponent=Number(m[4]??0)-(m[3]?.length??0);if(!Number.isSafeInteger(exponent)||Math.abs(exponent)>10000)return null;
 while(digits.endsWith('0')){digits=digits.slice(0,-1);exponent++;}return m[1]+digits+'e'+exponent;
}
function keysOnly(o:unknown,keys:string[]){return !!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));}
function legacyText(v:unknown,autoDomainLabel=false):string|null{
 if(!Array.isArray(v)||!v.length)return null;let out='';
 for(const s of v){if(!s||typeof s!=='object'||typeof s.text!=='string')return null;
  if(s.type==='text'&&keysOnly(s,['type','text']))out+=s.text;
  else if(s.type==='url'&&keysOnly(s,['type','text','link'])&&typeof s.link==='string'&&s.link.length>0)out+=autoDomainLabel&&/^(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(s.text)&&s.link==='http://'+s.text?s.text:s.link;
  else return null; // Mentions/unknown segments are not guessed from a label.
 }return out;
}
function legacyIds(value:unknown,tableId:string):string[]|null{
 if(!Array.isArray(value)||!value.length)return null;const ids:string[]=[];
 for(const v of value){if(!keysOnly(v,['record_ids','table_id','text','text_arr','type'])||v.table_id!==tableId||v.type!=='text'||!Array.isArray(v.text_arr)||v.text_arr.some((x:unknown)=>typeof x!=='string'))return null;
  if(Object.hasOwn(v,'record_ids')){if(!Array.isArray(v.record_ids)||v.record_ids.some((x:unknown)=>typeof x!=='string'||!/^rec[A-Za-z0-9]+$/.test(x)))return null;if(v.record_ids.length===0&&(v.text_arr.length||Object.hasOwn(v,'text')))return null;ids.push(...v.record_ids);}
  else if(v.text_arr.length||Object.hasOwn(v,'text'))return null;
 }return ids;
}
export type EquivalenceReason='identical'|'text-segments'|'exact-decimal'|'same-relationship-ids'|'observed-empty-relationship'|'typed-single-number'|'typed-rich-text'|'same-attachment-identity'|'tagged-url'|'recomputed-work-mean'|'recomputed-work-difference'|'automatic-domain-link'|'recomputed-group-mean'|'unconfirmed';
function finiteJson(v:unknown,depth=0):boolean{if(depth>32)return false;if(typeof v==='number')return Number.isFinite(v);if(Array.isArray(v))return v.every(x=>finiteJson(x,depth+1));if(v&&typeof v==='object')return Object.values(v).every(x=>finiteJson(x,depth+1));return true;}
export function searchEquivalent(field:Field,before:unknown,after:unknown):EquivalenceReason{
 if(!finiteJson(before)||!finiteJson(after))return 'unconfirmed';
 if(typeof after==='number'&&Number.isInteger(after)&&!Number.isSafeInteger(after))return 'unconfirmed';
 if(stable(before)===stable(after))return 'identical';
 if(field.type===15&&keysOnly(before,['link','text'])&&keysOnly(after,['link','text','type'])){const a=before as {link:unknown;text:unknown},b=after as {link:unknown;text:unknown;type:unknown};if(typeof a.link==='string'&&typeof a.text==='string'&&b.type==='url'&&a.link===b.link&&a.text===b.text)return 'tagged-url';}
 if(field.type===1&&typeof before==='string'&&legacyText(after)===before)return 'text-segments';
 if(field.type===1&&typeof before==='string'&&legacyText(after,true)===before)return 'automatic-domain-link';
 if(field.type===2&&typeof after==='number'){const a=decimal(before),b=decimal(after);if(a!==null&&a===b)return 'exact-decimal';}
 if([18,21].includes(field.type)&&typeof field.property?.table_id==='string'&&keysOnly(after,['link_record_ids'])){
  const ids=legacyIds(before,field.property.table_id);if(ids!==null){const o=after as {link_record_ids?:unknown};if(!Object.hasOwn(o,'link_record_ids')){if(ids.length===0)return 'observed-empty-relationship';}
   else if(Array.isArray(o.link_record_ids)&&o.link_record_ids.every(x=>typeof x==='string'&&/^rec[A-Za-z0-9]+$/.test(x))&&stable(ids)===stable(o.link_record_ids))return 'same-relationship-ids';}
 }
 if([19,20].includes(field.type)&&keysOnly(after,['type','ui_type','value'])){
  const o=after as {type:unknown;ui_type?:unknown;value:unknown};if(Array.isArray(o.value)){
   if(o.type===2&&(o.ui_type===undefined||typeof o.ui_type==='string'&&['Number','Progress','Currency','Rating'].includes(o.ui_type))&&o.value.length===1&&typeof before==='number'&&typeof o.value[0]==='number'&&Number.isFinite(before)&&(!Number.isInteger(before)||Number.isSafeInteger(before))&&(!Number.isInteger(o.value[0])||Number.isSafeInteger(o.value[0]))&&before===o.value[0])return 'typed-single-number';
   if(o.type===1&&(o.ui_type===undefined||typeof o.ui_type==='string'&&['Text','Barcode','Email'].includes(o.ui_type))&&Array.isArray(before)&&stable(before)===stable(o.value))return 'typed-rich-text';
  }
 }
 if(field.type===17&&Array.isArray(before)&&Array.isArray(after)&&before.length===after.length&&before.every((a,i)=>{
  const b=after[i],keys=['file_token','name','type','size','url','tmp_url'];if(!keysOnly(a,keys)||!keysOnly(b,keys))return false;
  if(!['file_token','name','type','size'].every(k=>Object.hasOwn(a,k)&&Object.hasOwn(b,k)&&stable(a[k])===stable(b[k])))return false;
  return ['url','tmp_url'].every(k=>(!Object.hasOwn(a,k)||typeof a[k]==='string')&&(!Object.hasOwn(b,k)||typeof b[k]==='string'));
 }))return 'same-attachment-identity';
 return 'unconfirmed';
}

const groupMeanFormula='IF(bitable::$table[tbl5uwKCLEq7buNy].$field[flddw3P5Wr]=0,"",bitable::$table[tbl5uwKCLEq7buNy].$field[fldatZPfK6]/bitable::$table[tbl5uwKCLEq7buNy].$field[flddw3P5Wr])';
export function searchCellEquivalent(field:Field,before:unknown,after:unknown,oldFields:Record<string,unknown>,newFields:Record<string,unknown>,schema:Field[]):EquivalenceReason{
 const basic=searchEquivalent(field,before,after);if(basic!=='unconfirmed')return basic;
 // Only the observed group-mean formula, proved by unchanged source inputs.
 // Keep both original representations; no tolerance or generic rounding rule.
 if(field.field_id!=='fldtxd9aef'||field.type!==20||(field.property as Record<string,unknown>|null)?.formula_expression!==groupMeanFormula||!keysOnly(after,['type','ui_type','value']))return 'unconfirmed';
 const o=after as {type:unknown;ui_type?:unknown;value:unknown};if(o.type!==2||o.ui_type!==undefined&&o.ui_type!=='Number'||!Array.isArray(o.value)||o.value.length!==1||typeof before!=='number'||!Number.isFinite(before)||typeof o.value[0]!=='number'||!Number.isFinite(o.value[0]))return 'unconfirmed';
 const ids=['fldatZPfK6','flddw3P5Wr'];const values:number[]=[];
 for(const id of ids){const f=schema.find(x=>x.field_id===id),a=oldFields[id],b=newFields[id];if(!f||![19,20].includes(f.type)||typeof a!=='number'||!Number.isFinite(a)||Math.abs(a)>Number.MAX_SAFE_INTEGER||searchEquivalent(f,a,b)==='unconfirmed')return 'unconfirmed';values.push(a);}
 const [sum,count]=values;if(!Number.isSafeInteger(count)||count<=0)return 'unconfirmed';const full=sum/count;
 return full===o.value[0]&&Number(full.toPrecision(15))===before?'recomputed-group-mean':'unconfirmed';
}

const workMeanFormula='bitable::$table[tbl5uwKCLEq7buNy].FILTER(CurrentValue.$column[fld67LEUaG]=bitable::$table[tbl4094oMWoPJQl7].$field[fld2wy1cqw]).$column[fldtxd9aef].LISTCOMBINE().AVERAGE()';
const workDifferenceFormula='IF(ISBLANK(bitable::$table[tbl4094oMWoPJQl7].$field[fld38CJY2U]),"",bitable::$table[tbl4094oMWoPJQl7].$field[fld38CJY2U]-bitable::$table[tbl4094oMWoPJQl7].$field[fldjiwjiTr])';
function typedNumber(v:unknown):number|null{if(!keysOnly(v,['type','ui_type','value']))return null;const o=v as {type:unknown;ui_type?:unknown;value:unknown};return o.type===2&&(o.ui_type===undefined||o.ui_type==='Number')&&Array.isArray(o.value)&&o.value.length===1&&typeof o.value[0]==='number'&&Number.isFinite(o.value[0])&&(!Number.isInteger(o.value[0])||Number.isSafeInteger(o.value[0]))?o.value[0]:null;}
export function searchArchiveCellEquivalent(table:string,field:Field,before:unknown,after:unknown,oldFields:Record<string,unknown>,newFields:Record<string,unknown>,schema:Field[],oldTables:NativeTables,newTables:NativeTables):EquivalenceReason{
 const basic=searchCellEquivalent(field,before,after,oldFields,newFields,schema);if(basic!=='unconfirmed')return basic;
 if(table!=='works'||!['fldjiwjiTr','fld2DrkaHm'].includes(field.field_id)||typeof before!=='number'||!Number.isFinite(before)||Math.abs(before)>Number.MAX_SAFE_INTEGER)return 'unconfirmed';
 const current=typedNumber(after);if(current===null)return 'unconfirmed';
 const lookup=schema.find(f=>f.field_id==='fldjiwjiTr'),relation=schema.find(f=>f.field_id==='fld2wy1cqw'),gp=lookup?.property as Record<string,unknown>|null;
 if(!lookup||lookup.type!==19||gp?.formula!==workMeanFormula||gp.target_field!=='fldtxd9aef'||gp.roll_up!==3||!relation||![18,21].includes(relation.type)||relation.property?.table_id!=='tbl5uwKCLEq7buNy'||searchEquivalent(relation,oldFields.fld2wy1cqw,newFields.fld2wy1cqw)!=='same-relationship-ids')return 'unconfirmed';
 const ids=legacyIds(oldFields.fld2wy1cqw,'tbl5uwKCLEq7buNy');if(ids?.length!==1)return 'unconfirmed';
 const og=oldTables.groups,ng=newTables.groups,oldGroup=og.records.find(r=>r.recordId===ids[0])?.fields,newGroup=ng.records.find(r=>r.recordId===ids[0])?.fields,mean=og.fields.find(f=>f.field_id==='fldtxd9aef'),title=og.fields.find(f=>f.field_id==='fld67LEUaG');
 if(!oldGroup||!newGroup||!mean||mean.type!==20||(mean.property as Record<string,unknown>|null)?.formula_expression!==groupMeanFormula||!title||title.type!==1||typeof oldGroup.fld67LEUaG!=='string'||searchEquivalent(title,oldGroup.fld67LEUaG,newGroup.fld67LEUaG)==='unconfirmed'||og.records.filter(r=>r.fields.fld67LEUaG===oldGroup.fld67LEUaG).length!==1)return 'unconfirmed';
 const relationValue=oldFields.fld2wy1cqw as {text_arr?:unknown}[];if(relationValue.length!==1||stable(relationValue[0].text_arr)!==stable([oldGroup.fld67LEUaG])||ng.records.filter(r=>searchEquivalent(title,oldGroup.fld67LEUaG,r.fields.fld67LEUaG)!=='unconfirmed').length!==1)return 'unconfirmed';
 for(const id of ['fldatZPfK6','flddw3P5Wr']){const f=og.fields.find(f=>f.field_id===id),a=oldGroup[id],b=newGroup[id];if(!f||![19,20].includes(f.type)||typeof a!=='number'||!Number.isFinite(a)||Math.abs(a)>Number.MAX_SAFE_INTEGER||searchEquivalent(f,a,b)==='unconfirmed')return 'unconfirmed';}
 const sum=oldGroup.fldatZPfK6 as number,count=oldGroup.flddw3P5Wr as number;if(!Number.isSafeInteger(count)||count<=0)return 'unconfirmed';const fullMean=sum/count;
 if(typedNumber(newGroup.fldtxd9aef)!==fullMean||searchCellEquivalent(mean,oldGroup.fldtxd9aef,newGroup.fldtxd9aef,oldGroup,newGroup,og.fields)==='unconfirmed'||oldFields.fldjiwjiTr!==oldGroup.fldtxd9aef||typedNumber(newFields.fldjiwjiTr)!==fullMean)return 'unconfirmed';
 let expected=fullMean,reason:EquivalenceReason='recomputed-work-mean';
 if(field.field_id==='fld2DrkaHm'){const score=schema.find(f=>f.field_id==='fld38CJY2U');if(field.type!==20||(field.property as Record<string,unknown>|null)?.formula_expression!==workDifferenceFormula||!score||score.type!==2||typeof newFields.fld38CJY2U!=='number'||searchEquivalent(score,oldFields.fld38CJY2U,newFields.fld38CJY2U)==='unconfirmed')return 'unconfirmed';expected=(newFields.fld38CJY2U as number)-fullMean;reason='recomputed-work-difference';}
 return current===expected&&(before===expected||before===Number(expected.toPrecision(15)))?reason:'unconfirmed';
}
