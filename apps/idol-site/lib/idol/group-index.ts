import {publicGroupNames} from './public-group-names';
import type {Group} from './types';
import type {BrowseFilters} from './journey';
import {indexNameFields,matchesNameFields,nameSearchQuery} from './name-search';

export function indexGroupNames(groups:Group[]){
 return groups.map(group=>({group,fields:indexNameFields([...publicGroupNames(group),group.company])}));
}
export function matchingIndexedGroups(index:ReturnType<typeof indexGroupNames>,filters:BrowseFilters):Group[]{
 const query=nameSearchQuery(filters.search);
 return index.filter(({group:g,fields})=>{
  return (filters.generation==='all'||g.generation===filters.generation)
   &&(!filters.company||filters.company==='all'||g.company===filters.company)
   &&matchesNameFields(fields,query);
 }).map(row=>row.group);
}
export function matchingGroups(groups:Group[],filters:BrowseFilters):Group[]{
 return matchingIndexedGroups(indexGroupNames(groups),filters);
}
export function groupIndexOptions(groups:Group[],field:'generation'|'company'){
 return [...new Set(groups.map(g=>g[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
}
