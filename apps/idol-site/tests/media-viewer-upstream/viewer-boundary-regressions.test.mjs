import test from 'node:test';
import assert from 'node:assert/strict';
import {createScope} from '../../lib/idol/design-review/vcha-runtime/shared/lifecycle.js';
import {createMediaViewer} from '../../lib/idol/design-review/vcha-runtime/shared/media-viewer.js';
import {documentFor,rootFor} from './runtime-dom-harness.mjs';

// Synchronous adapter/resource tests, not browser layout or native-dialog timing proof.
const asset={src:'https://images.example.test/same-video.jpg?approved=1',width:1280,height:720,qualityLevel:'card',imageryManaged:true,noUpscale:true};
function environment(){
 const doc=documentFor(),window=new EventTarget(),frames=new Map(),resizeObservers=[],mutationObservers=[],requests=[];let nextFrame=0;
 Object.assign(window,{innerWidth:1200,innerHeight:900,requestAnimationFrame(fn){const token=++nextFrame;frames.set(token,fn);return token;},cancelAnimationFrame(token){frames.delete(token);},getComputedStyle(node){return node.css??{overflow:'visible'};}});
 window.visualViewport=Object.assign(new EventTarget(),{width:1200,height:900,offsetLeft:0,offsetTop:0});doc.defaultView=window;
 const create=doc.createElement.bind(doc);doc.createElement=tag=>{const node=create(tag),set=node.setAttribute.bind(node);node.nodeType=1;node.getBoundingClientRect=()=>node.box??{left:0,top:0,width:200,height:node.tagName==='H2'?24:32};node.setAttribute=(name,value)=>{if(name==='src')requests.push({node,source:String(value)});set(name,value);};return node;};
 window.ResizeObserver=class{constructor(callback){this.callback=callback;this.active=false;this.disconnects=0;resizeObservers.push(this);}observe(){this.active=true;}disconnect(){this.active=false;this.disconnects++;}};
 window.MutationObserver=class{constructor(callback){this.callback=callback;this.active=false;this.disconnects=0;mutationObservers.push(this);}observe(){this.active=true;}disconnect(){this.active=false;this.disconnects++;}};
 const root=rootFor(doc);root.box={left:100,top:50,width:640,height:400};root.css={overflow:'visible'};
 const opener=doc.createElement('button');root.append(opener);
 const flush=()=>{const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(0);};
 const viewer=({scope=createScope({scheduler:window}),host=root}={})=>({scope,viewer:createMediaViewer({root:host,scope,asset,title:'Exact video',entityKey:'real-work-identity',mediaRole:'video-preview'})});
 return {doc,window,frames,resizeObservers,mutationObservers,requests,root,opener,flush,viewer};
}
const liveDialogs=env=>env.doc.body.querySelectorAll('dialog').filter(node=>node.open);
function released(env,scope,viewer){
 assert.equal(viewer.dialog,null);assert.equal(liveDialogs(env).length,0);assert.equal(env.frames.size,0);
 assert(env.resizeObservers.every(observer=>!observer.active));assert(env.mutationObservers.every(observer=>!observer.active));
 // The viewer's mount-lifetime destroy cleanup remains; transient scope.on listeners do not.
 assert.deepEqual(scope.stats(),{active:true,cleanups:1,timeouts:0,intervals:0,frames:0,dialogs:0});
}

test('synchronous close callback nested open wins over the older outer open reservation',()=>{
 const env=environment(),{scope,viewer}=env.viewer();const a=viewer.open(env.opener).dialog;let nested;
 a.addEventListener('close',()=>{nested=viewer.open(env.opener);},{once:true});
 const outer=viewer.open(env.opener);
 assert.equal(outer.status,'stale','superseded outer open must not build C');assert.equal(nested.status,'opened');assert.equal(viewer.dialog,nested.dialog);
 assert.deepEqual(liveDialogs(env),[nested.dialog]);assert.equal(env.requests.length,2,'only A and nested B may request images');assert.equal(env.frames.size,1);
 viewer.close();released(env,scope,viewer);scope.destroy();
});

test('multiple synchronous close/open reentries keep only the deepest newer session and clean all resources',()=>{
 const env=environment(),{scope,viewer}=env.viewer();const a=viewer.open(env.opener).dialog;let b,c,cOuter;
 a.addEventListener('close',()=>{
  b=viewer.open(env.opener);b.dialog.addEventListener('close',()=>{c=viewer.open(env.opener);},{once:true});
  cOuter=viewer.open(env.opener);
 },{once:true});
 const outer=viewer.open(env.opener);
 assert.equal(outer.status,'stale');assert.equal(cOuter.status,'stale');assert.equal(viewer.dialog,c.dialog);assert.deepEqual(liveDialogs(env),[c.dialog]);
 assert.equal(env.requests.length,3);assert.equal(env.frames.size,1);viewer.close();released(env,scope,viewer);scope.destroy();
});

