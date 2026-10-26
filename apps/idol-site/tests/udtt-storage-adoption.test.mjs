import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contract} from '../lib/idol/design-review/sol15-runtime/contract.js';
import {artist,render} from '../lib/idol/design-review/sol15-runtime/groups/udtt/index.js';
import {validatePrivateViewer,createPrivateHelpers,createPrivateImageQueue,PRIVATE_IMAGE_IDS,HERO_SHA256} from '../lib/idol/design-review/sol15-runtime/private-images.mjs';
import {REVIEW_PATH,readReviewUrl,nativeHref,resolveNative} from '../lib/idol/design-review/sol15-runtime/private-model.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),load=require('./helpers/public-artist-loader.cjs');
const production={...load('lib/idol/artist-navigation.ts'),...load('lib/idol/journey.ts'),...load('lib/idol/stage-source.ts')};
const originals=[artist.hero,...artist.members.map(row=>row.image),...artist.works.map(row=>row.image)];
function fixture(){const manifestHash='a'.repeat(64);return {manifestHash,entries:Object.values(contract.assets).map(row=>{const original=originals.find(value=>value.src===row.path),assetId=PRIVATE_IMAGE_IDS[row.path];return {assetId,sha256:row.sha256,byteLength:row.bytes,mime:row.path.endsWith('.webp')?'image/webp':'image/jpeg',width:original.width,height:original.height,readUrl:'/api/editorial-assets?'+new URLSearchParams({manifest:manifestHash,asset:assetId,version:'b'.repeat(64)})};})};}
const route=(page='home',key=null)=>({slug:'udtt',page,key,query:new URLSearchParams()});
class Node extends EventTarget{
 constructor(tag='div'){super();this.tagName=tag.toUpperCase();this.attrs=new Map();this.children=[];this.parentNode=null;this.assignments=[];}
 get attributes(){return [...this.attrs].map(([name,value])=>({name,value}));}
 setAttribute(name,value){this.attrs.set(name,String(value));if(name==='src')this.assignments.push(String(value));}
 getAttribute(name){return this.attrs.get(name)??null;}
 hasAttribute(name){return this.attrs.has(name);}
 removeAttribute(name){this.attrs.delete(name);}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null;}
 append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
 replaceWith(node){const parent=this.parentNode,index=parent.children.indexOf(this);node.remove();parent.children[index]=node;node.parentNode=parent;this.parentNode=null;}
 querySelectorAll(){return this.children.filter(node=>node.tagName==='IMG');}
}
function harness(){
 const references=validatePrivateViewer(fixture()),parking=new Node(),root=new Node(),timers=new Map(),reports=[];let time=0,next=1;
 const scheduler={performance:{now:()=>time},setTimeout(fn,ms){const id=next++;timers.set(id,{fn,at:time+ms});return id;},clearTimeout(id){timers.delete(id);}};
 const queue=createPrivateImageQueue({references,parking,scheduler,onReport:value=>reports.push(value)});
 const make=entry=>{const node=new Node('img');node.setAttribute('data-private-asset-id',entry.assetId);node.setAttribute('data-private-sha256',entry.sha256);node.setAttribute('class','original');node.naturalWidth=entry.width;node.naturalHeight=entry.height;node.decode=()=>Promise.resolve();return node;};
 const tick=async(ms=1)=>{time+=ms;for(const [id,item] of [...timers])if(item.at<=time){timers.delete(id);item.fn();}await Promise.resolve();await Promise.resolve();await Promise.resolve();};
 const all=references.entries.map(make);root.append(...all.slice().reverse());
 return {references,parking,root,queue,all,make,tick,reports,scheduler,active:()=>all.find(node=>node.getAttribute('data-private-asset-id')===queue.report().inFlightAssetId)};
}

