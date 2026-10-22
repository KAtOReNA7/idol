'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {routeUrl} from '@/lib/idol/journey';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {useAstraIznaIfeyeServices} from './astra-izna-ifeye-services';
import type {AstraSlug,ReviewHandle} from '@/lib/idol/design-review/astra-izna-ifeye-runtime/host.mjs';

/** No catalog, records, media, editorial storage or save request is made. */
export default function AstraIznaIfeyeReview({slug}:{slug:AstraSlug}) {
  const host=useRef<HTMLDivElement>(null),services=useAstraIznaIfeyeServices();
  const [status,setStatus]=useState('正在打开独立审阅…'),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let cancelled=false,handle:ReviewHandle|null=null;
    setFailed(false);setStatus('正在打开独立审阅…');
    void Promise.all([
      import('@/lib/idol/design-review/astra-izna-ifeye-runtime/host.mjs'),
      slug==='izna'?import('@/lib/idol/design-review/astra-izna-ifeye-runtime/izna.json'):import('@/lib/idol/design-review/astra-izna-ifeye-runtime/ifeye.json')
    ]).then(async([module,publicData])=>{
      if(cancelled||!host.current)return;
      handle=module.mountAstraIznaIfeyeReview({host:host.current,data:publicData.default,
        resolveAsset:services.resolveAsset,
        native:services.native?{...services.native,routeUrl,safeArtistReturn}:undefined,
        onStatus:message=>{if(!cancelled)setStatus(message);}});
      await handle.ready;
    }).catch(error=>{
      if(cancelled)return;handle?.destroy();setFailed(true);setStatus(error instanceof Error?error.message:'审阅页面未能打开。');
    });
    return()=>{cancelled=true;handle?.destroy();};
  },[slug,attempt,services]);
  return <section data-astra-review-host={slug} style={{minWidth:0}}>
    <nav aria-label="Astra izna 与 ifeye 审阅" style={{padding:'12px 20px',display:'flex',gap:20,flexWrap:'wrap'}}>
      <Link href="/design-review/astra/izna" aria-current={slug==='izna'?'page':undefined}>izna</Link>
      <Link href="/design-review/astra/ifeye" aria-current={slug==='ifeye'?'page':undefined}>ifeye</Link>
      <a href="/">返回手帐首页</a>
    </nav>
    <div role="status" aria-live="polite" style={{padding:'10px 20px',font:'14px/1.6 Arial,sans-serif'}}>
      {status}{failed&&<> <button type="button" onClick={()=>setAttempt(n=>n+1)}>重新打开</button></>}
    </div>
    <div ref={host}/>
  </section>;
}
