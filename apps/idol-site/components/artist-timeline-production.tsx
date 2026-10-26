'use client';
import {useCallback,useEffect,useMemo,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import registry from '../data/artist-timeline-registry.json';
import {loadArtistTimeline} from '../lib/idol/timeline/production';
import {timelineRecordUrl} from '../lib/idol/timeline/navigation';
import {ArtistTimelineHostProvider,type TimelineNavigationRequest} from './artist-timeline-host';

/** Production-only injection. Each page keeps its existing authenticated Catalog read. */
export function ArtistTimelineProduction({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const group=registry.find(row=>row.path===pathname);
  const [attempt,setAttempt]=useState(0);
  const [loaded,setLoaded]=useState<{slug:string;input:unknown;error:string;failure?:'deadline'|'import'}|null>(null);
  const [gates,setGates]=useState({blocked:false,restoreBlocked:false});
  useEffect(()=>{
    if(!group)return;
    let active=true;
    const timer=setTimeout(()=>{if(active){active=false;setLoaded({slug:group.slug,input:null,error:'时间轴仍在加载，可继续等待。',failure:'deadline'});}},15000);
    loadArtistTimeline(group.slug).then(({input})=>{if(active){clearTimeout(timer);setLoaded({slug:group.slug,input,error:''});}},()=>{if(active){clearTimeout(timer);setLoaded({slug:group.slug,input:null,error:'时间轴模块未能加载。可重新加载页面恢复；未保存的修改需先处理。',failure:'import'});}});
    return()=>{active=false;clearTimeout(timer);};
  },[group?.slug,attempt]);
  useEffect(()=>{
    const update=()=>{
      const blocked=!!document.querySelector('[data-navigation-blocked="true"], [aria-modal="true"], dialog[open]');
      const restoreBlocked=blocked||!!document.querySelector('[data-dirty="true"]');
      setGates(prior=>prior.blocked===blocked&&prior.restoreBlocked===restoreBlocked?prior:{blocked,restoreBlocked});
    };
    update();
    const observer=new MutationObserver(update);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-dirty','data-navigation-blocked','aria-modal','open']});
    return()=>observer.disconnect();
  },[pathname]);
  const navigate=useCallback((request:TimelineNavigationRequest,beforeLeave:()=>boolean)=>{
    const target=timelineRecordUrl(request);
    const current=location.pathname+location.search;
    if(!target||current!==request.returnTo||registry.find(row=>row.path===location.pathname)?.groupId!==request.groupId)return;
    if(document.querySelector('[aria-modal="true"], dialog[open]'))return;
    if(document.querySelector('[data-navigation-blocked="true"]')){window.alert('本次保存还未确认，请留在当前作品等待或核对保存结果。');return;}
    if(document.querySelector('[data-dirty="true"]')&&!window.confirm('还有未保存的评分或备注。确定离开吗？'))return;
    if(!beforeLeave())return;
    // A real document departure creates a fresh history entry. The source entry
    // retains its exact target, filters and scroll for Back, never the target page.
    window.location.assign(target);
  },[]);
  const retry=useCallback(()=>{
    // Read live gates at click time: MutationObserver state may lag editor changes.
    if(!group||location.pathname!==group.path)return;
    if(loaded?.slug===group.slug&&loaded.failure==='import'){
      if(document.querySelector('[aria-modal="true"], dialog[open]'))return;
      if(document.querySelector('[data-navigation-blocked="true"]')){window.alert('本次保存还未确认，请留在当前作品等待或核对保存结果。');return;}
      if(document.querySelector('[data-dirty="true"]')&&!window.confirm('还有未保存的评分或备注。重新加载会丢弃这些修改，确定继续吗？'))return;
      // Explicit document reload only; never auto-reload, rewrite the URL, or bust module caches.
      window.location.reload();
      return;
    }
    // A deadline does not cancel import(). Re-observe it without claiming a new fetch.
    setLoaded(null);setAttempt(value=>value+1);
  },[group?.slug,loaded]);
  const value=useMemo(()=>({
    input:group&&loaded?.slug===group.slug?loaded.input:null,
    timelineLoading:!!group&&loaded?.slug!==group.slug,
    timelineError:group&&loaded?.slug===group.slug?loaded.error:'',
    onTimelineRetry:retry,timelineRetryLabel:group&&loaded?.slug===group.slug&&loaded.failure==='import'?'重新加载页面':group&&loaded?.slug===group.slug&&loaded.failure==='deadline'?'继续等待':'重新读取',hideLegacyBackground:true,...gates,navigate,
  }),[group?.slug,loaded,retry,gates,navigate]);
  return <ArtistTimelineHostProvider value={value}>{children}</ArtistTimelineHostProvider>;
}
