'use client';
import {useEffect,useRef,useState} from 'react';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {routeUrl} from '@/lib/idol/journey';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {stageSourceKey,stageHasValidBinding} from '@/lib/idol/stage-source';
import {createVchaReview,catalogBelongs} from '@/lib/idol/design-review/vcha-runtime/host.mjs';
import type {CatalogView} from '@/lib/idol/types';
import './vcha-container-validation.css';

type Width=320|390|1440;
const widths=[320,390,1440] as const;
const production={routeUrl,safeArtistReturn,stageSourceKey,stageHasValidBinding};
const framePath=(width:Width)=>`/design-review/sol15/vcha-container/frame/${width}`;

/** Read-only candidate: existing authenticated catalog and existing native routes. */
export function VchaContainerFrame({width}:{width:Width}){
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
      mounted=createVchaReview({host:host.current,catalog,production,validationWidth:width,onStatus:message=>{if(!controller.signal.aborted)setStatus(message);}});
      await mounted.ready;
    }).catch(error=>{if(!controller.signal.aborted){mounted?.destroy();setFailed(true);setStatus(error instanceof Error?error.message:'验证候选暂时无法载入。');}});
    return()=>{controller.abort();mounted?.destroy();};
  },[attempt,width]);
  return <div className="vcha-container-frame-page">
    <aside className="vcha-container-frame-label">VCHA · 容器验证候选 · 宿主目标 {width}px。原审阅页与正式页未替换。</aside>
    <p className="vcha-container-status" role="status" aria-live="polite">{status}{failed&&<> <button type="button" onClick={()=>{setFailed(false);setStatus('正在读取 VCHA 资料…');setAttempt(value=>value+1);}}>重新读取</button></>}</p>
    <div ref={host} data-vcha-container-mount=""/>
  </div>;
}

