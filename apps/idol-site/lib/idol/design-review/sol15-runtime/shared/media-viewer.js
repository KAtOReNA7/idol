import {resolveMediaViewer} from './media-policy.js';
import {measureMediaBounds,resolveViewerGeometry,mediaParent} from './media-geometry.js';

const keyOf=entity=>entity?.id??entity?.candidateKey;
const cleanSource=value=>typeof value==='string'?value.replace(/^\.\//,''):null;
const positive=value=>Number.isFinite(value)&&value>0;
const sourceOf=asset=>asset?.src??asset?.path??asset?.url;
const px=value=>String(Math.round(value*1000)/1000)+'px';

/** One mount-owned, model-validated preview. No automatic retry or global dialog cleanup. */
export function createMediaViewer({root,scope,asset,title='',entityKey=null,mediaRole='image',imageTransport=null,document=root?.ownerDocument}){
  const policy=resolveMediaViewer(asset,{mediaRole}),source=sourceOf(asset),naturalWidth=asset?.width,naturalHeight=asset?.height;
  const qualityWidth=policy.maxWidth??naturalWidth,qualityHeight=policy.maxHeight??naturalHeight;
  const window=document?.defaultView,cleanupErrors=[];
  const activeElement=()=>root?.getRootNode?.()?.activeElement??document?.activeElement;let current=null,openGeneration=0;
  const runOff=off=>{try{off();}catch(error){cleanupErrors.push(error);}};
  const setStyle=(node,style)=>{if(node.getAttribute('style')!==style)node.setAttribute('style',style);};
  const canOpen=()=>Boolean(document?.createElement&&scope?.isCurrent()&&root?.isConnected!==false&&positive(naturalWidth)&&positive(naturalHeight)&&policy.canRender&&!/^\/\//.test(source??'')&&/^((https?:\/\/)|(groups\/)|(\.\/)|(\/))/i.test(source??''));
  const alive=s=>current===s&&scope.isCurrent()&&scope.owns(s.dialog)&&root.contains(s.dialog);
  const close=({restoreFocus=true}={})=>{
    const s=current;if(!s)return false;current=null;
    for(const off of s.offs.splice(0))runOff(off);for(const off of s.imageOffs.splice(0))runOff(off);
    if(!scope.owns(s.dialog)){scope.release(s.dialog);return false;}
    if(s.dialog.open){try{s.dialog.close();}catch{s.dialog.removeAttribute?.('open');}}
    // A native close callback may transfer this exact node or open a newer session.
    const stillOwned=scope.owns(s.dialog);if(stillOwned)s.dialog.remove?.();scope.release(s.dialog);
    if(restoreFocus&&stillOwned&&!current&&scope.isCurrent()&&s.opener&&s.opener.isConnected!==false&&root.contains(s.opener))s.opener.focus?.({preventScroll:true});
    return true;
  };
  const open=trigger=>{
    if(!canOpen())return {status:'unavailable'};
    // A synchronous close adapter may open a newer session; its reservation wins.
    const generation=++openGeneration;
    close({restoreFocus:false});if(!scope.isCurrent()||generation!==openGeneration)return {status:'stale'};
    const dialog=document.createElement('dialog'),heading=document.createElement('h2'),controls=document.createElement('div'),closeButton=document.createElement('button'),retryButton=document.createElement('button'),figure=document.createElement('figure'),failure=document.createElement('p');
    const s={dialog,opener:trigger??activeElement(),offs:[],imageOffs:[],image:null,state:'loading',attempt:0,geometry:null,frame:null,lastStyle:null};
    const adopt=(off,bucket=s.offs)=>{if(!alive(s)){runOff(off);return false;}bucket.push(off);return true;};
    dialog.setAttribute('data-media-viewer-owner',scope.id);dialog.setAttribute('data-media-operation',policy.operation);dialog.setAttribute('data-quality-level',policy.qualityLevel??'unrated');
    if(entityKey)dialog.setAttribute('data-work-key',entityKey);
    dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',`${title} · ${policy.actionLabel}`);
    heading.textContent=title||policy.actionLabel;heading.setAttribute('style','font:inherit;font-weight:600;line-height:1.5;overflow-wrap:anywhere;margin:0;');
    controls.setAttribute('style','display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px;position:sticky;top:0;background:inherit;z-index:1;');
    closeButton.type='button';closeButton.textContent='关闭';closeButton.setAttribute('data-action','media-preview-close');
    retryButton.type='button';retryButton.textContent='重新加载图片';retryButton.setAttribute('data-action','media-preview-retry');retryButton.setAttribute('data-media-retry-for',entityKey??'');retryButton.hidden=true;retryButton.disabled=true;retryButton.setAttribute('aria-hidden','true');retryButton.setAttribute('style','display:none!important;');
    failure.textContent='图片暂不可用';failure.hidden=true;failure.setAttribute('style','display:none!important;');failure.setAttribute('aria-hidden','true');failure.setAttribute('role','status');
    controls.append(closeButton,retryButton);figure.append(failure);dialog.append(controls,heading,figure);
    if(!scope.isCurrent())return {status:'stale'};current=s;scope.trackDialog(dialog);if(scope.isCurrent())root.append(dialog);
    if(!alive(s)){if(current===s)close({restoreFocus:false});return {status:'stale'};}
    const imageStyle=()=>{
      const width=s.geometry?.imageWidth??qualityWidth,height=s.geometry?.imageHeight??qualityHeight;
      return `display:block!important;max-width:${px(width)}!important;max-height:${px(height)}!important;width:min(100%,${px(width)})!important;height:auto!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:50% 50%;transform:none!important;`;
    };
    const paintImage=()=>{if(!s.image)return;setStyle(s.image,imageStyle()+(s.state==='failed'?'display:none!important;':''));s.image.setAttribute('data-render-max-width',String(s.geometry?.imageWidth??qualityWidth));s.image.setAttribute('data-render-max-height',String(s.geometry?.imageHeight??qualityHeight));};
    const measuredHeight=(node,fallback)=>{try{const h=node.getBoundingClientRect?.().height;return positive(h)?h:fallback;}catch{return fallback;}};
    const refreshGeometry=reason=>{
      if(!alive(s))return null;
      const measurement=measureMediaBounds({root,document,window});if(!alive(s))return null;
      dialog.setAttribute('data-media-geometry',measurement.supported?'measured':'unsupported');dialog.setAttribute('data-media-geometry-reason',reason);
      if(measurement.supported&&!measurement.visible){close({restoreFocus:false});return null;}
      const base='box-sizing:border-box;border:1px solid currentColor;overflow:auto;overflow-wrap:anywhere;background:#fff;color:#111;';
      if(!measurement.supported){
        s.geometry=null;setStyle(dialog,base+'padding:16px;max-width:calc(100vw - 24px);width:fit-content;max-height:calc(100dvh - 24px);');
        setStyle(figure,`margin:12px auto 0;max-width:${px(qualityWidth)};width:min(100%,${px(qualityWidth)});`);paintImage();return measurement;
      }
      // Width is committed before measuring wrapped title/control rows.
      let geometry=resolveViewerGeometry({bounds:measurement.bounds,naturalWidth,naturalHeight,maxWidth:qualityWidth,maxHeight:qualityHeight});
      const styleFor=g=>base+`position:fixed!important;inset:auto!important;right:auto!important;bottom:auto!important;margin:0!important;left:${px(g.left)}!important;top:${px(g.top)}!important;width:${px(g.width)}!important;max-width:${px(g.maxWidth)}!important;max-height:${px(g.maxHeight)}!important;padding:${px(g.padding)};`;
      if(!s.geometry||s.geometry.width!==geometry.width)setStyle(dialog,styleFor(geometry));
      geometry=resolveViewerGeometry({bounds:measurement.bounds,naturalWidth,naturalHeight,maxWidth:qualityWidth,maxHeight:qualityHeight,headingHeight:measuredHeight(heading,24),controlsHeight:measuredHeight(controls,32)});
      if(!alive(s))return null;s.geometry=geometry;const style=styleFor(geometry);setStyle(dialog,style);s.lastStyle=style;
      setStyle(figure,`margin:12px auto 0;max-width:${px(geometry.imageWidth)};width:min(100%,${px(geometry.imageWidth)});`);paintImage();
      dialog.setAttribute('data-media-host-left',String(measurement.bounds.left));dialog.setAttribute('data-media-host-top',String(measurement.bounds.top));dialog.setAttribute('data-media-render-left',String(geometry.left));dialog.setAttribute('data-media-render-top',String(geometry.top));
      return {measurement,geometry};
    };
    const requestGeometry=reason=>{
      if(!alive(s))return;
      if(typeof window?.requestAnimationFrame!=='function'){refreshGeometry(reason);return;}
      if(s.frame!=null)return;
      const pending={token:null,returned:false,early:false,cancelled:false};s.frame=pending;
      try{
        pending.token=window.requestAnimationFrame(()=>{
          if(!pending.returned){pending.early=true;return;}
          if(s.frame!==pending||!alive(s))return;s.frame=null;refreshGeometry(reason);if(alive(s))requestGeometry('host-position-frame');
        });
        pending.returned=true;
        // Host callbacks may close/replace us before requestAnimationFrame returns.
        if(!alive(s)||pending.cancelled||s.frame!==pending){window.cancelAnimationFrame?.(pending.token);if(s.frame===pending)s.frame=null;return;}
        if(pending.early){s.frame=null;refreshGeometry(reason);}
      }catch(error){cleanupErrors.push(error);if(s.frame===pending)s.frame=null;if(alive(s))refreshGeometry(reason);}
    };
    const showFailure=()=>{
      failure.textContent='图片暂不可用';failure.hidden=false;failure.setAttribute('aria-hidden','false');failure.setAttribute('style','display:block!important;');
      retryButton.hidden=false;retryButton.disabled=false;retryButton.setAttribute('aria-hidden','false');retryButton.setAttribute('style','display:inline-block!important;');retryButton.textContent='重新加载图片';
    };
    const makeImage=()=>{
      if(!alive(s))return null;for(const off of s.imageOffs.splice(0))runOff(off);s.image?.remove();
      const image=document.createElement('img');s.image=image;s.attempt++;s.state='loading';dialog.setAttribute('data-media-attempt',String(s.attempt));
      const purpose=mediaRole==='video-preview'?'视频预览':mediaRole==='release-cover'?'发行封面':'图片';
      image.setAttribute('alt',asset.alt??`${title} · ${purpose}`);image.setAttribute('width',String(naturalWidth));image.setAttribute('height',String(naturalHeight));image.setAttribute('decoding','async');
      for(const [name,value]of Object.entries({'data-media-context':'enlargement','data-media-max-width':qualityWidth,'data-media-max-height':qualityHeight,'data-media-operation':policy.operation,'data-allow-enlargement':policy.allowEnlargement,'data-allow-primary-visual':policy.allowPrimaryVisual,'data-recommended-use':policy.recommendedUse,'data-quality-level':policy.qualityLevel??'unrated'}))image.setAttribute(name,String(value));
      const activeImage=()=>alive(s)&&s.image===image;
      const onImageError=()=>{if(!activeImage())return;s.state='failed';image.hidden=true;image.setAttribute('aria-hidden','true');showFailure();paintImage();refreshGeometry('image-error');};
      const onImageLoad=()=>{if(!activeImage())return;s.state='loaded';image.hidden=false;image.removeAttribute('aria-hidden');image.classList?.remove('media-failed');failure.hidden=true;failure.setAttribute('aria-hidden','true');failure.setAttribute('style','display:none!important;');if(activeElement()===retryButton)closeButton.focus?.({preventScroll:true});retryButton.hidden=true;retryButton.disabled=true;retryButton.setAttribute('aria-hidden','true');retryButton.setAttribute('style','display:none!important;');paintImage();refreshGeometry('image-load');};
      if(!imageTransport){adopt(scope.on(image,'error',onImageError),s.imageOffs);adopt(scope.on(image,'load',onImageLoad),s.imageOffs);}
      if(!activeImage())return null;figure.replaceChildren(image,failure);paintImage();if(activeImage()){if(imageTransport)adopt(imageTransport(image,asset,{onLoad:onImageLoad,onError:onImageError}),s.imageOffs);else image.setAttribute('src',source);}
      return image;
    };
    adopt(scope.on(closeButton,'click',()=>close()));
    adopt(scope.on(retryButton,'click',()=>{
      if(!alive(s)||s.state!=='failed')return;
      if(activeElement()===retryButton)closeButton.focus?.({preventScroll:true});retryButton.disabled=true;retryButton.textContent='加载中…';failure.textContent='正在加载图片';
      makeImage();refreshGeometry('user-retry');
    }));
    adopt(scope.on(dialog,'close',()=>{if(current===s)close();}));
    adopt(scope.on(dialog,'cancel',event=>{event.preventDefault();close();}));
    adopt(scope.on(dialog,'keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      else if(event.key==='Tab'){event.preventDefault();const buttons=retryButton.hidden||retryButton.disabled?[closeButton]:[closeButton,retryButton],at=buttons.indexOf(activeElement());buttons[(at+(event.shiftKey?-1:1)+buttons.length)%buttons.length].focus?.({preventScroll:true});}
    }));
    const eventTargets=new Set([window,window?.visualViewport,root]);for(let node=mediaParent(root);node;node=mediaParent(node))eventTargets.add(node);
    for(const target of eventTargets)if(target?.addEventListener)for(const event of ['resize','scroll'])adopt(scope.on(target,event,()=>requestGeometry(event),{passive:true,capture:true}));
    const watchObserver=(Observer,targets,reason,options)=>{
      if(typeof Observer!=='function'||!alive(s))return;
      let observer,disposed=false;
      const dispose=()=>{if(!disposed){disposed=true;observer?.disconnect();}};
      try{
        observer=new Observer(()=>requestGeometry(reason));
        if(!adopt(dispose))return;
        for(const target of targets){if(!alive(s))break;observer.observe(target,options);if(!alive(s))break;}
      }catch(error){cleanupErrors.push(error);runOff(dispose);}
    };
    watchObserver(window?.ResizeObserver??globalThis.ResizeObserver,[root,heading,controls],'host-resize');
    watchObserver(window?.MutationObserver??globalThis.MutationObserver,[...eventTargets].filter(target=>target?.nodeType===1),'host-attributes',{attributes:true,attributeFilter:['style','class','hidden']});
    adopt(()=>{const pending=s.frame;if(pending){pending.cancelled=true;if(pending.token!=null)window?.cancelAnimationFrame?.(pending.token);if(s.frame===pending)s.frame=null;}});
    if(!alive(s)){if(current===s)close({restoreFocus:false});return {status:'stale'};}makeImage();refreshGeometry('open');
    if(!alive(s))return {status:'stale'};
    try{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}catch{dialog.setAttribute('open','');}
    if(!alive(s)){if(current===s)close({restoreFocus:false});return {status:'stale'};}
    refreshGeometry('shown');if(!alive(s))return {status:'stale'};requestGeometry('host-position-frame');if(!alive(s))return {status:'stale'};closeButton.focus?.({preventScroll:true});
    return {status:'opened',operation:policy.operation,dialog,policy};
  };
  scope.addCleanup(()=>{close({restoreFocus:false});});
  return {open,close,policy,get dialog(){return current?.dialog??null;},get cleanupErrors(){return [...cleanupErrors];}};
}

/** Detail-only explicit controls avoid invalid buttons nested inside card links. */
export function installMediaViewer({root,artist,route,scope,helpers}){
  if(route?.page!=='work'||!root?.ownerDocument?.createElement)return null;
  const work=artist.works?.find(row=>keyOf(row)===route.key);if(!work?.image)return null;
  const raw=work.image,originalAsset=typeof raw==='object'?raw:artist.assets?.find(row=>row.key===raw||cleanSource(row.src)===cleanSource(raw));
  const asset=helpers.resolveMediaAsset?helpers.resolveMediaAsset(originalAsset):originalAsset;
  if(!asset||!positive(asset.width)||!positive(asset.height)||!helpers.safeUrl(sourceOf(asset)))return null;
  const images=[...root.querySelectorAll('img')].filter(image=>{const context=image.closest?.('[data-work-key]');return (cleanSource(image.getAttribute('src'))===cleanSource(sourceOf(asset))||asset.privateAssetId&&image.getAttribute('data-private-asset-id')===asset.privateAssetId)&&!image.closest?.('[data-media-viewer-owner]')&&(!context||context.getAttribute('data-work-key')===keyOf(work));});
  if(!images.length)return null;
  const viewer=createMediaViewer({root,scope,asset,title:work.title,entityKey:keyOf(work),imageTransport:helpers.mediaImageTransport,mediaRole:['mv','stage'].includes(work.type)?'video-preview':work.type==='release'?'release-cover':'image'});
  for(const image of images){
    const button=root.ownerDocument.createElement('button');button.type='button';button.textContent=viewer.policy.actionLabel;button.setAttribute('data-action','media-preview');button.setAttribute('data-work-key',keyOf(work));button.setAttribute('data-media-operation',viewer.policy.operation);button.setAttribute('data-quality-level',viewer.policy.qualityLevel??'unrated');button.setAttribute('data-recommended-use',viewer.policy.recommendedUse);button.setAttribute('style','display:block;max-width:100%;margin:8px 0 16px;padding:8px 12px;font:inherit;line-height:1.5;white-space:normal;cursor:pointer;');
    const interactive=image.closest?.('a[href],button');
    (interactive&&root.contains(interactive)?interactive:image).insertAdjacentElement('afterend',button);scope.own(button);scope.on(button,'click',()=>viewer.open(button));
  }
  return viewer;
}
