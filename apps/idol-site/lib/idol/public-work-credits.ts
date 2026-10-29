import source from '@/data/public-work-credits.json';
import type {CatalogView,Work} from './types';
import {videoId} from './values';

export function publicCreditForWork(work:Work){
 if(work.placeholder)return null;
 return source.records.find(row=>row.workId===work.id&&work.groupIds.includes(row.groupId)&&videoId(work.url)===row.videoId)??null;
}
export function publicCreditsForMember(data:Pick<CatalogView,'works'|'ratings'>,memberId:string){
 // A malformed relation list cannot prove that a public entry has no private
 // counterpart. Keep the editorial page readable and withhold this projection.
 if(!Array.isArray(data.works)||!Array.isArray(data.ratings)||!data.ratings.every(r=>r&&Array.isArray(r.memberIds)&&Array.isArray(r.workIds)))return [];
 return data.works.flatMap(work=>{
  const credit=publicCreditForWork(work);
  if(!credit?.memberIds.includes(memberId))return [];
  // Existing personal relations stay in their original section and retain their
  // exact IDs. Never create a duplicate or turn evidence into an editable row.
  if(data.ratings.some(r=>r.memberIds.includes(memberId)&&r.workIds.includes(work.id)))return [];
  return [{work,credit}];
 });
}
