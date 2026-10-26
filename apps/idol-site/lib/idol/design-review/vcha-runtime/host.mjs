import * as sourceModule from './groups/vcha/index.js';
import {mountArtist,createScope} from './shared/lifecycle.js';
import {actionIdentity,validateIdentity,lookupEntity} from './shared/identity.js';
import {REVIEW_PATH,group,helpers,urlNow,readReviewUrl as sourceReadReviewUrl,catalogBelongs,resolveNative,nativeHref as sourceNativeHref,referenceFor,reviewTarget as sourceReviewTarget,reviewHistoryState,savedReviewPosition} from './model.mjs';
export {catalogBelongs} from './model.mjs';
const STYLE_URL='/design-review/sol15/vcha/styles.css';
const CONTAINER_STYLE_URL='/design-review/sol15/vcha/container-validation.css';
const reset=`
:host{all:initial;display:block;min-width:0;color-scheme:light;isolation:isolate}
[data-review-root]{display:block;min-width:0;line-height:normal;font-size:16px;letter-spacing:normal;text-align:start;direction:ltr}
[data-review-root] *,[data-review-root] *::before,[data-review-root] *::after{box-sizing:border-box}
[data-review-root] img{display:block;max-width:100%}
[data-review-root] .media-unavailable{display:grid;place-items:center;min-height:120px;padding:20px;background:#e9e9e9;color:#444;font-size:14px}
[data-review-root] .media-figure{margin:0}
[data-review-root] .media-figure figcaption{font-size:12px;line-height:1.6;padding-top:7px}
[data-review-root] .vc-native-records{margin:0 8% 45px;border-top:1px solid #b8c4c0;padding-top:22px;font-size:13px;line-height:1.8}
[data-review-root] .vc-native-records button{margin:8px 12px 0 0}
[data-review-root] .vc-native-records button:disabled{opacity:.65;cursor:not-allowed}
[data-review-root] .vc-review-exit{padding:14px 5%;font-size:12px;border-bottom:1px solid #b8c4c0;display:flex;gap:22px;flex-wrap:wrap}
[data-review-root] .vc-review-exit a{text-decoration:underline;text-underline-offset:3px}
[data-review-root] .vc-image-error{padding:12px;border:1px solid #9caaa4;line-height:1.5}
@media(prefers-reduced-motion:reduce){[data-review-root] *,[data-review-root] *::before,[data-review-root] *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
export function mayLeaveReview({document,shadow,confirm,alert}) {
  // Document selectors cannot see shadow descendants; check both surfaces.
  for(const region of [document,shadow]) {
    if(region.querySelector('[aria-modal="true"],dialog[open]'))return false;
    if(region.querySelector('[data-navigation-blocked="true"]')){alert('本次保存还未确认，请先核对保存结果。');return false;}
  }
  return ![document,shadow].some(region=>region.querySelector('[data-dirty="true"]'))||confirm('还有未保存的评分或备注。确定离开吗？');
}
function sourceAllowed(identity,artist) {
  if(!identity.sourceUrl)return false;
  const entity=lookupEntity(artist,identity.entityType,identity.entityId??identity.candidateKey);
  if(!entity)return false;
  const urls=[...(entity.sources??[]),...(entity.careerSources??[])].map(row=>typeof row==='string'?row:row.url);
  if(identity.entityType==='group'&&identity.entityId===artist.id&&identity.groupId===artist.id&&identity.slug==='vcha')urls.push(artist.brandSource,'https://www.universalmusic.com.br/2024/03/15/o-grupo-de-pop-feminino-vcha-faz-o-lancamento-duplo-de-only-one-e-favorite-girl/');
  if(entity.videoId)urls.push(helpers.videoHref(entity.videoId));
  return urls.includes(identity.sourceUrl)&&/^https?:\/\//.test(identity.sourceUrl);
}
export function validateNativeActivation({element,identity,artist,route,catalog,production}) {
  const expected=actionIdentity(element,{artist,route});
  if(!validateIdentity(identity,expected).valid)return null;
  const reference=referenceFor(route),entity=reference&&resolveNative(reference,catalog,production);
  if(!entity||identity.slug!==group.slug||identity.groupId!==group.groupId||identity.entityType!==reference.kind||identity.entityId!== (entity.kind==='member'?entity.memberId:entity.kind==='mv'?entity.workId:null)||identity.candidateKey!==(entity.kind==='stage'?reference.key:null))return null;
  if(entity.kind!=='member') {
    if(identity.workId!==entity.workId||identity.videoId!==entity.videoId||JSON.stringify(identity.parentWorkIds)!==JSON.stringify(entity.kind==='stage'?[entity.workId]:[]))return null;
    for(const [key,value] of Object.entries({sourceKey:entity.sourceKey,originalType:entity.originalType,slotType:entity.slotType,clip:'null'}))if(element.dataset[key]!==value)return null;
  }
  return reference;
}
export function createVchaReview({host,catalog,production,onStatus=()=>{},window:win=host.ownerDocument.defaultView,validationWidth}) {
  if(validationWidth!==undefined&&![320,390,1440].includes(validationWidth))throw new Error('Unsupported VCHA validation width.');
  if(!catalogBelongs(catalog))throw new Error('VCHA 资料归属无法核验。');
  // Only the additive candidate may alias its own finite route to the existing
  // review model. Native editor destinations and the original route stay unchanged.
  const activePath=validationWidth===undefined?REVIEW_PATH:`/design-review/sol15/vcha-container/frame/${validationWidth}`;
  const canonicalUrl=value=>validationWidth===undefined?value:typeof value==='string'&&(value===activePath||value.startsWith(activePath+'#'))?REVIEW_PATH+value.slice(activePath.length):null;
  const readReviewUrl=validationWidth===undefined?sourceReadReviewUrl:value=>sourceReadReviewUrl(canonicalUrl(value));
  const reviewTarget=validationWidth===undefined?sourceReviewTarget:hash=>{const target=sourceReviewTarget(hash);return target?activePath+target.slice(REVIEW_PATH.length):null;};
  const nativeHref=validationWidth===undefined?sourceNativeHref:(options,services)=>sourceNativeHref({...options,mountedUrl:canonicalUrl(options.mountedUrl),currentUrl:canonicalUrl(options.currentUrl)},services);
  const document=host.ownerDocument,shadow=host.shadowRoot??host.attachShadow({mode:'open'});
  const style=document.createElement('style');style.textContent=reset;
  const root=document.createElement('div');root.dataset.reviewRoot='sol15';root.tabIndex=-1;
  const link=document.createElement('link');link.rel='stylesheet';link.href=STYLE_URL;
  const overlay=validationWidth===undefined?null:document.createElement('link');
  if(overlay){overlay.rel='stylesheet';overlay.href=CONTAINER_STYLE_URL;root.dataset.hostConnection='vcha-container-validation';root.style.width=validationWidth+'px';}
  const lifetime=createScope({scheduler:win,id:'sol15-vcha-host'});
  let stylesReady=!overlay,handle=null,sequence=0,mountedUrl=null,dead=false,leaving=false,index=Number.isInteger(win.history.state?.sol15Review?.index)?win.history.state.sol15Review.index:0,scrollFrame=null,restoreObserver=null,restoreTimer=null,restoring=false;
  const mayLeave=()=>mayLeaveReview({document,shadow,confirm:message=>win.confirm(message),alert:message=>win.alert(message)});
  const deny=event=>{event.preventDefault();event.stopImmediatePropagation();};
  const remember=(focus=null)=>{
    if(!mountedUrl||urlNow(win)!==mountedUrl)return;
    const previous=win.history.state?.sol15Review;
    const state=reviewHistoryState(win.history.state,mountedUrl,win.scrollY,focus??previous?.focus);
    state.sol15Review.index=index;win.history.replaceState(state,'',mountedUrl);
  };
  const cancelRestore=()=>{restoring=false;restoreObserver?.disconnect();restoreObserver=null;if(restoreTimer!==null){lifetime.clearTimeout(restoreTimer);restoreTimer=null;}};
  lifetime.addCleanup(cancelRestore);
  function restore(url,initial=false) {
    cancelRestore();const saved=savedReviewPosition(win.history.state,url);
    const main=root.querySelector('main');if(main)main.tabIndex=-1;
    const wanted=saved?.focus;
    const focus=wanted?[...root.querySelectorAll('a[href]')].find(node=>node.getAttribute('href')===wanted):null;
    // Active focus inside this mount is shadow.activeElement, never the outer document focus node.
    if(focus)focus.focus({preventScroll:true});else if(!initial)main?.focus({preventScroll:true});
    const y=saved?.y??0;
    const apply=()=>{if(!dead&&mountedUrl===url)win.scrollTo({top:y,behavior:'instant'});};
    restoring=true;apply();
    if(win.ResizeObserver){restoreObserver=new win.ResizeObserver(()=>{if(restoring)apply();});restoreObserver.observe(root);}
    restoreTimer=lifetime.setTimeout(cancelRestore,3000);
  }
  const nativeControls=(route)=>{
    const reference=referenceFor(route);if(!reference)return '';
    const entity=resolveNative(reference,catalog,production),e=helpers.escape;
    const actions=reference.kind==='member'?[['member-records','打开我的成员记录']]:[['play','在手帐中观看'],['records','打开我的作品记录']];
    const context=reference.kind==='member'?`data-member-id="${e(reference.key)}"`:`data-work-key="${e(reference.key)}"`;
    const binding=entity&&entity.kind!=='member'?` data-source-key="${e(entity.sourceKey)}" data-original-type="${e(entity.originalType)}" data-slot-type="${entity.slotType}" data-clip="null"`:'';
    return `<section class="vc-native-records" ${context}><p>个人评分、备注与观看状态仍在原来的手帐中管理。返回按钮回到正式 VCHA 页，浏览器后退可回到本次审阅。</p>${actions.map(([action,label])=>`<button type="button" data-native-action="${action}"${binding}${!entity||entity.kind==='stage'&&action==='records'&&!entity.stageScoreBindingValid?' disabled':''}>${label}</button>`).join('')}${!entity?'<p role="status">当前资料的精确身份未匹配，记录入口暂不开放。</p>':''}</section>`;
  };
  const reviewModule={...sourceModule,render:({route,...args})=>{
    const html=sourceModule.render({route,...args});
    return html.replace('<main>',`<div class="vc-review-exit"><a href="/design-review">全部设计审阅</a><a href="/artists/vcha">VCHA 正式页面</a></div><main>`).replace('</main>',nativeControls(route)+'</main>');
  },afterRender:({root:scoped,scope})=>{
    // Replace ONLY the original global location.hash form handlers. Render is unchanged.
    // Capture identity validation above runs before form submissions are routed.
    const top=scoped.querySelector('[data-vc-top]'); if(top)scope.on(top,'click',()=>{win.scrollTo({top:0,behavior:win.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});scoped.querySelector('.vc-brand')?.focus({preventScroll:true});});
    for(const img of scoped.querySelectorAll('img')) {
      scope.on(img,'error',()=>{if(img.dataset.failed)return;img.dataset.failed='true';const message=document.createElement('span');message.className='vc-image-error';message.setAttribute('role','img');message.setAttribute('aria-label',img.alt);message.textContent=`${img.alt} · 图片暂时无法加载`;img.replaceWith(message);});
    }
  }};
  async function render(initial=false) {
    if(dead||!stylesReady)return;
    const url=urlNow(win),route=readReviewUrl(url),serial=++sequence;
    handle?.destroy();handle=null;cancelRestore();
    if(!route){mountedUrl=url;root.dataset.artist='vcha';root.innerHTML=`<main class="vc-heading" tabindex="-1"><h1>审阅地址无效</h1><p>没有跳转到其他团体或替代条目。</p><a href="${activePath}">返回 VCHA 审阅首页</a></main>`;onStatus('此审阅地址无法识别。');return;}
    mountedUrl=url;
    if(!savedReviewPosition(win.history.state,url)){const state=reviewHistoryState(win.history.state,url,initial?win.scrollY:0);state.sol15Review.index=index;win.history.replaceState(state,'',url);}
    const onActivation=payload=>{
      const {event,element,identity}=payload;
      if(dead||leaving||serial!==sequence||urlNow(win)!==url){deny(event);return;}
      const action=element.dataset.nativeAction;
      if(action&&event.type==='click') {
        deny(event);const reference=validateNativeActivation({element,identity,artist:sourceModule.artist,route,catalog,production});
        if(!reference){onStatus('记录入口身份不匹配，未执行跳转。');return;}
        const href=nativeHref({reference,action,catalog,route,mountedUrl:url,currentUrl:urlNow(win),mayLeave:mayLeave()},production);
        if(href){remember();leaving=true;try{win.location.assign(href);}catch{leaving=false;onStatus('记录页面未能打开，请重试。');}}else onStatus('当前记录入口暂不可用。');return;
      }
      if(event.type==='submit') {
        deny(event);if(!mayLeave())return;
        const page=element.hasAttribute('data-member-search')?'members':(element.hasAttribute('data-work-search')||element.hasAttribute('data-vc-search'))?'works':null;
        if(!page)return;const query=new URLSearchParams(route.query);query.set('q',new win.FormData(element).get('q')||'');navigate(helpers.href('vcha',page,null,query));return;
      }
      if(!['click','auxclick'].includes(event.type)||element.tagName!=='A')return;
      const href=element.getAttribute('href');
      if(!mayLeave()){deny(event);return;}
      if(href?.startsWith('#/')) {
        if(!reviewTarget(href)){deny(event);return;}
        if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        deny(event);navigate(href);return;
      }
      if(['/artists/vcha','/design-review'].includes(href)){remember();if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey)leaving=true;return;}
      if(!sourceAllowed(identity,sourceModule.artist)){deny(event);onStatus('来源链接不属于当前条目，未打开。');}
    };
    handle=mountArtist({root,module:reviewModule,route,helpers,scheduler:win,onIdentityError:()=>onStatus('该入口的身份核验未通过，未执行跳转。'),onActivation});
    const result=await handle.ready;
    if(dead||serial!==sequence)return;
    if(result.status==='mounted'){
      // The upstream layer covers click/submit/change. Keep middle-click source
      // and route activation inside the same immutable identity boundary too.
      handle.scope.on(root,'auxclick',event=>{
        const element=event.target?.closest?.('a[href]');if(!element||!root.contains(element))return;
        try{const identity=JSON.parse(element.getAttribute('data-action-identity'));const expected=actionIdentity(element,{artist:sourceModule.artist,route});if(!validateIdentity(identity,expected).valid)throw new Error('Source identity changed');onActivation({event,element,identity});}
        catch{deny(event);onStatus('该来源的身份核验未通过，未打开。');}
      },{capture:true});
      onStatus('独立设计审阅 · 个人记录使用原有手帐');restore(url,initial);}
  }
  function navigate(hash) {
    const target=reviewTarget(hash);if(dead||leaving||!target||target===urlNow(win)||urlNow(win)!==mountedUrl||!mayLeave())return;
    remember(hash);index+=1;const state=reviewHistoryState(win.history.state,target);state.sol15Review.index=index;
    win.history.pushState(state,'',target);void render().catch(error=>onStatus(error.message));
  }
  const changed=()=>{
    if(dead||urlNow(win)===mountedUrl)return;
    const nextIndex=win.history.state?.sol15Review?.index;
    if(!mayLeave()){
      if(Number.isInteger(nextIndex)&&nextIndex!==index){win.history.go(index-nextIndex);return;}
      if(mountedUrl)win.history.replaceState(reviewHistoryState(win.history.state,mountedUrl,win.scrollY),'',mountedUrl);
      return;
    }
    if(Number.isInteger(nextIndex))index=nextIndex;
    void render().catch(error=>onStatus(error.message));
  };
  lifetime.on(win,'popstate',changed);lifetime.on(win,'hashchange',changed);
  lifetime.on(win,'pagehide',()=>remember());
  lifetime.on(win,'pageshow',()=>{leaving=false;});
  lifetime.on(win,'scroll',()=>{if(restoring||scrollFrame!==null)return;scrollFrame=lifetime.requestAnimationFrame(()=>{scrollFrame=null;remember();});},{passive:true});
  for(const name of ['wheel','touchstart','pointerdown','keydown'])lifetime.on(win,name,cancelRestore,{passive:true});
  lifetime.on(win,'beforeunload',event=>{if([document,shadow].some(region=>region.querySelector('[data-dirty="true"],[data-navigation-blocked="true"]'))){event.preventDefault();event.returnValue='';}});
  const ready=overlay?new Promise((resolve,reject)=>{
    const links=[link,overlay],pending=new Set(links);let settled=false;
    const clear=()=>{lifetime.clearTimeout(timer);for(const item of links){item.onload=null;item.onerror=null;}};
    const fail=message=>{if(settled||dead)return;settled=true;clear();dead=true;++sequence;handle?.destroy();handle=null;lifetime.destroy();shadow.replaceChildren();reject(new Error(message));};
    const timer=lifetime.setTimeout(()=>fail('VCHA 验证样式载入超时，请重新读取。'),15000);
    for(const item of links){
      item.onload=()=>{if(settled||dead)return;pending.delete(item);if(pending.size)return;settled=true;stylesReady=true;clear();render(true).then(resolve,reject);};
      item.onerror=()=>fail(item===overlay?'VCHA 容器验证样式暂时无法载入。':'VCHA 样式暂时无法载入。');
    }
    lifetime.addCleanup(()=>{clear();if(!settled){settled=true;resolve({status:'destroyed'});}});
    shadow.replaceChildren(style,link,overlay,root);
  }):new Promise((resolve,reject)=>{
    const timer=lifetime.setTimeout(()=>reject(new Error('VCHA 样式载入超时，请重新读取。')),15000);
    link.onload=()=>{lifetime.clearTimeout(timer);render(true).then(resolve,reject);};
    link.onerror=()=>{lifetime.clearTimeout(timer);reject(new Error('VCHA 样式暂时无法载入。'));};
    lifetime.addCleanup(()=>{link.onload=null;link.onerror=null;resolve({status:'destroyed'});});
    shadow.replaceChildren(style,link,root);
  });
  return {ready,root,shadow,navigate,destroy(){if(dead)return;remember();dead=true;++sequence;handle?.destroy();lifetime.destroy();shadow.replaceChildren();}};
}
