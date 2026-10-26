'use client';
import {useLayoutEffect,useRef} from 'react';
import {readWooahLinkFocus,type WooahLinkFocus} from '@/lib/idol/wooah-return-focus';
function focusTarget(url:string){
 const saved=readWooahLinkFocus(history.state?.wooahLinkFocus,url);if(!saved)return null;
 return [...document.querySelectorAll<HTMLAnchorElement>('[data-artist="wooah"] [data-wooah-link-trigger]')].find(node=>node.dataset.wooahLinkTrigger===saved.key&&node.getAttribute('href')===saved.href&&node.getAttribute('aria-disabled')!=='true'&&!node.closest('[inert],[hidden],[aria-hidden="true"]')&&node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden')??null;
}
/** Same entry-local ownership pattern as reviewed GENBLUE 2.2; never take focus back from user input. */
export function useWooahLinkReturnFocus(url:string,loading:boolean){
 const previous=useRef<string|null>(null);
 const ownership=useRef<(WooahLinkFocus&{node:HTMLAnchorElement|null})|null>(null);
 useLayoutEffect(()=>{
  if(previous.current!==url){previous.current=url;const saved=readWooahLinkFocus(history.state?.wooahLinkFocus,url);ownership.current=saved?{...saved,node:null}:null;}
  const saved=ownership.current;if(!saved)return;
  const frame=requestAnimationFrame(()=>{
   if(ownership.current!==saved||document.querySelector('[aria-modal="true"],dialog[open]'))return;
   if(saved.node&&(saved.node.isConnected||document.activeElement!==document.body))return;
   const current=readWooahLinkFocus(history.state?.wooahLinkFocus,url);
   if(!current||current.key!==saved.key||current.href!==saved.href){ownership.current=null;return;}
   const target=focusTarget(url);
   if(target){saved.node=target;target.focus({preventScroll:true});}
   else if(!loading){ownership.current=null;document.getElementById('wooah-main')?.focus({preventScroll:true});}
  });
  return()=>cancelAnimationFrame(frame);
 });
 useLayoutEffect(()=>{
  const cancel=()=>{ownership.current=null;};
  const focus=(event:FocusEvent)=>{const saved=ownership.current;if(!saved||event.target===saved.node)return;if(event.target===document.body&&saved.node&&!saved.node.isConnected)return;cancel();};
  const events=['pointerdown','keydown','wheel','touchstart'];
  events.forEach(name=>document.addEventListener(name,cancel,true));document.addEventListener('focusin',focus,true);
  return()=>{events.forEach(name=>document.removeEventListener(name,cancel,true));document.removeEventListener('focusin',focus,true);ownership.current=null;previous.current=null;};
 },[]);
}
