import type {BrowseFilters} from '../journey';
import type {CatalogView} from '../types';
import {indexWorkNames,matchingWorks,sortWorks} from '../watch-sequence';
import {queueLabels} from '../queues';
import {stageMatches} from '../stage-display';
import {paginate} from './paging-model';
import type {ActiveCondition,ConditionKey,LibraryModel,PageSize} from './contract';
const defaults:Record<ConditionKey,string>={search:'',group:'all',generation:'all',queue:'all',stageFilter:'all',watch:'all',sort:'default'};
const labels:Record<ConditionKey,string>={search:'名称',group:'团体',generation:'世代',queue:'队列',stageFilter:'舞台',watch:'观看状态',sort:'排序'};
const stageLabels:Record<string,string>={all:'全部',ready:'有舞台',alternative:'其他现场',pending:'暂无舞台'};
const watchLabels:Record<string,string>={watched:'已观看',unwatched:'未观看',unmarked:'未标记'};
const sortLabels:Record<string,string>={'release-desc':'发行时间：新到旧','release-asc':'发行时间：旧到新','score-desc':'评分：高到低'};
/** Exactly one dimension changes; limit, company and optional fields survive untouched. */
export function clearCondition(filters:BrowseFilters,key:ConditionKey):BrowseFilters{return {...filters,[key]:defaults[key]};}
/** Duplicate IDs are invalid catalog input: retain the first record (including placeholders).
 * This matches nextInSequence's first-find behavior. Never merge names, scores or associations.
 * Only public name fields enter the existing name index; Work slots remain host-owned records.
 */
export function buildLibraryModel(catalog:CatalogView,filters:BrowseFilters,page=1,pageSize:PageSize=24):LibraryModel{
 const seen=new Set<string>();
 const works=catalog.works.filter(work=>{if(seen.has(work.id))return false;seen.add(work.id);return true;});
 const index=indexWorkNames(works,catalog.groups);
 const scope=matchingWorks(index,filters);
 const orderedWorks=sortWorks(scope.filter(work=>stageMatches(work,filters.stageFilter)),filters.sort);
 const pagination=paginate(orderedWorks.length,page,pageSize);
 const queue=Object.fromEntries(Object.keys(queueLabels).map(key=>[key,matchingWorks(index,{...filters,queue:key}).filter(work=>stageMatches(work,filters.stageFilter)).length]));
 const stage=Object.fromEntries(Object.keys(stageLabels).map(key=>[key,scope.filter(work=>stageMatches(work,key)).length]));
 const activeConditions:ActiveCondition[]=[];
 for(const key of Object.keys(defaults) as ConditionKey[]){
  const value=filters[key]??defaults[key];if(value===defaults[key])continue;
  const display=key==='group'?catalog.groups.find(group=>group.id===value)?.name??value:key==='queue'?queueLabels[value]??value:key==='stageFilter'?stageLabels[value]??value:key==='watch'?watchLabels[value]??value:key==='sort'?sortLabels[value]??value:value;
  activeConditions.push({key,value,label:`${labels[key]}：${display}`});
 }
 return {orderedWorks,orderedIds:orderedWorks.map(work=>work.id),rows:orderedWorks.slice((pagination.page-1)*pagination.pageSize,pagination.end),pagination,facetCounts:{queue,stage},activeConditions,watchableIds:orderedWorks.filter(work=>!!work.url).map(work=>work.id)};
}
