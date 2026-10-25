'use client';
import {ArtistInformation} from '@/components/artist-information';

import {useEffect,useLayoutEffect,useMemo,useRef,useState,useSyncExternalStore,type MouseEvent,type ReactNode} from 'react';
import archive from '@/data/genblue-bluecut.json';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import type {CatalogView} from '@/lib/idol/types';
import {GENBLUE_PATH,genblueMediaEvidence,genblueMemberMedia,genblueMediaMembers,genblueDefaultRoute,genblueTimelineEntries,isGenblueCatalog,genblueReturnPath,readGenblueLinkFocus,genblueHref,genblueMemberHref,genblueMemberRecordHref,genblueMediaHref,genblueMediaMatches,genblueRecordHref,genblueReleaseHref,genblueScoreLabel,readGenblueRoute,resolveGenblueMedia,resolveGenblueMember,type GenblueMedia,type GenblueRelease} from '@/lib/idol/genblue-bluecut';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls} from '@/components/reliable-image';
import './bluecut.css';

const nav=[['overview','首页'],['members','成员'],['works','作品'],['updates','时间轴']] as const;
const queues=[['all','全部影像'],['tonight','待看'],['unrated','看过待评分'],['rewatch','高分重温']] as const;
function subscribe(listener:()=>void){addEventListener('popstate',listener);addEventListener('artist-location-change',listener);return()=>{removeEventListener('popstate',listener);removeEventListener('artist-location-change',listener);};}
function canLeave(){
  if(document.querySelector('[aria-modal="true"],dialog[open]'))return false;
  if(document.querySelector('[data-navigation-blocked="true"]')){window.alert('本次保存还未确认，请留在当前作品等待或核对保存结果。');return false;}
  return !document.querySelector('[data-dirty="true"]')||window.confirm('还有未保存的评分或备注。确定离开吗？');
}
function Picture({src,alt,identity,priority=false,className='',style}:{src:string;alt:string;identity:string;priority?:boolean;className?:string;style?:React.CSSProperties}){
  return <ReliableImage className={className} src={src} alt={alt} identityKey={identity} priority={priority} style={style} errorFallback={<div className="gb-image-error">图片暂时无法加载，可在图片恢复中重试</div>}/>;
}
function Heading({index,title,subtitle}:{index:string;title:string;subtitle?:string}){return <><header className={`gb-page-heading gb-heading-${index}${index==='02'||index==='04'?' is-directory':''}`}><p className="gb-kicker">{index} / GENBLUE</p><h1>{title}</h1><div className="gb-heading-divider"/></header>{subtitle&&<p className="gb-subtitle">{subtitle}</p>}</>;}
function linkFocusTarget(url:string){
  const saved=readGenblueLinkFocus(history.state?.genblueLinkFocus,url);
  if(!saved)return null;
  return [...document.querySelectorAll<HTMLAnchorElement>('[data-genblue-link-trigger]')].find(node=>node.dataset.genblueLinkTrigger===saved.key&&node.getAttribute('href')===saved.href&&node.getAttribute('aria-disabled')!=='true'&&!node.closest('[inert]'))??null;
}
/** Keep return focus through a late catalog render, but relinquish it on user input or another focus target. */
export function useGenblueLinkReturnFocus(url:string){
  const previous=useRef<string|null>(null);
  const ownership=useRef<{path:string;href:string;key:string;node:HTMLAnchorElement|null}|null>(null);
  useLayoutEffect(()=>{
    if(previous.current!==url){
      previous.current=url;
      const saved=readGenblueLinkFocus(history.state?.genblueLinkFocus,url);
      ownership.current=saved?{...saved,node:null}:null;
    }
    const saved=ownership.current;
    if(!saved)return;
    const frame=requestAnimationFrame(()=>{
      if(ownership.current!==saved||document.querySelector('[aria-modal="true"],dialog[open]'))return;
      // A same-route rerender may replace nested links after catalog loading. Do not steal existing focus.
      if(saved.node&&(saved.node.isConnected||document.activeElement!==document.body))return;
      const current=readGenblueLinkFocus(history.state?.genblueLinkFocus,url);
      if(!current||current.key!==saved.key||current.href!==saved.href){ownership.current=null;return;}
      const target=linkFocusTarget(url);
      if(target){saved.node=target;target.focus({preventScroll:true});}
    });
    return()=>cancelAnimationFrame(frame);
  });
  useLayoutEffect(()=>{
    const cancel=()=>{ownership.current=null;};
    const focus=(event:FocusEvent)=>{
      const saved=ownership.current;
      if(!saved||event.target===saved.node)return;
      // Removing the old node may move focus to BODY; that is the one automatic move we repair.
      if(event.target===document.body&&saved.node&&!saved.node.isConnected)return;
      cancel();
    };
    const events=['pointerdown','keydown','wheel','touchstart'];
    events.forEach(name=>document.addEventListener(name,cancel,true));document.addEventListener('focusin',focus,true);
    return()=>{events.forEach(name=>document.removeEventListener(name,cancel,true));document.removeEventListener('focusin',focus,true);ownership.current=null;previous.current=null;};
  },[]);
}

