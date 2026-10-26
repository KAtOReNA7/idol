'use client';
import type {BrowseFilters} from '../../lib/idol/journey';
import {defaultFilters} from '../../lib/idol/journey';
import type {Group} from '../../lib/idol/types';
import type {LibraryModel,ConditionKey} from '../../lib/idol/library-browser/contract';
import {clearCondition} from '../../lib/idol/library-browser/query-model';
import {queueLabels} from '../../lib/idol/queues';
import './filters.css';
export function FilterControls({filters,onFiltersChange,groups,model,disabled=false,searchId='lb-search'}:{filters:BrowseFilters;onFiltersChange:(filters:BrowseFilters)=>void;groups:Group[];model:LibraryModel;disabled?:boolean;searchId?:string}){
 const change=(key:ConditionKey,value:string)=>{if(!disabled)onFiltersChange({...filters,[key]:value,limit:24});};
 const remove=(key:ConditionKey)=>{if(!disabled)onFiltersChange(clearCondition(filters,key));};
 return <section className="lb-filters" aria-label="作品筛选">
 <div className="lb-filter-fields">
 <label>公开名称搜索<input id={searchId} data-library-focus="search" value={filters.search} maxLength={1000} disabled={disabled} onChange={e=>change('search',e.target.value)} placeholder="歌曲、团体或视频标题"/></label>
 <label>团体<select value={filters.group} disabled={disabled} onChange={e=>change('group',e.target.value)}><option value="all">所有团体</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
 <label>代际<select value={filters.generation} disabled={disabled} onChange={e=>change('generation',e.target.value)}><option value="all">所有代际</option>{[...new Set(groups.map(g=>g.generation))].filter(Boolean).map(g=><option key={g}>{g}</option>)}</select></label>
 <label>观看队列<select value={filters.queue} disabled={disabled} onChange={e=>change('queue',e.target.value)}>{Object.entries(queueLabels).map(([key,label])=><option key={key} value={key}>{label}（{model.facetCounts.queue[key]??0}）</option>)}</select></label>
 <label>观看状态<select data-library-focus="watch" value={filters.watch??'all'} disabled={disabled} onChange={e=>change('watch',e.target.value)}>{[['all','所有观看状态'],['watched','已观看'],['unwatched','未观看'],['unmarked','未标记']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
 <label>作品排序<select data-library-focus="sort" value={filters.sort??'default'} disabled={disabled} onChange={e=>change('sort',e.target.value)}>{[['default','默认排序'],['release-desc','发行新到旧'],['release-asc','发行旧到新'],['score-desc','MV 分高到低']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
 </div>
 <div className="lb-stage-options" role="group" aria-label="舞台分类">{[['all','全部'],['ready','有舞台'],['alternative','其他现场'],['pending','暂无舞台']].map(([value,label])=><button type="button" key={value} disabled={disabled} aria-pressed={filters.stageFilter===value} onClick={()=>change('stageFilter',value)}>{label}（{model.facetCounts.stage[value]??0}）</button>)}</div>
 {model.activeConditions.length>0&&<div className="lb-active-conditions" aria-label="当前条件">{model.activeConditions.map(c=><button type="button" key={c.key} disabled={disabled} aria-label={`撤销${c.label}`} onClick={()=>remove(c.key)}>{c.label} ×</button>)}<button type="button" disabled={disabled} onClick={()=>{if(!disabled)onFiltersChange({...filters,...defaultFilters()});}}>重置全部条件</button></div>}
 {model.pagination.total===0&&model.activeConditions.length>0&&<p className="lb-empty-reason">当前条件组合没有匹配作品。可逐项撤销上方条件，其余条件会保留。{filters.queue==='unrated'?'“看过待评分”仅包含已观看且 MV 分数为空的作品；0 分表示已评分。':''}</p>}
 </section>;
}
