// Parsed DOM and lifecycle contracts only, not browser CSS/visual acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createVchaReview} from '../lib/idol/design-review/vcha-runtime/host.mjs';
import {activeArtistMount} from '../lib/idol/design-review/vcha-runtime/shared/lifecycle.js';
const require=createRequire(import.meta.url),load=require('./helpers/public-artist-loader.cjs');
const production={...load('lib/idol/artist-navigation.ts'),...load('lib/idol/journey.ts'),...load('lib/idol/stage-source.ts')};
const {parseHTML}=await import(process.env.VCHA_DOM_MODULE);
const catalog=JSON.parse(fs.readFileSync(new URL('./fixtures/vcha-review-catalog.json',import.meta.url)));
function harness({width=320,path,hash=''}={}){
  const {document,window:dom}=parseHTML('<html><body><div id="outside">unchanged</div><div id="host"></div></body></html>');
  const win=new EventTarget(),timers=new Map(),frames=new Map(),assigned=[];let serial=0;
  const base=width===null?'/design-review/sol15/vcha':`/design-review/sol15/vcha-container/frame/${width}`;
  win.location={assign:href=>assigned.push(href)};
  const update=value=>{const u=new URL(value,'https://test.invalid');Object.assign(win.location,{pathname:u.pathname,search:u.search,hash:u.hash});};update((path??base)+hash);
  Object.assign(win,{scrollY:0,scrollTo:()=>{},confirm:()=>true,alert:()=>{},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),setInterval,clearInterval,requestAnimationFrame(fn){const id=++serial;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
  win.history={state:null,replaceState(state,_,url){this.state=state;update(url);},pushState(state,_,url){this.state=state;update(url);}};
  const host=document.getElementById('host'),status=[];
  const review=createVchaReview({host,catalog,production,window:win,onStatus:value=>status.push(value),...(width===null?{}:{validationWidth:width})});
  return {review,host,document,dom,win,timers,frames,assigned,status,base,links:[...host.shadowRoot.querySelectorAll('link')],click(node){node.dispatchEvent(new dom.Event('click',{bubbles:true,cancelable:true}));},get url(){return win.location.pathname+win.location.search+win.location.hash;}};
}
for(const order of [[0,1],[1,0]])test(`candidate waits for both styles in load order ${order}`,async()=>{
  const h=harness();assert.equal(h.links.length,2);
  assert.equal(h.links[0].getAttribute('href'),'/design-review/sol15/vcha/styles.css');
  assert.equal(h.links[1].getAttribute('href'),'/design-review/sol15/vcha/container-validation.css');
  h.links[order[0]].onload();await Promise.resolve();assert.equal(h.review.root.querySelector('.vc-site'),null);
  h.links[order[1]].onload();await h.review.ready;
  assert.ok(h.review.root.querySelector('.vc-cover-title h1'));
  assert.equal(h.review.root.getAttribute('data-host-connection'),'vcha-container-validation');
  assert.equal(h.review.root.style.width,'320px');
  assert.equal(h.links.every(link=>link.onload===null&&link.onerror===null),true);
  h.review.destroy();assert.equal(h.host.shadowRoot.childNodes.length,0);assert.equal(h.timers.size,0);assert.equal(h.frames.size,0);
  assert.equal(h.document.getElementById('outside').textContent,'unchanged');
});
for(const index of [0,1])test(`stylesheet ${index} failure cleans candidate and ignores late loads`,async()=>{
  const h=harness(),late=h.links.map(link=>link.onload);
  const rejected=assert.rejects(h.review.ready,/样式暂时无法载入/);
  h.links[index].onerror();await rejected;
  for(const callback of late)callback();
  assert.equal(h.host.shadowRoot.childNodes.length,0);assert.equal(h.timers.size,0);
  assert.equal(h.links.every(link=>link.onload===null&&link.onerror===null),true);
  h.review.destroy();
});
test('candidate style timeout is terminal and teardown before loading settles ready',async()=>{
  const a=harness(),rejected=assert.rejects(a.review.ready,/样式载入超时/);
  const [timerId,timer]=[...a.timers].find(([,row])=>row.ms===15000);a.timers.delete(timerId);timer.fn();await rejected;assert.equal(a.timers.size,0);assert.equal(a.host.shadowRoot.childNodes.length,0);
  const b=harness(),late=b.links.map(link=>link.onload);b.review.destroy();assert.deepEqual(await b.review.ready,{status:'destroyed'});for(const callback of late)callback();assert.equal(b.timers.size,0);assert.equal(b.host.shadowRoot.childNodes.length,0);
});
test('loading-time hash changes cannot mount before both styles or survive style failure',async()=>{
  for(const fail of [false,true]){
    const h=harness();
    h.win.location.hash='#/vcha/members';h.win.dispatchEvent(new Event('hashchange'));
    await Promise.resolve();assert.equal(activeArtistMount(h.review.root),null);
    h.links[0].onload();h.win.dispatchEvent(new Event('popstate'));
    await Promise.resolve();assert.equal(activeArtistMount(h.review.root),null);
    if(fail){const rejected=assert.rejects(h.review.ready,/样式暂时无法载入/);h.links[1].onerror();await rejected;assert.equal(activeArtistMount(h.review.root),null);}
    else{h.links[1].onload();await h.review.ready;assert.ok(h.review.root.querySelector('.vc-member-register'));}
    h.review.destroy();assert.equal(activeArtistMount(h.review.root),null);assert.equal(h.timers.size,0);assert.equal(h.frames.size,0);
  }
});
test('default VCHA retains single original stylesheet and no container marker',async()=>{
  const h=harness({width:null});assert.equal(h.links.length,1);assert.equal(h.review.root.hasAttribute('data-host-connection'),false);assert.equal(h.review.root.style.width,undefined);
  h.links[0].onload();await h.review.ready;assert.ok(h.review.root.querySelector('.vc-cover-title h1'));
  h.review.navigate('#/vcha/members');await Promise.resolve();assert.equal(h.url,'/design-review/sol15/vcha#/vcha/members');h.review.destroy();
});
test('candidate hashes stay in their own finite route; native stage destination remains unchanged',async()=>{
  const key='rec28ldfRTrPGP:stage:QQWa8GY1uiI',hash='#/vcha/work/'+encodeURIComponent(key);
  const original=harness({width:null,hash});original.links[0].onload();await original.review.ready;
  const candidate=harness({width:390,hash});candidate.links.forEach(link=>link.onload());await candidate.review.ready;
  original.click(original.review.root.querySelector('[data-native-action="records"]'));
  candidate.click(candidate.review.root.querySelector('[data-native-action="records"]'));
  assert.deepEqual(candidate.assigned,original.assigned);assert.equal(candidate.assigned.length,1);assert.doesNotMatch(candidate.assigned[0],/vcha-container/);
  original.review.destroy();candidate.review.destroy();
  const h=harness();h.links.forEach(link=>link.onload());await h.review.ready;h.review.navigate('#/vcha/members');await Promise.resolve();assert.equal(h.url,h.base+'#/vcha/members');h.review.destroy();
});
test('invalid widths and route aliases cannot create arbitrary validation targets',async()=>{
  for(const width of [319,350,'320','https://invalid.example',0])assert.throws(()=>harness({width}),/Unsupported VCHA validation width/);
  for(const path of ['/design-review/sol15/vcha','/design-review/sol15/vcha-container/frame/390','/design-review/sol15/vcha-container/frame/320?target=foreign']){
    const h=harness({path});h.links.forEach(link=>link.onload());await h.review.ready;assert.match(h.review.root.textContent,/审阅地址无效/);assert.equal(h.review.root.querySelector('.vc-site'),null);h.review.destroy();
  }
});
test('original routes, styles, source viewers and UDTT host retain exact bytes',()=>{
  const expected={
    'components/design-review/vcha-review.tsx':'8b855f7caebbaa90d67d59b7f56685cc641fc6a79ece20096b79dbdd68f56ea4',
    'app/design-review/sol15/vcha/page.tsx':'4e133a049563d4870151cf69623a2f8aeec4a0f3a63b023ed44190d0013d1317',
    'public/design-review/sol15/vcha/styles.css':'48fb47bd8c1ab89442d60d8a3a9a6f28b020323bd791200a8e5e1fc79213850e',
    'lib/idol/design-review/vcha-runtime/shared/media-viewer.js':'3faf85290181efad232a0767f82ddaad6aadc270e83210c2d93c6741534cca90',
    'lib/idol/design-review/sol15-runtime/shared/media-viewer.js':'497eed1bb72f2ac9c1cb40fccd4fa187484e312b2c60e8508ea5beb077b6acf8',
    'lib/idol/design-review/sol15-runtime/host.mjs':'d3593b0db4e61a6db9fbc224a5d770940556b748c8b6d4a760080dfebb721fec',
  };
  for(const [path,sha] of Object.entries(expected))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),sha,path);
  const css=fs.readFileSync(new URL('../public/design-review/sol15/vcha/container-validation.css',import.meta.url),'utf8');
  assert.match(css,/container:sol-artist \/ inline-size/);assert.match(css,/31cqw/);assert.match(css,/32cqw/);
  assert.match(css,/\[data-review-root\][^{]+\{[^}]*max-width:none/);
  assert.doesNotMatch(css,/\[data-artist="hitgs"\]|[\d.]vw|overflow(?:-x|-y)?:\s*(?:hidden|clip)/);
});
