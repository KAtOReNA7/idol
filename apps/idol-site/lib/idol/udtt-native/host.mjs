import {withReportedTimelineIdentity} from '../timeline/reported-records.mjs';
import {withGroupInformationIdentity} from './information-identity.mjs';
import {createImageRecovery,reloadVerifiedPage} from './image-recovery.mjs';
import {createMediaViewer} from '../design-review/sol15-runtime/shared/media-viewer.js';
import {releaseEventPairs} from '../design-review/sol15-runtime/groups/udtt/relations.mjs';
import {createPrivateHelpers,validatePrivateViewer,createPrivateImageQueue,prepareNativePortrait,withNativePortrait,nativePortraitSourceAllowed,validatePublicViewer,preparePublicNativePortrait,withPublicNativePortrait} from '../design-review/sol15-runtime/private-images.mjs';
import * as sourceModule from './presentation.mjs';
import {mountArtist,createScope} from '../design-review/sol15-runtime/shared/lifecycle.js';
import {actionIdentity,validateIdentity,lookupEntity} from '../design-review/sol15-runtime/shared/identity.js';
import {REVIEW_PATH,group,helpers,urlNow,readReviewUrl,catalogBelongs,resolveNative,nativeHref,referenceFor,reviewTarget,reviewHistoryState,savedReviewPosition,viewPositionKey} from './model.mjs';
export {catalogBelongs} from './model.mjs';
export async function prepareUdttNativePortrait({catalog,viewer,production,window:win,signal,publicMode=false}){
 if(!catalogBelongs(catalog)||resolveNative({kind:'member',key:'recvxAPQCF66Sl'},catalog,production)?.memberId!=='recvxAPQCF66Sl')throw new Error('原生照片成员身份未通过核验。');
 if(publicMode){validatePublicViewer(viewer);return preparePublicNativePortrait({catalog,scheduler:win,signal});}
 validatePrivateViewer(viewer);return prepareNativePortrait({catalog,scheduler:win,signal});
}
const STYLE_URL='/artist/udtt/figma-native.css';
const reset=`
:host{all:initial;display:block;min-width:0;color-scheme:light;isolation:isolate}
[data-review-root]{display:block;min-width:0;line-height:normal;font-size:16px;letter-spacing:normal;text-align:start;direction:ltr}
[data-review-root] *,[data-review-root] *::before,[data-review-root] *::after{box-sizing:border-box}
[data-review-root] img{display:block;max-width:100%}
[data-review-root] .media-unavailable{display:grid;place-items:center;min-height:120px;padding:20px;background:#e9e9e9;color:#444;font-size:14px}
[data-review-root] .media-figure{margin:0}
[data-review-root] .media-figure figcaption{font-size:12px;line-height:1.6;padding-top:7px}
[data-review-root] .ud-native-records{margin:0 8% 45px;border-top:1px solid #b8c4c0;padding-top:22px;font-size:13px;line-height:1.8}
[data-review-root] .ud-native-records button{margin:8px 12px 0 0}
[data-review-root] .ud-native-records button:disabled{opacity:.65;cursor:not-allowed}
[data-review-root] .ud-review-exit{padding:14px 5%;font-size:12px;border-bottom:1px solid #b8c4c0;display:flex;gap:22px;flex-wrap:wrap}
[data-review-root] .ud-review-exit a{text-decoration:underline;text-underline-offset:3px}
[data-review-root] .ud-image-error{padding:12px;border:1px solid #9caaa4;line-height:1.5}
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
function sourceAllowed(identity,artist,nativePortrait) {
  if(nativePortraitSourceAllowed(nativePortrait,identity))return true;
  if(!identity.sourceUrl)return false;
  const entity=lookupEntity(artist,identity.entityType,identity.entityId??identity.candidateKey);
  if(!entity)return false;
  const urls=[...(entity.sources??[]),...(entity.careerSources??[])].map(row=>typeof row==='string'?row:row.url);
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
export function createUdttNative({host,catalog,viewer,production,canEdit=false,nativePortrait=null,onStatus=()=>{},onImages=()=>{},window:win=host.ownerDocument.defaultView}) {
  if(!catalogBelongs(catalog))throw new Error('UDTT 资料归属无法核验。');
  const identityArtist=withReportedTimelineIdentity(withGroupInformationIdentity(sourceModule.artist,catalog.groups.find(row=>row.id===sourceModule.artist.id)));
  const legacyReferences=canEdit?validatePrivateViewer(viewer):validatePublicViewer(viewer);
  if(!nativePortrait)throw new Error('陆雨婷原生照片未完成核验。');
  const references=canEdit?withNativePortrait(legacyReferences,nativePortrait):withPublicNativePortrait(legacyReferences,nativePortrait);
  const document=host.ownerDocument,shadow=host.shadowRoot??host.attachShadow({mode:'open'});
  const style=document.createElement('style');style.textContent=reset;
  const root=document.createElement('div');root.dataset.reviewRoot='sol15';root.tabIndex=-1;
  const parking=document.createElement('div');parking.hidden=true;parking.setAttribute('aria-hidden','true');parking.dataset.privateImageParking='true';
  const recovery=createImageRecovery({document,root,onReload:()=>{
    if(dead||leaving)return;
    try{reloadVerifiedPage({mountedUrl,currentUrl:urlNow(win),isValidUrl:readReviewUrl,mayLeave,remember,reload:()=>win.location.reload()});}
    catch{onStatus('页面未能重新载入，请稍后重试。');}
  }});
  const images=createPrivateImageQueue({references,parking,scheduler:win,onReport:report=>{recovery.update(report);onImages(report);}});
  const helpers=createPrivateHelpers(references,(image,asset,callbacks)=>images.requestViewer(image,asset,callbacks));
  const link=document.createElement('link');link.rel='stylesheet';link.href=STYLE_URL;
  const lifetime=createScope({scheduler:win,id:'sol15-udtt-host'});
  let handle=null,sequence=0,mountedUrl=null,dead=false,leaving=false,index=Number.isInteger(win.history.state?.sol15Review?.index)?win.history.state.sol15Review.index:0,scrollFrame=null,restoreObserver=null,restoreTimer=null,restoring=false;
  const positions=new Map();
  const mayLeave=()=>mayLeaveReview({document,shadow,confirm:message=>win.confirm(message),alert:message=>win.alert(message)});
  const deny=event=>{event.preventDefault();event.stopImmediatePropagation();};
  const remember=(focus=null)=>{
    if(!mountedUrl||urlNow(win)!==mountedUrl)return;
    const previous=win.history.state?.sol15Review;
    const state=reviewHistoryState(win.history.state,mountedUrl,win.scrollY,focus??previous?.focus);
    state.sol15Review.index=index;win.history.replaceState(state,'',mountedUrl);
    const key=viewPositionKey(mountedUrl);positions.set(key,state.sol15Review);if(positions.size>64)positions.delete(positions.keys().next().value);
  };
  const cancelRestore=()=>{restoring=false;restoreObserver?.disconnect();restoreObserver=null;if(restoreTimer!==null){lifetime.clearTimeout(restoreTimer);restoreTimer=null;}};
  lifetime.addCleanup(cancelRestore);
  function restore(url,initial=false,mode='history') {
    cancelRestore();const saved=savedReviewPosition(win.history.state,url);
    const main=root.querySelector('main');if(main)main.tabIndex=-1;
    // This UDTT host intentionally owns afterRender (image queue + forms).
    // Event returns therefore belong to this final restore, not a source hook.
    const route=readReviewUrl(url);
    // Explicit links target a verified event; history traversal preserves the
    // user's saved position/focus even when that URL contains an event query.
    const preferEvent=mode==='explicit'||mode==='initial'&&(!saved||saved.y===0&&!saved.focus);
    const eventId=route?.page==='timeline'&&route.query.get('event');
    const event=preferEvent&&eventId&&releaseEventPairs(sourceModule.artist).some(pair=>pair.event.id===eventId)
      ? [...root.querySelectorAll('[data-event-id]')].find(node=>node.dataset.eventId===eventId) : null;
    const wanted=saved?.focus;
    const focus=wanted?[...root.querySelectorAll('a[href]')].find(node=>node.getAttribute('href')===wanted):null;
    // Active focus inside this mount is shadow.activeElement, never the outer document focus node.
    if(event){event.tabIndex=-1;event.setAttribute('aria-current','true');event.focus({preventScroll:true});}
    else if(focus)focus.focus({preventScroll:true});else if(!initial)main?.focus({preventScroll:true});
    const y=saved?.y??0;
    const apply=()=>{if(!dead&&mountedUrl===url){if(event)event.scrollIntoView({block:'center',behavior:'instant'});else win.scrollTo({top:y,behavior:'instant'});}};
    restoring=true;apply();
    if(win.ResizeObserver){restoreObserver=new win.ResizeObserver(()=>{if(restoring)apply();});restoreObserver.observe(root);}
    restoreTimer=lifetime.setTimeout(cancelRestore,3000);
  }
  const nativeControls=(route)=>{
    const reference=referenceFor(route);if(!reference)return '';
    const entity=resolveNative(reference,catalog,production),e=helpers.escape;
    const actions=reference.kind==='member'?[['member-records',canEdit?'编辑成员记录':'查看成员记录']]:[['play','打开播放器'],['records',canEdit?'编辑记录 · 仅本人':'查看记录']];
    const context=reference.kind==='member'?`data-member-id="${e(reference.key)}"`:`data-work-key="${e(reference.key)}"`;
    const binding=entity&&entity.kind!=='member'?` data-source-key="${e(entity.sourceKey)}" data-original-type="${e(entity.originalType)}" data-slot-type="${entity.slotType}" data-clip="null"`:'';
    return `<section class="ud-native-records" ${context}><p>评分、备注与观看状态沿用原有记录。</p>${actions.map(([action,label])=>`<button type="button" data-native-action="${action}"${binding}${!entity||entity.kind==='stage'&&action==='records'&&!entity.stageScoreBindingValid?' disabled':''}>${label}</button>`).join('')}${!entity?'<p role="status">当前资料的精确身份未匹配，记录入口暂不开放。</p>':''}</section>`;
  };
  const reviewModule={...sourceModule,artist:identityArtist,render:({route,...args})=>{
    const html=sourceModule.render({route,...args,catalog,canEdit,resolvedNative:referenceFor(route)?resolveNative(referenceFor(route),catalog,production):null});
    return html.replace('<!-- native-record-controls -->',nativeControls(route));
  },afterRender:({root:scoped,route,scope})=>{
    images.attach(scoped);
    // UDTT member-detail only: no buttons nested inside roster links; shared installer stays work-only.
    if(route.page!=='member'||typeof helpers.mediaImageTransport!=='function')return;
    const original=sourceModule.artist.members.find(m=>m.id===route.key);if(!original)return;
    const member=helpers.memberPresentation?.(original)??original,asset=helpers.resolveMediaAsset(member.image);if(!asset)return;
    const portrait=[...scoped.querySelectorAll('article[data-member-id]')].find(n=>n.getAttribute('data-member-id')===member.id)?.querySelector('.ud-student-image img');
    if(!portrait||portrait.getAttribute('data-private-asset-id')!==asset.privateAssetId||portrait.getAttribute('data-private-sha256')!==asset.sha256)return;
    const viewer=createMediaViewer({root:scoped,scope,asset,title:(member.nameZh||member.name)+' · 照片',entityKey:null,mediaRole:'image',imageTransport:helpers.mediaImageTransport});
    const button=document.createElement('button');button.type='button';button.textContent=viewer.policy.actionLabel;button.setAttribute('data-action','media-preview');button.setAttribute('data-udtt-member-photo',member.id);button.setAttribute('style','display:block;margin:12px auto;padding:8px 16px;font:inherit;cursor:pointer');
    portrait.insertAdjacentElement('afterend',button);scope.own(button);scope.on(button,'click',()=>{const opened=viewer.open(button);if(opened.status==='opened')opened.dialog.setAttribute('data-member-id',member.id);});
  }};
  async function render(initial=false,restoreMode=initial?'initial':'history') {
    if(dead)return;
    const url=urlNow(win),route=readReviewUrl(url),serial=++sequence;
    images.park();handle?.destroy();handle=null;recovery.update(images.report());cancelRestore();
    if(!route){mountedUrl=url;root.dataset.artist='udtt';root.innerHTML=`<main class="ud-heading" tabindex="-1"><h1>页面地址无效</h1><p>没有跳转到其他团体或替代条目。</p><a href="${REVIEW_PATH}">返回 UDTT 首页</a></main>`;onStatus('此页面地址无法识别。');return;}
    mountedUrl=url;
    if(!savedReviewPosition(win.history.state,url)){const state=reviewHistoryState(win.history.state,url,initial?win.scrollY:0);state.sol15Review.index=index;win.history.replaceState(state,'',url);}
    const onActivation=payload=>{
      const {event,element,identity}=payload;
      if(dead||leaving||serial!==sequence||urlNow(win)!==url){deny(event);return;}
      const action=element.dataset.nativeAction;
      if(action&&event.type==='click') {
        deny(event);const reference=validateNativeActivation({element,identity,artist:identityArtist,route,catalog,production});
        if(!reference){onStatus('记录入口身份不匹配，未执行跳转。');return;}
        const href=nativeHref({reference,action,catalog,route,mountedUrl:url,currentUrl:urlNow(win),mayLeave:mayLeave()},production);
        if(href){remember();leaving=true;try{win.location.assign(href);}catch{leaving=false;onStatus('记录页面未能打开，请重试。');}}else onStatus('当前记录入口暂不可用。');return;
      }
      if(event.type==='submit') {
        deny(event);if(!mayLeave())return;
        const page=element.hasAttribute('data-member-search')?'members':element.hasAttribute('data-work-search')?'works':null;
        if(!page)return;const query=new URLSearchParams(route.query);query.set('q',new win.FormData(element).get('q')||'');navigate(helpers.href('udtt',page,null,query));return;
      }
      if(!['click','auxclick'].includes(event.type)||element.tagName!=='A')return;
      const href=element.getAttribute('href');
      if(!mayLeave()){deny(event);return;}
      if(href?.startsWith('#/')) {
        if(!reviewTarget(href)){deny(event);return;}
        if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        deny(event);navigate(href,element.classList.contains('ud-back'));return;
      }
      if(['/artists/udtt','/design-review'].includes(href)){remember();if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey)leaving=true;return;}
      if(!sourceAllowed(identity,identityArtist,nativePortrait)){deny(event);onStatus('来源链接不属于当前条目，未打开。');}
    };
    handle=mountArtist({root,module:reviewModule,route,helpers,scheduler:win,onIdentityError:()=>onStatus('该入口的身份核验未通过，未执行跳转。'),onActivation});
    const result=await handle.ready;
    if(dead||serial!==sequence)return;
    if(result.status==='mounted'){
      // The upstream layer covers click/submit/change. Keep middle-click source
      // and route activation inside the same immutable identity boundary too.
      handle.scope.on(root,'auxclick',event=>{
        const element=event.target?.closest?.('a[href]');if(!element||!root.contains(element))return;
        try{const identity=JSON.parse(element.getAttribute('data-action-identity'));const expected=actionIdentity(element,{artist:identityArtist,route});if(!validateIdentity(identity,expected).valid)throw new Error('Source identity changed');onActivation({event,element,identity});}
        catch{deny(event);onStatus('该来源的身份核验未通过，未打开。');}
      },{capture:true});
      onStatus('UDTT · 资料已载入');restore(url,initial,restoreMode);}
  }
  function navigate(hash,returning=false) {
    const target=reviewTarget(hash);if(dead||leaving||!target||target===urlNow(win)||urlNow(win)!==mountedUrl||!mayLeave())return;
    remember(hash);index+=1;const prior=returning?positions.get(viewPositionKey(target)):null;
    const state=reviewHistoryState(win.history.state,target,prior?.y??0,prior?.focus??null);state.sol15Review.index=index;
    win.history.pushState(state,'',target);void render(false,prior?'history':'explicit').catch(error=>onStatus(error.message));
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
  const ready=new Promise((resolve,reject)=>{
    const timer=lifetime.setTimeout(()=>reject(new Error('UDTT 样式载入超时，请重新读取。')),15000);
    link.onload=()=>{lifetime.clearTimeout(timer);render(true).then(resolve,reject);};
    link.onerror=()=>{lifetime.clearTimeout(timer);reject(new Error('UDTT 样式暂时无法载入。'));};
    lifetime.addCleanup(()=>{link.onload=null;link.onerror=null;resolve({status:'destroyed'});});
    const informationStyle=document.createElement('link');informationStyle.rel='stylesheet';informationStyle.href='/artist/group-information.css';
    shadow.replaceChildren(style,link,informationStyle,recovery.element,root,parking);
  });
  return {ready,root,shadow,navigate,images,destroy(){if(dead)return;remember();dead=true;++sequence;images.destroy();recovery.destroy();nativePortrait?.destroy();handle?.destroy();lifetime.destroy();shadow.replaceChildren();}};
}
