'use client';
import {PhotoSourceDisclosure} from '@/components/photo-source-disclosure';
import {MemberWorkIdentityPhoto} from '@/components/member-work-identity-photo';
import {ArtistStageDirectoryCard} from '@/components/artist-stage-directory-card';
import {LibraryFilm} from './library-film';
import {ArtistWorkPreview} from '@/components/app-image-presentation';
import {publicVideoCover} from '@/lib/idol/mv-public-media';
import {ArtistInformation,ArtistHomeTimeline} from '@/components/artist-information';

import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {OriginalPhotoLink} from '@/components/original-photo-link';
import {ReliableImage,ImageRecoveryControls,ImageRecoveryProvider} from '@/components/reliable-image';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {artistCollection,artistMemberUrl,artistRoute,artistWorkRows,artistWorkUrl,artistWorkScoreLabel,type ArtistSection} from '@/lib/idol/artist-preview';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import {artistCatalogHeaders, catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {triplesRoster} from '@/lib/idol/triples-identity';
import {triplesChineseLabel} from '@/lib/idol/triples-design-catalog';
import {videoId} from '@/lib/idol/values';
import {artistMvWorkId} from '@/lib/idol/artist-mv-link';
import {safeGroupLink} from '@/lib/idol/group-detail';
import type {CatalogView,Member,Work} from '@/lib/idol/types';
import {sevenDesigns,type SevenSlug,type Film,type Release} from './catalog';
import direction from './art-direction.json';
import starshipProfile from '@/data/ive-love-dive-archive.json';
import {IvePeriod,IvePeriodLinks,ivePeriodFor} from './ive-periods';

type Direction={hero?:string;heroOriginal?:string;heroSourceUrl?:string;memberOrder?:string[];logo?:string;secondary?:string;portraits?:Record<string,{image:string;original?:string;label:string;sourceUrl:string}>};
const libraryTitles: Partial<Record<SevenSlug,string>> = {
 rescene:'DISCOGRAPHY',madein:'VIDEO',triples:'Movie',qwer:'Music',purplekiss:'Films',illit:'Video',
};
const nav:[ArtistSection,string,string][]=[['overview','HOME','首页'],['members','PROFILE','成员'],['works','DISCOGRAPHY','作品'],['updates','HISTORY','时间轴']];
const subscribe=(fn:()=>void)=>{window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};};
const emptyMembers: Member[] = [];
const normalize=(s:string)=>s.toLocaleLowerCase().replace(/\s/g,'');
function Picture({src,alt,priority=false}:{src?:string|null;alt:string;priority?:boolean}){return <ReliableImage src={src} identityKey={src??alt} alt={alt} priority={priority} referrerPolicy="no-referrer" missing={<span className="sr-missing">{alt} · 暂无照片</span>} errorFallback={<span className="sr-missing">{alt} · 图片未加载，请重试</span>}/>;}
function External({href,children}:{href?:string|null;children:React.ReactNode}){const safe=safeGroupLink(href??undefined);return safe?<a href={safe} target="_blank" rel="noopener noreferrer">{children} ↗</a>:null;}

/** New 2026-10-25 presentation. Stable catalog, navigation and permission APIs
 * remain shared; none of the seven rejected page compositions are rendered. */
