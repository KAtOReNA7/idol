'use client';
import {useEffect,useRef,useState} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {routeUrl} from '@/lib/idol/journey';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
import {createVchaReview,catalogBelongs} from '@/lib/idol/design-review/vcha-runtime/host.mjs';
import type {CatalogView} from '@/lib/idol/types';
const production={routeUrl,safeArtistReturn,stageSourceKey,stageHasValidBinding};
/** This route reads the existing authenticated catalog. It never saves records. */
export default function VchaReview(){
  const host=useRef<HTMLDivElement>(null);
  const [attempt,setAttempt]=useState(0),[status,setStatus]=useState('正在读取 VCHA 资料…'),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();let mounted:ReturnType<typeof createVchaReview>|null=null;
    void catalogReadWithDeadline(async signal=>{
      const response=await fetch('/api/catalog?artist=vcha&shape=display-v1',{cache:'no-store',signal});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('资料库暂时无法读取，请稍后重试。');
      const catalog=await response.json() as CatalogView;
      if(!catalogBelongs(catalog))throw new Error('资料所属团体未能核验，暂不开放记录入口。');
      return catalog;
    },controller.signal).then(async catalog=>{
      if(controller.signal.aborted||!host.current)return;
      mounted=createVchaReview({host:host.current,catalog,production,onStatus:(message:string)=>{if(!controller.signal.aborted)setStatus(message);}});
      await mounted.ready;
    }).catch(error=>{if(!controller.signal.aborted){mounted?.destroy();setFailed(true);setStatus(error instanceof Error?error.message:'审阅页暂时无法载入。');}});
    return()=>{controller.abort();mounted?.destroy();};
  },[attempt]);
  return <div data-sol15-review-host="vcha">
    <div role="status" aria-live="polite" style={{padding:'12px 20px',font:'14px/1.6 Arial, sans-serif',background:'#f4f3eb',color:'#162c32'}}>{status}{failed&&<> <button type="button" onClick={()=>{setFailed(false);setStatus('正在读取 VCHA 资料…');setAttempt(value=>value+1);}}>重新读取</button></>}</div>
    <div ref={host}/>
  </div>;
}
