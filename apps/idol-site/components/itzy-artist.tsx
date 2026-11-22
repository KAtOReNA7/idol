'use client';
import {MemberWorkIdentityPhoto} from '@/components/member-work-identity-photo';
import {followerAccountLabel} from '@/lib/idol/follower-count.mjs';
import {ArtistWorkPreview} from '@/components/app-image-presentation';
import {useCanEdit} from '@/components/public-access';
import {ArtistInformation} from '@/components/artist-information';
import {publicCustomArtistText,publicCustomArtistCaption} from '@/lib/idol/custom-artist-copy';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {ArtistTimelineHost,useArtistTimelineHostOptions} from './artist-timeline-host';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore,type ComponentProps} from 'react';
import {readArtistCatalog} from '@/lib/idol/catalog-read-deadline';
import {ArrowLeft,ArrowUpRight,ImageIcon,Play,Search} from 'lucide-react';
import type {CatalogView as Catalog,Member,Photo,Work} from '@/lib/idol/types';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkRows,artistWorkUrl,artistWorkScoreLabel,artistSalesTotals,type ArtistSection} from '@/lib/idol/artist-preview';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {videoId} from '@/lib/idol/values';
import type {ExpandedArtistContent} from './expanded-artist';
import {OriginalPhotoLink} from './original-photo-link';
import {PhotoSourceDisclosure} from './photo-source-disclosure';
import {PhotoLightbox} from './photo-lightbox';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from './reliable-image';
import {useArtistScroll} from './use-artist-scroll';

