import {createAstraRuntime} from './runtime.mjs';
import {createIznaModule} from './izna.mjs';
import {createIfeyeModule} from './ifeye.mjs';
import {groups,reviewPath,validRoute,readReviewUrl,nativeHref,reviewState,savedPosition,routeCategory} from './model.mjs';
import {focusKey,restoreFocus} from './focus.mjs';

const owners=new WeakMap();
const reset=`:host{all:initial;display:block;min-width:0;isolation:isolate;color-scheme:light}
[data-astra-review-root]{display:block;min-width:0;direction:ltr;text-align:start;line-height:normal;letter-spacing:normal;font-size:16px}
[data-astra-review-root] *,[data-astra-review-root] *::before,[data-astra-review-root] *::after{box-sizing:border-box}
[data-astra-review-root] .astra-native-pending{margin:24px;padding:16px;border:1px solid currentColor;font:14px/1.6 Arial,sans-serif}
[data-astra-review-root] .astra-native-pending button{font:inherit;padding:8px}.astra-native-pending button:disabled{cursor:not-allowed}
@media(prefers-reduced-motion:reduce){[data-astra-review-root] *,[data-astra-review-root] *::before,[data-astra-review-root] *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}`;

/** Mount the accepted pages in an owned ShadowRoot; never reads a catalog/API.
 * The injected synchronous resolver must return an exact identity binding or null.
 */
