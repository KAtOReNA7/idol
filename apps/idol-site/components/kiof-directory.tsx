'use client';

import type {ReactNode} from 'react';
import publicDirectory from '@/data/kissoflife-share-directory.json';
import {KIOF_GROUP_ID, KIOF_PATH} from '@/lib/idol/artist-navigation';
import {artistMemberUrl, artistRoute, artistRouteUrl, artistWorkRows, artistWorkScoreLabel, artistWorkUrl} from '@/lib/idol/artist-preview';
import {kiofDirectoryRecord} from '@/lib/idol/kiof-directory-record';
import {memberChineseName, memberDisplayName} from '@/lib/idol/member-display-name';
import {publicVideoCover} from '@/lib/idol/mv-public-covers';
import {stageHasValidBinding} from '@/lib/idol/stage-source';
import type {CatalogView, Member, Work} from '@/lib/idol/types';
import {ArtistDirectorySearch, followDirectoryLink} from './artist-directory-search';
import {ArtistDirectoryRecordLinks} from './artist-directory-record-links';
import {directoryRecordReturn,timelineLinkAnchor,workLinkAnchor} from '@/lib/idol/directory-record-return';
import {ArtistTimeline} from './artist-timeline';
import {ArtistTimelineHost, useArtistTimelineHostOptions} from './artist-timeline-host';
import type {ExpandedArtistContent} from './expanded-artist';
import {useCanEdit} from './public-access';
import {ReliableImage} from './reliable-image';

type Route=ReturnType<typeof artistRoute>;
type Section='members'|'works'|'updates';
type Selection=(change:Partial<Route>,replace?:boolean)=>void;
type RecordView=ReturnType<typeof kiofDirectoryRecord>;
type DirectoryMember=Pick<Member,'id'|'name'|'stageName'|'cnName'|'status'|'groupIds'>;
type Props={
  section:Section; route:Route; content:ExpandedArtistContent; collection:{works:Work[];members:Member[]}|null;
  data:CatalogView|null; initialTimeline?:unknown; loading:boolean; error:string; retry:()=>void; navigate:Selection;
};
const tabs=[['overview','概览'],['works','作品与舞台'],['members','成员'],['updates','大事时间轴'],['records','成绩']] as const;
const formats=[['all','全部'],['mv','MV'],['stage','可看舞台']] as const;
const queues=[['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']] as const;
const titles={members:'成员名录',works:'作品与舞台',updates:'大事时间轴'};
const publicMembers=publicDirectory.members.map(m=>({...m,name:m.stageName,groupIds:[KIOF_GROUP_ID]}));
const timelineContext={groups:[{groupId:KIOF_GROUP_ID,slug:'kissoflife'}],members:publicMembers,works:publicDirectory.works.map(w=>({id:w.id,groupIds:[KIOF_GROUP_ID]}))};
const memberLabels=Object.fromEntries(publicMembers.map(m=>[m.id,memberChineseName(m)||m.stageName]));
const workLabels=Object.fromEntries(publicDirectory.works.map(w=>[w.id,w.song||w.name]));
const sizes='(max-width:700px) calc((100vw - 50px) / 2), (max-width:1100px) calc((100vw - 112px) / 4), (max-width:1440px) calc((100vw - 168px) / 4), 318px';

export function KiofDirectoryNav({section,navigate}:{section:Section; navigate:Selection}) {
  return <div className="kf-directory-mast"><div>
    <a className="kf-directory-mark" href={KIOF_PATH}><img src="/artist/kissoflife/directory/japan-official-logo.png"
      alt="KISS OF LIFE" width={600} height={128}/></a>
    <nav aria-label="团体内容">{tabs.map(([key,label])=><a key={key} href={KIOF_PATH+(key==='overview'?'':'?section='+key)}
      aria-current={key===section?'page':undefined} onClick={event=>followDirectoryLink(event,()=>
        navigate({section:key,member:null,search:'',queue:'all',format:'all'}))}>{label}</a>)}</nav>
  </div></div>;
}

function Panel({section,count,credit,children,error,retry}:{section:Section; count?:string; credit?:ReactNode; children:ReactNode; error?:string; retry:()=>void}) {
  return <section className="kf-directory-panel">
    <header><div className="kf-directory-title"><h1>{titles[section]}</h1>{count&&<p>{count}</p>}</div>{credit}</header>
    {error&&<div className="kf-directory-notice" role="alert"><p>{error}</p><button onClick={retry}>重新加载</button></div>}
    {children}
  </section>;
}

