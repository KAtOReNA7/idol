'use client';

import {createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode} from 'react';
import type {TimelineDisplayCopy} from '../lib/idol/timeline/display-copy';
import {memberChineseName,memberDisplayName} from '@/lib/idol/member-display-name';
import type {CatalogView} from '../lib/idol/types';
import type {TimelineGroupIdentity} from '../lib/idol/timeline/types';
import registry51 from '../data/artist-timeline-registry.json';
import {getArtistTimeline} from '../lib/idol/timeline/registry';
import {prepareTimelinePresentation} from '../lib/idol/timeline/presentation';
import {CHRONOLOGICAL_TIMELINE_FILTERS} from '../lib/idol/timeline/model';
import {ArtistTimeline, type ArtistTimelineProps} from './artist-timeline';
import {useTimelineReturn} from './use-timeline-return';

export interface TimelineNavigationRequest {
  eventId: string; kind: 'member'|'work'; targetId: string; groupId: string; returnTo: string; former: boolean;
}
/** Optional read-only host injection. No fallback API, data file, or navigation authority is created. */
export interface ArtistTimelineHostOptions {
  catalog?: CatalogView|null;
  input?: unknown;
  displayCopy?: TimelineDisplayCopy;
  inputs?: Readonly<Record<string, unknown>>;
  groups?: readonly TimelineGroupIdentity[];
  /** Optional initial request URL for an explicit SSR host; client URL remains authoritative. */
  serverRoute?: string;
  timelineLoading?: boolean;
  timelineError?: string;
  onTimelineRetry?: ()=>void;
  timelineRetryLabel?: string;
  hideLegacyBackground?: boolean;
  background?: ReactNode;
  restoreBlocked?: boolean;
  loading?: boolean;
  error?: string;
  styleReady?: boolean;
  blocked?: boolean;
  onRetry?: ()=>void;
  /** Call beforeLeave after the real dirty/save guard approves, immediately before navigation. */
  navigate?: (request: TimelineNavigationRequest, beforeLeave: ()=>boolean)=>void;
}
const EMPTY_OPTIONS: ArtistTimelineHostOptions = Object.freeze({});
const HostContext = createContext<ArtistTimelineHostOptions>(EMPTY_OPTIONS);
export function ArtistTimelineHostProvider({value,children}:{value:ArtistTimelineHostOptions;children:ReactNode}) {
  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}
export function useArtistTimelineHostOptions() { return useContext(HostContext); }
function subscribe(listener:()=>void) {
  window.addEventListener('popstate',listener);window.addEventListener('artist-location-change',listener);
  return ()=>{window.removeEventListener('popstate',listener);window.removeEventListener('artist-location-change',listener);};
}

export function ArtistTimelineHost({groupId,catalog,background,loading=false,error='',onRetry,styleReady=true,showTitle=false,releaseTargets,onRelease}:{releaseTargets?:ArtistTimelineProps['releaseTargets'];onRelease?:(request:{eventId:string;releaseId:string;returnTo:string},beforeLeave:()=>boolean)=>void;groupId:string;catalog:CatalogView|null;background?:ReactNode;loading?:boolean;error?:string;onRetry?:()=>void;styleReady?:boolean;showTitle?:boolean}) {
  const options=useArtistTimelineHostOptions();
  const groups=options.groups??registry51;
  const data=options.catalog!==undefined?options.catalog:catalog;
  const input=useMemo(()=>options.input!==undefined?options.input:options.inputs&&Object.hasOwn(options.inputs,groupId)?options.inputs[groupId]:getArtistTimeline(groupId,{groups}).timeline,[options.input,options.inputs,groupId,groups]);
  const presentation=useMemo(()=>prepareTimelinePresentation(input,data,groups),[input,data,groups]);
  const group=groups.find(row=>row.groupId===groupId);
  const routeKey=useSyncExternalStore(subscribe,()=>window.location.pathname+window.location.search,()=>options.serverRoute??`/artists/${group?.slug??'unknown'}`);
  const filters=CHRONOLOGICAL_TIMELINE_FILTERS;
  const busy=!!options.timelineLoading||(options.loading??loading);
  const failed=(options.timelineError||options.error||error)||(presentation.timeline&&presentation.timeline.groupId!==groupId?'时间轴资料与当前团体不匹配。':'');
  const [cssReady,setCssReady]=useState(false);
  const styles=(options.styleReady??styleReady)&&cssReady;
  const ready=!busy&&!failed&&styles&&presentation.state!=='loading'&&presentation.state!=='invalid';
  const {rootRef,rememberTarget}=useTimelineReturn({ready,routeKey,filters,captureClicks:false,blocked:options.restoreBlocked??options.blocked??false});
  useEffect(()=>{
    const check=()=>{
      const node=rootRef.current?.querySelector<HTMLElement>('.artist-timeline');
      setCssReady(!!node&&getComputedStyle(node).getPropertyValue('--at-style-ready').trim()==='1');
    };
    check();
    // Styles can finish well after the restoration hook's bounded target search.
    // Keep the real gate reactive instead of pretending an early true is ready.
    const timer=setInterval(check,250);
    document.addEventListener('load',check,true);
    return()=>{clearInterval(timer);document.removeEventListener('load',check,true);};
  },[routeKey]);
  const memberLabels=useMemo(()=>Object.fromEntries((data?.members??[]).map(member=>[member.id,memberChineseName({...member,groupIds:[...member.groupIds,...(member.formerGroupIds??[])]})||memberDisplayName(member)])),[data]);
  const workLabels=useMemo(()=>Object.fromEntries((data?.works??[]).map(work=>[work.id,work.song||work.name])),[data]);
  function navigate(kind:'member'|'work',targetId:string,eventId:string) {
    if(!ready||options.blocked||!options.navigate)return;
    const identity=(kind==='member'?presentation.identity.members:presentation.identity.works).get(targetId);
    if(!identity?.usable||!identity.groupIds.includes(groupId))return;
    const former=kind==='member'&&!identity.currentGroupIds.includes(groupId)&&identity.formerGroupIds.includes(groupId);
    options.navigate({eventId,kind,targetId,groupId,returnTo:routeKey,former},()=>rememberTarget({eventId,kind,targetId},undefined,true));
  }
  return <div ref={rootRef} data-timeline-host={groupId} data-timeline-ready={ready?'true':'false'} data-timeline-style-ready={styles?'true':'false'}>
    <ArtistTimeline showTitle={showTitle} input={input} context={presentation.identity.context} catalog={data}
      loading={busy||presentation.state==='loading'} error={failed} onRetry={options.onTimelineRetry??options.onRetry??onRetry} retryLabel={options.timelineError?options.timelineRetryLabel:undefined}
      onMember={options.navigate?(id,eventId)=>navigate('member',id,eventId):undefined}
      onWork={options.navigate?(id,eventId)=>navigate('work',id,eventId):undefined}
      releaseTargets={releaseTargets} onRelease={onRelease?(releaseId,eventId)=>{
        if(!ready||options.blocked||releaseTargets?.[eventId]?.id!==releaseId||!presentation.timeline?.events.some(event=>event.id===eventId&&event.groupId===groupId))return;
        onRelease({eventId,releaseId,returnTo:routeKey},()=>rememberTarget({eventId,kind:'release',targetId:releaseId},undefined,true));
      }:undefined}
      memberLabels={memberLabels} workLabels={workLabels}/>
  </div>;
}
