'use client';
import {MusicNavigation} from '@/components/music-shell';
import {MusicHome} from '@/components/music-home';
import {useCanEdit} from '@/components/public-access';
import {LibraryBrowser} from '@/components/library-browser';
import {resolveRestoreTarget} from '@/lib/idol/library-browser/paging-model';
import {indexPersonalRecords, matchPersonalRecords, materializePersonalRecordMatches} from '@/lib/idol/personal-record-search';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {indexMemberNames, matchingMembers} from '@/lib/idol/member-index';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {catalogCoversRoute,validDetailWork,workCatalogHeaders} from '@/lib/idol/work-catalog-request';
import {useEffect, useMemo, useState, useCallback, useRef} from 'react';
import {Search, Play, Heart, RefreshCw, Download, ChevronRight, Disc3, X, LoaderCircle} from 'lucide-react';
import type {CatalogView as Catalog, Work} from '@/lib/idol/types';
import {WorkCoverImage} from '@/components/app-image-presentation';
import {ImageRecoveryProvider, ImageRecoveryControls} from '@/components/reliable-image';
import {groupArtistUrl, memberArtistUrl, artistReturnLabel} from '@/lib/idol/artist-navigation';
import {useCatalogGroupViews, needsCatalogGroupViews} from '@/components/use-catalog-group-views';
import '@/components/candidate-index-card.css';
import {stageHasValidBinding} from '@/lib/idol/stage-source';
import {inQueue as queueIncludes, queueLabels} from '@/lib/idol/queues';
import {includesMemberWork, indexWorkNames, matchingWorks, makeWatchSequence, nextInSequence, sortWorks} from '@/lib/idol/watch-sequence';
import {stageStatusLabel, stageMatches} from '@/lib/idol/stage-display';
import {useBrowseJourney} from '@/components/use-browse-journey';
import {defaultFilters, type Nav, type Route, type WorkSort} from '@/lib/idol/journey';
import './music-experience.css';
import './candidate-experience.css';
import './work-experience.css';
import './work-theme-tokens.css';
import {workExperience} from '@/lib/idol/work-experience';
import {workExperienceStylesheet} from '@/lib/idol/work-experience-styles';
import {requestMessage} from '@/lib/idol/product-copy';
import {lazy, Suspense} from 'react';
import {names, PhotoView, readResponse} from '@/components/catalog/presentation';
const WorkDetail=lazy(()=>import('@/components/catalog/work-detail').then(m=>({default:m.WorkDetail})));
const MemberDetail=lazy(()=>import('@/components/catalog/member-detail').then(m=>({default:m.MemberDetail})));
const MusicMemberPhoto=lazy(()=>import('@/components/catalog/member-portrait').then(m=>({default:m.MusicMemberPhoto})));
const Editor=lazy(()=>import('@/components/catalog/record-editor').then(m=>({default:m.Editor})));
const PersonalInsights=lazy(()=>import('@/components/personal-insights/PersonalInsights').then(m=>({default:m.PersonalInsights})));

const navs:[Nav,string][]=[['home','发现'],['works','作品'],['members','成员'],['groups','团体'],['insights','偏好统计'],['records','观看记录']];

function WorkCard({work,data,onOpen}:{work:Work;data:Catalog;onOpen:()=>void}){return <button data-browse-anchor={"work-"+work.id} className="work-card" onClick={onOpen}><div className="work-art"><WorkCoverImage work={work} label={work.song+' 官方视频封面'} fallback={<div className="cover-empty"><Disc3 size={48}/></div>}/><span className="play-circle"><Play size={18} fill="currentColor"/></span><span className="video-badge">{work.videoType||'视频'}{work.version?' · '+work.version:''}</span></div><div className="work-card-copy"><div><small>{names(data,work.groupIds)||'团体未收录'}</small><h3>{work.song||work.name}</h3></div><span className={'rating-number '+(work.score===null?'unrated':'')}>{work.score===null?'—':work.score.toFixed(1)}</span></div><div className="work-meta"><span>{work.releaseDate}</span><span>{work.watched||'未标记'}</span></div><div className={'stage-card-status '+(work.stage?'ready':'pending')}><strong>{stageStatusLabel(work)}</strong></div></button>}

