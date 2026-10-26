'use client';
import {followerAccountLabel} from '@/lib/idol/follower-count.mjs';
import {ArtistInformation,ArtistHomeTimeline} from '@/components/artist-information';
import figmaAssets from '@/data/runtime/hearts2hearts-figma-assets.json';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from './artist-timeline-host';
import {memberChineseName,memberDisplayName} from '@/lib/idol/member-display-name';
import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore,type ComponentProps} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {ArrowLeft,ArrowUpRight,ImageIcon,Search} from 'lucide-react';
import type {CatalogView as Catalog,Member,Photo,Work} from '@/lib/idol/types';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkRows,artistWorkUrl,artistWorkScoreLabel,type ArtistSection} from '@/lib/idol/artist-preview';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {videoId} from '@/lib/idol/values';
import type {ExpandedArtistContent} from './expanded-artist';
import {PhotoLightbox} from './photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from './reliable-image';
import {useArtistScroll} from './use-artist-scroll';

type Hearts2HeartsContent=ExpandedArtistContent&{memberVisuals:Record<string,{image:string;label:string;date:string;identitySourceUrl?:string}>;releaseCoverage:{scope:string};featuredReleaseIds:string[];releaseVideoIds:Record<string,string[]>};
const path='/artists/hearts2hearts';
const sections:[ArtistSection,string][]=[['overview','首页'],['members','成员'],['records','作品'],['works','影像'],['updates','历程']];
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
const number=(v:number|null)=>v===null?'待评':v.toFixed(1);
const media=(p:Photo)=>`/api/media?table=${p.table}&record=${p.recordId}&index=${p.index}`;
const external=(url:string)=>safeGroupLink(url)??undefined;
function subscribe(fn:()=>void){window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};}
function A({href,children,...props}:ComponentProps<'a'>){return href?<a href={href} {...props}>{children}</a>:<span>{children}</span>;}
function Picture({src,alt,priority=false,identityKey}:{src?:string|null;alt:string;priority?:boolean;identityKey?:string}){return <ReliableImage src={src} identityKey={identityKey??src??alt} alt={alt} priority={priority} referrerPolicy="no-referrer" missing={<div className="h2h-photo-empty"><ImageIcon size={22}/><span>{'图片暂未收录'}</span></div>} errorFallback={<div className="h2h-photo-empty"><ImageIcon size={22}/><span>图片暂未加载</span></div>}/>;}
function Heading({label,title,onMore}:{label:string;title:string;onMore?:()=>void}){return <div className="h2h-heading"><div><small>{label}</small><h2>{title}</h2></div>{onMore&&<button onClick={onMore}>查看全部<ArrowUpRight size={14}/></button>}</div>;}
async function readCatalog(signal:AbortSignal){
 return catalogReadWithDeadline(async requestSignal=>{
 const r=await fetch('/api/catalog?artist=hearts2hearts&shape=display-v1',{cache:'no-store',signal:requestSignal});
 if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上你的资料库，请重试。');
 const d=await r.json() as Catalog;
 if(!d||!Array.isArray(d.groups)||!Array.isArray(d.members)||!Array.isArray(d.works)||!Array.isArray(d.ratings))throw new Error('资料暂时没有加载完整，请重试。');
 return d;
 },signal);
}
function WorkCard({work,returnTo,index}:{work:Work;returnTo:string;index:number}){
 return <article className="h2h-work"><small className="h2h-eyebrow">{String(index+1).padStart(2,'0')}</small><h3>{work.song||work.name}</h3><p>{[work.version,work.videoType].filter(Boolean).join(' · ')}</p><time>{work.releaseDate?.slice(0,10)}</time><span className="h2h-score">我的 MV 分 · {artistWorkScoreLabel(work.score)}{work.score===null?'':' / 10'}</span><div className="h2h-work-actions"><A className="h2h-button secondary" href={artistWorkUrl(work,false,returnTo)}>视频与评分<ArrowUpRight size={14}/></A>{!!(work.stage||work.stageSupplement?.alternatives.length)&&<A className="h2h-button" href={artistWorkUrl(work,true,returnTo)}>{work.stage?'舞台':'其他现场'}<ArrowUpRight size={14}/></A>}</div></article>;
}
export default function Hearts2HeartsArtist({content}:{content:Hearts2HeartsContent}){
 const timelineHostOptions=useArtistTimelineHostOptions();
 const [fetchedData,setData]=useState<Catalog|null>(null),[fetchedError,setError]=useState(''),[fetchedLoading,setLoading]=useState(true),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const [menuOpen,setMenuOpen]=useState(false);
 const data=timelineHostOptions.catalog!==undefined?timelineHostOptions.catalog:fetchedData,loading=timelineHostOptions.loading??(timelineHostOptions.catalog!==undefined?false:fetchedLoading),error=timelineHostOptions.error??fetchedError;
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>timelineHostOptions.serverRoute??path),route=useMemo(()=>artistRoute(url),[url]),returnTo=artistRouteUrl(route,path),rememberScroll=useArtistScroll(!!data,url);
 const loadSequence=useRef(0),loadAbort=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{
  if(timelineHostOptions.catalog!==undefined)return;
  const sequence=++loadSequence.current;
  loadAbort.current?.abort();
  const controller=new AbortController();loadAbort.current=controller;
  setLoading(true);setError('');
  try{const d=await readCatalog(controller.signal);if(sequence===loadSequence.current)setData(d);}
  catch(e){if(sequence===loadSequence.current&&!controller.signal.aborted)setError((e as Error).message);}
  finally{if(sequence===loadSequence.current){setLoading(false);loadAbort.current=null;}}
 },[timelineHostOptions.catalog]);
 const cancelLoad=useCallback(()=>{loadSequence.current++;loadAbort.current?.abort();loadAbort.current=null;},[]);
 useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)void load();});return()=>{active=false;cancelLoad();};},[load,cancelLoad]);
 function retry(){if(timelineHostOptions.onRetry){timelineHostOptions.onRetry();return;}void load();}
 function navigate(patch:Partial<ReturnType<typeof artistRoute>>,replace=false){rememberScroll();window.history[replace?'replaceState':'pushState'](newArtistHistoryState(window.history.state),'',artistRouteUrl({...route,...patch},path));window.dispatchEvent(new Event('artist-location-change'));if(!replace)document.getElementById('artist-content')?.scrollIntoView({block:'start'});}
 const releaseId=new URL(url,'https://stage.invalid').searchParams.get('release');
 const collection=useMemo(()=>data?artistCollection(data,content.groupId):null,[data,content.groupId]);
 const members=collection?[...collection.members].sort((a,b)=>content.profile.members.indexOf(a.stageName)-content.profile.members.indexOf(b.stageName)):[];
 const member=members.find(m=>m.id===route.member);
 const select=(section:ArtistSection)=>{setMenuOpen(false);navigate({section,member:null,format:'all',queue:'all',search:section===route.section?route.search:''});};
 const representative=collection?.works.find(w=>videoId(w.url)==='kxUA2wwYiME')??collection?.works.find(w=>!!w.url);
 const matchesFormat=(w:Work)=>route.format==='stage'?!!(w.stage||w.stageSupplement?.alternatives.length):route.format==='mv'?['官方MV','特别合作MV','混音版MV'].includes(w.videoType)&&!!w.url:true;
 const rows=collection?artistWorkRows(collection.works,route.queue,route.search).filter(matchesFormat):[];

 const visual=(m:Member)=>content.memberVisuals[m.stageName];
 const chinese=(m:Member)=>figmaAssets.members.find(x=>x.id===m.id)?.cn||memberChineseName(m)||memberDisplayName(m);
 const releaseListUrl=artistRouteUrl({...route,section:'records',member:null,format:'all',queue:'all'},path);
 const releaseUrl=(id:string)=>`${path}?section=records${route.section==='records'&&route.search?'&q='+encodeURIComponent(route.search):''}&release=${encodeURIComponent(id)}`;
 const memberMatches=(m:Member)=>[chinese(m),m.stageName,m.name].some(value=>value?.toLocaleLowerCase().includes(route.search.trim().toLocaleLowerCase()));
 const shownMembers=route.section==='members'?members.filter(memberMatches):members;
 const shownReleases=content.releases.filter(r=>[r.title,r.type,r.date].some(value=>value.toLocaleLowerCase().includes(route.search.trim().toLocaleLowerCase())));
 function searchBox(label:string,placeholder:string){return <div className="h2h-browse-tools"><label><Search size={18}/><input aria-label={label} placeholder={placeholder} value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label>{route.search&&<button className="h2h-text-button" onClick={()=>navigate({search:''},true)}>清除搜索</button>}</div>;}
 const releaseImage=(r:Hearts2HeartsContent['releases'][number])=>r.id==='iconic-heart'?figmaAssets.releaseImages['iconic-heart']:r.image;
 const selectedRelease=content.releases.find(r=>r.id===releaseId);
 const releaseWorks=(id:string)=>collection?.works.filter(w=>(content.releaseVideoIds[id]??[]).includes(videoId(w.url)??''))??[];
 function roster(){return <div className="h2h-roster">{shownMembers.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><Picture identityKey={'member:'+m.id} src={visual(m)?.image} alt={`${chinese(m)} · ${m.stageName}`}/><span className="h2h-roster-strip"><small>{String(members.indexOf(m)+1).padStart(2,'0')}</small><strong>{m.stageName}</strong></span><span className="h2h-roster-cn member-display-name">{chinese(m)}</span></button>)}</div>;}
 function social(){return <section className="h2h-social" aria-label="官方账号与粉丝数">{content.social.map(s=><A href={external(s.url)} key={s.platform} target="_blank" rel="noopener noreferrer"><small>{s.platform}<ArrowUpRight size={14}/></small><strong>{s.display?.replace(/\s*(?:粉丝|订阅|followers?|subscribers?)\s*$/i,'').trim()||'暂无公开数字'}</strong><span>{s.metric} · {s.handle} · {s.observedAt.slice(0,10)}</span></A>)}</section>;}
 function renderTimeline(){return <ArtistTimelineHost groupId={content.groupId} catalog={data} loading={loading} error={error} onRetry={retry}/>;}
 function music(){const lead=content.releases.find(r=>r.id==='moonride')??content.releases[0];return lead&&<div className="h2h-music"><A className="h2h-music-cover" href={releaseUrl(lead.id)}><Picture src={releaseImage(lead)} alt={`${lead.title} 发行封面`}/></A><div className="h2h-music-info"><h3>{lead.title}</h3><p>{lead.type} · {lead.date}</p><A className="h2h-button" href={releaseUrl(lead.id)}>发行详情<ArrowUpRight size={14}/></A><div className="h2h-mini-releases">{['lemon-tang','iconic-heart'].map(id=>content.releases.find(r=>r.id===id)).filter(r=>!!r).map(r=><A key={r.id} href={releaseUrl(r.id)}><Picture src={releaseImage(r)} alt={`${r.title} 发行封面`}/><strong>{r.title}</strong><small>{r.date}</small></A>)}</div></div></div>;}
 function releasePage(){if(releaseId&&!selectedRelease)return <div className="h2h-empty"><h1>未找到这张发行</h1><A className="h2h-button" href={releaseListUrl}>查看全部发行</A></div>;return selectedRelease?<><A className="h2h-back" href={releaseListUrl}><ArrowLeft size={15}/>发行目录</A><section className="h2h-release-detail"><Picture src={releaseImage(selectedRelease)} alt={`${selectedRelease.title} 发行封面`} priority/><div><small className="h2h-eyebrow">RELEASE</small><h1>{selectedRelease.title}</h1><h2>{selectedRelease.type}</h2><p>{selectedRelease.date}</p><h2>Hearts2Hearts</h2><A className="h2h-button" href={external(selectedRelease.sourceUrl)} target="_blank" rel="noopener noreferrer">官方发行页<ArrowUpRight size={14}/></A></div></section><section className="h2h-band h2h-release-related"><h2>相关影像</h2>{releaseWorks(selectedRelease.id).map(w=><div key={w.id}><p>{w.song||w.name} · {w.videoType}</p><small>{w.releaseDate?.slice(0,10)} · Hearts2Hearts</small><A className="h2h-button" href={artistWorkUrl(w,false,releaseUrl(selectedRelease.id))}>观看与评分<ArrowUpRight size={14}/></A></div>)}</section></>:<><div className="h2h-page-title lime"><small>HEARTS2HEARTS / RELEASES</small><h1>Music <span aria-hidden="true">♥</span></h1><p>收录的三张精选发行</p></div><section className="h2h-section">
  {searchBox('搜索发行','搜索唱片名称、类型或日期')}
  <p className="h2h-result-count" role="status">{shownReleases.length} 张发行</p>
  <div className="h2h-release-grid">{shownReleases.map(r=><A key={r.id} href={releaseUrl(r.id)} className="h2h-release-card"><Picture src={releaseImage(r)} alt={`${r.title} 发行封面`}/><time>{r.date}</time><h2>{r.title}</h2><p>{r.type}</p><span>发行详情 <ArrowUpRight size={16}/></span></A>)}</div>
  {!shownReleases.length&&<div className="h2h-empty"><p>没有找到这张发行。</p><button className="h2h-button" onClick={()=>navigate({search:''},true)}>查看全部发行</button></div>}
 </section></>;}
 function memberPage(m:Member){if(!data)return null;const items=memberWorks(data,m.id),s=memberWorkSummary(items);return <><button className="h2h-back" onClick={()=>navigate({section:'members',member:null})}><ArrowLeft size={15}/>八位成员</button><section className="h2h-member-hero"><button type="button" className="h2h-member-photo" aria-haspopup="dialog" aria-label={`放大${chinese(m)} · ${m.stageName}的官方照片`} onClick={()=>visual(m)?.image&&setLightbox({src:visual(m).image,label:`${chinese(m)} · ${m.stageName} · 官方成员照`})}><Picture identityKey={'member:'+m.id} src={visual(m)?.image} alt={`${chinese(m)} · ${m.stageName}`} priority/><span>查看原图 ↗</span></button><div><span className="h2h-heart" aria-hidden="true">♥</span><small className="h2h-eyebrow">{String(members.indexOf(m)+1).padStart(2,'0')} / EIGHT MEMBERS</small><h1>{m.stageName}</h1><h2 className="member-display-name">{chinese(m)}</h2><p>Hearts2Hearts · 成员</p><A className="h2h-button" href={external(visual(m)?.identitySourceUrl||content.profile.sourceUrl)} target="_blank" rel="noopener noreferrer">官方个人介绍<ArrowUpRight size={14}/></A><details className="h2h-member-facts"><summary>个人资料与评分</summary><MemberPhysicalFacts member={m}/><MemberCareerFacts member={m}/><p>{[m.country,m.birthDate,m.role].filter(Boolean).join(' · ')}</p><div className="h2h-member-summary"><div><small>作品综合分</small><strong>{number(s.composite)}</strong><span>{s.ratedWorks} 支作品已评</span></div><div><small>表现均分</small><strong>{number(s.performanceMean)}</strong><span>{s.performanceCount} 支已评</span></div><div><small>造型均分</small><strong>{number(s.stylingMean)}</strong><span>{s.stylingCount} 支已评</span></div></div>{s.composite===null&&<p>表现和造型都有评分后，显示作品综合分。</p>}<div className="h2h-member-social">{(m.social??[]).map(a=><A key={a.platform} href={external(a.url)} target="_blank" rel="noopener noreferrer">{a.platform} · {followerAccountLabel(a)}<small>{a.observedAt?.slice(0,10)}</small></A>)}</div><A className="h2h-button secondary" href={artistMemberUrl(m.id,returnTo)}>个人记录<ArrowUpRight size={14}/></A></details></div></section><section className="h2h-section h2h-member-work-section"><Heading label="WATCH" title="作品里的她"/><div className="h2h-member-works">{items.map(x=><article key={x.work.id}>{x.photo&&<button type="button" className="h2h-member-look member-mv-look" aria-haspopup="dialog" aria-label={`放大${chinese(m)}在${x.work.song}的 MV 造型`} onClick={()=>x.photo&&setLightbox({src:media(x.photo),label:`${chinese(m)} · ${x.work.song} · ${x.work.version||'MV造型'}`})}><Picture identityKey={'look:'+m.id+':'+x.work.id} src={media(x.photo)} alt={`${chinese(m)} · ${x.work.song} MV 造型`}/></button>}<A data-member-work-trigger={x.work.id} href={artistWorkUrl(x.work,false,returnTo)}><h3>{x.work.song||x.work.name}<ArrowUpRight size={14}/></h3><p>{x.work.version||x.work.videoType}</p><div>表现 {number(x.performance)} · 造型 {number(x.styling)}</div></A></article>)}</div></section><section className="h2h-band"><h2>继续认识 Hearts2Hearts</h2><button className="h2h-button" onClick={()=>select('works')}>浏览全部作品<ArrowUpRight size={14}/></button></section></>;}
 return <ImageRecoveryProvider><div className="hearts2hearts-artist"><header className="h2h-header"><A className="h2h-brand" href={path}><img src="/artist/hearts2hearts/logo.svg" alt="Hearts2Hearts"/></A><button className="h2h-menu-toggle" aria-expanded={menuOpen} aria-controls="h2h-navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?'关闭':'菜单'}</button><nav id="h2h-navigation" className={menuOpen?'is-open':''} aria-label="Hearts2Hearts 导航">{sections.map(([k,label])=><button key={k} aria-current={route.section===k?'page':undefined} onClick={()=>select(k)}>{label}</button>)}<A className="h2h-global-link" href="/?view=groups">团体索引<ArrowUpRight size={13}/></A></nav></header>
 <main id="artist-content">{route.section==='overview'&&!route.member&&<section className="h2h-hero"><div className="h2h-masthead"><img src="/artist/hearts2hearts/logo.svg" alt=""/><h1>Hearts2Hearts</h1><span className="h2h-heart" aria-hidden="true">♥</span><small>8 MEMBERS · SM ENTERTAINMENT</small><p>8 位成员 · 从 The Chase 开始</p></div><figure><Picture identityKey={'hero:'+content.groupId} src={figmaAssets.heroImage} alt="Hearts2Hearts 八位成员官方团体照" priority/></figure><div className="h2h-hero-caption"><small>{content.profile.debutDate} 出道</small><button className="h2h-button" onClick={()=>document.getElementById('h2h-members')?.scrollIntoView({behavior:'smooth'})}>认识八位成员 ↓</button></div></section>}
 {loading&&!data?<div className="h2h-empty" role="status">正在打开你的 Hearts2Hearts 收藏…</div>:error?<div className="h2h-empty" role="alert"><p>{error}</p><button className="h2h-button" onClick={retry}>重新加载</button></div>:!collection?<div className="h2h-empty">暂未找到团体资料。<A href="/?view=groups">返回团体索引</A></div>:route.member?(member?memberPage(member):<div className="h2h-empty">这个成员不在 Hearts2Hearts 档案中。<button onClick={()=>navigate({member:null,section:'members'})}>查看成员</button></div>):<>
 {route.section==='overview'&&<>
<ArtistInformation slug="hearts2hearts"/>
<section id="h2h-members"><div className="h2h-band"><small className="h2h-eyebrow">EIGHT MEMBERS</small><h2>Hearts × 8</h2></div><div className="h2h-section">{roster()}<button className="h2h-button" onClick={()=>select('members')}>成员目录<ArrowUpRight size={14}/></button></div></section>
<section className="h2h-section"><Heading label="RELEASES" title="Music ♥"/>{music()}</section>
{representative&&<section><div className="h2h-band lime"><small className="h2h-eyebrow">WATCH</small><h2>{representative.song}</h2></div><div className="h2h-section h2h-watch"><h3>{representative.song}</h3><p>{representative.releaseDate?.slice(0,10)} · {representative.videoType}</p><A className="h2h-button" href={artistWorkUrl(representative,false,returnTo)}>观看官方 MV<ArrowUpRight size={14}/></A><button className="h2h-text-button" onClick={()=>select('works')}>MV / 舞台 →</button></div></section>}
<ArtistHomeTimeline slug="hearts2hearts"/>
<section className="h2h-section h2h-history-entry"><h2>从 2025 开始</h2><button className="h2h-button" onClick={()=>select('updates')}>完整历程<ArrowUpRight size={14}/></button></section>
</>}
 {route.section==='members'&&<><div className="h2h-page-title"><small>HEARTS2HEARTS / MEMBERS</small><h1>Meet all eight</h1><p>八位成员</p></div><section className="h2h-section">{searchBox('搜索成员','搜索中文名或艺名')}<p className="h2h-result-count" role="status">{shownMembers.length} / {members.length} 位成员</p>{roster()}{!shownMembers.length&&<div className="h2h-empty"><p>没有找到这位成员。</p><button className="h2h-button" onClick={()=>navigate({search:''},true)}>查看八位成员</button></div>}</section></>}
 {route.section==='updates'&&<><div className="h2h-page-title"><small>HEARTS2HEARTS / HISTORY</small><h1>从 2025 开始</h1><p>按时间认识 Hearts2Hearts</p></div><section className="h2h-section">{renderTimeline()}</section></>}
 {route.section==='works'&&<><div className="h2h-page-title lime"><small>HEARTS2HEARTS / WORKS</small><h1>Works</h1><p>{collection.works.length} 个作品版本</p></div><section className="h2h-section"><div className="h2h-work-tools"><div className="h2h-pills" aria-label="播放内容">{([['all','全部'],['mv','官方 MV'],['stage','舞台入口']] as const).map(([k,l])=><button key={k} aria-pressed={route.format===k} onClick={()=>navigate({format:k})}>{l}</button>)}</div><label><Search size={17}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label><div className="h2h-pills">{queues.map(([k,l])=><button key={k} aria-pressed={route.queue===k} onClick={()=>navigate({queue:k})}>{l}<span>{artistWorkRows(collection.works,k,route.search).filter(matchesFormat).length}</span></button>)}</div></div><div className="h2h-work-grid">{rows.map((w,i)=><WorkCard key={w.id} work={w} index={i} returnTo={returnTo}/>)}</div>{!rows.length&&<div className="h2h-empty"><p>没有符合条件的作品。</p><button className="h2h-button" onClick={()=>navigate({queue:'all',search:'',format:'all'})}>查看全部作品</button></div>}</section></>}
 {route.section==='records'&&releasePage()}
 </>}</main><footer className="h2h-footer"><strong>Hearts2Hearts</strong><p>SM Entertainment · {content.profile.debutDate} 出道</p><div><A href={external(content.profile.sourceUrl)} target="_blank" rel="noopener noreferrer">官方网站 ↗</A><A href="/?view=groups">团体索引 ↗</A></div><details className="h2h-source-details"><summary>官方账号</summary>{social()}</details><small>STAGE · 私人观看与评分手帐</small></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
