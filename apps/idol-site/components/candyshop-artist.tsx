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
import {supersededNativeReportIds} from '@/lib/idol/timeline/reported-records.mjs';
import {MemberWorkPhotoButton} from '@/components/member-work-identity-photo';
import {publicVideoPreview} from '@/lib/idol/mv-public-media';
import {ArtistInformation,ArtistIntroduction} from '@/components/artist-information';
import {createContext,useContext,useEffect,useMemo,useState,useSyncExternalStore,type MouseEvent,type ReactNode} from 'react';
import type {CatalogView} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import design from '@/data/candyshop-native-design.json';
import {artistCollection,artistRoute,artistMemberUrl,artistWorkUrl} from '@/lib/idol/artist-preview';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {artistCatalogHeaders, catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {candyshopNativeBinding} from '@/lib/idol/candidate/candyshop-native';
import {memberWorks} from '@/lib/idol/member-works';
import {useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from '@/components/reliable-image';
import {candyshopOriginalPhoto as originalPhoto} from '@/lib/idol/candyshop-photos';
import './candyshop-artist.css';

const path='/artists/candyshop';
const nav=[['overview','首页'],['members','成员'],['works','作品'],['updates','时间轴']] as const;
type Release=typeof design.releases[number];
type Video=typeof design.works[number];
type Person=typeof design.members[number];
const Navigation=createContext<(event:MouseEvent<HTMLAnchorElement>,target:string)=>void>(()=>{});
function Link({to,children,className,memberId}:{to:string;children:ReactNode;className?:string;memberId?:string}){const go=useContext(Navigation);return <a href={to} className={className} data-artist-member-trigger={memberId} onClick={e=>go(e,to)}>{children}</a>;}
function Arrow({back=false}:{back?:boolean}){return <svg aria-hidden="true" viewBox="0 0 24 24" className={'cs-arrow'+(back?' is-back':'')}><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;}
function Picture({src,alt,className='',priority=false}:{src:string;alt:string;className?:string;priority?:boolean}){return <ReliableImage src={src} identityKey={src} alt={alt} className={'cs-photo '+className} priority={priority} retryMode="external" missing={<p>暂无图片</p>} errorFallback={<p role="status">图片暂时无法加载，可重试。</p>}/>;}
function subscribe(cb:()=>void){window.addEventListener('popstate',cb);window.addEventListener('artist-location-change',cb);return()=>{window.removeEventListener('popstate',cb);window.removeEventListener('artist-location-change',cb);};}
const score=(n:number|null|undefined)=>n==null?'未评分':n.toFixed(1);

export default function CandyshopArtist({content}:{content:CandidateContent}){
 const host=useArtistTimelineHostOptions();
 const url=useSyncExternalStore(subscribe,()=>path+window.location.search,()=>host.serverRoute??path);
 const params=useMemo(()=>new URL(url,'https://site.invalid').searchParams,[url]);
 const route=useMemo(()=>artistRoute(url),[url]);
 const [fetched,setFetched]=useState<{data:CatalogView|null;error:string;loading:boolean}>({data:null,error:'',loading:true});
 const [retry,setRetry]=useState(0),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const state=host.catalog!==undefined?{data:host.catalog,error:host.error??'',loading:host.loading??false}:fetched;
 const collection=useMemo(()=>state.data?artistCollection(state.data,content.groupId):null,[state.data,content.groupId]);
 const remember=useArtistScroll(true,url);
 useEffect(()=>{
  if(host.catalog!==undefined)return;
  const controller=new AbortController();setFetched({data:null,error:'',loading:true});
  void catalogReadWithDeadline(async signal=>{const response=await fetch('/api/catalog?artist=candyshop&shape=display-v1',{headers:artistCatalogHeaders,cache:'no-store',signal});if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('记录暂时无法读取');const data=await response.json() as CatalogView;if(!data||!Array.isArray(data.groups)||!Array.isArray(data.members)||!Array.isArray(data.works)||!Array.isArray(data.ratings))throw new Error('记录尚未加载完整');return data;},controller.signal).then(data=>{if(!controller.signal.aborted)setFetched({data,error:'',loading:false});}).catch(error=>{if(!controller.signal.aborted)setFetched({data:null,error:error instanceof Error?error.message:'记录暂时无法读取',loading:false});});
  return()=>controller.abort();
 },[host.catalog,retry]);
 function href(patch:Record<string,string|null>){const p=new URLSearchParams(params);for(const[k,v]of Object.entries(patch)){if(v===null)p.delete(k);else p.set(k,v);}return path+(p.size?'?'+p:'');}
 const sectionHref=(s:string)=>path+(s==='overview'?'':'?section='+s);
 const personHref=(id:string)=>href({section:'members',member:id,release:null,media:null,format:null,q:route.section==='members'?route.search||null:null});
 const releaseHref=(r:Release)=>href({section:'works',release:r.key,member:null,media:null,format:route.format==='release'?'release':null,q:route.section==='works'||route.section==='records'?route.search||null:null});
 const videoHref=(v:Video)=>(v.type==='MV'?artistMvHref(state.data,content.groupId,v.url,safeArtistReturn(url)??path,v.id):null)??href({section:'works',media:v.key,format:v.type.toLowerCase(),release:null,member:null,q:route.section==='works'?route.search||null:null});
 const backToLibrary=href({section:'works',release:null,media:null,member:null});
 function go(e:MouseEvent<HTMLAnchorElement>,target:string){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;remember(e);if(target.startsWith('/?'))return;e.preventDefault();history.pushState(newArtistHistoryState(history.state,target),'',target);window.dispatchEvent(new Event('artist-location-change'));document.getElementById('artist-content')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 const showPhoto=(src:string,label:string)=>setLightbox({src:originalPhoto(src),label});
 function heading(cn:string,en?:string){
  return <header className="cs-section-heading"><h2>{cn}</h2>{en&&<span className="cs-en" lang="en">{en}</span>}</header>;
 }
 function title(cn:string,en:string){
  return <header className="cs-title"><img src="/artist/candyshop/japan/star.svg" width="20" height="20" alt=""/><span className="cs-title-en" lang="en" aria-hidden="true">{en}</span><h1>{cn}</h1></header>;
 }
 function search(kind:'members'|'works'){return <form className="cs-search" onSubmit={e=>{e.preventDefault();const q=String(new FormData(e.currentTarget).get('q')??'').trim().slice(0,200);remember();history.pushState(newArtistHistoryState(history.state),'',href({q:q||null}));window.dispatchEvent(new Event('artist-location-change'));}}><label htmlFor="cs-search-input">搜索{kind==='members'?'成员':'作品'}</label><div><input id="cs-search-input" name="q" key={route.search} defaultValue={route.search} placeholder={kind==='members'?'中文名 / 艺名':'作品名称'} maxLength={200}/><button type="submit">查找</button>{route.search&&<Link to={href({q:null})}>清除搜索</Link>}</div></form>;}
 function memberCard(m:Person){
  return <article className="cs-member" key={m.id}><Link to={personHref(m.id)} memberId={m.id}>
   <Picture src={content.portraits[m.id].image} alt={m.roster==='historical'?'YUINA 2024 年出道前介绍卡':m.stageName+' 官网肖像'} className="cs-portrait"/>
   <div className="cs-member-name"><h3 lang="en">{m.stageName.toUpperCase()}</h3><p>{m.cnName}</p></div><Arrow/>
  </Link></article>;
 }
 function roster(people:Person[]=design.members){
  const current=people.filter(m=>m.roster!=='historical'),history=people.filter(m=>m.roster==='historical');
  return <>{current.length>0&&<div className="cs-members">{current.map(memberCard)}</div>}
   {history.length>0&&<section className="cs-history-member"><h3>出道时期</h3><div className="cs-members">{history.map(memberCard)}</div></section>}
  </>;
 }
 function releaseCard(r:Release){
  return <article className="cs-record" key={r.key}><Link to={releaseHref(r)}>
   <Picture src={r.displayCover} alt={r.title+' 发行封面'} className="cs-cover"/>
   <div><time dateTime={r.date}>{r.date}</time><h3>{r.title}</h3><p>{r.kind}</p></div>
  </Link></article>;
 }
 function videoCard(v:Video){
  const cover=publicVideoPreview(v.url,v.preview);
  return <article className="cs-video-row cs-video-card" key={v.key} data-video-key={v.key}>
   <Link className="cs-video-label" to={videoHref(v)}>
    {cover&&<span className="cs-row-video-preview"><Picture src={cover} alt=""/></span>}
    <div><h3>{v.title}</h3><p>{v.label}</p></div>
   </Link>
  </article>;
 }
 function timeline(teaser=false){return <><ol data-artist-timeline="" className="cs-timeline">{(teaser?design.events.filter(e=>!!e.releaseKey):design.events.filter(e=>!supersededNativeReportIds('candyshop',content.groupId).includes(e.id))).map(e=><li key={e.id} id={e.id}><div className="cs-event-date"><time dateTime={e.date}>{e.date}</time><span>{publicCustomArtistText(e.dateLabel)}</span></div><div className="cs-event-copy"><h3>{e.title}</h3><p>{publicCustomArtistText(e.summary)}</p><div className="cs-event-links">{e.releaseKey&&<Link to={releaseHref(design.releases.find(r=>r.key===e.releaseKey)!)}>查看发行 <Arrow/></Link>}{e.memberIds.map(id=>{const m=design.members.find(m=>m.id===id);return m?<Link key={id} to={personHref(id)}>{m.cnName} <Arrow/></Link>:null;})}<a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a></div></div></li>)}</ol>{!teaser&&<TimelineReportedRecords slug="candyshop" groupId={content.groupId} variant="candyshop" renderMember={id=>{const m=design.members.find(m=>m.id===id);return m?<Link to={personHref(id)}>{m.cnName} <Arrow/></Link>:null;}}/>}</>;}
 function filmAction(v:Video){
  const binding=candyshopNativeBinding(v,collection?.works??[]);
  return artistFilmAction(binding,safeArtistReturn(url),v.url,Boolean(v.id),state);
 }
 function recordStatus(action:ReturnType<typeof filmAction>){
  return <div className="cs-record-handoff"><p className="cs-note">{action.status}</p>{state.error&&<button className="cs-button" onClick={()=>host.onRetry?host.onRetry():setRetry(n=>n+1)}>重试记录</button>}</div>;
 }
 function person(m:Person){
  const nativeMember=collection?.members.find(row=>row.id===m.id);
  const items=state.data&&nativeMember?memberWorks(state.data,m.id):[];
  const next=design.members[(design.members.indexOf(m)+1)%design.members.length];
  const portrait=content.portraits[m.id];
  const collectionName=m.roster==='historical'?'2024 年出道前介绍卡':'日本官网成员资料照';
  const photoLabel=m.stageName.toUpperCase()+' · '+collectionName;
  return <><Link className="cs-back" to={href({member:null})}><Arrow back/> 返回成员</Link>
   <div className="cs-detail cs-person-detail" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity">
    <OriginalPhotoLink className="cs-photo-button cs-mat" href={originalPhoto(portrait.image)} aria-label={'查看'+m.cnName+'原图'} onOpen={src=>setLightbox({src,label:photoLabel})}>
     <Picture src={portrait.image} alt={photoLabel} className="cs-portrait" priority/>
    </OriginalPhotoLink>
    <div className="cs-detail-copy" data-member-module="basic">
     <h1><span lang="en">{m.stageName.toUpperCase()}</span>{m.cnName}</h1>
     <dl>{m.birthDate&&<div><dt>生日</dt><dd>{m.birthDate}</dd></div>}{m.role&&<div><dt>定位</dt><dd>{m.role}</dd></div>}<div><dt>国籍</dt><dd>{m.country}</dd></div></dl>
     <p>{publicCustomArtistText(m.profile)}</p>
     <div className="cs-actions"><button className="cs-button" onClick={()=>showPhoto(portrait.image,photoLabel)}>查看原图</button>
      {nativeMember&&<a className="cs-source" href={artistMemberUrl(m.id,safeArtistReturn(url)??path)} onClick={()=>remember()}>个人档案与记录 <Arrow/></a>}
     </div>
    </div>
   </div><section className="cs-related" data-member-module="works">{heading('已关联作品','WORKS')}{items.length?<div>{items.map(item=>{const video=design.works.find(v=>v.id===item.work.id&&v.type==='MV');return <article className="cs-video-row" key={item.work.id}><div>{video?<Link to={videoHref(video)}><h3>{item.work.song||item.work.name}</h3></Link>:<h3>{item.work.song||item.work.name}</h3>}<p>表现 {score(item.performance)} · 造型 {score(item.styling)}</p></div><a data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work,false,safeArtistReturn(url)??path)} onClick={()=>remember()}>评分与记录 <Arrow/></a><MemberWorkPhotoButton work={item.work} memberId={m.id} label={m.cnName+' · '+item.work.song} photo={item.photo} live={state.data?.mode==='live'} className="cs-button cs-outline" onOpen={setLightbox}/></article>;})}</div>:<p className="cs-note">{state.loading?'正在读取已有关联…':state.error?'已有记录暂时无法读取。':'此成员暂未收录作品关系。'}</p>}{state.error&&<button className="cs-button" onClick={()=>host.onRetry?host.onRetry():setRetry(n=>n+1)}>重试记录</button>}</section>

{state.data&&<MemberPublicCredits memberId={m.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,safeArtistReturn(url)??path)}>{label}</a>}/>}
<ScopedMemberCareerFacts data={state.data} memberId={m.id} groupId="rec28ldfRTiDlb" part="history"/>
<section className="member-profile-sources" data-member-module="sources"><a className="cs-source" href={content.portraits[m.id].sourceUrl} target="_blank" rel="noopener noreferrer">照片与资料来源 · {m.roster==='historical'?'OSEN':'Candy Shop 日本官网'} ↗</a></section>
<ScopedMemberCareerFacts data={state.data} memberId={m.id} groupId="rec28ldfRTiDlb" part="sources"/>
<div className="cs-next"><Link to={personHref(next.id)}>下一位：{next.cnName} <Arrow/></Link></div>
</>;}
 function releaseDetail(r:Release){
  const label=r.title+' · 正式封面';
  return <><Link className="cs-back" to={backToLibrary}><Arrow back/> 返回发行目录</Link>
   <div className="cs-detail cs-release-detail">
    <OriginalPhotoLink className="cs-photo-button" href={r.cover} aria-label={'放大'+r.title+'发行封面'} onOpen={src=>setLightbox({src,label})}>
     <Picture src={r.displayCover} alt={label} className="cs-cover" priority/>
    </OriginalPhotoLink>
    <div className="cs-detail-copy"><h1 className="cs-latin-title">{r.title}</h1><p>{r.kind} · <time dateTime={r.date}>{r.date}</time></p>
     <p>{r.description}</p><h2 className="cs-tracks-title">曲目</h2>
     <ol className="cs-tracks">{r.tracks.map(t=><li key={t}>{t}</li>)}</ol>
     <div className="cs-actions"><button className="cs-button" onClick={()=>showPhoto(r.cover,label)}>查看封面原图</button>
      <a className="cs-source" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">发行来源 ↗</a>
     </div>
    </div>
   </div>
   <section className="cs-related">{heading('影像与舞台','MOVIE')}<div className="cs-video-grid">{design.works.filter(v=>v.releaseKey===r.key).map(videoCard)}</div></section>
  </>;
 }
 function videoDetail(v:Video){
  const action=filmAction(v);
  const r=design.releases.find(r=>r.key===v.releaseKey);
  return <><Link className="cs-back" to={backToLibrary}><Arrow back/> 返回影像目录</Link>
   <div className="cs-film">{publicVideoPreview(v.url,v.preview)?<ArtistFilmPrimary action={action} className="cs-film-preview" remember={()=>remember()}>
      <Picture src={publicVideoPreview(v.url,v.preview)} alt={`${v.title} · ${v.label} · 视频预览`} priority/><span className="cs-play">{action.label} <Arrow/></span>
    </ArtistFilmPrimary>:<ArtistFilmPrimary action={action} className="cs-button" remember={()=>remember()}/>}<div className="cs-film-copy"><div><h1>{v.title}</h1><p>{v.label}</p>{v.date&&<p className="cs-note">{v.dateLabel} · <time dateTime={v.date}>{v.date}</time></p>}<ArtistFilmSource action={action} className="cs-source"/>{r&&<p><Link to={releaseHref(r)}>所属发行：{r.title} <Arrow/></Link></p>}</div>
    {recordStatus(action)}</div>
   {v.memberIds.length>0&&<section className="cs-video-members">{heading('已关联成员','MEMBER')}<div className="cs-name-links">{v.memberIds.map(id=>{const m=design.members.find(m=>m.id===id);return m?<Link key={id} to={personHref(id)}>{m.cnName} / {m.stageName} <Arrow/></Link>:null;
 })}</div></section>}</div></>;
 }
 function library() {
   const query = route.search.trim().toLocaleLowerCase();
   const showVideos = route.format !== 'release';
   const showReleases = route.format === 'all' || route.format === 'release';
   const matchedVideos = showVideos ? design.works.filter(video =>
     (route.format === 'all' || video.type.toLowerCase() === route.format)
     && [video.title, video.label].join(' ').toLocaleLowerCase().includes(query)) : [];
   const matchedReleases = showReleases
     ? design.releases.filter(row => [row.title, ...row.tracks].join(' ').toLocaleLowerCase().includes(query)) : [];
   return <>
     {title('作品','DISCOGRAPHY')}
     <div className="cs-library-tools">
       <ArtistLibraryFilters className="cs-tabs" selected={route.format} onNavigate={go} counts={libraryCounts(design.works, design.releases)}
         hrefFor={format => href({section:'works', format:format === 'all' ? null : format, queue:null, release:null, media:null})}/>
       {search('works')}
     </div>
     <p role="status" className="cs-result">{libraryResultLabel(route.format, matchedVideos.length, matchedReleases.length)}</p>
     {showVideos && (['MV','STAGE'] as const).map(kind=>{
       const videos=matchedVideos.filter(video=>video.type===kind);
       if(!videos.length)return null;
       return <section key={kind} className="cs-related">{heading(kind==='MV'?'MV':'舞台',kind==='MV'?'MUSIC VIDEO':'STAGE')}
         <div className={'cs-video-grid'+(kind==='STAGE'?' cs-stage-grid':'')}>{videos.map(videoCard)}</div>
       </section>;
     })}
     {showVideos && !matchedVideos.length && <p className="cs-empty">没有符合条件的影像。</p>}
     {showReleases && <section className="cs-related">{heading('唱片','DISCOGRAPHY')}
       {matchedReleases.length?<div className="cs-records">{matchedReleases.map(releaseCard)}</div>:<p className="cs-empty">没有符合条件的发行。</p>}
     </section>}
   </>;
 }
 function missing(message:string,section:string){return <section className="cs-empty"><h1>{message}</h1><Link className="cs-button" to={sectionHref(section)}>返回目录</Link></section>;}
 const selectedMember=design.members.find(m=>m.id===route.member),selectedRelease=design.releases.find(r=>r.key===params.get('release')),selectedVideo=design.works.find(v=>v.key===params.get('media')&&v.type.toLowerCase()===route.format);
 let body:ReactNode;
 if(route.member)body=selectedMember?person(selectedMember):missing('没有找到这位成员。','members');
 else if(params.has('release'))body=selectedRelease?releaseDetail(selectedRelease):missing('没有找到此发行。','works');
 else if(params.has('media'))body=selectedVideo?videoDetail(selectedVideo):missing('暂时找不到这个视频版本。','works');
 else if(route.section==='members'){
  const people=design.members.filter(m=>[m.cnName,m.stageName].join(' ').toLocaleLowerCase().includes(route.search.toLocaleLowerCase()));
  body=<>{title('成员','MEMBER')}{search('members')}<p className="cs-result" role="status">{people.length} 份档案</p>
   {people.length?roster(people):<p className="cs-empty">没有符合条件的成员。</p>}
   <details className="cs-note group-roster-source"><summary>成员照片来源</summary><a href="https://candy-shop.jp/about">Candy Shop 日本官网 ↗</a> · <a href={content.portraits.recvxAPQCFyiww.sourceUrl}>YUINA 出道前介绍卡 · OSEN ↗</a></details>
  </>;
 }
 else if(route.section==='works'||route.section==='records')body=library();
 else if(route.section==='updates')body=<>{title('时间轴','TIMELINE')}{timeline()}</>;
 else body=<>
