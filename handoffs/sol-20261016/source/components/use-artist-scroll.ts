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
 useLayoutEffect(()=>{if(!ready)return;const saved=history.state?.artistScroll;const y=saved?.path===location.pathname+location.search&&Number.isFinite(saved.y)&&saved.y>=0?saved.y:null;if(y===null){restoring.current=false;return;}restoring.current=true;let active=true,frame=0;
 const apply=()=>{if(active){window.scrollTo({top:y,behavior:'instant'});restoring.current=Math.abs(window.scrollY-y)>2;}};
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(apply);};const observer=new ResizeObserver(schedule);observer.observe(document.querySelector('main')??document.body);
 const stop=()=>{active=false;restoring.current=false;observer.disconnect();cancelAnimationFrame(frame);};const events=['wheel','touchstart','pointerdown','keydown'];events.forEach(e=>addEventListener(e,stop,{passive:true}));schedule();
 return()=>{stop();events.forEach(e=>removeEventListener(e,stop));};
 },[ready,routeKey]);
 useArtistRosterReturn(ready,routeKey);
 const rememberNavigation=useCallback(()=>{
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
