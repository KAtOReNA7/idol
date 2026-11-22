'use client';
import {ArtistLibraryFilters} from './artist-library-filters';
import {libraryResultLabel} from '@/lib/idol/artist-library-format';
import {OriginalPhotoLink} from './original-photo-link';
import {artistMvHref} from '@/lib/idol/artist-mv-link';
import {ScopedMemberCareerFacts} from '@/components/member-career-facts';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import {publicVideoPreview} from '@/lib/idol/mv-public-media';
import {ArtistInformation} from '@/components/artist-information';
import {createContext,useContext,useEffect,useMemo,useState,useSyncExternalStore,type MouseEvent,type ReactNode} from 'react';
import type {CatalogView} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import design from '@/data/witchx-native-design.json';
import {artistCollection,artistRoute,artistMemberUrl} from '@/lib/idol/artist-preview';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {artistCatalogHeaders, catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from '@/components/reliable-image';
import {witchxOriginalPhoto as originalPhoto} from '@/lib/idol/witchx-photos';
import './witchx-artist.css';

const path='/artists/witchx';
const rosterPhotoCredit='成员人像截自 IN MEDIA A&D 官网档案卡，可在成员页查看完整原卡。';
const nav=[['overview','首页','HOME'],['members','成员','MEMBERS'],['works','作品','MUSIC'],['updates','时间轴','TIMELINE']] as const;
type Person=typeof design.members[number];
type Release=typeof design.releases[number];
type Video=typeof design.works[number];
const Navigation=createContext<(event:MouseEvent<HTMLAnchorElement>,target:string)=>void>(()=>{});
function Link({to,children,className,memberId}:{to:string;children:ReactNode;className?:string;memberId?:string}){const go=useContext(Navigation);return <a href={to} className={className} data-artist-member-trigger={memberId} onClick={e=>go(e,to)}>{children}</a>;}
function Arrow({back=false}:{back?:boolean}){return <svg aria-hidden="true" viewBox="0 0 24 24" className={'wk-arrow'+(back?' is-back':'')}><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;}
function Picture({src,alt,className='',priority=false}:{src:string;alt:string;className?:string;priority?:boolean}){return <ReliableImage src={src} identityKey={src} alt={alt} className={'wk-photo '+className} priority={priority} retryMode="external" missing={<p>暂无图片</p>} errorFallback={<p role="status">图片暂时无法加载，可重试。</p>}/>;}
function subscribe(cb:()=>void){window.addEventListener('popstate',cb);window.addEventListener('artist-location-change',cb);return()=>{window.removeEventListener('popstate',cb);window.removeEventListener('artist-location-change',cb);};}


export default function WitchxArtist({content}:{content:CandidateContent}){
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
  void catalogReadWithDeadline(async signal=>{const response=await fetch('/api/catalog?artist=witchx&shape=display-v1',{headers:artistCatalogHeaders,cache:'no-store',signal});if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('记录暂时无法读取');const data=await response.json() as CatalogView;if(!data||!Array.isArray(data.groups)||!Array.isArray(data.members)||!Array.isArray(data.works)||!Array.isArray(data.ratings))throw new Error('记录尚未加载完整');return data;},controller.signal).then(data=>{if(!controller.signal.aborted)setFetched({data,error:'',loading:false});}).catch(error=>{if(!controller.signal.aborted)setFetched({data:null,error:error instanceof Error?error.message:'记录暂时无法读取',loading:false});});
  return()=>controller.abort();
 },[host.catalog,retry]);
 function href(patch:Record<string,string|null>){const p=new URLSearchParams(params);for(const[k,v]of Object.entries(patch)){if(v===null)p.delete(k);else p.set(k,v);}return path+(p.size?'?'+p:'');}
 const sectionHref=(s:string)=>path+(s==='overview'?'':'?section='+s);
 const personHref=(id:string)=>href({section:'members',member:id,release:null,media:null,format:null,q:route.section==='members'?route.search||null:null});
 const releaseHref=(r:Release)=>href({section:'works',release:r.key,member:null,media:null,format:route.format==='release'?'release':null,q:route.section==='works'||route.section==='records'?route.search||null:null});
 const videoHref=(v:Video)=>(route.section==='overview'&&!route.member&&v.type==='MV'?artistMvHref(state.data,content.groupId,v.url,safeArtistReturn(url)??path):null)??href({section:'works',media:v.key,format:v.type.toLowerCase(),release:null,member:null,q:route.section==='works'?route.search||null:null});
 const backToLibrary=href({section:'works',release:null,media:null,member:null});
 function go(e:MouseEvent<HTMLAnchorElement>,target:string){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;remember(e);if(target.startsWith('/?'))return;e.preventDefault();history.pushState(newArtistHistoryState(history.state),'',target);window.dispatchEvent(new Event('artist-location-change'));document.getElementById('artist-content')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 const showPhoto=(src:string,label:string)=>setLightbox({src:originalPhoto(src),label});
 const heading=(cn:string,en:string)=><header className="wk-heading"><h2>{en}</h2><p>{cn}</p></header>;
 const title=(cn:string,en:string)=><header className="wk-title"><h1>{cn}</h1><p>{en}</p></header>;
 function search(kind:'members'|'works'){return <form className="wk-search" onSubmit={e=>{e.preventDefault();const q=String(new FormData(e.currentTarget).get('q')??'').trim().slice(0,200);remember();history.pushState(newArtistHistoryState(history.state),'',href({q:q||null}));window.dispatchEvent(new Event('artist-location-change'));}}><label htmlFor="wk-search">搜索{kind==='members'?'成员':'作品'}</label><div><input id="wk-search" key={route.search} name="q" defaultValue={route.search} maxLength={200} placeholder={kind==='members'?'中文名 / 艺名':'作品名称'}/><button type="submit">查找</button>{route.search&&<Link to={href({q:null})}>清除搜索</Link>}</div></form>;}
 function roster(people:Person[]=design.members){return <div className="wk-members">{people.map(m=><article key={m.id} className="wk-member"><Link to={personHref(m.id)} memberId={m.id}><Picture src={`/artist/witchx/portraits/${m.stageName.toLowerCase()}.webp`} alt={`${m.cnName} ${m.stageName} · 官网具名档案卡人像`} className="wk-portrait"/><h3>{m.cnName}</h3><p>{m.stageName.toUpperCase()}</p></Link></article>)}</div>;}
 function releases(rows:Release[]=design.releases){return <div className="wk-releases">{rows.map(r=><article className="wk-release" key={r.key}><Link className="wk-release-cover" to={releaseHref(r)}><Picture src={r.cover} alt={`${r.title} 正式发行封面`} className="wk-cover"/></Link><div><p className="wk-meta">{r.kind} · <time dateTime={r.date}>{r.date.replaceAll('-','.')}</time></p><Link to={releaseHref(r)}><h3>{r.title}</h3></Link><p>{r.description}</p><Link className="wk-text-link" to={releaseHref(r)}>查看发行与曲目 <Arrow/></Link></div></article>)}</div>;}
 function videos(rows:Video[]){return <div className="wk-videos">{rows.map(v=><article key={v.key} className="wk-video" data-video-key={v.key}><Link className="wk-video-image" to={videoHref(v)}><Picture src={publicVideoPreview(v.url,v.preview)} alt={`${v.title} · ${v.label} · 视频预览`}/><span><Arrow/></span></Link><Link to={videoHref(v)}><h3>{v.title}</h3><p>{v.label}</p></Link></article>)}</div>;}
 function timeline(){return <ol data-artist-timeline="" className="wk-timeline">{design.events.map(e=>{const r=design.releases.find(r=>r.key===e.releaseKey),v=design.works.find(v=>v.key===e.mediaKey);return <li key={e.id} id={e.id}><div className="wk-event-date"><time dateTime={e.date}>{e.date.replaceAll('-','.')}</time><span>{e.dateLabel}</span></div><div className="wk-event-copy"><h3>{e.title}</h3><p>{e.summary}</p><div className="wk-event-links">{v&&<Link to={videoHref(v)}>查看影像 <Arrow/></Link>}{r&&<Link to={releaseHref(r)}>查看发行 <Arrow/></Link>}<a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">来源 ↗</a></div></div></li>;})}</ol>;}
 function retryRecords(){return state.error?<button className="wk-button" onClick={()=>host.onRetry?host.onRetry():setRetry(n=>n+1)}>重试记录</button>:null;}
 function person(m:Person){const nativeMember=collection?.members.find(row=>row.id===m.id),next=design.members[(design.members.indexOf(m)+1)%design.members.length];return <><Link className="wk-back" to={href({member:null})}><Arrow back/> 返回成员</Link><section className="wk-person-detail" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"><div><button className="wk-photo-button" aria-label={`放大${m.cnName}资料照`} onClick={()=>showPhoto(content.portraits[m.id].image,m.cnName+' · 官网资料照')}><Picture src={`/artist/witchx/portraits/${m.stageName.toLowerCase()}.webp`} alt={`${m.cnName} ${m.stageName} · 官网具名档案卡人像`} className="wk-portrait" priority/></button><button className="wk-text-link" onClick={()=>showPhoto(content.portraits[m.id].image,m.cnName+' · 原图')}>查看原图 <Arrow/></button></div><div className="wk-person-copy" data-member-module="basic"><p className="wk-stage-name">{m.stageName.toUpperCase()}</p><h1>{m.cnName}</h1><p>{m.profile}</p><dl className="wk-person-facts"><div><dt>档案姓名</dt><dd>{m.nativeName}</dd></div><div><dt>生日</dt><dd><time dateTime={m.birthDate}>{m.birthDate.replaceAll('-','.')}</time></dd></div></dl><div className="wk-actions">{nativeMember&&<a className="wk-button" href={artistMemberUrl(m.id,safeArtistReturn(url)??path)} onClick={()=>remember()}>个人档案与记录 <Arrow/></a>}{!nativeMember&&<span className="wk-note">{state.loading?'正在读取个人档案…':'个人档案暂时无法读取。'}{retryRecords()}</span>}</div><p className="wk-note">中文名为本页转写，不作为官方中文姓名。完整档案卡来自公司官网，拍摄及测量时期未注明。</p></div></section><section className="wk-section" data-member-module="public">{heading('相关公开影像','WATCH')}{videos(design.works.filter(v=>(v.memberIds as string[]).includes(m.id)))}</section>

{state.data&&<MemberPublicCredits memberId={m.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,safeArtistReturn(url)??path)}>{label}</a>}/>}
<ScopedMemberCareerFacts data={state.data} memberId={m.id} groupId="rec28ldfRTiDFM" part="history"/>
<section className="member-profile-sources" data-member-module="sources"><a className="wk-source" href={content.portraits[m.id].sourceUrl} target="_blank" rel="noopener noreferrer">照片与资料来源 ↗</a></section>
<ScopedMemberCareerFacts data={state.data} memberId={m.id} groupId="rec28ldfRTiDFM" part="sources"/>
<div className="wk-next"><Link to={personHref(next.id)}>下一位：{next.cnName} <Arrow/></Link></div>
</>;}
 function releaseDetail(r:Release){return <><Link className="wk-back" to={backToLibrary}><Arrow back/> 返回发行目录</Link><section className="wk-release-detail"><div><button className="wk-photo-button" aria-label={`放大${r.title}发行封面`} onClick={()=>showPhoto(r.cover,r.title+' · 正式封面')}><Picture src={r.cover} alt={`${r.title} 正式发行封面`} className="wk-cover" priority/></button><button className="wk-text-link" onClick={()=>showPhoto(r.cover,r.title+' · 正式封面')}>查看封面原图 <Arrow/></button></div><div className="wk-release-copy"><p className="wk-meta">{r.kind} · <time dateTime={r.date}>{r.date}</time></p><h1>{r.title}</h1><p>{r.description}</p><h2>曲目</h2><ol className="wk-tracks">{r.tracks.map(t=><li key={t}>{t}</li>)}</ol><a className="wk-source" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">发行来源 ↗</a><div className="wk-name-links">{r.memberIds.map(id=>{const m=design.members.find(m=>m.id===id)!;return <Link key={id} to={personHref(id)}>{m.cnName} / {m.stageName}</Link>;})}</div></div></section><section className="wk-section">{heading('影像与舞台','WATCH')}{videos(design.works.filter(v=>v.releaseKey===r.key))}</section></>;}
 function videoDetail(v:Video){
  const r=design.releases.find(release=>release.key===v.releaseKey);
  return <><Link className="wk-back" to={backToLibrary}><Arrow back/> 返回影像目录</Link>
   <section className="wk-film">
    <div className="wk-film-heading"><div><p className="wk-meta">{v.label}</p><h1>{v.title}</h1>{v.dateLabel&&<p className="wk-note">{v.dateLabel}</p>}</div><p className="wk-record-handoff wk-note">此版本暂无站内播放或评分。</p></div>
    <a className="wk-film-screen" href={v.url} target="_blank" rel="noopener noreferrer"><Picture src={publicVideoPreview(v.url,v.preview)} alt={`${v.title} · ${v.label} · 视频预览`} priority/><span>在 YouTube 观看原片 <Arrow/></span></a>
    <div className="wk-film-links"><span>视频发布者 · {v.channel}</span>{r&&<Link to={releaseHref(r)}>所属发行：{r.title} <Arrow/></Link>}</div>
    <p className="wk-note">{v.description}</p>
    {v.memberIds.length>0&&<section className="wk-section">{heading('该作品参与成员','MEMBERS')}<div className="wk-name-links">{v.memberIds.map(id=>{const m=design.members.find(m=>m.id===id)!;return <Link key={id} to={personHref(id)}>{m.cnName} / {m.stageName} <Arrow/></Link>;})}</div></section>}
   </section></>;
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
     {title('作品','MUSIC')}
     <div className="wk-library-tools">
       <ArtistLibraryFilters className="wk-tabs" selected={route.format} onNavigate={go}
         hrefFor={format => href({section:'works', format:format === 'all' ? null : format, queue:null, release:null, media:null})}/>
       {search('works')}
     </div>
     <p role="status" className="wk-result">{libraryResultLabel(route.format, matchedVideos.length, matchedReleases.length)}</p>
     {showVideos && <section className="wk-section">
       {heading(route.format === 'stage' ? '舞台' : route.format === 'mv' ? 'MV' : '影像与舞台', 'WATCH')}
       {matchedVideos.length ? videos(matchedVideos) : <p className="wk-empty">没有符合条件的影像。</p>}
     </section>}
     {showReleases && (matchedReleases.length ? releases(matchedReleases) : <p className="wk-empty">没有符合条件的发行。</p>)}
   </>;
 }
 function missing(message:string,section:string){return <section className="wk-empty"><h1>{message}</h1><Link className="wk-button" to={sectionHref(section)}>返回目录</Link></section>;}
 const selectedMember=design.members.find(m=>m.id===route.member),selectedRelease=design.releases.find(r=>r.key===params.get('release')),selectedVideo=design.works.find(v=>v.key===params.get('media')&&v.type.toLowerCase()===route.format);
 let body:ReactNode;
 if(route.member)body=selectedMember?person(selectedMember):missing('没有找到这位成员。','members');
 else if(params.has('release'))body=selectedRelease?releaseDetail(selectedRelease):missing('没有找到此发行。','works');
 else if(params.has('media'))body=selectedVideo?videoDetail(selectedVideo):missing('暂时找不到这个视频版本。','works');
 else if(route.section==='members'){const people=design.members.filter(m=>[m.cnName,m.stageName,m.nativeName].join(' ').toLocaleLowerCase().includes(route.search.toLocaleLowerCase()));body=<>{title('成员','MEMBERS')}{search('members')}<p role="status" className="wk-result">{people.length} 份档案</p>{people.length?<>{roster(people)}<p className="wk-roster-note">{rosterPhotoCredit}</p></>:<p className="wk-empty">没有符合条件的成员。</p>}</>;}
 else if(route.section==='works'||route.section==='records')body=library();
 else if(route.section==='updates')body=<>{title('时间轴','TIMELINE')}{timeline()}<p className="wk-note">公司出道标注、音源发行和视频公开采用各自日期；活动预告不作为已经举办的证明。</p></>;
 else body=<>
<figure className="wk-group"><OriginalPhotoLink className="wk-photo-button" aria-label="查看团体原图" href={originalPhoto(content.hero.image!)} onOpen={src=>setLightbox({src,label:'W!TCHX · Bugs 艺人资料合照'})}><Picture src={content.hero.image!} alt="W!TCHX · Bugs 艺人资料合照" priority/></OriginalPhotoLink><figcaption>Bugs 艺人资料合照 · 拍摄时期未注明 · 点击查看原图</figcaption></figure>
<header className="wk-page-title"><h1>W!TCHX</h1></header>
<ArtistInformation slug="witchx" catalog={state.data}/>
<section className="wk-home-members" aria-label="成员">{heading('成员','MEMBERS')}{roster()}<p className="wk-roster-note">{rosterPhotoCredit}中文名为艺名转写。</p></section>
<section className="wk-section">{heading('影像与舞台','VIDEO')}{videos(design.works)}</section>
<section className="wk-section">{heading('发行','ALBUM')}{releases()}</section>
<section className="wk-section">{heading('时间轴','TIMELINE')}{timeline()}</section>
<section className="wk-introduction"><Picture src={design.logo} alt="W!TCHX 官方标识" priority/><div><h2>W!TCHX</h2><p className="wk-debut">公司标注出道 · 2024.10.31</p><p>五位成员，三张单曲。认识她们的声音、舞台与作品。</p><a href="https://kpopmedia.co.kr/#artists" target="_blank" rel="noopener noreferrer">IN MEDIA A&D · 官方艺人介绍 ↗</a></div></section>
</>;
 return <Navigation.Provider value={go}><ImageRecoveryProvider><div data-idol-witchx-native><a className="wk-skip" href="#artist-content">跳到正文</a><header className="wk-masthead"><div className="wk-header-inner"><Link className="wk-wordmark" to={path}><img src="/artist/witchx/portraits/company-wordmark.png" alt="W!TCHX" width={90} height={25}/><small>IN MEDIA A&amp;D</small></Link><nav aria-label="团体内容">{nav.map(([key,label,en])=><Link key={key} to={sectionHref(key)} className={(route.section==='records'?'works':route.section)===key?'is-current':''}><span>{en}</span><small>{label}</small></Link>)}</nav></div></header><main id="artist-content" tabIndex={-1}>{body}</main><footer className="wk-footer"><Link className="wk-wordmark" to={path}><img src="/artist/witchx/portraits/company-wordmark.png" alt="W!TCHX" width={90} height={25}/><small>IN MEDIA A&amp;D</small></Link><div><a href="https://kpopmedia.co.kr/#artists" target="_blank" rel="noopener noreferrer">IN MEDIA A&D · 官网 ↗</a><a href="/?view=groups">团体索引 <Arrow/></a></div></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}<ImageRecoveryControls/></div></ImageRecoveryProvider></Navigation.Provider>;
}