<section className="cs-japan-opening">
 <OriginalPhotoLink className="cs-photo-button" aria-label="查看团体原图" href={originalPhoto(content.hero.image!)} onOpen={src=>setLightbox({src,label:'Candy Shop · 日本官网四人主视觉'})}>
  <Picture src={content.hero.image!} className="cs-japan-photo" alt="日本官网主视觉中的 Candy Shop 四位成员" priority/>
 </OriginalPhotoLink>
 <div className="cs-japan-profile">
  <div className="cs-signature-band">
   <h1><img src="/artist/candyshop/japan/wordmark.webp" width={980} height={223} alt="Candy Shop"/></h1>
   <img src="/artist/candyshop/japan/star.svg" width={28} height={28} alt=""/>
  </div>
  <div className="cs-japan-bio"><ArtistIntroduction slug="candyshop"/>
   <a href={content.hero.sourceUrl??undefined} target="_blank" rel="noopener noreferrer">日本官网 ↗</a>
  </div>
 </div>
</section>
<ArtistInformation slug="candyshop" catalog={state.data}/>
<section className="cs-home-members">{heading('成员','MEMBER')}{roster()}<details className="cs-note group-roster-source"><summary>成员照片来源</summary><a href="https://candy-shop.jp/about">Candy Shop 日本官网 ↗</a> · <a href={content.portraits.recvxAPQCFyiww.sourceUrl}>YUINA 出道前介绍卡 · OSEN ↗</a></details></section>
<section className="cs-related" data-home-module="mv">{heading('MV','MUSIC VIDEO')}<div className="cs-video-grid">{design.works.filter(v=>v.type==='MV').map(videoCard)}</div></section>
<section className="cs-home-records">{heading('唱片','DISCOGRAPHY')}<div className="cs-records">{design.releases.map(releaseCard)}</div><Link className="cs-more" to={href({section:'works',format:'release',queue:null,release:null,media:null})}>完整发行目录 <Arrow/></Link></section>
<section className="cs-home-timeline">{heading('时间轴','TIMELINE')}{timeline(true)}<Link className="cs-more" to={sectionHref('updates')}>完整时间轴 <Arrow/></Link></section>
</>;
 return <Navigation.Provider value={go}><ImageRecoveryProvider><div data-cs-native><a className="cs-skip" href="#artist-content">跳到正文</a><header className="cs-masthead"><Link className="cs-wordmark" to={path}><img src="/artist/candyshop/identity/official-mark.svg" alt="Candy Shop" width={119} height={27} style={{display:'inline-block',verticalAlign:'middle'}}/></Link><nav aria-label="团体内容">{nav.map(([key,label])=><a key={key} href={sectionHref(key)} aria-current={(route.section==='records'?'works':route.section)===key?'page':undefined} onClick={e=>go(e,sectionHref(key))}>{label}</a>)}</nav></header><main id="artist-content" tabIndex={-1}>{body}</main><footer className="cs-footer"><Link className="cs-wordmark" to={path}><img src="/artist/candyshop/identity/official-mark.svg" alt="Candy Shop" width={119} height={27} style={{display:'inline-block',verticalAlign:'middle'}}/></Link><div><a href="https://candy-shop.jp/" target="_blank" rel="noopener noreferrer">日本官网 ↗</a><a href="/?view=groups">团体索引 <Arrow/></a></div></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}<ImageRecoveryControls/></div></ImageRecoveryProvider></Navigation.Provider>;
}
