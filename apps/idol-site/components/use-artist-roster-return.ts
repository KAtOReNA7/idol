'use client';
import {useLayoutEffect,useRef} from 'react';

const memberKey=/^rec[A-Za-z0-9]+$/;
function route(value:string){try{const u=new URL(value,'https://site.invalid');return {path:u.pathname,section:u.searchParams.get('section'),member:u.searchParams.get('member'),roster:u.searchParams.get('roster')==='history'?'history':'current'};}catch{return null;}}

// Restore the member-card target after leaving an in-page member detail.
// History holds navigation context only, never scores, drafts or catalog records.
export function useArtistRosterReturn(ready:boolean,routeKey:string){
 const previous=useRef<string|null>(null);
 useLayoutEffect(()=>{
  if(!ready)return;
  const before=previous.current?route(previous.current):null,current=route(routeKey);
  previous.current=routeKey;
  if(!current||current.member)return;
  const path=location.pathname+location.search;
  const origin=history.state?.artistRosterFocus;
  const exact=origin?.path===path&&memberKey.test(origin.key)&&['portrait','profile','index'].includes(origin.action);
  if(current.section!=='members'&&!exact)return;
  if(!exact&&before?.path===current.path&&before.roster===current.roster&&before.member&&memberKey.test(before.member)){
   history.replaceState({...history.state,artistRosterFocus:{path,key:before.member}},'',location.href);
  }
  const saved=history.state?.artistRosterFocus;
  if(saved?.path!==path||typeof saved.key!=='string'||!memberKey.test(saved.key))return;
  const frame=requestAnimationFrame(()=>{
   if(document.querySelector('[role="dialog"][aria-modal="true"]'))return;
   const matches=[...document.querySelectorAll<HTMLElement>('[data-artist-member-trigger]')]
    .filter(node=>node.dataset.artistMemberTrigger===saved.key&&node.getClientRects().length);
   const target=matches.find(node=>node.dataset.artistRosterAction===saved.action)??matches[0];
   if(!target||target.matches(':disabled'))return;
   target.focus({preventScroll:true});
   // Browser Back restores its exact saved scroll; explicit "all members" needs
   // the target brought into view after the shared section-top scroll.
   const scroll=history.state?.artistScroll;
   if(scroll?.path!==path||!Number.isFinite(scroll.y)||scroll.y<0)target.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  return()=>cancelAnimationFrame(frame);
 },[ready,routeKey]);
}
