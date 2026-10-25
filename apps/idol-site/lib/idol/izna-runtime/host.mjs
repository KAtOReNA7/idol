import {createAstraRuntime} from './runtime.mjs';
import {createIznaModule} from './izna.mjs';
import {groups,reviewPath,validRoute,readReviewUrl,artistUrl,nativeHref,reviewState,savedPosition,publicPosition,routeCategory} from './model.mjs';
import {deepActiveElement,focusKey,restoreFocus} from './focus.mjs';

const owners=new WeakMap();
const nativeActions=new Set(['open-member','open-work','open-rating']);
export function readIznaNavigationFocus(root){
  const active=deepActiveElement(root.ownerDocument),action=active?.dataset?.iznaNativeFocus;
  return root.contains(active)&&nativeActions.has(action)?{kind:'native',value:action}:focusKey(root);
}
export function restoreIznaNavigationFocus(root,key){
  if(key?.kind==='native'&&nativeActions.has(key.value)){
    const button=[...root.querySelectorAll('[data-izna-native-focus]')].find(n=>n.dataset.iznaNativeFocus===key.value);
    if(button&&!button.disabled&&!button.closest('[hidden],[inert],[aria-hidden="true"]')){button.focus({preventScroll:true});return true;}
    restoreFocus(root,null);return false;
  }
  restoreFocus(root,key);return true;
}
const reset=`:host{all:initial;display:block;min-width:0;isolation:isolate;color-scheme:light}
[data-astra-review-root]{display:block;min-width:0;direction:ltr;text-align:start;line-height:normal;letter-spacing:normal;font-size:16px}
[data-astra-review-root] *,[data-astra-review-root] *::before,[data-astra-review-root] *::after{box-sizing:border-box}
[data-astra-review-root] .astra-native-pending{margin:24px;padding:16px;border:1px solid currentColor;font:14px/1.6 Arial,sans-serif}
[data-astra-review-root] .astra-native-pending button{font:inherit;padding:8px}.astra-native-pending button:disabled{cursor:not-allowed}
@media(prefers-reduced-motion:reduce){[data-astra-review-root] *,[data-astra-review-root] *::before,[data-astra-review-root] *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}`;

/** Mount the accepted pages in an owned ShadowRoot; never reads a catalog/API.
 * The injected synchronous resolver must return an exact identity binding or null.
 */
