import {fixture as privateViewerFixture} from './helpers/udtt-private-fixture.mjs';
// Imported production wrappers with parsed DOM and explicit geometry/focus fixtures.
// Not browser layout, CSS or native dialog acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createUdttReview} from '../lib/idol/design-review/sol15-runtime/host.mjs';
import {createVchaReview} from '../lib/idol/design-review/vcha-runtime/host.mjs';
const require=createRequire(import.meta.url),load=require('./helpers/public-artist-loader.cjs');
const production={...load('lib/idol/artist-navigation.ts'),...load('lib/idol/journey.ts'),...load('lib/idol/stage-source.ts')};
const {parseHTML}=await import(process.env.UDTT_DOM_MODULE);
const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
async function harness(slug,key){
 const {document,window:dom}=parseHTML('<html><body><div id="clip"><div id="host"></div></div></body></html>');
 const win=new EventTarget();let url=`/design-review/sol15/${slug}#/${slug}/work/${encodeURIComponent(key)}`;
 win.location={};const update=value=>{url=value;const u=new URL(value,'https://test.invalid');Object.assign(win.location,{pathname:u.pathname,search:u.search,hash:u.hash});};update(url);
 win.scrollY=0;win.scrollTo=()=>{};win.confirm=()=>true;win.alert=()=>{};win.history={state:null,replaceState(s,_,v){this.state=s;update(v)},pushState(s,_,v){this.state=s;update(v)}};
 Object.assign(win,{setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout});
 const frames=new Map();let frameId=0;const observers=[];
 Object.assign(dom,{innerWidth:1440,innerHeight:900,requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId},cancelAnimationFrame:id=>frames.delete(id),getComputedStyle:node=>node.id==='clip'?{overflow:'hidden'}:{},ResizeObserver:class{constructor(cb){this.cb=cb;this.targets=[];observers.push(this)}observe(node){this.targets.push(node)}disconnect(){this.targets=[]}}});
 const host=document.getElementById('host'),clip=document.getElementById('clip');let bounds=rect(180,90,760,600);host.getBoundingClientRect=()=>bounds;clip.getBoundingClientRect=()=>rect(210,100,640,500);
 const catalog=JSON.parse(fs.readFileSync(new URL(`./fixtures/${slug}-review-catalog.json`,import.meta.url)));
 const review=(slug==='udtt'?createUdttReview:createVchaReview)({host,catalog,production,window:win,...(slug==='udtt'?{viewer:privateViewerFixture()}:{})});
 review.root.getBoundingClientRect=()=>bounds;host.shadowRoot.querySelector('link').onload();await review.ready;
 if(slug==='udtt'){const image=review.root.querySelector('img');image.decode=()=>Promise.resolve();Object.defineProperty(image,'naturalWidth',{value:Number(image.getAttribute('width')),configurable:true});Object.defineProperty(image,'naturalHeight',{value:Number(image.getAttribute('height')),configurable:true});image.dispatchEvent(new dom.Event('load'));await new Promise(resolve=>setTimeout(resolve,5));}
 const made=[];const create=document.createElement.bind(document);document.createElement=(tag,...args)=>{const node=create(tag,...args);if(tag==='img'){made.push(node);node.decode=()=>Promise.resolve();Object.defineProperty(node,'naturalWidth',{get:()=>Number(node.getAttribute('width'))});Object.defineProperty(node,'naturalHeight',{get:()=>Number(node.getAttribute('height'))});}return node;};
 let focus=null;Object.defineProperty(host.shadowRoot,'activeElement',{get:()=>focus});
 const prepareFocus=()=>{for(const n of review.root.querySelectorAll('button'))n.focus=()=>{focus=n;};};prepareFocus();
 return {review,dom,document,frames,observers,settlePrior(current){for(const image of made)if(image!==current&&image.getAttribute('data-private-image-state')==='loading')image.dispatchEvent(new dom.Event('error'));},setBounds:v=>bounds=v,get focus(){return focus},prepareFocus,click(node,type='click',key){const e=new dom.Event(type,{bubbles:true,cancelable:true});if(key)Object.defineProperty(e,'key',{value:key});node.dispatchEvent(e);return e},flush(){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());},tick:()=>new Promise(r=>setTimeout(r,5))};
}
for(const [slug,key]of [['udtt','rec28ldfRTrPxZ'],['vcha','recvxIZFpVm8cn']]){
 test(`${slug}: actual wrapper imports viewer, mapped original retry, stale images, ShadowDOM geometry/focus and zero teardown`,async()=>{
  const h=await harness(slug,key),r=h.review.root,trigger=r.querySelector('[data-action="media-preview"]');
  assert.ok(trigger,'viewer control installed against remapped asset');const art=r.querySelector('img[data-quality-level]');assert.equal(art.getAttribute('data-natural-width'),'1280');assert.equal(art.getAttribute('data-media-max-width'),slug==='udtt'?'1280':'320');
  h.click(trigger);let dialog=r.querySelector('dialog');assert.ok(dialog);h.prepareFocus();
  h.review.navigate(`#/${slug}/members`);assert.equal(r.querySelector('dialog'),dialog,'open modal blocks wrapper navigation');
  const close=dialog.querySelector('[data-action="media-preview-close"]');close.focus();h.click(dialog,'keydown','Tab');assert.equal(h.focus,close);
  assert.equal(dialog.getAttribute('data-media-host-left'),'210');assert.equal(dialog.getAttribute('data-media-host-top'),'100');
  let image=dialog.querySelector('img'),source=image.getAttribute('src');assert.match(source,slug==='udtt'?/^\/api\/editorial-assets\?/:/^\/design-review\/sol15\//);assert.equal(image.getAttribute('width'),'1280');assert.equal(image.getAttribute('data-media-max-width'),slug==='udtt'?'1280':'320');
  h.click(image,'error');const retry=dialog.querySelector('[data-action="media-preview-retry"]');assert.equal(retry.hidden,false);h.click(retry);const fresh=dialog.querySelector('img');assert.notEqual(image,fresh);assert.equal(fresh.getAttribute('src'),source);assert.equal(dialog.getAttribute('data-media-attempt'),'2');h.click(image,'error');h.click(image,'load');assert.equal(fresh.hidden,false);h.click(fresh,'load');await h.tick();assert.equal(retry.hidden,true);
  h.setBounds(rect(300,130,400,330));h.flush();assert.equal(dialog.getAttribute('data-media-host-left'),'300');assert.equal(dialog.getAttribute('data-media-host-top'),'130');
  h.click(dialog,'keydown','Escape');assert.equal(r.querySelector('dialog'),null);assert.equal(h.frames.size,0);assert.equal(h.focus,trigger);assert.ok(h.observers.every(o=>o.targets.length===0));
  h.click(trigger);dialog=r.querySelector('dialog');assert.ok(dialog);h.setBounds(rect(300,130,0,330));h.flush();assert.equal(r.querySelector('dialog'),null);assert.equal(h.frames.size,0);
  h.setBounds(rect(180,90,760,600));h.click(trigger);dialog=r.querySelector('dialog');const late=dialog.querySelector('img');h.review.destroy();h.click(late,'error');h.click(late,'load');assert.equal(h.frames.size,0);assert.equal(h.review.shadow.childNodes.length,0);assert.ok(h.observers.every(o=>o.targets.length===0));
 });
 test(`${slug}: rapid route replacement preserves native actions and cleans old media sessions`,async()=>{
  const h=await harness(slug,key);const old=h.review.root.querySelector('[data-action="media-preview"]');
  h.review.navigate(`#/${slug}/works`);h.review.navigate(`#/${slug}/members`);await h.tick();assert.equal(h.review.root.querySelector('[data-action="media-preview"]'),null);h.click(old);assert.equal(h.review.root.querySelector('dialog'),null);
  h.review.navigate(`#/${slug}/work/${encodeURIComponent(key)}`);await h.tick();const button=h.review.root.querySelector('[data-action="media-preview"]');assert.ok(button);assert.ok(h.review.root.querySelector('[data-native-action="records"]'));h.click(button);assert.equal(h.review.root.querySelectorAll('dialog').length,1);h.review.destroy();assert.equal(h.frames.size,0);
 });
 test(`${slug}: synchronous native close reentry preserves newest session`,async()=>{
  const h=await harness(slug,key),r=h.review.root,trigger=r.querySelector('[data-action="media-preview"]');h.click(trigger);const old=r.querySelector('dialog'),oldImage=old.querySelector('img');
  old.open=true;old.close=()=>{old.open=false;h.click(trigger);};h.click(trigger);
  const current=r.querySelector('dialog');assert.ok(current);assert.notEqual(current,old);assert.equal(r.querySelectorAll('dialog').length,1);h.click(oldImage,'error');assert.equal(current.querySelector('[data-action="media-preview-retry"]').hidden,true);
  h.click(current.querySelector('[data-action="media-preview-close"]'));h.review.navigate(`#/${slug}/works`);await h.tick();assert.equal(r.querySelector('dialog'),null);
  if(slug==='vcha'){const card=r.querySelector('img[data-quality-level="card"]');assert.ok(card);assert.equal(card.getAttribute('data-natural-width'),'1280');assert.equal(card.getAttribute('data-media-max-width'),'240');}
  h.review.destroy();assert.equal(h.frames.size,0);
 });

 for(const boundary of ['append','showModal'])test(`${slug}: synchronous ${boundary} reentry preserves newest session`,async()=>{
  const h=await harness(slug,key),r=h.review.root,trigger=r.querySelector('[data-action="media-preview"]');let nested=false;
  if(boundary==='append'){const append=r.append.bind(r);r.append=(...nodes)=>{append(...nodes);if(!nested&&nodes.some(n=>n.tagName==='DIALOG')){nested=true;h.click(trigger);}};}
  else {const create=h.document.createElement.bind(h.document);h.document.createElement=(tag,...args)=>{const node=create(tag,...args);if(tag==='dialog')node.showModal=()=>{node.open=true;if(!nested){nested=true;h.click(trigger);}};return node;};}
  h.click(trigger);assert.equal(nested,true);assert.equal(r.querySelectorAll('dialog').length,1);const current=r.querySelector('dialog');h.settlePrior(current.querySelector('img'));h.click(current.querySelector('img'),'error');assert.equal(current.querySelector('[data-action="media-preview-retry"]').hidden,false);h.review.destroy();assert.equal(h.frames.size,0);
 });

}
