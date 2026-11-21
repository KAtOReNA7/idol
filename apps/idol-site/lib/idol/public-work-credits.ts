import source from '@/data/public-work-credits.json';
import type {CatalogView,Work} from './types';
import {videoId} from './values';

const creditsByWork=new Map<string,typeof source.records>();
for(const row of source.records){
 const records=creditsByWork.get(row.workId);
 if(records)records.push(row);else creditsByWork.set(row.workId,[row]);
}
export function publicCreditForWork(work:Work){
 if(work.placeholder)return null;
 return creditsByWork.get(work.id)?.find(row=>work.groupIds.includes(row.groupId)&&videoId(work.url)===row.videoId)??null;
}
export function publicCreditsForMember(data:Pick<CatalogView,'works'|'ratings'>,memberId:string){
 // A malformed relation list cannot prove that a public entry has no private
 // counterpart. Keep the editorial page readable and withhold this projection.
 if(!Array.isArray(data.works)||!Array.isArray(data.ratings)||!data.ratings.every(r=>r&&Array.isArray(r.memberIds)&&Array.isArray(r.workIds)))return [];
 const personalWorks=new Set(data.ratings.filter(r=>r.memberIds.includes(memberId)).flatMap(r=>r.workIds));
 return data.works.flatMap(work=>{
  const credit=publicCreditForWork(work);
  if(!credit?.memberIds.includes(memberId))return [];
  // Existing personal relations stay in their original section and retain their
  // exact IDs. Never create a duplicate or turn evidence into an editable row.
  if(personalWorks.has(work.id))return [];
  return [{work,credit}];
 });
}