export default function App(){
 const canEdit=useCanEdit();
 const [loaded,setData]=useState<Catalog|null>(null);
 const latestCatalog=useRef<{catalog:Catalog;canEdit:boolean}|null>(null),selectedWork=useRef<string|null>(null);
 const available=latestCatalog.current?.canEdit===canEdit&&latestCatalog.current.catalog===loaded?loaded:null;
 const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [canManage,setCanManage]=useState(false);
 const groupViews=useCatalogGroupViews();
 const journey=useBrowseJourney(!!available, r=>workExperienceStylesheet(workExperience(available,r)?.className),(r,sequence)=>catalogCoversRoute(available,sequence?null:validDetailWork(r.work))&&(!needsCatalogGroupViews(r,available)||groupViews.phase==='ready'));
 const {route}=journey;
 const targetWork=journey.sequence?null:validDetailWork(route.work);
 selectedWork.current=targetWork;
 const data=journey.routeReady&&catalogCoversRoute(available,targetWork)?available:null;
 const {search,group,generation,queue,stageFilter,limit,watch='all',sort='default'}=journey.filters;
 const setSearch=(value:string)=>journey.updateFilters({search:value,limit:24});const setGroup=(value:string)=>journey.updateFilters({group:value,limit:24});const setGeneration=(value:string)=>journey.updateFilters({generation:value,limit:24});const setQueue=(value:string)=>journey.updateFilters({queue:value,limit:24});const setStageFilter=(value:string)=>journey.updateFilters({stageFilter:value,limit:24});const setLimit=(value:number)=>journey.updateFilters({limit:value});
 const loadSequence=useRef(0),loadAbort=useRef<AbortController|null>(null),mounted=useRef(false);
 const load=useCallback(async(force=false)=>{
  if(!mounted.current)return;
  const sequence=++loadSequence.current;
  loadAbort.current?.abort();
  const controller=new AbortController();loadAbort.current=controller;
  const previous=latestCatalog.current;
  const workId=previous?.canEdit===canEdit&&!previous.catalog.scope?null:selectedWork.current;
  const accept=(catalog:Catalog)=>{
   if(!catalogCoversRoute(catalog,workId))throw Error('资料暂时无法读取，请重新载入。');
   latestCatalog.current={catalog,canEdit};setData(catalog);
  };
  force?setRefreshing(true):setLoading(true);setError('');
  let updating=force;
  try{
   const read=(url:string)=>catalogReadWithDeadline(async signal=>{
    const r=await fetch(url,{cache:'no-store',signal,headers:workCatalogHeaders(workId)});const d=await readResponse(r);
    if(!r.ok)throw new Error(requestMessage(d&&typeof d==='object'&&'error' in d?d.error:null));return d as Catalog;
   },controller.signal);
   const d=await read('/api/catalog?shape=display-v1'+(force&&canEdit?'&refresh=1':''));
   if(sequence!==loadSequence.current)return;
   accept(d);setLoading(false);
   if(canEdit&&!force&&d.cache?.refreshRecommended){
    updating=true;setRefreshing(true);
    const updated=await read('/api/catalog?shape=display-v1&refresh=background');
    if(sequence===loadSequence.current)accept(updated);
   }
  }catch(e){
   if(sequence===loadSequence.current&&!controller.signal.aborted){
    const message=(e as Error).message;
    setError(message==='资料读取用时较长，请重新加载。'?(updating?'内容更新用时较长，请点击“更新内容”重试。':'资料读取用时较长，请重新载入。'):message);
   }
  }finally{
   if(sequence===loadSequence.current){setLoading(false);setRefreshing(false);loadAbort.current=null;}
  }
 },[canEdit]);
 const cancelLoad=useCallback(()=>{loadSequence.current++;loadAbort.current?.abort();loadAbort.current=null;},[]);
 useEffect(()=>{
  mounted.current=true;
  return()=>{mounted.current=false;cancelLoad();};
 },[cancelLoad]);
 useEffect(()=>{
  if(!journey.routeReady)return;
  const previous=latestCatalog.current;
  if(previous?.canEdit===canEdit&&catalogCoversRoute(previous.catalog,targetWork)){
   setError('');setLoading(false);setRefreshing(false);return;
  }
  let active=true;void Promise.resolve().then(()=>{if(active)void load();});
  return()=>{active=false;cancelLoad();};
 },[journey.routeReady,targetWork,canEdit,load,cancelLoad]);
 useEffect(()=>{if(!canEdit)return;let active=true;const controller=new AbortController();void catalogReadWithDeadline(signal=>fetch('/api/status',{cache:'no-store',signal}).then(readResponse),controller.signal).then(s=>{if(active)setCanManage(!!s&&typeof s==='object'&&'source' in s&&s.source==='native');}).catch(()=>{});return()=>{active=false;controller.abort();};},[canEdit]);
 function currentLabel(){return route.groupId?(data?.groups.find(g=>g.id===route.groupId)?.name||'团体主页'):route.work?(data?.works.find(w=>w.id===route.work)?.song||'作品'):route.member?((()=>{const m=data?.members.find(m=>m.id===route.member);return m?memberDisplayName(m):'成员档案';})()):(navs.find(n=>n[0]===route.nav)?.[1]||'我的放映室');}
 function navigate(next:Partial<Route>){return journey.navigate(next,currentLabel());}
 function setNav(nav:Nav){if(route.nav===nav&&!route.work&&!route.member&&!route.groupId)return;navigate({nav,work:null,member:null,video:'mv'});}
 function goBack(){if(!journey.backLabel&&route.artistReturn){journey.leaveTo(route.artistReturn,true);return;}journey.back({nav:route.groupId?'groups':route.work?'works':'members',work:null,member:null,groupId:null,video:'mv'});}
 function openGroup(id:string){const artist=groupArtistUrl(id);if(artist){journey.leaveTo(artist);return;}journey.navigate({nav:'groups',groupId:id,work:null,member:null,video:'mv'},currentLabel());}
 const chosenWork=data?.works.find(w=>w.id===route.work);const chosenMember=data?.members.find(m=>m.id===route.member);const chosenGroup=data?.groups.find(g=>g.id===route.groupId);
 const groupViewsNeeded=needsCatalogGroupViews(route,data);
 useEffect(()=>{if(groupViewsNeeded&&groupViews.phase==='idle')groupViews.load();},[groupViewsNeeded,groupViews.phase,groupViews.load]);
 const GroupIndex=groupViews.value?.GroupIndex,GroupDetail=groupViews.value?.GroupDetail;
 function groupViewsFallback(){return <section className="empty" data-module-status aria-busy={groupViews.phase!=='error'}><h2>{groupViews.phase==='error'?'团体页面未能加载':route.groupId?'正在打开团体主页':'正在打开团体索引'}</h2><p role="status">{groupViews.phase==='error'?'团体页面暂时无法打开。请刷新重试，筛选条件和浏览位置会保留。':'正在加载团体页面…'}</p>{groupViews.phase==='error'&&<><p>重新加载会清空“搜我的记录”的临时关键词；已保存内容不受影响。</p><button className="button primary" onClick={journey.reloadPage}>重新加载页面</button></>}<button className="button" onClick={()=>journey.back({nav:route.groupId?'groups':'home',groupId:null,work:null,member:null,video:'mv'})}>返回{journey.backLabel?' '+journey.backLabel:route.groupId?'团体索引':'我的放映室'}</button></section>;}
 function openMember(id:string,fallback:Partial<Route>={work:null,member:id}){const m=data?.members.find(x=>x.id===id),artist=m&&memberArtistUrl(m);if(artist){journey.leaveTo(artist);return;}navigate(fallback);}
 // Private search stays in React memory only; never use journey filters/history here.
 const [recordQuery,setRecordQuery]=useState('');const [recordLimit,setRecordLimit]=useState(24);
 const recordSearchActive=route.nav==='records'&&!route.work&&!route.member&&!route.groupId&&!!recordQuery.trim();
 const recordIndex=useMemo(()=>indexPersonalRecords(recordSearchActive?data:null),[data,recordSearchActive]);
 const recordResults=useMemo(()=>matchPersonalRecords(recordIndex,recordQuery),[recordIndex,recordQuery]);
 const visibleRecordResults=useMemo(()=>materializePersonalRecordMatches(recordResults,recordLimit),[recordResults,recordLimit]);
 const generations=useMemo(()=>data?[...new Set(data.groups.map(g=>g.generation).filter(Boolean))].sort():[],[data]);
 // Normalize public fields once per actual catalog response, never cache old
 // record copies: refreshed scores, names and relationships remain authoritative.
 const memberIndex=useMemo(()=>indexMemberNames(data?.members??[],data?.groups??[]),[data]);
 const workIndex=useMemo(()=>indexWorkNames(data?.works??[],data?.groups??[]),[data]);
 function inQueue(w:Work,q=queue){return queueIncludes(w,q,data?.groups??[]);}
 const libraryWorks=useMemo(()=>workIndex.map(row=>row.work),[workIndex]);
 const workScope=useMemo(()=>matchingWorks(workIndex,journey.filters),[workIndex,search,group,generation,queue,watch]);
 const filteredWorks=useMemo(()=>sortWorks(workScope.filter(w=>stageMatches(w,stageFilter)),sort),[workScope,stageFilter,sort]);
 const libraryPageSize=journey.filters.pageSize??24;
 const libraryPage=journey.libraryRestoreTarget?resolveRestoreTarget(filteredWorks.map(w=>w.id),libraryPageSize,journey.libraryRestoreTarget).page:(journey.filters.page??1);
 // Keep the original queue in history while related works outside it are open.
 const activeSequence=chosenWork&&journey.sequence?.ids.includes(chosenWork.id)?journey.sequence:undefined;
 const nextWork=chosenWork&&activeSequence?nextInSequence(activeSequence,chosenWork.id,data!):null;
 function openVersion(id:string){if(!chosenWork?.versionDisplay?.links.some(link=>link.workId===id)||!data?.works.some(work=>work.id===id&&!work.placeholder))return false;return journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,journey.sequence);}
 function openWork(id:string,works:Work[]=filteredWorks,label=queueLabels[queue]??'作品库',scope=journey.filters,memberId?:string){if(route.nav==='works'&&!route.work&&!route.member&&!route.groupId){[...document.querySelectorAll<HTMLButtonElement>('.work-grid [data-browse-anchor]')].find(node=>node.dataset.browseAnchor==='work-'+id)?.focus({preventScroll:true});}const sequence=makeWatchSequence(works,label,scope,memberId);return journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,sequence.ids.includes(id)?sequence:undefined);}
 const filteredMembers=useMemo(()=>matchingMembers(memberIndex,journey.filters),[memberIndex,journey.filters]);
 function openQueue(q:string){journey.navigate({nav:'works',work:null,member:null,video:'mv'},currentLabel(),{...defaultFilters(),queue:q});}
 function filters(type:'works'|'members'|'groups'){return <div className={type==='works'?'filters library-filters':'filters'}><label className="search"><Search size={17}/><input data-library-focus={type==='works'?'search':undefined} maxLength={type==='works'?1000:undefined} value={search} onChange={e=>{setSearch(e.target.value);setLimit(24);}} placeholder={type==='works'?'搜索歌曲、团体或视频标题':type==='members'?'搜索姓名、艺名或团体':'搜索团体或公司'} aria-label="搜索"/>{search&&<button aria-label="清除搜索" onClick={e=>{setSearch('');if(type==='works')e.currentTarget.parentElement?.querySelector('input')?.focus();}}><X size={14}/></button>}</label>{type!=='groups'&&<select aria-label="按团体筛选" value={group} onChange={e=>{setGroup(e.target.value);setLimit(24);}}><option value="all">所有团体</option>{data?.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}<select aria-label="按代际筛选" value={generation} onChange={e=>{setGeneration(e.target.value);setLimit(24);}}><option value="all">所有代际</option>{generations.map(g=><option key={g}>{g}</option>)}</select>{type==='works'&&<select aria-label="按观看队列筛选" value={queue} onChange={e=>{setQueue(e.target.value);setLimit(24);}}><option value="all">全部作品</option><option value="high">高分团补看</option><option value="surprise">团内惊喜</option><option value="tonight">待看</option><option value="unrated">看过待评分</option><option value="rewatch">高分重温</option></select>}{type==='works'&&<select aria-label="按观看状态筛选" data-library-focus="watch" value={watch} onChange={e=>journey.updateFilters({watch:e.target.value,limit:24})}><option value="all">所有观看状态</option><option value="watched">已观看</option><option value="unwatched">未观看</option><option value="unmarked">未标记</option></select>}{type==='works'&&<select aria-label="作品排序" data-library-focus="sort" value={sort} onChange={e=>journey.updateFilters({sort:e.target.value as WorkSort,limit:24})}><option value="default">默认排序</option><option value="release-desc">发行新到旧</option><option value="release-asc">发行旧到新</option><option value="score-desc">MV 分高到低</option></select>}{(search||group!=='all'||generation!=='all'||queue!=='all'||stageFilter!=='all'||(type==='works'&&(watch!=='all'||sort!=='default')))&&<button className="filter-reset text-button" onClick={()=>journey.updateFilters(defaultFilters())}><X size={14}/>重置筛选</button>}</div>}
 const workTheme=workExperience(data,route);
 return <ImageRecoveryProvider><div className={workTheme?`work-experience ${workTheme.className}`:"music-experience"} data-work-theme={workTheme?.slug}><MusicNavigation active={route.nav} onNavigate={setNav} canEdit={canEdit} onSearch={query=>journey.navigate({nav:'works',work:null,member:null,groupId:null,video:'mv'},currentLabel(),{...defaultFilters(),search:query})}/><main>
 {data&&!journey.styleReady&&<div role="status" data-style-status><p>{journey.stylePhase==='error'?'页面样式加载失败，输入仍保留。':'正在加载页面样式…'}</p>{journey.stylePhase==='error'&&<button className="button" onClick={journey.retryStyles}>重试样式</button>}<button className="button" onClick={goBack}>返回</button></div>}
 <div data-browse-content inert={!!data&&!journey.styleReady} style={data&&!journey.styleReady?{visibility:'hidden'}:undefined}>
 {!data&&(loading||!error)?<div className="loading-screen"><span className="brand">stage.</span><LoaderCircle size={24} className="spin"/><p>正在加载音乐资料…</p></div>:error&&!data?<div className="empty large"><h2>暂时没能打开手帐</h2><p>{error}</p><button className="button primary" onClick={()=>load()}>重新载入</button><a href="/signin-with-chatgpt?return_to=/" target="_top">使用 ChatGPT 登录</a></div>:data&&<>
 <div className="source-status"><span>{data.mode==='snapshot'?'浏览模式 · 个人记录未载入':refreshing?'正在更新内容，先看看已有收藏…':''}</span><button onClick={()=>load(true)} disabled={refreshing}><RefreshCw size={13} className={refreshing?'spin':''}/>{refreshing?'更新中':'更新内容'}</button></div>{error&&<div className="alert" role="alert">{error} 仍可浏览已有内容。</div>}

 <Suspense fallback={<p role="status">正在打开页面…</p>}>{chosenWork?.placeholder?<PlaceholderDetail work={chosenWork} data={data} onBack={goBack}/>:chosenWork?<WorkDetail key={chosenWork.id} work={chosenWork} sequence={activeSequence} nextWork={nextWork} sequenceLabel={activeSequence?.label} sequencePosition={activeSequence?activeSequence.ids.indexOf(chosenWork.id)+1:0} sequenceTotal={activeSequence?.ids.length??0} onVersion={openVersion} onArtistNavigate={journey.leaveTo} onNext={()=>nextWork&&journey.continueWork(nextWork.id)} initialView={route.video} onViewChange={journey.setVideo} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:route.artistReturn?'返回 '+artistReturnLabel(route.artistReturn):'返回作品库'} data={data} onBack={goBack} onMember={openMember} onGroup={openGroup} onSaved={()=>load(true)}/>:chosenMember?<MemberDetail key={chosenMember.id} member={chosenMember} artistReturn={route.artistReturn} onGroup={openGroup} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:route.artistReturn?'返回成员主页':'返回成员档案'} data={data} onBack={goBack} onWork={id=>openWork(id,libraryWorks.filter(w=>includesMemberWork(data,chosenMember.id,w)),`${memberDisplayName(chosenMember)}的作品`,defaultFilters(),chosenMember.id)} onSaved={()=>load(true)}/>:chosenGroup?GroupDetail?<GroupDetail key={chosenGroup.id} group={chosenGroup} data={data} filters={journey.groupFilters} onFilters={journey.updateGroupFilters} onBack={goBack} backLabel={journey.backLabel?`返回 ${journey.backLabel}`:'返回团体索引'} onMember={id=>openMember(id,{nav:'members',member:id,work:null})} renderPhoto={m=><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'}/>} renderWork={(w,list,q)=><WorkCard key={w.id} work={w} data={data} onOpen={()=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...journey.groupFilters,queue:q,group:chosenGroup.id})}/>} onWork={(w,list,q)=>openWork(w.id,list,chosenGroup.name+' · '+(queueLabels[q]??'全部作品'),{...defaultFilters(),queue:q,group:chosenGroup.id})} noteEditor={<Editor table="groups" id={chosenGroup.id} mode={data.mode} publicCatalog={data} onSaved={()=>load(true)}/>}/>:groupViewsFallback():route.work||route.member||route.groupId?<div className="empty"><h2>暂时找不到这项内容</h2><p>请更新内容后再试。</p><button className="button" onClick={()=>navigate({work:null,member:null,groupId:null})}>返回手帐</button></div>:route.nav==='home'?<MusicHome data={data} onGroup={openGroup} onWork={(w,list)=>openWork(w.id,list,'从一支 MV 开始',defaultFilters())} onWorks={()=>setNav('works')} onGroups={()=>setNav('groups')} onQueue={openQueue}/>:route.nav==='records'?<section aria-label="搜我的记录">
 <PageTitle overline="MY SAVED WORDS" title="搜我的记录" text="找回作品点评、成员备注和评分里留下的记忆点。" count={recordResults.length}/>
 <p className="subtle">只搜索当前已加载的保存记录。关键词仅留在本页内存，不会发送或保存；刷新页面后清空。</p>
 <div className="filters"><label className="search"><Search size={17}/><input data-library-focus="search" type="search" autoComplete="off" spellCheck={false} maxLength={200} aria-label="搜索我的已保存记录" placeholder="输入你记下的词句" value={recordQuery} onChange={e=>{setRecordQuery(e.target.value);setRecordLimit(24);}}/>{recordQuery&&<button aria-label="清除记录搜索" onClick={e=>{setRecordQuery('');setRecordLimit(24);e.currentTarget.parentElement?.querySelector('input')?.focus();}}><X size={14}/></button>}</label></div>
 <div className="result-line" role="status" aria-live="polite" aria-atomic="true">{recordQuery.trim()?`找到 ${recordResults.length} 条记录`:'输入关键词后显示匹配记录'}</div>
 {!recordQuery.trim()?<div className="empty"><h3>想找回哪段记忆？</h3><p>搜索你写下的文字，不包含尚未保存的输入。</p></div>:!recordResults.length?<div className="empty"><h3>没有找到匹配记录</h3><p>试试更短的词句，或更新内容后再搜索。</p></div>:<div>{visibleRecordResults.map(result=><article className="section" key={result.kind+'-'+result.id} style={{overflowWrap:'anywhere'}}>
 <small className="eyebrow">{result.kind==='work'?'作品记录':result.kind==='member'?'成员记录':'成员评分记录'}{result.groups.length?' · '+result.groups.join(' / '):''}</small>
 <h2>{[...result.works.map(w=>w.name),...result.members.map(m=>m.name)].join(' · ')||'关联资料暂未收录'}</h2>
 {result.matches.map(match=><p key={match.label}><strong>{match.label}：</strong>{match.excerpt}</p>)}
 <div className="hero-actions">{result.works.map(work=><button className="button small" key={'work-'+work.id} data-browse-anchor={'record-'+result.kind+'-'+result.id+'-work-'+work.id} onClick={e=>{e.currentTarget.focus({preventScroll:true});journey.navigate({nav:'works',work:work.id,member:null,video:'mv'},'搜我的记录');}}>查看作品 · {work.name}<ChevronRight size={14}/></button>)}{result.members.map(member=><button className="button small" key={'member-'+member.id} data-browse-anchor={'record-'+result.kind+'-'+result.id+'-member-'+member.id} onClick={e=>{e.currentTarget.focus({preventScroll:true});journey.navigate({nav:'members',member:member.id,work:null,video:'mv'},'搜我的记录');}}>查看成员记录 · {member.name}<ChevronRight size={14}/></button>)}</div>
 </article>)}</div>}
 {recordResults.length>0&&<More count={recordResults.length} limit={recordLimit} onMore={()=>setRecordLimit(recordLimit+24)}/>}
 </section>:route.nav==='works'?<><PageTitle overline="THE COLLECTION" title="作品" text="音乐影像与现场表演" count={libraryWorks.length}/><LibraryBrowser catalog={data} filters={journey.filters} onFiltersChange={journey.updateFilters} page={libraryPage} pageSize={libraryPageSize} onPageChange={journey.setLibraryPage} restoreTarget={journey.libraryRestoreTarget} restoreReady={journey.styleReady} onRestoreReady={journey.libraryRestoreMounted} readOnly={data.mode==='snapshot'} renderWork={(w,onOpen)=><WorkCard key={w.id} work={w} data={data} onOpen={onOpen}/>} onOpenWork={(id,sequence)=>journey.navigate({nav:'works',work:id,member:null,video:'mv'},currentLabel(),undefined,sequence.ids.includes(id)?sequence:undefined)}/></>:route.nav==='members'?<><PageTitle overline="THE PEOPLE YOU REMEMBER" title="成员" text="找到喜欢的成员，回看她们的作品。" count={data.members.length}/>{filters('members')}<div className="result-line">{filteredMembers.length} 位成员</div><div className="member-grid">{filteredMembers.slice(0,limit).map(m=><button data-browse-anchor={"member-"+m.id} className="member-tile" key={m.id} onClick={()=>openMember(m.id)}><MusicMemberPhoto member={m} live={data.mode==='live'}/><small>{names(data,m.groupIds)}</small><h3><span className="member-display-name">{memberDisplayName(m)}</span></h3>{m.favorite!==null&&<span className="member-score"><Heart size={12}/> {m.favorite.toFixed(1)}</span>}</button>)}</div><More count={filteredMembers.length} limit={limit} onMore={()=>setLimit(limit+24)}/></>:route.nav==='groups'?<><PageTitle overline="FIND YOUR FAVORITES" title="团体" text="先认识一个团体，再从一支作品开始。" count={data.groups.length}/>{GroupIndex?<GroupIndex data={data} filters={journey.filters} onFilters={journey.updateFilters} onOpen={openGroup} renderPhoto={m=><PhotoView photo={m.photo} label={memberDisplayName(m)} live={data.mode==='live'}/>}/>:groupViewsFallback()}</>:<PersonalInsights catalog={data} memberLabel={memberDisplayName} isStageScoreEligible={work=>stageHasValidBinding(work.stage)} viewState={journey.insights} onViewStateChange={journey.updateInsights} onGroup={openGroup} onMember={openMember} onWork={(id,intent)=>journey.navigate({nav:'works',work:id,member:null,video:intent?.video??'mv'},currentLabel())}/>}
 </Suspense>
  <ImageRecoveryControls/>
 <footer><span className="footer-brand">stage.</span><p>我的观看，我的偏好。</p><div>{canEdit&&<><a className="text-button" href="/api/export"><Download size={15}/>导出我的收藏</a><small>包含评分与备注，不含图片文件</small></>}{canEdit&&canManage&&<a className="text-button" href="/manage" onClick={e=>{if(document.querySelector('[data-navigation-blocked="true"]')){e.preventDefault();window.alert('本次保存还未确认，请先核对保存结果。');}}}>管理资料与备份<ChevronRight size={15}/></a>}</div></footer>
 </>}
 </div></main></div></ImageRecoveryProvider>;
}
function PlaceholderDetail({onBack}:{work:Work;data:Catalog;onBack:()=>void}){return <section className="empty"><h2>这项内容还没有歌曲</h2><p>先到作品库看看其他作品吧。</p><button className="button" onClick={onBack}>返回作品库</button></section>}

function PageTitle({overline,title,text,count}:{overline:string;title:string;text:string;count:number}){return <section className="page-title"><span className="eyebrow">{overline}</span><h1>{title}<sup>{count}</sup></h1><p>{text}</p></section>}
function More({count,limit,onMore}:{count:number;limit:number;onMore:()=>void}){return count===0?<div className="empty"><Search size={25}/><h3>还没有符合条件的记录</h3><p>试试别的名称或筛选条件。</p></div>:count>limit?<div className="more"><button className="button" onClick={onMore}>再看 24 条<ChevronRight size={16}/></button><small>已显示 {Math.min(limit,count)} / {count}</small></div>:null;}