type Geometry={
  viewport:number;documentWidth:number;hostWidth:number;hostClientWidth:number;hostScrollWidth:number;
  headingWidth:number;textWidth:number;fontSize:string;fontFamily:string;
  letterSpacing:string;overflowX:string;headingOverflowX:string;
};
export default function VchaContainerValidation(){
  const [width,setWidth]=useState<Width>(320),[mode,setMode]=useState<'wide'|'matched'>('wide'),[fit,setFit]=useState(true);
  const [available,setAvailable]=useState<number|null>(null),[geometry,setGeometry]=useState<Geometry|null>(null),[notice,setNotice]=useState('仅显示布局数据，不读取或输出评分、备注、观看状态。');
  const outer=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null);
  const viewport=mode==='wide'?1440:width;
  const scale=fit&&available!==null?Math.min(1,available/viewport):1;
  useEffect(()=>{
    const element=outer.current;if(!element)return;
    const measure=()=>setAvailable(element.clientWidth);measure();
    const observer=new ResizeObserver(measure);observer.observe(element);return()=>observer.disconnect();
  },[]);
  function mayReplaceFrame(){
    // Native destinations are unchanged and can contain an editor. Do not discard
    // that document when switching a validation fixture.
    try{
      const doc=frame.current?.contentDocument;if(!doc)return !frame.current;
      const shadow=doc.querySelector('[data-vcha-container-mount]')?.shadowRoot;
      const regions=shadow?[doc,shadow]:[doc];
      if(regions.some(region=>region.querySelector('[aria-modal="true"],dialog[open]'))){setNotice('请先关闭候选中的弹窗，再切换验证尺寸。');return false;}
      if(regions.some(region=>region.querySelector('[data-navigation-blocked="true"]'))){setNotice('本次保存还未确认，请先在手帐中核对保存结果。');return false;}
      if(regions.some(region=>region.querySelector('[data-dirty="true"]'))&&!window.confirm('还有未保存的评分或备注。切换验证尺寸会丢弃这些修改，确定继续吗？'))return false;
      return true;
    }catch{setNotice('当前页面状态无法核验，未切换验证尺寸。');return false;}
  }
  async function measure(){
    const win=frame.current?.contentWindow,doc=frame.current?.contentDocument;
    if(!win||!doc){setNotice('候选尚未载入，请稍后读取。');return;}
    await doc.fonts.ready;
    if(frame.current?.contentDocument!==doc)return;
    const root=doc.querySelector('[data-vcha-container-mount]')?.shadowRoot?.querySelector<HTMLElement>('[data-host-connection="vcha-container-validation"]');
    const heading=root?.querySelector<HTMLElement>('.vc-cover-title h1');
    if(!root||!heading){setGeometry(null);setNotice('请先等待样式载入，并回到候选首页后读取标题布局。');return;}
    const range=doc.createRange();range.selectNodeContents(heading);
    const style=win.getComputedStyle(heading);
    // Whitelisted geometry/style fields only. Never serialize DOM, catalog, or records.
    setGeometry({viewport:win.innerWidth,documentWidth:doc.documentElement.clientWidth,hostWidth:root.getBoundingClientRect().width,hostClientWidth:root.clientWidth,hostScrollWidth:root.scrollWidth,headingWidth:heading.getBoundingClientRect().width,textWidth:range.getBoundingClientRect().width,fontSize:style.fontSize,fontFamily:style.fontFamily,letterSpacing:style.letterSpacing,overflowX:win.getComputedStyle(root).overflowX,headingOverflowX:style.overflowX});
    setNotice('这是当前浏览器的布局读数，不自动代表视觉验收通过。请同时检查实际页面与完整文字。');
  }
  return <main className="vcha-container-validation">
    <header><h1>VCHA · 容器验证候选</h1><p>只验证同一设计在窄宿主中的表现，不替换原审阅页或正式页面，不写入个人记录。</p><p><a href="/design-review/sol15/vcha">原 VCHA 审阅页</a> · <a href="/artists/vcha">VCHA 正式页</a></p></header>
    <div className="vcha-container-controls">
      <fieldset><legend>宿主宽度</legend>{widths.map(value=><button key={value} type="button" aria-pressed={width===value} onClick={()=>{if(value!==width&&mayReplaceFrame()){setWidth(value);setGeometry(null);}}}>{value}px</button>)}</fieldset>
      <label>iframe 布局视口<select value={mode} onChange={event=>{const value=event.target.value;if((value==='wide'||value==='matched')&&value!==mode&&mayReplaceFrame()){setMode(value);setGeometry(null);}}}><option value="wide">固定 1440px</option><option value="matched">与宿主同宽</option></select></label>
      <label><input type="checkbox" checked={fit} onChange={event=>setFit(event.target.checked)}/>缩放以适应屏幕</label>
      <button type="button" onClick={()=>{void measure();}}>读取首页布局</button>
    </div>
    <p aria-live="polite">iframe 视口目标 {viewport}px / 宿主目标 {width}px；外层显示比例 {Math.round(scale*100)}%。缩放只改变外层显示，不改变 iframe 布局视口。实际宽度以下方读数为准。</p>
    <p>依次检查 1440/320、1440/390、320/320、390/390，以及 1440/1440 桌面；页面仍须人工视觉检查。</p>
    <div className="vcha-container-canvas" ref={outer}><div className="vcha-container-space" style={{width:viewport*scale,height:1000*scale}}><iframe key={`${viewport}:${width}`} ref={frame} title={`VCHA 验证候选：视口 ${viewport}px，宿主 ${width}px`} src={framePath(width)} width={viewport} height={1000} style={{width:viewport,height:1000,maxWidth:'none',transform:`scale(${scale})`}}/></div></div>
    <section className="vcha-container-diagnostics" aria-label="只读布局诊断"><p role="status">{notice}</p>{geometry&&<dl>{Object.entries(geometry).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{typeof value==='number'?Math.round(value*1000)/1000:value}</dd></div>)}</dl>}</section>
  </main>;
}
