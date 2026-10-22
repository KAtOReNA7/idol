import reviewed from '@/data/versions/verified-display.json';
import {F} from './fields';
import {asText,asIds} from './values';
import type {Catalog,VersionDisplay} from './types';
import type {NativeTables} from './native-format';

// Public-only, reviewed baseline identities. Never import canonical research or
// held videos here. This module is called only by the native fresh-row reader,
// inside its existing owner/snapshot/epoch/generation and request-order fences.
const publicFields={name:F.works.name,song:F.works.song,url:F.works.url,videoType:F.works.videoType,version:F.works.version,releaseDate:F.works.releaseDate,officialTitle:F.works.officialTitle,channel:F.works.channel,channelUrl:'fld6Ab27Zx',performerUnit:'fld2UfUVYO',groupIds:F.works.groups} as const;
export const versionIdentityFields=['workId',...Object.keys(publicFields)] as const;
type Identity=typeof reviewed.identities[number];
const identities=new Map(reviewed.identities.map(row=>[row.workId,row]));
const tagRows=new Map(reviewed.tags.map(row=>[row.workId,row.tags]));
const relationLabels:Record<string,readonly [string,string]>={same_song_different_language:['其他语种','其他语种'],remix_of:['混音原曲','混音版'],performance_of:['MV 版本','表演版'],part_of_visual_sequence:['系列影像','系列影像']};
const equals=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function versionIdentityMatches(current:Record<string,unknown>,baseline:Identity){return versionIdentityFields.every(key=>Object.hasOwn(current,key)&&equals(current[key],baseline[key as keyof Identity]));}
function rawIdentity(row:NativeTables['works']['records'][number]):Record<string,unknown>|null{
 const result:Record<string,unknown>={workId:row.recordId};
 for(const [key,field] of Object.entries(publicFields)){
  // Missing raw cells are not silently interpreted as reviewed empty cells.
  if(!Object.hasOwn(row.fields,field))return null;
  const value=row.fields[field];
  if(key==='groupIds')result[key]=asIds(value);
  else if(key==='releaseDate'&&typeof value==='number'){
   if(!Number.isFinite(value))return null;
   try{result[key]=new Date(value).toISOString();}catch{return null;}
  }else result[key]=asText(value);
 }
 return result;
}
export function withVerifiedVersionDisplay(catalog:Catalog,tables:NativeTables):Catalog{
 // Clear any previously attached projection first; don't trust transport flags.
 const works=catalog.works.map(work=>{const base={...work};delete base.versionDisplay;return base;});
 const clean={...catalog,works};
 if(catalog.mode!=='live'||!Array.isArray(tables.works?.fields)||!Array.isArray(tables.works?.records))return clean;
 const schemaIds=new Set(tables.works.fields.map(field=>field.field_id));
 if(Object.values(publicFields).some(field=>!schemaIds.has(field)))return clean;
 const rawRows=new Map(tables.works.records.map(row=>[row.recordId,row]));
 const currentWorks=new Map(works.map(work=>[work.id,work]));
 if(rawRows.size!==tables.works.records.length||currentWorks.size!==works.length)return clean;
 const eligible=new Set<string>();
 for(const [id,baseline]of identities){
  const work=currentWorks.get(id),row=rawRows.get(id);if(!work||work.placeholder||!row)continue;
  const current=rawIdentity(row);if(current&&versionIdentityMatches(current,baseline))eligible.add(id);
 }
 return {...clean,works:works.map(work=>{
  if(!eligible.has(work.id))return work;
  const links=new Map<string,VersionDisplay['links'][number]>();
  for(const edge of reviewed.relations){
   const labels=relationLabels[edge.relationType];if(!labels||edge.fromWorkId===edge.toWorkId)continue;
   const forward=edge.fromWorkId===work.id,target=forward?edge.toWorkId:edge.toWorkId===work.id?edge.fromWorkId:null;
   if(!target||!eligible.has(target))continue;
   const destination=currentWorks.get(target)!;
   const category=edge.relationType==='part_of_visual_sequence'?'系列影像':('sameSong' in edge&&edge.sameSong===true)?'其他版本':'混音关联';
   const item=links.get(target)??{workId:target,title:destination.song||destination.name,labels:[],categories:[]};
   const label=labels[forward?0:1];if(!item.labels.includes(label))item.labels.push(label);if(!item.categories.includes(category))item.categories.push(category);links.set(target,item);
  }
  const tags=[...(tagRows.get(work.id)??[])];
  return tags.length||links.size?{...work,versionDisplay:{tags,links:[...links.values()]}}:work;
 })};
}
