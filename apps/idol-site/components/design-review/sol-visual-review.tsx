'use client';

import {createContext,useContext,useEffect,useLayoutEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {ImageRecoveryProvider,ImageRecoveryControls,ReliableImage} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {loadArtistTimeline} from '@/lib/idol/timeline/production';
import {publicMediaActionHref,publicMemberActionHref,resolvePublicArtistEntity} from '@/lib/idol/public-artist-bridge';
import {SOL_REVIEW_PATHS,canonicalSolReviewUrl,solReviewHref,readSolReviewRoute,solReviewData,solReviewTimeline,solTimelineFields,solReviewNavigationPlan,solReviewReturnPlan} from '@/lib/idol/design-review/sol-review-model';
import type {SolSlug,SolLinkProps,SolPictureProps,SolViewProps,SolMember,SolWork} from '@/lib/idol/design-review/sol-review-types';
import type {CatalogView} from '@/lib/idol/types';
import {ResceneVisualView,ResceneWorkDetail} from './rescene-visual-views';
import {PurplekissVisualView,PurplekissWorkDetail} from './purplekiss-visual-views';

const currentUrl=()=>location.pathname+location.search+location.hash;
function subscribe(listener:()=>void){window.addEventListener('popstate',listener);window.addEventListener('artist-location-change',listener);return()=>{window.removeEventListener('popstate',listener);window.removeEventListener('artist-location-change',listener);};}
/** No editor exists here, but departures still obey live host save/draft/modal gates. */
export function solReviewMayLeave(root:ParentNode,ownDialog:HTMLDialogElement|null,confirm:(message:string)=>boolean,alert:(message:string)=>void):boolean {
  if([...root.querySelectorAll('[aria-modal="true"], dialog[open]')].some(node=>node!==ownDialog))return false;
  if(root.querySelector('[data-navigation-blocked="true"]')){alert('本次保存还未确认，请留在当前作品等待或核对保存结果。');return false;}
  return !root.querySelector('[data-dirty="true"]')||confirm('还有未保存的评分或备注。确定离开吗？');
}
const Ui=createContext<{slug:SolSlug;navigate:(url:string|null,focus?:string)=>void;zoom:(image:{src:string;label:string})=>void}>({slug:'rescene',navigate:()=>{},zoom:()=>{}});
function Link({href,children,...props}:SolLinkProps){
  const ui=useContext(Ui);
  if(!href)return <span className={props.className}>{children}</span>;
  return <a {...props} href={href} onClick={event=>{props.onClick?.(event);if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(canonicalSolReviewUrl(ui.slug,href)){event.preventDefault();ui.navigate(href,href);}}}>{children}</a>;
}
function Picture({src,alt,className='',priority=false,zoom=false}:SolPictureProps){
  const ui=useContext(Ui);
  const picture=<span className={`media-frame ${className}`}><ReliableImage src={src} alt={alt} identityKey={src??alt} priority={priority} retryMode="external" missing={<span>{alt} · 图片暂缺</span>} errorFallback={<span>{alt} · 图片暂时无法加载</span>}/></span>;
  return zoom&&src?<button type="button" className="sol-image-zoom" aria-label={`放大${alt}`} aria-haspopup="dialog" onClick={()=>ui.zoom({src,label:alt})}>{picture}</button>:picture;
}
export default function SolVisualReview({slug,catalogOverride,timelineOverride,serverRoute}:{slug:SolSlug;catalogOverride?:CatalogView|null;timelineOverride?:unknown;serverRoute?:string}){
  const url=useSyncExternalStore(subscribe,currentUrl,()=>serverRoute??SOL_REVIEW_PATHS[slug]);
  const route=useMemo(()=>readSolReviewRoute(slug,url),[slug,url]);
  const [attempt,setAttempt]=useState(0),[timelineAttempt,setTimelineAttempt]=useState(0);
  const [fetched,setFetched]=useState<{catalog:CatalogView|null;loading:boolean;error:string}>({catalog:null,loading:true,error:''});
  const state=catalogOverride===undefined?fetched:{catalog:catalogOverride,loading:false,error:''};
  const [timelineState,setTimelineState]=useState<{input:unknown;loading:boolean;error:string;failure?:'deadline'|'import'}>({input:null,loading:true,error:''});
  const timelineData=timelineOverride===undefined?timelineState:{input:timelineOverride,loading:false,error:''};
  const data=useMemo(()=>solReviewData(slug,state.catalog),[slug,state.catalog]);
  const timeline=useMemo(()=>solReviewTimeline(slug,timelineData.input,state.catalog),[slug,timelineData.input,state.catalog]);
  const group=resolvePublicArtistEntity(slug,{kind:'group',key:slug},state.catalog);
  const ready=!state.loading&&!state.error&&!!group;
  const rememberScroll=useArtistScroll(ready,url);
  const root=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),imageDialog=useRef<HTMLDialogElement>(null),pendingBack=useRef(false);
  const [lightbox,setLightbox]=useState<{src:string;label:string}|null>(null);
  const detail=route.valid&&!route.member?data.works.find(work=>work.key===(route.release??route.media)):undefined;
  const hasDetail=ready&&!!detail;
  const historyKey=`${slug}SolReviewOpener`,focusKey=`${slug}SolReviewFocus`;
  const focusMain=()=>root.current?.querySelector<HTMLElement>('main')?.focus({preventScroll:true});
  useEffect(()=>{const changed=()=>{pendingBack.current=false;setLightbox(null);};window.addEventListener('popstate',changed);window.addEventListener('artist-location-change',changed);return()=>{window.removeEventListener('popstate',changed);window.removeEventListener('artist-location-change',changed);};},[]);
  useEffect(()=>{
    if(catalogOverride!==undefined)return;
    const controller=new AbortController();
    void catalogReadWithDeadline(async signal=>{
      const response=await fetch(`/api/catalog?artist=${slug}&shape=display-v1`,{cache:'no-store',signal});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('暂时没有连上你的资料库。');
      const catalog=await response.json() as CatalogView;
      if(!catalog||!Array.isArray(catalog.groups)||!Array.isArray(catalog.members)||!Array.isArray(catalog.works)||!Array.isArray(catalog.ratings))throw new Error('资料暂时没有加载完整。');
      if(!resolvePublicArtistEntity(slug,{kind:'group',key:slug},catalog))throw new Error('资料所属团体与当前预览不一致。');
      return catalog;
    },controller.signal).then(catalog=>{if(!controller.signal.aborted)setFetched({catalog,loading:false,error:''});},error=>{if(!controller.signal.aborted)setFetched({catalog:null,loading:false,error:error instanceof Error?error.message:'资料暂时无法读取。'});});
    return()=>controller.abort();
  },[slug,catalogOverride,attempt]);
  useEffect(()=>{
    if(timelineOverride!==undefined)return;
    let active=true;
    const timer=setTimeout(()=>{if(active){active=false;setTimelineState({input:null,loading:false,error:'时间轴仍在加载，可继续读取。',failure:'deadline'});}},15000);
    loadArtistTimeline(slug).then(({input})=>{if(active){clearTimeout(timer);setTimelineState({input,loading:false,error:''});}},()=>{if(active){clearTimeout(timer);setTimelineState({input:null,loading:false,error:'时间轴模块未能加载，可重新加载页面。',failure:'import'});}});
    return()=>{active=false;clearTimeout(timer);};
  },[slug,timelineOverride,timelineAttempt]);
  useEffect(()=>{
    const node=dialog.current;if(!hasDetail||!node)return;
    const previous=document.activeElement as HTMLElement|null;
    if(!node.open)node.showModal();node.scrollTop=0;
    return()=>{if(node.open)node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[hasDetail,detail?.key]);
  useEffect(()=>{
    const node=imageDialog.current;if(!lightbox||!node)return;
    const previous=document.activeElement as HTMLElement|null;
    if(!node.open)node.showModal();
    return()=>{if(node.open)node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[lightbox]);
  const modalOpen=hasDetail||!!lightbox;
  useEffect(()=>{if(!modalOpen)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[modalOpen]);
  useEffect(()=>{
    if(!ready||hasDetail||lightbox)return;
    const id=route.event??(route.year?`timeline-year-${route.year}`:null);if(!id)return;
    const frame=requestAnimationFrame(()=>{const target=document.getElementById(id);if(target&&root.current?.contains(target)){target.scrollIntoView({block:'start'});target.focus({preventScroll:true});}});
    return()=>cancelAnimationFrame(frame);
  },[ready,hasDetail,lightbox,route.event,route.year,timeline.events]);
  useLayoutEffect(()=>{
    if(!ready||lightbox||hasDetail)return;
    const saved=history.state?.[focusKey];
    if(saved?.path!==url||typeof saved.href!=='string'||!canonicalSolReviewUrl(slug,saved.href))return;
    const frame=requestAnimationFrame(()=>{const target=[...(root.current?.querySelectorAll<HTMLAnchorElement>('a[href]')??[])].find(node=>node.getAttribute('href')===saved.href);if(target?.isConnected)target.focus({preventScroll:true});});
    return()=>cancelAnimationFrame(frame);
  },[slug,ready,url,lightbox,hasDetail,focusKey]);
  function mayLeave(){return solReviewMayLeave(document,dialog.current,message=>window.confirm(message),message=>window.alert(message));}
  function navigate(target:string|null,focus?:string,filter=false){
    if(pendingBack.current||!target||!canonicalSolReviewUrl(slug,target)||currentUrl()!==url||!mayLeave()||target===url)return;
    const plan=solReviewNavigationPlan(slug,url,target,history.state?.[historyKey],focus??null);if(!plan)return;
    rememberScroll();
    if(focus&&canonicalSolReviewUrl(slug,focus))history.replaceState({...history.state,[focusKey]:{path:url,href:focus}},'',url);
    const next=newArtistHistoryState(history.state);delete next[historyKey];delete next[focusKey];
    if(plan.opener)next[historyKey]=plan.opener;
    if(filter)next.artistScroll={path:target,y:window.scrollY};
    history[filter?'replaceState':plan.method](next,'',target);window.dispatchEvent(new Event('artist-location-change'));
    const nextRoute=readSolReviewRoute(slug,target);if(!filter&&!nextRoute.release&&!nextRoute.media){window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(focusMain);}
  }
  function returnToOpener(){
    if(pendingBack.current||currentUrl()!==url||!mayLeave())return;
    const opener=solReviewReturnPlan(slug,url,history.state?.[historyKey]);
    if(opener?.parentEntry){pendingBack.current=true;history.back();return;}
    if(opener){const next=newArtistHistoryState(history.state);delete next[historyKey];delete next[focusKey];if(opener.focus)next[focusKey]={path:opener.href,href:opener.focus};history.replaceState(next,'',opener.href);window.dispatchEvent(new Event('artist-location-change'));requestAnimationFrame(focusMain);}
  }
  function memberAction(member:SolMember){
    if(pendingBack.current||!route.canonical||currentUrl()!==url||!mayLeave())return;
    const href=publicMemberActionHref({slug,key:member.id,memberId:member.id,returnTo:route.canonical,currentArtistUrl:canonicalSolReviewUrl(slug,currentUrl())??''},state.catalog);
    if(href){rememberScroll();location.assign(href);}
  }
  function mediaAction(work:SolWork,action:'play'|'records'){
    if(pendingBack.current||work.kind==='release'||!route.canonical||currentUrl()!==url||!mayLeave())return;
    const resolved=resolvePublicArtistEntity(slug,{kind:work.kind,key:work.key},state.catalog);
    if(!resolved||(resolved.kind!=='mv'&&resolved.kind!=='stage')||resolved.work.id!==work.workId||resolved.videoId!==work.videoId)return;
    const href=publicMediaActionHref({slug,kind:work.kind,key:work.key,action,workId:resolved.work.id,videoId:resolved.videoId,returnTo:route.canonical,currentArtistUrl:canonicalSolReviewUrl(slug,currentUrl())??''},state.catalog);
    if(href){rememberScroll();location.assign(href);}
  }
  const props:SolViewProps={data,route,events:timeline.events,Link,Picture,href:fields=>solReviewHref(slug,fields),onFilter:fields=>navigate(solReviewHref(slug,fields),undefined,true),onReturn:returnToOpener,onMemberAction:memberAction,onMediaAction:mediaAction,timelineLoading:timelineData.loading,timelineError:timelineData.error||(timeline.state==='invalid'?'时间轴资料未通过校验。':''),onTimelineRetry:()=>{if(currentUrl()!==url||!mayLeave())return;if(timelineState.failure==='import'){location.reload();return;}setTimelineState({input:null,loading:true,error:''});setTimelineAttempt(value=>value+1);},timelineFields:event=>solTimelineFields(slug,event)};
  const View=slug==='rescene'?ResceneVisualView:PurplekissVisualView,WorkDetail=slug==='rescene'?ResceneWorkDetail:PurplekissWorkDetail;
  return <Ui.Provider value={{slug,navigate,zoom:image=>{if(currentUrl()===url&&mayLeave())setLightbox(image);}}}><ImageRecoveryProvider><div ref={root} className={`${slug}-visual-review`} data-design-review={`${slug}-visual-v1`} data-visual-acceptance="pending" data-figma-acceptance="not-accepted" aria-busy={state.loading}>
    {!route.valid?<main className="sol-status" tabIndex={-1}><h1>这个预览链接无效</h1><Link href={solReviewHref(slug)}>返回首页</Link></main>:state.loading?<main className="sol-status" tabIndex={-1}><p role="status">正在打开 {data.name}…</p></main>:state.error?<main className="sol-status" tabIndex={-1}><h1>资料暂时无法读取</h1><p role="alert">{state.error}</p><button type="button" onClick={()=>{setFetched({catalog:null,loading:true,error:''});setAttempt(value=>value+1);}}>重新读取</button></main>:!group?<main className="sol-status" tabIndex={-1}><h1>未找到匹配的 {data.name} 资料</h1><p>当前资料库没有提供唯一、有效的本团身份。</p></main>:<View {...props}/>}
    {!hasDetail&&!lightbox&&<ImageRecoveryControls/>}
    <dialog ref={dialog} className="detail-dialog" aria-labelledby="work-dialog-title" onCancel={event=>{event.preventDefault();returnToOpener();}} onClick={event=>{if(event.target!==event.currentTarget)return;const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)returnToOpener();}}>{hasDetail&&<><button type="button" className="dialog-close" aria-label="关闭作品详情" onClick={returnToOpener}>关闭 ×</button><WorkDetail {...props} work={detail}/>{!lightbox&&<ImageRecoveryControls/>}</>}</dialog>
    <dialog ref={imageDialog} className="sol-image-dialog" aria-labelledby={`${slug}-image-caption`} onCancel={event=>{event.preventDefault();setLightbox(null);}} onClick={event=>{if(event.target!==event.currentTarget)return;const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)setLightbox(null);}}>{lightbox&&<><button type="button" className="dialog-close" aria-label="关闭图片" onClick={()=>setLightbox(null)}>关闭 ×</button><figure><ReliableImage src={lightbox.src} alt={lightbox.label} identityKey={lightbox.src} priority/><figcaption id={`${slug}-image-caption`}>{lightbox.label}</figcaption></figure><ImageRecoveryControls/></>}</dialog>
  </div></ImageRecoveryProvider></Ui.Provider>;
}