export default function SevenArtist({slug,initialHome=false}:{slug:SevenSlug;initialHome?:boolean}){
 const config=sevenDesigns[slug],art=(direction as Record<string,Direction>)[slug]??{},path='/artists/'+slug;
 const host=useArtistTimelineHostOptions();
 const [fetched,setFetched]=useState<CatalogView|null>(null),[busy,setBusy]=useState(true),[failure,setFailure]=useState('');
 const [menuUrl,setMenuUrl]=useState<string|null>(null),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null),[statusFilter,setStatusFilter]=useState('全部');
 const abort=useRef<AbortController|null>(null);
 const data=host.catalog!==undefined?host.catalog:fetched,loading=host.loading??(host.catalog!==undefined?false:busy),error=host.error??failure;
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>host.serverRoute??path),route=useMemo(()=>artistRoute(url),[url]);
 const menu=menuUrl===url;
 if(menuUrl!==null&&!menu)setMenuUrl(null);
 const params=new URL(url,'https://site.invalid').searchParams;
 const release=config.releases.find(r=>r.id===params.get('release')),film=config.films.find(f=>f.id===params.get('media'));
 const currentPath=path+(params.size?'?'+params:'');
 const returnTo=safeArtistReturn(currentPath)??path+'?section='+route.section;
 const rememberScroll=useArtistScroll(route.section!=='works'||!!data,url);
 const collection=useMemo(()=>data?artistCollection(data,config.groupId):null,[data,config.groupId]);
 const works=collection?.works??[],members=collection?.members??emptyMembers;
 const sRoster=useMemo(()=>slug==='triples'?triplesRoster(members):[],[slug,members]);
 const sNumber=(m:Member)=>sRoster.find(r=>r.member.id===m.id)?.identity?.sNumber;
 const memberRanks=new Map(art.memberOrder?.map((id,i)=>[id,i]));
 const ordered=art.memberOrder
  ? [...members].sort((a,b)=>(memberRanks.get(a.id)??memberRanks.size)-(memberRanks.get(b.id)??memberRanks.size))
  : slug==='triples'?[...members].sort((a,b)=>(sNumber(a)??99)-(sNumber(b)??99)):members;
 const member=members.find(m=>m.id===route.member);
 const home=route.section==='overview'&&!route.member&&!release&&!film;
 const earlyHero=(initialHome||slug==='ive')&&home&&!params.has('release')&&!params.has('media');
 const {catalog:hostCatalog,onRetry:retryCatalog}=host;
 const load=useCallback(async()=>{if(hostCatalog!==undefined){retryCatalog?.();return;}abort.current?.abort();const controller=new AbortController();abort.current=controller;setBusy(true);setFailure('');try{const result=await catalogReadWithDeadline(async signal=>{const response=await fetch(`/api/catalog?artist=${slug}&shape=display-v1`,{headers:artistCatalogHeaders,signal,cache:'no-store'});if(!response.ok)throw Error('资料库暂未连接，请重试。');const result=await response.json() as CatalogView;if(!Array.isArray(result.members)||!Array.isArray(result.works)||!Array.isArray(result.groups))throw Error('资料未加载完整。');return result;},controller.signal);if(!controller.signal.aborted)setFetched(result);}catch(e){if(!controller.signal.aborted)setFailure((e as Error).message);}finally{if(!controller.signal.aborted)setBusy(false);}},[hostCatalog,retryCatalog,slug]);
 useEffect(()=>{
  let active=true;
  if(hostCatalog===undefined)void Promise.resolve().then(()=>{if(active)void load();});
  return()=>{active=false;abort.current?.abort();};
 },[load,hostCatalog]);
 function go(section:ArtistSection,extra:Record<string,string>={},replace=false){if(lightbox)return;rememberScroll();const p=new URLSearchParams();if(section!=='overview')p.set('section',section);Object.entries(extra).forEach(([k,v])=>{if(v&&v!=='all')p.set(k,v);});const next=path+(p.size?'?'+p:'');const history=replace?{...window.history.state}:newArtistHistoryState(window.history.state);if(extra.member&&!route.member)history.sevenOrigin={path:currentPath,y:window.scrollY,member:extra.member,action:window.history.state?.artistRosterFocus?.action};window.history[replace?'replaceState':'pushState'](history,'',next);window.dispatchEvent(new Event('artist-location-change'));if(!replace)window.scrollTo({top:0,behavior:'instant'});}
 function openRosterMember(memberId:string, action:'portrait'|'profile'|'index') {
  const origin={path:currentPath,key:memberId,action};
  window.history.replaceState({...window.history.state,artistRosterFocus:origin},'',window.location.href);
  go('members',{member:memberId});
 }
 function backMembers(){
  const origin=window.history.state?.sevenOrigin;
  const safe=origin&&safeArtistReturn(origin.path);
  if(!safe||new URL(safe,location.origin).pathname!==path||new URL(safe,location.origin).searchParams.has('member')){
   go('members');
   return;
  }
  const y=Math.max(0,Number(origin.y)||0);
  const saved={path:safe,key:origin.member,action:origin.action};
  window.history.pushState({...newArtistHistoryState(window.history.state),artistRosterFocus:saved,artistScroll:{path:safe,y}},'',safe);
  window.dispatchEvent(new Event('artist-location-change'));
 }
 function query(value:string){go(route.section,{q:value,...(route.queue!=='all'?{queue:route.queue}:{}),...(route.format!=='all'?{format:route.format}:{})},true);}
 function portrait(m:Member){const named=art.portraits?.[m.id]??art.portraits?.[m.stageName];if(named)return {image:named.image,credit:named.label,sourceUrl:named.sourceUrl};const visual=config.memberVisuals?.[m.stageName];if(visual)return {image:visual.image,credit:visual.label,sourceUrl:visual.sourceUrl};return candidatePortrait(m,config.portraits);}
 const name=(m:Member)=>slug==='triples'?triplesChineseLabel(m):memberDisplayName(m);
 function original(src:string){
  if(src===art.hero&&art.heroOriginal)return art.heroOriginal;
  const named=Object.values(art.portraits??{}).find(p=>p.image===src&&p.original);
  if(named?.original)return named.original;
  return src.includes('/batch-b-20261016-webp-v1/')?src.replace('/batch-b-20261016-webp-v1/','/batch-b-20261016/').replace('-display.webp','-original.jpg'):src;}
 const enlarge=(src:string,label:string)=>setLightbox({src:original(src),label});
 function heading(en:string,cn:string){return <div className="sr-heading"><h2>{en}</h2><span>{cn}</span></div>;}
 function roster(full=false){const shown=ordered.filter(m=>(statusFilter==='全部'||m.status===statusFilter)&&(!full||normalize([name(m),m.stageName,sNumber(m)?'S'+sNumber(m):''].join(' ')).includes(normalize(route.search))));return <section className={'sr-members sr-section '+(full?'sr-members-full':'')}>
  {heading(slug==='qwer'?'THE BAND':'PROFILE','成员档案')}{full&&<div className="sr-tools"><label>搜索成员<input type="search" aria-label="搜索成员" placeholder={slug==='triples'?'姓名或 S 编号':'中文名或艺名'} value={route.search} onChange={e=>query(e.target.value)}/></label><label>活动状态<select aria-label="筛选成员状态" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>{['全部',...new Set(members.map(m=>m.status).filter(Boolean))].map(s=><option key={s}>{s}</option>)}</select></label></div>}
  <div className="sr-portraits">{shown.map((m,i)=>{const p=portrait(m);return <article key={m.id} className="sr-person"><button className="sr-portrait" data-artist-member-trigger={m.id} data-artist-roster-action="portrait" aria-label={'查看'+name(m)+'个人页'} onClick={()=>openRosterMember(m.id,'portrait')}><Picture src={p?.image} alt={name(m)+' · '+(p?.credit??'档案照片')}/>{slug!=='ive'&&<span className="sr-person-index">{slug==='triples'&&sNumber(m)?'S'+sNumber(m):String(i+1).padStart(2,'0')}</span>}</button><div className="sr-person-name"><h3>{m.stageName||name(m)}</h3><p>{name(m)}</p></div><small>{m.status||'活动情况见档案'}</small>{full&&<div className="sr-row-links"><button data-artist-member-trigger={m.id} data-artist-roster-action="profile" aria-label={'查看'+name(m)+'个人页详情'} onClick={()=>openRosterMember(m.id,'profile')}>个人页 →</button>{p&&<button onClick={()=>enlarge(p.image,name(m))}>原图 ↗</button>}</div>}</article>;})}</div>
  {!shown.length&&<p role="status">没有符合条件的成员。<button onClick={()=>{setStatusFilter('全部');query('');}}>清除筛选</button></p>}{full&&<p className="sr-note">{config.rosterNote}</p>}{!full&&<button className="sr-more" onClick={()=>go('members')}>全部成员 / VIEW PROFILE <span>↗</span></button>}
 </section>;}
 function workCard(w:Work,stage=false){const id=videoId(w.url);return <article className="sr-work" key={w.id+(stage?'stage':'mv')} data-work-id={w.id}><a className="sr-film-art" href={artistWorkUrl(w,stage,returnTo)}>{stage?<ArtistWorkPreview work={w} stage/>:id?<Picture src={(publicVideoCover(id)?.src??`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)} alt={(w.song||w.name)+'MV'}/>:<span>{w.song||w.name}</span>}<span className="sr-play">↗</span></a><div className="sr-work-copy"><small>{stage?'STAGE':'MUSIC VIDEO'} · {w.releaseDate}</small><h3><a href={artistWorkUrl(w,stage,returnTo)}>{w.song||w.name}</a></h3><p>{stage?w.stage?.title:w.version||w.videoType}</p><div className="sr-row-links"><a href={artistWorkUrl(w,stage,returnTo)}>观看与记录 →</a><span>{artistWorkScoreLabel(stage?w.stageScore:w.score)}</span></div>{!stage&&!!(w.stage||w.stageSupplement?.alternatives.length)&&<a className="sr-stage-link" href={artistWorkUrl(w,true,returnTo)}>舞台与其他现场 ↗</a>}</div></article>;}
 function exactFilm(f:Film){const id=videoId(f.sourceUrl);if(!id)return undefined;const matches=works.filter(w=>videoId(f.kind==='stage'?w.stage?.url??'':w.url)===id);return matches.length===1?matches[0]:undefined;}
 function filmCard(f:Film){const w=exactFilm(f);return <article className="sr-work" key={f.id}><button className="sr-film-art" aria-label={'查看'+f.title} onClick={()=>w?location.assign(artistWorkUrl(w,f.kind==='stage',returnTo)):go('works',{media:f.id,...(['triples','purplekiss','rescene'].includes(slug)?{format:f.kind}: {})})}><Picture src={f.image} alt={f.title}/><span className="sr-play">↗</span></button><div className="sr-work-copy"><small>{f.kind.toUpperCase()} · {f.date}</small><h3>{f.title}</h3><button onClick={()=>w?location.assign(artistWorkUrl(w,f.kind==='stage',returnTo)):go('works',{media:f.id,...(['triples','purplekiss','rescene'].includes(slug)?{format:f.kind}: {})})}>{w?'观看与记录':'影像详情'} →</button></div></article>;}
 function releaseCard(r:Release){return <article className="sr-release" key={r.id}><button className="sr-cover" onClick={()=>go('works',{release:r.id})} aria-label={'查看'+r.title+'发行详情'}>{r.image?<Picture src={r.image} alt={r.title+'封面'}/>:<span className="sr-text-cover">{r.title}<small>发行档案</small></span>}</button><small>{r.date} · {r.type||'RELEASE'}</small><h3><button onClick={()=>go('works',{release:r.id})}>{r.title} ↗</button></h3></article>;}
 function releases(home=false){const rows=config.releases.filter(r=>home||normalize(r.title).includes(normalize(route.search)));return rows.length?<section className="sr-section sr-releases">{heading('DISCOGRAPHY','发行目录')}<div className="sr-release-grid">{(home?rows.slice(0,3):rows).map(releaseCard)}</div>{home&&<button className="sr-more" onClick={()=>go('works')}>全部发行 / VIEW ALL <span>↗</span></button>}</section>:null;}
 function library() {
  const title=libraryTitles[slug], stage=route.format==='stage';
  const rows=artistWorkRows(works,route.queue,route.search).filter(w=>!stage||w.stage||w.stageSupplement?.alternatives.length);
  const films=route.queue==='all'?config.films.filter(f=>!exactFilm(f)&&(route.format==='all'||route.format===f.kind)&&normalize(f.title).includes(normalize(route.search))):[];
  const albums=route.format==='all'&&route.queue==='all'?releases():null;
  const tools=<div className="sr-tools" role="group" aria-label="筛选作品">
   <label>搜索作品<input type="search" aria-label="搜索本团作品" placeholder="歌曲或版本" value={route.search} onChange={e=>query(e.target.value)}/></label>
   <label>观看记录<select aria-label="筛选观看记录" value={route.queue} onChange={e=>go('works',{q:route.search,queue:e.target.value,format:route.format})}>
    {[['all','全部'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']].map(([k,v])=><option key={k} value={k}>{v}</option>)}
   </select></label>
   <label>内容<select aria-label="筛选影像类型" value={route.format} onChange={e=>go('works',{q:route.search,queue:route.queue,format:e.target.value})}>
    {[['all','全部'],['mv','MV'],['stage','舞台']].map(([k,v])=><option key={k} value={k}>{v}</option>)}
   </select></label>
  </div>;
  const jump=<div className="sr-row-links"><a href="#sr-videos">影像 ↓</a>{albums&&<a href="#sr-releases">发行 ↓</a>}<button onClick={()=>go('records')}>我的记录 →</button></div>;
  const catalogCards=rows.map(w=>!title?workCard(w,stage):stage
   ?<ArtistStageDirectoryCard key={w.id} work={w} returnTo={returnTo} className="sr-work"/>
   :<LibraryFilm key={w.id} work={w} returnTo={returnTo} remember={rememberScroll}/>);
  return <div className={title?'sr-film-library':undefined}>
   {title?<header className="sr-catalog-header">
    <div className="sr-catalog-heading"><h1>{title}</h1>{jump}</div>{tools}
   </header>:<section className="sr-section sr-library-tools">{heading('MUSIC','MV · 舞台 · 发行')}{tools}{jump}</section>}
   <section id="sr-videos" className="sr-section" aria-label={stage?'舞台':'MV'}>
    {!title&&heading(stage?'ON STAGE':'VIDEOS','已收录影像')}
    <div className="sr-work-grid">{catalogCards}</div>
    {!rows.length&&!films.length&&<p role="status">{stage?'没有符合条件的舞台。':'没有符合条件的影像。'} <button onClick={()=>go('works')}>清除筛选</button></p>}
   </section>
   {!!films.length&&<section className="sr-section">{heading('MORE FILMS','更多官方影像')}<div className="sr-work-grid">{films.map(filmCard)}</div></section>}
   <div id="sr-releases">{slug==='ive'&&<IvePeriodLinks/>}{albums}</div>
  </div>;
 }
 function memberPage(m:Member){const p=portrait(m),items=data?memberWorks(data,m.id):[],summary=memberWorkSummary(items);return <article className="sr-member-detail sr-section" data-member-layout="ordered-v1" data-member-id={m.id}><button className="sr-back" onClick={backMembers}>{slug==='ive'&&typeof window!=='undefined'&&window.history.state?.sevenOrigin?.path?.includes('&release=')?'← 返回发行时期':'← 返回成员目录'}</button><div className="sr-profile-layout" data-member-module="identity"><div className="sr-profile-image"><button onClick={()=>p&&enlarge(p.image,name(m))} disabled={!p}><Picture src={p?.image} alt={name(m)} priority/></button><p>{p?.credit}</p>{p&&<div className="sr-row-links"><button onClick={()=>enlarge(p.image,name(m))}>查看完整原图 ↗</button></div>}</div><div className="sr-biography" data-member-module="basic"><small>{slug==='triples'&&sNumber(m)?'S'+sNumber(m):config.name} / PROFILE</small><h1>{m.stageName||name(m)}</h1><h2>{name(m)}</h2><p>{[m.role,m.status].filter(Boolean).join(' · ')}</p><MemberCareerFacts member={m} part="intro"/><MemberPhysicalFacts member={m}/><a className="sr-cta" href={artistMemberUrl(m.id,returnTo)}>个人作品与评分 ↗</a></div></div><section className="sr-member-works" data-member-module="works">{heading('ON RECORD','已关联作品')}<p className="sr-note">{summary.ratedWorks} 支已评 · 表现 {artistWorkScoreLabel(summary.performanceMean)} · 造型 {artistWorkScoreLabel(summary.stylingMean)}</p><div className="sr-work-grid">{items.map(item=><article className="sr-work" key={item.work.id}><MemberWorkIdentityPhoto work={item.work} memberId={m.id} label={name(m)+' · '+item.work.song} photo={item.photo} live={data?.mode==='live'} className="sr-look" onOpen={({src,label})=>enlarge(src,label)}/><MvPhotoReference photo={item.photo} referencePhoto={item.referencePhoto} label={name(m)+' · '+item.work.song} live={data?.mode==='live'}/><div className="sr-work-copy"><h3><a data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work,false,returnTo)}>{item.work.song||item.work.name} ↗</a></h3><p>表现 {artistWorkScoreLabel(item.performance)} · 造型 {artistWorkScoreLabel(item.styling)}</p></div></article>)}</div>{!items.length&&<p>暂无个人作品记录。</p>}</section>{data&&<MemberPublicCredits memberId={m.id} data={data} onWork={id=>{const work=works.find(w=>w.id===id);if(work)location.assign(artistWorkUrl(work,false,returnTo));}}/>}<MemberCareerFacts member={m} part="history"/><MemberCareerFacts member={m} part="sources"/>{p&&<section className="member-profile-sources" data-member-module="sources"><External href={p.sourceUrl}>图片来源</External></section>}<div className="sr-member-next">{[-1,1].map(step=>{const other=ordered[(ordered.indexOf(m)+step+ordered.length)%ordered.length];return other&&<button key={step} onClick={()=>go('members',{member:other.id})}>{step<0?'← 上一位':'下一位 →'}<span>{other.stageName}</span></button>;})}</div></article>;}
 function releasePage(r:Release){
  const period=slug==='ive'&&ivePeriodFor(r.id);
  if(period)return <IvePeriod period={period} release={r} works={works} members={members} enlarge={enlarge} openMember={id=>openRosterMember(id,'profile')}/>;
  const linked=works.filter(w=>r.workIds?.includes(w.id));return <article className="sr-release-detail sr-section"><button className="sr-back" onClick={()=>go('works')}>← 返回发行目录</button><div className="sr-release-layout"><button className="sr-cover" disabled={!r.image} onClick={()=>enlarge(r.image,r.title)}>{r.image?<Picture src={r.image} alt={r.title+'封面'} priority/>:<span className="sr-text-cover">{r.title}</span>}</button><div><small>{config.name} / {r.type||'RELEASE'}</small><h1>{r.title}</h1><p>{r.date}</p><External href={r.sourceUrl}>官方发行资料</External>{r.sales&&<p className="sr-note">已公开实体销量 {r.sales.copies?.toLocaleString()??'待补'} · 截至 {r.sales.asOf}<br/>{r.sales.coverageLabel??(r.sales.cumulativeComplete===true?'完整累计':'统计覆盖不完整，不代表完整累计')}</p>}{!!r.tracks?.length&&<><h2>TRACKLIST</h2><ol className="sr-tracklist">{r.tracks.map((t,i)=><li key={i}>{t}</li>)}</ol></>}</div></div><div className="sr-work-grid">{linked.map(w=>workCard(w))}{config.films.filter(f=>f.releaseId===r.id).map(filmCard)}</div></article>;}
 function filmPage(f:Film){return <article className="sr-section sr-film-detail"><button className="sr-back" onClick={()=>go('works')}>← 返回影像目录</button><small>{f.kind.toUpperCase()} · {f.date}</small><h1>{f.title}</h1><button className="sr-film-art" onClick={()=>enlarge(f.image,f.title)}><Picture src={f.image} alt={f.title} priority/></button><External href={f.sourceUrl}>观看官方影像</External>{f.releaseId&&config.releases.some(r=>r.id===f.releaseId)&&<button className="sr-cta" onClick={()=>go('works',{release:f.releaseId!})}>相关发行 →</button>}</article>;}
 function hero(){const src=art.hero??config.hero,image=<OriginalPhotoLink className="sr-hero-photo" href={original(src)} onOpen={src=>setLightbox({src,label:config.heroCaption})} aria-label={'放大'+config.name+'团体照'}><Picture src={src} alt={config.heroCaption} priority/></OriginalPhotoLink>;const actions=<div className="sr-hero-actions">{(['works','members'] as const).map(section=>
   <a key={section} href={path+'?section='+section} onClick={event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();go(section);
   }}>{section==='works'?'探索作品 ↗':'成员档案 ↗'}</a>)}</div>;
  if(slug==='madein'){
   const single=works.find(w=>videoId(w.url)==='yE6yETkVI3Q');
   return <section className="sr-hero sr-madein-hero">
    <OriginalPhotoLink className="sr-hero-photo" href={original(src)} aria-label="放大 MADEIN 团体照"
      onOpen={desktop=>setLightbox({src:window.matchMedia('(max-width: 700px)').matches?'/artist/madein/redesign-20261025/hero-mobile.jpg':desktop,label:config.heroCaption})}>
     <picture><source media="(max-width: 700px)" srcSet="/artist/madein/redesign-20261025/hero-mobile.jpg"/><Picture src={src} alt={config.heroCaption} priority/></picture>
    </OriginalPhotoLink>
    <div className="madein-single"><h1>Super Obvious</h1>{single
     ?<a href={artistWorkUrl(single,false,returnTo)} onClick={rememberScroll}><span aria-hidden="true">▶</span> 观看 MV</a>
     :<button onClick={()=>go('works')}>作品目录 ↗</button>}</div>
   </section>;
  }
  if(slug==='qwer')return <section className="sr-hero sr-qwer-hero">{image}<div className="sr-band-strip"><h1>QWER</h1><p>CHODAN / MAGENTA / HINA / SIYEON</p>{actions}</div></section>;
  if(slug==='purplekiss')return <section className="sr-hero sr-purple-hero"><div className="sr-purple-title"><span>THE 2ND MINI ALBUM</span><h1>HIDE <i>&</i> SEEK</h1><p>PURPLE KISS / ZOMBIE</p></div><div className="sr-purple-scene">{image}<div className="sr-purple-poster"><Picture src="/artist/purplekiss/redesign-20261025/hide-seek-cover-art.jpg" alt="HIDE & SEEK 官方紫色滴落字标与荧光绿唇形宣传海报"/></div></div><div className="sr-purple-bottom"><p>2021.09.08 · 七人时期</p>{actions}</div></section>;
  if(slug==='ive'){
   const sleeve=config.releases.find(r=>r.id==='ive-release-love-dive');
   const mv=config.films.find(f=>f.id==='ive-mv-love-dive');
   const recording=mv&&ivePeriodFor(sleeve?.id??'')?.videos.find(item=>item.video===videoId(mv.sourceUrl));
   const workId=mv&&(data?artistMvWorkId(data,config.groupId,mv.sourceUrl):recording?.id);
   const mvHref=mv&&(workId?artistWorkUrl({id:workId},false,returnTo):path+'?section=works&media='+mv.id);
   return <section className="sr-hero ive-artist-opening">
    <div className="ive-artist-name">
     <Picture src={art.logo??config.logo} alt="" priority/>
     <div><h1>IVE</h1><p lang="ko">아이브</p></div>
     <nav aria-label="IVE 音乐与成员">
      {mvHref&&<a className="ive-dive-mv" href={mvHref} onClick={rememberScroll}>LOVE DIVE · 观看 MV ↗</a>}
      <button onClick={()=>go('members')}>成员档案 →</button>
     </nav>
    </div>
    <figure className="ive-official-portrait">
     <OriginalPhotoLink className="ive-archive-photo" href={starshipProfile.original}
      onOpen={src=>setLightbox({src,label:starshipProfile.caption})} aria-label="查看 IVE 六人团照原图">
      <Picture src={starshipProfile.image} alt={starshipProfile.caption} priority/>
     </OriginalPhotoLink>
     <figcaption><External href={starshipProfile.sourceUrl}>STARSHIP · 2022.04.14</External>
      <OriginalPhotoLink href={original(src)} onOpen={url=>setLightbox({src:url,label:config.heroCaption})}>学院造型原图 ↗</OriginalPhotoLink>
     </figcaption>
    </figure>
   </section>;
  }
  if(slug==='triples')return <section className="sr-hero sr-triples-hero" aria-label="tripleS">
   <h1 className="sr-accessible-title">tripleS</h1>{image}
   <nav className="triples-number-index" aria-label="按 S 编号打开成员档案">
    <h2>PROFILE</h2><div>{ordered.map(m=>{const n=sNumber(m);return n?<button key={m.id}
     data-artist-member-trigger={m.id} data-artist-roster-action="index"
     aria-label={'S'+n+' '+m.stageName+' 个人页'} onClick={()=>openRosterMember(m.id,'index')}>S{n}</button>:null;})}</div>
   </nav></section>;
  if(slug==='rescene')return <section className="sr-hero sr-rescene-hero">
   {image}<div className="rescene-plate"><h1>RESCENE</h1>
    <nav aria-label="RESCENE 成员档案">{ordered.map(m=><button key={m.id}
     data-artist-member-trigger={m.id} data-artist-roster-action="index" aria-label={'查看 '+m.stageName+' 个人页'}
     onClick={()=>openRosterMember(m.id,'index')}>{m.stageName}</button>)}</nav>
   </div></section>;
  return <section className="sr-hero sr-illit-hero"><div className="sr-illit-title"><span aria-hidden="true">✧</span><h1>SUPER<br/>REAL ME</h1><span aria-hidden="true">✧</span></div><div className="sr-illit-window"><div className="sr-window-title">ILLIT / REAL ME <span>♡　✧　×</span></div>{image}</div><div className="sr-illit-bottom"><p>1ST MINI ALBUM<br/>2024.03.25</p>{actions}</div></section>;
 }
 function overview(){const preferred:Partial<Record<SevenSlug,string[]>>={madein:['Super Obvious','SATURN','LOVE, AFRAID'],purplekiss:['Zombie'],ive:['LOVE DIVE','After LIKE','I AM'],illit:['Magnetic','Lucky Girl Syndrome']};const matches=(preferred[slug]??[]).flatMap(title=>{const w=works.find(w=>normalize(w.song||w.name)===normalize(title));return w?[w]:[];});const featured=[...matches,...works.filter(w=>!matches.includes(w))];const music=<section className="sr-section sr-featured">{heading(slug==='qwer'?'SOUND ON':'VIDEO','精选影像')}<div className="sr-work-grid">{featured.slice(0,slug==='qwer'?2:3).map(w=>workCard(w))}</div><button className="sr-more" onClick={()=>go('works')}>全部作品 / VIEW ALL <span>↗</span></button></section>;return <>{!earlyHero&&slug!=='ive'&&hero()}{slug==='rescene' ? (
  <div className="sr-hero-credit sr-rescene-photo-credit">
    <PhotoSourceDisclosure>
      <p>THE MUZE 官方团体宣传照。拍摄日期未注明。</p>
      <External href={art.heroSourceUrl ?? config.reference}>THE MUZE 艺人资料</External>
    </PhotoSourceDisclosure>
  </div>
) : slug!=='ive'&&<p className="sr-hero-credit">{config.heroCaption} · <External href={art.heroSourceUrl??config.reference}>{art.heroSourceUrl?'照片出处':'官方参考'}</External></p>}{slug==='ive'?<>{roster()}<ArtistInformation slug={slug} catalog={data}/></>:<><ArtistInformation slug={slug} catalog={data}/>{roster()}</>}{music}{slug==='ive'&&<IvePeriodLinks/>}{releases(true)}<ArtistHomeTimeline slug={slug} catalog={data}/><section className="sr-history-door"><button onClick={()=>go('updates')}>浏览时间轴 ↗</button></section></>;}
 return <ImageRecoveryProvider><div className={`sr-site sr-${slug} ${home?'sr-home':'sr-inner'}`} data-design-version={slug==='ive'?'ive-artist-20261122':'official-redesign-20261025'}><a className="sr-skip" href="#artist-content">跳到内容</a><header className="sr-header"><a className="sr-brand" href={path} aria-label={config.name+'首页'}>{art.logo??config.logo?<Picture src={art.logo??config.logo} alt={config.name}/>:config.name}</a><button className="sr-menu" aria-expanded={menu} aria-controls="sr-navigation" onClick={()=>setMenuUrl(menu?null:url)}>{menu?'关闭 ×':'菜单 ☰'}</button><nav className={menu?'sr-nav is-open':'sr-nav'} id="sr-navigation" aria-label="团体栏目" onKeyDown={e=>{if(e.key==='Escape'){setMenuUrl(null);document.querySelector<HTMLButtonElement>('.sr-menu')?.focus();}}}>{nav.map(([key,en,cn])=><button key={key} aria-current={route.section===key?'page':undefined} onClick={()=>go(key)}><span>{slug==='ive'&&key==='works'?'MUSIC':en}</span><small>{cn}</small></button>)}<a href="/?view=groups">团体索引 ↗</a></nav></header><main id="artist-content">{earlyHero&&hero()}{loading?<div className="sr-state" role="status">正在读取 {config.name}…<button onClick={()=>void load()}>重新加载</button></div>:error?<div className="sr-state" role="alert">{error}<button onClick={()=>void load()}>重试</button></div>:!collection?<div className="sr-state">没有找到团体资料。<a href="/?view=groups">返回索引</a></div>:route.member?member?memberPage(member):<div className="sr-state">未找到成员。<button onClick={()=>go('members')}>返回成员目录</button></div>:params.has('release')?release?releasePage(release):<div className="sr-state">未找到发行。<button onClick={()=>go('works')}>返回作品目录</button></div>:params.has('media')?film?filmPage(film):<div className="sr-state">未找到影像。<button onClick={()=>go('works')}>返回作品目录</button></div>:home?overview():route.section==='members'?roster(true):route.section==='works'?library():route.section==='updates'?<section className="sr-section sr-history">{heading('HISTORY','团体时间轴')}<ArtistTimelineHost groupId={config.groupId} catalog={data} loading={loading} error={error} onRetry={()=>void load()}/></section>:<section className="sr-section">{heading('MY RECORDS','我的观看记录')}<div className="sr-score-summary"><p>MV 均分<strong>{artistWorkScoreLabel(collection.mv.mean)}</strong></p><p>舞台均分<strong>{artistWorkScoreLabel(collection.stage.mean)}</strong></p><p>待看作品<strong>{collection.pending.length}</strong></p></div><div className="sr-work-grid">{works.map(w=>workCard(w))}</div></section>}<ImageRecoveryControls/></main><footer className="sr-footer">{art.logo??config.logo?<a className="sr-footer-mark" href={path} aria-label={config.name+'首页'}><Picture src={art.logo??config.logo} alt={config.name}/></a>:<strong>{config.name}</strong>}<div><External href={slug==='ive'?'https://ive-official.jp/':config.reference}>官网</External>{slug==='ive'&&<External href="https://open.spotify.com/artist/6RHTUrRF63xao58xh9FXYJ">Spotify</External>}<a href="/?view=groups">返回团体索引 ↗</a></div><small>团体资料与作品手帐 · 非官方站点</small></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div></ImageRecoveryProvider>;
}
