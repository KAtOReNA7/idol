'use client';
import {useEffect,useRef,useState} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {routeUrl} from '@/lib/idol/journey';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
import {createUdttReview,catalogBelongs,prepareUdttNativePortrait,type NativePortraitBinding} from '@/lib/idol/design-review/sol15-runtime/host.mjs';
import type {CatalogView} from '@/lib/idol/types';
const production={routeUrl,safeArtistReturn,stageSourceKey,stageHasValidBinding};
/** This route reads the existing authenticated catalog. It never saves records. */
export default function UdttReview(){
  const host=useRef<HTMLDivElement>(null);
  const [attempt,setAttempt]=useState(0),[status,setStatus]=useState('正在读取 UDTT 资料…'),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();let mounted:ReturnType<typeof createUdttReview>|null=null;let nativePortrait:NativePortraitBinding|null=null;
    void catalogReadWithDeadline(async signal=>{
      const response=await fetch('/api/catalog?artist=udtt&shape=display-v1',{cache:'no-store',signal});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('资料库暂时无法读取，请稍后重试。');
      const catalog=await response.json() as CatalogView;
      if(!catalogBelongs(catalog))throw new Error('资料所属团体未能核验，暂不开放记录入口。');
      const responseViewer=await fetch('/api/manage/editorial-assets/viewer',{cache:'no-store',credentials:'same-origin',signal});
      if(!responseViewer.ok||!responseViewer.headers.get('content-type')?.includes('application/json'))throw new Error('私有图片暂不可用；未使用静态图片替代。');
      return {catalog,viewer:await responseViewer.json()};
    },controller.signal).then(async ({catalog,viewer})=>{
      if(controller.signal.aborted||!host.current)return;
      nativePortrait=await prepareUdttNativePortrait({catalog,viewer,production,window,signal:controller.signal});
      if(controller.signal.aborted||!host.current){nativePortrait.destroy();return;}
      mounted=createUdttReview({host:host.current,catalog,viewer,production,nativePortrait,onStatus:(message:string)=>{if(!controller.signal.aborted)setStatus(message);}});
      await mounted.ready;
    }).catch(error=>{if(!controller.signal.aborted){mounted?.destroy();nativePortrait?.destroy();setFailed(true);setStatus(error instanceof Error?error.message:'审阅页暂时无法载入。');}});
    return()=>{controller.abort();mounted?.destroy();nativePortrait?.destroy();};
  },[attempt]);
  return <div data-sol15-review-host="udtt">
    <div role="status" aria-live="polite" style={{padding:'12px 20px',font:'14px/1.6 Arial, sans-serif',background:'#f4f3eb',color:'#162c32'}}>{status}{failed&&<> <button type="button" onClick={()=>{setFailed(false);setStatus('正在读取 UDTT 资料…');setAttempt(value=>value+1);}}>重新读取</button></>}</div>
    <div ref={host}/>
  </div>;
}
