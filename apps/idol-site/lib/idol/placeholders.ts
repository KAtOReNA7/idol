import metadata from '@/data/stages/group-placeholders.json';
import {F} from './fields';
import {asIds,asText} from './values';
import type {GroupPlaceholder} from './types';
export const groupPlaceholderMetadata=metadata;
export function wasAuditedGroupPlaceholder(recordId:string){return Object.hasOwn(metadata.records,recordId);}
type Row={recordId:string;fields:Record<string,unknown>};
// Only these source-audited IDs may be classified. New empty records are never hidden.
// Any new identity, relation or user input restores normal visibility, including a zero score.
export function isEmptyPlaceholderValue(value:unknown):boolean {
 if(value===null||value===undefined)return true;
 if(typeof value==='string')return value.trim()==='';
 if(Array.isArray(value))return value.every(isEmptyPlaceholderValue);
 if(typeof value==='object')return Object.values(value).every(isEmptyPlaceholderValue);
 return false;
}
export function groupPlaceholderFor(row:Row,incomingRatingIds:string[]):GroupPlaceholder|null{
 const spec=(metadata.records as Record<string,{groupId:string;group:string;originalRow:number;reason:string}>)[row.recordId];
 if(!spec)return null;
 const f=row.fields,ids=asIds(f[F.works.groups]);
 if(asText(f[F.works.name])!==`${spec.group} · 待补作品`||ids.length!==1||ids[0]!==spec.groupId)return null;
 if(asText(f.fld2PLgRCA)!==String(spec.originalRow)||asText(f.fld5z0HUZX)!=='原表保留'||asText(f[F.works.verification])!=='待补作品')return null;
 const provenance=asText(f.fld2mXNhlM);
 if(!provenance.includes('原表歌曲为空')||!provenance.includes('保留此记录。尚未选择作品'))return null;
 const mustBeEmpty=[F.works.song,'fld176WWEW',F.works.url,F.works.officialTitle,F.works.version,F.works.releaseDate,F.works.videoType,'fld2UfUVYO',F.works.channel,'fld6Ab27Zx',F.works.source,F.works.score,F.works.stageScore,F.works.note,F.works.watched];
 if(mustBeEmpty.some(key=>!isEmptyPlaceholderValue(f[key]))||asIds(f[F.works.ratings]).length||incomingRatingIds.length)return null;
 return {reason:spec.reason,originalRow:spec.originalRow,verifiedAt:metadata.verifiedAt};
}