function Members({content,collection,route,navigate,error,retry}:Props) {
  const people:DirectoryMember[]=collection?[...collection.members].sort((a,b)=>
    content.profile.members.indexOf(a.stageName)-content.profile.members.indexOf(b.stageName)):publicMembers;
  const credit=<a className="kf-directory-credit" href="https://kissoflife.jp/#biography" target="_blank" rel="noopener noreferrer">
    SWEAT -JAPANESE EP- · {content.portraitSet.date.replaceAll('-','.')} · {content.portraitSet.copyright}</a>;
  return <Panel section="members" count={people.length+' 位成员'} credit={credit} error={error} retry={retry}>
    <div className="kf-directory-roster">{people.map(person=>{
      const photo=content.memberVisuals[person.stageName], official=publicMembers.find(m=>m.id===person.id&&m.stageName===person.stageName);
      const preview=official&&photo?'/artist/kissoflife/directory/'+official.stageName.toLowerCase():undefined;
      return <a key={person.id} data-artist-member-trigger={person.id} data-member-work-trigger={'roster:'+person.id}
        aria-label={memberDisplayName(person)+' · 成员档案'} href={artistRouteUrl({...route,section:'members',member:person.id},KIOF_PATH)}
        onClick={event=>followDirectoryLink(event,()=>navigate({section:'members',member:person.id}))}>
        {photo&&<ReliableImage src={preview?preview+'-360.webp':photo.image}
          srcSet={preview?preview+'-360.webp 360w, '+preview+'-540.webp 540w, '+photo.image+' 720w':undefined}
          sizes={preview?sizes:undefined} alt={person.stageName+' · '+photo.label} identityKey={'member:'+person.id+':portrait'}
          width={318} height={477} original/>}
        <span className="kf-directory-member-name"><strong>{person.stageName}</strong><small>{person.status}</small></span>
        <span className="member-display-name">{memberChineseName(person)}</span>
      </a>;
    })}</div>
  </Panel>;
}

function WorkCard({record,live,stageView,returnTo,canEdit}:{record:RecordView; live?:Work; stageView:boolean; returnTo:string; canEdit:boolean}) {
  const title=record.song||record.name, stage=record.stage;
  function link(isStage:boolean){
    const anchor=workLinkAnchor(record.id,isStage),target=directoryRecordReturn(returnTo,anchor);
    return {href:artistWorkUrl(record,isStage,target),id:target===returnTo?undefined:anchor,
      referrerPolicy:'no-referrer' as const,'data-directory-record-id':record.id};
  }
  if (stageView&&stage) {
    const score=live&&stageHasValidBinding(live.stage)?live.stageScore:null;
    return <article className="kf-work kf-stage-card" data-work-id={record.id}><a {...link(true)} data-member-work-trigger={record.id}>
      <div className="kf-work-thumb">{stage.poster?<span className="artist-work-preview"><ReliableImage src={stage.poster}
        alt={title+' · '+stage.posterLabel} identityKey={'stage:'+record.id+':'+stage.poster} loading="lazy"/>
        {stage.workReference&&<small className="work-preview-label">{stage.posterLabel}</small>}</span>:<span>{title} · 舞台预览暂缺</span>}</div>
      <h3>{title}</h3><p>{stage.detail}</p>{stage.sameVideo&&<p>与 MV 页为同一支表演视频。</p>}
      {canEdit&&live?.stage&&<span className="kf-score">我的整体舞台分 <b>{artistWorkScoreLabel(score)}{score===null?'':' / 10'}</b></span>}
      <span className="kf-stage-action">{stage.action==='其他现场'?'查看其他现场':canEdit?'观看与舞台评分':'观看舞台'}</span>
    </a></article>;
  }
  const poster=record.videoId?(publicVideoCover(record.videoId)?.src??'https://i.ytimg.com/vi/'+record.videoId+'/hqdefault.jpg'):undefined;
  return <article className="kf-work" data-work-id={record.id}>
    <a className="kf-directory-mv" {...link(false)} data-member-work-trigger={'work-mv:'+record.id}>
      <span className="kf-directory-poster"><ReliableImage src={poster} alt={title+' 视频封面'} identityKey={'work:'+record.id+':thumbnail'}
        referrerPolicy="no-referrer" loading="lazy" width={408} height={230}/></span>
      <div className="kf-directory-work-copy"><h3>{title}</h3><p>{[record.releaseDate,record.version||record.videoType].filter(Boolean).join(' · ')}</p></div>
    </a>
    {canEdit&&live&&<span className="kf-score">我的 MV 分 <b>{artistWorkScoreLabel(live.score)}{live.score===null?'':' / 10'}</b></span>}
    {stage&&<a className="kf-directory-stage" {...link(true)} data-member-work-trigger={'work-stage:'+record.id}
      aria-label={title+' · '+stage.action}>{stage.action}</a>}
  </article>;
}

