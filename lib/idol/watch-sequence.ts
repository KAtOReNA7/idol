import type {CatalogView as Catalog,Work,Group} from './types';
import type {BrowseFilters,WatchSequence} from './journey';
import {inQueue} from './queues';
import {stageMatches} from './stage-display';
export function matchesWorkScope(work:Work,filters:BrowseFilters,groups:Group[]){
 const linked=groups.filter(g=>work.groupIds.includes(g.id));
 return !work.placeholder&&inQueue(work,filters.queue,groups)&&(filters.group==='all'||work.groupIds.includes(filters.group))&&(filters.generation==='all'||linked.some(g=>g.generation===filters.generation))&&`${work.name} ${work.song} ${work.version} ${work.videoType} ${work.officialTitle} ${linked.map(g=>g.name).join(' / ')}`.toLowerCase().includes(filters.search.toLowerCase());
}
export function makeWatchSequence(works:Work[],label:string,filters:BrowseFilters,memberId?:string):WatchSequence{
 return {ids:[...new Set(works.filter(w=>!w.placeholder&&!!w.url).map(w=>w.id))],label,filters:{...filters},...(memberId?{memberId}:{})};
}
export function nextInSequence(sequence:WatchSequence,currentId:string,data:Catalog){
 const index=sequence.ids.indexOf(currentId);if(index<0)return null;
 for(const id of sequence.ids.slice(index+1)){const work=data.works.find(w=>w.id===id);if(!work||!work.url||!matchesWorkScope(work,sequence.filters,data.groups)||!stageMatches(work,sequence.filters.stageFilter))continue;
  if(sequence.memberId&&!data.ratings.some(r=>r.workIds.includes(id)&&r.memberIds.includes(sequence.memberId!)))continue;
  return work;
 }
 return null;
}
