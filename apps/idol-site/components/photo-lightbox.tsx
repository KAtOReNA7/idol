'use client';
import {useCallback,useEffect,useId,useMemo,useRef,useState,type ComponentProps} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import {ReliableImage} from './reliable-image';
import {startImageLightboxSession} from '../lib/idol/image-lightbox-session';
import type {ImageLightboxOverflowState} from '../lib/idol/image-lightbox-session';

type LightboxImageState=Parameters<NonNullable<ComponentProps<typeof ReliableImage>['onStateChange']>>[0];
function canFocus(element:HTMLElement){
 if(!element.isConnected||element.matches(':disabled')||element.closest('[hidden],[inert]'))return false;
 const style=element.ownerDocument.defaultView?.getComputedStyle(element);
 return style?.display!=='none'&&style?.visibility!=='hidden'&&style?.visibility!=='collapse'&&element.getClientRects().length>0;
}
function focusSafely(element:HTMLElement){
 const temporary=element.tabIndex<0&&!element.hasAttribute('tabindex')&&!element.matches('button,input,select,textarea,a[href],[contenteditable]');
 if(temporary)element.setAttribute('tabindex','-1');
 try{element.focus({preventScroll:true});}finally{if(temporary&&element.getAttribute('tabindex')==='-1')element.removeAttribute('tabindex');}
}
export function PhotoLightbox({src,label,onClose}:{src:string;label:string;onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDivElement>(null),captionId=useId();
 const retryButton=useRef<HTMLButtonElement|null>(null);
 // Ref detachment happens before removal, while focus ownership is still known.
 // Source changes can remove a focused retry without starting a new modal session.
 const attachRetry=useCallback((element:HTMLButtonElement|null)=>{
  const previous=retryButton.current;retryButton.current=element;
  if(!element&&previous&&previous.ownerDocument.activeElement===previous&&dialog.current?.isConnected)close.current?.focus({preventScroll:true});
 },[]);
 const closeLatest=useRef(onClose);closeLatest.current=onClose;
 // A→B→A receives distinct notification ownership even if src and label repeat.
 const request=useMemo(()=>({}),[src,label]),currentRequest=useRef(request);currentRequest.current=request;
 const [imageState,setImageState]=useState<{request:object;state:LightboxImageState}|null>(null);
 const reportState=useCallback((state:LightboxImageState)=>{if(currentRequest.current===request)setImageState({request,state});},[request]);
 const state=imageState?.request===request?imageState.state:null;
 useEffect(()=>{
  const modal=dialog.current;if(!modal)return;
  const doc=modal.ownerDocument,body=doc.body,previous=doc.activeElement as HTMLElement|null;
  const previousMain=previous?.closest<HTMLElement>('main,[role="main"]')??null;
  const readOverflow=():ImageLightboxOverflowState=>({
   overflow:{value:body.style.getPropertyValue('overflow'),priority:body.style.getPropertyPriority('overflow')},
   x:{value:body.style.getPropertyValue('overflow-x'),priority:body.style.getPropertyPriority('overflow-x')},
   y:{value:body.style.getPropertyValue('overflow-y'),priority:body.style.getPropertyPriority('overflow-y')},
  });
  const writeOverflow=(value:ImageLightboxOverflowState)=>{
   body.style.removeProperty('overflow');
   for(const [property,key] of [['overflow','overflow'],['overflow-x','x'],['overflow-y','y']] as const){const item=value[key];if(item.value)body.style.setProperty(property,item.value,item.priority);else body.style.removeProperty(property);}
  };
  return startImageLightboxSession<HTMLElement>({scrollTarget:body,readOverflow,writeOverflow,
   getActiveElement:()=>doc.activeElement as HTMLElement|null,getInitialFocus:()=>close.current,
   getFocusable:()=>Array.from(modal.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex],[contenteditable="true"]')).filter(element=>element.tabIndex>=0&&canFocus(element)).map((element,index)=>({element,index})).sort((a,b)=>{const first=a.element.tabIndex>0?a.element.tabIndex:Infinity,second=b.element.tabIndex>0?b.element.tabIndex:Infinity;return first===second?a.index-b.index:first-second;}).map(({element})=>element),
   getFallbackFocus:()=>previousMain&&canFocus(previousMain)?previousMain:doc.querySelector<HTMLElement>('main,[role="main"]')??body,
   isInside:element=>modal.contains(element),isDocumentFallback:element=>element===body||element===doc.documentElement,
   canFocus,focus:focusSafely,requestClose:()=>closeLatest.current(),
   listenKeydown(listener){const key=(event:KeyboardEvent)=>listener(event);doc.addEventListener('keydown',key);return()=>doc.removeEventListener('keydown',key);},
  });
 },[]);
 // Portals have no server DOM target; the actual img is rendered immediately on
 // client mount, with its unmodified supplied source and native eager loading.
 if(typeof document==='undefined')return null;
 return createPortal(<div ref={dialog} className="photo-lightbox" role="dialog" aria-modal="true" aria-labelledby={captionId} onClick={e=>{if(e.target===e.currentTarget)closeLatest.current();}}><button ref={close} type="button" className="photo-lightbox-close" aria-label="关闭大图" onClick={()=>closeLatest.current()}><X size={21}/>关闭</button><figure><ReliableImage original src={src} alt={label} identityKey={label} priority loading="eager" decoding="async" retryMode="manual" onStateChange={reportState} missing={<p className="photo-lightbox-error">没有可展开的图片。</p>} errorFallback={<p className="photo-lightbox-error" role="status">图片暂时打不开，可以重试。</p>}/>{state?.status==='error'&&<button ref={attachRetry} type="button" className="photo-lightbox-retry" disabled={!state.canRetry} style={{minHeight:44,padding:'10px 16px',color:'#18151c',background:'#fff',border:'1px solid currentColor',borderRadius:8}} onClick={event=>{event.preventDefault();event.stopPropagation();const ownsFocus=event.currentTarget.ownerDocument.activeElement===event.currentTarget;if(state.retry()&&ownsFocus)close.current?.focus({preventScroll:true});}}>重试图片</button>}<figcaption id={captionId}>{label}</figcaption></figure></div>,document.body);
}