export function mountAstraIznaIfeyeReview({host,data,resolveAsset,native,onStatus=()=>{}}) {
  const slug=data?.group?.slug,group=groups[slug],doc=host?.ownerDocument,win=doc?.defaultView;
  if(!win||!group||group.id!==data?.group?.id)throw new TypeError('Exact izna/ifeye public input and host required');
  owners.get(host)?.destroy();
  const shadow=host.shadowRoot??host.attachShadow({mode:'open'});
  if(shadow.childNodes.length)throw new Error('Refusing to overwrite an unowned ShadowRoot');
  const style=doc.createElement('style');style.textContent=reset;
  const root=doc.createElement('div');root.dataset.astraReviewRoot=slug;root.style.visibility='hidden';
  shadow.append(style,root);
  const runtime=createAstraRuntime(win),module=slug==='izna'?createIznaModule(runtime):createIfeyeModule(runtime);
  const path=reviewPath(slug),baseUrl=new URL(path+'/',win.location.origin).href;
  let handle=null,dead=false,mountedUrl=null,replaying=false,settleStyles=null;
  let scrollFrame=null,restoreObserver=null,restoreTimer=null;
  const frames=new Set(),off=[];
  const currentUrl=()=>win.location.pathname+win.location.search+win.location.hash;
  const listen=(node,type,fn,options)=>{if(dead)return;node.addEventListener(type,fn,options);off.push(()=>node.removeEventListener(type,fn,options));};
  const frame=fn=>{const id=win.requestAnimationFrame(()=>{frames.delete(id);if(!dead)fn();});frames.add(id);return id;};
  const remember=(focus=focusKey(root))=>{
    if(dead||!mountedUrl||currentUrl()!==mountedUrl)return;
    win.history.replaceState(reviewState(win.history.state,mountedUrl,win.scrollY,focus),'',mountedUrl);
  };
  const cancelRestore=()=>{restoreObserver?.disconnect();restoreObserver=null;if(restoreTimer!==null)win.clearTimeout(restoreTimer);restoreTimer=null;};
  const restore=saved=>{
    cancelRestore();const url=mountedUrl;
    frame(()=>frame(()=>{
      if(currentUrl()!==url)return;
      const route=readReviewUrl(data,url),eventKey=route?.startsWith('#/timeline?')?new URLSearchParams(route.split('?')[1]).get('event'):null;
      const eventTarget=eventKey?[...root.querySelectorAll('[data-event-key]')].find(n=>n.dataset.eventKey===eventKey):null;
      restoreFocus(root,saved?.focus??(eventTarget?{kind:'event',value:eventKey}:null));
      const apply=()=>{if(!dead&&mountedUrl===url&&currentUrl()===url)win.scrollTo({top:saved?.y??(eventTarget?Math.max(0,eventTarget.getBoundingClientRect().top+win.scrollY-20):0),behavior:'instant'});};
      apply();
      if(win.ResizeObserver){restoreObserver=new win.ResizeObserver(apply);restoreObserver.observe(root);}
      restoreTimer=win.setTimeout(cancelRestore,1500);
    }));
  };
  const canRequest=request=>!dead&&currentUrl()===mountedUrl&&typeof native?.open==='function'&&!!nativeHref(data,request,native);
  const nativeRequest=()=>{
    const hash=readReviewUrl(data,mountedUrl);if(!hash)return null;
    const url=new URL(hash.slice(1),win.location.origin),parts=url.pathname.split('/');
    if(parts[1]==='person')return {action:'open-member',groupId:data.group.id,memberId:decodeURIComponent(parts[2]),returnTo:hash};
    if(parts[1]!=='works'||!url.searchParams.has('detail'))return null;
    const category=routeCategory(data,url.searchParams);
    if(category==='release')return {action:'open-release',groupId:data.group.id,releaseKey:url.searchParams.get('detail'),releaseRecordId:data.releases.find(r=>r.key===url.searchParams.get('detail'))?.recordId??null,returnTo:hash};
    const w=data.works.find(w=>w.key===url.searchParams.get('detail')&&w.type===category);
    return w?{action:'open-work',groupId:data.group.id,workId:w.id??null,videoId:w.videoId,videoType:w.videoType??null,slotType:w.type,returnTo:hash}:null;
  };
  const requestNative=request=>{
    if(!canRequest(request))return false;
    remember();const href=nativeHref(data,request,native);
    return native.open(Object.freeze({...request}),Object.freeze({href,resume:()=>{if(!dead)navigate(request.returnTo);}}))===true;
  };
  const pending=()=>{
    root.querySelector('.astra-native-pending')?.remove();
    const request=nativeRequest();if(!request)return;
    const allowed=canRequest(request),section=doc.createElement('section');section.className='astra-native-pending';
    let button=root.querySelector('[data-open-work],[data-open-release]');
    if(!button){button=doc.createElement('button');button.type='button';button.dataset.astraNativeOpen='true';button.textContent=request.action==='open-member'?'打开成员手帐':request.action==='open-release'?'打开发行记录':'打开作品手帐';section.append(button);}
    button.disabled=!allowed;
    if(!allowed){const reason=doc.createElement('p');reason.id=root.getAttribute('data-astra-instance')+'--native-pending';reason.textContent=request.action==='open-release'?'发行资料可浏览，原生发行记录尚未接入。':'手帐关联待接入，可继续浏览本页资料。';button.setAttribute('aria-describedby',reason.id);section.append(reason);}
    if(request.action==='open-work'){
      const ratingRequest={...request,action:'open-rating'},ratingAllowed=canRequest(ratingRequest);
      const rating=doc.createElement('button');rating.type='button';rating.dataset.astraNativeOpen='open-rating';rating.textContent='评分与记录';rating.disabled=!ratingAllowed;section.append(rating);
      if(!ratingAllowed){const reason=doc.createElement('p');reason.id=root.getAttribute('data-astra-instance')+'--rating-pending';reason.textContent='评分服务待接入；本页不生成或保存评分。';rating.setAttribute('aria-describedby',reason.id);section.append(reason);}
    }
    if(section.childNodes.length)root.querySelector('main')?.append(section);
  };
  function onNavigate(detail) {
    if(dead)return;
    if(!validRoute(data,detail.route))throw new Error('Unsupported review route');
    if(!replaying) {
      const target=path+detail.route;
      if(currentUrl()!==target)win.history.pushState(reviewState(win.history.state,target,0,null),'',target);
      mountedUrl=target;pending();restore(null);
    }else pending();
  }
  const owner={destroy,inspect:()=>runtime.inspect()};owners.set(host,owner);
  function destroy() {
    if(dead)return;
    // A history/security failure must not retain this mount's resources.
    try{remember();}catch{}dead=true;settleStyles?.();cancelRestore();
    for(const id of frames)win.cancelAnimationFrame(id);frames.clear();
    for(const remove of off.splice(0))remove();
    try{handle?.destroy();}finally{
      handle=null;
      try{module.destroy();}finally{
        root.remove();style.remove();
        if(owners.get(host)===owner)owners.delete(host);
      }
    }
  }
  const initial=readReviewUrl(data,currentUrl());
  const ready=(async()=>{
    try {
      if(!initial)throw new Error('审阅地址无效，请从 izna 或 ifeye 审阅入口进入。');
      mountedUrl=path+initial;
      // Normalize the empty hash once, without dropping another history field.
      const saved=savedPosition(win.history.state,mountedUrl);
      win.history.replaceState(reviewState(win.history.state,mountedUrl,saved?.y??win.scrollY,saved?.focus??null),'',mountedUrl);
      handle=module.mount({element:root,data,baseUrl,cssUrl:new URL('/design-review/astra/'+slug+'.css',win.location.origin).href,
        initialRoute:initial,syncHash:false,requireHostCapabilities:true,
        // ALWAYS supply a resolver: no localSrc, public URL or network fallback.
        resolveAsset:(asset,context)=>typeof resolveAsset==='function'?resolveAsset(asset,context):null,
        canRequest,onRequest:requestNative,onNavigate});
      pending();
      const link=[...shadow.querySelectorAll('link[data-astra-owned]')].find(n=>n.dataset.astraOwned===root.getAttribute('data-astra-instance'));
      if(!link)throw new Error('Owned stylesheet is missing');
      await new Promise((resolve,reject)=>{
        let timer=null,done=false;
        const settle=error=>{if(done)return;done=true;if(timer!==null)win.clearTimeout(timer);link.onload=null;link.onerror=null;settleStyles=null;error?reject(error):resolve();};
        settleStyles=()=>settle();link.onload=()=>settle();link.onerror=()=>settle(new Error('本团样式未能载入，请重新进入。'));
        timer=win.setTimeout(()=>settle(new Error('本团样式加载超时，请重新进入。')),15000);
      });
      if(dead)return {status:'destroyed'};
      root.style.removeProperty('visibility');
      onStatus(typeof resolveAsset==='function'?'独立审阅 · 图片使用宿主只读地址':'图片地址待接入 · 可浏览公开资料');
      if(saved)restore(saved);
      return {status:'mounted'};
    }catch(error){destroy();throw error;}
  })();
  function navigate(hash) {
    if(dead||!validRoute(data,hash)||currentUrl()!==mountedUrl)return false;
    remember();handle?.navigate(hash);return true;
  }
  const changed=()=>{
    if(dead||currentUrl()===mountedUrl)return;
    const hash=readReviewUrl(data,currentUrl());
    if(!hash){destroy();onStatus('已离开本团审阅。');return;}
    mountedUrl=currentUrl();const saved=savedPosition(win.history.state,mountedUrl);
    replaying=true;try{handle?.navigate(hash);pending();}finally{replaying=false;}
    restore(saved);
  };
  listen(win,'popstate',changed);listen(win,'hashchange',changed);
  listen(win,'pagehide',()=>remember());
  listen(win,'pageshow',event=>{if(event.persisted&&!dead)restore(savedPosition(win.history.state,mountedUrl));});
  listen(win,'scroll',()=>{if(scrollFrame!==null||restoreObserver)return;scrollFrame=frame(()=>{scrollFrame=null;remember();});},{passive:true});
  for(const name of ['wheel','touchstart','pointerdown','keydown'])listen(win,name,cancelRestore,{passive:true});
  listen(root,'click',event=>{
    const nativeControl=event.target.closest?.('[data-astra-native-open]');
    if(nativeControl){event.preventDefault();const request=nativeRequest();if(request&&!nativeControl.disabled)requestNative(nativeControl.dataset.astraNativeOpen==='open-rating'?{...request,action:'open-rating'}:request);return;}
    const a=event.target.closest?.('a[href]');if(!a)return;
    const href=a.getAttribute('href');
    if(href?.startsWith('#/')&&!validRoute(data,href)){event.preventDefault();event.stopImmediatePropagation();return;}
    remember({kind:'href',value:href});
  },true);
  listen(root,'submit',()=>remember(),true);
  return Object.freeze({ready,root,shadow,navigate,destroy,inspect:owner.inspect});
}