test('initial finite zero root does not open fallback or leave a frame or temporary listener',()=>{
 for(const box of [{left:100,top:50,width:0,height:0},{left:100,top:50,width:0,height:400},{left:100,top:50,width:640,height:0}]){
  const env=environment(),{scope,viewer}=env.viewer();env.root.box=box;const result=viewer.open(env.opener);
  assert.notEqual(result.status,'opened');released(env,scope,viewer);assert.equal(env.opener.focused,0);scope.destroy();
 }
});

test('initial zero-height overflow-hidden ancestor prevents full-viewport fallback',()=>{
 const env=environment(),parent=env.doc.createElement('section');parent.box={left:100,top:50,width:640,height:0};parent.css={overflow:'hidden'};env.doc.body.append(parent);parent.append(env.root);
 const {scope,viewer}=env.viewer();assert.notEqual(viewer.open(env.opener).status,'opened');released(env,scope,viewer);assert.equal(env.opener.focused,0);scope.destroy();
});

test('opened root collapsing to zero closes tracked dialog, rejects late events and can open after recovery',()=>{
 for(const dimension of ['width','height','both']){
  const env=environment(),{scope,viewer}=env.viewer(),a=viewer.open(env.opener).dialog,image=a.querySelector('img');
  const callbacks=[...env.resizeObservers,...env.mutationObservers].map(observer=>observer.callback),requestCount=env.requests.length;
  if(dimension!=='height')env.root.box.width=0;if(dimension!=='width')env.root.box.height=0;
  env.flush();released(env,scope,viewer);assert.equal(a.open,false);assert.equal(env.root.contains(a),false);assert.equal(env.opener.focused,0);
  for(const callback of callbacks)callback([]);image.dispatchEvent(new Event('error'));image.dispatchEvent(new Event('load'));a.dispatchEvent(new Event('close'));env.window.dispatchEvent(new Event('scroll'));env.flush();
  released(env,scope,viewer);assert.equal(env.requests.length,requestCount);
  env.root.box={left:100,top:50,width:640,height:400};const next=viewer.open(env.opener);assert.equal(next.status,'opened');assert.notEqual(next.dialog,a);assert.equal(next.dialog.querySelector('img').getAttribute('data-media-max-width'),'320');
  viewer.close();released(env,scope,viewer);scope.destroy();
 }
});

test('clipping ancestor collapsing one axis closes modal without focusing its hidden trigger',()=>{
 for(const axis of ['width','height']){
  const env=environment(),parent=env.doc.createElement('section');parent.box={left:100,top:50,width:640,height:400};parent.css={overflow:'hidden'};env.doc.body.append(parent);parent.append(env.root);
  const {scope,viewer}=env.viewer(),a=viewer.open(env.opener).dialog;parent.box[axis]=0;env.flush();released(env,scope,viewer);assert.equal(a.open,false);assert.equal(env.opener.focused,0);scope.destroy();
 }
});

test('zero-sized old root closes only its own scope while another root keeps the tracked new modal',()=>{
 const env=environment(),{scope:aScope,viewer:a}=env.viewer(),old=a.open(env.opener).dialog;
 const other=env.doc.createElement('main');other.box={left:760,top:50,width:400,height:400};other.css={overflow:'visible'};env.doc.body.append(other);const opener=env.doc.createElement('button');other.append(opener);
 const {scope:bScope,viewer:b}=env.viewer({host:other}),winner=b.open(opener).dialog,focus=env.doc.activeElement;
 env.root.box.width=0;env.root.box.height=0;env.flush();assert.equal(a.dialog,null);assert.equal(env.root.contains(old),false);assert.equal(b.dialog,winner);assert.equal(winner.open,true);assert.equal(env.doc.activeElement,focus);assert.equal(env.frames.size,1);assert.equal(aScope.stats().dialogs,0);assert.equal(aScope.stats().cleanups,1);
 aScope.destroy();assert.equal(b.dialog,winner);assert.equal(winner.open,true);b.close();assert.equal(env.frames.size,0);bScope.destroy();
});

test('close callback may transfer a dialog to another scope without old scope cleanup removing it',()=>{
 const env=environment(),{scope:aScope,viewer:a}=env.viewer(),dialog=a.open(env.opener).dialog,bScope=createScope({scheduler:env.window});
 dialog.addEventListener('close',()=>{bScope.trackDialog(dialog);dialog.showModal();},{once:true});
 a.close();assert.equal(a.dialog,null);assert.equal(dialog.open,true);assert.equal(env.root.contains(dialog),true);assert.equal(bScope.owns(dialog),true);assert.equal(aScope.owns(dialog),false);assert.equal(aScope.stats().dialogs,0);assert.equal(env.frames.size,0);
 aScope.destroy();assert.equal(dialog.open,true);assert.equal(env.root.contains(dialog),true);bScope.destroy();assert.equal(dialog.open,false);assert.equal(env.root.contains(dialog),false);
});
