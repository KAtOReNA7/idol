'use client';

import type {ReactNode} from 'react';
import type {CatalogView, Member, Work} from '@/lib/idol/types';
import {artistMemberUrl, artistRoute, artistRouteUrl, artistWorkRows, artistWorkScoreLabel, artistWorkUrl} from '@/lib/idol/artist-preview';
import {BABYMONSTER_GROUP_ID, BABYMONSTER_PATH} from '@/lib/idol/artist-navigation';
import {memberChineseName, memberDisplayName} from '@/lib/idol/member-display-name';
import {publicVideoCover} from '@/lib/idol/mv-public-covers';
import {videoId} from '@/lib/idol/values';
import {ArtistTimeline} from './artist-timeline';
import {ArtistDirectorySearch, followDirectoryLink} from './artist-directory-search';
import {ArtistDirectoryRecordLinks} from './artist-directory-record-links';
import {directoryRecordReturn,timelineLinkAnchor} from '@/lib/idol/directory-record-return';
import {ArtistTimelineHost, useArtistTimelineHostOptions} from './artist-timeline-host';
import {ReliableImage} from './reliable-image';
import {useCanEdit} from '@/components/public-access';
import content from '@/data/babymonster-artist.json';

type Route = ReturnType<typeof artistRoute>;
type Section = 'members' | 'works' | 'updates';
type DirectoryMember = Pick<Member,'id'|'name'|'stageName'|'cnName'|'status'|'groupIds'> & Partial<Pick<Member,'photo'>>;
type PublicWork = {id:string; name:string; song:string; version:string; videoType:string; officialTitle:string; releaseDate:string; videoId:string; stageAction:string};
type Selection = (patch: Partial<Route>, replace?: boolean) => void;
type Collection = {members: Member[]; works: Work[]};
type DirectoryProps = {
  route: Route; section: Section; collection: Collection | null; data: CatalogView | null;
  initialTimeline?: unknown; loading: boolean; error: string; navigate: Selection; retry: () => void;
};

const tabs = [['overview','概览'],['works','作品与舞台'],['members','成员'],['updates','大事时间轴'],['records','成绩档案']] as const;
const queues = [['all','全部作品'],['tonight','待看'],['rewatch','高分重温'],['unrated','看过待评分']] as const;
const sectionNames = {members:'成员名录', works:'作品与舞台', updates:'大事时间轴'};
const portraitSizes = '(max-width:720px) calc((100vw - 49px) / 2), (max-width:1040px) calc((92.2vw - 48px) / 4), (max-width:1440px) calc((92.2vw - 96px) / 7), 176px';
const publicMembers: DirectoryMember[] = (content.directory?.members??[]).map(person=>({...person, name:person.stageName, groupIds:[BABYMONSTER_GROUP_ID]}));
const publicWorks: PublicWork[] = content.directory?.works??[];
const timelineContext = {
  groups:[{slug:'babymonster',groupId:BABYMONSTER_GROUP_ID}], members:publicMembers,
  works:publicWorks.map(work=>({id:work.id,groupIds:[BABYMONSTER_GROUP_ID]})),
};
const memberLabels = Object.fromEntries(publicMembers.map(member=>[member.id,memberChineseName(member)||memberDisplayName(member)]));
const workLabels = Object.fromEntries(publicWorks.map(work=>[work.id,work.song||work.name]));

export function BabymonsterDirectoryNav({section,navigate}: {section:Section; navigate:Selection}) {
  return <div className="bm-directory-mast"><div>
    <a className="bm-directory-brand" href={BABYMONSTER_PATH}>BABYMONSTER</a>
    <nav aria-label="团体内容">{tabs.map(([key,label])=><a key={key}
      href={BABYMONSTER_PATH+(key==='overview'?'':'?section='+key)}
      aria-current={section===key?'page':undefined} onClick={event=>followDirectoryLink(event,()=>
        navigate({section:key,member:null,search:'',queue:'all',format:'all'}))}>{label}</a>)}</nav>
  </div></div>;
}

function fromLiveWork(work: Work): PublicWork {
  return {id:work.id, name:work.name, song:work.song, version:work.version, videoType:work.videoType, officialTitle:work.officialTitle,
    releaseDate:work.releaseDate, videoId:videoId(work.url)??'', stageAction:work.stage?'看舞台':work.stageSupplement?.alternatives.length?'其他现场':''};
}

