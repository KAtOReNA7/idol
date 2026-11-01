'use client';
import {MemberWorkIdentityPhoto} from '@/components/member-work-identity-photo';
import {ArtistInformation} from '@/components/artist-information';
import {useEffect,useMemo,useRef,useState,useSyncExternalStore,type ReactNode} from 'react';
import {ArrowLeft,ArrowUpRight,Play,Search} from 'lucide-react';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import {meovvRosterPortrait} from '@/lib/idol/candidate/meovv-roster-portrait';
import {memberDisplayName,memberChineseName} from '@/lib/idol/member-display-name';
import {memberAffiliationLabel} from '@/lib/idol/member-affiliation';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkRows,artistWorkScoreLabel,artistWorkUrl,type ArtistSection} from '@/lib/idol/artist-preview';
import {MvPhotoReference} from '@/components/mv-photo-reference';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {MEOVV_HERO,MEOVV_LOGO,MEOVV_RELEASES,meovvVideoArt} from '@/lib/idol/candidate/meovv-figma-assets';
import type {CatalogView,Member,Photo,Work} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import './meovv-figma-design.css';

export const MEOVV_FEATURED_IDS=['rec28ldfRTrB45','rec28ldfRTrJ3E','rec28ldfRTrJgk'] as const;
export const meovvDate=(value:string)=>/^\d{4}-\d{2}-\d{2}T/.test(value)?value.slice(0,10):value;
const sections:[ArtistSection,string][]=[['overview','概览'],['members','成员'],['works','作品'],['records','发行'],['updates','历程']];
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
const number=(value:number|null)=>value===null?'未评分':value.toFixed(1);
const media=(photo:Photo)=>`/api/media?table=${photo.table}&record=${photo.recordId}&index=${photo.index}`;
function subscribe(listener:()=>void){window.addEventListener('popstate',listener);window.addEventListener('artist-location-change',listener);return()=>{window.removeEventListener('popstate',listener);window.removeEventListener('artist-location-change',listener);};}
function Link({href,children,className,external=false}:{href?:string|null;children:ReactNode;className?:string;external?:boolean}){const safe=external?safeGroupLink(href??undefined):href;return safe?<a href={safe} className={className} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}</a>:<span className={className}>{children}</span>;}
function Picture({src,alt,identityKey,priority=false,complete=false}:{src?:string|null;alt:string;identityKey:string;priority?:boolean;complete?:boolean}){return <ReliableImage src={src} identityKey={identityKey} alt={alt} priority={priority} style={complete?{objectFit:'contain'}:undefined} referrerPolicy="no-referrer" missing={<span className="mf-image-unavailable">照片暂缺</span>} errorFallback={<span className="mf-image-unavailable">图片暂时无法加载</span>}/>;}
function Title({en,children,count}:{en?:string;children:ReactNode;count?:number}){return <div className="mf-title"><div>{en&&<small>{en}</small>}<h2>{children}</h2></div>{count!==undefined&&<small>{String(count).padStart(2,'0')}</small>}</div>;}
function WorkEntry({work,returnTo,stage=false,featured=false}:{work:Work;returnTo:string;stage?:boolean;featured?:boolean}){const src=meovvVideoArt(work,stage);return <article className={`mf-work${src?'':' mf-work-text'}${featured?' mf-work-featured':''}`} data-work-id={work.id} data-video-kind={stage?'stage':'work'}>{src&&<Link className="mf-work-image" href={artistWorkUrl(work,stage,returnTo)}><Picture identityKey={`${stage?'stage':'work'}:${work.id}:${stage?work.stage?.videoId:work.url}`} src={src} alt={`${work.song||work.name}${stage?'舞台':'作品'}封面`}/>{featured&&<span className="mf-play"><Play size={13}/>{work.song||work.name}</span>}</Link>}<h3><Link href={artistWorkUrl(work,stage,returnTo)}>{stage?work.stage?.title||work.song:work.song||work.name}</Link></h3><p>{stage?'正式舞台':work.videoType||'作品视频'}{!featured&&work.channel&&` · ${stage?work.stage?.channel||work.channel:work.channel}`}</p>{!featured&&<div className="mf-work-meta">{!stage&&work.releaseDate&&<time>{meovvDate(work.releaseDate)}</time>}<Link href={artistWorkUrl(work,stage,returnTo)}>{stage?'舞台':'作品'}评分 {artistWorkScoreLabel(stage?work.stageScore:work.score)} <ArrowUpRight size={14}/></Link></div>}</article>;}