function Works({route,collection,loading,error,retry,navigate}:Props) {
  const canEdit=useCanEdit(), privateQueue=route.queue!=='all', live=collection?.works;
  const unavailable=privateQueue&&(!canEdit||!live), waiting=privateQueue&&canEdit&&!live&&loading;
  const returnTo=artistRouteUrl(route,KIOF_PATH), reset={queue:'all',format:'all',search:''};
  const needle=route.search.trim().toLowerCase();
  const records=unavailable?[]:live?artistWorkRows(live,route.queue,route.search).map(kiofDirectoryRecord):
    publicDirectory.works.filter(w=>[w.song,w.name,w.version,w.videoType,w.officialTitle].join(' ').toLowerCase().includes(needle));
  const visible=records.filter(w=>route.format==='stage'?!!w.stage:route.format==='mv'?!!w.videoId:true);
  const liveById=new Map(live?.map(w=>[w.id,w]));
  return <Panel section="works" count={unavailable?undefined:visible.length+(route.format==='stage'?' 个舞台':' 支作品')} error={error} retry={retry}>
    <div className="kf-directory-filters">
      <ArtistDirectorySearch className="kf-directory-search" basePath={KIOF_PATH} route={route} navigate={navigate}/>
      <nav className="kf-directory-filter-links" aria-label="播放内容">{formats.map(([key,label])=><a key={key}
        href={artistRouteUrl({...route,format:key},KIOF_PATH)} aria-current={route.format===key?'true':undefined}
        onClick={event=>followDirectoryLink(event,()=>navigate({format:key}))}>{label}</a>)}</nav>
      {canEdit&&<nav className="kf-directory-filter-links kf-directory-queues" aria-label="个人观看筛选">{queues.map(([key,label])=><a key={key}
        href={artistRouteUrl({...route,queue:key},KIOF_PATH)} aria-current={route.queue===key?'true':undefined}
        onClick={event=>followDirectoryLink(event,()=>navigate({queue:key}))}>{label}{live&&<span>{artistWorkRows(live,key,route.search).length}</span>}</a>)}</nav>}
    </div>
    <ArtistDirectoryRecordLinks route={returnTo} ready={!!live}><div className="kf-work-grid">{visible.map(record=><WorkCard key={record.id} record={record} live={liveById.get(record.id)}
      stageView={route.format==='stage'} returnTo={returnTo} canEdit={canEdit}/>)}</div></ArtistDirectoryRecordLinks>
    {!visible.length&&<div className="kf-directory-notice">{waiting?<p role="status">正在读取个人观看记录…</p>:<>
      <p>{privateQueue&&!canEdit?'个人观看记录仅本人可见。':unavailable?'个人观看记录暂时无法读取。':'没有符合条件的作品。'}</p>
      <a href={artistRouteUrl({...route,...reset},KIOF_PATH)} onClick={event=>followDirectoryLink(event,()=>navigate(reset))}>查看全部作品</a></>}</div>}
  </Panel>;
}

function Timeline({route,data,initialTimeline,loading,error,retry}:Props) {
  const host=useArtistTimelineHostOptions(), input=host.input??initialTimeline;
  const events=input&&typeof input==='object'&&'events' in input&&Array.isArray(input.events)?input.events:undefined;
  const count=events?events.filter(event=>event.reviewStatus==='ready').length+' 条事件':undefined;
  const publicFirst=!!input&&(!data||host.timelineLoading)&&!host.timelineError, returnTo=artistRouteUrl(route,KIOF_PATH);
  const recordHref=(kind:'member'|'work',id:string,eventId:string)=>{
    const target=directoryRecordReturn(returnTo,timelineLinkAnchor(eventId,kind,id));
    return kind==='work'?artistWorkUrl({id},false,target):artistMemberUrl(id,target);
  };
  return <Panel section="updates" count={count} error={publicFirst?error:undefined} retry={retry}>
    <ArtistDirectoryRecordLinks route={returnTo} ready={!publicFirst}>{publicFirst?<ArtistTimeline input={input} context={timelineContext} memberLabels={memberLabels} workLabels={workLabels}
      recordHref={host.blocked||host.restoreBlocked?undefined:recordHref} showTitle={false}/>:
      <ArtistTimelineHost groupId={KIOF_GROUP_ID} catalog={data} loading={loading} error={error} onRetry={retry} recordHref={recordHref}/>}</ArtistDirectoryRecordLinks>
  </Panel>;
}

export function KiofDirectory(props:Props) {
  if (props.section==='members') return <Members {...props}/>;
  if (props.section==='works') return <Works {...props}/>;
  return <Timeline {...props}/>;
}