export function mountIznaEditorial({host,data,resolveAsset,native,onStatus=()=>{},onHomeChange=()=>{}}) {
  const slug=data?.group?.slug,group=groups[slug],doc=host?.ownerDocument,win=doc?.defaultView;
  if(!win||!group||group.id!==data?.group?.id)throw new TypeError('Exact izna public input and host required');
  owners.get(host)?.destroy();
  const shadow=host.shadowRoot??host.attachShadow({mode:'open'});
  if(shadow.childNodes.length)throw new Error('Refusing to overwrite an unowned ShadowRoot');
  const style=doc.createElement('style');style.textContent=reset;
  const root=doc.createElement('div');root.dataset.astraReviewRoot=slug;root.style.visibility='hidden';
  const informationStyle=doc.createElement('link');informationStyle.rel='stylesheet';informationStyle.href='/artist/group-information.css';
  shadow.append(style,informationStyle,root);
  const runtime=createAstraRuntime(win),module=createIznaModule(runtime);
  const path=reviewPath(slug),baseUrl=new URL(path+'/',win.location.origin).href;
  let handle=null,dead=false,mountedUrl=null,mountedRoute=null,replaying=false,settleStyles=null,deferredNativeFocus=null;
  let scrollFrame=null,restoreObserver=null,restoreTimer=null,restoreEpoch=0;
  const frames=new Set(),off=[];
  const currentUrl=()=>win.location.pathname+win.location.search+win.location.hash;
  const navigationFocus=()=>readIznaNavigationFocus(root)??deferredNativeFocus;
  const restoreNavigationFocus=key=>{
    // A fresh native page mounts public content before its catalog response.
    // Retain only this finite key across that remount; new user input cancels it.
    deferredNativeFocus=restoreIznaNavigationFocus(root,key)?null:key;
  };
  const storageKey='izna.public-navigation.v1';
  const stored=()=>{try{const raw=win.sessionStorage.getItem(storageKey);return raw&&raw.length<=10000?publicPosition(data,JSON.parse(raw),currentUrl()):null;}catch{return null;}};
  const persist=()=>{if(dead||!mountedUrl||currentUrl()!==mountedUrl)return;const value=publicPosition(data,{url:mountedUrl,route:mountedRoute,y:win.scrollY,focus:navigationFocus()},mountedUrl);if(value)try{win.sessionStorage.setItem(storageKey,JSON.stringify(value));}catch{}};
  const listen=(node,type,fn,options)=>{if(dead)return;node.addEventListener(type,fn,options);off.push(()=>node.removeEventListener(type,fn,options));};
  const frame=fn=>{const id=win.requestAnimationFrame(()=>{frames.delete(id);if(!dead)fn();});frames.add(id);return id;};
  const remember=(focus=navigationFocus())=>{
    if(dead||!mountedUrl||currentUrl()!==mountedUrl)return;
    win.history.replaceState({...reviewState(win.history.state,mountedUrl,win.scrollY,focus),iznaRendererRoute:mountedRoute},'',mountedUrl);
  };
  const cancelRestore=()=>{restoreEpoch++;restoreObserver?.disconnect();restoreObserver=null;if(restoreTimer!==null)win.clearTimeout(restoreTimer);restoreTimer=null;};
  const restore=saved=>{
    cancelRestore();const url=mountedUrl,epoch=restoreEpoch;
    frame(()=>frame(()=>{
      if(epoch!==restoreEpoch||currentUrl()!==url)return;
      const route=readReviewUrl(data,url),eventKey=route?.startsWith('#/timeline?')?new URLSearchParams(route.split('?')[1]).get('event'):null;
      const eventTarget=eventKey?[...root.querySelectorAll('[data-event-key]')].find(n=>n.dataset.eventKey===eventKey):null;
      restoreNavigationFocus(saved?.focus??(eventTarget?{kind:'event',value:eventKey}:null));
      const apply=()=>{if(!dead&&epoch===restoreEpoch&&mountedUrl===url&&currentUrl()===url)win.scrollTo({top:saved?.y??(eventTarget?Math.max(0,eventTarget.getBoundingClientRect().top+win.scrollY-20):0),behavior:'instant'});};
      apply();
      if(win.ResizeObserver){restoreObserver=new win.ResizeObserver(apply);restoreObserver.observe(root);}
      restoreTimer=win.setTimeout(cancelRestore,1500);
    }));
  };
  const canRequest=request=>!dead&&currentUrl()===mountedUrl&&typeof native?.open==='function'&&!!nativeHref(data,request,native);
  const nativeRequest=()=>{
    const hash=mountedRoute??readReviewUrl(data,mountedUrl);if(!hash)return null;
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
    remember();persist();const href=nativeHref(data,request,native);
    const opened=native.open(Object.freeze({...request}),Object.freeze({href,resume:()=>{if(!dead)navigate(request.returnTo);}}))===true;
    if(!opened)try{win.sessionStorage.removeItem(storageKey);}catch{}
    return opened;
  };
  const pending=()=>{
    onHomeChange(mountedRoute==='#/home');
    // The renderer retains its independent internal route contract. Exposed
    // anchors use real query URLs so copying/opening a new tab works as expected.
    for(const a of root.querySelectorAll('a[href^="#/"]')){
      const hash=a.getAttribute('href'),href=artistUrl(data,hash);
      if(href){a.dataset.iznaRoute=hash;a.setAttribute('href',href);}
    }
    for(const input of root.querySelectorAll('input[type="search"]'))input.maxLength=200;
    for(const row of root.querySelectorAll('[data-event-key]')){
      const links=[...row.querySelectorAll('[data-izna-route]')].filter(a=>a.dataset.iznaRoute.includes('kind=MV')||a.dataset.iznaRoute.includes('kind=STAGE'));
      if(links.length&&!row.querySelector('[data-related-video-label]')){const label=doc.createElement('span');label.dataset.relatedVideoLabel='true';label.textContent='相关影像（各视频日期见详情）';links[0].before(label);}
    }
    root.querySelector('.astra-native-pending')?.remove();
    const request=nativeRequest();if(!request)return;
    const allowed=canRequest(request),section=doc.createElement('section');section.className='astra-native-pending';
    let button=root.querySelector('[data-open-work],[data-open-release]');
    if(!button){button=doc.createElement('button');button.type='button';button.dataset.astraNativeOpen='true';button.className='action';section.append(button);}
    button.textContent=request.action==='open-member'?'查看成员手帐 ↗':request.action==='open-release'?'查看发行记录 ↗':'查看作品手帐 ↗';
    button.dataset.iznaNativeFocus=request.action;
    button.disabled=!allowed;
    if(!allowed){const reason=doc.createElement('p');reason.id=root.getAttribute('data-astra-instance')+'--native-pending';reason.textContent=request.action==='open-release'?'发行资料可浏览，目前没有对应的手帐记录。':'暂未核验到对应的手帐记录，可继续浏览本页资料。';button.setAttribute('aria-describedby',reason.id);section.append(reason);}
    if(request.action==='open-work'){
      const ratingRequest={...request,action:'open-rating'},ratingAllowed=canRequest(ratingRequest);
      const rating=doc.createElement('button');rating.type='button';rating.className='action';rating.dataset.astraNativeOpen='open-rating';rating.textContent='评分与观看记录 ↗';rating.disabled=!ratingAllowed;section.append(rating);
      rating.dataset.iznaNativeFocus='open-rating';
      if(!ratingAllowed){const reason=doc.createElement('p');reason.id=root.getAttribute('data-astra-instance')+'--rating-pending';reason.textContent='此版本的评分关联尚未核验。';rating.setAttribute('aria-describedby',reason.id);section.append(reason);}
    }
    if(section.childNodes.length)root.querySelector('main')?.append(section);
  };
  function onNavigate(detail) {
    if(dead)return;
    if(!validRoute(data,detail.route))throw new Error('Unsupported review route');
    mountedRoute=detail.route;
    if(!replaying) {
      const target=artistUrl(data,detail.route);
      if(currentUrl()!==target)win.history.pushState({...reviewState(win.history.state,target,0,null),iznaRendererRoute:detail.route},'',target);
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
        root.remove();style.remove();informationStyle.remove();
        if(owners.get(host)===owner)owners.delete(host);
      }
    }
  }
  const readInitial=readReviewUrl(data,currentUrl()),storedInitial=stored();
  if(storedInitial)try{win.sessionStorage.removeItem(storageKey);}catch{}
  const initial=validRoute(data,win.history.state?.iznaRendererRoute)&&artistUrl(data,win.history.state.iznaRendererRoute)===currentUrl()?win.history.state.iznaRendererRoute:storedInitial?.route??readInitial;
  const ready=(async()=>{
    try {
      if(!initial)throw new Error('页面地址无效，请从 izna 首页进入。');
      mountedRoute=initial;mountedUrl=artistUrl(data,initial);
      // Normalize the empty hash once, without dropping another history field.
      const saved=savedPosition(win.history.state,mountedUrl)??storedInitial;
      if(saved?.focus?.kind==='native'&&nativeActions.has(saved.focus.value))deferredNativeFocus=saved.focus;
      win.history.replaceState({...reviewState(win.history.state,mountedUrl,saved?.y??win.scrollY,saved?.focus??null),iznaRendererRoute:initial},'',mountedUrl);
      handle=module.mount({element:root,data,baseUrl,cssUrl:new URL('/artist/izna/native-v3/izna.css',win.location.origin).href,
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
        if(link.sheet)settle();
      });
      if(dead)return {status:'destroyed'};
      root.style.removeProperty('visibility');
      onStatus('');
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
    const queryRoute=readReviewUrl(data,currentUrl());
    const hash=validRoute(data,win.history.state?.iznaRendererRoute)&&artistUrl(data,win.history.state.iznaRendererRoute)===currentUrl()?win.history.state.iznaRendererRoute:queryRoute;
    if(!hash){destroy();onStatus('已离开本团审阅。');return;}
    mountedUrl=currentUrl();mountedRoute=hash;const saved=savedPosition(win.history.state,mountedUrl);
    replaying=true;try{handle?.navigate(hash);pending();}finally{replaying=false;}
    restore(saved);
  };
  listen(win,'popstate',changed);listen(win,'hashchange',changed);listen(win,'artist-location-change',changed);
  listen(win,'pagehide',()=>remember());
  listen(win,'pageshow',event=>{if(event.persisted&&!dead)restore(savedPosition(win.history.state,mountedUrl));});
  listen(win,'scroll',()=>{if(scrollFrame!==null||restoreObserver)return;scrollFrame=frame(()=>{scrollFrame=null;remember();});},{passive:true});
  for(const name of ['wheel','touchstart','pointerdown','keydown'])listen(win,name,()=>{deferredNativeFocus=null;cancelRestore();},{passive:true});
  listen(root,'click',event=>{
    const nativeControl=event.target.closest?.('[data-astra-native-open]');
    if(nativeControl){event.preventDefault();const request=nativeRequest();if(request&&!nativeControl.disabled)requestNative(nativeControl.dataset.astraNativeOpen==='open-rating'?{...request,action:'open-rating'}:request);return;}
    const a=event.target.closest?.('a[href]');if(!a)return;
    const href=a.getAttribute('href');
    if(a.dataset.iznaRoute){remember({kind:'href',value:href});if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();event.stopImmediatePropagation();navigate(a.dataset.iznaRoute);}return;}
    if(href?.startsWith('#/')&&!validRoute(data,href)){event.preventDefault();event.stopImmediatePropagation();return;}
    remember({kind:'href',value:href});
  },true);
  listen(root,'submit',()=>remember(),true);
  return Object.freeze({ready,root,shadow,navigate,destroy,inspect:owner.inspect});
}
