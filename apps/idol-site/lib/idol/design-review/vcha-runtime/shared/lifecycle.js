import {attachActionIdentities,identityFor} from './identity.js';
import {withMediaContext} from './helpers.js';
import {installMediaViewer} from './media-viewer.js';
import {createScopedNavigation} from './router.js';

const activeMounts=new WeakMap(),renderedMounts=new WeakMap(),resourceOwners=new WeakMap();let nextMount=0;
export function createScope({scheduler=globalThis,id='artist',isOwner=()=>true}={}){
  const controller=new AbortController(),cleanups=[],timeouts=new Set(),intervals=new Set(),frames=new Set(),dialogs=new Set(),errors=[],lateDisposed=new WeakSet();let dead=false;
  const attempt=fn=>{try{return fn();}catch(error){errors.push(error);}};
  const disposeNode=(node,close=false)=>{
    if(resourceOwners.get(node)!==scope)return;
    if(close&&node.open)attempt(()=>node.close());
    // A close callback can transfer this exact object to a newer scope.
    if(resourceOwners.get(node)!==scope)return;
    resourceOwners.delete(node);attempt(()=>node.remove?.());
  };
  const disposeLate=(resource,kind)=>{
    if(!resource||!['object','function'].includes(typeof resource))return resource;
    const owner=resourceOwners.get(resource);
    if(owner&&owner!==scope||lateDisposed.has(resource))return resource;
    lateDisposed.add(resource);resourceOwners.set(resource,scope);
    if(kind==='observer'){resourceOwners.delete(resource);attempt(()=>resource.disconnect?.());}
    else disposeNode(resource,kind==='dialog');
    return resource;
  };
  const scope={id,signal:controller.signal,get destroyed(){return dead;},
    isCurrent:()=>!dead&&isOwner(),
    get cleanupErrors(){return [...errors];},
    addCleanup(fn){if(typeof fn!=='function')return fn;if(dead)attempt(fn);else cleanups.push(fn);return fn;},
    removeCleanup(fn){const index=cleanups.indexOf(fn);if(index>=0)cleanups.splice(index,1);},
    on(target,type,fn,options){if(!scope.isCurrent())return()=>{};const guarded=function(event){if(scope.isCurrent())return fn.call(target,event);};target.addEventListener(type,guarded,options);let attached=true;const off=()=>{if(attached){attached=false;target.removeEventListener(type,guarded,options);}scope.removeCleanup(off);};scope.addCleanup(off);return off;},
    setTimeout(fn,delay,...args){if(!scope.isCurrent())return null;const token=scheduler.setTimeout(()=>{timeouts.delete(token);if(scope.isCurrent())fn(...args);},delay);timeouts.add(token);return token;},
    clearTimeout(token){if(timeouts.delete(token))scheduler.clearTimeout(token);},
    setInterval(fn,delay,...args){if(!scope.isCurrent())return null;const token=scheduler.setInterval(()=>{if(scope.isCurrent())fn(...args);},delay);intervals.add(token);return token;},
    clearInterval(token){if(intervals.delete(token))scheduler.clearInterval(token);},
    requestAnimationFrame(fn){if(!scope.isCurrent()||!scheduler.requestAnimationFrame)return null;const token=scheduler.requestAnimationFrame(time=>{frames.delete(token);if(scope.isCurrent())fn(time);});frames.add(token);return token;},
    own(node){if(!node)return node;if(!scope.isCurrent())return disposeLate(node,'node');resourceOwners.set(node,scope);scope.addCleanup(()=>disposeNode(node,dialogs.has(node)));return node;},
    owns(node){return resourceOwners.get(node)===scope;},
    release(node){if(resourceOwners.get(node)===scope)resourceOwners.delete(node);dialogs.delete(node);},
    ownObserver(observer){if(!observer)return observer;if(!scope.isCurrent())return disposeLate(observer,'observer');resourceOwners.set(observer,scope);scope.addCleanup(()=>{if(resourceOwners.get(observer)===scope){resourceOwners.delete(observer);observer.disconnect?.();}});return observer;},
    trackDialog(dialog){if(!dialog)return dialog;if(!scope.isCurrent())return disposeLate(dialog,'dialog');resourceOwners.set(dialog,scope);dialogs.add(dialog);return dialog;},
    commit(fn){if(!scope.isCurrent())return {status:'stale'};return {status:'committed',value:fn()};},
    async guardAsync(promise,commit){let value;try{value=await promise;}catch(error){if(!scope.isCurrent())return {status:'stale'};throw error;}if(!scope.isCurrent())return {status:'stale'};const result=await commit(value,scope);return scope.isCurrent()?{status:'committed',value:result}:{status:'stale'};},
    stats(){return {active:!dead,cleanups:cleanups.length,timeouts:timeouts.size,intervals:intervals.size,frames:frames.size,dialogs:dialogs.size};},
    destroy(){if(dead)return;dead=true;attempt(()=>controller.abort());for(const token of timeouts)attempt(()=>scheduler.clearTimeout(token));for(const token of intervals)attempt(()=>scheduler.clearInterval(token));for(const token of frames)attempt(()=>scheduler.cancelAnimationFrame?.(token));timeouts.clear();intervals.clear();frames.clear();for(const fn of cleanups.splice(0).reverse())attempt(fn);for(const dialog of dialogs)disposeNode(dialog,true);dialogs.clear();}
  };return scope;
}
export function namespaceDomIds(root,prefix){
  const map=new Map();
  for(const element of root.querySelectorAll('[id]')){
    const local=element.getAttribute('data-local-id')??element.id;
    if(map.has(local))throw new Error(`Duplicate local DOM id: ${local}`);
    const id=`${prefix}--${local}`;map.set(local,id);element.setAttribute('data-local-id',local);element.id=id;
  }
  const lists=['for','aria-controls','aria-labelledby','aria-describedby','aria-owns','headers'];
  for(const element of root.querySelectorAll('*')){
    for(const attribute of lists)if(element.hasAttribute(attribute))element.setAttribute(attribute,element.getAttribute(attribute).split(/\s+/).map(id=>map.get(id)??id).join(' '));
    const href=element.getAttribute('href');if(href?.startsWith('#')&&!href.startsWith('#/')){const local=href.slice(1);if(map.has(local))element.setAttribute('href',`#${map.get(local)}`);}
  }
  return map;
}
export function activateLocalFragment(event,root){
  const anchor=event.target?.closest?.('a[href]');
  if(!anchor||!root.contains(anchor))return false;
  const href=anchor.getAttribute('href');
  if(!href?.startsWith('#')||href.startsWith('#/')||href.length<2)return false;
  let id;try{id=decodeURIComponent(href.slice(1));}catch{return false;}
  event.preventDefault();
  const target=[...root.querySelectorAll('[id]')].find(node=>node.id===id);
  if(!target)return true;
  target.scrollIntoView?.({block:'start'});target.focus?.({preventScroll:true});return true;
}
const legacySelector=selector=>selector.replace(/#([A-Za-z_][\w-]*)/g,(_,id)=>`[data-local-id="${id}"]`);
export function scopedRoot(root,scope){
  const alive=()=>!scope||scope.isCurrent(),objects=new Map(),listeners=[];
  const object=(value)=>{if(!objects.has(value))objects.set(value,new Proxy(value,{get(target,key){const item=Reflect.get(target,key,target);return typeof item==='function'?(...args)=>alive()?item.apply(target,args):undefined:alive()?item:undefined;},set(target,key,value){if(alive())Reflect.set(target,key,value,target);return true;},deleteProperty(target,key){if(alive())Reflect.deleteProperty(target,key);return true;}}));return objects.get(value);};
  return new Proxy(root,{get(target,key){
    if(key==='querySelector'||key==='querySelectorAll')return selector=>alive()?target[key](legacySelector(selector)):key==='querySelectorAll'?[]:null;
    if(scope&&key==='addEventListener')return(type,fn,options)=>{listeners.push({type,fn,options,off:scope.on(target,type,fn,options)});};
    if(scope&&key==='removeEventListener')return(type,fn,options)=>{for(const item of listeners)if(item.type===type&&item.fn===fn&&Boolean(typeof item.options==='boolean'?item.options:item.options?.capture)===Boolean(typeof options==='boolean'?options:options?.capture))item.off();};
    const value=Reflect.get(target,key,target);
    if(value&&['dataset','style','classList'].includes(key))return object(value);
    return typeof value==='function'?(...args)=>alive()?value.apply(target,args):key==='contains'?false:undefined:value;
  },set(target,key,value){if(alive())Reflect.set(target,key,value,target);return true;}});
}
export function mountArtist({root,module,route,helpers,scheduler=globalThis,onIdentityError,onActivation,onNavigate}){
  if(!root||typeof root.querySelectorAll!=='function'||typeof root.replaceChildren!=='function'||!root.dataset||!module?.artist||typeof module.render!=='function'||!route||typeof route.page!=='string'||typeof helpers?.image!=='function')throw new TypeError('Invalid artist mount contract');
  // Binding helpers can itself execute caller-provided getters. Validate/bind
  // before reserving the root so a bad adapter cannot retire a valid page.
  const mediaHelpers=withMediaContext(helpers,route.page==='work'?'detail':route.page==='home'?'feature':'card');
  const previous=activeMounts.get(root),artist=module.artist,id=`sol-${artist.slug}-${++nextMount}`;
  let handle;const scope=createScope({scheduler,id,isOwner:()=>activeMounts.get(root)===handle});
  const navigate=createScopedNavigation({artist,route,scope,isCurrent:scope.isCurrent,onNavigate,defaultIdentity:identityFor({artist,route})});
  const viewHelpers=Object.freeze({...mediaHelpers,navigate});
  const releaseRoot=()=>{if(activeMounts.get(root)===handle)activeMounts.delete(root);if(renderedMounts.get(root)===handle){renderedMounts.delete(root);if(root.dataset.mountId===id){root.replaceChildren();delete root.dataset.artist;delete root.dataset.mountId;}}};
  handle={artist,scope,id,ready:null,destroy(){if(scope.destroyed)return;releaseRoot();scope.destroy();}};
  // Reserve ownership before cleanup: a callback's nested newer mount wins,
  // and destroys this reservation instead of being silently overwritten.
  activeMounts.set(root,handle);
  scope.addCleanup(releaseRoot);
  previous?.destroy();
  handle.ready=Promise.resolve().then(()=>!scope.isCurrent()?null:module.render({route,helpers:viewHelpers,scope})).then(async html=>{
    if(!scope.isCurrent())return {status:'stale'};
    if(typeof html!=='string')throw new TypeError('Artist render must return HTML');
    renderedMounts.set(root,handle);root.dataset.artist=artist.slug;root.dataset.mountId=id;root.innerHTML=html;
    namespaceDomIds(root,id);
    for(const dialog of root.querySelectorAll('dialog'))scope.trackDialog(dialog);
    attachActionIdentities({root,artist,route,scope,navigate,onInvalid:onIdentityError,onValid:onActivation});
    scope.on(root,'click',event=>activateLocalFragment(event,root),{capture:true});
    installMediaViewer({root,artist,route,helpers:viewHelpers,scope});
    const cleanup=await module.afterRender?.({root:scopedRoot(root,scope),route,helpers:viewHelpers,scope});
    if(typeof cleanup==='function')scope.addCleanup(cleanup);
    return {status:scope.destroyed?'stale':'mounted'};
  }).catch(error=>{const current=scope.isCurrent();handle.destroy();if(!current)return {status:'stale'};throw error;});
  return handle;
}
export function destroyArtist(root){activeMounts.get(root)?.destroy();}
export function activeArtistMount(root){return activeMounts.get(root)??null;}
