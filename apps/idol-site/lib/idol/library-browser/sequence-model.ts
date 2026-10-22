import type {CatalogView,Work} from '../types';
import type {WatchSequence} from '../journey';
import {matchesWorkScope,nextInSequence} from '../watch-sequence';
import {stageMatches} from '../stage-display';
import type {SequenceModel,SequenceStatus} from './contract';
/** Keep the complete captured IDs and positions; never sort or silently repair a session. */
export function buildSequenceModel(sequence:WatchSequence,currentId:string,catalog:CatalogView):SequenceModel{
 const first=new Map<string,Work>();for(const work of catalog.works)if(!first.has(work.id))first.set(work.id,work);
 const linked=new Set(sequence.memberId?catalog.ratings.filter(rating=>rating.memberIds.includes(sequence.memberId!)).flatMap(rating=>rating.workIds):[]);
 const currentIndex=sequence.ids.indexOf(currentId);
 // The host's existing continuation oracle remains authoritative, including missing-current behavior.
 const nextId=nextInSequence(sequence,currentId,catalog)?.id??null;
 const nextIndex=nextId===null?-1:sequence.ids.indexOf(nextId,currentIndex+1);
 const rows=sequence.ids.map((id,index)=>{
  const work=first.get(id);let status:SequenceStatus='available';
  if(!work)status='missing';
  else if(work.placeholder||!work.url)status='unavailable';
  else if(!matchesWorkScope(work,sequence.filters,catalog.groups)||!stageMatches(work,sequence.filters.stageFilter))status='filtered';
  else if(sequence.memberId&&!linked.has(id))status='member-unlinked';
  return {id,position:index+1,name:work?.name??'已移除的作品',status,current:index===currentIndex,next:index===nextIndex};
 });
 return {rows,total:sequence.ids.length,currentPosition:currentIndex<0?null:currentIndex+1,nextId,continuableCount:currentIndex<0?0:rows.slice(currentIndex+1).filter(row=>row.status==='available').length,unrecoverable:currentIndex<0};
}