export default function MeovvDesign({content}:{content:CandidateContent}){
 const [menuOpen,setMenuOpen]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!menuOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenuOpen(false);menuButton.current?.focus();}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[menuOpen]);
 const timelineHostOptions=useArtistTimelineHostOptions();
 const path=`/artists/${content.slug}`;
 const [fetchedState,setState]=useState<{data:CatalogView|null;error:string;loading:boolean}>({data:null,error:'',loading:true});
 const state=timelineHostOptions.catalog!==undefined?{data:timelineHostOptions.catalog,error:timelineHostOptions.error??'',loading:timelineHostOptions.loading??false}:fetchedState;
 const [lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>timelineHostOptions.serverRoute??path);
 const route=useMemo(()=>artistRoute(url),[url]);
 const returnTo=artistRouteUrl(route,path);
 const rememberScroll=useArtistScroll(!!state.data,url);
 useEffect(()=>{
  if(timelineHostOptions.catalog!==undefined)return;
  const controller=new AbortController();
  async function load(){
   try{
    const data=await catalogReadWithDeadline(async signal=>{
     const response=await fetch(`/api/catalog?artist=${encodeURIComponent(content.slug)}&shape=display-v1`,{cache:'no-store',signal});
     if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上你的资料库。');
     const result=await response.json() as CatalogView;
     if(!result||!Array.isArray(result.groups)||!Array.isArray(result.members)||!Array.isArray(result.works)||!Array.isArray(result.ratings))throw new Error('资料暂时没有加载完整。');
     return result;
    },controller.signal);
    if(!controller.signal.aborted)setState({data,error:'',loading:false});
   }catch(error){
    if(!controller.signal.aborted)setState({data:null,error:error instanceof Error?error.message:'资料暂时无法读取。',loading:false});
   }
  }
  void load();
  return()=>controller.abort();
 },[content.slug,timelineHostOptions.catalog]);
 function navigate(patch:Partial<ReturnType<typeof artistRoute>>,replace=false){setMenuOpen(false);rememberScroll();window.history[replace?'replaceState':'pushState'](newArtistHistoryState(window.history.state),'',artistRouteUrl({...route,...patch},path));window.dispatchEvent(new Event('artist-location-change'));if(!replace)window.requestAnimationFrame(()=>document.getElementById('artist-content')?.scrollIntoView({block:'start'}));}
 const collection=useMemo(()=>state.data?artistCollection(state.data,content.groupId):null,[state.data,content.groupId]);
 const members=collection?.members??[];
 const member=members.find(item=>item.id===route.member);
 const works=collection?.works??[];
 const portrait=(m:Member)=>candidatePortrait(m,content.portraits);
 const rows=artistWorkRows(works,route.queue,route.search);
 const [kind,setKind]=useState('all');
 const filteredRows=rows.filter(work=>kind==='all'||(kind==='mv'?/MV/i.test(work.videoType):kind==='performance'?/表演|PERFORMANCE/i.test(work.videoType):/特别|SPECIAL/i.test(work.videoType)));
 const stageRows=rows.filter(work=>!!work.stage);
 const featured=MEOVV_FEATURED_IDS.map(id=>works.find(work=>work.id===id)).filter((work):work is Work=>!!work);
 const onHome=route.section==='overview'&&!route.member;
 const backHome=<button className="mf-button mf-back" onClick={()=>navigate({section:'overview',member:null})}><ArrowLeft size={16}/>返回首页</button>;
 const roster=<section className="mf-section mf-roster-section"><Title en={onHome?'THE FIVE':'MEMBERS'} count={onHome?undefined:members.length}>{onHome?'成员':'成员库'}</Title><div className="mf-roster">{members.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><span className="mf-roster-photo"><Picture identityKey={'member:'+m.id} complete src={meovvRosterPortrait(m,portrait(m)?.image)} alt={memberDisplayName(m)}/></span><span className="mf-roster-label"><strong className="member-display-name">{memberChineseName(m)||memberDisplayName(m)}</strong>{memberChineseName(m)&&m.stageName.trim()&&m.stageName.trim()!==memberChineseName(m)&&<small>{m.stageName}</small>}</span></button>)}</div>{!members.length&&<p className="mf-empty">尚无关联的成员记录。</p>}</section>;
 const releases=<section className="mf-section mf-releases"><Title count={onHome?undefined:MEOVV_RELEASES.length}>发行</Title><div className="mf-release-grid">{MEOVV_RELEASES.map(release=>{const work=works.find(item=>item.id===release.workId);return <article key={release.title}><button className="mf-release-image" aria-label={`放大 ${release.title} 发行封面`} aria-haspopup="dialog" onClick={()=>setLightbox({src:release.src,label:`${release.title} · 官方发行封面`})}><Picture src={release.src} identityKey={'release:'+release.title} alt={`${release.title} 官方发行封面`}/></button><h3><Link href={work?artistWorkUrl(work,false,returnTo):undefined}>{release.title}</Link></h3><p>{onHome?'MEOVV':`${release.year} · ${release.kind}`}</p></article>;})}</div></section>;
 const timeline=<section className="mf-section mf-timeline"><Title en={onHome?undefined:'HISTORY'}>历程</Title><ArtistTimelineHost groupId={content.groupId} catalog={state.data} loading={state.loading} error={state.error} onRetry={timelineHostOptions.onRetry}/></section>;
 function memberPage(m:Member){if(!state.data)return null;const selected=portrait(m),items=memberWorks(state.data,m.id),summary=memberWorkSummary(items);return <section className="mf-section mf-member"><button className="mf-button mf-back" onClick={()=>navigate({section:'members',member:null})}><ArrowLeft size={16}/>返回成员库</button><div className="mf-person-breadcrumb"><button onClick={()=>navigate({section:'overview',member:null})}>MEOVV</button><span>/</span><button onClick={()=>navigate({section:'members',member:null})}>成员</button><span>/</span><span>{memberDisplayName(m)}</span></div><div className="mf-person-grid" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"><div className="mf-person-title"><h1 className="member-display-name">{memberChineseName(m)||memberDisplayName(m)}</h1>{memberChineseName(m)&&m.stageName.trim()&&m.stageName.trim()!==memberChineseName(m)&&<p>{m.stageName}</p>}</div><figure className="mf-person-photo"><button aria-label={`放大${memberDisplayName(m)}的照片`} aria-haspopup="dialog" disabled={!selected?.image} onClick={()=>selected?.image&&setLightbox({src:selected.image,label:memberDisplayName(m)})}><Picture identityKey={'member-full:'+m.id} src={selected?.image} alt={memberDisplayName(m)} priority/></button>{selected?.credit&&<figcaption>{selected.credit} {selected.sourceUrl&&<Link href={selected.sourceUrl} external>图片来源 <ArrowUpRight size={12}/></Link>}</figcaption>}</figure><div className="mf-person-copy">{m.profile&&<h2>简介</h2>}<MemberCareerFacts member={m} part="intro"/><MemberPhysicalFacts member={m}/>{(m.country||m.birthDate)&&<p>{[m.country,m.birthDate].filter(Boolean).join(' · ')}</p>}{m.role&&<p>{m.role}</p>}<p>{memberAffiliationLabel(m,content.groupId)}</p><button className="mf-button mf-person-return" onClick={()=>navigate({section:'members',member:null})}>返回成员库</button><Link className="mf-button" href={artistMemberUrl(m.id,returnTo)}>个人记录 <ArrowUpRight size={16}/></Link></div></div>{items.length>0?<><Title>关联作品</Title><div className="mf-person-scores" data-member-module="scores"><span>作品综合分 <b>{number(summary.composite)}</b></span><span>表现均分 <b>{number(summary.performanceMean)}</b></span><span>造型均分 <b>{number(summary.stylingMean)}</b></span></div><div className="mf-looks" data-member-module="works">{items.map(item=><article key={item.work.id}><MemberWorkIdentityPhoto work={item.work} memberId={m.id} label={memberDisplayName(m)+' · '+item.work.song} photo={item.photo} live={state.data?.mode==='live'} className={'mf-look-photo'+(item.photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')} onOpen={setLightbox}/><MvPhotoReference photo={item.photo} referencePhoto={item.referencePhoto} label={memberDisplayName(m)+' · '+item.work.song} live={state.data?.mode==='live'}/><a data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work,false,returnTo)}><h3>{item.work.song||item.work.name}<ArrowUpRight size={16}/></h3><p>表现 {number(item.performance)} · 造型 {number(item.styling)}</p></a></article>)}</div></>:null}<button className="mf-button" onClick={()=>navigate({section:'works',member:null})}>作品库</button>
{state.data&&<MemberPublicCredits memberId={m.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,returnTo)}>{label}</a>}/>}
<MemberCareerFacts member={m} part="history"/>
<MemberCareerFacts member={m} part="sources"/>

