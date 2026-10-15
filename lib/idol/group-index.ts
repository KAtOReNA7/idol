import type {Group} from './types';
import type {BrowseFilters} from './journey';

const normalize=(value:string)=>value.normalize('NFKC').trim().toLowerCase();
export function matchingGroups(groups:Group[],filters:BrowseFilters):Group[]{
 const terms=normalize(filters.search).split(/\s+/).filter(Boolean);
 return groups.filter(g=>{
  const text=normalize([g.name,g.currentName,g.company].filter(Boolean).join(' '));
  return (filters.generation==='all'||g.generation===filters.generation)
   &&(!filters.company||filters.company==='all'||g.company===filters.company)
   &&terms.every(term=>text.includes(term));
 });
}
export function groupIndexOptions(groups:Group[],field:'generation'|'company'){
 return [...new Set(groups.map(g=>g[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
}