function info(work: PublicWork) {
  const kind=({exclusive_performance_video:'官方表演视频',ost_promotion_video:'原声带宣传视频'} as Record<string,string>)[work.videoType]??work.videoType;
  return [work.version,kind,work.releaseDate].filter(Boolean).join(' · ');
}

function WorkCard({work,returnTo,score}: {work:PublicWork; returnTo:string; score?:number|null}) {
  const name=work.song||work.name;
  const poster=work.videoId?(publicVideoCover(work.videoId)?.src??'https://i.ytimg.com/vi/'+work.videoId+'/hqdefault.jpg'):undefined;
  return <article className="bm-directory-work as-work-row" data-work-id={work.id}>
    <a className="bm-directory-work-main" href={artistWorkUrl(work,false,returnTo)} data-member-work-trigger={'work-mv:'+work.id}>
      <span className="bm-directory-poster"><ReliableImage src={poster} alt={name+' 视频封面'} identityKey={'work:'+work.id+':thumbnail'} referrerPolicy="no-referrer" width={104} height={59}/></span>
      <span className="bm-directory-work-copy"><strong>{name}</strong><small>{info(work)}</small></span>
    </a>
    {score!==undefined&&<span className="bm-directory-score">我的 MV 分 {artistWorkScoreLabel(score)}</span>}
    {work.stageAction&&<a className="bm-directory-stage" href={artistWorkUrl(work,true,returnTo)}
      data-member-work-trigger={'work-stage:'+work.id} aria-label={name+' · '+work.stageAction}>{work.stageAction}</a>}
  </article>;
}

function Roster({people,route,navigate}: {people:DirectoryMember[]; route:Route; navigate:Selection}) {
  return <><div className="bm-directory-roster">{people.map(person=>{
    const portrait=content.memberVisuals[person.stageName as keyof typeof content.memberVisuals];
    const src=portrait?.directoryPreview360??portrait?.image??(person.photo?`/api/media?table=${person.photo.table}&record=${person.photo.recordId}&index=${person.photo.index}`:undefined);
    const srcSet=portrait?.directoryPreview360&&portrait?.directoryPreview540?`${portrait.directoryPreview360} 360w, ${portrait.directoryPreview540} 540w, ${portrait.image} 800w`:undefined;
    const target={...route,section:'members' as const,member:person.id};
    return <a key={person.id} data-artist-member-trigger={person.id} data-member-work-trigger={'roster:'+person.id}
      href={artistRouteUrl(target,BABYMONSTER_PATH)}
      onClick={event=>followDirectoryLink(event,()=>navigate({section:'members',member:person.id}))}>
      <span className="bm-directory-portrait"><ReliableImage src={src} srcSet={srcSet} sizes={srcSet?portraitSizes:undefined}
        alt={memberDisplayName(person)+' · '+(portrait?.label??'成员档案照')} identityKey={'member:'+person.id+':portrait'} width={176} height={264} original/></span>
      <strong>{person.stageName}</strong><span>{memberChineseName(person)}</span><small>{person.status}</small>
    </a>;
  })}</div><p className="bm-directory-credit">{content.portraitSet.label} · {content.portraitSet.attribution}</p></>;
}

function DirectoryPanel({section,count,error,retry,children}: {section:Section; count?:string; error?:string; retry:()=>void; children:ReactNode}) {
  return <section className="bm-directory-panel">
    <header><h1>{sectionNames[section]}</h1>{count&&<p>{count}</p>}</header>
    {error&&<div className="bm-directory-error" role="alert"><p>{error}</p><button onClick={retry}>重新加载</button></div>}
    {children}
  </section>;
}

