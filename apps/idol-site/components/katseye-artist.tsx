'use client';
import {MemberWorkIdentityPhoto} from '@/components/member-work-identity-photo';
import {followerAccountLabel} from '@/lib/idol/follower-count.mjs';
import {publicVideoCover} from '@/lib/idol/mv-public-media';
import {ArtistInformation,ArtistHomeTimeline} from '@/components/artist-information';
import {publicCustomArtistText,publicCustomArtistCaption} from '@/lib/idol/custom-artist-copy';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from './artist-timeline-host';
import releaseVideos from '@/data/katseye-release-videos.json';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import './katseye-review-enhancements.css';
import {katseyeEditorialReleases,katseyeEditorialMembers,katseyeVideoArt} from '@/lib/idol/katseye-editorial';
import {memberChineseName,memberDisplayName} from '@/lib/idol/member-display-name';
import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore,type ComponentProps} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {ArrowLeft,ArrowUpRight,ImageIcon,Play,Search} from 'lucide-react';
import type {CatalogView as Catalog,Member,Photo,Work} from '@/lib/idol/types';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkRows,artistWorkUrl,artistWorkScoreLabel,type ArtistSection} from '@/lib/idol/artist-preview';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {videoId} from '@/lib/idol/values';
import type {ExpandedArtistContent} from './expanded-artist';
import {PhotoLightbox} from './photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from './reliable-image';
import {useArtistScroll} from './use-artist-scroll';