</section>;}
 const library=<><section className="mf-section mf-library"><Title en="WORKS">作品库</Title></section>{releases}<section className="mf-section mf-library"><Title count={filteredRows.length}>作品视频</Title><div className="mf-tools"><label><Search size={17}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={event=>navigate({search:event.target.value},true)}/></label><div className="mf-filters">{queues.map(([key,label])=><button key={key} aria-pressed={key===route.queue} onClick={()=>navigate({queue:key})}>{label}</button>)}</div></div><div className="mf-filters mf-kinds">{[['all','全部'],['mv','MV'],['performance','表演'],['special','特别视频']].map(([key,label])=><button key={key} aria-pressed={key===kind} onClick={()=>setKind(key)}>{label}</button>)}</div>{route.format!=='stage'&&<div className="mf-work-grid">{filteredRows.map(work=><WorkEntry key={work.id} work={work} returnTo={returnTo}/>)}</div>}{!filteredRows.length&&<p className="mf-empty">没有符合条件的作品。</p>}</section>{route.format!=='mv'&&<section className="mf-section mf-dark mf-stage-library"><Title count={stageRows.length}>舞台</Title><div className="mf-stage-grid">{stageRows.map(work=><WorkEntry key={work.id} work={work} stage returnTo={returnTo}/>)}</div>{!stageRows.length&&<p className="mf-empty">暂无符合条件的舞台。</p>}</section>}</>;
 return <ImageRecoveryProvider><div className={`meovv-figma${route.member?' mf-profile':''}${route.section==='works'?' mf-works-page':''}`}><header className="mf-header"><button className="mf-logo" aria-label="MEOVV 首页" onClick={()=>navigate({section:'overview',member:null})}><Picture src={MEOVV_LOGO} identityKey="meovv-logo" alt="MEOVV" complete priority/></button><button className="mf-button mf-profile-return" onClick={()=>navigate({section:'members',member:null})}>返回成员库</button><button ref={menuButton} className="mf-button mf-menu-button" aria-expanded={menuOpen} aria-controls="meovv-menu" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?'关闭':'菜单'}</button><nav id="meovv-menu" className={menuOpen?'is-open':''} aria-label="MEOVV 导航">{sections.map(([key,label])=><button key={key} aria-current={key===route.section?'page':undefined} onClick={()=>navigate({section:key,member:null,format:'all'})}>{label}</button>)}<Link className="mf-index-link" href="/?view=groups">团体索引 <ArrowUpRight size={14}/></Link></nav></header>{onHome&&<><section className="mf-hero"><Picture identityKey="meovv-industrial-city" src={MEOVV_HERO} alt="MEOVV 五人官方合照" priority/></section><div className="mf-hero-actions"><button className="mf-button" onClick={()=>navigate({section:'works',member:null})}>作品</button><button className="mf-button" onClick={()=>navigate({section:'members',member:null})}>成员</button></div></>}<main id="artist-content" className={onHome?'mf-main mf-home':'mf-main'}>{!onHome&&!route.member&&<div className="mf-page-back">{backHome}</div>}{state.loading?<div className="mf-empty" role="status">正在打开 MEOVV 档案…<a href="">重新加载当前页</a></div>:state.error?<div className="mf-empty" role="alert"><p>{state.error}</p><button className="mf-button" onClick={()=>timelineHostOptions.onRetry?timelineHostOptions.onRetry():window.location.reload()}>重新加载</button></div>:!collection?<div className="mf-empty">暂未找到团体资料。<Link href="/?view=groups">返回团体索引</Link></div>:route.member?member?memberPage(member):<div className="mf-empty">这个成员不在本团档案中。<button onClick={()=>navigate({section:'members',member:null})}>查看成员</button></div>:<>{onHome&&<>
<ArtistInformation slug="meovv"/>
{roster}
{releases}
<section className="mf-section mf-dark mf-featured"><div className="mf-title"><h2>MV</h2><button onClick={()=>navigate({section:'works',member:null})}>全部作品</button></div><div className="mf-featured-grid">{featured.map(work=><WorkEntry key={work.id} work={work} returnTo={returnTo} featured/>)}</div>{!featured.length&&<p className="mf-empty">重点作品暂未加载，已收录作品可在作品库查看。</p>}</section>
<div className="mf-dark">{timeline}</div>
</>}{route.section==='members'&&roster}{route.section==='works'&&library}{route.section==='updates'&&timeline}{route.section==='records'&&<>{releases}<section className="mf-section mf-records"><Title>发行档案</Title><div className="mf-record-list">{works.map(work=><Link key={work.id} href={artistWorkUrl(work,false,returnTo)}><time>{meovvDate(work.releaseDate)}</time><strong>{work.song||work.name}</strong><span>{work.version||work.videoType}</span><ArrowUpRight size={16}/></Link>)}</div></section></>}</>}</main><footer className={`mf-footer${onHome||route.section==='works'?' mf-dark':''}`}><span>MEOVV</span><Link href="/?view=groups">音乐档案 · 返回团体索引 <ArrowUpRight size={14}/></Link></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
