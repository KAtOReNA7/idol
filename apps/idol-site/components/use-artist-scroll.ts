'use client';
import {useCallback,useEffect,useLayoutEffect,useRef} from 'react';

import {useMemberWorkFocus} from './use-member-work-focus';
import {useArtistRosterReturn} from './use-artist-roster-return';

// Same-tab navigation position only. Never persists catalog data or drafts.
export function useArtistScroll(ready:boolean,routeKey:string){
 useMemberWorkFocus(ready,routeKey);
 const restoring=useRef(true);
 const remember=useCallback(()=>{if(!ready||restoring.current)return;history.replaceState({...history.state,artistScroll:{path:location.pathname+location.search,y:window.scrollY}},'',location.href);},[ready]);
 useEffect(()=>{let frame=0;const scroll=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;remember();});};addEventListener('scroll',scroll,{passive:true});addEventListener('pagehide',remember);return()=>{removeEventListener('scroll',scroll);removeEventListener('pagehide',remember);cancelAnimationFrame(frame);};},[remember]);
 useLayoutEffect(()=>{if(!ready)return;
 // The timeline owns return focus and geometry once its real data/CSS gate opens.
 // Do not start a second ResizeObserver that races its restored target.
 if(history.state?.timelineReturn?.path===location.pathname+location.search&&document.querySelector('[data-timeline-host]')){
  restoring.current=true;
  const release=()=>{
   restoring.current=false;
   if(history.state?.timelineReturn?.path===location.pathname+location.search){const next={...history.state};delete next.timelineReturn;history.replaceState(next,'',location.href);}
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
 const rememberNavigation=useCallback(()=>{
  // Explicit navigation ends timeline restoration ownership. Preserve this
  // source entry's latest position, but not a stale event-focus instruction.
  restoring.current=false;
  if(history.state?.timelineReturn?.path===location.pathname+location.search){const next={...history.state};delete next.timelineReturn;history.replaceState(next,'',location.href);}
  remember();
  // A new in-page departure supersedes the old work-link return target.
  // Passive scroll/pagehide captures must keep that target for normal returns.
  const state=history.state;
  if(state?.memberWorkFocus?.path!==location.pathname+location.search)return;
  const next={...state};delete next.memberWorkFocus;
  history.replaceState(next,'',location.href);
 },[remember]);
 return rememberNavigation;
}
