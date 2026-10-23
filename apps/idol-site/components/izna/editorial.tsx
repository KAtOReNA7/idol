'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {routeUrl} from '@/lib/idol/journey';
import {validIznaCatalog,iznaAssetResolver,iznaNativeBindings,prepareIznaDisplayData} from '@/lib/idol/izna-native';
import type {CatalogView} from '@/lib/idol/types';
import type {ReviewHandle,NativeServices} from '@/lib/idol/izna-runtime/host.mjs';

export default function IznaEditorial({onNativeOpen}:{onNativeOpen?:NativeServices['open']}={}){
 const options=useArtistTimelineHostOptions(),host=useRef<HTMLDivElement>(null);
 const [attempt,setAttempt]=useState(0),[mountAttempt,setMountAttempt]=useState(0),[status,setStatus]=useState('正在打开 izna…'),[failed,setFailed]=useState(false);
 const [fetched,setFetched]=useState<{catalog:CatalogView|null;loading:boolean;error:string}>({catalog:null,loading:true,error:''});
 const injected=options.catalog!==undefined;
 const catalog=injected?(validIznaCatalog(options.catalog)?options.catalog:null):fetched.catalog;
 const loading=injected?(options.loading??false):fetched.loading;
 const error=injected?(options.error||(options.catalog!==null&&!validIznaCatalog(options.catalog)?'记录所属团体未能核验。':'')):fetched.error;
 const display=useMemo(()=>prepareIznaDisplayData(catalog),[catalog]);
 const bindings=useMemo(()=>iznaNativeBindings(catalog),[catalog]);
 useEffect(()=>{
  if(injected)return;const controller=new AbortController();setFetched({catalog:null,loading:true,error:''});
  void catalogReadWithDeadline(async signal=>{
   const response=await fetch('/api/catalog?artist=izna&shape=display-v1',{signal,cache:'no-store',credentials:'same-origin'});
   if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('暂时无法读取手帐记录。');
   const data:unknown=await response.json();if(!validIznaCatalog(data))throw new Error('记录所属团体或视频身份未能核验。');return data;
  },controller.signal).then(catalog=>{if(!controller.signal.aborted)setFetched({catalog,loading:false,error:''});}).catch(error=>{if(!controller.signal.aborted)setFetched({catalog:null,loading:false,error:error instanceof Error?error.message:'暂时无法读取手帐记录。'});});
  return()=>controller.abort();
 },[injected,attempt]);
 useEffect(()=>{
  let cancelled=false,handle:ReviewHandle|null=null;setFailed(false);setStatus('正在打开 izna…');
  void import('@/lib/idol/izna-runtime/host.mjs').then(async module=>{
   if(cancelled||!host.current)return;
   handle=module.mountIznaEditorial({host:host.current,data:display,resolveAsset:iznaAssetResolver,
    native:{bindings,routeUrl,safeArtistReturn,open:onNativeOpen??((_request,context)=>{window.location.assign(context.href);return true;})},
    onStatus:message=>{if(!cancelled)setStatus(message);}});
   await handle.ready;
  }).catch(error=>{if(cancelled)return;handle?.destroy();setFailed(true);setStatus(error instanceof Error?error.message:'页面暂时无法打开。');});
  return()=>{cancelled=true;handle?.destroy();};
 },[display,bindings,onNativeOpen,mountAttempt]);
 return <section data-izna-native-host="true" style={{minWidth:0}}>
  <div style={{padding:'12px 20px',font:'14px/1.6 Arial,sans-serif',display:'flex',gap:16,flexWrap:'wrap'}}><a href="/?view=groups">← 团体索引</a>{loading?<span role="status">正在读取手帐关联…</span>:error?<span role="alert">{error} 公开资料仍可浏览。 <button type="button" onClick={()=>options.onRetry?options.onRetry():setAttempt(n=>n+1)}>重新读取</button></span>:null}</div>
  {status&&<div role="status" aria-live="polite" style={{padding:'10px 20px',font:'14px/1.6 Arial,sans-serif'}}>{status}{failed&&<> <button type="button" onClick={()=>setMountAttempt(n=>n+1)}>重新打开</button></>}</div>}
  <div ref={host}/>
 </section>;
}
