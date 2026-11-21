'use client';
import {useCallback,useEffect,useLayoutEffect,useRef} from 'react';

import {useMemberWorkFocus} from './use-member-work-focus';
import {useArtistRosterReturn} from './use-artist-roster-return';
import {tryArtistHistoryChange} from '../lib/idol/timeline/history-state';

const currentPath = () => location.pathname + location.search;
const scrollWriteInterval = 500;

// Same-tab navigation position only. Never persists catalog data or drafts.
export function useArtistScroll(ready:boolean,routeKey:string){
 useMemberWorkFocus(ready,routeKey);
 const restoring=useRef(true);
 const remember = useCallback((departure = false) => {
  const path = currentPath();
  const state = history.state;
  const y = window.scrollY;
  const moved = ready && !restoring.current && (state?.artistScroll?.path !== path || state.artistScroll.y !== y);
  const clearTimeline = departure && state?.timelineReturn?.path === path;
  const clearWork = departure && state?.memberWorkFocus?.path === path;
  if (!moved && !clearTimeline && !clearWork) return;
  const next = {...state};
  if (moved) next.artistScroll = {path, y};
  if (clearTimeline) delete next.timelineReturn;
  if (clearWork) delete next.memberWorkFocus;
  tryArtistHistoryChange(() => history.replaceState(next, '', location.href));
 }, [ready]);
 useEffect(() => {
  if (!ready) return;
  const path = currentPath();
  let timer = 0;
  let nextWrite = 0;
  function save() {
   timer = 0;
   if (restoring.current || currentPath() !== path) return;
   nextWrite = performance.now() + scrollWriteInterval;
   remember();
  }
  function scroll() {
   if (timer || restoring.current || currentPath() !== path) return;
   const delay = nextWrite - performance.now();
   if (delay > 0) timer = window.setTimeout(save, delay);
   else save();
  }
  function flush() {
   window.clearTimeout(timer);
   save();
  }
  addEventListener('scroll', scroll, {passive: true});
  addEventListener('scrollend', flush);
  addEventListener('pagehide', flush);
  return () => {
   removeEventListener('scroll', scroll);
   removeEventListener('scrollend', flush);
   removeEventListener('pagehide', flush);
   window.clearTimeout(timer);
  };
 }, [ready, remember, routeKey]);
 useLayoutEffect(()=>{if(!ready)return;
 // The timeline owns return focus and geometry once its real data/CSS gate opens.
 // Do not start a second ResizeObserver that races its restored target.
 if(history.state?.timelineReturn?.path===location.pathname+location.search&&document.querySelector('[data-timeline-host]')){
  restoring.current=true;
  const release=()=>{
   restoring.current=false;
   if(history.state?.timelineReturn?.path===currentPath()){const next={...history.state};delete next.timelineReturn;tryArtistHistoryChange(()=>history.replaceState(next,'',location.href));}
  };
  const events=['wheel','touchstart','pointerdown','keydown'];events.forEach(e=>addEventListener(e,release,{passive:true}));
  return()=>{events.forEach(e=>removeEventListener(e,release));restoring.current=false;};
 }
 const saved=history.state?.artistScroll;const y=saved?.path===location.pathname+location.search&&Number.isFinite(saved.y)&&saved.y>=0?saved.y:null;if(y===null){restoring.current=false;return;}restoring.current=true;let active=true,frame=0;
 const apply=()=>{if(active){window.scrollTo({top:y,behavior:'instant'});restoring.current=Math.abs(window.scrollY-y)>2;}};
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(apply);};const observer=new ResizeObserver(schedule);observer.observe(document.querySelector('main')??document.body);
 const stop=()=>{active=false;restoring.current=false;observer.disconnect();cancelAnimationFrame(frame);};const events=['wheel','touchstart','pointerdown','keydown'];events.forEach(e=>addEventListener(e,stop,{passive:true}));schedule();
 return()=>{stop();events.forEach(e=>removeEventListener(e,stop));};
 },[ready,routeKey]);
 useArtistRosterReturn(ready,routeKey);
 const rememberNavigation = useCallback(() => {
  restoring.current = false;
  remember(true);
 }, [remember]);
 return rememberNavigation;
}
