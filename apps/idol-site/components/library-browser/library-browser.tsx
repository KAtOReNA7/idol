'use client';
import {useMemo,useId} from 'react';
import type {BrowseFilters,WatchSequence} from '../../lib/idol/journey';
import type {CatalogView,Work} from '../../lib/idol/types';
import type {ReactNode} from 'react';
import type {PageSize,RestoreTarget,RestoreResolution} from '../../lib/idol/library-browser/contract';
import {paginate} from '../../lib/idol/library-browser/paging-model';
import {buildLibraryModel} from '../../lib/idol/library-browser/query-model';
import {makeWatchSequence} from '../../lib/idol/watch-sequence';
import {queueLabels} from '../../lib/idol/queues';
import {FilterControls} from './filter-controls';
import {ResultsView} from './results-view';
export type LibraryBrowserProps={catalog:CatalogView;filters:BrowseFilters;onFiltersChange:(filters:BrowseFilters)=>void;page:number;pageSize:PageSize;onPageChange:(page:number,pageSize:PageSize)=>void;renderWork:(work:Work,onOpen:()=>void)=>ReactNode;onOpenWork:(id:string,sequence:WatchSequence)=>void;restoreTarget?:RestoreTarget;restoreReady?:boolean;onRestoreReady?:(target:RestoreResolution)=>void;loading?:boolean;error?:string|null;readOnly?:boolean};
export function LibraryBrowser(props:LibraryBrowserProps){
 const {catalog,filters,page,pageSize}=props;
 // Navigation replaces BrowseFilters objects, so cache by query semantics rather than object identity.
 // Catalog identity remains a dependency: refreshed scores/relations/names must invalidate this cache.
 const {search,group,generation,queue,stageFilter,watch,sort}=filters;
 const queryModel=useMemo(()=>buildLibraryModel(catalog,{search,group,generation,queue,stageFilter,watch,sort,limit:24},1,24),[catalog,search,group,generation,queue,stageFilter,watch,sort]);
 const model=useMemo(()=>{const pagination=paginate(queryModel.orderedIds.length,page,pageSize);return {...queryModel,pagination,rows:queryModel.orderedWorks.slice((pagination.page-1)*pagination.pageSize,pagination.end)};},[queryModel,page,pageSize]);
 const sequence=useMemo(()=>makeWatchSequence(model.orderedWorks,queueLabels[filters.queue]??'作品库',filters),[model.orderedWorks,filters]);
 const searchId=useId();
 return <section className="lb-browser" aria-label="完整作品库" aria-busy={!!props.loading}>
 {props.readOnly&&<p className="lb-browser-readonly">只读浏览，不会修改评分、备注或观看状态。</p>}
 <FilterControls filters={filters} groups={catalog.groups} model={model} disabled={props.loading} searchId={searchId} onFiltersChange={next=>{props.onFiltersChange(next);props.onPageChange(1,pageSize);}}/>
 <ResultsView {...props} model={model} sequence={sequence} searchId={searchId}/>
 </section>;
}
