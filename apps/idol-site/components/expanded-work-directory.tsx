'use client';

import {useMemo, type ComponentProps} from 'react';
import {artistRoute, artistRouteUrl, artistWorkScoreLabel, artistWorkUrl} from '@/lib/idol/artist-preview';
import {directoryRecordReturn, workLinkAnchor} from '@/lib/idol/directory-record-return';
import {directoryPerformances, directoryWork, directoryWorkMatches, type DirectoryWork} from '@/lib/idol/expanded-work-directory';
import {publicMvCover} from '@/lib/idol/mv-public-covers';
import {inQueue} from '@/lib/idol/queues';
import {stageHasValidBinding} from '@/lib/idol/stage-source';
import type {Work} from '@/lib/idol/types';
import {ArtistDirectoryRecordLinks} from './artist-directory-record-links';
import {ArtistDirectorySearch, followDirectoryLink} from './artist-directory-search';
import {useCanEdit} from './public-access';
import {ReliableImage} from './reliable-image';

type Route = ReturnType<typeof artistRoute>;
type Selection = (change:Partial<Route>, replace?:boolean) => void;
const sections = [['overview','概览'],['works','作品与舞台'],['members','成员'],['updates','大事时间轴'],['records','成绩']] as const;
const queues = [['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']] as const;
const siteLinks = [['/','我的放映室'],['/?view=works','作品库'],['/?view=members','成员档案'],['/?view=groups','团体索引'],['/?view=insights','偏好手帐']] as const;

function RecordLink({work,stage=false,returnTo,children,...props}:{
  work:DirectoryWork;stage?:boolean;returnTo:string;
} & ComponentProps<'a'>) {
  const anchor=workLinkAnchor(work.id,stage), target=directoryRecordReturn(returnTo,anchor);
  return <a {...props} href={artistWorkUrl(work,stage,target)} id={target===returnTo?undefined:anchor}
    data-directory-record-id={work.id} data-member-work-trigger={(stage?'work-stage:':'work-mv:')+work.id}
    referrerPolicy="no-referrer">{children}</a>;
}

function MovieCard({record,live,returnTo}:{record:DirectoryWork; live?:Work; returnTo:string}) {
  const title=record.song||record.name;
  const poster=publicMvCover(record.id,record.videoId)?.src ?? (record.videoId?'https://i.ytimg.com/vi/'+record.videoId+'/hqdefault.jpg':undefined);
  return <article className="nx-directory-movie" data-work-id={record.id}>
    <RecordLink work={record} returnTo={returnTo} className="nx-directory-movie-link">
      <div className="nx-directory-cover"><ReliableImage src={poster} alt={title+' · 视频封面'} identityKey={'work:'+record.id+':thumbnail'}
        width={416} height={234} referrerPolicy="no-referrer" loading="lazy" fallback={<span>{title}</span>}/></div>
      <div className="nx-directory-movie-copy"><h2>{title}</h2><p>{[record.releaseDate,record.version||record.videoType].filter(Boolean).join(' · ')}</p></div>
    </RecordLink>
    {live&&<p className="nx-directory-score">我的 MV 分 <strong>{artistWorkScoreLabel(live.score)}{live.score===null?'':' / 10'}</strong></p>}
    {record.stage&&<RecordLink work={record} stage returnTo={returnTo} className="nx-directory-stage-link" aria-label={title+' · '+record.stage.title}>
      {record.stage.viewOnly?'查看其他现场':'看舞台'}<span aria-hidden="true"> ↗</span></RecordLink>}
  </article>;
}

function PerformanceCard({group,returnTo,ownerWorks}:{group:ReturnType<typeof directoryPerformances>[number];returnTo:string;ownerWorks?:Map<string,Work>}) {
  const {stage,works}=group, first=works[0];
  const score=(id:string)=>{const work=ownerWorks?.get(id);return work&&stageHasValidBinding(work.stage)?artistWorkScoreLabel(work.stageScore):null;};
  return <article className="nx-directory-show" data-stage-source={stage.key} data-work-id={first.id}>
    <RecordLink work={first} stage returnTo={returnTo} className="nx-directory-show-main">
      <div className="nx-directory-cover"><ReliableImage src={stage.poster} alt={stage.title+' · '+(stage.workReference?'关联 MV 封面':'舞台视频封面')}
        identityKey={'stage:'+stage.key+':'+stage.poster} referrerPolicy="no-referrer" width={452} height={254} loading="lazy"
        fallback={<span>舞台预览暂缺</span>}/>{stage.workReference&&stage.poster&&<small>关联 MV 封面</small>}</div>
      <div className="nx-directory-program"><h2>{stage.title}</h2><p>{[stage.channel,stage.date,stage.kind].filter(Boolean).join(' · ')}</p>
        {stage.viewOnly&&<span>其他现场 · 仅供观看</span>}</div>
    </RecordLink>
    <div className="nx-directory-related"><h3>关联 MV</h3><ul>{works.map(work=><li key={work.id}>
      <RecordLink work={work} returnTo={returnTo}>{work.song||work.name} · {work.version||work.videoType}</RecordLink>
      {work.stage?.versionNote&&<small>{work.stage.versionNote}</small>}
      {score(work.id)!==null&&(work===first?<span className="nx-directory-score">我的整体舞台分 <strong>{score(work.id)}</strong></span>:
        <RecordLink work={work} stage returnTo={returnTo} className="nx-directory-score">此作品的舞台评分 <strong>{score(work.id)}</strong></RecordLink>)}
    </li>)}</ul></div>
  </article>;
}

