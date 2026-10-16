'use client';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore,type ComponentProps} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {ArrowLeft,ArrowUpRight,ImageIcon,Play,Search} from 'lucide-react';
import type {CatalogView as Catalog,Member,Photo,Work} from '@/lib/idol/types';
import {artistCollection,artistMemberUrl,artistRoute,artistRouteUrl,artistWorkRows,artistWorkUrl,artistWorkScoreLabel,type ArtistSection} from '@/lib/idol/artist-preview';
import {memberWorks,memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {videoId} from '@/lib/idol/values';
import type {ExpandedArtistContent} from './expanded-artist';
import {PhotoLightbox} from './photo-lightbox';
import {useArtistScroll} from './use-artist-scroll';

type StaycContent=ExpandedArtistContent&{releaseCoverage:{scope:string};featuredReleaseIds:string[];releaseVideoIds:Record<string,string[]>};
const path='/artists/stayc';
const sections:[ArtistSection,string][]=[['overview','概览'],['works','作品与舞台'],['members','成员'],['updates','官方动态'],['records','发行档案']];
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']];
const number=(v:number|null)=>v===null?'待评':v.toFixed(1);
const media=(p:Photo)=>`/api/media?table=${p.table}&record=${p.recordId}&index=${p.index}`;
const external=(url:string)=>safeGroupLink(url)??undefined;
function subscribe(fn:()=>void){window.addEventListener('popstate',fn);window.addEventListener('artist-location-change',fn);return()=>{window.removeEventListener('popstate',fn);window.removeEventListener('artist-location-change',fn);};}
function A({href,children,...props}:ComponentProps<'a'>){return href?<a href={href} {...props}>{children}</a>:<span>{children}</span>;}
function Picture(props:{src?:string|null;alt:string;priority?:boolean}){return <ImageWithFallback key={props.src} {...props}/>;}
function ImageWithFallback({src,alt,priority=false}:{src?:string|null;alt:string;priority?:boolean}){
 const [failed,setFailed]=useState(false);
 return src&&!failed?<img src={src} alt={alt} referrerPolicy="no-referrer" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} onError={()=>setFailed(true)}/>:<div className="sc-photo-empty"><ImageIcon size={22}/><span>{src?'图片暂未加载':'本 MV 个人造型图暂缺'}</span></div>;
}
function Heading({label,title,onMore}:{label:string;title:string;onMore?:()=>void}){return <div className="sc-heading"><div><small>{label}</small><h2>{title}</h2></div>{onMore&&<button onClick={onMore}>查看全部<ArrowUpRight size={14}/></button>}</div>;}
async function readCatalog(signal:AbortSignal){
 return catalogReadWithDeadline(async requestSignal=>{
 const r=await fetch('/api/catalog?artist=stayc&shape=display-v1',{cache:'no-store',signal:requestSignal});
 if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上你的资料库，请重试。');
 const d=await r.json() as Catalog;
 if(!d||!Array.isArray(d.groups)||!Array.isArray(d.members)||!Array.isArray(d.works)||!Array.isArray(d.ratings))throw new Error('资料暂时没有加载完整，请重试。');
 return d;
 },signal);
}
function WorkCard({work,returnTo}:{work:Work;returnTo:string}){
 const [failed,setFailed]=useState(false),id=videoId(work.url);
 return <article className="sc-work"><A href={artistWorkUrl(work,false,returnTo)}><div className="sc-work-thumb">{id&&!failed?<img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={`${work.song||work.name} 视频封面`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:<div className="sc-text-cover"><strong>{work.song||work.name}</strong><Play size={24}/></div>}</div><h3>{work.song||work.name}</h3><p>{[work.releaseDate,work.version||work.videoType].filter(Boolean).join(' · ')}</p><span className="sc-score">我的 MV 分 <b>{artistWorkScoreLabel(work.score)}{work.score===null?'':' / 10'}</b></span></A><div className="sc-work-actions"><A className="sc-button" href={artistWorkUrl(work,false,returnTo)}><Play size={13}/>观看与评分</A>{!!(work.stage||work.stageSupplement?.alternatives.length)&&<A className="sc-button" href={artistWorkUrl(work,true,returnTo)}>{work.stage?'看舞台':'其他现场'}<ArrowUpRight size={12}/></A>}</div></article>;
}
export default function StaycArtist({content}:{content:StaycContent}){
 const [data,setData]=useState<Catalog|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
 const url=useSyncExternalStore(subscribe,()=>window.location.href,()=>path),route=useMemo(()=>artistRoute(url),[url]),returnTo=artistRouteUrl(route,path),rememberScroll=useArtistScroll(!!data,url);
 const loadSequence=useRef(0),loadAbort=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{
  const sequence=++loadSequence.current;
  loadAbort.current?.abort();
  const controller=new AbortController();loadAbort.current=controller;
  setLoading(true);setError('');
  try{const d=await readCatalog(controller.signal);if(sequence===loadSequence.current)setData(d);}
  catch(e){if(sequence===loadSequence.current&&!controller.signal.aborted)setError((e as Error).message);}
  finally{if(sequence===loadSequence.current){setLoading(false);loadAbort.current=null;}}
 },[]);
 const cancelLoad=useCallback(()=>{loadSequence.current++;loadAbort.current?.abort();loadAbort.current=null;},[]);
 useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)void load();});return()=>{active=false;cancelLoad();};},[load,cancelLoad]);
 function retry(){void load();}
 function navigate(patch:Partial<ReturnType<typeof artistRoute>>,replace=false){rememberScroll();window.history[replace?'replaceState':'pushState'](null,'',artistRouteUrl({...route,...patch},path));window.dispatchEvent(new Event('artist-location-change'));if(!replace)document.getElementById('artist-content')?.scrollIntoView({block:'start'});}
 const collection=useMemo(()=>data?artistCollection(data,content.groupId):null,[data,content.groupId]);
 const members=collection?[...collection.members].sort((a,b)=>content.profile.members.indexOf(a.stageName)-content.profile.members.indexOf(b.stageName)):[];
 const member=members.find(m=>m.id===route.member);
 const select=(section:ArtistSection)=>{navigate({section,member:null,format:'all'});};
 const representative=collection?.works.find(w=>videoId(w.url)==='gMe1c4UegBY')??collection?.works.find(w=>!!w.url);
 const matchesFormat=(w:Work)=>route.format==='stage'?!!(w.stage||w.stageSupplement?.alternatives.length):route.format==='mv'?!!w.url:true;
 const rows=collection?artistWorkRows(collection.works,route.queue,route.search).filter(matchesFormat):[];
 const featured=content.featuredReleaseIds.map(id=>content.releases.find(r=>r.id===id)).filter((r):r is StaycContent['releases'][number]=>!!r);
 const releaseWorks=(releaseId:string)=>collection?.works.filter(w=>(content.releaseVideoIds[releaseId]??[]).includes(videoId(w.url)??''))??[];
 const visual=(m:Member)=>content.memberVisuals[m.stageName];
 function roster(){return <><div className="sc-roster">{members.map(m=><button key={m.id} data-artist-member-trigger={m.id} onClick={()=>navigate({section:'members',member:m.id})}><Picture src={visual(m)?.image} alt={m.stageName+' · '+content.portraitSet.label}/><strong><span className="member-display-name">{memberDisplayName(m)}</span><ArrowUpRight size={13}/></strong><small>{m.status||'成员档案'}</small></button>)}</div><p className="sc-credit">{content.portraitSet.label} · {content.portraitSet.date}</p></>;}
 function social(){return <section className="sc-social" aria-label="官方账号与粉丝数">{content.social.map(s=><A href={external(s.url)} key={s.platform} target="_blank" rel="noopener noreferrer"><small>{s.platform}<ArrowUpRight size={14}/></small><strong>{s.display||'暂无公开数字'}</strong><span>{s.metric} · {s.handle} · {s.observedAt.slice(0,10)}</span></A>)}</section>;}
 function news(){return <div className="sc-news">{content.updates.map(u=><A key={u.id} href={external(u.url)} target="_blank" rel="noopener noreferrer"><div className="sc-news-image"><Picture src={u.image} alt={u.title}/></div><time>{u.date} · {u.publisher}</time><h3>{u.title}</h3><p>{u.summary}</p><span>阅读官方动态<ArrowUpRight size={13}/></span></A>)}</div>;}
 function taste(){return collection&&<div className="sc-taste"><button onClick={()=>navigate({section:'works',queue:'tonight',member:null,search:''})}><small>接着发现</small><strong>{collection.pending.length} 支待看</strong><ArrowUpRight size={16}/></button><div><small>我的 MV 均分</small><strong>{number(collection.mv.mean)}</strong><span>{collection.mv.count} 支已评</span></div><div><small>我的舞台均分</small><strong>{number(collection.stage.mean)}</strong><span>{collection.stage.count} 支已评</span></div></div>;}
 function collectionFeature(){return <div className="sc-release-feature">{featured.map(r=><article key={r.id}><A href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="sc-album-cover"><Picture src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A>{releaseWorks(r.id).map(w=><div className="sc-release-song" key={w.id}><strong>MV · {w.song||w.name}</strong><span className="sc-score">我的 MV 分 <b>{artistWorkScoreLabel(w.score)}{w.score===null?'':' / 10'}</b></span><A className="sc-button" href={artistWorkUrl(w,false,returnTo)}>进入 MV<ArrowUpRight size={13}/></A></div>)}{!releaseWorks(r.id).length&&<A className="sc-button" href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer">发行介绍<ArrowUpRight size={13}/></A>}</article>)}</div>;}
 function records(compact=false){return <><p className="sc-scope">{content.releaseCoverage.scope}</p><div className="sc-release-feature">{(compact?content.releases.slice(0,3):content.releases).map(r=><article key={r.id}><A href={external(r.sourceUrl)} target="_blank" rel="noopener noreferrer"><div className="sc-album-cover"><Picture src={r.image} alt={r.title+' 官方发行封面'}/></div><h3>{r.title}</h3><p>{r.date} · {r.type}</p></A></article>)}</div><p className="sc-scope">销量与音乐节目一位暂未收录。</p></>;}
 function memberPage(m:Member){if(!data)return null;const items=memberWorks(data,m.id),s=memberWorkSummary(items);return <><button className="sc-back" onClick={()=>navigate({section:'members',member:null})}><ArrowLeft size={15}/>STAYC · 全部成员</button><section className="sc-member-hero"><figure><Picture src={visual(m)?.image} alt={m.stageName+' · '+content.portraitSet.label} priority/><figcaption>{content.portraitSet.label} · {content.portraitSet.date}</figcaption></figure><div><small className="sc-eyebrow">STAYC / MEMBER</small><h1><span className="member-display-name">{memberDisplayName(m)}</span></h1><MemberPhysicalFacts member={m}/><p>{[m.stageName,m.country,m.birthDate,m.status].filter(Boolean).join(' · ')}</p>{m.role&&<p>{m.role}</p>}<div className="sc-member-summary"><div><small>作品综合分</small><strong>{number(s.composite)}</strong><span>{s.ratedWorks} 支作品已评</span></div><div className="sc-dimensions"><div><small>表现均分</small><strong>{number(s.performanceMean)}</strong><span>{s.performanceCount} 支已评</span></div><div><small>造型均分</small><strong>{number(s.stylingMean)}</strong><span>{s.stylingCount} 支已评</span></div></div>{s.composite===null&&<p>表现和造型都有评分后，显示作品综合分。</p>}</div><A className="sc-button" href={artistMemberUrl(m.id,returnTo)}>个人档案与记录<ArrowUpRight size={14}/></A><div className="sc-member-social">{(m.social??[]).map(a=><A key={a.platform} href={external(a.url)} target="_blank" rel="noopener noreferrer"><span>{a.platform==='instagram'?'Instagram':a.platform==='x'?'X':a.platform==='youtube'?'YouTube':'TikTok'}<ArrowUpRight size={13}/></span>{a.countLabel&&<strong>{a.countLabel.replace(/followers/gi,'粉丝').replace(/subscribers/gi,'订阅')}</strong>}<small>{a.observedAt?'更新于 '+a.observedAt.slice(0,10):'粉丝数暂未收录'}</small></A>)}</div></div></section><Heading label="HER MV LOOKS" title="HER MV LOOKS"/><div className="sc-member-works">{items.map(x=><article key={x.work.id}><button type="button" className="sc-member-look member-mv-look" aria-haspopup="dialog" disabled={!x.photo} aria-label={'放大'+m.stageName+'在'+x.work.song+'的MV造型'} onClick={()=>x.photo&&setLightbox({src:media(x.photo),label:`${memberDisplayName(m)} · ${x.work.song} · ${x.work.version||'MV造型'}`})}><Picture src={x.photo?media(x.photo):undefined} alt={m.stageName+' · '+x.work.song+' MV造型'}/></button><A data-member-work-trigger={x.work.id} href={artistWorkUrl(x.work,false,returnTo)}><h3>{x.work.song||x.work.name}<ArrowUpRight size={14}/></h3><p>{x.work.version||x.work.videoType}</p><div><span>表现 <b>{number(x.performance)}</b></span><span>造型 <b>{number(x.styling)}</b></span></div></A></article>)}</div></>;}
 return <div className="stayc-artist"><header className="sc-header"><A className="sc-brand" href="/">STAGE</A><nav aria-label="网站导航"><A href="/">我的放映室</A><A href="/?view=works">作品库</A><A href="/?view=members">成员档案</A><A href="/?view=groups">团体索引</A></nav><small>仅自己可见</small></header>{!route.member&&<><section className="sc-hero"><A className="sc-crumb" href="/?view=groups"><ArrowLeft size={13}/>团体索引</A><h1>STAYC</h1><p className="sc-meta">HIGH UP ENTERTAINMENT / SEOUL / DEBUT {content.profile.debutDate}</p><div className="sc-hero-spread"><figure><Picture src={content.hero.image} alt={content.hero.caption} priority/></figure><div className="sc-encyclopedia"><h2>FRESH SOUND.<br/>YOUNG CULTURE.</h2><p>{content.profile.summary}</p><div className="sc-hero-actions">{representative&&<A className="sc-button primary" href={artistWorkUrl(representative,false,returnTo)}><Play size={14}/>从 {representative.song} 开始</A>}<A className="sc-official-link" href={external(content.profile.sourceUrl)} target="_blank" rel="noopener noreferrer">官方网站<ArrowUpRight size={13}/></A></div></div></div><p className="sc-credit">{content.hero.caption} · {content.hero.date}</p></section>{social()}<nav className="sc-tabs" aria-label="团体内容">{sections.map(([k,label])=><button key={k} aria-current={route.section===k?'page':undefined} onClick={()=>select(k)}>{label}</button>)}</nav></>}
 <main className="sc-content" id="artist-content">{loading&&!data?<div className="sc-empty" role="status">正在打开你的 STAYC 收藏…</div>:error?<div className="sc-empty" role="alert"><p>{error}</p><button className="sc-button" onClick={retry}>重新加载</button></div>:!collection?<div className="sc-empty">暂未找到团体资料。<A href="/?view=groups">返回团体索引</A></div>:route.member?(member?memberPage(member):<div className="sc-empty">这个成员不在 STAYC 档案中。<button onClick={()=>navigate({member:null,section:'members'})}>查看成员</button></div>):<>
 {route.section==='overview'&&<><section><Heading label="OFFICIAL NOTES / 最近发生的事" title="THE FRESH EDIT" onMore={()=>select('updates')}/>{news()}</section><section><Heading label="MEMBERS / 认识六种声音" title="SIX VOICES. ALL FRESH." onMore={()=>select('members')}/>{roster()}</section><section><Heading label="THE COLLECTION / 观看与评分" title="PRESS PLAY" onMore={()=>select('works')}/>{taste()}{collectionFeature()}</section><section className="sc-record-section"><Heading label="DISCOGRAPHY / 发行档案" title="THE RELEASE SHELF" onMore={()=>select('records')}/>{records(true)}</section></>}
 {route.section==='members'&&<section><Heading label="MEMBERS / 认识六种声音" title="SIX VOICES. ALL FRESH."/>{roster()}</section>}
 {route.section==='updates'&&<section><Heading label="OFFICIAL NOTES / 最近发生的事" title="THE FRESH EDIT"/>{news()}</section>}
 {route.section==='works'&&<section><Heading label={`${collection.works.length} 支收录作品`} title="PRESS PLAY"/><div className="sc-work-tools"><label><Search size={17}/><input aria-label="搜索本团作品" placeholder="搜索歌曲或版本" value={route.search} onChange={e=>navigate({search:e.target.value},true)}/></label><div className="sc-pills">{queues.map(([k,l])=><button key={k} aria-pressed={route.queue===k} onClick={()=>navigate({queue:k})}>{l}<span>{artistWorkRows(collection.works,k,route.search).filter(matchesFormat).length}</span></button>)}</div><div className="sc-pills" aria-label="播放内容">{([['all','全部'],['mv','MV'],['stage','可看舞台']] as const).map(([k,l])=><button key={k} aria-pressed={route.format===k} onClick={()=>navigate({format:k})}>{l}</button>)}</div></div><div className="sc-work-grid">{rows.map(w=><WorkCard key={w.id} work={w} returnTo={returnTo}/>)}</div>{!rows.length&&<div className="sc-empty"><p>没有符合条件的作品。</p><button className="sc-button" onClick={()=>navigate({queue:'all',search:'',format:'all'})}>查看全部作品</button></div>}</section>}
 {route.section==='records'&&<section><Heading label="DISCOGRAPHY / 发行档案" title="THE RELEASE SHELF"/>{records()}</section>}
 </>}</main><footer className="sc-footer"><strong>STAYC</strong><A href="/?view=groups">返回团体索引<ArrowUpRight size={14}/></A><small>STAGE · 私人观看与评分手帐</small></footer>{lightbox&&<PhotoLightbox {...lightbox} onClose={()=>setLightbox(null)}/>}</div>;
}
