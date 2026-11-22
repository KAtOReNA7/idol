'use client';
import {followerAccountLabel} from '@/lib/idol/follower-count.mjs';
import {ArtistWorkPreview} from '@/components/app-image-presentation';
import {useCanEdit} from '@/components/public-access';
import {memberAffiliationLabel} from '@/lib/idol/member-affiliation';
import {historicalMemberVisual} from '@/lib/idol/historical-member-visual';
import {MvIdentityPhoto} from '@/components/mv-identity-photo';
import {ArtistInformation} from '@/components/artist-information';
import {publicCustomArtistText,publicCustomArtistCaption} from '@/lib/idol/custom-artist-copy';
import {focusLinkedRelease,newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {EASY_FROM_OVERVIEW,LESSERAFIM_EASY_PATH} from '@/lib/idol/artist-navigation';
import {easyCardId,easyPreviewSet,easyReleaseId,type EasyPreviews} from '@/lib/idol/lesserafim-easy';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from './artist-timeline-host';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore,type ComponentProps} from 'react';
import {readArtistCatalog} from '@/lib/idol/catalog-read-deadline';
import {ArrowLeft,ArrowUpRight,ImageIcon,Play,Search} from 'lucide-react';
import type {CatalogView as Catalog,Member,Photo,Work} from '@/lib/idol/types';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkRows,artistWorkUrl,artistWorkScoreLabel,type ArtistSection} from '@/lib/idol/artist-preview';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {videoId} from '@/lib/idol/values';
import type {ExpandedArtistContent} from './expanded-artist';
import {PhotoLightbox} from './photo-lightbox';
import {OriginalPhotoLink} from './original-photo-link';
import {PhotoSourceDisclosure} from './photo-source-disclosure';
import {MvPhotoReference} from './mv-photo-reference';
import {mvPhotoLabel,MV_LOOK_PHOTO_LABEL} from '@/lib/idol/mv-photo-presentation';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from './reliable-image';
import {useArtistScroll} from './use-artist-scroll';