type Props={
  slug:string;name:string;route:Route;initial?:DirectoryWork[];live?:Work[];loading:boolean;error:string;retry:()=>void;navigate:Selection;
};
export function ExpandedWorkDirectory({slug,name,route,initial,live,loading,error,retry,navigate}:Props) {
  const path='/artists/'+slug, back=artistRouteUrl(route,path), canEdit=useCanEdit();
  const visibleRecords=useMemo(()=>live?live.filter(w=>!!w.url).map(directoryWork):initial??[],[initial,live]);
  const ownerWorks=useMemo(()=>canEdit&&live?new Map(live.map(w=>[w.id,w])):undefined,[canEdit,live]);
  const privateQueue=route.queue!=='all', stageView=route.format==='stage';
  const eligible=privateQueue?visibleRecords.filter(w=>{const row=ownerWorks?.get(w.id);return !!row&&inQueue(row,route.queue,[]);}):visibleRecords;
  const movies=stageView?[]:eligible.filter(w=>directoryWorkMatches(w,route.search));
  const shows=stageView?directoryPerformances(eligible,route.search):[];
  const unavailable=privateQueue?!ownerWorks:!live&&!initial;
  const count=stageView?shows.length:movies.length, reset={queue:'all',format:'all',search:''};
  return <div className={'expanded-artist '+slug+'-artist nx-directory'}>
    <header className="nx-directory-site"><a href="/" className="nx-brand">STAGE</a>
      <nav className="nx-directory-site-wide" aria-label="网站导航">{siteLinks.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav>
      <details className="nx-directory-site-menu"><summary>网站导航</summary><nav aria-label="网站导航">{siteLinks.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav></details>
    </header>
    <nav className="nx-directory-sections" aria-label="团体内容">{sections.map(([key,label])=>{
      const change={...reset,section:key,member:null}, href=artistRouteUrl({...route,...change},path);
      return <a key={key} href={href} aria-current={key==='works'?'page':undefined}
        onClick={e=>followDirectoryLink(e,()=>navigate(change))}>{label}</a>;
    })}</nav>
    <main id="artist-content" className="nx-directory-content">
      <header><h1>{name} 作品与舞台</h1>{!unavailable&&<p>{count} {stageView?'场舞台':'支 MV'}</p>}</header>
      <ArtistDirectorySearch className="nx-directory-search" basePath={path} route={route} navigate={navigate}/>
      <nav className="nx-directory-filters" aria-label="播放内容">{([['mv','MV'],['stage','舞台']] as const).map(([key,label])=><a key={key}
        href={artistRouteUrl({...route,format:key},path)} aria-current={(stageView?key==='stage':key==='mv')?'true':undefined}
        onClick={e=>followDirectoryLink(e,()=>navigate({format:key}))}>{label}</a>)}</nav>
      {canEdit&&<nav className="nx-directory-filters nx-directory-queues" aria-label="个人观看筛选">{queues.map(([key,label])=><a key={key}
        href={artistRouteUrl({...route,queue:key},path)} aria-current={route.queue===key?'true':undefined}
        onClick={e=>followDirectoryLink(e,()=>navigate({queue:key}))}>{label}{live&&<span>{live.filter(w=>w.url&&inQueue(w,key,[])).length}</span>}</a>)}</nav>}
      {error&&<div className="nx-directory-notice" role="alert"><p>{error}</p><button onClick={retry}>重新加载</button></div>}
      <ArtistDirectoryRecordLinks route={back} ready={!!live}>
        <div className={stageView?'nx-directory-shows':'nx-directory-grid'}>
          {stageView?shows.map(g=><PerformanceCard key={g.stage.key} group={g} returnTo={back} ownerWorks={ownerWorks}/>):
            movies.map(record=><MovieCard key={record.id} record={record} returnTo={back} live={ownerWorks?.get(record.id)}/>)}
        </div>
      </ArtistDirectoryRecordLinks>
      {!count&&<div className="nx-directory-notice">{unavailable&&loading&&(!privateQueue||canEdit)?<p role="status">正在读取{privateQueue?'个人观看记录':'作品'}…</p>:<>
        <p>{privateQueue&&!canEdit?'个人观看记录仅本人可见。':unavailable?'作品记录暂时无法读取。':'没有符合条件的作品。'}</p>
        <a href={artistRouteUrl({...route,...reset},path)} onClick={e=>followDirectoryLink(e,()=>navigate(reset))}>查看全部作品</a></>}</div>}
    </main>
  </div>;
}
