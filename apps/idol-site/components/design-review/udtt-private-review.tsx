'use client';
import {useEffect,useRef,useState} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {routeUrl} from '@/lib/idol/journey';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
import {createUdttPrivateReview,catalogBelongs,type PrivateImageReport} from '@/lib/idol/design-review/sol15-runtime/private-host.mjs';
import type {CatalogView} from '@/lib/idol/types';
const production={routeUrl,safeArtistReturn,stageSourceKey,stageHasValidBinding};
/** Isolated read-only pilot. No upload, mutation, retry, or static image fallback. */
export default function UdttPrivateReview(){
  const host=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState('正在核验 UDTT 私有图片访问…'),[report,setReport]=useState<PrivateImageReport|null>(null);
  useEffect(()=>{
    const controller=new AbortController();let mounted:ReturnType<typeof createUdttPrivateReview>|null=null;
    const readJson=async(path:string,signal:AbortSignal)=>{
      const response=await fetch(path,{cache:'no-store',credentials:'same-origin',signal});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('UDTT 私有候选暂不可用；需要有效访问权限和完整的 11 张图片清单。未改用静态图片。');
      return response.json();
    };
    void catalogReadWithDeadline(async signal=>{
      const catalog=await readJson('/api/catalog?artist=udtt&shape=display-v1',signal) as CatalogView;
      if(!catalogBelongs(catalog))throw new Error('UDTT 资料归属未通过核验，未开放图片或记录入口。');
      const viewer=await readJson('/api/manage/editorial-assets/viewer',signal);
      return {catalog,viewer};
    },controller.signal).then(async({catalog,viewer})=>{
      if(controller.signal.aborted||!host.current)return;
      mounted=createUdttPrivateReview({host:host.current,catalog,viewer,production,onStatus:message=>{if(!controller.signal.aborted)setStatus(message);},onImages:next=>{
        if(controller.signal.aborted)return;setReport(next);
        // Read-only observer surface contains opaque asset IDs, never storage keys/native IDs.
        Object.defineProperty(window,'__udttPrivateImageReport',{configurable:true,value:next,writable:false});
      }});
      await mounted.ready;
    }).catch(error=>{if(!controller.signal.aborted){mounted?.destroy();setStatus(error instanceof Error?error.message:'私有候选暂时无法载入。');}});
    return()=>{controller.abort();mounted?.destroy();};
  },[]);
  const ms=(value:number|null|undefined)=>value==null?'尚未取得':`${Math.round(value)} ms`;
  return <div data-sol15-review-host="udtt-private">
    <div role="status" aria-live="polite" data-private-viewer-status style={{padding:'12px 20px',font:'14px/1.6 Arial, sans-serif',background:'#f4f3eb',color:'#162c32'}}>
      <p>{status}</p>
      {report&&<><p data-private-image-counts>图片共 {report.total} 张：已加载并解码 {report.counts.loaded}，失败 {report.counts.failed}，未触发 {report.counts.notTriggered}，进行中 {report.counts.pending}。{report.allImagesReady?'全部图片已加载并解码。':'页面已挂载不代表图片已就绪。'}</p>
      <p>团体首图：src 交付至 load {ms(report.hero?.srcToLoadMs)}；load 至 decode 完成 {ms(report.hero?.loadToDecodeMs)}。这些不是首屏绘制或 TTFB 时间。</p>
      {report.stopped&&<p>图片队列已停止，不重试或替换来源。若发生超时，原请求可能仍在进行；尚未触发的图片不会继续请求。</p>}</>}
      <p><a href="/design-review/sol15/udtt">UDTT 常规审阅</a> · <a href="/artists/udtt">UDTT 正式页</a></p>
    </div><div ref={host}/>
  </div>;
}