export default function GenblueBluecutExperience(){
  const host=useArtistTimelineHostOptions();
  const url=useSyncExternalStore(subscribe,()=>location.pathname+location.search+location.hash,()=>host.serverRoute??GENBLUE_PATH);
  const route=useMemo(()=>readGenblueRoute(url),[url]);
  const returnTo=genblueHref(route),rememberScroll=useArtistScroll(true,url);
  useGenblueLinkReturnFocus(url);
  useEffect(()=>{if(route.section==='updates'&&route.event&&!linkFocusTarget(url)){const frame=requestAnimationFrame(()=>{const target=document.getElementById(route.event!);target?.scrollIntoView({block:'start',behavior:'instant'});target?.focus({preventScroll:true});});return()=>cancelAnimationFrame(frame);}},[route.section,route.event,route.year,url]);
  const [attempt,setAttempt]=useState(0);
  const [read,setRead]=useState<{data:CatalogView|null;loading:boolean;error:string}>({data:null,loading:true,error:''});
  const state=host.catalog!==undefined?{data:host.catalog,loading:host.loading??false,error:host.error??''}:read;
  useEffect(()=>{
    if(host.catalog!==undefined)return;
    const controller=new AbortController();
    setRead({data:null,loading:true,error:''});
    void catalogReadWithDeadline(async signal=>{
      const response=await fetch('/api/catalog?artist=genblue&shape=display-v1',{cache:'no-store',signal});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('资料库暂时未能连接。');
      const data=await response.json() as CatalogView;
      if(!isGenblueCatalog(data))throw new Error('资料库尚未读取完整。');
      return data;
    },controller.signal).then(data=>{if(!controller.signal.aborted)setRead({data,loading:false,error:''});},error=>{if(!controller.signal.aborted)setRead({data:null,loading:false,error:error instanceof Error?error.message:'资料库暂时不可用。'});});
    return()=>controller.abort();
  },[host.catalog,attempt]);
  function navigate(href:string,replace=false,scroll=true,focusKey?:string){
    if(!canLeave())return;
    if(href===location.pathname+location.search)return;
    rememberScroll();
    const source={...history.state};delete source.genblueLinkFocus;
    const focus=readGenblueLinkFocus({path:returnTo,href,key:focusKey},returnTo);
    if(focus)source.genblueLinkFocus=focus;
    history.replaceState(source,'',location.href);
    const next=newArtistHistoryState(source);delete next.genblueOrigin;delete next.genblueLinkFocus;const target=readGenblueRoute(href);if(!replace&&target.valid&&(target.member||target.release||target.media))next.genblueOrigin={path:href,from:returnTo};history[replace?'replaceState':'pushState'](next,'',href);dispatchEvent(new Event('artist-location-change'));
    if(scroll){window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.getElementById('genblue-main')?.focus({preventScroll:true}));}
  }
  function localLink(event:MouseEvent<HTMLAnchorElement>,href:string,focusKey?:string){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate(href,false,true,focusKey);}
  function Link({href,children,className='',label,memberId,focusKey}:{href:string;children:ReactNode;className?:string;label?:string;memberId?:string;focusKey?:string}){return <a href={href} className={className} aria-label={label} data-artist-member-trigger={memberId} data-genblue-link-trigger={focusKey} onClick={e=>localLink(e,href,focusKey)}>{children}</a>;}
  function BackLink({fallback,label}:{fallback:string;label:string}) {
    const origin=typeof history!=='undefined'?genblueReturnPath(history.state?.genblueOrigin,url):null;
    const destination=origin?readGenblueRoute(origin):null;
    const text=destination?.section==='updates'?'返回时间轴':destination?.release?'返回发行':label;
    return <div className="gb-return"><a className="gb-button gb-quiet gb-back" href={origin??fallback} onClick={event=>{
      if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();if(!canLeave())return;
      if(origin&&genblueReturnPath(history.state?.genblueOrigin,location.pathname+location.search)===origin&&history.length>1){rememberScroll();history.back();}else navigate(fallback);
    }}>← {text}</a></div>;
  }
  function RecordLink({media}:{media:GenblueMedia}){
    const href=genblueRecordHref(state.data,media,returnTo), binding=resolveGenblueMedia(state.data,media);
    return <div className="gb-record"><a className={'gb-button'+(!href?' is-disabled':'')} href={href??undefined} aria-disabled={!href} onClick={event=>{
      const current=genblueRecordHref(state.data,media,genblueHref(readGenblueRoute(location.pathname+location.search)));
      if(!href||current!==href||genblueHref(readGenblueRoute(location.pathname+location.search))!==returnTo||!canLeave()){event.preventDefault();return;}
      rememberScroll();
    }}>{href?'前往观看与评分 ↗':'记录入口暂不可用'}</a>{binding?<p className="gb-muted">我的{media.kind==='stage'?'舞台':' MV '}分 · {genblueScoreLabel(binding.score)}{state.data?.mode==='snapshot'?'（存档）':''}</p>:<p className="gb-muted">{state.loading?'正在核对原生作品记录…':'此版本的原生记录尚未确认，不显示或借用其他版本的评分。'}</p>}</div>;
  }
  function MemberCard({member}:{member:typeof archive.members[number]}){return <Link href={genblueMemberHref(member.id,route)} memberId={member.id} className="gb-member-card"><Picture src={member.portrait} alt={`${member.cnName} / ${member.stageName} 官方完整成员资料卡`} identity={'genblue-member:'+member.id}/><div className="gb-member-names"><h3>{member.cnName}</h3><span>{member.stageName.toUpperCase()}</span></div><p>成员资料卡</p></Link>;}
  function Roster(){const query=route.section==='members'?route.search.trim().toLowerCase():'';const members=archive.members.filter(m=>`${m.cnName} ${m.stageName}`.toLowerCase().includes(query));return <div className="gb-roster">{members.map(m=><MemberCard key={m.id} member={m}/>)}{!members.length&&<div className="gb-empty">没有匹配的成员。<button onClick={()=>navigate(genblueHref({search:''},route),true,false)}>清除搜索</button></div>}</div>;}
  function ReleaseRow({release,small=false}:{release:GenblueRelease;small?:boolean}){return <Link href={genblueReleaseHref(release.key,route)} focusKey={'release:'+release.key} className={'gb-release-row'+(small?' is-small':'')}><Picture src={release.cover} alt={`${release.title} ${release.historical?'历史九人版本':'发行'}封面`} identity={'genblue-release:'+release.key}/><div><h3>{release.title}</h3>{release.date&&<time>{release.date}</time>}<span className="gb-text-link">查看发行 ↗</span></div></Link>;}
  function VideoRow({media}:{media:GenblueMedia}){const evidence=genblueMediaEvidence(media);return <Link href={genblueMediaHref(media,route)} focusKey={'media:'+media.key} className={"gb-video-row"+(evidence?" has-preview":"")}>{evidence?<Picture className="gb-video-thumb" src={evidence.image.src} alt={evidence.image.alt} identity={"genblue-video:"+media.videoId}/>:<span className="gb-video-kind">{media.kind.toUpperCase()}</span>}<div><h3>{media.title}</h3><p>{media.typeLabel}</p>{media.date&&<time>{media.date}</time>}<p>{evidence?evidence.image.caption:"视频预览暂缺"}</p></div></Link>;}
  function Timeline({compact=false}:{compact?:boolean}){return <ol className="gb-timeline">{genblueTimelineEntries(compact?genblueDefaultRoute:route).slice(0,compact?2:undefined).map(event=>{const release=archive.releases.find(r=>r.key===event.releaseKey);return <li key={event.id} id={event.id} tabIndex={-1}><time>{event.date}</time><h3>{event.title}</h3>{release&&<Link className="gb-button gb-quiet" focusKey={'event-release:'+event.id} href={genblueReleaseHref(release.key)}>{release.title} ↗</Link>}{!compact&&archive.media.filter(m=>event.workIds.some(id=>id===m.workId)&&m.releaseKey===event.releaseKey).map(m=><Link key={m.key} className="gb-event-media" focusKey={'event-media:'+event.id+':'+m.key} href={genblueMediaHref(m)}>{m.title} · {m.typeLabel}</Link>)}</li>;})}</ol>;}
  function Home(){const focus=archive.releases.find(r=>r.key==='genblue-cococo-korea')!;return <>
<section className="gb-hero"><div className="gb-hero-type"><h1>GEN<br/>BLUE</h1><h2>幻蓝小熊</h2><p>{archive.company}</p><Link className="gb-button" href={genblueHref({section:'members'})}>认识成员 ↗</Link></div><Picture priority src={archive.hero} alt="GENBLUE 官方团体资料图，完整构图" identity="genblue-hero"/></section>
<ArtistInformation slug="genblue"/>
<section className="gb-section"><h2>成员</h2><Roster/></section>
<section className="gb-section"><h2>发行作品</h2><div className="gb-release-focus"><div className="gb-feature-release"><Link href={genblueReleaseHref(focus.key)} focusKey={'feature-cover:'+focus.key}><Picture src={focus.cover} alt="COCOCO 发行封面" identity="genblue-release:genblue-cococo-korea"/></Link><h3>COCOCO</h3><time>{focus.date}</time><Link className="gb-button" href={genblueReleaseHref(focus.key)} focusKey={'feature-action:'+focus.key}>查看发行 ↗</Link></div><div className="gb-focus-list">{archive.releases.filter(r=>r.key!==focus.key).map(r=><ReleaseRow key={r.key} release={r} small/>)}</div></div></section>
<section className="gb-section"><h2>影像</h2><div className="gb-video-list">{archive.media.slice(0,2).map(m=><VideoRow key={m.key} media={m}/>)}</div></section>
<section className="gb-section"><h2>时间轴</h2><Timeline compact/><Link className="gb-button gb-quiet" href={genblueHref({section:'updates'})}>完整时间轴 ↗</Link></section>
</>;}
  function MemberDetail(){const m=archive.members.find(m=>m.id===route.member);if(!m)return <div className="gb-empty">这个成员不在本团档案中。</div>;const record=genblueMemberRecordHref(state.data,m.id,returnTo),works=genblueMemberMedia(state.data,m.id);return <>
    <BackLink fallback={genblueHref({section:'members',search:route.search})} label="返回成员"/><Heading index="03" title={m.cnName} subtitle={m.stageName.toUpperCase()}/>
    <section className="gb-member-detail"><Picture priority src={m.portrait} alt={`${m.cnName} / ${m.stageName} 官方完整资料卡`} identity={'genblue-member:'+m.id}/><div className="gb-member-bio">{m.role&&<h2>{m.role}</h2>}<p>{m.profile}</p>{m.country&&<p className="gb-fact">国籍　{m.country}</p>}{m.birthDate&&<p className="gb-fact">出生日期　{m.birthDate}</p>}<small>成员资料卡</small>{record&&<a className="gb-text-link" href={record} onClick={e=>{if(genblueMemberRecordHref(state.data,m.id,genblueHref(readGenblueRoute(location.pathname+location.search)))!==record||genblueHref(readGenblueRoute(location.pathname+location.search))!==returnTo||!canLeave())e.preventDefault();else rememberScroll();}}>个人档案与记录 ↗</a>}</div></section>
    {works.length>0&&<section className="gb-section"><h2>参与的 MV</h2><div className="gb-video-list">{works.map(({media,record})=><div key={media.key}><VideoRow media={media}/>{record?<p className="gb-muted">表现 {genblueScoreLabel(record.performance)} · 造型 {genblueScoreLabel(record.styling)}</p>:<p className="gb-muted">成员参与信息来自 MV 报道，尚无个人评分记录。</p>}</div>)}</div></section>}
    <section className="gb-section"><h2>继续认识成员</h2><div className="gb-next-members">{archive.members.filter(member=>member.id!==m.id).slice(0,2).map(member=><Link key={member.id} href={genblueMemberHref(member.id,route)}>{member.cnName} / {member.stageName}</Link>)}</div><Link className="gb-button gb-quiet" href={genblueHref({section:'members'})}>全部成员 ↗</Link></section>
  </>;}
  function Library(){const releases=archive.releases.filter(r=>r.title.toLowerCase().includes(route.search.trim().toLowerCase()));const media=archive.media.filter(m=>genblueMediaMatches(state.data,m,route));return <><Heading index="04" title="作品"/><nav className="gb-library-tabs" aria-label="作品类型">{([['all','发行'],['mv','MV'],['stage','舞台']] as const).map(([format,label])=><Link key={format} className={route.format===format?'is-active':''} href={genblueHref({format,media:null,release:null},route)}>{label}</Link>)}</nav><div className="gb-library-tools"><label htmlFor="gb-work-search">寻找发行或影像</label><input id="gb-work-search" value={route.search} placeholder="搜索歌曲或版本" onChange={e=>navigate(genblueHref({search:e.target.value},route),true,false)}/></div>{route.format==='all'&&route.queue==='all'&&<div className="gb-release-index">{releases.map(r=><ReleaseRow key={r.key} release={r}/>)}{!releases.length&&<p className="gb-empty">没有符合条件的发行。</p>}</div>}<section className="gb-section"><h2>{route.format==='all'?'MV 与舞台':route.format==='mv'?'MV':'舞台'}</h2><div className="gb-queues" aria-label="观看队列">{queues.map(([queue,label])=><button key={queue} aria-pressed={route.queue===queue} onClick={()=>navigate(genblueHref({queue},route),true,false)}>{label}</button>)}</div>{route.queue!=='all'&&<p className="gb-muted">按当前影像类型的评分筛选；观看标记沿用整首作品的共同记录。</p>}<div className="gb-video-list">{media.map(m=><VideoRow key={m.key} media={m}/>)}</div>{!media.length&&<p className="gb-empty">{state.loading&&route.queue!=='all'?'正在读取观看记录…':'没有符合条件的影像。'}</p>}</section></>;}
  function ReleaseDetail(){const release=archive.releases.find(r=>r.key===route.release);if(!release)return <p className="gb-empty">未找到这个发行档案。</p>;const related=archive.media.filter(m=>m.releaseKey===release.key);return <><BackLink fallback={genblueHref({section:'works',search:route.search})} label="返回作品"/><Heading index="05" title={release.title}/><section className="gb-release-detail"><Picture priority src={release.cover} alt={`${release.title} ${release.historical?'历史九人版本':'发行'}封面`} identity={'genblue-release:'+release.key} style={{maxWidth:release.maxWidth}}/><div><p className="gb-release-date">{release.date||'发行日期尚未确认'}</p>{related.length?<><Link className="gb-button" href={genblueMediaHref(related[0])} focusKey={'release-primary:'+release.key}>查看关联作品与评分 ↗</Link><p className="gb-muted">发行档案不是独立评分记录，请进入对应 MV 或舞台。</p></>:<p className="gb-empty">尚无精确关联的原生作品记录；此发行档案暂不提供评分。</p>}{release.historical&&<p className="gb-muted">For You 保留历史九人封面，不代表当前六人成员名册。</p>}{release.maxWidth===160&&<p className="gb-muted">现有封面为 200 × 200 原图，仅作小尺寸预览。</p>}<a className="gb-text-link" href={release.sourceUrl} target="_blank" rel="noopener noreferrer">发行资料来源 ↗</a></div></section><section className="gb-section"><h2>相关影像</h2><div className="gb-video-list">{related.map(m=><VideoRow key={m.key} media={m}/>)}</div>{!related.length&&<p className="gb-muted">暂无精确绑定的 MV 或舞台。</p>}</section></>;}
  function MediaDetail(){const media=archive.media.find(m=>m.key===route.media&&m.kind===route.format);if(!media)return <p className="gb-empty">未找到这个影像版本。</p>;const release=archive.releases.find(r=>r.key===media.releaseKey),evidence=genblueMediaEvidence(media);return <><BackLink fallback={genblueHref({section:'works',format:route.format,search:route.search,queue:route.queue})} label="返回作品"/><Heading index={media.kind==='stage'?'07':'06'} title={media.title}/><p className="gb-media-type">{media.typeLabel}</p>{media.date&&<time className="gb-muted">{media.date}</time>}<section className="gb-video-panel">{evidence?<figure className="gb-video-photo"><a href={evidence.image.src} target="_blank" rel="noopener noreferrer" aria-label="打开完整 MV 宣传照"><Picture src={evidence.image.src} alt={evidence.image.alt} identity={"genblue-video:"+media.videoId}/></a><figcaption>{evidence.image.caption} · <a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer">图片与成员来源 ↗</a></figcaption></figure>:<p>视频预览暂缺</p>}<a className="gb-button" href={media.url} target="_blank" rel="noopener noreferrer">打开官方视频 ↗</a><RecordLink media={media}/></section>{media.kind==='mv'&&<section className="gb-section"><h2>本 MV 成员</h2><div className="gb-next-members">{genblueMediaMembers(state.data,media).map(member=>{const profile=archive.members.find(m=>m.id===member.id)!;return <Link key={member.id} memberId={member.id} href={genblueMemberHref(member.id)}>{profile.cnName} / {profile.stageName}</Link>;})}</div>{!genblueMediaMembers(state.data,media).length&&<p className="gb-muted">{state.loading?'正在读取本 MV 成员…':'暂无已关联的本 MV 成员。'}</p>}</section>}<section className="gb-section"><h2>所属发行</h2>{release?<ReleaseRow release={release}/>:<p className="gb-muted">所属发行尚未精确确认。</p>}</section></>;}

  return <ImageRecoveryProvider><div className="genblue-bluecut" data-genblue-native="bluecut"><a className="gb-skip" href="#genblue-main" onClick={event=>{event.preventDefault();const main=document.getElementById('genblue-main');main?.focus({preventScroll:true});main?.scrollIntoView({block:'start',behavior:'instant'});}}>跳到内容</a><aside className="gb-navigation"><Link className="gb-brand" href={GENBLUE_PATH}><span>GEN</span><span>BLUE</span></Link><nav aria-label="GENBLUE 导航">{nav.map(([key,label])=><a key={key} href={genblueHref({section:key})} aria-current={route.section===key?'page':undefined} onClick={e=>localLink(e,genblueHref({section:key}))}>{label}</a>)}</nav></aside><main className="gb-main" id="genblue-main" tabIndex={-1}>
    {!route.valid?<div className="gb-empty"><h1>这个链接暂不可用</h1><Link className="gb-button" href={GENBLUE_PATH}>返回 GENBLUE 首页</Link></div>:route.member?<MemberDetail/>:route.release?<ReleaseDetail/>:route.media?<MediaDetail/>:route.section==='members'?<><Heading index="02" title="成员"/><label className="gb-search-label" htmlFor="gb-member-search">中文名或艺名</label><input id="gb-member-search" className="gb-member-search" placeholder="寻找成员" value={route.search} onChange={e=>navigate(genblueHref({search:e.target.value},route),true,false)}/><Roster/></>:route.section==='works'?Library():route.section==='updates'?<><Heading index="08" title="时间轴"/><Timeline/></>:<Home/>}
    {state.error&&<aside className="gb-read-error" role="status"><p>{state.error} 公开档案仍可浏览；评分入口需先核对原生记录。</p><button className="gb-button gb-quiet" onClick={()=>host.onRetry?host.onRetry():setAttempt(v=>v+1)}>重新读取资料库</button></aside>}
    <footer className="gb-footer"><Link href={GENBLUE_PATH}>GENBLUE</Link><p>成员 / 作品 / 时间轴</p><div className="gb-site-links"><a href="/?view=groups" onClick={e=>{if(!canLeave())e.preventDefault();}}>返回团体索引 ↗</a><a href={archive.sourceUrl} target="_blank" rel="noopener noreferrer">团体资料来源 ↗</a><span>公开可读，只有本人可编辑</span></div></footer><ImageRecoveryControls/></main></div></ImageRecoveryProvider>;
}
