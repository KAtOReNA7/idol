'use client';
import {useLayoutEffect,useRef,useState} from 'react';
export type StylePhase='loading'|'ready'|'error'|'not-required';
type Asset={phase:StylePhase;listeners:Set<()=>void>;dispose:()=>void};
const assets=new Map<string,Asset>();
function asset(href:string,retry=false):Asset{
 const prior=assets.get(href);if(prior&&!retry)return prior;
 prior?.dispose();
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;
 const entry:Asset={phase:'loading',listeners:new Set(),dispose:()=>{}};assets.set(href,entry);
 let timer:ReturnType<typeof setTimeout>;
 const finish=(phase:StylePhase)=>{if(assets.get(href)!==entry||entry.phase!=='loading')return;entry.phase=phase;clearTimeout(timer);if(phase==='error')entry.dispose();for(const listener of entry.listeners)listener();};
 const load=()=>finish('ready'),error=()=>finish('error');
 entry.dispose=()=>{clearTimeout(timer);link.removeEventListener('load',load);link.removeEventListener('error',error);link.remove();};
 link.addEventListener('load',load);link.addEventListener('error',error);timer=setTimeout(error,15000);
 try{document.head.appendChild(link);}catch{finish('error');}return entry;
}
// Cache ownership is separate from React effects, so StrictMode cleanup cannot
// remove a stylesheet while a replayed effect waits for the same resource.
export function useExperienceStyles(href:string|undefined){
 const [attempt,setAttempt]=useState(0);
 const retryHref=useRef<string|undefined>(undefined);
 const [state,setState]=useState<{href?:string;attempt:number;phase:StylePhase}>({attempt:0,phase:'not-required'});
 useLayoutEffect(()=>{
  if(!href){setState({href,attempt,phase:'not-required'});return;}
  const retry=retryHref.current===href;retryHref.current=undefined;
  const entry=asset(href,retry);let active=true;
  const update=()=>{if(active)setState({href,attempt,phase:entry.phase});};entry.listeners.add(update);update();
  return()=>{active=false;entry.listeners.delete(update);};
 },[href,attempt]);
 const phase=!href?'not-required':state.href===href&&state.attempt===attempt?state.phase:'loading';
 return {phase,retry:()=>{retryHref.current=href;setAttempt(n=>n+1);}};
}
