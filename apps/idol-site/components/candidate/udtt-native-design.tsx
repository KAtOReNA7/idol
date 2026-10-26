'use client';
import {useEffect,useRef,useState} from 'react';
import {useCanEdit} from '@/components/public-access';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {routeUrl} from '@/lib/idol/journey';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
import {createUdttNative,catalogBelongs,prepareUdttNativePortrait,type NativePortraitBinding} from '@/lib/idol/udtt-native/host.mjs';
import type {CatalogView} from '@/lib/idol/types';
const production={routeUrl,safeArtistReturn,stageSourceKey,stageHasValidBinding};
/** Native artist presentation. Reads the existing catalog; edits remain in the existing owner-enforced editor. */
export default function UdttNativeDesign(){
  const canEdit=useCanEdit();
  const host=useRef<HTMLDivElement>(null);
  const [attempt,setAttempt]=useState(0),[status,setStatus]=useState('正在读取 UDTT 资料…'),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();let mounted:ReturnType<typeof createUdttNative>|null=null;let nativePortrait:NativePortraitBinding|null=null;
    void catalogReadWithDeadline(async signal=>{
      const response=await fetch('/api/catalog?artist=udtt&shape=display-v1',{cache:'no-store',signal});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('资料库暂时无法读取，请稍后重试。');
      const catalog=await response.json() as CatalogView;
      if(!catalogBelongs(catalog))throw new Error('资料所属团体未能核验，暂不开放记录入口。');
      const responseViewer=await fetch(canEdit?'/api/manage/editorial-assets/viewer':'/api/editorial-assets/viewer',{cache:'no-store',credentials:'same-origin',signal});
      if(!responseViewer.ok||!responseViewer.headers.get('content-type')?.includes('application/json'))throw new Error('图片暂不可用；未使用其他图片替代。');
      const viewer:unknown=await responseViewer.json();
      const entries=viewer&&typeof viewer==='object'&&'entries' in viewer?viewer.entries:null;
      if(!Array.isArray(entries)||entries.length!==(canEdit?11:10))throw new Error('图片尚未全部发布，完整页面暂不可用。');
      return {catalog,viewer};
    },controller.signal).then(async ({catalog,viewer})=>{
      if(controller.signal.aborted||!host.current)return;
      nativePortrait=await prepareUdttNativePortrait({catalog,viewer,production,window,publicMode:!canEdit,signal:controller.signal});
      if(controller.signal.aborted||!host.current){nativePortrait.destroy();return;}
      mounted=createUdttNative({host:host.current,catalog,viewer,production,canEdit,nativePortrait,onStatus:(message:string)=>{if(!controller.signal.aborted)setStatus(message);}});
      await mounted.ready;
    }).catch(error=>{if(!controller.signal.aborted){mounted?.destroy();nativePortrait?.destroy();setFailed(true);setStatus(error instanceof Error?error.message:'页面暂时无法载入。');}});
    return()=>{controller.abort();mounted?.destroy();nativePortrait?.destroy();};
  },[attempt,canEdit]);
  return <div data-udtt-native-host="true">
    <link rel="stylesheet" href="/fonts/udtt/fonts.css"/>
    <div role="status" aria-live="polite" style={status==='UDTT · 资料已载入'?{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)'}:{padding:'12px 20px',font:'14px/1.6 Arial, sans-serif',background:'#f4f3eb',color:'#162c32'}}>{status}{failed&&<> <button type="button" onClick={()=>{setFailed(false);setStatus('正在读取 UDTT 资料…');setAttempt(value=>value+1);}}>重新读取</button></>}</div>
    <div ref={host}/>
  </div>;
}
