'use client';
import {ArtistInformation} from '@/components/artist-information';
import {useEffect,useMemo,useState,useSyncExternalStore} from 'react';
import {ArrowLeft,ArrowUpRight,Search,Play} from 'lucide-react';
import type {CatalogView,Member,Work} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import releases from '@/data/vvup-releases.json';
import editorial from '@/data/vvup-review-editorial.json';
import supplements from '@/data/vvup-review-supplements.json';
import {approvedVideoPoster} from '@/lib/idol/approved-video-poster';
import {artistCollection,artistRoute,artistRouteUrl,artistWorkRows,artistWorkUrl,artistMemberUrl,type ArtistSection} from '@/lib/idol/artist-preview';
import {memberChineseName,memberDisplayName} from '@/lib/idol/member-display-name';
import {memberWorks} from '@/lib/idol/member-works';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {videoId} from '@/lib/idol/values';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from './artist-timeline-host';
import {PhotoLightbox} from './photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from './reliable-image';
import {MemberCareerFacts} from './member-career-facts';
import {MemberPhysicalFacts} from './member-physical-facts';
import {useArtistScroll} from './use-artist-scroll';
import {useArtistNavigationScroll} from './use-artist-navigation-scroll';

const path='/artists/vvup';
const officialIds=new Set(editorial.members.filter(m=>m.roster==='official').map(m=>m.id));
const historicalPortrait=supplements.assets.find(a=>a.kind==='member');
const sections:[ArtistSection,string][]=[['overview','首页'],['members','成员'],['records','发行'],['works','影像'],['updates','时间轴']];
const subscribe=(f:()=>void)=>{window.addEventListener('popstate',f);window.addEventListener('artist-location-change',f);return()=>{window.removeEventListener('popstate',f);window.removeEventListener('artist-location-change',f);};};
const score=(v:number|null)=>v===null?'未评分':v.toFixed(1);
function Photo({src,alt,priority=false}:{src?:string|null;alt:string;priority?:boolean}){return <ReliableImage src={src} identityKey={src??alt} alt={alt} priority={priority} missing={<div className="vu-missing">照片暂未收录</div>} errorFallback={<div className="vu-missing">图片暂时无法加载</div>}/>;}
function Chapter({title,label,onMore}:{title:string;label?:string;onMore?:()=>void}){return <div className="vu-chapter-heading"><h2>{title}</h2>{onMore&&<button onClick={onMore}>{label??'查看全部'} <ArrowUpRight size={18}/></button>}</div>;}
function VideoCard({work,returnTo}:{work:Work;returnTo:string}){const poster=approvedVideoPoster(work.id,videoId(work.url),'mv');return <article className="vu-video"><a href={artistWorkUrl(work,false,returnTo)}>{poster&&<div className="vu-video-preview"><Photo src={poster.src} alt={(work.song||work.name)+" · "+(work.version||work.videoType)}/></div>}<div className="vu-video-type"><Play size={32}/><span>{work.videoType||'影像'}</span><small>打开影像</small></div><h3>{work.song||work.name}</h3></a><p>{work.version||work.videoType} · {work.releaseDate||'公开日期待核'}</p><div className="vu-video-links"><a href={artistWorkUrl(work,false,returnTo)}>观看与评分 <ArrowUpRight size={16}/></a>{!!(work.stage||work.stageSupplement?.alternatives.length)&&<a href={artistWorkUrl(work,true,returnTo)}>看舞台 <ArrowUpRight size={16}/></a>}<span>{score(work.score)}</span></div></article>;}

