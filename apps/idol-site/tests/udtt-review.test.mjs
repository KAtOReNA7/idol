import {fixture as privateViewerFixture} from './helpers/udtt-private-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {REVIEW_PATH,group,assets,helpers,readReviewUrl,resolveNative,nativeHref,reviewHistoryState,savedReviewPosition,reviewImage} from '../lib/idol/design-review/sol15-runtime/model.mjs';
import {createUdttReview,mayLeaveReview,validateNativeActivation} from '../lib/idol/design-review/sol15-runtime/host.mjs';
import {artist,render} from '../lib/idol/design-review/sol15-runtime/groups/udtt/index.js';
import {actionIdentity} from '../lib/idol/design-review/sol15-runtime/shared/identity.js';
const require=createRequire(import.meta.url),load=require('./helpers/public-artist-loader.cjs');
const production={...load('lib/idol/artist-navigation.ts'),...load('lib/idol/journey.ts'),...load('lib/idol/stage-source.ts')};
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/udtt-review-catalog.json',import.meta.url)));
const catalog=()=>structuredClone(fixture);
const routeFor=(page='home',key=null,query='')=>({slug:'udtt',page,key,query:new URLSearchParams(query)});
const refFor=kind=>({kind,key:kind==='member'?group.members[0].key:group.media.find(row=>row.kind===kind).key});
const urlFor=route=>REVIEW_PATH+helpers.href('udtt',route.page,route.key,route.query);
const inputFor=(kind='mv',action='records')=>{const reference=refFor(kind),route=routeFor(kind==='member'?'member':'work',reference.key);return {reference,action,catalog:catalog(),route,mountedUrl:urlFor(route),currentUrl:urlFor(route),mayLeave:true};};
function elementFor(reference,route,c=catalog()){
 const context={getAttribute:key=>key==='data-member-id'?reference.kind==='member'?reference.key:null:key==='data-work-key'?reference.key:null,hasAttribute:key=>key===(reference.kind==='member'?'data-member-id':'data-work-key')};
 const entity=resolveNative(reference,c,production);
 return {dataset:entity?.kind==='member'?{}:{sourceKey:entity?.sourceKey,originalType:entity?.originalType,slotType:entity?.slotType,clip:'null'},getAttribute:()=>null,closest:()=>context,hasAttribute:()=>false};
}
test('public UDTT conservation: 5 members, 3 releases, MV/stage, 4 ready events; holds excluded',()=>{
 assert.equal(artist.members.length,5);assert.equal(artist.works.length,5);assert.equal(artist.works.filter(w=>w.type==='release').length,3);assert.equal(artist.timeline.length,4);
 assert.ok(artist.timeline.every(event=>event.reviewStatus==='ready'));
 for(const page of ['home','members','works','timeline'])assert.ok(render({route:routeFor(page),helpers}).includes('ud-page'));
 for(const member of artist.members)assert.ok(render({route:routeFor('member',member.id),helpers}).includes(member.id));
 for(const work of artist.works)assert.ok(render({route:routeFor('work',helpers.entityKey(work)),helpers}).includes(helpers.escape(helpers.entityKey(work))));
});
test('11 exact original-byte assets, local URLs, no absent dist reuse',()=>{
 assert.equal(Object.values(assets).length,11);let bytes=0;
 for(const entry of Object.values(assets)){
  assert.equal(entry.action,'stage-original-bytes');assert.equal(entry.distMatches.length,0);
  const file=fs.readFileSync(new URL('../public'+entry.targetUrl,import.meta.url));bytes+=file.length;
  assert.equal(file.length,entry.bytes);assert.equal(createHash('sha256').update(file).digest('hex'),entry.sha256);
 }
 assert.equal(bytes,1799438);
});
test('font/URL isolation: no fonts, relative CSS URLs, imports, globals or host stylesheet',()=>{
 const css=fs.readFileSync(new URL('../public/design-review/sol15/udtt/styles.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/@font-face|@import|url\(/i);assert.doesNotMatch(css,/(?:^|})\s*(?:body|html|:root)\s*\{/);
 const host=fs.readFileSync(new URL('../lib/idol/design-review/sol15-runtime/host.mjs',import.meta.url),'utf8');
 assert.match(host,/attachShadow\(\{mode:'open'\}\)/);assert.doesNotMatch(host,/shared\/host\.css|document\.getElementById|document\.activeElement|location\.hash\s*=/);
});
test('review routes preserve repeated query, reject foreign/malformed IDs and unsafe paths',()=>{
 const route=routeFor('work',group.media[1].key,'q=one&q=two&type=stage');assert.deepEqual([...readReviewUrl(urlFor(route)).query],[...route.query]);
 for(const value of ['/design-review/sol15/other','#/udtt','//evil.invalid'+REVIEW_PATH,REVIEW_PATH+'?q=extra',REVIEW_PATH+'#/foreign',REVIEW_PATH+'#/udtt/work/unknown',REVIEW_PATH+'#/udtt/member/%ZZ',REVIEW_PATH+'#/udtt/works/extra'])assert.equal(readReviewUrl(value),null,value);
});
for(const kind of ['member','mv','stage'])test(`${kind}: native route exact identity/slot and production-only return`,()=>{
 const input=inputFor(kind,kind==='member'?'member-records':'records'),before=JSON.stringify(input.catalog);
 const href=nativeHref(input,production);assert.ok(href);const parsed=production.readRoute(href);
 assert.equal(parsed.video,kind==='stage'?'stage':'mv');assert.equal(parsed.member,kind==='member'?input.reference.key:null);
 if(kind!=='member')assert.equal(parsed.work,'rec28ldfRTrPxZ');
 assert.match(parsed.artistReturn,/^\/artists\/udtt/);assert.doesNotMatch(parsed.artistReturn,/design-review|#/);assert.equal(JSON.stringify(input.catalog),before);
});
test('native actions fail closed on stale URL, dirty gate, wrong action, release candidates',()=>{
 const input=inputFor();for(const patch of [{mayLeave:false},{currentUrl:REVIEW_PATH+'#/udtt/members'},{action:'save'},{reference:{kind:'release',key:group.releases[0].key}}])assert.equal(nativeHref({...input,...patch},production),null);
});
test('strict scope/group/member/work duplicates and foreign ownership are rejected',()=>{
 for(const kind of ['member','mv','stage'])for(const mutate of [c=>{c.scope=null;},c=>{c.scope.groupId='foreign';},c=>{c.groups.push(c.groups[0]);},c=>{const rows=kind==='member'?c.members:c.works;rows.push(rows.find(row=>row.id===(kind==='member'?refFor(kind).key:'rec28ldfRTrPxZ')));},c=>{(kind==='member'?c.members.find(row=>row.id===refFor(kind).key):c.works.find(row=>row.id==='rec28ldfRTrPxZ')).groupIds=['foreign'];}]){const c=catalog();mutate(c);assert.equal(resolveNative(refFor(kind),c,production),null);}
});
test('work source video/type/URL/sourceKey/clip/stage kind mismatches rejected',()=>{
 for(const kind of ['mv','stage'])for(const mutate of [w=>{w.videoType='舞台';},w=>{if(kind==='mv')w.url='https://youtu.be/aKRY80dEkJw';else w.stage.url='https://youtu.be/nZa0Th64v00';},w=>{if(kind==='mv')w.url='https://www.youtube.com/watch?v=XXXXXXXXXXX';else w.stage.videoId='XXXXXXXXXXX';}]){const c=catalog();mutate(c.works.find(w=>w.id==='rec28ldfRTrPxZ'));assert.equal(resolveNative(refFor(kind),c,production),null);}
 for(const mutate of [s=>{s.clip={startSeconds:1,endSeconds:2,sourceDurationSeconds:4};},s=>{s.kind='fancam';},s=>{s.completeness='partial';},s=>{s.platform='other';},s=>{s.scorePolicy='view_only';}]){const c=catalog();mutate(c.works.find(w=>w.id==='rec28ldfRTrPxZ').stage);assert.equal(resolveNative(refFor('stage'),c,production),null);}
 const input=inputFor('stage');input.catalog.works.find(w=>w.id==='rec28ldfRTrPxZ').stage.scoreBinding.sourceKey='WRONG';assert.equal(nativeHref(input,production),null);
});
for(const kind of ['member','mv','stage'])test(`${kind}: full activation identity and source/clip/slot payload tampering rejected`,()=>{
 const reference=refFor(kind),route=routeFor(kind==='member'?'member':'work',reference.key,'q=first&q=second'),element=elementFor(reference,route),identity=actionIdentity(element,{artist,route});
 const args={element,identity,artist,route,catalog:catalog(),production};assert.deepEqual(validateNativeActivation(args),reference);
 for(const field of Object.keys(identity)){const wrong=structuredClone(identity);wrong[field]=Array.isArray(wrong[field])?['forged']:'forged';assert.equal(validateNativeActivation({...args,identity:wrong}),null,field);}
 if(kind!=='member')for(const field of ['sourceKey','originalType','slotType','clip']){const wrong={...element,dataset:{...element.dataset,[field]:'forged'}};assert.equal(validateNativeActivation({...args,element:wrong}),null,field);}
});
test('card quality is conservatively capped while primary originals keep natural dimensions',()=>{
 const item=Object.values(assets)[0];const html=reviewImage({src:item.path,sha256:item.sha256,width:480,height:270,qualityLevel:'card'},'card');assert.match(html,/max-width:240px!important/);assert.match(html,/object-fit:contain!important/);
 assert.match(reviewImage({src:item.path,sha256:'bad'},'missing'),/media-unavailable/);
});
test('history keeps unrelated host state but never carries stale focus/scroll instructions',()=>{
 const state=reviewHistoryState({idolBrowse:{x:1},artistScroll:{y:9},timelineReturn:'old',sol15Review:{path:'old'}},REVIEW_PATH,45,'#/udtt/members');assert.deepEqual(state.idolBrowse,{x:1});assert.equal(state.artistScroll,undefined);assert.equal(state.timelineReturn,undefined);assert.equal(savedReviewPosition(state,REVIEW_PATH).y,45);assert.equal(savedReviewPosition(state,'other'),null);
});
test('live guards inspect both document and shadow modal/dirty/save state',()=>{
 for(const surface of ['document','shadow'])for(const selector of ['modal','pending','dirty']){
  const region={querySelector:s=>s.includes(selector==='modal'?'aria-modal':selector==='pending'?'navigation-blocked':'data-dirty')?{}:null};const empty={querySelector:()=>null};assert.equal(mayLeaveReview({document:empty,shadow:empty,[surface]:region,confirm:()=>false,alert:()=>{}}),false);
 }
});

// Minimal EventTarget/resource/history harness. It does NOT parse HTML or prove
// shadow rendering, CSS, browser focus, activation propagation, or accessibility.
class NodeHarness extends EventTarget {
 constructor(tag='div'){super();this.tagName=tag.toUpperCase();this.dataset={};this.children=[];this.innerHTML='';this.attrs={};}
 querySelectorAll(){return []; }querySelector(){return null;} contains(){return false;}
 replaceChildren(...nodes){this.children=nodes;this.innerHTML='';} setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k]??null;}remove(){}focus(){}
}
function harness(initial=REVIEW_PATH){
 const win=new EventTarget(),document={createElement:tag=>new NodeHarness(tag),querySelector:()=>null};let position=0,url=initial;const stack=[{url,state:null}];const listeners=new Map();
 const add=win.addEventListener.bind(win),remove=win.removeEventListener.bind(win);win.addEventListener=(name,fn,options)=>{add(name,fn,options);listeners.set(fn,name);};win.removeEventListener=(name,fn,options)=>{remove(name,fn,options);listeners.delete(fn);};
 const update=value=>{url=value;const parsed=new URL(value,'https://test.invalid');Object.assign(win.location,{pathname:parsed.pathname,search:parsed.search,hash:parsed.hash});};
 win.location={assign:href=>win.assigned=href};update(initial);win.scrollY=0;win.scrollTo=({top})=>win.scrollY=top;win.confirm=()=>true;win.alert=()=>{};
 win.setTimeout=setTimeout;win.clearTimeout=clearTimeout;win.setInterval=setInterval;win.clearInterval=clearInterval;win.requestAnimationFrame=fn=>setTimeout(fn,0);win.cancelAnimationFrame=clearTimeout;
 win.history={get state(){return stack[position].state;},replaceState(state,_,target){stack[position]={state,url:target};update(target);},pushState(state,_,target){stack.splice(position+1);stack.push({state,url:target});position++;update(target);},go(delta){position=Math.min(stack.length-1,Math.max(0,position+delta));update(stack[position].url);win.dispatchEvent(new Event('popstate'));},back(){this.go(-1);},forward(){this.go(1);}};
 document.defaultView=win;const host=new NodeHarness();host.ownerDocument=document;host.attachShadow=()=>host.shadowRoot=new NodeHarness('shadow');
 const statuses=[],review=createUdttReview({viewer:privateViewerFixture(),host,catalog:catalog(),production,onStatus:s=>statuses.push(s),window:win});
 return {win,document,host,review,stack,listeners,statuses,load:async()=>{host.shadowRoot.children[1].onload();await review.ready;},tick:async()=>{await new Promise(resolve=>setTimeout(resolve,5));},get url(){return url;}};
}
test('host mounts original module, rapid navigation/back/forward retain query and dispose listeners',async()=>{
 const h=harness();await h.load();assert.match(h.review.root.innerHTML,/ud-opening/);
 h.review.navigate('#/udtt/works?q=one&q=two&type=stage');await h.tick();assert.match(h.review.root.innerHTML,/ud-library/);assert.equal(h.stack.length,2);
 h.win.scrollY=345;h.review.navigate('#/udtt/work/'+encodeURIComponent(group.media[1].key)+'?q=one&q=two&type=stage');await h.tick();assert.match(h.review.root.innerHTML,/data-slot-type="STAGE"/);
 h.win.history.back();await h.tick();assert.equal(h.win.scrollY,345);assert.match(h.url,/q=one&q=two/);h.win.history.forward();await h.tick();assert.match(h.review.root.innerHTML,/ud-work-detail/);
 for(let i=0;i<10;i++){h.review.navigate('#/udtt/members');h.review.navigate('#/udtt/timeline');}await h.tick();assert.match(h.review.root.innerHTML,/ud-timeline/);
 h.review.destroy();h.review.destroy();assert.equal(h.listeners.size,0);assert.equal(h.host.shadowRoot.children.length,0);h.win.history.back();await h.tick();assert.equal(h.host.shadowRoot.children.length,0);
});
test('cross-group and unknown route navigation never changes the location',async()=>{const h=harness();await h.load();for(const target of ['#/other','#/udtt/work/foreign','https://evil.invalid'])h.review.navigate(target);assert.equal(h.url,REVIEW_PATH);h.review.destroy();});
test('stylesheet failure and destroy before load cannot commit or leave event listeners',async()=>{const h=harness();const ready=h.review.ready;h.host.shadowRoot.children[1].onerror();await assert.rejects(ready,/样式/);h.review.destroy();assert.equal(h.listeners.size,0);const early=harness();early.review.destroy();assert.deepEqual(await early.review.ready,{status:'destroyed'});assert.equal(early.listeners.size,0);});
test('invalid direct link shows an honest empty state, not the first member or another group',async()=>{const h=harness(REVIEW_PATH+'#/udtt/member/unknown');await h.load();assert.match(h.review.root.innerHTML,/审阅地址无效/);assert.doesNotMatch(h.review.root.innerHTML,/ud-student/);h.review.destroy();});
function activationButton(reference,route){
 const base=elementFor(reference,route),attrs={};const button={...base,tagName:'BUTTON',dataset:{...base.dataset,nativeAction:reference.kind==='member'?'member-records':'records'},getAttribute:key=>attrs[key]??null,setAttribute:(key,value)=>attrs[key]=value,hasAttribute:key=>Object.hasOwn(attrs,key)};
 button.closest=selector=>selector.includes('a[href]')?button:base.closest(selector);
 return button;
}
function activate(h,button){const event=new Event('click',{cancelable:true});Object.defineProperty(event,'target',{value:button});h.review.root.contains=node=>node===button;h.review.root.dispatchEvent(event);return event;}
test('native activation traverses mounted identity guard, rejects tampering, only one departure until pageshow',async()=>{
 const reference=refFor('stage'),route=routeFor('work',reference.key),h=harness(urlFor(route));await h.load();let assigned=0;h.win.location.assign=href=>{assigned++;h.win.assigned=href;};
 const button=activationButton(reference,route);button.dataset.slotType='MV';activate(h,button);assert.equal(assigned,0);button.dataset.slotType='STAGE';activate(h,button);assert.equal(assigned,1);assert.match(h.win.assigned,/video=stage/);activate(h,button);assert.equal(assigned,1);
 h.win.dispatchEvent(new Event('pageshow'));activate(h,button);assert.equal(assigned,2);h.review.destroy();activate(h,button);assert.equal(assigned,2);
});
test('stale mounted callbacks do not open records after a newer route takes ownership',async()=>{
 const reference=refFor('mv'),route=routeFor('work',reference.key),h=harness(urlFor(route));await h.load();const button=activationButton(reference,route);h.win.history.pushState({},'',REVIEW_PATH+'#/udtt/members');activate(h,button);assert.equal(h.win.assigned,undefined);h.review.destroy();
});
test('keyboard-style submit is intercepted, preserves repeated query and never writes hash directly',async()=>{
 const h=harness(REVIEW_PATH+'#/udtt/works?type=stage&extra=one&extra=two');await h.load();
 const attrs={},form={tagName:'FORM',dataset:{},getAttribute:key=>attrs[key]??null,setAttribute:(key,value)=>attrs[key]=value,hasAttribute:key=>key==='data-work-search'||Object.hasOwn(attrs,key),closest:selector=>selector.includes('a[href]')?form:null};
 h.win.FormData=class{get(){return 'REALLY';}};h.review.root.contains=node=>node===form;
 const event=new Event('submit',{cancelable:true});Object.defineProperty(event,'target',{value:form});h.review.root.dispatchEvent(event);await h.tick();assert.equal(event.defaultPrevented,true);assert.match(h.url,/extra=one&extra=two&q=REALLY/);assert.match(h.url,/type=stage/);h.review.destroy();
});
test('same-entry Back guard rolls back a pending save without rendering the wrong route',async()=>{
 const h=harness();await h.load();h.review.navigate('#/udtt/members');await h.tick();const before=h.url;h.document.querySelector=s=>s.includes('navigation-blocked')?{}:null;h.win.history.back();await h.tick();assert.equal(h.url,before);assert.match(h.review.root.innerHTML,/成员目录/);h.document.querySelector=()=>null;h.win.history.back();await h.tick();assert.equal(h.url,REVIEW_PATH);h.review.destroy();
});
test('original data preserved; runtime differs only by non-rendered hero archive locator; no old asset URL escapes',async()=>{
 const {data:original}=await import('../evidence/sol15/udtt/data.js');const {data:runtime}=await import('../lib/idol/design-review/sol15-runtime/groups/udtt/data.js');const expected=structuredClone(original);delete expected.hero.originalPath;assert.deepEqual(runtime,expected);
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../evidence/sol15/udtt/data.js',import.meta.url))).digest('hex'),'18ba93e710206a0a51fcb29361a15927457598921463c9c4b700479fd381f380');
 const routes=[...['home','members','works','timeline'].map(page=>routeFor(page)),...artist.members.map(member=>routeFor('member',member.id)),...artist.works.map(work=>routeFor('work',helpers.entityKey(work)))];
 const urls=new Set(Object.values(assets).map(entry=>entry.targetUrl)),seen=new Set();
 for(const route of routes){const html=render({route,helpers});assert.doesNotMatch(html,/batch-b-20261016|restored\//);for(const [,src] of html.matchAll(/\bsrc="([^"]+)"/g)){assert.ok(urls.has(src),src);seen.add(src);}}
 assert.equal(seen.size,11);
 const helperSource=fs.readFileSync(new URL('../lib/idol/design-review/sol15-runtime/shared/helpers.js',import.meta.url),'utf8');assert.doesNotMatch(helperSource,/originalPath/);
});
test('UDTT review label is unaccepted; existing candidate and released-review wording remains unchanged',async()=>{
 const {runInNewContext}=await import('node:vm'),{transformSync}=require('esbuild');const source=fs.readFileSync(new URL('../components/design-review/review-label.tsx',import.meta.url),'utf8');let current='';const mod={exports:{}};
 const jsx=(type,props)=>({type,props});runInNewContext(transformSync(source,{loader:'tsx',format:'cjs',jsx:'automatic'}).code,{module:mod,exports:mod.exports,require:name=>name==='next/navigation'?{usePathname:()=>current}:{jsx,jsxs:jsx,Fragment:'fragment'}});
 const flatten=node=>node==null?'':typeof node==='string'?node:Array.isArray(node)?node.map(flatten).join(' '):flatten(node.props?.children);
 const links=node=>node==null||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(links):[...(node.type==='a'?[node.props.href]:[]),...links(node.props?.children)];
 for(const [path,name,href] of [['sol15/udtt','UDTT','udtt'],['triples-v2','tripleS','triples'],['rescene-v1','RESCENE','rescene'],['purplekiss-v1','PURPLE KISS','purplekiss']]){current='/design-review/'+path;const tree=mod.exports.DesignReviewLabel({defaultSummary:'设计审阅'});assert.match(flatten(tree),new RegExp(name+' · 未验收视觉候选'));assert.ok(flatten(tree).includes('正式 '+name+' 页面未替换'));assert.ok(links(tree).includes('/artists/'+href));}
 for(const path of ['unis','kep1er']){current='/design-review/'+path;const tree=mod.exports.DesignReviewLabel({defaultSummary:'设计审阅'});assert.ok(flatten(tree).includes('正式团体页面使用相同设计。'));assert.deepEqual(links(tree),['/design-review/unis','/design-review/kep1er','/']);}
});
