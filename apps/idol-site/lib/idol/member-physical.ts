import type {Member} from './types';
export type PhysicalKey='heightCm'|'weightKg'|'bustCm'|'waistCm'|'hipsCm';
export type PhysicalMeasurement={value:number;sourceUrl:string;sourceTitle:string;sourceKind:'official'|'self_disclosed';publishedAt?:string;checkedAt:string;scope:string};
export type MemberPhysicalRecord={recordId:string;stageName:string;verified:true;measurements:Partial<Record<PhysicalKey,PhysicalMeasurement>>};
const labels:Record<PhysicalKey,string>={heightCm:'身高',weightKg:'体重',bustCm:'胸围',waistCm:'腰围',hipsCm:'臀围'};
const date=(value:string|undefined)=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value?value:null;
const adult=(birth:string,at:string)=>{const b=date(birth),d=date(at);return !!b&&!!d&&d>=`${Number(b.slice(0,4))+18}${b.slice(4)}`;};
function safeSource(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
// Curated display evidence, never inferred from photos or used to modify the database.
export function memberPhysicalFacts(member:Pick<Member,'id'|'stageName'|'birthDate'>,record:MemberPhysicalRecord|undefined,today=new Date().toISOString().slice(0,10)){
 if(!record||record.verified!==true||record.recordId!==member.id||record.stageName!==member.stageName||!record.measurements)return [];
 return (Object.keys(labels) as PhysicalKey[]).flatMap(key=>{const m=record.measurements[key];if(!m||typeof m.value!=='number'||!Number.isFinite(m.value)||m.value<=0||!safeSource(m.sourceUrl)||!m.sourceTitle?.trim()||!m.scope?.trim()||!['official','self_disclosed'].includes(m.sourceKind)||!date(m.checkedAt)||m.checkedAt>today||m.publishedAt&&(!date(m.publishedAt)||m.publishedAt>today))return [];
  if(['bustCm','waistCm','hipsCm'].includes(key)&&(!m.publishedAt||!adult(member.birthDate,m.publishedAt)||!adult(member.birthDate,today)))return [];
  return [{key,label:labels[key],value:m.value,unit:key==='weightKg'?'kg':'cm',sourceUrl:m.sourceUrl,sourceTitle:m.sourceTitle,publishedAt:m.publishedAt??null,checkedAt:m.checkedAt,scope:m.scope}];});
}
