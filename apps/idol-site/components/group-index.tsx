'use client';
import {useMemo,useRef,type ReactNode} from 'react';
import {Search,X} from 'lucide-react';
import type {CatalogView,Member} from '@/lib/idol/types';
import type {BrowseFilters} from '@/lib/idol/journey';
import {groupIndexOptions,indexGroupNames,matchingIndexedGroups} from '@/lib/idol/group-index';
import {MusicGroupCard} from './music-home';

export function GroupIndex({data,filters,onFilters,onOpen,renderPhoto}:{data:CatalogView;filters:BrowseFilters;onFilters:(patch:Partial<BrowseFilters>)=>void;onOpen:(id:string)=>void;renderPhoto:(member:Member)=>ReactNode}){
 const input=useRef<HTMLInputElement>(null);
 const index=useMemo(()=>indexGroupNames(data.groups),[data]);
 const groups=useMemo(()=>matchingIndexedGroups(index,filters),[index,filters]);
 const generations=useMemo(()=>groupIndexOptions(data.groups,'generation'),[data]);
 const companies=useMemo(()=>groupIndexOptions(data.groups,'company'),[data]);
 const active=!!filters.search||filters.generation!=='all'||!!filters.company&&filters.company!=='all';
 function reset(){onFilters({search:'',generation:'all',company:'all',limit:24});input.current?.focus();}
 return <section className="group-index" aria-label="浏览团体">
  <div className="filters group-index-filters" role="search" aria-label="搜索和筛选团体">
   <label className="search"><Search size={17} aria-hidden="true"/><input ref={input} type="search" aria-label="搜索团体或公司" aria-controls="group-index-results" value={filters.search} maxLength={1000} placeholder="搜索团体、现名或公司" onChange={e=>onFilters({search:e.target.value,limit:24})}/>{filters.search&&<button type="button" aria-label="清除团体搜索" onClick={()=>{onFilters({search:'',limit:24});input.current?.focus();}}><X size={16}/></button>}</label>
   <select aria-label="按代际筛选团体" aria-controls="group-index-results" value={filters.generation} onChange={e=>onFilters({generation:e.target.value,limit:24})}><option value="all">所有代际</option>{generations.map(value=><option key={value}>{value}</option>)}</select>
   <select aria-label="按公司筛选团体" aria-controls="group-index-results" value={filters.company??'all'} onChange={e=>onFilters({company:e.target.value,limit:24})}><option value="all">所有公司</option>{companies.map(value=><option key={value}>{value}</option>)}</select>
   {active&&<button className="filter-reset text-button" onClick={reset}><X size={14}/>重置团体筛选</button>}
  </div>
  <p className="result-line" role="status" aria-live="polite" aria-atomic="true">显示 {groups.length} / {data.groups.length} 个团体</p>
  <div id="group-index-results" className="music-group-grid">{groups.map(group=><MusicGroupCard key={group.id} group={group} onOpen={()=>onOpen(group.id)}/>)}</div>
  {!groups.length&&<div className="empty"><h2>{data.groups.length?'没有符合条件的团体':'暂未收录团体'}</h2><p>{data.groups.length?'试试其他团体名称、公司，或放宽筛选条件。':'收录团体后，可以在这里搜索和筛选。'}</p>{active&&<button className="button" onClick={reset}>查看全部团体</button>}</div>}
 </section>;
}
