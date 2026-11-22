'use client';
import {artistFilmAction,ArtistFilmPrimary,ArtistFilmSource} from './artist-film-action';
import {ArtistLibraryFilters} from './artist-library-filters';
import {libraryCounts, libraryResultLabel} from '@/lib/idol/artist-library-format';
import {OriginalPhotoLink} from './original-photo-link';
import {artistMvHref} from '@/lib/idol/artist-mv-link';
import {publicCustomArtistText} from '@/lib/idol/custom-artist-copy';
import {ScopedMemberCareerFacts} from '@/components/member-career-facts';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {TimelineReportedRecords} from './timeline-reported-records';
import {MemberWorkPhotoButton} from '@/components/member-work-identity-photo';
import {publicVideoPreview} from '@/lib/idol/mv-public-media';
import {ArtistInformation} from '@/components/artist-information';
import {createContext,useContext,useEffect,useMemo,useState,useSyncExternalStore,type MouseEvent,type ReactNode} from 'react';
import type {CatalogView} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import design from '@/data/bewave-native-design.json';
import {artistCollection,artistRoute,artistMemberUrl,artistWorkUrl} from '@/lib/idol/artist-preview';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {artistCatalogHeaders, catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {bewaveNativeBinding} from '@/lib/idol/candidate/bewave-native';
import {bewaveFilmVersion} from '@/lib/idol/bewave-film-version';
import {memberWorks} from '@/lib/idol/member-works';
import {useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from '@/components/reliable-image';
import {bewaveOriginalPhoto as originalPhoto} from '@/lib/idol/bewave-photos';
import './bewave-artist.css';
const path='/artists/bewave';

const nav=[['overview','首页'],['members','成员'],['works','作品'],['updates','时间轴']] as const;
type Release=typeof design.releases[number];
type Video=typeof design.works[number];
const films=design.works.map(video=>({...video,...bewaveFilmVersion(video.id,video.videoId,video.type==='STAGE')}));
type Person=typeof design.members[number];
function subscribe(cb:()=>void){window.addEventListener('popstate',cb);window.addEventListener('artist-location-change',cb);return()=>{window.removeEventListener('popstate',cb);window.removeEventListener('artist-location-change',cb);};}
const score=(n:number|null|undefined)=>n==null?'未评分':n.toFixed(1);
const NavigationContext=createContext<(event:MouseEvent<HTMLAnchorElement>,target:string)=>void>(()=>{});
function Link({to,children,className,memberId,filmKey}:{to:string;children:ReactNode;className?:string;memberId?:string;filmKey?:string}){const go=useContext(NavigationContext);return <a href={to} className={className} data-artist-member-trigger={memberId} data-member-work-trigger={filmKey} onClick={event=>{if(!filmKey||!to.startsWith('/?'))go(event,to);}}>{children}</a>;}
 function Picture({src,alt,className='',priority=false}:{src:string;alt:string;className?:string;priority?:boolean}){return <ReliableImage src={src} identityKey={src} alt={alt} priority={priority} className={'photo '+className} retryMode="external" missing={<p className="missing-art">暂无封面</p>} errorFallback={<p role="status">图片暂时无法加载，可重试。</p>}/>;}

export default function BewaveArtist({content}:{content:CandidateContent}){
 const host=useArtistTimelineHostOptions();
 const url=useSyncExternalStore(subscribe,()=>path+window.location.search,()=>host.serverRoute??path);
 const params=useMemo(()=>new URL(url,'https://site.invalid').searchParams,[url]);
 const route=useMemo(()=>artistRoute(url),[url]);
 const [fetched,setFetched]=useState<{data:CatalogView|null;error:string;loading:boolean}>({data:null,error:'',loading:true});
 const [retry,setRetry]=useState(0);
 const state=host.catalog!==undefined?{data:host.catalog,error:host.error??'',loading:host.loading??false}:fetched;
 const [lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const remember=useArtistScroll(true,url);
 useEffect(()=>{if(host.catalog!==undefined)return;const controller=new AbortController();setFetched({data:null,error:'',loading:true});void catalogReadWithDeadline(async signal=>{const response=await fetch('/api/catalog?artist=bewave&shape=display-v1',{headers:artistCatalogHeaders,cache:'no-store',signal});if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('记录暂时无法读取');const data=await response.json() as CatalogView;if(!data||!Array.isArray(data.groups)||!Array.isArray(data.members)||!Array.isArray(data.works)||!Array.isArray(data.ratings))throw new Error('记录尚未加载完整');return data;},controller.signal).then(data=>{if(!controller.signal.aborted)setFetched({data,error:'',loading:false});}).catch(error=>{if(!controller.signal.aborted)setFetched({data:null,error:error instanceof Error?error.message:'记录暂时无法读取',loading:false});});return()=>controller.abort();},[host.catalog,retry]);
 const collection=useMemo(()=>state.data?artistCollection(state.data,content.groupId):null,[state.data,content.groupId]);
 function href(patch:Record<string,string|null>){const p=new URLSearchParams(params);for(const [key,value]of Object.entries(patch)){if(value===null)p.delete(key);else p.set(key,value);}return path+(p.size?'?'+p:'');}
 const sectionHref=(section:string)=>path+(section==='overview'?'':'?section='+section);
 const personHref=(id:string)=>href({section:'members',member:id,release:null,media:null,format:null});
 const releaseHref=(r:Release)=>href({section:'works',release:r.key,media:null,member:null,format:route.format==='release'?'release':null});
 const videoHref=(v:Video)=>(v.type==='MV'?artistMvHref(state.data,content.groupId,v.url,safeArtistReturn(url)??path,v.id):filmAction(v).href)??href({section:'works',media:v.key,format:v.type.toLowerCase(),release:null,member:null});
 function go(event:MouseEvent<HTMLAnchorElement>,target:string){if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;remember(event);if(target.startsWith('/?'))return;event.preventDefault();history.pushState(newArtistHistoryState(history.state,target),'',target);window.dispatchEvent(new Event('artist-location-change'));document.getElementById('artist-content')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 const backToLibrary=href({section:'works',release:null,media:null,member:null});
 function memberTile(m:Person,index:number){return <article className="person-tile" key={m.id}><Link to={personHref(m.id)} memberId={m.id}><span className="member-index">{String(index+1).padStart(2,'0')}</span><Picture src={content.portraits[m.id].image} alt={`${m.cnName} ${m.stageName} 采访资料照`} className="portrait"/><div className="member-caption"><h2>{m.cnName}</h2><p>{m.stageName}</p></div></Link></article>;}
 function roster(people:Person[]=design.members){return <div className="member-grid">{people.map(m=>memberTile(m,design.members.indexOf(m)))}</div>;}
 function searchForm(kind:'members'|'works'){const label=kind==='members'?'搜索成员':'搜索作品';return <form className="search-form" onSubmit={event=>{event.preventDefault();const q=String(new FormData(event.currentTarget).get('q')??'').trim().slice(0,200);remember();history.pushState(newArtistHistoryState(history.state),'',href({q:q||null}));window.dispatchEvent(new Event('artist-location-change'));}}><label htmlFor="bw-search">{label}</label><div><input id="bw-search" name="q" key={route.search} defaultValue={route.search} placeholder={kind==='members'?'中文名 / 艺名':'作品名称'} maxLength={200}/><button type="submit">查找</button>{route.search&&<Link className="search-clear" to={href({q:null})}>清除搜索</Link>}</div></form>;}
 function missing(message:string,section:string){return <section className="empty"><h1>{message}</h1><Link className="button" to={sectionHref(section)}>返回{section==='members'?'成员':'作品'}目录</Link></section>;}
 function releaseCard(r:Release){return <article className="record" key={r.key}><Link to={releaseHref(r)}><Picture src={r.cover} alt={`${r.title} 发行封面`} className="cover"/><h3>{r.title}</h3><time dateTime={r.date??undefined}>{r.date??'发行日期不详'}</time></Link></article>;}
 function videoRow(v:Video){
  const cover=publicVideoPreview(v.url,'');
  return <article className="video-row" key={v.key} data-video-key={v.key}><Link className="video-card" to={videoHref(v)} filmKey={v.key}>
   {cover&&<span className="video-preview"><Picture src={cover} alt=""/></span>}
   <div className="video-copy"><h3>{v.title}</h3><div className="video-metadata"><p className="video-kind">{v.label}</p>{v.date&&<time dateTime={v.date}>{v.date}</time>}</div></div>
  </Link></article>;
 }
 function sectionHead(title:string){return <header className="section-head"><h2>{title}</h2></header>;}
 function timeline(teaser=false){const events=[...design.events].sort((a,b)=>a.date.localeCompare(b.date));return <><ol data-artist-timeline="" className="single-timeline">{(teaser?events.slice(0,3):events).map(e=>{const r=design.releases.find(r=>r.key===e.releaseKey);return <li className="event" id={e.id} key={e.id}><div className="event-date"><time dateTime={e.date}>{e.date}</time></div><div className="event-copy"><h2>{e.title}</h2><p>{publicCustomArtistText(e.summary)}</p><a className="image-source" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a><div className="event-links">{r&&<Link to={releaseHref(r)}>{r.title} ↗</Link>}{e.memberIds.map(id=>{const m=design.members.find(m=>m.id===id);return m?<Link key={id} to={personHref(id)}>{m.cnName} ↗</Link>:null;})}</div></div></li>;})}</ol>{!teaser&&<TimelineReportedRecords slug="bewave" groupId={content.groupId} variant="bewave"/>}</>;}
 function filmAction(v:Video){
  const binding=bewaveNativeBinding(v,collection?.works??[]);
  return artistFilmAction(binding,safeArtistReturn(url),v.url,Boolean(v.id),state);
 }
 function recordStatus(action:ReturnType<typeof filmAction>){
  return <div className="record-handoff"><p className="availability">{action.status}</p>{state.error&&<button className="button" onClick={()=>host.onRetry?host.onRetry():setRetry(n=>n+1)}>重试记录</button>}</div>;
 }
 const selectedMember=design.members.find(m=>m.id===route.member);
 const selectedRelease=design.releases.find(r=>r.key===params.get('release'));
 const selectedVideo=films.find(v=>v.key===params.get('media')&&v.type.toLowerCase()===route.format);
 function person(m:Person){const related=design.releases.filter(r=>(r.memberIds as string[]).includes(m.id));const nativeMember=collection?.members.find(row=>row.id===m.id);const items=state.data&&nativeMember?memberWorks(state.data,m.id):[];const next=design.members[(design.members.indexOf(m)+1)%design.members.length];return <><Link className="back" to={href({member:null})}>← 返回成员</Link><header className="identity"><h1>{m.cnName}</h1></header><div className="personal-spread" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"><div className="personal-photo"><span className="member-index">{String(design.members.indexOf(m)+1).padStart(2,'0')}</span><button className="photo-open" aria-label={`放大${m.cnName}资料照`} onClick={()=>setLightbox({src:originalPhoto(content.portraits[m.id].image),label:m.cnName+' · 采访资料照'})}><Picture src={content.portraits[m.id].image} alt={`${m.cnName} 采访资料照`} className="portrait" priority/></button></div><div className="bio" data-member-module="basic"><h2>{m.stageName.toUpperCase()}</h2><p className="profile-summary">{m.profile}</p><dl>{m.role&&<div><dt>定位</dt><dd>{m.role}</dd></div>}{m.birthDate&&<div><dt>生日</dt><dd>{m.birthDate}</dd></div>}<div><dt>国籍</dt><dd>{m.nationality}</dd></div></dl></div></div>{items.length>0&&<section className="member-related" data-member-module="works">{sectionHead('认人参考与作品评分')}<p className="availability">已收录的成员作品；更多参与资料持续补充。</p><div className="videos-list">{items.map(item=><article className="video-row" key={item.work.id}><div className="video-copy"><a data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work,false,safeArtistReturn(url)??path)}><h3>{item.work.song||item.work.name} ↗</h3></a><p>表现 {score(item.performance)} · 造型 {score(item.styling)}</p></div><MemberWorkPhotoButton work={item.work} memberId={m.id} label={m.cnName+' · '+item.work.song} photo={item.photo} live={state.data?.mode==='live'} className="button" onOpen={setLightbox}/></article>)}</div></section>}
{related.length>0&&<section className="member-related">{sectionHead('参与发行')}<div className="records-grid">{related.map(releaseCard)}</div></section>}
{state.data&&<MemberPublicCredits memberId={m.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,safeArtistReturn(url)??path)}>{label}</a>}/>}
<ScopedMemberCareerFacts data={state.data} memberId={m.id} groupId="rec28ldfRTiDh1" part="history"/>
<section className="member-profile-sources" data-member-module="sources"><a className="image-source" href={content.portraits[m.id].sourceUrl??undefined} target="_blank" rel="noopener noreferrer">Edaily 采访与照片来源 ↗</a>{nativeMember&&<a className="image-source" href={artistMemberUrl(m.id,safeArtistReturn(url)??path)} onClick={()=>remember()}>个人档案与记录 ↗</a>}</section>
<ScopedMemberCareerFacts data={state.data} memberId={m.id} groupId="rec28ldfRTiDh1" part="sources"/>
<div className="person-next"><Link to={personHref(next.id)}>下一位：{next.cnName} ↗</Link></div>
</>;}
 function releaseDetail(r:Release){return <article className="release-detail"><Link className="back" to={backToLibrary}>← 返回发行目录</Link><div className="detail-spread"><button className="photo-open" aria-label={`放大${r.title}发行封面`} onClick={()=>setLightbox({src:r.cover,label:r.title+' · 发行封面'})}><Picture src={r.cover} alt={`${r.title} 发行封面`} className="cover" priority/></button><div className="detail-copy"><p className="eyebrow">{r.kind}</p><h1>{r.title}</h1><p>{publicCustomArtistText(r.description)}</p><time dateTime={r.date??undefined}>{r.date??'发行日期不详'}</time>{r.catalogDate&&<p className="availability">音乐平台目录日期：{r.catalogDate}</p>}{r.memberIds.length>0&&<section className="detail-members"><h2>关联成员</h2>{r.memberIds.map(id=>{const m=design.members.find(m=>m.id===id);return m?<Link key={id} to={personHref(id)}>{m.cnName} ↗</Link>:null;})}</section>}<a className="image-source" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">发行来源 ↗</a></div></div>{films.some(v=>v.releaseKey===r.key)&&<section className="related-videos">{sectionHead('影像')}<div className="videos-list">{films.filter(v=>v.releaseKey===r.key).map(videoRow)}</div></section>}</article>;}
 function videoDetail(v:Video){
  const action=filmAction(v);
  const r=design.releases.find(r=>r.key===v.releaseKey),cover=publicVideoPreview(v.url,'');
  return <article className="video-detail"><Link className="back" to={backToLibrary}>← 返回影像目录</Link>
   <div className={'detail-spread'+(cover?'':' without-preview')}>{cover?<ArtistFilmPrimary action={action} className="film-preview" remember={()=>remember()}>
      <Picture src={cover} alt={v.title+' · 视频封面'} priority/>
      <span className="film-action-label">{action.label}</span>
    </ArtistFilmPrimary>:<ArtistFilmPrimary action={action} className="button" remember={()=>remember()}/>}<div className="detail-copy"><h1>{v.title}</h1><p className="detail-kind">{v.label}</p>{v.date&&<time dateTime={v.date}>{v.date}</time>}<ArtistFilmSource action={action}/>
     {r&&<Link className="parent-release" to={releaseHref(r)}>所属发行：{r.title} ↗</Link>}{v.memberIds.length>0&&<section className="detail-members"><h2>参与成员</h2>{v.memberIds.map(id=>{const m=design.members.find(m=>m.id===id);return m?<Link key={id} to={personHref(id)}>{m.cnName} ↗</Link>:null;
 })}</section>}{recordStatus(action)}</div></div></article>;
 }
 function library() {
   const query = route.search.trim().toLocaleLowerCase();
   const showVideos = route.format !== 'release';
   const showReleases = route.format === 'all' || route.format === 'release';
   const matchedVideos = showVideos ? films.filter(video =>
     (route.format === 'all' || video.type.toLowerCase() === route.format)
     && [video.title, video.label].join(' ').toLocaleLowerCase().includes(query)) : [];
   const matchedReleases = showReleases
     ? design.releases.filter(row => row.title.toLocaleLowerCase().includes(query)) : [];
   return <>
     <header className="page-heading"><h1>Records & films</h1></header>
     <ArtistLibraryFilters className="work-tabs" selected={route.format} onNavigate={go} counts={libraryCounts(design.works, design.releases)}
         hrefFor={format => href({section:'works', format:format === 'all' ? null : format, queue:null, release:null, media:null})}/>
     {searchForm('works')}
     <p role="status" className="result-count">{libraryResultLabel(route.format, matchedVideos.length, matchedReleases.length)}</p>
     {showVideos && <section className="library-videos">
       {sectionHead(route.format === 'stage' ? 'STAGE' : route.format === 'mv' ? 'MV' : 'MV / STAGE')}
       <div className="videos-list">{matchedVideos.map(videoRow)}</div>
       {!matchedVideos.length && <p className="empty">没有符合条件的影像。</p>}
     </section>}
     {showReleases && <>
       <div className="records-grid">{matchedReleases.map(releaseCard)}</div>
       {!matchedReleases.length && <p className="empty">没有符合条件的发行。</p>}
     </>}
   </>;
 }
 let body:ReactNode;
 if(route.member)body=selectedMember?person(selectedMember):missing('没有找到这位成员。','members');
 else if(params.has('release'))body=selectedRelease?releaseDetail(selectedRelease):missing('没有找到此发行。','works');
 else if(params.has('media'))body=selectedVideo?videoDetail(selectedVideo):missing('暂时找不到这个视频版本。','works');
 else if(route.section==='members'){const members=design.members.filter(m=>[m.cnName,m.stageName].join(' ').toLocaleLowerCase().includes(route.search.toLocaleLowerCase()));body=<><header className="page-heading"><h1>The people</h1></header>{searchForm('members')}<p className="result-count" role="status">{members.length} 位成员 · 2024年历史名册</p>{members.length?roster(members):<p className="empty">没有符合条件的成员。</p>}</>;}
 else if(route.section==='works'||route.section==='records')body=library();
 else if(route.section==='updates')body=<><header className="page-heading"><h1>Through the years</h1><p>时间轴</p></header>{timeline()}</>;
 else body=<>
<section className="opening bw-debut-opening">
 <div className="bw-debut-identity">
  <p className="bw-era-title">BE;WAVE <span>2024.04</span></p>
  <h1><img src="/artist/bewave/be-wave/platform-chrome.webp" alt="BEWAVE" width={1160} height={284}/></h1>
 </div>
 <figure className="bw-debut-photo">
  <OriginalPhotoLink className="photo-open" aria-label="查看团体原图" href={originalPhoto(content.hero.image!)} onOpen={src=>setLightbox({src,label:'BEWAVE ·《BE;WAVE》六人概念照'})}><Picture src={content.hero.image!} alt="BEWAVE《BE;WAVE》概念照中的六位成员" className="group" priority/></OriginalPhotoLink>
  <figcaption>《BE;WAVE》概念照 <a href={content.hero.sourceUrl??undefined} target="_blank" rel="noopener noreferrer">iMBC · 2024.04.10 ↗</a></figcaption>
 </figure>
 <div className="bw-debut-profile">
  <p data-home-introduction="bewave"><span className="group-intro-label">团体介绍</span>BEWAVE 于 2024 年 4 月以同名专辑《BE;WAVE》出道，主打曲为《SING !》。同年 10 月，六位出道成员推出首张单曲专辑《Be your Wave》。</p>
 </div>
</section>
<ArtistInformation slug="bewave" catalog={state.data}/>
<section className="member-section">{sectionHead('人物相册')}<details className="bw-roster-source"><summary>成员照片来源</summary><p>Edaily 的 2024 年六人采访照。每位成员的档案可查看对应原图。</p></details>{roster()}</section>
<section className="library-videos" data-home-module="mv">{sectionHead("MV")}<div className="videos-grid">{design.works.filter(v=>v.type==='MV').slice(0,3).map(videoRow)}</div></section>
<section className="releases-section">{sectionHead('专辑')}<div className="records-grid">{design.releases.map(releaseCard)}</div></section>
<section className="chronicle-tease">{sectionHead('时间轴')}{timeline(true)}<Link className="text-link" to={sectionHref('updates')}>查看完整时间轴 ↗</Link></section>
</>;
 return <NavigationContext.Provider value={go}><ImageRecoveryProvider><div data-bw-native><a className="skip" href="#artist-content">跳到正文</a><header className="masthead"><div className="brandbar"><Link className="wordmark" to={path}><img src="/artist/bewave/be-wave/platform-chrome.webp" alt="BEWAVE" width={140} height={34}/></Link></div><nav aria-label="团体内容">{nav.map(([key,label])=><a key={key} href={sectionHref(key)} aria-current={(route.section==='records'?'works':route.section)===key?'page':undefined} onClick={event=>go(event,sectionHref(key))}>{label}</a>)}</nav></header><main id="artist-content" tabIndex={-1}>{body}</main><footer className="group-footer"><p className="footer-name"><img src="/artist/bewave/be-wave/platform-chrome.webp" alt="BEWAVE" width={180} height={44}/></p><div className="footer-links">{nav.slice(1).map(([key,label])=><Link key={key} to={sectionHref(key)}>{label}</Link>)}<a href="/?view=groups">团体索引 ↗</a></div></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}<ImageRecoveryControls/></div></ImageRecoveryProvider></NavigationContext.Provider>;
}