type LesserafimContent=Omit<ExpandedArtistContent,'memberVisuals'|'releases'>&{
 memberVisuals:Record<string,ExpandedArtistContent['memberVisuals'][string]&{identitySourceUrl?:string}>;
 releases:(ExpandedArtistContent['releases'][number]&EasyPreviews)[];
 releaseCoverage:{scope:string};
 featuredReleaseIds:string[];
 releaseVideoIds:Record<string,string[]>;
};
const path='/artists/lesserafim';
const sections:[ArtistSection,string][]=[['overview','概览'],['works','作品与舞台'],['members','成员'],['updates','大事时间轴'],['records','发行档案']];
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
const number=(v:number|null)=>v===null?'待评':v.toFixed(1);
const media=(p:Photo)=>`/api/media?table=${p.table}&record=${p.recordId}&index=${p.index}`;
const external=(url:string)=>safeGroupLink(url)??undefined;
function subscribe(fn:()=>void){window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};}
function A({href,children,...props}:ComponentProps<'a'>){return href?<a href={href} {...props}>{children}</a>:<span>{children}</span>;}
function Picture({src,alt,priority=false,identityKey}:{src?:string|null;alt:string;priority?:boolean;identityKey?:string}){return <ReliableImage src={src} identityKey={identityKey??src??alt} alt={alt} priority={priority} referrerPolicy="no-referrer" missing={<div className="lf-photo-empty"><ImageIcon size={22}/><span>{'本 MV 个人造型图暂缺'}</span></div>} errorFallback={<div className="lf-photo-empty"><ImageIcon size={22}/><span>图片暂未加载</span></div>}/>;}
function Heading({label,title,onMore,primary=false}:{label:string;title:string;onMore?:()=>void;primary?:boolean}){const Title=primary?'h1':'h2';return <div className="lf-heading"><div><Title>{title}</Title>{label!==title&&<small>{label}</small>}</div>{onMore&&<button onClick={onMore}>查看全部<ArrowUpRight size={14}/></button>}</div>;}
function WorkCard({work,returnTo,stageOnly=false}:{work:Work;returnTo:string;stageOnly?:boolean}){
 const canEdit=useCanEdit();
 const title=work.song||work.name,hasStage=!!(work.stage||work.stageSupplement?.alternatives.length);
 const value=stageOnly?work.stageScore:work.score;
 const details=stageOnly?[work.stage?.publishedDate,work.stage?.title||(work.stage?'舞台':'其他现场')]:[work.releaseDate,work.version||work.videoType];
 return <article className="lf-work">
  <A href={artistWorkUrl(work,stageOnly,returnTo)} aria-label={title+(stageOnly?' · 观看舞台与评分':' · 观看 MV 与评分')}>
   <div className="lf-work-thumb"><ArtistWorkPreview work={work} stage={stageOnly}/></div>
   <h3>{title}</h3><p>{details.filter(Boolean).join(' · ')}</p>
   {canEdit&&<span className="lf-score">{stageOnly?'我的舞台分':'我的 MV 分'} <b>{artistWorkScoreLabel(value)}{value===null?'':' / 10'}</b></span>}
  </A>
  {hasStage&&!stageOnly&&<div className="lf-work-actions"><A href={artistWorkUrl(work,true,returnTo)} className="lf-button">
   {work.stage?'看舞台':'其他现场'}<ArrowUpRight aria-hidden="true" size={13}/>
  </A></div>}
 </article>;
}
export default function LesserafimArtist({content}:{content:LesserafimContent}){
 const timelineHostOptions=useArtistTimelineHostOptions();
 const canEdit=useCanEdit();
 const [fetchedData,setData]=useState<Catalog|null>(null),[fetchedError,setError]=useState(''),[fetchedLoading,setLoading]=useState(true),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const data=timelineHostOptions.catalog!==undefined?timelineHostOptions.catalog:fetchedData,loading=timelineHostOptions.loading??(timelineHostOptions.catalog!==undefined?false:fetchedLoading),error=timelineHostOptions.error??fetchedError;
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>timelineHostOptions.serverRoute??path),route=useMemo(()=>artistRoute(url),[url]),returnTo=artistRouteUrl(route,path),rememberScroll=useArtistScroll(!!data,url);
 const loadSequence=useRef(0),loadAbort=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{
  if(timelineHostOptions.catalog!==undefined)return;
  const sequence=++loadSequence.current;
  loadAbort.current?.abort();
  const controller=new AbortController();loadAbort.current=controller;
  setLoading(true);setError('');
  try{const d=await readArtistCatalog('lesserafim', controller.signal);if(sequence===loadSequence.current)setData(d);}
  catch(e){if(sequence===loadSequence.current&&!controller.signal.aborted)setError((e as Error).message);}
  finally{if(sequence===loadSequence.current){setLoading(false);loadAbort.current=null;}}
 },[timelineHostOptions.catalog]);
 const cancelLoad=useCallback(()=>{loadSequence.current++;loadAbort.current?.abort();loadAbort.current=null;},[]);
 useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)void load();});return()=>{active=false;cancelLoad();};},[load,cancelLoad]);
 function retry(){if(timelineHostOptions.onRetry){timelineHostOptions.onRetry();return;}void load();}
 // Align after the new section renders, so the previous layout cannot retain the scroll position.
 function navigate(patch:Partial<ReturnType<typeof artistRoute>>,replace=false){rememberScroll();window.history[replace?'replaceState':'pushState'](newArtistHistoryState(window.history.state),'',artistRouteUrl({...route,...patch},path));window.dispatchEvent(new Event('artist-location-change'));if(!replace)window.requestAnimationFrame(()=>document.getElementById('artist-content')?.scrollIntoView({block:'start'}));}
 const collection=useMemo(()=>data?artistCollection(data,content.groupId):null,[data,content.groupId]);
 const members=collection?[...collection.members].sort((a,b)=>content.profile.members.indexOf(a.stageName)-content.profile.members.indexOf(b.stageName)):[];
 const historicalMembers=(data?.members??[]).filter(m=>!m.groupIds.includes(content.groupId)&&(m.formerGroupIds??[]).includes(content.groupId));
 const member=members.find(m=>m.id===route.member)??historicalMembers.find(m=>m.id===route.member);
 const select=(section:ArtistSection)=>{navigate({section,member:null,format:'all'});};
 const representative=collection?.works.find(w=>videoId(w.url)==='pyf8cbqyfPs')??collection?.works.find(w=>!!w.url);
 const matchesFormat=(w:Work)=>route.format==='stage'?!!(w.stage||w.stageSupplement?.alternatives.length):route.format==='mv'?!!w.url:true;
 const rows=collection?artistWorkRows(collection.works,route.queue,route.search).filter(matchesFormat):[];
 const featured=content.featuredReleaseIds.map(id=>content.releases.find(r=>r.id===id)).filter((r):r is LesserafimContent['releases'][number]=>!!r);
 const releaseWorks=(releaseId:string)=>collection?.works.filter(w=>(content.releaseVideoIds[releaseId]??[]).includes(videoId(w.url)??''))??[];
 const visual=(m:Member)=>content.memberVisuals[m.stageName];
 function roster(){return <><div className="lf-roster">{members.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><Picture identityKey={'member:'+m.id} src={visual(m)?.image} alt={m.stageName+' · '+content.portraitSet.label}/><strong><span className="member-display-name">{memberDisplayName(m)}</span><ArrowUpRight size={13}/></strong><small>{m.status||'成员档案'}</small></button>)}</div><p className="lf-credit">{publicCustomArtistCaption(content.portraitSet.label,content.portraitSet.date)}</p></>;}
 function historicalRoster(){return historicalMembers.length>0&&<section aria-label="历史成员"><Heading label="HISTORICAL MEMBERS" title="历史成员"/><p className="lf-credit">曾属本团的独立档案，保留历史作品与个人记录。</p><div className="lf-pills">{historicalMembers.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}>{memberDisplayName(m)} · 历史档案<ArrowUpRight size={13}/></button>)}</div></section>;}
 function news(){return <div className="lf-news">{content.updates.map(u=><A key={u.id} href={external(u.url)} target="_blank" rel="noopener noreferrer"><div className="lf-news-image"><Picture identityKey={'news:'+u.id} src={u.image} alt={u.title}/></div><time>{publicCustomArtistText(u.date)} · {u.publisher}</time><h3>{u.title}</h3><p>{publicCustomArtistText(u.summary)}</p><span>阅读官方动态<ArrowUpRight size={13}/></span></A>)}</div>;}
 function renderTimeline(){return <ArtistTimelineHost groupId={content.groupId} catalog={data} background={news()} loading={loading} error={error} onRetry={retry}/>;}
 function taste(){return canEdit&&collection&&<div className="lf-taste"><button onClick={()=>navigate({section:'works',queue:'tonight',member:null,search:''})}><small>接着发现</small><strong>{collection.pending.length} 支待看</strong><ArrowUpRight size={16}/></button><div><small>我的 MV 均分</small><strong>{number(collection.mv.mean)}</strong><span>{collection.mv.count} 支已评</span></div><div><small>我的舞台均分</small><strong>{number(collection.stage.mean)}</strong><span>{collection.stage.count} 支已评</span></div></div>;}
 function collectionFeature(){
  const works=featured.flatMap(release=>releaseWorks(release.id));
  return <div className="lf-work-grid">{works.map(work=><WorkCard key={work.id} work={work} returnTo={returnTo}/>)}</div>;
 }
 function records(compact=false){
  const latest=content.releases.slice(0,3);
  const releases=compact?[...latest,...featured.filter(release=>!latest.includes(release))]:content.releases;
  return <><p className="lf-scope">{publicCustomArtistText(content.releaseCoverage.scope)}</p>
   <div className="lf-release-feature">{releases.map(release=>{
    const isEasy=release.id===easyReleaseId;
    const link=isEasy
     ? {href:compact?EASY_FROM_OVERVIEW:LESSERAFIM_EASY_PATH, id:easyCardId, ref:focusLinkedRelease, 'data-member-work-trigger':'release:'+release.id}
     : {href:external(release.sourceUrl), target:'_blank', rel:'noopener noreferrer'};
    const alt=release.title+' 官方发行封面';
    return <article key={release.id}><A {...link}>
     <div className="lf-album-cover">{isEasy&&release.imagePreview
      ? <ReliableImage src={release.imagePreview} srcSet={easyPreviewSet(release)}
          sizes="auto, (max-width:650px) calc(45.55vw - 6px), (max-width:1600px) 30vw, 477px"
          identityKey={'release:'+release.id} alt={alt} width={480} height={480} original/>
      : <Picture identityKey={'release:'+release.id} src={release.image} alt={alt}/>}</div>
     <h3>{release.title}</h3><p>{release.date||'发行日期暂缺'} · {release.type}</p>
    </A></article>;
   })}</div></>;
 }
 function memberPage(m:Member){
  if(!data)return null;
  const items=memberWorks(data,m.id),s=memberWorkSummary(items);
  const name=memberDisplayName(m), historical=!m.groupIds.includes(content.groupId)&&(m.formerGroupIds??[]).includes(content.groupId);
  const historyVisual=historical?historicalMemberVisual(m.id,content.groupId):null;
  const portrait=historical?null:visual(m);
  const source=portrait?.identitySourceUrl?external(portrait.identitySourceUrl):undefined;
  const openOriginal=(src:string)=>setLightbox({src,label:name+' · 日本官网成员照'});
  return <>
   <button className="lf-back" onClick={()=>navigate({section:'members',member:null})}>返回全部成员</button>
   <section className="lf-member-hero" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity">
    <header className="lf-member-heading">
     <h1><span className="member-display-name">{name}</span></h1>
     {historical&&<p>{memberAffiliationLabel(m,content.groupId)}</p>}
     {portrait&&<p>日本官网成员照</p>}
    </header>
    <figure className={portrait?'lf-official-member-portrait':undefined}>
     {historyVisual?<><MvIdentityPhoto work={historyVisual.work} memberId={m.id} label={name} profilePortrait/><figcaption>历史时期影像 · {historyVisual.title}</figcaption></>:portrait?<>
      <OriginalPhotoLink className="lf-member-photo" href={portrait.image} aria-label={'放大'+name+'资料照'} onOpen={openOriginal}>
       <Picture identityKey={'member:'+m.id} src={portrait.image} alt={name+' · 日本官网成员照'} priority/>
      </OriginalPhotoLink>
      <OriginalPhotoLink className="lf-member-original" href={portrait.image} aria-label={'查看'+name+'原图'} onOpen={openOriginal}>查看原图</OriginalPhotoLink>
      {source&&<PhotoSourceDisclosure className="lf-member-photo-source">
       <p>LE SSERAFIM 日本官网发布的具名肖像。</p>
       <A href={source} target="_blank" rel="noopener noreferrer">日本官网本人资料</A>
      </PhotoSourceDisclosure>}
     </>:<Picture identityKey={'member:'+m.id} alt={name+' 资料照'} priority/>}
    </figure>
    <div className="lf-member-basic" data-member-module="basic">
     <h2>个人资料</h2>
     <MemberPhysicalFacts member={m}/><MemberCareerFacts member={m} part="intro"/>
     <p>{[m.country,m.birthDate,m.status].filter(Boolean).join(' · ')}</p>
     {m.role&&<p>{m.role}</p>}
     <A className="lf-button" href={artistMemberUrl(m.id,returnTo)}>个人档案与记录</A>
     <div className="lf-member-social">{(m.social??[]).map(a=><A key={a.platform} href={external(a.url)} target="_blank" rel="noopener noreferrer"><span>{a.platform==='instagram'?'Instagram':a.platform==='x'?'X':a.platform==='youtube'?'YouTube':'TikTok'}<ArrowUpRight size={13}/></span>{a.countLabel&&<strong>{followerAccountLabel(a)}</strong>}<small>{a.observedAt?'更新于 '+a.observedAt.slice(0,10):'粉丝数暂未收录'}</small></A>)}</div>
    </div>
   </section>
<div className="lf-member-summary" data-member-module="scores"><div><small>作品综合分</small><strong>{number(s.composite)}</strong><span>{s.ratedWorks} 支作品已评</span></div><div className="lf-dimensions"><div><small>表现均分</small><strong>{number(s.performanceMean)}</strong><span>{s.performanceCount} 支已评</span></div><div><small>造型均分</small><strong>{number(s.stylingMean)}</strong><span>{s.stylingCount} 支已评</span></div></div>{s.composite===null&&<p>表现和造型都有评分后，显示作品综合分。</p>}</div>
<Heading label="作品评分" title="成员影像"/><div className="lf-member-works" data-member-module="works">{items.map(x=><article key={x.work.id}><MvIdentityPhoto work={x.work} memberId={m.id} label={memberDisplayName(m)} photo={x.photo} live={data.mode==='live'}/><MvPhotoReference photo={x.photo} referencePhoto={x.referencePhoto} label={memberDisplayName(m)+' · '+x.work.song} live={data.mode==='live'}/><A data-member-work-trigger={x.work.id} href={artistWorkUrl(x.work,false,returnTo)}><h3>{x.work.song||x.work.name}<ArrowUpRight size={14}/></h3><p>{x.work.version||x.work.videoType}</p><div><span>表现 <b>{number(x.performance)}</b></span><span>造型 <b>{number(x.styling)}</b></span></div></A>{!!(x.work.stage||x.work.stageSupplement?.alternatives.length)&&<A className="lf-button" data-member-work-trigger={x.work.id+':stage'} href={artistWorkUrl(x.work,true,returnTo)}>看舞台<ArrowUpRight size={13}/></A>}</article>)}</div>{!items.length&&<p className="lf-empty">尚未收录这位成员的作品记录。</p>}
<MemberPublicCredits memberId={m.id} data={data} renderLink={(work,label)=><A href={artistWorkUrl(work,false,returnTo)}>{label}</A>}/>
<MemberCareerFacts member={m} part="history"/>
<MemberCareerFacts member={m} part="sources"/>
</>;}
 return <ImageRecoveryProvider><div className="lesserafim-artist"><header className="lf-header"><A className="lf-brand" href="/">STAGE</A><nav aria-label="网站导航"><A href="/">我的放映室</A><A href="/?view=works">作品库</A><A href="/?view=members">成员档案</A><A href="/?view=groups">团体索引</A></nav></header>{!route.member&&<>
 {route.section==='overview'&&<section className="lf-hero">
  <A className="lf-crumb" href="/?view=groups"><ArrowLeft aria-hidden="true" size={13}/>团体索引</A>
  <div className="lf-official-hero">
   <figure className="lf-hero-image"><Picture identityKey={'hero:'+content.groupId} src={content.hero.image} alt={publicCustomArtistText(content.hero.caption)} priority/></figure>
   <div className="lf-official-intro">
    <h1><img className="lf-official-logo" src="/artist/lesserafim/identity/official-logo.png" alt="LE SSERAFIM" width={800} height={280}/></h1>
    <p className="lf-debut">{content.profile.company} · {content.profile.debutDate}</p>
    <p data-home-introduction="lesserafim"><span className="group-intro-label">团体介绍</span>{publicCustomArtistText(content.profile.summary)}</p>
    <div className="lf-hero-actions">
     {representative&&<A className="lf-button primary" href={artistWorkUrl(representative,false,returnTo)}><Play aria-hidden="true" size={14}/>播放 {representative.song}</A>}
     <A href={external(content.profile.sourceUrl)} target="_blank" rel="noopener noreferrer">官方档案 <ArrowUpRight aria-hidden="true" size={14}/></A>
    </div>
   </div>
  </div>
  <p className="lf-credit">{publicCustomArtistCaption(content.hero.caption,content.hero.date)}</p>
 </section>}
 <nav className="lf-tabs" aria-label="团体内容">{sections.map(([k,label])=><button key={k} aria-current={route.section===k?'page':undefined} onClick={()=>select(k)}>{label}</button>)}</nav></>}
 <main className="lf-content" id="artist-content">{loading&&!data?<div className="lf-empty" role="status">正在打开你的 LE SSERAFIM 收藏…</div>:error?<div className="lf-empty" role="alert"><p>{error}</p><button className="lf-button" onClick={retry}>重新加载</button></div>:!collection?<div className="lf-empty">暂未找到团体资料。<A href="/?view=groups">返回团体索引</A></div>:route.member?(member?memberPage(member):<div className="lf-empty">这个成员不在 LE SSERAFIM 档案中。<button onClick={()=>navigate({member:null,section:'members'})}>查看成员</button></div>):<>
 {route.section==='overview'&&<>
<ArtistInformation slug="lesserafim" catalog={data}/>
<section><Heading label="MEMBERS" title="成员" onMore={()=>select('members')}/>{roster()}</section>
<section><Heading label="VIDEO" title="MV 与舞台" onMore={()=>select('works')}/>{taste()}{collectionFeature()}</section>
<section className="lf-record-section"><Heading label="RELEASES" title="专辑与发行" onMore={()=>select('records')}/>{records(true)}</section>
<section className="lf-official-section"><Heading label="TIMELINE" title="大事时间轴" onMore={()=>select('updates')}/>{renderTimeline()}</section>
</>}
 {route.section==='members'&&<section><Heading primary label="MEMBERS" title="成员"/>{roster()}{historicalRoster()}</section>}
 {route.section==='updates'&&<section className="lf-official-section"><Heading primary label="TIMELINE" title="大事时间轴"/>{renderTimeline()}</section>}
 {route.section==='works'&&<section><Heading primary label={`${collection.works.length} 支收录作品`} title="作品与舞台"/><div className="lf-work-tools"><label><Search size={17}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label><div className="lf-pills">{queues.map(([k,l])=><button key={k} aria-pressed={route.queue===k} onClick={()=>navigate({queue:k})}>{l}<span>{artistWorkRows(collection.works,k,route.search).filter(matchesFormat).length}</span></button>)}</div><div className="lf-pills" aria-label="播放内容">{([['all','全部'],['mv','MV'],['stage','可看舞台']] as const).map(([k,l])=><button key={k} aria-pressed={route.format===k} onClick={()=>navigate({format:k})}>{l}</button>)}</div></div><div className="lf-work-grid">{rows.map(w=><WorkCard key={w.id} work={w} returnTo={returnTo} stageOnly={route.format==='stage'}/>)}</div>{!rows.length&&<div className="lf-empty"><p>没有符合条件的作品。</p><button className="lf-button" onClick={()=>navigate({queue:'all',search:'',format:'all'})}>查看全部作品</button></div>}</section>}
 {route.section==='records'&&<section><Heading primary label="RELEASES" title="专辑与发行"/>{records()}</section>}
 </>}</main><footer className="lf-footer"><strong>LE SSERAFIM</strong><A href="/?view=groups">返回团体索引<ArrowUpRight size={14}/></A><small>STAGE · 私人观看与评分手帐</small></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