function viewerImage(h,index=1){const e=h.references.entries[index],node=h.make(e);return {e,node,asset:{src:e.readUrl,privateAssetId:e.assetId,sha256:e.sha256,width:e.width,height:e.height}};}
test('viewer requests and manual retry share the one-active queue; close does not release pending lease',async()=>{
 const h=harness();h.queue.attach(h.root);const first=h.active(),v=viewerImage(h);let loaded=0,failed=0;
 const cancel=h.queue.requestViewer(v.node,v.asset,{onLoad:()=>loaded++,onError:()=>failed++});assert.equal(v.node.assignments.length,0);
 first.dispatchEvent(new Event('load'));await h.tick();assert.equal(v.node.assignments.length,1);cancel();
 const next=viewerImage(h);h.queue.requestViewer(next.node,next.asset,{onLoad:()=>loaded++,onError:()=>failed++});assert.equal(next.node.assignments.length,0);
 v.node.dispatchEvent(new Event('error'));await h.tick();assert.equal(failed,0);assert.equal(next.node.assignments.length,1);
 next.node.dispatchEvent(new Event('error'));assert.equal(failed,1);
 const retry=viewerImage(h);h.queue.requestViewer(retry.node,retry.asset,{onLoad:()=>loaded++,onError:()=>failed++});
 // A background IMG may already own the slot. It must complete first.
 if(!retry.node.assignments.length){h.active().dispatchEvent(new Event('load'));await h.tick();}
 assert.equal(retry.node.assignments.length,1);retry.node.dispatchEvent(new Event('load'));await h.tick();assert.equal(loaded,1);h.queue.destroy();
});
test('viewer timeout, close, reopen and remount cannot manufacture cancellation or overlap',async()=>{
 const h=harness(),v=viewerImage(h);let failed=0;const cancel=h.queue.requestViewer(v.node,v.asset,{onLoad:()=>{},onError:()=>failed++});await h.tick(20000);assert.equal(failed,1);assert.equal(h.queue.report().stopped,true);cancel();
 const next=viewerImage(h);h.queue.requestViewer(next.node,next.asset,{onLoad:()=>{},onError:()=>failed++});await h.tick();assert.equal(next.node.assignments.length,0);h.queue.destroy();v.node.dispatchEvent(new Event('error'));
});
test('cancelled queued viewer jobs never assign src; invalid tuples fail closed',()=>{
 const h=harness();h.queue.attach(h.root);const v=viewerImage(h),cancel=h.queue.requestViewer(v.node,v.asset,{onLoad:()=>{},onError:()=>{}});cancel();assert.equal(v.node.assignments.length,0);
 assert.throws(()=>h.queue.requestViewer(v.node,{...v.asset,src:'/static.jpg'},{onLoad:()=>{},onError:()=>{}}));h.queue.destroy();
});
test('normal helpers expose exact private viewer asset and keep original quality policy',()=>{
 const refs=validatePrivateViewer(fixture()),helpers=createPrivateHelpers(refs,()=>()=>{}),asset=artist.works[1].image,mapped=helpers.resolveMediaAsset(asset);
 assert.equal(mapped.qualityLevel,asset.qualityLevel);assert.equal(mapped.sha256,asset.sha256);assert.match(mapped.src,/^\/api\/editorial-assets\?/);assert.ok(mapped.privateAssetId);assert.equal(typeof helpers.mediaImageTransport,'function');
});

test('viewer close during decode and destroy/remount retain unresolved real IMG lease',async()=>{
 const h=harness(),v=viewerImage(h);let decoded,called=0;v.node.decode=()=>new Promise(resolve=>decoded=resolve);
 const cancel=h.queue.requestViewer(v.node,v.asset,{onLoad:()=>called++,onError:()=>called++});v.node.dispatchEvent(new Event('load'));await h.tick();cancel();
 const next=viewerImage(h);h.queue.requestViewer(next.node,next.asset,{onLoad:()=>called++,onError:()=>called++});assert.equal(next.node.assignments.length,0);
 h.queue.destroy();const second=createPrivateImageQueue({references:h.references,parking:new Node(),scheduler:h.scheduler});const newer=viewerImage(h);second.requestViewer(newer.node,newer.asset,{onLoad:()=>called++,onError:()=>called++});assert.equal(newer.node.assignments.length,0);assert.equal(second.report().stopped,true);
 decoded();await h.tick();assert.equal(called,0);assert.equal(newer.node.assignments.length,0);second.destroy();
 const third=createPrivateImageQueue({references:h.references,parking:new Node(),scheduler:h.scheduler});const final=viewerImage(h);third.requestViewer(final.node,final.asset,{onLoad:()=>called++,onError:()=>called++});assert.equal(final.node.assignments.length,1);third.destroy();final.node.dispatchEvent(new Event('error'));
});
