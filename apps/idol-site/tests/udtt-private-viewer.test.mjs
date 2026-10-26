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
test('private manifest admits only all 11 exact immutable path/SHA/ID/byte/dimension/mime bindings',()=>{
 const refs=validatePrivateViewer(fixture());assert.equal(refs.entries.length,11);assert.equal(refs.entries.reduce((sum,row)=>sum+row.byteLength,0),1799438);
 for(const mutate of [v=>v.entries.pop(),v=>v.entries.push(v.entries[0]),v=>v.entries[1]={...v.entries[0]},v=>v.entries[0].sha256='f'.repeat(64),v=>v.entries[0].assetId='udtt-foreign',v=>v.entries[0].byteLength++,v=>v.entries[0].width++,v=>v.entries[0].height++,v=>v.entries[0].mime='image/png',v=>v.entries[0].storageKey='secret',v=>v.manifestHash='A'.repeat(64)]){const input=fixture();mutate(input);assert.throws(()=>validatePrivateViewer(input),/完整性/);}
});
test('read URLs reject external/absolute/alternate/duplicate/reordered/fragment/foreign-path references',()=>{
 const transforms=[url=>'https://private.invalid'+url,url=>'https://evil.invalid'+url,url=>url.replace('/api/editorial-assets','/api/manage/editorial-assets'),url=>url+'&asset=udtt-hero',url=>url+'#a',url=>url.replace('manifest=','other='),url=>url.replace('version='+ 'b'.repeat(64),'version=bad'),url=>url.replace('asset=udtt-hero','asset=udtt-risako'),url=>url.replace('manifest='+ 'a'.repeat(64),'manifest='+ 'c'.repeat(64)),url=>url.replace('?manifest='+ 'a'.repeat(64)+'&asset=udtt-hero','?asset=udtt-hero&manifest='+ 'a'.repeat(64))];
 for(const transform of transforms){const input=fixture();input.entries[0].readUrl=transform(input.entries[0].readUrl);assert.throws(()=>validatePrivateViewer(input));}
});
test('same source module renders all 11 placeholders without IMG src, static URLs, or loose image fallback',()=>{
 const helpers=createPrivateHelpers(validatePrivateViewer(fixture())),html=render({route:route(),helpers});
 assert.equal((html.match(/<img /g)||[]).length,11);assert.equal((html.match(/data-private-asset-id=/g)||[]).length,11);assert.doesNotMatch(html,/\ssrc=|\ssrcset=|\/design-review\/sol15\/assets\//);
 for(const asset of [{...artist.hero,src:'groups/foreign/assets/group.jpg'},{...artist.hero,sha256:'bad'},{...artist.hero,width:1},null])assert.throws(()=>helpers.image(asset,'invalid'));
 assert.equal(helpers.resolveMediaAsset(artist.works[0].image),null,'shared widget cannot create a second IMG outside the queue');
});
test('private routes isolated; native stage identity and records return retain existing semantics',()=>{
 assert.equal(REVIEW_PATH,'/design-review/sol15/udtt-private');assert.equal(readReviewUrl('/design-review/sol15/udtt'),null);assert.ok(readReviewUrl(REVIEW_PATH));
 const catalog=JSON.parse(fs.readFileSync(new URL('./fixtures/udtt-review-catalog.json',import.meta.url))),reference={kind:'stage',key:contract.group.media.find(row=>row.kind==='stage').key},r=route('work',reference.key),url=REVIEW_PATH+'#/udtt/work/'+encodeURIComponent(reference.key);
 assert.equal(resolveNative(reference,catalog,production).slotType,'STAGE');const href=nativeHref({reference,action:'records',catalog,route:r,mountedUrl:url,currentUrl:url,mayLeave:true},production),parsed=production.readRoute(href);
 assert.equal(parsed.work,'rec28ldfRTrPxZ');assert.equal(parsed.video,'stage');assert.match(parsed.artistReturn,/^\/artists\/udtt/);
});
// Explicit DOM/event model. This tests src handoff and state, not browser network/paint.
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
 return {references,parking,root,queue,all,make,tick,reports,active:()=>all.find(node=>node.getAttribute('data-private-asset-id')===queue.report().inFlightAssetId)};
}
test('one active IMG starts hero first and holds slot until load plus same-element decode completes',async()=>{
 const h=harness();h.queue.attach(h.root);assert.equal(h.queue.report().hero.sha256,HERO_SHA256);const hero=h.active();assert.equal(hero.getAttribute('data-private-sha256'),HERO_SHA256);assert.equal(h.all.reduce((sum,node)=>sum+node.assignments.length,0),1);
 let complete;hero.decode=()=>new Promise(resolve=>complete=resolve);hero.dispatchEvent(new Event('load'));await h.tick(5);assert.equal(h.queue.report().counts.loaded,0);assert.equal(h.queue.report().counts.pending,1);assert.equal(h.all.reduce((sum,node)=>sum+node.assignments.length,0),1);
 complete();await h.tick(4);assert.equal(h.queue.report().counts.loaded,1);assert.equal(h.all.reduce((sum,node)=>sum+node.assignments.length,0),2);assert.equal(h.queue.report().hero.loadToDecodeMs,9);
 while(h.queue.report().counts.loaded<11){h.active().dispatchEvent(new Event('load'));await h.tick();}
 assert.deepEqual(h.queue.report().counts,{loaded:11,failed:0,notTriggered:0,pending:0});assert.equal(h.queue.report().allImagesReady,true);assert.ok(h.all.every(node=>node.assignments.length===1));h.queue.destroy();
});
test('navigation parks pending IMG; exact node reused without src rewrite and no second active request',async()=>{
 const h=harness();h.queue.attach(h.root);const hero=h.active();h.queue.park();assert.equal(hero.parentNode,h.parking);
 const member=h.references.entries.find(row=>row.assetId==='udtt-risako');h.root.append(h.make(member));h.queue.attach(h.root);assert.equal(h.queue.report().inFlightAssetId,'udtt-hero');assert.equal(h.all.reduce((sum,node)=>sum+node.assignments.length,0),1);
 hero.dispatchEvent(new Event('load'));await h.tick();assert.equal(h.queue.report().counts.loaded,1);
 h.queue.park();const heroRef=h.references.entries.find(row=>row.assetId==='udtt-hero');h.root.append(h.make(heroRef));h.queue.attach(h.root);assert.equal(h.root.children[0],hero);assert.equal(hero.assignments.length,1);h.queue.destroy();
});
test('20s timeout stops remainder, keeps occupied slot, records late completion without retry or overlap',async()=>{
 const h=harness();h.queue.attach(h.root);const hero=h.active();await h.tick(20000);assert.equal(h.queue.report().counts.failed,1);assert.equal(h.queue.report().counts.notTriggered,10);assert.equal(h.queue.report().stopped,true);assert.equal(h.queue.report().inFlightAssetId,'udtt-hero');
 h.queue.park();h.root.append(h.make(h.references.entries[0]));h.queue.attach(h.root);hero.dispatchEvent(new Event('load'));await h.tick();assert.equal(h.queue.report().hero.lateOutcome,'loaded');assert.equal(h.queue.report().hero.status,'failed');assert.equal(h.all.reduce((sum,node)=>sum+node.assignments.length,0),1);h.queue.destroy();
});
test('image and decode errors record exact failures and advance once; destroyed queue never advances',async()=>{
 const h=harness();h.queue.attach(h.root);h.active().dispatchEvent(new Event('error'));assert.equal(h.queue.report().hero.error,'img-error');const second=h.active();second.decode=()=>Promise.reject(new Error('bad'));second.dispatchEvent(new Event('load'));await h.tick();assert.equal(h.queue.report().counts.failed,2);
 const third=h.active();third.naturalWidth=1;third.dispatchEvent(new Event('load'));await h.tick();assert.equal(h.queue.report().counts.failed,3);assert.equal(h.queue.report().entries.find(row=>row.assetId===third.getAttribute('data-private-asset-id')).error,'decoded-dimensions-mismatch');
 const pending=h.active(),before=h.all.reduce((sum,node)=>sum+node.assignments.length,0);h.queue.destroy();pending.dispatchEvent(new Event('load'));await h.tick(20000);assert.equal(h.all.reduce((sum,node)=>sum+node.assignments.length,0),before);
});
test('render duplicate/foreign IDs or unexpected src/srcset stop before first queued request',()=>{
 for(const kind of ['duplicate','foreign','src','srcset']){const h=harness();if(kind==='duplicate')h.root.append(h.make(h.references.entries[0]));else if(kind==='foreign')h.root.children[0].setAttribute('data-private-asset-id','foreign');else h.root.children[0].setAttribute(kind,'/forged');assert.throws(()=>h.queue.attach(h.root));assert.equal(h.queue.report().stopped,true);assert.equal(h.queue.report().counts.notTriggered,11);h.queue.destroy();}
});
test('destroy does not cancel pending IMG: a same-document remount cannot overlap it',async()=>{
 const references=validatePrivateViewer(fixture()),parking=new Node(),root=new Node(),timers=new Map();let n=1;
 const scheduler={performance:{now:()=>0},setTimeout(fn){timers.set(n,fn);return n++;},clearTimeout(id){timers.delete(id);}};
 const image=entry=>{const node=new Node('img');node.setAttribute('data-private-asset-id',entry.assetId);node.setAttribute('data-private-sha256',entry.sha256);return node;};
 const first=createPrivateImageQueue({references,parking,scheduler});const pending=image(references.entries[0]);root.append(pending);first.attach(root);first.destroy();
 const second=createPrivateImageQueue({references,parking:new Node(),scheduler});const root2=new Node(),next=image(references.entries[1]);root2.append(next);second.attach(root2);assert.equal(next.assignments.length,0);assert.equal(second.report().stopped,true);assert.match(second.report().stopReason,/previous-mount/);
 pending.dispatchEvent(new Event('load'));assert.equal(next.assignments.length,0,'old completion must not restart a stopped new queue');second.destroy();
 const third=createPrivateImageQueue({references,parking:new Node(),scheduler});const root3=new Node(),later=image(references.entries[1]);root3.append(later);third.attach(root3);assert.equal(later.assignments.length,1,'lease clears only after the old real IMG completion');third.destroy();later.dispatchEvent(new Event('error'));
});
const {parseHTML}=process.env.UDTT_DOM_MODULE?await import(process.env.UDTT_DOM_MODULE):{};
const {createUdttPrivateReview}=await import('../lib/idol/design-review/sol15-runtime/private-host.mjs');
test('parsed DOM: private host reuses actual pending/loaded nodes through home, members, works and stage detail',{skip:!parseHTML&&'Set UDTT_DOM_MODULE to an existing LinkeDOM ESM entry'},async()=>{
 const {document,window:dom}=parseHTML('<html><body><main id="outside">Untouched</main><div id="host"></div></body></html>');
 const win=new EventTarget(),host=document.getElementById('host');let url=REVIEW_PATH,state=null;const assigned=[];
 win.location={assign:value=>assigned.push(value)};const update=value=>{url=value;const parsed=new URL(value,'https://test.invalid');Object.assign(win.location,{pathname:parsed.pathname,search:parsed.search,hash:parsed.hash});};update(url);
 win.scrollY=0;win.scrollTo=({top})=>win.scrollY=top;win.confirm=()=>true;win.alert=()=>{};Object.assign(win,{setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout});win.history={get state(){return state;},replaceState(next,_,value){state=next;update(value);},pushState(next,_,value){state=next;update(value);}};
 const catalog=JSON.parse(fs.readFileSync(new URL('./fixtures/udtt-review-catalog.json',import.meta.url))),review=createUdttPrivateReview({host,catalog,viewer:fixture(),production,window:win});
 host.shadowRoot.querySelector('link').onload();await review.ready;
 const current=()=>host.shadowRoot.querySelector(`img[data-private-asset-id="${review.images.report().inFlightAssetId}"]`),hero=current(),tick=()=>new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(review.root.querySelectorAll('img').length,11);assert.equal(review.root.querySelectorAll('img[src]').length,1);assert.equal(review.images.report().counts.loaded,0);
 review.navigate('#/udtt/members');await tick();assert.equal(review.root.querySelectorAll('img').length,5);assert.equal(hero.parentNode.getAttribute('data-private-image-parking'),'true');assert.equal(review.images.report().inFlightAssetId,'udtt-hero');
 while(review.images.report().counts.loaded<11){const image=current(),entry=fixture().entries.find(row=>row.assetId===image.getAttribute('data-private-asset-id'));image.decode=()=>Promise.resolve();Object.defineProperty(image,'naturalWidth',{value:entry.width,configurable:true});Object.defineProperty(image,'naturalHeight',{value:entry.height,configurable:true});image.dispatchEvent(new dom.Event('load'));await tick();}
 review.navigate('#/udtt');await tick();assert.equal(review.root.querySelector('img[data-private-asset-id="udtt-hero"]'),hero);assert.equal(review.images.report().counts.loaded,11);
 review.navigate('#/udtt/works');await tick();assert.equal(review.root.querySelectorAll('img').length,5);assert.equal(review.images.report().counts.loaded,11);
 review.navigate('#/udtt/work/'+encodeURIComponent(contract.group.media[1].key));await tick();const button=review.root.querySelector('[data-native-action="records"]');assert.equal(button.dataset.slotType,'STAGE');const event=new dom.Event('click',{bubbles:true,cancelable:true});Object.defineProperty(event,'button',{value:0});button.dispatchEvent(event);assert.equal(assigned.length,1);assert.equal(production.readRoute(assigned[0]).video,'stage');
 assert.equal(document.getElementById('outside').textContent,'Untouched');review.destroy();assert.equal(host.shadowRoot.childNodes.length,0);
});