type KatseyeContent=ExpandedArtistContent&{releaseCoverage:{scope:string};featuredReleaseIds:string[];releaseVideoIds:Record<string,string[]>};
const path='/artists/katseye';
const sections:[ArtistSection,string][]=[['overview','首页'],['members','成员'],['works','发行与影像'],['updates','时间轴'],['records','发行目录']];
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
const isMv=(w:Work)=>['官方MV','特别合作MV','合作MV','混音版MV'].includes(w.videoType);
const number=(v:number|null)=>v===null?'待评':v.toFixed(1);
const media=(p:Photo)=>`/api/media?table=${p.table}&record=${p.recordId}&index=${p.index}`;
const external=(url:string)=>safeGroupLink(url)??undefined;
function subscribe(fn:()=>void){window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};}
function A({href,children,...props}:ComponentProps<'a'>){return href?<a href={href} {...props}>{children}</a>:<span>{children}</span>;}
function Picture({src,alt,priority=false,identityKey}:{src?:string|null;alt:string;priority?:boolean;identityKey?:string}){return <ReliableImage src={src} identityKey={identityKey??src??alt} alt={alt} priority={priority} referrerPolicy="no-referrer" missing={<div className="ke-photo-empty"><ImageIcon size={22}/><span>{alt.includes('MV造型')?'本 MV 个人造型图暂缺':'图片暂未收录'}</span></div>} errorFallback={<div className="ke-photo-empty"><ImageIcon size={22}/><span>图片暂未加载</span></div>}/>;}
function Heading({label,title,onMore}:{label:string;title:string;onMore?:()=>void}){return <div className="ke-heading"><div><small>{label}</small><h2>{title}</h2></div>{onMore&&<button onClick={onMore}>查看全部<ArrowUpRight size={14}/></button>}</div>;}
async function readCatalog(signal:AbortSignal){
 return catalogReadWithDeadline(async requestSignal=>{
 const r=await fetch('/api/catalog?artist=katseye&shape=display-v1',{cache:'no-store',signal:requestSignal});
 if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上你的资料库，请重试。');
 const d=await r.json() as Catalog;
 if(!d||!Array.isArray(d.groups)||!Array.isArray(d.members)||!Array.isArray(d.works)||!Array.isArray(d.ratings))throw new Error('资料暂时没有加载完整，请重试。');
 return d;
 },signal);
}
function WorkCard({work,returnTo,stage=false}:{work:Work;returnTo:string;stage?:boolean}){
 const id=stage?work.stage?.videoId:videoId(work.url), art=katseyeVideoArt[work.id]?.[stage?'stage':'mv'];
 const src=id?(art?.id===id?art.image:(publicVideoCover(id)?.src??`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)):null;
 return <article className="ke-work"><A href={artistWorkUrl(work,stage,returnTo)}><div className="ke-work-thumb"><ReliableImage src={src} identityKey={'work:'+work.id+(stage?':stage':':mv')} alt={`${work.song||work.name} ${stage?'舞台':'MV'}封面`} referrerPolicy="no-referrer" fallback={<div className="ke-text-cover"><strong>{work.song||work.name}</strong><span>{stage?'舞台图片暂未收录':'图片暂未收录'}</span></div>}/></div><h3>{work.song||work.name}</h3><p>{[stage?work.stage?.publishedDate:work.releaseDate,stage?'舞台 / PERFORMANCE':work.videoType,work.version].filter(Boolean).join(' · ')}</p><span className="ke-score">我的{stage?'舞台':isMv(work)?' MV':'作品'}分 <b>{artistWorkScoreLabel(stage?work.stageScore:work.score)}{(stage?work.stageScore:work.score)===null?'':' / 10'}</b></span></A><div className="ke-work-actions"><A className="ke-button" href={artistWorkUrl(work,stage,returnTo)}><Play size={13}/>观看与评分</A>{!stage&&!!(work.stage||work.stageSupplement?.alternatives.length)&&<A className="ke-button secondary" href={artistWorkUrl(work,true,returnTo)}>{work.stage?'看舞台':'其他现场'}<ArrowUpRight size={12}/></A>}</div></article>;
}
export default function KatseyeArtist({content}:{content:KatseyeContent}){
 const timelineHostOptions=useArtistTimelineHostOptions();
 const [fetchedData,setData]=useState<Catalog|null>(null),[fetchedError,setError]=useState(''),[fetchedLoading,setLoading]=useState(true),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const data=timelineHostOptions.catalog!==undefined?timelineHostOptions.catalog:fetchedData,loading=timelineHostOptions.loading??(timelineHostOptions.catalog!==undefined?false:fetchedLoading),error=timelineHostOptions.error??fetchedError;
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>timelineHostOptions.serverRoute??path),route=useMemo(()=>artistRoute(url),[url]),returnTo=safeArtistReturn(path+new URL(url,'https://site.invalid').search)??artistRouteUrl(route,path),rememberScroll=useArtistScroll(!!data,url);
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
 const collection=useMemo(()=>data?artistCollection(data,content.groupId):null,[data,content.groupId]);
 const members=collection?[...collection.members].sort((a,b)=>content.profile.members.findIndex(n=>n.toLowerCase()===a.stageName.toLowerCase())-content.profile.members.findIndex(n=>n.toLowerCase()===b.stageName.toLowerCase())):[];
 const member=members.find(m=>m.id===route.member);
 const select=(section:ArtistSection)=>{navigate({section,member:null,format:'all',search:'',queue:'all'});};
 const representative=collection?.works.find(w=>videoId(w.url)==='bYg6aMDQ_TA')??collection?.works.find(w=>!!w.url);
 const matchesFormat=(w:Work)=>route.format==='stage'?!!(w.stage||w.stageSupplement?.alternatives.length):route.format==='mv'?isMv(w)&&!!w.url:true;
 const rows=collection?artistWorkRows(collection.works,route.queue,route.search).filter(matchesFormat):[];
 const featured=content.featuredReleaseIds.map(id=>content.releases.find(r=>r.id===id)).filter((r):r is KatseyeContent['releases'][number]=>!!r);
 const releaseWorks=(releaseId:string)=>collection?.works.filter(w=>(content.releaseVideoIds[releaseId]??[]).includes(videoId(w.url)??''))??[];
 const portrait=(m:Member)=>katseyeEditorialMembers.find(x=>x.id===m.id&&x.stage===m.stageName)?.image??(m.photo?media(m.photo):undefined);
 const releaseId=new URL(url,'https://stage.invalid').searchParams.get('release');
 const selectedRelease=route.section==='records'?katseyeEditorialReleases.find(r=>r.id===releaseId):undefined;
 const needle=route.search.trim().toLocaleLowerCase();
 const filteredMembers=members.filter(m=>[memberDisplayName(m),m.stageName].join(' ').toLocaleLowerCase().includes(needle));
 const filteredReleases=katseyeEditorialReleases.filter(r=>[r.title,r.date,r.kind,r.artistCredit].join(' ').toLocaleLowerCase().includes(needle));
 function searchBox(label:string,placeholder:string){return <label className="ke-search"><Search size={17}/><input type="search" aria-label={label} placeholder={placeholder} value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label>;}
 function clearSearch(){navigate({search:''},true);}
 function openPhoto(src:string|undefined,label:string){if(src)setLightbox({src,label});}
 function openRelease(id:string){rememberScroll();const next=new URL(artistRouteUrl({...route,section:'records',member:null,format:'all'},path),'https://stage.invalid');next.searchParams.set('release',id);window.history.pushState(newArtistHistoryState(window.history.state),'',next.pathname+next.search);window.dispatchEvent(new Event('artist-location-change'));document.getElementById('artist-content')?.scrollIntoView({block:'start'});}
 function editorial(){return <div className="ke-editorial-grid">{filteredReleases.map(r=><button key={r.id} data-release-trigger={r.id} onClick={()=>openRelease(r.id)}><Picture src={r.image} alt={r.title+' 发行封面'}/><strong>{r.title.replace(/ - (EP|Single)$/,'')}</strong><small>{r.date} / {r.kind}</small></button>)}</div>;}
 function latest(){const r=katseyeEditorialReleases[0];return <section className="ke-latest"><small className="ke-eyebrow">01 / 最新发行</small><div className="ke-latest-grid"><button className="ke-latest-art" onClick={()=>openRelease(r.id)}><Picture src={r.image} alt={r.title+' 发行封面'}/></button><div><p>{r.date} / {r.kind} / {r.tracks} 首作品</p><h2>WILD</h2><button className="ke-button" onClick={()=>openRelease(r.id)}>打开这张发行<ArrowUpRight size={14}/></button><div className="ke-related-releases">{[1,3,5].map(i=>katseyeEditorialReleases[i]).map(x=><button key={x.id} onClick={()=>openRelease(x.id)}><strong>{x.title.replace(/ - (EP|Single)$/,'')}</strong><span>{x.date.slice(0,4)} / {x.kind}</span></button>)}</div></div></div></section>;}
 function releasePage(){if(!selectedRelease)return null;const r=selectedRelease,ids=(releaseVideos as Record<string,string[]>)[r.id]??[],videos=data?.works.filter(w=>ids.includes(videoId(w.url)??''))??[];return <section><button className="ke-back" onClick={()=>navigate({section:'records',member:null})}><ArrowLeft size={14}/>返回发行目录</button><div className="ke-release-detail"><button className="ke-original-cover" aria-haspopup="dialog" aria-label={'查看 '+r.title+' 原图'} onClick={()=>openPhoto(r.image,r.title+' · 发行封面原图')}><Picture src={r.image} alt={r.title+' 发行封面'}/><span>查看原图 ↗</span></button><div><small>{r.date} / {r.kind}</small><h1>{r.title.replace(/ - (EP|Single)$/,'')}</h1><p>{r.artistCredit} · {r.tracks} 首作品</p><A className="ke-button" href={external(r.source)} target="_blank" rel="noopener noreferrer">在 Apple Music 打开<ArrowUpRight size={14}/></A></div></div><div className="ke-release-videos"><Heading label="MUSIC / FILM" title="已收录影像"/><div className="ke-work-grid">{videos.map(w=><WorkCard key={w.id} work={w} returnTo={returnTo}/>)}</div>{!videos.length&&<p className="ke-empty">这张发行的独立影像尚未收录。可通过上方音乐平台聆听。</p>}</div></section>;}
 function roster(hero=false){return <><div className={hero?"ke-roster ke-contact-sheet":"ke-roster"}>{(hero?members:filteredMembers).map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><Picture identityKey={'member:'+m.id} src={portrait(m)} alt={m.stageName+' · '+content.portraitSet.label} priority={hero}/><strong><span className="member-display-name">{hero?(memberChineseName(m)||m.stageName):memberDisplayName(m)}</span><ArrowUpRight size={13}/></strong><small>{m.stageName.toUpperCase()}</small></button>)}</div><p className="ke-credit">{publicCustomArtistCaption(content.portraitSet.label,content.portraitSet.date)}</p></>;}
 function social(){return <section className="ke-social" aria-label="官方账号与粉丝数">{content.social.map(s=><A href={external(s.url)} key={s.platform} target="_blank" rel="noopener noreferrer"><small>{s.platform}<ArrowUpRight size={14}/></small><strong>{s.display||s.platform}</strong><span>{s.handle}{s.display&&<> · {s.metric} · {s.observedAt.slice(0,10)}</>}</span></A>)}</section>;}
 function news(){return <div className="ke-news">{content.updates.map(u=><A key={u.id} href={external(u.url)} target="_blank" rel="noopener noreferrer"><div className="ke-news-image"><Picture identityKey={'news:'+u.id} src={u.image} alt={u.title}/></div><time>{publicCustomArtistText(u.date)} · {u.publisher}</time><h3>{u.title}</h3><p>{publicCustomArtistText(u.summary)}</p><span>阅读官方动态<ArrowUpRight size={13}/></span></A>)}</div>;}
 function renderTimeline(){return <ArtistTimelineHost groupId={content.groupId} catalog={data} background={news()} loading={loading} error={error} onRetry={retry}/>;}
 function taste(){return collection&&<div className="ke-taste"><button onClick={()=>navigate({section:'works',queue:'tonight',member:null,search:''})}><small>接着发现</small><strong>{collection.pending.length} 支待看</strong><ArrowUpRight size={16}/></button><div><small>我的 MV 均分</small><strong>{number(collection.mv.mean)}</strong><span>{collection.mv.count} 支已评</span></div><div><small>我的舞台均分</small><strong>{number(collection.stage.mean)}</strong><span>{collection.stage.count} 支已评</span></div></div>;}
 function collectionFeature(){return <div className="ke-release-feature">{featured.map(r=><article key={r.id}><A href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer">{r.image&&<div className="ke-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div>}<h3>{r.title}</h3><p>{r.date||'发行日期暂缺'} · {r.type}</p></A>{releaseWorks(r.id).map(w=><div className="ke-release-song" key={w.id}><strong>{w.videoType||'视频'} · {w.song||w.name}</strong><span className="ke-score">我的{isMv(w)?' MV':'作品'}分 <b>{artistWorkScoreLabel(w.score)}{w.score===null?'':' / 10'}</b></span><A className="ke-button" href={artistWorkUrl(w,false,returnTo)}>观看{isMv(w)?' MV':'视频'}<ArrowUpRight size={13}/></A></div>)}{!releaseWorks(r.id).length&&<A className="ke-button" href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer">发行介绍<ArrowUpRight size={13}/></A>}</article>)}</div>;}
 function records(compact=false){return <><p className="ke-scope">{publicCustomArtistText(content.releaseCoverage.scope)}</p><div className="ke-release-list">{(compact?content.releases.slice(0,3):content.releases).map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><time>{r.date}</time><strong>{r.title}</strong><span>{r.type}<ArrowUpRight size={14}/></span></A>)}</div></>;}
 function memberPage(m:Member){if(!data)return null;const items=memberWorks(data,m.id),s=memberWorkSummary(items);return <><button className="ke-back" onClick={()=>navigate({section:'members',member:null})}><ArrowLeft size={15}/>KATSEYE · 全部成员</button><section className="ke-member-hero" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"><figure><Picture identityKey={'member:'+m.id} src={portrait(m)} alt={m.stageName+' · '+content.portraitSet.label} priority/><figcaption>{publicCustomArtistCaption(content.portraitSet.label,content.portraitSet.date)}</figcaption><button className="ke-button secondary" aria-haspopup="dialog" onClick={()=>openPhoto(portrait(m),memberDisplayName(m)+' · 官网成员资料照原图')}>查看原图<ArrowUpRight size={14}/></button></figure><div data-member-module="basic"><small className="ke-eyebrow">KATSEYE / MEMBER</small><h1 className="ke-profile-title">{m.stageName}</h1><p className="ke-profile-name member-display-name">{memberDisplayName(m)}</p><MemberPhysicalFacts member={m}/><MemberCareerFacts member={m} part="intro"/><p>{[m.stageName,m.country,m.birthDate,m.status].filter(Boolean).join(' · ')}</p>{m.role&&<p>{m.role}</p>}<A className="ke-button" href={artistMemberUrl(m.id,returnTo)}>个人档案与记录<ArrowUpRight size={14}/></A><div className="ke-member-social">{(m.social??[]).map(a=><A key={a.platform} href={external(a.url)} target="_blank" rel="noopener noreferrer"><span>{a.platform==='instagram'?'Instagram':a.platform==='x'?'X':a.platform==='youtube'?'YouTube':'TikTok'}<ArrowUpRight size={13}/></span>{a.countLabel&&<strong>{followerAccountLabel(a)}</strong>}{a.countLabel&&a.observedAt&&<small>更新于 {a.observedAt.slice(0,10)}</small>}</A>)}</div></div></section>
<div className="ke-member-summary" data-member-module="scores"><div><small>作品综合分</small><strong>{number(s.composite)}</strong><span>{s.ratedWorks} 支作品已评</span></div><div className="ke-dimensions"><div><small>表现均分</small><strong>{number(s.performanceMean)}</strong><span>{s.performanceCount} 支已评</span></div><div><small>造型均分</small><strong>{number(s.stylingMean)}</strong><span>{s.stylingCount} 支已评</span></div></div>{s.composite===null&&<p>表现和造型都有评分后，显示作品综合分。</p>}</div>
<Heading label="认人参考与作品评分" title="认识她的不同侧面"/><div className="ke-member-works" data-member-module="works">{items.map(x=><article key={x.work.id}><MemberWorkIdentityPhoto work={x.work} memberId={m.id} label={memberDisplayName(m)+' · '+x.work.song} photo={x.photo} live={data.mode==='live'} className={'ke-member-look member-mv-look'+(x.photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')} onOpen={setLightbox} showMissing/><MvPhotoReference photo={x.photo} referencePhoto={x.referencePhoto} label={memberDisplayName(m)+' · '+x.work.song} live={data.mode==='live'}/><A data-member-work-trigger={x.work.id} href={artistWorkUrl(x.work,false,returnTo)}><h3>{x.work.song||x.work.name}<ArrowUpRight size={14}/></h3><p>{x.work.version||x.work.videoType}</p><div><span>表现 <b>{number(x.performance)}</b></span><span>造型 <b>{number(x.styling)}</b></span></div></A>{!!(x.work.stage||x.work.stageSupplement?.alternatives.length)&&<A className="ke-button" data-member-work-trigger={x.work.id+':stage'} href={artistWorkUrl(x.work,true,returnTo)}>看舞台<ArrowUpRight size={13}/></A>}</article>)}</div>{!items.length&&<p className="ke-empty">尚未收录这位成员的作品记录。</p>}
<MemberPublicCredits memberId={m.id} data={data} renderLink={(work,label)=><A href={artistWorkUrl(work,false,returnTo)}>{label}</A>}/>
<MemberCareerFacts member={m} part="history"/>
<MemberCareerFacts member={m} part="sources"/>
</>;}
 return <ImageRecoveryProvider><div className="katseye-artist"><header className="ke-header"><button className="ke-brand" onClick={()=>select('overview')}>KATSEYE</button><nav aria-label="团体内容">{sections.map(([k,label])=><button key={k} aria-current={route.section===k?'page':undefined} onClick={()=>select(k)}>{label}</button>)}</nav><A className="ke-site-return" href="/?view=groups">团体索引<ArrowUpRight size={12}/></A></header>{!route.member&&route.section==='overview'&&<section className="ke-hero"><p className="ke-meta">GLOBAL GIRL GROUP / HYBE × GEFFEN</p><div className="ke-title"><h1>KATSEYE</h1></div><Picture src={content.hero.image} alt="KATSEYE 六人团体照" priority/><div className="ke-hero-end"><small>THE MEMBERS</small><button className="ke-button secondary" onClick={()=>select('members')}>认识六位成员<ArrowUpRight size={14}/></button></div></section>}
 <main className="ke-content" id="artist-content">{loading&&!data?<div className="ke-empty" role="status">正在打开你的 KATSEYE 收藏…</div>:error?<div className="ke-empty" role="alert"><p>{error}</p><button className="ke-button" onClick={retry}>重新加载</button></div>:!collection?<div className="ke-empty">暂未找到团体资料。<A href="/?view=groups">返回团体索引</A></div>:selectedRelease?releasePage():releaseId&&route.section==='records'?<div className="ke-empty">没有找到这张发行。<button onClick={()=>select('records')}>返回发行目录</button></div>:route.member?(member?memberPage(member):<div className="ke-empty">这个成员不在 KATSEYE 档案中。<button onClick={()=>navigate({member:null,section:'members'})}>查看成员</button></div>):<>
 {route.section==='overview'&&<>
<ArtistInformation slug="katseye"/>
<section className="ke-home-members"><Heading label="MEMBERS" title="SIX / TOGETHER" onMore={()=>select('members')}/>{roster(true)}</section>
{latest()}
<section className="ke-home-film-section"><Heading label="02 / 影像中的 KATSEYE" title="FILM / PERFORMANCE" onMore={()=>select('works')}/><div className="ke-home-films">{representative&&<><WorkCard work={representative} returnTo={returnTo}/>{representative.stage&&<WorkCard work={representative} returnTo={returnTo} stage/>}</>}{collection.works.filter(w=>w.id==='recvxIZnNLO1yO').slice(0,1).map(w=><WorkCard key={w.id} work={w} returnTo={returnTo}/>)}</div></section>
<ArtistHomeTimeline slug="katseye"/>
<section className="ke-timeline-entry"><Heading label="03 / 从第一步开始" title="大事时间轴" onMore={()=>select('updates')}/><button className="ke-button" onClick={()=>select('updates')}>浏览时间轴<ArrowUpRight size={14}/></button></section>
<section><Heading label="MY WATCH JOURNAL" title="我的观看手帐" onMore={()=>select('works')}/>{taste()}{collectionFeature()}</section>
</>}
 {route.section==='members'&&<section><Heading label="KATSEYE / THE MEMBERS" title="SIX / TOGETHER"/>{searchBox("搜索成员","搜索中文名或成员名")}<p className="ke-result-count" role="status">{filteredMembers.length} 位成员</p>{roster()}{!filteredMembers.length&&<div className="ke-empty"><p>没有找到符合条件的成员。</p><button className="ke-button" onClick={clearSearch}>显示全部成员</button></div>}</section>}
 {route.section==='updates'&&<>{social()}<section className="ke-official-section"><Heading label="TIMELINE" title="大事时间轴"/>{renderTimeline()}</section></>}
 {route.section==='works'&&<section><Heading label="KATSEYE / THE ARCHIVE" title="MUSIC / FILM"/><button className="ke-button secondary" onClick={()=>select('records')}>浏览全部发行<ArrowUpRight size={14}/></button><Heading label={`${collection.works.length} 支收录作品`} title="我的观看手帐"/><div className="ke-work-tools"><label><Search size={17}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label><div className="ke-pills">{queues.map(([k,l])=><button key={k} aria-pressed={route.queue===k} onClick={()=>navigate({queue:k})}>{l}<span>{artistWorkRows(collection.works,k,route.search).filter(matchesFormat).length}</span></button>)}</div><div className="ke-pills" aria-label="播放内容">{([['all','全部'],['mv','MV'],['stage','可看舞台']] as const).map(([k,l])=><button key={k} aria-pressed={route.format===k} onClick={()=>navigate({format:k})}>{l}</button>)}</div></div><div className="ke-work-grid">{rows.map(w=><WorkCard key={w.id} work={w} returnTo={returnTo} stage={route.format==='stage'}/>)}</div>{route.format==='all'&&rows.some(w=>!!w.stage)&&<div className="ke-stage-library"><Heading label="PERFORMANCE" title="舞台与表演"/><div className="ke-work-grid">{rows.filter(w=>!!w.stage).map(w=><WorkCard key={w.id+':stage'} work={w} returnTo={returnTo} stage/>)}</div></div>}{!rows.length&&<div className="ke-empty"><p>没有符合条件的作品。</p><button className="ke-button" onClick={()=>navigate({queue:'all',search:'',format:'all'})}>查看全部作品</button></div>}</section>}
 {route.section==='records'&&<section><Heading label="02 / RELEASE ARCHIVE" title="发行目录"/>{searchBox("搜索发行","搜索发行名称、年份或类型")}<p className="ke-result-count" role="status">{filteredReleases.length} 项发行</p>{editorial()}{!filteredReleases.length&&<div className="ke-empty"><p>没有找到符合条件的发行。</p><button className="ke-button" onClick={clearSearch}>显示全部发行</button></div>}</section>}
 </>}</main><footer className="ke-footer"><strong>KATSEYE</strong><A href="/?view=groups">返回团体索引<ArrowUpRight size={14}/></A><small>STAGE · 私人观看与评分手帐</small></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
