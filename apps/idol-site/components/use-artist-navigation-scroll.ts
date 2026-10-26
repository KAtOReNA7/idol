'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';

// Opt-in section navigation only: history restoration remains useArtistScroll's job.
export function useArtistNavigationScroll(ready:boolean,routeKey:string){
 const pending=useRef<string|null>(null);
 const [request,setRequest]=useState(0);
 const queue=useCallback((href:string|null)=>{
  pending.current=href;
  // Also commit repeated clicks on the current route, without remounting its editors.
  setRequest(value=>value+1);
 },[]);
 useEffect(()=>{
  const cancel=()=>{pending.current=null;};
  window.addEventListener('popstate',cancel,true);
  return()=>window.removeEventListener('popstate',cancel,true);
 },[]);
 useLayoutEffect(()=>{
  if(!pending.current)return;
  // A newer navigation must never scroll the previous destination's DOM.
  if(pending.current!==window.location.href){pending.current=null;return;}
  if(!ready||routeKey!==pending.current)return;
  pending.current=null;
  document.getElementById('artist-content')?.scrollIntoView({block:'start',behavior:'instant'});
 },[ready,routeKey,request]);
 return queue;
}
