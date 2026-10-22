import {publicGroupNames} from './public-group-names';
import type {CatalogView as Catalog,Work,Group} from './types';
import type {BrowseFilters,WatchSequence,WorkSort} from './journey';
import {inQueue} from './queues';
import {stageMatches} from './stage-display';
import {indexNameFields,matchesNameFields,nameSearchQuery,type NameSearchQuery} from './name-search';
// Split on whitespace so song, version and group can be combined in any order.
export function searchTerms(value:string){return value.normalize('NFKC').toLowerCase().trim().split(/\s+/u).filter(Boolean);}
export function matchesWatch(work:Work,watch='all'){return watch==='all'||(watch==='watched'?work.watched==='已观看':watch==='unwatched'?work.watched==='未观看':watch==='unmarked'?work.watched==='':false);}
function indexWorkName(work:Work,linked:Group[]){
 return {work,groups:linked,fields:indexNameFields([work.name,work.song,work.version,work.videoType,work.officialTitle,...linked.flatMap(publicGroupNames)])};
}
export function indexWorkNames(works:Work[],groups:Group[]){
 const groupMap=new Map(groups.map(group=>[group.id,group]));
 return works.filter(work=>!work.placeholder).map(work=>indexWorkName(work,work.groupIds.flatMap(id=>groupMap.get(id)??[])));
}
export function matchesIndexedWorkScope(row:ReturnType<typeof indexWorkName>,filters:BrowseFilters,query:NameSearchQuery):boolean{
 const {work,groups,fields}=row;
 return matchesWatch(work,filters.watch)&&!work.placeholder&&inQueue(work,filters.queue,groups)&&(filters.group==='all'||work.groupIds.includes(filters.group))&&(filters.generation==='all'||groups.some(group=>group.generation===filters.generation))&&matchesNameFields(fields,query);
}
export function matchingWorks(index:ReturnType<typeof indexWorkNames>,filters:BrowseFilters):Work[]{
 const query=nameSearchQuery(filters.search);
 return index.filter(row=>matchesIndexedWorkScope(row,filters,query)).map(row=>row.work);
}
export function matchesWorkScope(work:Work,filters:BrowseFilters,groups:Group[]){
 const linked=groups.filter(g=>work.groupIds.includes(g.id));
 return matchesIndexedWorkScope(indexWorkName(work,linked),filters,nameSearchQuery(filters.search));
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

// Library-only ordering: callers pass the full filtered set before pagination.
// Do not apply this to group timelines or reorder an already captured sequence.
export function sortWorks(works:Work[],sort:WorkSort='default'):Work[]{
 if(sort==='default')return works.slice();
 const key=(work:Work):number|null=>{
  if(sort==='score-desc')return typeof work.score==='number'&&Number.isFinite(work.score)?work.score:null;
  // Catalog dates are ISO calendar days. Reject partial/invalid days rather than
  // allowing Date.parse to normalize them (for example February 30 into March).
  if(!/^\d{4}-\d{2}-\d{2}$/.test(work.releaseDate))return null;
  const timestamp=Date.parse(work.releaseDate+'T00:00:00Z');
  return Number.isFinite(timestamp)&&new Date(timestamp).toISOString().slice(0,10)===work.releaseDate?timestamp:null;
 };
 return works.map((work,index)=>({work,index,key:key(work)})).sort((a,b)=>{
  if(a.key===null)return b.key===null?a.index-b.index:1;
  if(b.key===null)return -1;
  return (sort==='release-asc'?a.key-b.key:b.key-a.key)||a.index-b.index;
 }).map(row=>row.work);
}
