'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type SetStateAction} from 'react';
import {readInsightsViewState,type InsightsViewState} from '@/lib/idol/personal-insights/view-state';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {defaultFilters,newEntry,nextEntry,readEntry,routeUrl,type BrowseEntry,type BrowseFilters,type Route,type WatchSequence} from '@/lib/idol/journey';

import type {RestoreResolution} from '@/lib/idol/library-browser/contract';
import {useExperienceStyles} from './use-experience-styles';
import {restoreMemberWorkFocus} from './use-member-work-focus';
import {useMemberWorkFocus} from './use-member-work-focus';

import {newHomeRotation,type HomeRotation} from '@/lib/idol/home-rotation';

// Only navigation preferences live in this tab's history. Scores, notes and record data never do.
export function useBrowseJourney(dataReady:boolean,stylesheetForRoute:(route:Route)=>string|undefined=()=>undefined,contentReadyForRoute:(route:Route)=>boolean=()=>true){
 const [entry,setEntry]=useState<BrowseEntry>(()=>newEntry('/'));
 const styles=useExperienceStyles(stylesheetForRoute(entry.route));
 const styleReady=styles.phase==='ready'||styles.phase==='not-required';
 const [libraryMounted,setLibraryMounted]=useState<string|null>(null);
 const [restoreSequence,setRestoreSequence]=useState(0);
 const libraryList=entry.route.nav==='works'&&!entry.route.work&&!entry.route.member&&!entry.route.groupId;
 const libraryMountKey=entry.position+':'+restoreSequence;
 const ready=dataReady&&styleReady&&contentReadyForRoute(entry.route)&&(!libraryList||libraryMounted===libraryMountKey);
 const liveReady=useRef(ready);liveReady.current=ready;
 useMemberWorkFocus(ready,routeUrl(entry.route),false);
 const current=useRef(entry),restoring=useRef(true),skipPop=useRef(false),backApproved=useRef(false);
 const write=(e:BrowseEntry)=>{current.current=e;history.replaceState({...history.state,idolBrowse:e},'',routeUrl(e.route));};
 // Never overwrite saved geometry with hidden/loading DOM; cleanup also keeps
 // capture frozen until visible content receives a user interaction.
 const capture=()=>{if(!liveReady.current||restoring.current)return current.current;const e={...current.current,scrollY:restoring.current?current.current.scrollY:window.scrollY};if(e.route.nav==='groups'&&!e.route.groupId&&!e.route.work&&!e.route.member){const focused=(document.activeElement as HTMLElement|null)?.closest<HTMLElement>('[data-browse-anchor]')?.dataset.browseAnchor;if(focused?.startsWith('group-'))e.groupIndexFocus=focused;}if(!restoring.current){if((e.route.nav==='works'||e.route.nav==='records'||e.route.nav==='insights')&&!e.route.work&&!e.route.member&&!e.route.groupId){const focused=document.activeElement?.closest<HTMLElement>('[data-browse-anchor], [data-library-focus]');e.libraryFocus=focused?.dataset.browseAnchor??focused?.dataset.libraryFocus;}const anchors=[...document.querySelectorAll<HTMLElement>('[data-browse-anchor]')].map(node=>({id:node.dataset.browseAnchor!,rect:node.getBoundingClientRect()})).filter(x=>x.rect.bottom>0&&x.rect.top<window.innerHeight).sort((a,b)=>Math.abs(a.rect.top)-Math.abs(b.rect.top));e.anchor=anchors[0]?{id:anchors[0].id,offset:anchors[0].rect.top}:undefined;}if(!e.route.work&&!e.route.member&&!e.route.groupId)e.listScroll={...e.listScroll,[e.route.nav]:e.scrollY};write(e);return e;};
 const mayLeave=()=>{if(document.querySelector('[data-navigation-blocked="true"]')){window.alert('本次保存还未确认，请留在当前作品等待或核对保存结果。');return false;}return !document.querySelector('[data-dirty="true"]')||window.confirm('还有未保存的评分或备注。确定离开吗？');};
 useEffect(()=>{
  const initial=readEntry(history.state,location.href)??newEntry(location.href);if((performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined)?.type!=='back_forward'||!initial.home)initial.home=newHomeRotation(initial.home);current.current=initial;setEntry(initial);setRestoreSequence(n=>n+1);write(initial);
  const prior=history.scrollRestoration;history.scrollRestoration='manual';let frame=0;
  const scroll=()=>{if(!liveReady.current||restoring.current||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(liveReady.current&&!restoring.current)capture();});};
  const pop=()=>{
   if(skipPop.current){skipPop.current=false;return;}
   const target=readEntry(history.state,location.href)??newEntry(location.href);
   if(!backApproved.current&&!mayLeave()){const delta=current.current.position-target.position;if(delta){skipPop.current=true;history.go(delta);}else history.pushState({idolBrowse:current.current},'',routeUrl(current.current.route));return;}
   backApproved.current=false;restoring.current=true;current.current=target;setEntry(target);setRestoreSequence(n=>n+1);
  };
  addEventListener('scroll',scroll,{passive:true});addEventListener('popstate',pop);
  return()=>{removeEventListener('scroll',scroll);removeEventListener('popstate',pop);cancelAnimationFrame(frame);history.scrollRestoration=prior;};
 },[]);
 useLayoutEffect(()=>{
  restoring.current=true;if(!ready)return;let active=true,frame=0;
  const requested=current.current;let focused=false,recordsFallback=false;
  const apply=()=>{
   if(!active||!liveReady.current||current.current.position!==requested.position)return;
   const anchor=requested.anchor&&[...document.querySelectorAll<HTMLElement>('[data-browse-anchor]')].find(node=>node.dataset.browseAnchor===requested.anchor!.id);
   let target=anchor?Math.max(0,window.scrollY+anchor.getBoundingClientRect().top-requested.anchor!.offset):requested.scrollY;
   const recordsList=(requested.route.nav==='records'||requested.route.nav==='works'||requested.route.nav==='insights')&&!requested.route.work&&!requested.route.member&&!requested.route.groupId;
   if(recordsList&&requested.libraryFocus&&!recordsFallback){const exists=[...document.querySelectorAll<HTMLElement>('[data-browse-anchor], [data-library-focus]')].some(n=>(n.dataset.browseAnchor??n.dataset.libraryFocus)===requested.libraryFocus);if(!exists){recordsFallback=true;focused=false;}}
   if(!focused&&requested.route.nav==='groups'&&!requested.route.groupId&&!requested.route.work&&!requested.route.member&&requested.groupIndexFocus){const card=[...document.querySelectorAll<HTMLElement>('[data-browse-anchor]')].find(node=>node.dataset.browseAnchor===requested.groupIndexFocus);if(card){card.focus({preventScroll:true});focused=document.activeElement===card;}}
   if(!focused&&(requested.route.nav==='works'||requested.route.nav==='records'||requested.route.nav==='insights')&&!requested.route.work&&!requested.route.member&&!requested.route.groupId&&requested.libraryFocus){const node=(!recordsFallback?[...document.querySelectorAll<HTMLElement>('[data-browse-anchor], [data-library-focus]')].find(n=>(n.dataset.browseAnchor??n.dataset.libraryFocus)===requested.libraryFocus):null)??document.querySelector<HTMLElement>(requested.route.nav==='insights'?'[data-insights-focus=fallback]':'[data-library-focus=search]');if(node){node.focus({preventScroll:true});focused=true;}}
   // A deleted/filtered-out record must not leave the focused search box offscreen.
   // Latch this fallback through ResizeObserver/font passes until user takeover.
   if(recordsFallback){const search=document.querySelector<HTMLElement>(requested.route.nav==='insights'?'[data-insights-focus=fallback]':'[data-library-focus=search]');target=search?Math.max(0,window.scrollY+search.getBoundingClientRect().top-96):0;}
   // Keep requested geometry immutable through late font/image layout shifts.
   window.scrollTo({top:target,behavior:'instant'});if(!focused)focused=restoreMemberWorkFocus();
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(apply);};
  const observer=new ResizeObserver(schedule);observer.observe(document.querySelector('main')??document.body);
  const stop=()=>{active=false;observer.disconnect();cancelAnimationFrame(frame);};
  const takeover=(event:Event)=>{const target=event.target as Element|null;if(!liveReady.current||!target?.closest||target.closest('[data-style-status], [data-module-status], [inert], [role=dialog]')||!!document.querySelector('[role=dialog][aria-modal=true]'))return;restoring.current=false;stop();};
  const fonts=document.fonts;const fontReady=()=>{if(active)schedule();};void fonts?.ready.then(fontReady);fonts?.addEventListener('loadingdone',fontReady);
  const events=['wheel','touchstart','pointerdown','keydown'];for(const event of events)addEventListener(event,takeover,{passive:true});schedule();
  return()=>{stop();fonts?.removeEventListener('loadingdone',fontReady);for(const event of events)removeEventListener(event,takeover);};
 },[ready,entry.position,restoreSequence]);
 function navigate(next:Partial<Route>,label:string,patch?:Partial<BrowseFilters>,sequence?:WatchSequence){
  if(!mayLeave())return false;const before=capture();const e=nextEntry(before,next,label,patch,sequence);restoring.current=true;current.current=e;history.pushState({idolBrowse:e},'',routeUrl(e.route));setEntry(e);return true;
 }
 // A new document is the honest recovery for native ESM load failures.
 // Reuse the same save/draft guard; never refresh automatically.
 function reloadPage(){if(!mayLeave())return false;capture();window.location.reload();return true;}
 function leaveTo(href:string,preferBack=false){const safe=safeArtistReturn(href);if(!safe||!mayLeave())return false;capture();if(preferBack&&history.length>1){try{const ref=new URL(document.referrer),current=new URL(location.href);if(ref.origin===current.origin&&safeArtistReturn(ref.pathname+ref.search)===safe){history.back();return true;}}catch{}}window.location.assign(safe);return true;}
 function continueWork(id:string){
  const previous=current.current;if(!previous.route.work||!previous.sequence||previous.sequence.ids.indexOf(previous.route.work)<0||previous.sequence.ids.indexOf(id)<=previous.sequence.ids.indexOf(previous.route.work)||!mayLeave())return false;const before=capture();const e=nextEntry(before,{work:id,member:null,video:'mv'},'',undefined,before.sequence);e.from=before.from;restoring.current=true;current.current=e;history.pushState({idolBrowse:e},'',routeUrl(e.route));setEntry(e);return true;
 }
 function back(fallback:Route){
  if(!current.current.from){navigate(fallback,'');return;}if(!mayLeave())return;const e=capture();backApproved.current=true;restoring.current=true;history.go(e.from!.position-e.position);
 }
 function updateInsights(action:SetStateAction<InsightsViewState>){const previous=readInsightsViewState(current.current.insights);const insights=readInsightsViewState(typeof action==='function'?action(previous):action);const updated={...current.current,insights};write(updated);setEntry(updated);}
 function updateFilters(patch:Partial<BrowseFilters>){const e=current.current;const reset=Object.keys(patch).some(k=>!['limit','page','pageSize'].includes(k));const updated={...e,lists:{...e.lists,[e.route.nav]:{...e.lists[e.route.nav],...patch,...(reset&&e.route.nav==='works'?{page:1}:{})}},listScroll:reset?{...e.listScroll,[e.route.nav]:0}:e.listScroll,...(reset?{scrollY:0}:{}),...(reset&&e.route.nav==='works'?{anchor:undefined,libraryFocus:undefined}:{}),...(reset&&e.route.nav==='groups'?{anchor:undefined,groupIndexFocus:undefined}:{})};write(updated);setEntry(updated);}
 function updateGroupFilters(patch:Partial<BrowseFilters>){const e=current.current,id=e.route.groupId;if(!id)return;const updated={...e,groupLists:{...e.groupLists,[id]:{...defaultFilters(),...e.groupLists?.[id],...patch,group:id}}};write(updated);setEntry(updated);}
 function setVideo(video:'mv'|'stage'){const updated={...current.current,route:{...current.current.route,video}};write(updated);setEntry(updated);}
 function setLibraryPage(page:number,pageSize:24|48){
  if(!Number.isSafeInteger(page)||page<1||page>10000)return;
  restoring.current=false;
  const e=current.current;const updated={...e,lists:{...e.lists,works:{...e.lists.works,page,pageSize}},anchor:undefined,libraryFocus:undefined};write(updated);setEntry(updated);
 }
 function libraryRestoreMounted(result:RestoreResolution){
  const e=current.current;if(e.position!==entry.position)return;
  const updated={...e,lists:{...e.lists,works:{...e.lists.works,page:result.page}},...(result.reason==='missing-anchor'?{anchor:undefined,libraryFocus:'search',scrollY:0}:{})};
  write(updated);setEntry(updated);setLibraryMounted(libraryMountKey);
 }
 const updateHome=useCallback((home:HomeRotation)=>{const updated={...current.current,home};write(updated);setEntry(updated);},[]);
 return {insights:readInsightsViewState(entry.insights),updateInsights,libraryRestoreTarget:libraryList&&restoring.current?{anchorId:entry.anchor?.id,offset:entry.anchor?.offset,page:entry.lists.works.page,legacyLimit:entry.lists.works.limit,focusId:entry.libraryFocus,requestKey:libraryMountKey}:undefined,libraryRestoreMounted,setLibraryPage,displayReady:ready,styleReady,stylePhase:styles.phase,retryStyles:styles.retry,reloadPage,leaveTo,home:entry.home,updateHome,route:entry.route,sequence:entry.sequence,continueWork,filters:entry.lists[entry.route.nav]??defaultFilters(),groupFilters:entry.route.groupId?entry.groupLists?.[entry.route.groupId]??{...defaultFilters(),group:entry.route.groupId}:defaultFilters(),updateGroupFilters,backLabel:entry.from?.label,navigate,back,updateFilters,setVideo};
}