type ItzyPortrait=ExpandedArtistContent['memberVisuals'][string]&{recordId:string;identitySourceUrl:string;sourcePhotoUrl:string};
type ItzyContent=Omit<ExpandedArtistContent,'memberVisuals'>&{
 memberVisuals:Record<string,ItzyPortrait>;
 portraitPreviews?:Record<string,string>;
 supplementalReleases?:(ExpandedArtistContent['releases'][number]&{category:string})[];
 releaseCoverage:{scope:string};
};
const path='/artists/itzy';
const sections:[ArtistSection,string][]=[['overview','概览'],['works','作品与舞台'],['members','成员'],['updates','大事时间轴'],['records','发行与成绩']];
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
const number=(v:number|null)=>v===null?'待评':v.toFixed(1);
const media=(p:Photo)=>`/api/media?table=${p.table}&record=${p.recordId}&index=${p.index}`;
const external=(url:string)=>safeGroupLink(url)??undefined;
function subscribe(fn:()=>void){window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};}
function A({href,children,...props}:ComponentProps<'a'>){return href?<a href={href} {...props}>{children}</a>:<span>{children}</span>;}
function Picture({src,alt,priority=false,identityKey,width,height,missingLabel='暂无对应图片'}:{
 src?:string|null;alt:string;priority?:boolean;identityKey?:string;width?:number;height?:number;missingLabel?:string;
}){
 return <ReliableImage src={src} identityKey={identityKey??src??alt} alt={alt} width={width} height={height} priority={priority} referrerPolicy="no-referrer"
  missing={<div className="iz-photo-empty"><ImageIcon aria-hidden="true" size={22}/><span>{missingLabel}</span></div>}
  errorFallback={<div className="iz-photo-empty"><ImageIcon aria-hidden="true" size={22}/><span>图片暂未加载</span></div>}/>;
}
function Heading({label,title,onMore,primary=false}:{label:string;title:string;onMore?:()=>void;primary?:boolean}){const Title=primary?'h1':'h2';return <div className="iz-heading"><div><Title>{title}</Title>{label!==title&&<small>{label}</small>}</div>{onMore&&<button onClick={onMore}>查看全部<ArrowUpRight size={14}/></button>}</div>;}
function WorkCard({work,returnTo,stageOnly=false}:{work:Work;returnTo:string;stageOnly?:boolean}){
 const canEdit=useCanEdit();
 const title=work.song||work.name,hasStage=!!(work.stage||work.stageSupplement?.alternatives.length);
 const value=stageOnly?work.stageScore:work.score;
 const details=stageOnly?[work.stage?.publishedDate,work.stage?.title||(work.stage?'舞台':'其他现场')]:[work.releaseDate,work.version||work.videoType];
 return <article className="iz-work">
  <A href={artistWorkUrl(work,stageOnly,returnTo)} aria-label={title+(stageOnly?' · 观看舞台与评分':' · 观看 MV 与评分')}>
   <div className="iz-work-thumb"><ArtistWorkPreview work={work} stage={stageOnly}/></div>
   <h3>{title}</h3><p>{details.filter(Boolean).join(' · ')}</p>
   {canEdit&&<span className="iz-score">{stageOnly?'我的舞台分':'我的 MV 分'} <b>{artistWorkScoreLabel(value)}{value===null?'':' / 10'}</b></span>}
  </A>
  {hasStage&&!stageOnly&&<div className="iz-work-actions"><A href={artistWorkUrl(work,true,returnTo)} className="iz-button">
   {work.stage?'看舞台':'其他现场'}<ArrowUpRight aria-hidden="true" size={13}/>
  </A></div>}
 </article>;
}
export default function ItzyArtist({content}:{content:ItzyContent}){
 const timelineHostOptions=useArtistTimelineHostOptions();
 const canEdit=useCanEdit();
 const [fetchedData,setData]=useState<Catalog|null>(null),[fetchedError,setError]=useState(''),[fetchedLoading,setLoading]=useState(true),[year,setYear]=useState('all'),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const data=timelineHostOptions.catalog!==undefined?timelineHostOptions.catalog:fetchedData,loading=timelineHostOptions.loading??(timelineHostOptions.catalog!==undefined?false:fetchedLoading),error=timelineHostOptions.error??fetchedError;
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>timelineHostOptions.serverRoute??path),route=useMemo(()=>artistRoute(url),[url]),returnTo=artistRouteUrl(route,path),rememberScroll=useArtistScroll(!!data,url);
 const loadSequence=useRef(0),loadAbort=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{
  if(timelineHostOptions.catalog!==undefined)return;
  const sequence=++loadSequence.current;
  loadAbort.current?.abort();
  const controller=new AbortController();loadAbort.current=controller;
  setLoading(true);setError('');
  try{const d=await readArtistCatalog('itzy', controller.signal);if(sequence===loadSequence.current)setData(d);}
  catch(e){if(sequence===loadSequence.current&&!controller.signal.aborted)setError((e as Error).message);}
  finally{if(sequence===loadSequence.current){setLoading(false);loadAbort.current=null;}}
 },[timelineHostOptions.catalog]);
 const cancelLoad=useCallback(()=>{loadSequence.current++;loadAbort.current?.abort();loadAbort.current=null;},[]);
 useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)void load();});return()=>{active=false;cancelLoad();};},[load,cancelLoad]);
 function retry(){if(timelineHostOptions.onRetry){timelineHostOptions.onRetry();return;}void load();}
 function navigate(patch:Partial<ReturnType<typeof artistRoute>>,replace=false){rememberScroll();window.history[replace?'replaceState':'pushState'](newArtistHistoryState(window.history.state),'',artistRouteUrl({...route,...patch},path));window.dispatchEvent(new Event('artist-location-change'));if(!replace)document.getElementById('artist-content')?.scrollIntoView({block:'start'});}
 const collection=useMemo(()=>data?artistCollection(data,content.groupId):null,[data,content.groupId]);
 const members=collection?[...collection.members].sort((a,b)=>content.profile.members.indexOf(a.stageName)-content.profile.members.indexOf(b.stageName)):[];
 const member=members.find(m=>m.id===route.member);
 const select=(section:ArtistSection)=>{navigate({section,member:null,format:'all'});};
 const representative=collection?.works.find(w=>videoId(w.url)==='fE2h3lGlOsk')??collection?.works.find(w=>!!w.url);
 const matchesFormat=(w:Work)=>route.format==='stage'?!!(w.stage||w.stageSupplement?.alternatives.length):route.format==='mv'?!!w.url:true;
 const rows=collection?artistWorkRows(collection.works,route.queue,route.search).filter(matchesFormat):[];
 function visual(m:Member){
  const portrait=content.memberVisuals[m.stageName];
  if(!portrait?.image||portrait.recordId!==m.id)return undefined;
  return {...portrait,preview:content.portraitPreviews?.[portrait.image]??portrait.image};
 }
 function roster(){return <><div className="iz-roster">{members.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><Picture identityKey={'member:'+m.id} src={visual(m)?.preview} alt={m.stageName+' · '+content.portraitSet.label} width={1004} height={1280} missingLabel="成员资料照暂缺"/><strong><span className="member-display-name">{memberDisplayName(m)}</span><ArrowUpRight size={13}/></strong><small>{m.status||'成员档案'}</small></button>)}</div><p className="iz-credit">{publicCustomArtistCaption(content.portraitSet.label,content.portraitSet.date)}</p></>;}
 function news(){return <div className="iz-news">{content.updates.map(u=><A key={u.id} href={external(u.url)} target="_blank" rel="noopener noreferrer">{u.image&&<div className="iz-news-image"><Picture identityKey={'news:'+u.id} src={u.image} alt={u.title}/></div>}<time>{publicCustomArtistText(u.date)} · {u.publisher}</time><h3>{u.title}</h3><p>{publicCustomArtistText(u.summary)}</p><span>阅读官方内容<ArrowUpRight size={15}/></span></A>)}</div>;}
 function renderTimeline(){return <ArtistTimelineHost groupId={content.groupId} catalog={data} background={news()} loading={loading} error={error} onRetry={retry}/>;}
 function taste(){return canEdit&&collection&&<div className="iz-taste"><button onClick={()=>navigate({section:'works',queue:'tonight',member:null,search:''})}><small>接着发现</small><strong>{collection.pending.length} 支待看</strong><ArrowUpRight size={16}/></button><div><small>我的 MV 均分</small><strong>{number(collection.mv.mean)}</strong><span>{collection.mv.count} 支已评</span></div><div><small>我的舞台均分</small><strong>{number(collection.stage.mean)}</strong><span>{collection.stage.count} 支已评</span></div></div>;}
 function records(compact=false){
  if(content.wins===null&&!content.releases.some(r=>r.circle))return <div className="iz-record-pending"><div><small>SALES / 销量</small><h3>数据尚未收录</h3><p>{publicCustomArtistText(content.salesCoverage.scope)}</p></div><div><small>MUSIC SHOWS / 音乐节目</small><h3>暂无完整记录</h3><p>{publicCustomArtistText(content.winsCoverage.scope)}</p></div></div>;
  const releases=content.releases.filter(r=>r.circle&&(year==='all'||r.date.startsWith(year))),sales=artistSalesTotals(releases,year),wins=(content.wins??[]).filter(w=>year==='all'||w.date.startsWith(year));
  const years=[...new Set([...content.releases.map(r=>r.date.slice(0,4)),...(content.wins??[]).map(w=>w.date.slice(0,4))])].sort().reverse();
  return <><p className="iz-scope">销量按发行年份筛选，一位按获奖年份筛选。</p><div className="iz-pills" aria-label="成绩年份">{['all',...years].map(y=><button key={y} aria-pressed={year===y} onClick={()=>setYear(y)}>{y==='all'?'全部':y}</button>)}</div><div className="iz-record-columns"><section><small className="iz-eyebrow">SALES / CIRCLE</small><strong className="iz-total">{sales.copies===null?'暂无数据':sales.copies.toLocaleString('zh-CN')}</strong><h3>Circle 已公开数据合计</h3><p className="iz-scope">{publicCustomArtistText(content.salesCoverage.scope)} 统计于 {content.asOf}。</p>{(compact?releases.slice(0,1):releases).map(r=><article className="iz-sale-row" key={r.id}><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/><div><h4>{r.title}</h4><time>{r.date}</time><A href={external(r.circle!.sourceUrl)} target="_blank" rel="noopener noreferrer">Circle {r.circle!.copies?.toLocaleString('zh-CN')} 张<ArrowUpRight size={12}/></A>{r.hanteoFirstWeek&&<A href={external(r.hanteoFirstWeek.sourceUrl)} target="_blank" rel="noopener noreferrer">Hanteo 首周 {r.hanteoFirstWeek.copies.toLocaleString('zh-CN')} 张<ArrowUpRight size={12}/></A>}</div></article>)}{compact&&<button className="iz-button" onClick={()=>select('records')}>查看各发行成绩<ArrowUpRight size={13}/></button>}</section><section><small className="iz-eyebrow">MUSIC SHOWS</small><strong className="iz-total">{wins.length}<em> 次</em></strong><h3>韩国音乐节目一位 · 已收录</h3><p className="iz-scope">{publicCustomArtistText(content.winsCoverage.scope)}</p><div className="iz-win-table"><table><thead><tr><th>日期</th><th>歌曲</th><th>节目</th></tr></thead><tbody>{[...wins].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,compact?3:undefined).map(w=><tr key={w.id}><td>{w.date}</td><td>{w.song}</td><td><A href={external(w.sourceUrl)} target="_blank" rel="noopener noreferrer">{w.show}<ArrowUpRight size={11}/></A></td></tr>)}</tbody></table></div>{!wins.length&&<p className="iz-scope">这个年份暂无收录一位记录。</p>}{compact&&<button className="iz-button" onClick={()=>select('records')}>查看完整收录清单<ArrowUpRight size={13}/></button>}</section></div></>;
 }
 function memberPage(m:Member){
  if(!data)return null;
  const items=memberWorks(data,m.id),s=memberWorkSummary(items);
  const name=memberDisplayName(m),portrait=visual(m),photoLabel=name+' · '+(portrait?.label??'成员资料照');
  const openPortrait=(src:string)=>setLightbox({src,label:photoLabel});
  return <><button className="iz-back" onClick={()=>navigate({section:'members',member:null})}><ArrowLeft aria-hidden="true" size={15}/>ITZY · 全部成员</button>
  <section className="iz-member-hero" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity">
   <header className="iz-member-heading">
    <h1><span className="member-display-name">{name}</span></h1>
    <A className="iz-button iz-member-record" href={artistMemberUrl(m.id,returnTo)}>个人档案与记录<ArrowUpRight aria-hidden="true" size={14}/></A>
   </header>
   <figure className="iz-member-portrait">
    <OriginalPhotoLink className="iz-portrait-open" href={portrait?.image} aria-label={'放大'+name+'的资料照'} onOpen={openPortrait}>
     <Picture identityKey={'member:'+m.id} src={portrait?.preview} alt={photoLabel} width={1004} height={1280} missingLabel="成员资料照暂缺" priority/>
    </OriginalPhotoLink>
    {portrait&&<figcaption>
     <OriginalPhotoLink className="iz-original-link" href={portrait.image} aria-label={'查看'+name+'的原图'} onOpen={openPortrait}>查看原图</OriginalPhotoLink>
     <PhotoSourceDisclosure>
      <p>{portrait.label} · {content.portraitSet.copyright}</p>
      <A href={external(portrait.identitySourceUrl)} target="_blank" rel="noopener noreferrer">JYP 成员档案</A>
      <A href={external(portrait.sourcePhotoUrl)} target="_blank" rel="noopener noreferrer">JYP 照片原件</A>
     </PhotoSourceDisclosure>
    </figcaption>}
   </figure>
   <div data-member-module="basic">
    <p className="iz-member-facts">{[m.country,m.birthDate,m.status,m.role].filter(Boolean).join(' · ')}</p>
    <MemberPhysicalFacts member={m}/><MemberCareerFacts member={m} part="intro"/>
    <div className="iz-member-social">{(m.social??[]).map(a=><A key={a.platform} href={external(a.url)} target="_blank" rel="noopener noreferrer"><span>{a.platform==='instagram'?'Instagram':a.platform==='x'?'X':a.platform==='youtube'?'YouTube':'TikTok'}<ArrowUpRight size={13}/></span>{a.countLabel&&<strong>{followerAccountLabel(a)}</strong>}<small>{a.observedAt?'更新于 '+a.observedAt.slice(0,10):'粉丝数暂未收录'}</small></A>)}</div>
   </div>
  </section>
<div className="iz-member-summary" data-member-module="scores"><div><small>作品综合分</small><strong>{number(s.composite)}</strong><span>{s.ratedWorks} 支作品已评</span></div><div className="iz-dimensions"><div><small>表现均分</small><strong>{number(s.performanceMean)}</strong><span>{s.performanceCount} 支已评</span></div><div><small>造型均分</small><strong>{number(s.stylingMean)}</strong><span>{s.stylingCount} 支已评</span></div></div>{s.composite===null&&<p>表现和造型都有评分后，显示作品综合分。</p>}</div>
<Heading label="作品评分" title="成员影像"/><div className="iz-member-works" data-member-module="works">{items.map(x=><article key={x.work.id}><MemberWorkIdentityPhoto work={x.work} memberId={m.id} label={memberDisplayName(m)+' · '+x.work.song} photo={x.photo} live={data.mode==='live'} className="iz-member-look member-mv-look" onOpen={setLightbox} showMissing/><A data-member-work-trigger={x.work.id} href={artistWorkUrl(x.work,false,returnTo)}><h3>{x.work.song||x.work.name}<ArrowUpRight size={14}/></h3><p>{x.work.version||x.work.videoType}</p><div><span>表现 <b>{number(x.performance)}</b></span><span>造型 <b>{number(x.styling)}</b></span></div></A>{!!(x.work.stage||x.work.stageSupplement?.alternatives.length)&&<A className="iz-button" data-member-work-trigger={x.work.id+':stage'} href={artistWorkUrl(x.work,true,returnTo)}>{x.work.stage?'看舞台':'其他现场'}<ArrowUpRight size={13}/></A>}</article>)}</div>
<MemberPublicCredits memberId={m.id} data={data} renderLink={(work,label)=><A href={artistWorkUrl(work,false,returnTo)}>{label}</A>}/>
<MemberCareerFacts member={m} part="history"/>
<MemberCareerFacts member={m} part="sources"/>
</>;}
 return <ImageRecoveryProvider><div className="itzy-artist"><a className="iz-skip" href="#artist-content">跳至内容</a><header className="iz-header"><A className="iz-brand" href="/">STAGE</A><nav aria-label="网站导航"><A href="/">我的放映室</A><A href="/?view=works">作品库</A><A href="/?view=members">成员档案</A><A href="/?view=groups">团体索引</A></nav></header>{!route.member&&<>
 {route.section==='overview'&&<section className="iz-hero">
  <A className="iz-crumb" href="/?view=groups"><ArrowLeft aria-hidden="true" size={13}/>团体索引</A>
  <div className="iz-official-hero">
   <figure className="iz-hero-image"><Picture identityKey={'hero:'+content.groupId} src={content.hero.image} alt={publicCustomArtistText(content.hero.caption)} priority/></figure>
   <div className="iz-official-intro">
    <h1><img className="iz-official-logo" src="/artist/itzy/identity/official-logo.png" alt="ITZY" width={811} height={509}/></h1>
    <p className="iz-debut">{content.profile.company} · {content.profile.debutDate}</p>
    <p data-home-introduction="itzy"><span className="group-intro-label">团体介绍</span>{publicCustomArtistText(content.profile.summary)}</p>
    <div className="iz-hero-actions">
     {representative&&<A className="iz-button primary" href={artistWorkUrl(representative,false,returnTo)}><Play aria-hidden="true" size={14}/>播放 {representative.song}</A>}
     <A href={external(content.profile.sourceUrl)} target="_blank" rel="noopener noreferrer">官方档案 <ArrowUpRight aria-hidden="true" size={14}/></A>
    </div>
   </div>
  </div>
  <p className="iz-credit">{publicCustomArtistCaption(content.hero.caption,content.hero.date)}</p>
 </section>}
 <nav className="iz-tabs" aria-label="团体内容">{sections.map(([k,label])=><button key={k} aria-current={route.section===k?'page':undefined} onClick={()=>select(k)}>{label}</button>)}</nav></>}
 <main className="iz-content" id="artist-content" tabIndex={-1}>{loading&&!data?<div className="iz-empty" role="status">正在打开你的 ITZY 收藏…</div>:error?<div className="iz-empty" role="alert"><p>{error}</p><button className="iz-button" onClick={retry}>重新加载</button></div>:!collection?<div className="iz-empty">暂未找到团体资料。<A href="/?view=groups">返回团体索引</A></div>:route.member?(member?memberPage(member):<div className="iz-empty">这个成员不在 ITZY 档案中。<button onClick={()=>navigate({member:null,section:'members'})}>查看成员</button></div>):<>
 {route.section==='overview'&&<>
<ArtistInformation slug="itzy" catalog={data}/>
<section><Heading label="MEMBERS" title="成员" onMore={()=>select('members')}/>{roster()}</section>
<section className="iz-listen-first"><Heading label="VIDEO" title="MV 与舞台" onMore={()=>select('works')}/>{taste()}<div className="iz-work-grid">{collection.works.slice(0,3).map(w=><WorkCard key={w.id} work={w} returnTo={returnTo}/>)}</div></section>
<section><Heading label="RELEASES" title="专辑与发行"/><p className="iz-scope">{publicCustomArtistText(content.releaseCoverage.scope)}</p><div className="iz-discography">{content.releases.slice(0,3).map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>
<section><Heading label="TIMELINE" title="大事时间轴" onMore={()=>select('updates')}/>{renderTimeline()}</section>
<section className="iz-record-section"><Heading label="RECORDS" title="销量与音乐节目" onMore={()=>select('records')}/>{records(true)}</section>
</>}
 {route.section==='members'&&<section><Heading primary label="MEMBERS" title="成员"/>{roster()}</section>}
 {route.section==='updates'&&<section><Heading primary label="TIMELINE" title="大事时间轴"/>{renderTimeline()}</section>}
 {route.section==='works'&&<section><Heading primary label={`${collection.works.length} 支收录作品`} title="作品与舞台"/><div className="iz-work-tools"><label><Search size={17}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label><div className="iz-pills">{queues.map(([k,l])=><button key={k} aria-pressed={route.queue===k} onClick={()=>navigate({queue:k})}>{l}<span>{artistWorkRows(collection.works,k,route.search).filter(matchesFormat).length}</span></button>)}</div><div className="iz-pills" aria-label="播放内容">{([['all','全部'],['mv','MV'],['stage','可看舞台']] as const).map(([k,l])=><button key={k} aria-pressed={route.format===k} onClick={()=>navigate({format:k})}>{l}</button>)}</div></div><div className="iz-work-grid">{rows.map(w=><WorkCard key={w.id} work={w} returnTo={returnTo} stageOnly={route.format==='stage'}/>)}</div>{!rows.length&&<div className="iz-empty"><p>没有符合条件的作品。</p><button className="iz-button" onClick={()=>navigate({queue:'all',search:'',format:'all'})}>查看全部作品</button></div>}</section>}
 {route.section==='records'&&<><section><Heading primary label="RECORDS" title="销量与音乐节目"/>{records()}</section><section><Heading label="RELEASES" title="专辑与发行"/><p className="iz-scope">{publicCustomArtistText(content.releaseCoverage.scope)}</p><div className="iz-discography">{content.releases.map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>{(content.supplementalReleases??[]).some(r=>r.category==='solo')&&<section><Heading label="成员个人发行" title="成员个人发行"/><div className="iz-discography">{(content.supplementalReleases??[]).filter(r=>r.category==='solo').map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>}{(content.supplementalReleases??[]).some(r=>r.category==='collaboration')&&<section><Heading label="合作发行" title="合作发行"/><div className="iz-discography">{(content.supplementalReleases??[]).filter(r=>r.category==='collaboration').map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>}{(content.supplementalReleases??[]).some(r=>r.category==='soundtrack')&&<section><Heading label="原声带" title="原声带"/><div className="iz-discography">{(content.supplementalReleases??[]).filter(r=>r.category==='soundtrack').map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>}{(content.supplementalReleases??[]).some(r=>r.category==='version')&&<section><Heading label="特别版本与混音" title="特别版本与混音"/><div className="iz-discography">{(content.supplementalReleases??[]).filter(r=>r.category==='version').map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>}{(content.supplementalReleases??[]).some(r=>r.category==='special_single')&&<section><Heading label="特别单曲" title="特别单曲"/><div className="iz-discography">{(content.supplementalReleases??[]).filter(r=>r.category==='special_single').map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>}{(content.supplementalReleases??[]).some(r=>r.category==='video_release')&&<section><Heading label="演唱会影像" title="演唱会影像"/><div className="iz-discography">{(content.supplementalReleases??[]).filter(r=>r.category==='video_release').map(r=><A key={r.id} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="iz-album-cover"><Picture identityKey={'release:'+r.id} src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>)}</div></section>}{!!content.upcoming.length&&<section><Heading label="UPCOMING / 即将发行" title="即将发行"/><div className="iz-discography">{content.upcoming.map(r=><A key={r.title} href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><h3>{r.title}</h3><p>{r.date} · 即将发行</p></A>)}</div></section>}</>}
 </>}</main><footer className="iz-footer"><strong>ITZY</strong><A href="/?view=groups">返回团体索引<ArrowUpRight size={14}/></A><small>STAGE · 私人观看与评分手帐</small></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