function WorkDirectory({route,collection,loading,error,navigate,retry}: DirectoryProps) {
  const canEdit=useCanEdit();
  const liveWorks=collection?.works;
  const privateQueue=route.queue!=='all';
  const returnTo=artistRouteUrl(route,BABYMONSTER_PATH);
  let visible: PublicWork[] = [];
  if (canEdit||!privateQueue) {
    if (liveWorks) visible=artistWorkRows(liveWorks,route.queue,route.search).map(fromLiveWork);
    else if (!privateQueue) {
      const needle=route.search.trim().toLowerCase();
      visible=publicWorks.filter(work=>[work.song,work.name,work.version,work.videoType,work.officialTitle].join(' ').toLowerCase().includes(needle));
    }
  }
  const scores=canEdit&&liveWorks?new Map(liveWorks.map(work=>[work.id,work.score])):null;
  const count=privateQueue&&(!canEdit||!liveWorks)?undefined:visible.length+' 支作品';
  const waiting=canEdit&&privateQueue&&!liveWorks&&loading;
  let empty='没有符合条件的作品。';
  if (privateQueue&&!canEdit) empty='个人观看记录仅本人可见。';
  else if (privateQueue&&!liveWorks) empty='个人观看记录暂时无法读取。';

  return <DirectoryPanel section="works" count={count} error={error} retry={retry}>
    <ArtistDirectorySearch className="bm-directory-search" basePath={BABYMONSTER_PATH} route={route} navigate={navigate}/>
    {canEdit&&<div className="bm-directory-queues" aria-label="个人观看筛选">{queues.map(([key,label])=>
      <a key={key} aria-current={route.queue===key?'true':undefined} href={artistRouteUrl({...route,queue:key},BABYMONSTER_PATH)}
        onClick={event=>followDirectoryLink(event,()=>navigate({queue:key}))}>{label}
        {liveWorks&&<span>{artistWorkRows(liveWorks,key,route.search).length}</span>}</a>)}</div>}
    {visible.map(work=><WorkCard key={work.id} work={work} returnTo={returnTo} score={scores?.get(work.id)}/>)}
    {!visible.length&&<div className="bm-directory-empty">
      {waiting?<p role="status">正在读取个人观看记录…</p>:
        <><p>{empty}</p><a href={artistRouteUrl({...route,queue:'all',search:''},BABYMONSTER_PATH)}
          onClick={event=>followDirectoryLink(event,()=>navigate({queue:'all',search:''}))}>查看全部作品</a></>}
    </div>}
  </DirectoryPanel>;
}

function TimelineDirectory({route,data,initialTimeline,loading,error,retry}: DirectoryProps) {
  const host=useArtistTimelineHostOptions();
  const input=host.input??initialTimeline;
  const rows=input&&typeof input==='object'&&'events' in input&&Array.isArray(input.events)?input.events:undefined;
  const count=rows?rows.filter(event=>event?.reviewStatus==='ready').length+' 条记录':undefined;
  const publicFirst=!!input&&(!data||host.timelineLoading)&&!host.timelineError;
  const returnTo=artistRouteUrl(route,BABYMONSTER_PATH);
  const recordHref=(kind:'member'|'work',id:string,eventId:string)=>{
    const target=directoryRecordReturn(returnTo,timelineLinkAnchor(eventId,kind,id));
    return kind==='work'?artistWorkUrl({id},false,target):artistMemberUrl(id,target);
  };

  return <DirectoryPanel section="updates" count={count} error={publicFirst?error:undefined} retry={retry}>
    <ArtistDirectoryRecordLinks route={returnTo} ready={!publicFirst}>{publicFirst
      ? <ArtistTimeline input={input} context={timelineContext} memberLabels={memberLabels} workLabels={workLabels}
          recordHref={host.blocked||host.restoreBlocked?undefined:recordHref} showTitle={false}/>
      : <ArtistTimelineHost groupId={BABYMONSTER_GROUP_ID} catalog={data} loading={loading} error={error} onRetry={retry} recordHref={recordHref}/>}</ArtistDirectoryRecordLinks>
  </DirectoryPanel>;
}

export function BabymonsterDirectory(props:DirectoryProps) {
  if (props.section==='works') return <WorkDirectory {...props}/>;
  if (props.section==='updates') return <TimelineDirectory {...props}/>;
  const people=props.collection?[...props.collection.members].sort((a,b)=>
    content.profile.members.indexOf(a.stageName)-content.profile.members.indexOf(b.stageName)):publicMembers;
  return <DirectoryPanel section="members" count={people.length+' 位成员'} error={props.error} retry={props.retry}>
    <Roster people={people} route={props.route} navigate={props.navigate}/>
  </DirectoryPanel>;
}
