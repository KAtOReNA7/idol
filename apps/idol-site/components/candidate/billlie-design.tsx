'use client';
import {ArtistInformation} from '@/components/artist-information';
import {useEffect,useMemo,useState,useSyncExternalStore,type ReactNode} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkScoreLabel,artistWorkUrl} from '@/lib/idol/artist-preview';
import {billlieEventReleases,harunaActivity,billlieExternalVideo} from '@/lib/idol/billlie-public-context';
import {readTimelineReturnState} from '@/lib/idol/timeline/return-state';
import {billlieStageScore} from '@/lib/idol/billlie-stage';
import {billlieCatalog} from '@/lib/idol/billlie-catalog';
import {memberWorks} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import design from '@/data/runtime/billlie-figma-catalog.json';
import type {CatalogView,Member,Work} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import './billlie-figma-design.css';

const path='/artists/billlie';
const tabs=[['overview','首页'],['members','成员'],['works','作品'],['updates','大事']] as const;
const queues=[['all','全部'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
function subscribe(fn:()=>void){window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};}
function Picture({src,alt,priority=false}:{src?:string|null;alt:string;priority?:boolean}){return <ReliableImage src={src} alt={alt} identityKey={src||alt} priority={priority} missing={<span>图片暂缺</span>} errorFallback={<span>图片暂时无法加载</span>}/>;}
function External({href,children}:{href:string;children:ReactNode}){const safe=safeGroupLink(href);return safe?<a className="bf-button" href={safe} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14}/></a>:null;}
function Title({en,children}:{en:string;children:ReactNode}){return <div className="bf-title"><h2>{en}</h2><p>{children}</p></div>;}
// A still is valid only for the exact work AND video, never for an alternate cut.
export function billlieVideoArt(work:Work,stage=false){const entry=design.works.find(row=>row.id===work.id),video=stage?entry?.stage:entry?.mv;if(!video)return null;const url=stage?work.stage?.url:work.url;if(!url)return null;try{const parsed=new URL(url);const id=parsed.hostname==='youtu.be'?parsed.pathname.slice(1):parsed.searchParams.get('v');if(id!==video.id||stage&&(work.stage?.videoId!==video.id||work.stage?.clip))return null;return video.src;}catch{return null;}}
function WorkCard({work,stage=false,returnTo}:{work:Work;stage?:boolean;returnTo:string}){const src=billlieVideoArt(work,stage),stageScore=billlieStageScore(work);return <article className="bf-work" data-work-id={work.id} data-video-kind={stage?'stage':'mv'}><a href={artistWorkUrl(work,stage,returnTo)}>{src&&<div className="bf-video-image"><Picture src={src} alt={`${work.song||work.name} ${stage?'舞台':'MV'}`}/></div>}<h3>{stage?work.stage?.title||work.song:work.song||work.name}</h3><p>{stage?'舞台':work.videoType||'MV'} · {(stage?work.stage?.publishedDate:work.releaseDate)?.slice(0,10)}</p><p>{stage?'舞台':'作品'}评分 {stage&&!stageScore.valid?'评分绑定待核，旧评分不展示':artistWorkScoreLabel(stage?stageScore.score:work.score)} <ArrowUpRight size={14}/></p></a></article>;}
export default function BilllieDesign({content}:{content:CandidateContent}){
 const options=useArtistTimelineHostOptions();
 const [fetched,setFetched]=useState<{data:CatalogView|null;error:string;loading:boolean}>({data:null,error:'',loading:true});
 const state=options.catalog!==undefined?{data:options.catalog,error:options.error??'',loading:options.loading??false}:fetched;
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>options.serverRoute??path);
 const route=useMemo(()=>artistRoute(url),[url]);
 const releaseKey=new URL(url,'https://site.invalid').searchParams.get('release');
 const release=design.releases.find(row=>row.id===releaseKey);
 const baseReturn=artistRouteUrl(route,path);
 const returnTo=baseReturn+(release?(baseReturn.includes('?')?'&':'?')+'release='+encodeURIComponent(release.id):'');
 const rememberScroll=useArtistScroll(!!state.data,url);
 const [lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 useEffect(()=>{if(options.catalog!==undefined)return;const controller=new AbortController();void(async()=>{try{const data=await catalogReadWithDeadline(async signal=>{const response=await fetch('/api/catalog?artist=billlie&shape=display-v1',{cache:'no-store',signal});if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上你的资料库。');const result=await response.json() as CatalogView;if(!Array.isArray(result.groups)||!Array.isArray(result.members)||!Array.isArray(result.works)||!Array.isArray(result.ratings))throw new Error('资料暂时没有加载完整。');return result;},controller.signal);if(!controller.signal.aborted)setFetched({data,error:'',loading:false});}catch(error){if(!controller.signal.aborted)setFetched({data:null,error:error instanceof Error?error.message:'资料暂时无法读取。',loading:false});}})();return()=>controller.abort();},[options.catalog]);
 function navigate(patch:Partial<ReturnType<typeof artistRoute>>,nextRelease:string|null=null,replace=false){rememberScroll();let target=artistRouteUrl({...route,...patch},path);if(nextRelease)target+=(target.includes('?')?'&':'?')+'release='+encodeURIComponent(nextRelease);const nextState=newArtistHistoryState(window.history.state);delete nextState.billlieTimelineOrigin;window.history[replace?'replaceState':'pushState'](nextState,'',target);window.dispatchEvent(new Event('artist-location-change'));if(!replace)document.getElementById('artist-content')?.scrollIntoView({block:'start'});}
 const collection=useMemo(()=>state.data?artistCollection(state.data,content.groupId):null,[state.data,content.groupId]);
 const members=collection?.members??[],works=collection?.works??[];
 const member=members.find(row=>row.id===route.member);
 const orderedMembers=[...members].sort((a,b)=>design.members.findIndex(x=>x.id===a.id)-design.members.findIndex(x=>x.id===b.id));
 const onHome=route.section==='overview'&&!route.member&&!releaseKey;
 const catalog=billlieCatalog(design.releases,works,route.format,route.search,route.queue);
 const compact=route.format==='all'&&!!route.search.trim()&&catalog.total>0&&catalog.releases.length<=1&&catalog.mv.length<=1&&catalog.stage.length<=1;
 const [query,setQuery]=useState(route.search);
 useEffect(()=>setQuery(route.search),[route.search]);
 const portrait=(m:Member)=>design.members.find(row=>row.id===m.id);
 const label=(m:Member)=>portrait(m)?.cn||memberDisplayName(m);
 const releaseTargets=Object.fromEntries(Object.entries(billlieEventReleases).flatMap(([eventId,id])=>{const item=design.releases.find(r=>r.id===id);return item?[[eventId,{id,label:`查看发行 · ${item.title}`}]]:[];}));
 function openTimelineRelease(request:{eventId:string;releaseId:string;returnTo:string},beforeLeave:()=>boolean){
  if(billlieEventReleases[request.eventId]!==request.releaseId||!releaseTargets[request.eventId])return;
  rememberScroll();if(!beforeLeave())return;
  const saved=readTimelineReturnState(window.history.state?.timelineReturn,request.returnTo);if(!saved)return;
  const base=artistRouteUrl({...route,member:null},path);const target=base+(base.includes('?')?'&':'?')+'release='+encodeURIComponent(request.releaseId);
  window.history.pushState({...newArtistHistoryState(window.history.state),billlieTimelineOrigin:saved},'',target);
  window.dispatchEvent(new Event('artist-location-change'));document.getElementById('artist-content')?.scrollIntoView({block:'start'});
 }
 const timelineOrigin=useSyncExternalStore(subscribe,()=>window.history.state?.billlieTimelineOrigin??null,()=>null);
 const releaseReturn=timelineOrigin&&typeof timelineOrigin.path==='string'?readTimelineReturnState(timelineOrigin,timelineOrigin.path):null;
 const canReturnTimeline=releaseReturn?.identity.kind==='release'&&releaseReturn.identity.targetId===release?.id;
 const timeline=<ArtistTimelineHost groupId={content.groupId} catalog={state.data} loading={state.loading} error={state.error} onRetry={options.onRetry} releaseTargets={onHome||route.section==='updates'?releaseTargets:undefined} onRelease={openTimelineRelease}/>;
 function roster(list:Member[]=orderedMembers){return <div className="bf-roster">{list.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><span className="bf-square"><Picture src={portrait(m)?.src} alt={`${label(m)} ${m.stageName}`}/></span><strong className="member-display-name">{label(m)}</strong><small>{m.stageName}</small></button>)}</div>;}
 function releases(list=design.releases){return <div className="bf-release-grid">{list.map(r=><article key={r.id} data-design-release={r.id}><button onClick={()=>navigate({section:'works',member:null},r.id)}><span className="bf-square"><Picture src={r.src} alt={`${r.title} 发行封面`}/></span><h3>{r.title}</h3><p>{r.kind} · {r.date}</p></button></article>)}</div>;}
 function person(m:Member){const p=portrait(m),items=state.data?memberWorks(state.data,m.id):[];return <><section className="bf-section bf-person"><button className="bf-square" aria-label={`放大${label(m)}的照片`} aria-haspopup="dialog" onClick={()=>p&&setLightbox({src:p.originalSrc,label:label(m)})}><Picture src={p?.src} alt={`${label(m)} ${m.stageName}`} priority/></button><div className="bf-person-copy"><h1 className="member-display-name">{label(m)}</h1><h2>{m.stageName}</h2><p>Billlie</p><a className="bf-button bf-primary" href={artistMemberUrl(m.id,returnTo)}>个人记录 <ArrowUpRight size={14}/></a><button className="bf-button" onClick={()=>navigate({section:'works',member:null,format:'mv'})}>浏览团体作品</button>{(m.id===harunaActivity.memberId?harunaActivity.profile:m.profile)&&<p>{m.id===harunaActivity.memberId?harunaActivity.profile:m.profile}</p>}{m.id===harunaActivity.memberId&&<><p>活动安排：{harunaActivity.displayStatus} · 实际恢复日期未确认</p>{harunaActivity.sources.map((href,i)=><External key={href} href={href}>公告来源 {i+1}</External>)}</>}<MemberPhysicalFacts member={m}/></div></section><section className="bf-section bf-panel"><h2 className="bf-heading">成员经历</h2><MemberCareerFacts member={m}/></section>{items.length>0&&<section className="bf-section"><h2 className="bf-heading">关联作品</h2><div className="bf-related">{items.map(item=><a key={item.work.id} data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work,false,returnTo)}><h3>{item.work.song||item.work.name}</h3><p>表现 {artistWorkScoreLabel(item.performance)} · 造型 {artistWorkScoreLabel(item.styling)}</p></a>)}</div></section>}{(billlieExternalVideo.memberIds as readonly string[]).includes(m.id)&&<section className="bf-section bf-panel" data-external-video={billlieExternalVideo.videoId}><h2 className="bf-heading">官方外部影像</h2><h3>{billlieExternalVideo.title}</h3><p>{billlieExternalVideo.sourceLabel}。仅外部参考，未纳入评分作品，也不推定舞台参演。</p><External href={billlieExternalVideo.url}>观看官方 MV</External></section>}<section className="bf-section"><h2 className="bf-heading">其他成员</h2>{roster(orderedMembers.filter(row=>row.id!==m.id))}<button className="bf-button bf-bottom" onClick={()=>navigate({section:'members',member:null})}>返回成员目录</button></section></>;}
 const latest=design.releases[0];
 return <ImageRecoveryProvider><div className="billlie-figma"><header className="bf-header"><button className="bf-logo" onClick={()=>navigate({section:'overview',member:null,format:'all'})}>Billlie</button><nav aria-label="Billlie 导航">{tabs.map(([key,text])=><button key={key} aria-current={route.section===key?'page':undefined} onClick={()=>navigate({section:key,member:null,format:'all'})}>{text}</button>)}</nav></header><main id="artist-content" className="bf-main">{state.loading?<div className="bf-section" role="status">正在打开 Billlie 档案…</div>:state.error?<div className="bf-section" role="alert"><p>{state.error}</p><button className="bf-button" onClick={()=>options.onRetry?options.onRetry():window.location.reload()}>重新加载</button></div>:!collection?<p className="bf-section">暂未找到团体资料。</p>:route.member?member?person(member):<p className="bf-section">这个成员不在本团档案中。<button onClick={()=>navigate({section:'members',member:null})}>查看成员</button></p>:releaseKey?release?<><section className="bf-section bf-release-detail"><button className="bf-square" aria-label={`放大 ${release.title} 封面`} aria-haspopup="dialog" onClick={()=>setLightbox({src:release.src,label:release.title})}><Picture src={release.src} alt={release.title} priority/></button><div><p>{release.kind} · {release.date}</p><h1>{release.title}</h1>{release.artistCredit&&release.artistCredit!=='See official title'&&<p>{release.artistCredit}</p>}{release.tracks!==null&&<p>{release.tracks}首歌曲</p>}<External href={release.source}>在音乐平台查看</External><button className="bf-button" onClick={()=>canReturnTimeline?window.history.back():navigate({section:'works',member:null})}>{canReturnTimeline?'返回时间轴原事件':'返回作品库'}</button></div></section><section className="bf-section bf-panel"><h2 className="bf-heading">其他发行</h2>{releases(design.releases.filter(row=>row.id!==release.id).slice(0,3))}</section></>:<div className="bf-section">未找到这张发行。<button className="bf-button" onClick={()=>navigate({section:'works',member:null})}>返回作品库</button></div>:<>{onHome&&<>
<section className="bf-section bf-hero"><div><h1>BILLLIE</h1><p>{latest.kind} · {latest.date}</p><h2>{latest.title}</h2><button className="bf-button bf-primary" onClick={()=>navigate({section:'works',member:null,format:'all'},latest.id)}>查看发行</button></div><button className="bf-square" onClick={()=>navigate({section:'works',member:null,format:'all'},latest.id)}><Picture src={latest.src} alt={latest.title} priority/></button></section>
<ArtistInformation slug="billlie"/>
<section className="bf-section bf-crimson"><Title en="Members">成员</Title>{roster()}<button className="bf-button bf-bottom" onClick={()=>navigate({section:'members',member:null})}>成员与经历</button></section>
<section className="bf-section"><Title en="Releases">音乐发行</Title>{releases(design.releases.slice(0,3))}<button className="bf-button bf-bottom" onClick={()=>navigate({section:'works',member:null,format:'all'})}>全部作品</button></section>
<section className="bf-section bf-panel"><Title en="In motion">音乐影像</Title><div className="bf-video-grid">{design.works.slice(0,2).flatMap(entry=>{const work=works.find(w=>w.id===entry.id);return work?[<WorkCard key={work.id} work={work} returnTo={returnTo}/>]:[];})}</div></section>
<section className="bf-section"><Title en="Timeline">大事时间轴</Title>{timeline}</section>
</>}{route.section==='members'&&<><section className="bf-section"><Title en="Members">成员</Title></section><section className="bf-section bf-crimson">{roster()}</section><section className="bf-section"><h2 className="bf-heading">成员经历</h2>{timeline}</section></>}{(route.section==='works'||route.section==='records')&&<section className="bf-section bf-catalog"><Title en="Works">作品</Title><div className="bf-tabs">{[['all','全部'],['release','发行'],['mv','MV'],['stage','舞台']].map(([format,text])=><button key={format} aria-pressed={route.format===format} onClick={()=>navigate({section:'works',member:null,format})}>{text}</button>)}</div>
 <form className="bf-search" role="search" onSubmit={event=>{event.preventDefault();navigate({search:query.slice(0,200)});}}><label htmlFor="billlie-query">搜索作品</label><div><input id="billlie-query" type="search" maxLength={200} placeholder="作品名" value={query} onChange={event=>setQuery(event.target.value)}/><button className="bf-button bf-primary" type="submit">搜索</button></div></form>
 <p className="bf-count" role="status" aria-live="polite">{catalog.total} 项作品{route.search&&<> · “{route.search}” <button className="bf-clear" onClick={()=>navigate({search:''})}>清空搜索</button></>}</p>
 {route.format!=='release'&&<div className="bf-queue-tools"><div className="bf-queues" aria-label="影像记录筛选">{queues.map(([queue,text])=><button key={queue} aria-pressed={queue===route.queue} onClick={()=>navigate({queue})}>{text}</button>)}</div>{route.queue!=='all'&&<p className="bf-queue-note">按作品的真实观看与评分记录筛选影像{route.format==='all'?'；发行不参与队列筛选':''}。</p>}</div>}
 {catalog.total===0?<div className="bf-empty"><h3>没有找到符合条件的作品</h3><p>试试更短的作品名，或查看全部作品。</p><button className="bf-button bf-primary" onClick={()=>navigate({search:'',queue:'all',format:'all'})}>查看全部作品</button></div>:<div className={`bf-catalog-groups${compact?' bf-compact-results':''}`}>
 {catalog.releases.length>0&&<section className="bf-catalog-group bf-catalog-releases">{route.format==='all'&&<h3>发行</h3>}{releases(catalog.releases)}</section>}
 {catalog.mv.length>0&&<section className="bf-catalog-group bf-catalog-mv">{route.format==='all'&&<h3>音乐影像 · MV</h3>}<div className="bf-video-grid">{catalog.mv.map(work=><WorkCard key={work.id} work={work} returnTo={returnTo}/>)}</div></section>}
 {catalog.stage.length>0&&<section className="bf-catalog-group bf-catalog-stage">{route.format==='all'&&<h3>舞台与现场</h3>}<div className="bf-video-grid">{catalog.stage.map(work=><WorkCard key={work.id} work={work} stage returnTo={returnTo}/>)}</div></section>}
 </div>}</section>}{route.section==='updates'&&<section className="bf-section"><Title en="Timeline">大事时间轴</Title>{timeline}</section>}</>}</main><footer className="bf-footer"><strong>Billlie</strong><a href="/?view=groups">成员 / 作品 / 时间轴 · 返回团体索引</a></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
