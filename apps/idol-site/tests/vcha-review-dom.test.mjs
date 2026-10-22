// Parsed DOM checks use an already-installed LinkeDOM chosen by the test caller.
// They are not browser CSS, layout, native focus, or default-navigation acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createVchaReview} from '../lib/idol/design-review/vcha-runtime/host.mjs';
const require=createRequire(import.meta.url),load=require('./helpers/public-artist-loader.cjs');
const production={...load('lib/idol/artist-navigation.ts'),...load('lib/idol/journey.ts'),...load('lib/idol/stage-source.ts')};
const {parseHTML}=process.env.VCHA_DOM_MODULE?await import(process.env.VCHA_DOM_MODULE):{};
const base='/design-review/sol15/vcha';
async function harness(hash=''){
 const {document,window:dom}=parseHTML('<html><body><div id="outer"><main id="outside">Main site</main></div><div id="host"></div></body></html>');
 const win=new EventTarget();let url=base+hash,index=0;const stack=[{url,state:null}],assigned=[];
 win.location={assign:href=>assigned.push(href)};
 const update=value=>{url=value;const parsed=new URL(value,'https://test.invalid');Object.assign(win.location,{pathname:parsed.pathname,search:parsed.search,hash:parsed.hash});};update(url);
 win.scrollY=0;win.scrollTo=({top})=>win.scrollY=top;win.confirm=()=>true;win.alert=()=>{};
 Object.assign(win,{setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout});
 win.history={get state(){return stack[index].state;},replaceState(state,_,value){stack[index]={state,url:value};update(value);},pushState(state,_,value){stack.splice(index+1);stack.push({state,url:value});index++;update(value);},go(n){index+=n;update(stack[index].url);win.dispatchEvent(new Event('popstate'));},back(){this.go(-1);},forward(){this.go(1);}};
 win.FormData=class{constructor(form){this.form=form;}get(key){return this.form.querySelector(`[name="${key}"]`).value;}};
 const status=[],host=document.getElementById('host'),catalog=JSON.parse(fs.readFileSync(new URL('./fixtures/vcha-review-catalog.json',import.meta.url)));
 const review=createVchaReview({host,catalog,production,window:win,onStatus:s=>status.push(s)});host.shadowRoot.querySelector('link').onload();await review.ready;
 return {document,win,review,assigned,status,dom,dispatch(node,type='click',button=0){const event=new dom.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'button',{value:button});node.dispatchEvent(event);return event;},tick:()=>new Promise(resolve=>setTimeout(resolve,5)),get url(){return url;}};
}
const run=(name,fn)=>test(name,{skip:!parseHTML&&'Set VCHA_DOM_MODULE to an existing LinkeDOM ESM entry'},fn);
run('parsed DOM: normal middle-click source allowed; altered source/identity blocked',async()=>{
 const h=await harness('#/vcha/work/rec28ldfRTrPGP'),source=h.review.root.querySelector('.vc-work-detail a[target="_blank"]');
 assert.ok(source);assert.equal(h.dispatch(source,'auxclick',1).defaultPrevented,false);const original=source.href;source.href='https://invalid.example/forged';assert.equal(h.dispatch(source,'auxclick',1).defaultPrevented,true);assert.equal(h.dispatch(source).defaultPrevented,true);source.href=original;assert.equal(h.dispatch(source,'auxclick',1).defaultPrevented,false);
 const identity=JSON.parse(source.dataset.actionIdentity);identity.videoId='XXXXXXXXXXX';source.dataset.actionIdentity=JSON.stringify(identity);assert.equal(h.dispatch(source,'auxclick',1).defaultPrevented,true);h.review.destroy();
});
run('parsed DOM: keyboard form submit, label IDs, query, Back/Forward, teardown',async()=>{
 const h=await harness('#/vcha/works?type=stage&extra=a&extra=b'),form=h.review.root.querySelector('form[data-vc-search]'),input=form.querySelector('input'),label=form.querySelector('label');
 assert.equal(label.getAttribute('for'),input.id);assert.match(input.id,/^sol-vcha-\d+--/);assert.equal(h.document.getElementById(input.id),null);input.value='Girls';h.dispatch(form,'submit');await h.tick();assert.match(h.url,/type=stage&extra=a&extra=b&q=Girls/);
 const stage=h.review.root.querySelector('a.vc-work-row');h.dispatch(stage);await h.tick();assert.ok(h.review.root.querySelector('[data-slot-type="STAGE"]'));h.win.history.back();await h.tick();assert.equal(h.review.root.querySelector('input').value,'Girls');h.win.history.forward();await h.tick();assert.ok(h.review.root.querySelector('[data-slot-type="STAGE"]'));
 const old=h.review.root.querySelector('[data-native-action="records"]');h.review.destroy();h.dispatch(old);assert.equal(h.assigned.length,0);assert.equal(h.document.querySelector('#outside').textContent,'Main site');assert.equal(h.document.getElementById('host').shadowRoot.childNodes.length,0);
});
run('parsed DOM: native stage opens exact existing stage slot, repeated action is latched',async()=>{
 const h=await harness('#/vcha/work/rec28ldfRTrPGP%3Astage%3AQQWa8GY1uiI'),button=h.review.root.querySelector('[data-native-action="records"]');
 assert.equal(button.disabled,false);h.dispatch(button);h.dispatch(button);assert.equal(h.assigned.length,1);const route=production.readRoute(h.assigned[0]);assert.equal(route.work,'rec28ldfRTrPGP');assert.equal(route.video,'stage');assert.match(route.artistReturn,/^\/artists\/vcha/);h.review.destroy();
});
run('parsed DOM: tampered cross-group middle-click nav is blocked; legitimate nav remains allowed',async()=>{
 const h=await harness(),anchor=h.review.root.querySelector('.vc-header nav a');assert.equal(h.dispatch(anchor,'auxclick',1).defaultPrevented,false);anchor.href='#/foreign/members';assert.equal(h.dispatch(anchor,'auxclick',1).defaultPrevented,true);h.review.destroy();
});

run('parsed DOM: exact group overview sources open, forged source remains blocked',async()=>{
 const h=await harness('#/vcha/members'),links=[...h.review.root.querySelectorAll('.vc-sources a')];assert.equal(links.length,2);
 for(const link of links){assert.equal(h.dispatch(link).defaultPrevented,false);assert.equal(h.dispatch(link,'auxclick',1).defaultPrevented,false);const original=link.href;link.href=original+'?forged=1';assert.equal(h.dispatch(link).defaultPrevented,true);assert.equal(h.dispatch(link,'auxclick',1).defaultPrevented,true);link.href=original;}
 h.review.destroy();
});
