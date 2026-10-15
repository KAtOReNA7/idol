'use client';
import {useEffect,useLayoutEffect} from 'react';

const selector='[data-member-work-trigger]';
const path=()=>location.pathname+location.search;

// A history-entry navigation preference only; never stores ratings or draft input.
export function useMemberWorkFocus(ready:boolean,routeKey:string){
 useEffect(()=>{
  const remember=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const trigger=event.target instanceof Element?event.target.closest<HTMLElement>(selector):null;
   if(!trigger||trigger.matches(':disabled')||trigger.closest('[role="dialog"]'))return;
   history.replaceState({...history.state,memberWorkFocus:{path:path(),key:trigger.dataset.memberWorkTrigger}},'',location.href);
  };
  // Capture before the shared SPA handler replaces the current history entry.
  document.addEventListener('click',remember,true);
  return()=>document.removeEventListener('click',remember,true);
 },[]);
 useLayoutEffect(()=>{
  if(!ready)return;
  const saved=history.state?.memberWorkFocus;
  if(saved?.path!==path()||typeof saved.key!=='string')return;
  const frame=requestAnimationFrame(()=>{
   if(document.querySelector('[role="dialog"][aria-modal="true"]'))return;
   const trigger=[...document.querySelectorAll<HTMLElement>(selector)].find(node=>node.dataset.memberWorkTrigger===saved.key);
   if(trigger&&!trigger.matches(':disabled'))trigger.focus({preventScroll:true});
  });
  return()=>cancelAnimationFrame(frame);
 },[ready,routeKey]);
}
