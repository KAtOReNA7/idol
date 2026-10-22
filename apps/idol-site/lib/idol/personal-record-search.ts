import type {CatalogView} from './types';
import {memberDisplayName} from './member-display-name';

export type PersonalRecord = {
 id:string;
 kind:'work'|'member'|'rating';
 fields:{label:string;text:string;normalized:string}[];
 works:{id:string;name:string}[];
 members:{id:string;name:string}[];
 groups:string[];
};
export type PersonalRecordMatch = Omit<PersonalRecord,'fields'> & {matches:{label:string;excerpt:string}[]};
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().trim();

// Only caller-provided, already authorized catalog data. No transport, persistence,
// public profiles, titles, scores or inferred preferences are searched.
export function indexPersonalRecords(data:CatalogView|null):PersonalRecord[]{
 if(!data)return [];
 const works=new Map(data.works.filter(w=>!w.placeholder).map(w=>[w.id,w]));
 const members=new Map(data.members.map(m=>[m.id,m]));
 const groups=new Map(data.groups.map(g=>[g.id,g.name]));
 const records:PersonalRecord[]=[];
 const add=(id:string,kind:PersonalRecord['kind'],values:[string,string][],workIds:string[],memberIds:string[])=>{
  const fields=values.filter(([,text])=>typeof text==='string'&&text.trim()).map(([label,text])=>({label,text,normalized:normalize(text)}));
  if(!fields.length)return;
  const linkedWorks=[...new Set(workIds)].flatMap(id=>works.has(id)?[works.get(id)!]:[]);
  const linkedMembers=[...new Set(memberIds)].flatMap(id=>members.has(id)?[members.get(id)!]:[]);
  records.push({id,kind,fields,works:linkedWorks.map(w=>({id:w.id,name:w.song||w.name})),members:linkedMembers.map(m=>({id:m.id,name:memberDisplayName(m)})),groups:[...new Set([...linkedWorks,...linkedMembers].flatMap(x=>x.groupIds))].flatMap(id=>groups.has(id)?[groups.get(id)!]:[])});
 };
 for(const work of works.values())add(work.id,'work',[['作品点评',work.note]],[work.id],[]);
 for(const member of members.values())add(member.id,'member',[['成员备注',member.note]],[],[member.id]);
 for(const rating of data.ratings)add(rating.id,'rating',[['记忆点',rating.memory],['评分备注',rating.note]],rating.workIds,rating.memberIds);
 return records;
}
function excerpt(text:string,query:string):string{
 // Work in normalized code points so full-width letters and composed Unicode match,
 // and a snippet never cuts a surrogate pair. Keep the original letter case.
 const chars=Array.from(text.normalize('NFKC'));
 let folded='',start=0;const offsets:number[]=[];
 chars.forEach((char,index)=>{const lower=char.toLowerCase();for(let n=0;n<lower.length;n++)offsets.push(index);folded+=lower;});
 const match=folded.indexOf(query);if(match>=0)start=Math.max(0,(offsets[match]??0)-36);
 const end=Math.min(chars.length,start+160);
 return (start?'…':'')+chars.slice(start,end).join('')+(end<chars.length?'…':'');
}
// A lightweight hit keeps matching fields in memory, without building excerpts.
// The normalized query travels with its hits so later paging cannot use a stale query.
export type PersonalRecordHit = {record:PersonalRecord;fields:PersonalRecord['fields'];term:string};
export function matchPersonalRecords(index:readonly PersonalRecord[],query:string):PersonalRecordHit[]{
 const term=normalize(query).slice(0,200);
 if(!term)return [];
 return index.flatMap(record=>{
  const fields=record.fields.filter(field=>field.normalized.includes(term));
  return fields.length?[{record,fields,term}]:[];
 });
}
export function materializePersonalRecordMatches(hits:readonly PersonalRecordHit[],limit=hits.length):PersonalRecordMatch[]{
 const count=Number.isFinite(limit)?Math.max(0,Math.floor(limit)):0;
 return hits.slice(0,count).map(({record,fields,term})=>({
  id:record.id,kind:record.kind,works:record.works,members:record.members,groups:record.groups,
  matches:fields.map(field=>({label:field.label,excerpt:excerpt(field.text,term)})),
 }));
}
// Preserve the original public API: every returned match has complete excerpts.
export function searchPersonalRecords(index:readonly PersonalRecord[],query:string):PersonalRecordMatch[]{
 return materializePersonalRecordMatches(matchPersonalRecords(index,query));
}