export default function VvupArtist({content}:{content:CandidateContent}){
 const host=useArtistTimelineHostOptions();
 const [fetched,setFetched]=useState<{data:CatalogView|null;error:string;loading:boolean}>({data:null,error:'',loading:true});
 const state=host.catalog!==undefined?{data:host.catalog,error:host.error??'',loading:host.loading??false}:fetched;
 const [attempt,setAttempt]=useState(0);
 const [lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>host.serverRoute??path);
 const route=useMemo(()=>artistRoute(url),[url]);
 const params=new URL(url,'https://stage.invalid').searchParams;
 const releaseId=params.get('release');
 const historical=params.get('roster')==='history';
 const remember=useArtistScroll(!!state.data,url);
 const scroll=useArtistNavigationScroll(!!state.data,url);
 useEffect(()=>{
  if(host.catalog!==undefined)return;
  const controller=new AbortController();
  setFetched(previous=>({...previous,loading:true,error:''}));
  void catalogReadWithDeadline(async signal=>{
   const response=await fetch('/api/catalog?artist=vvup&shape=display-v1',{cache:'no-store',signal});
   if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上资料库。');
   const data=await response.json() as CatalogView;
   if(!data||!['groups','members','works','ratings'].every(k=>Array.isArray(data[k as keyof CatalogView])))throw new Error('资料暂时没有加载完整。');
   return data;
  },controller.signal).then(data=>{if(!controller.signal.aborted)setFetched({data,error:'',loading:false});},error=>{if(!controller.signal.aborted)setFetched({data:null,error:error instanceof Error?error.message:'资料读取失败。',loading:false});});
  return()=>controller.abort();
 },[host.catalog,attempt]);
 const routeHref=(next=route,history=historical)=>{
  const u=new URL(artistRouteUrl(next,path),'https://stage.invalid');
  if(history&&next.section==='members')u.searchParams.set('roster','history');
  return u.pathname+u.search;
 };
 function navigate(patch:Partial<typeof route>,replace=false,history=historical){
  remember();const href=routeHref({...route,...patch},history);
  window.history[replace?'replaceState':'pushState'](newArtistHistoryState(window.history.state),'',href);
  window.dispatchEvent(new Event('artist-location-change'));
  if(!replace)scroll(window.location.href);
 }
 const select=(section:ArtistSection)=>navigate({section,member:null,search:'',queue:'all',format:'all'},false,false);
 const collection=useMemo(()=>state.data?artistCollection(state.data,content.groupId):null,[state.data,content.groupId]);
 const allMembers=collection?.members??[];
 const official=editorial.members.filter(m=>officialIds.has(m.id)).map(m=>allMembers.find(row=>row.id===m.id)).filter((m):m is Member=>!!m);
 const archive=allMembers.filter(m=>!officialIds.has(m.id));
 const member=allMembers.find(m=>m.id===route.member);
 const needle=route.search.trim().toLocaleLowerCase();
 const matchesMember=(m:Member)=>[memberDisplayName(m),m.stageName].some(s=>s.toLocaleLowerCase().includes(needle));
 const returnTo=routeHref();
 const works=collection?.works??[];
 const related=(id:string)=>{const r=releases.entries.find(r=>r.id===id);return works.filter(w=>r?.videoIds.includes(videoId(w.url)??''));};
 const releaseHref=(id:string)=>`${path}?section=records${route.section==='records'&&route.search?'&q='+encodeURIComponent(route.search):''}&release=${encodeURIComponent(id)}`;
 const releaseList=artistRouteUrl({...route,section:'records',member:null,queue:'all',format:'all'},path);
 const shownWorks=artistWorkRows(works,route.queue,route.search).filter(w=>route.format==='stage'?!!(w.stage||w.stageSupplement?.alternatives.length):route.format==='mv'?w.videoType==='官方MV':true);
 function portraitOriginal(m:Member){if(m.id===historicalPortrait?.memberId)return historicalPortrait.url;const p=content.portraits[m.id];return p?`/artist/vvup/batch-b-20261016/${p.stageName.toLowerCase()}-original.jpg`:null;}
 function roster(items:Member[]){return <div className="vu-roster">{items.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id},false,!officialIds.has(m.id)||historical)}><span className="vu-portrait-frame"><Photo src={content.portraits[m.id]?.image??(m.id===historicalPortrait?.memberId?historicalPortrait.url:null)} alt={memberDisplayName(m)+' · 官方资料照'}/></span><strong>{memberChineseName(m)||m.stageName}</strong><span>{m.stageName}</span>{!officialIds.has(m.id)&&<small>历史成员</small>}</button>)}</div>;}
 function releaseGrid(entries= releases.entries){return <div className="vu-releases">{entries.map(r=><a key={r.id} href={releaseHref(r.id)} data-artist-release-trigger={r.id}><div className="vu-cover">{r.image?<Photo src={r.image} alt={r.title+' · 发行封面'}/>:<div className="vu-cover-missing"><strong>{r.title}</strong><span>发行封面暂缺</span></div>}</div><h3>{r.title}</h3><p>{r.date||'发行日期待核'} · {r.type}</p></a>)}</div>;}
 function timeline(){return <ArtistTimelineHost groupId={content.groupId} catalog={state.data} loading={state.loading} error={state.error} onRetry={retry} background={<p>从音乐与成员的足迹，回看 VVUP。</p>}/>;}
 function retry(){if(host.onRetry)host.onRetry();else setAttempt(x=>x+1);}
 function memberPage(m:Member){
  const items=state.data?memberWorks(state.data,m.id):[],original=portraitOriginal(m);
  return <><button className="vu-back" onClick={()=>navigate({section:'members',member:null})}><ArrowLeft size={16}/>返回成员</button><section className="vu-member-detail"><figure><Photo src={content.portraits[m.id]?.image??(m.id===historicalPortrait?.memberId?historicalPortrait.url:null)} alt={memberDisplayName(m)+' · 资料照'} priority/>{original&&<button className="vu-outline" onClick={()=>setLightbox({src:original,label:memberDisplayName(m)+' · 官方资料图'})}>查看原图 <ArrowUpRight size={16}/></button>}</figure><div><p className="vu-kicker">VVUP / {officialIds.has(m.id)?'MEMBER':'ARCHIVE'}</p><h1>{memberChineseName(m)||m.stageName}</h1><p className="vu-stage-name">{m.stageName}</p><p>{officialIds.has(m.id)?'官方资料页列示成员':'历史成员 · 已结束本团活动'}</p><p>{m.country}{m.birthDate?' · '+m.birthDate:''}</p>{!officialIds.has(m.id)&&<p>2024《Ain’t Nobody》官方历史概念照 · 活动结束的独立生效日期未确认。</p>}<MemberPhysicalFacts member={m}/><MemberCareerFacts member={m}/><a className="vu-outline" href={artistMemberUrl(m.id,returnTo)}>个人档案与记录 <ArrowUpRight size={16}/></a>{original?<a href={content.portraits[m.id]?.sourceUrl??historicalPortrait?.sourceUrl} target="_blank" rel="noopener noreferrer">官方资料与图片来源 ↗</a>:<p>活动结束的独立生效日期未确认。</p>}</div></section><section><Chapter title="她的作品"/><p className="vu-muted">按已有成员与作品关系展示；MV 个人造型图尚未收录。</p><div className="vu-videos">{items.map(item=><VideoCard key={item.work.id} work={item.work} returnTo={returnTo}/>)}</div>{!items.length&&<p className="vu-empty">尚无已关联的作品记录。</p>}</section></>;
 }
 function releasePage(){
  const r=releases.entries.find(r=>r.id===releaseId);
  if(releaseId&&!r)return <div className="vu-empty"><h1>未找到这项发行</h1><a href={releaseList}>返回发行目录</a></div>;
  if(r)return <><a className="vu-back" href={releaseList}><ArrowLeft size={16}/>返回发行目录</a><section className="vu-release-detail"><div className="vu-cover">{r.image?<button aria-label={'查看 '+r.title+' 封面'} onClick={()=>setLightbox({src:r.image,label:r.title+' · 发行封面'})}><Photo src={r.image} alt={r.title+' · 发行封面'} priority/></button>:<div className="vu-cover-missing"><strong>{r.title}</strong><span>发行封面暂缺</span></div>}</div><div><p className="vu-kicker">VVUP / RELEASE</p><h1>{r.title}</h1><p>{r.type} · {r.date||'实际发行日期待核'}</p><p>{r.note}</p><a className="vu-outline" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">发行来源 <ArrowUpRight size={16}/></a></div></section><section><Chapter title="相关影像"/><p className="vu-muted">发行日与视频公开日分别展示。</p><div className="vu-videos">{related(r.id).map(w=><VideoCard key={w.id} work={w} returnTo={releaseHref(r.id)}/>)}</div>{!related(r.id).length&&<p className="vu-empty">尚未收录对应影像。</p>}</section></>;
  const filtered=releases.entries.filter(r=>[r.title,r.date,r.type].some(v=>v.toLocaleLowerCase().includes(needle)));
  return <section><Chapter title="发行档案"/><p className="vu-muted">{releases.scope}</p><SearchBox label="搜索发行" value={route.search} change={q=>navigate({search:q},true)}/><p className="vu-count" role="status">{filtered.length} 项发行</p>{releaseGrid(filtered)}{!filtered.length&&<EmptyResult clear={()=>navigate({search:''},true)}/>}</section>;
 }
 return <ImageRecoveryProvider><div className="vvup-artist" data-design-source="figma-802-1096"><header className="vu-header"><a className="vu-logo" href={path}>VVUP</a><nav aria-label="团体内容">{sections.map(([key,label])=><button key={key} aria-current={!route.member&&route.section===key?'page':undefined} onClick={()=>select(key)}>{label}</button>)}</nav></header>
 {!route.member&&route.section==='overview'&&<section className="vu-hero"><div className="vu-title"><h1>VVUP</h1><span>2024.04.01 DEBUT</span></div><div className="vu-hero-stage"><figure><Photo src={content.hero.image} alt="VVUP · 官方团体资料照" priority/><figcaption><a href={content.hero.sourceUrl??undefined} target="_blank" rel="noopener noreferrer">官方团体资料图 ↗</a></figcaption></figure><div><button onClick={()=>select('members')}>认识成员 <ArrowUpRight/></button><button onClick={()=>select('works')}>进入影像 <ArrowUpRight/></button></div></div></section>}
 <main id="artist-content" className={route.section==='overview'&&!route.member?'vu-home':'vu-content'}>{state.loading?<p className="vu-empty" role="status">正在打开 VVUP 档案…</p>:state.error?<div className="vu-empty" role="alert"><p>{state.error}</p><button onClick={retry}>重新加载</button></div>:!collection?<div className="vu-empty">暂未找到团体资料。</div>:route.member?(member?memberPage(member):<div className="vu-empty">未找到这位成员。<button onClick={()=>select('members')}>返回成员</button></div>):<>
 {route.section==='overview'&&<>
<ArtistInformation slug="vvup"/>
<div className="vu-acid-band"><h2>成员</h2><button onClick={()=>select('members')}>全部成员 <ArrowUpRight size={18}/></button></div>
<section className="vu-home-roster">{roster(official)}</section>
<section><Chapter title="发行作品" label="全部发行" onMore={()=>select('records')}/>{releaseGrid(releases.entries.slice(0,3))}</section>
<section><Chapter title="影像" label="全部影像" onMore={()=>select('works')}/><div className="vu-videos">{works.slice(0,2).map(w=><VideoCard key={w.id} work={w} returnTo={returnTo}/>)}</div></section>
<section><Chapter title="时间轴" label="完整时间轴" onMore={()=>select('updates')}/>{timeline()}</section>
</>}
 {route.section==='members'&&<section><Chapter title="成员档案"/><div className="vu-pills" aria-label="成员范围"><button aria-pressed={!historical} onClick={()=>navigate({member:null},false,false)}>官方列示成员</button><button aria-pressed={historical} onClick={()=>navigate({member:null},false,true)}>含历史成员</button></div><SearchBox label="搜索成员" value={route.search} change={q=>navigate({search:q},true)}/><p className="vu-count" role="status">{[...official,...(historical?archive:[])].filter(matchesMember).length} 份档案</p>{roster(official.filter(matchesMember))}{historical&&archive.some(matchesMember)&&<><h2 className="vu-archive-title">历史成员</h2>{roster(archive.filter(matchesMember))}</>}{![...official,...(historical?archive:[])].some(matchesMember)&&<EmptyResult clear={()=>navigate({search:''},true)}/>}<p className="vu-muted">官方资料页列示四位成员；历史档案及原有作品关系独立保留。</p></section>}
 {route.section==='records'&&releasePage()}
 {route.section==='works'&&<section><Chapter title="作品与舞台"/><SearchBox label="搜索本团作品" value={route.search} change={q=>navigate({search:q},true)}/><div className="vu-pills" aria-label="播放内容">{[['all','全部影像'],['mv','MV'],['stage','可看舞台']].map(([key,label])=><button key={key} aria-pressed={route.format===key} onClick={()=>navigate({format:key})}>{label}</button>)}</div><div className="vu-pills" aria-label="观看状态">{[['all','全部记录'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']].map(([key,label])=><button key={key} aria-pressed={route.queue===key} onClick={()=>navigate({queue:key})}>{label}</button>)}</div><p className="vu-count" role="status">{shownWorks.length} 支影像</p><div className="vu-videos">{shownWorks.map(w=><VideoCard key={w.id} work={w} returnTo={returnTo}/>)}</div>{!shownWorks.length&&<EmptyResult clear={()=>navigate({search:'',queue:'all',format:'all'})}/>}</section>}
 {route.section==='updates'&&<section><Chapter title="时间轴"/>{timeline()}</section>}
 </>}</main><footer className="vu-footer"><a className="vu-logo" href={path}>VVUP</a><a href="/?view=groups">团体索引 <ArrowUpRight size={16}/></a><button onClick={()=>select('updates')}>时间轴 <ArrowUpRight size={16}/></button></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
function SearchBox({label,value,change}:{label:string;value:string;change:(v:string)=>void}){return <label className="vu-search"><Search size={18}/><input aria-label={label} placeholder={label} value={value} onChange={e=>change(e.target.value)}/></label>;}
function EmptyResult({clear}:{clear:()=>void}){return <div className="vu-empty"><p>没有符合条件的结果。</p><button className="vu-outline" onClick={clear}>查看全部</button></div>;}
