import {publicGroupNames} from './public-group-names';
import type {Group} from './types';
import type {BrowseFilters} from './journey';
import {indexNameFields,matchesNameFields,nameSearchQuery} from './name-search';

// Historical group management as credited by the artists' labels. Do not
// present it as a current contract if the live company field is empty.
const historicalCompanies = new Map([
 ['recvxyEBDZJAXm','BlockBerryCreative（历史）'],
 ['recvxyEBDZB3pz','Woollim Entertainment（历史）'],
 ['recvxyEBDZPbu5','IST Entertainment（历史）'],
]);

export function groupIndexCompany(group:Group):string {
 return group.company?.trim() || historicalCompanies.get(group.id) || '';
}

export function indexGroupNames(groups:Group[]){
 return groups.map(group=>{
  const company=groupIndexCompany(group);
  return {group,company,fields:indexNameFields([...publicGroupNames(group),company])};
 });
}
export function matchingIndexedGroups(index:ReturnType<typeof indexGroupNames>,filters:BrowseFilters):Group[]{
 const query=nameSearchQuery(filters.search);
 return index.filter(({group:g,company,fields})=>{
  return (filters.generation==='all'||g.generation===filters.generation)
   &&(!filters.company||filters.company==='all'||company===filters.company)
   &&matchesNameFields(fields,query);
 }).map(row=>row.group);
}
export function matchingGroups(groups:Group[],filters:BrowseFilters):Group[]{
 return matchingIndexedGroups(indexGroupNames(groups),filters);
}
export function groupIndexOptions(groups:Group[],field:'generation'|'company'){
 const values=field==='company'?groups.map(groupIndexCompany):groups.map(g=>g.generation);
 return [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
}
