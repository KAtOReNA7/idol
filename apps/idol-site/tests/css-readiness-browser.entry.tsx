// @ts-nocheck
// Browser-only fixture: real React 19, ReactDOM, production hooks and production App.
// All records are synthetic. Stylesheet transport is controlled using real link nodes.
import React, {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useBrowseJourney} from '../components/use-browse-journey';
import {newEntry, routeUrl} from '../lib/idol/journey';
import App from '../app/page';

const win = window as any;
const report = document.querySelector('#results')!;
const rootElement = document.querySelector('#fixture')!;
let root:any, probe:any, runId = 0, latestState:any;
const links:Array<{href:string;node:HTMLLinkElement}> = [];
const nativeAppend = document.head.appendChild.bind(document.head);
document.head.appendChild = ((node:any) => {
  if (node.tagName === 'LINK' && node.rel === 'stylesheet' && node.getAttribute('href')?.startsWith('/controlled-styles/')) {
    links.push({href:node.getAttribute('href'),node});
    node.removeAttribute('href'); // Delay only transport, preserving the real DOM link and listeners.
  }
  return nativeAppend(node);
}) as any;
const requests:Array<{url:string;method:string}> = [];
let catalog:any;
let pendingSaveResolve:((response:Response)=>void)|undefined;
let savePending=false;
let alerts=0;
window.alert=()=>{alerts++;};
window.confirm=()=>false;
window.fetch = async (input:any, options:any = {}) => {
  const url = String(input); requests.push({url,method:options.method ?? 'GET'});
  if(url==='/api/save'&&savePending)return await new Promise<Response>(resolve=>{pendingSaveResolve=resolve;});
  const body = url.startsWith('/api/records?') ? {table:'works',values:{score:8,stageScore:null,note:'original synthetic note',watched:'未观看'},revision:'a'.repeat(64),watchedOptions:['未观看','已观看']} : url.startsWith('/api/catalog?') ? structuredClone(catalog) : url === '/api/status' ? {source:'feishu'} : null;
  if (!body) throw Error('Unexpected network request blocked by fixture: ' + url);
  return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json'}});
};
win.__editorLifecycle = {mounts:0,unmounts:0};
win.__cssReadinessResults = {status:'running',results:[],error:null};
function assert(value:any,message:string){if(!value)throw Error(message);}
function describe(value:any){
  if(value instanceof Element)return `<${value.tagName.toLowerCase()} id="${value.id}" aria-label="${value.getAttribute('aria-label')??''}">`;
  try{return JSON.stringify(value)??String(value);}catch{return Object.prototype.toString.call(value);}
}
function equal(actual:any,expected:any,message:string){
  if(Object.is(actual,expected))return;
  throw Error(`${message}: identity/value mismatch; expected ${describe(expected)}, got ${describe(actual)}`);
}
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(fn:()=>any,label:string,timeout=4000){const started=performance.now();while(!fn()){if(performance.now()-started>timeout)throw Error('Timed out: '+label);await delay(15);}await frames();}
async function frames(){await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));}
function saved(url:string,position:number,y:number,extra:any={}){return {...newEntry(url,position),scrollY:y,...extra};}
function snapshot(){return structuredClone(history.state.idolBrowse);}
async function reset(entries:any[], index=0){
  root?.unmount(); root=null; probe=null; await frames();
  history.replaceState({idolBrowse:entries[0]},'',routeUrl(entries[0].route));
  for(const entry of entries.slice(1))history.pushState({idolBrowse:entry},'',routeUrl(entry.route));
  if(index!==entries.length-1){history.go(index-(entries.length-1));await waitFor(()=>history.state.idolBrowse.position===entries[index].position,'reset history');}
  scrollTo(0,0); rootElement.innerHTML=''; runId++;
}
function Harness({initialReady=false}:{initialReady?:boolean}){
  const [ready,setReady]=useState(initialReady),[height,setHeight]=useState(4000),[anchorTop,setAnchorTop]=useState(878),[modal,setModal]=useState(false);
  const journey=useBrowseJourney(ready,route=>(route.work||route.member)?`/controlled-styles/${runId}/${route.work||route.member}.css`:undefined);
  useEffect(()=>setReady(true),[]);
  probe={...journey,setHeight,setAnchorTop,setModal}; latestState={ready:journey.displayReady,phase:journey.stylePhase,route:journey.route};
  return <main style={{height,position:'relative',overflow:'hidden'}}>
    <button id="outside-focus" style={{position:'fixed',top:44,left:0}}>Outside focus target</button>
    {modal&&<div role="dialog" aria-modal="true" style={{position:'fixed',top:80,left:0,zIndex:5}}><button id="modal-focus">Modal focus target</button></div>}
    {!journey.displayReady&&<aside data-style-status role="status" style={{position:'fixed',top:0,left:0,zIndex:3}}><span>{journey.stylePhase}</span><button id="retry-style" onClick={journey.retryStyles}>Retry styles</button><button id="back-style" onClick={()=>journey.back({nav:'works',work:null,member:null,video:'mv'})}>Back</button></aside>}
    <div data-browse-content inert={!journey.displayReady} style={{height,visibility:journey.displayReady?'visible':'hidden',position:'relative'}}>
      <button id="fixture-anchor" data-browse-anchor="work-X" style={{position:'absolute',top:anchorTop,left:0,height:40}}>Synthetic work</button>
      <button id="member-work-other" data-member-work-trigger="recOther" style={{position:'absolute',top:150,left:0}}>Other member work</button>
      <button id="member-work-exact" data-member-work-trigger="recExact" style={{position:'absolute',top:200,left:0}}>Exact saved member work</button>
    </div>
  </main>;
}
async function mount(entries:any[],options:any={}){
  await reset(entries,options.index??0);root=createRoot(rootElement);root.render(options.strict?<StrictMode><Harness initialReady={options.initialReady}/></StrictMode>:<Harness initialReady={options.initialReady}/>);
  await waitFor(()=>probe&&probe.route.nav===entries[options.index??0].route.nav&&probe.route.work===entries[options.index??0].route.work,'mount current route');
  return probe;
}
function matching(name:string){return links.filter(link=>link.href.includes(name));}
async function load(link=links.at(-1)!){
  const blob=URL.createObjectURL(new Blob(['/* Synthetic stylesheet, native link load event. */'],{type:'text/css'}));
  link.node.href=blob;await new Promise<void>((resolve,reject)=>{link.node.addEventListener('load',()=>resolve(),{once:true});link.node.addEventListener('error',()=>reject(Error('Native synthetic CSS load failed')),{once:true});});
  await frames();URL.revokeObjectURL(blob);
}
async function fail(link=links.at(-1)!){link.node.dispatchEvent(new Event('error'));await frames();}
async function navigate(work:string|null){probe.navigate({nav:'works',work,member:null},'Synthetic list');await waitFor(()=>probe.route.work===work,'navigate '+work);}
function takeOver(target:Element){target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}
async function scrollUser(y:number){takeOver(document.querySelector('[data-browse-content]')!);scrollTo(0,y);window.dispatchEvent(new Event('scroll'));await frames();}
function refreshReport(){const state=win.__cssReadinessResults;report.textContent=JSON.stringify(state,null,2);document.title=state.status==='running'?'RUNNING: React CSS readiness':state.status.toUpperCase()+': React CSS readiness';}
const tests:Array<[string,()=>Promise<void>]> = [];
function test(name:string,run:()=>Promise<void>){tests.push([name,run]);}

test('Real hook cold loading Back preserves list scroll 860, anchor and focus',async()=>{
  await mount([saved('/?view=works',0,860,{anchor:{id:'work-X',offset:18},libraryFocus:'work-X'})]);
  equal(scrollY,860,'initial saved scroll');await navigate('recCold');equal(probe.stylePhase,'loading','cold style pending');
  probe.setHeight(250);await frames();scrollTo(0,0);window.dispatchEvent(new Event('scroll'));await frames();
  const back=document.querySelector('#back-style')!;takeOver(back);back.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  await waitFor(()=>probe.route.work===null,'Back returned to list');probe.setHeight(4000);await waitFor(()=>scrollY===860,'860 restored after layout');
  equal(snapshot().scrollY,860,'saved scroll not poisoned');equal(snapshot().anchor.offset,18,'anchor preserved');equal(document.activeElement?.id,'fixture-anchor','focus restored');
});
test('Real hook Forward 430 survives error, retry and stale first load',async()=>{
  const list=saved('/?view=works',0,860),detail=saved('/?view=works&work=recForward',1,430,{from:{position:0,label:'list'}});
  await mount([list,detail]);history.go(1);await waitFor(()=>probe.route.work==='recForward','Forward candidate');
  equal(probe.stylePhase,'loading','Forward cold loading');const old=links.at(-1)!;
  probe.setHeight(250);await frames();scrollTo(0,0);window.dispatchEvent(new Event('scroll'));await frames();equal(snapshot().scrollY,430,'cold saved position');
  await fail(old);equal(probe.stylePhase,'error','error phase');equal(snapshot().scrollY,430,'error saved position');
  const retry=document.querySelector('#retry-style')!;takeOver(retry);retry.dispatchEvent(new MouseEvent('click',{bubbles:true}));await waitFor(()=>probe.stylePhase==='loading','retry pending');
  old.node.dispatchEvent(new Event('load'));await frames();equal(probe.stylePhase,'loading','stale load ignored');
  probe.setHeight(4000);await frames();await load();await waitFor(()=>probe.displayReady&&scrollY===430,'retry visible at 430');equal(snapshot().scrollY,430,'retry saved position');
});
test('Real hook A-B-A ignores stale B and reuses cached A/B requests',async()=>{
  await mount([saved('/?view=works',0,0)]);const start=links.length;await navigate('recA');const a=links.at(-1)!;await navigate('recB');const b=links.at(-1)!;
  history.go(-1);await waitFor(()=>probe.route.work==='recA','Back to A');await load(b);equal(probe.stylePhase,'loading','B cannot reveal A');await load(a);equal(probe.stylePhase,'ready','A ready');
  history.go(1);await waitFor(()=>probe.route.work==='recB','Forward to B');equal(probe.stylePhase,'ready','B cached');equal(links.length-start,2,'one request per URL');
});
test('Real hook ResizeObserver and font loadingdone preserve anchor until content takeover',async()=>{
  await mount([saved('/?view=works',0,860,{anchor:{id:'work-X',offset:18}})]);equal(scrollY,860,'initial anchor');
  probe.setAnchorTop(998);await frames();document.fonts.dispatchEvent(new Event('loadingdone'));await waitFor(()=>scrollY===980,'font event anchor correction');equal(snapshot().scrollY,860,'font restoration never captures');
  probe.setAnchorTop(1118);probe.setHeight(4200);await waitFor(()=>scrollY===1100,'native ResizeObserver correction');
  await scrollUser(1000);equal(snapshot().scrollY,1000,'genuine user capture');probe.setAnchorTop(1238);probe.setHeight(4400);await frames();document.fonts.dispatchEvent(new Event('loadingdone'));await frames();equal(scrollY,1000,'takeover ends restoration');
});
test('Real hook ready-at-first-mount restores same-position history entry',async()=>{
  await mount([saved('/?view=works',0,860)],{initialReady:true});await waitFor(()=>scrollY===860,'ready-at-mount saved scroll');
});
test('Real React StrictMode setup replay shares one pending stylesheet',async()=>{
  const start=links.length;await mount([saved('/?view=works&work=recStrict',0,430)],{strict:true});equal(links.length-start,1,'Strict setup request count');await fail();
  probe.retryStyles();await waitFor(()=>probe.stylePhase==='loading','Strict retry');equal(links.length-start,2,'one retry request');await load();await waitFor(()=>scrollY===430&&probe.displayReady,'Strict restored');
});


test('Real member-work focus waits for CSS, respects modal, then restores exact trigger only once',async()=>{
  await mount([saved('/?view=members&member=recFocusMember',0,430)]);equal(probe.stylePhase,'loading','member CSS pending');
  history.replaceState({...history.state,memberWorkFocus:{path:location.pathname+location.search,key:'recExact'}},'',location.href);
  const outside=document.querySelector('#outside-focus') as HTMLButtonElement,exact=document.querySelector('#member-work-exact') as HTMLButtonElement,other=document.querySelector('#member-work-other') as HTMLButtonElement;
  let focusCount=0;const recordFocus=()=>{focusCount++;};exact.addEventListener('focus',recordFocus);
  try{
    outside.focus({preventScroll:true});probe.setHeight(4100);document.fonts.dispatchEvent(new Event('loadingdone'));await frames();
    equal(document.activeElement,outside,'pending stylesheet must not steal focus');equal(focusCount,0,'pending exact trigger never focused');
    probe.setModal(true);await waitFor(()=>document.querySelector('#modal-focus'),'modal mounted');const modalButton=document.querySelector('#modal-focus') as HTMLButtonElement;modalButton.focus({preventScroll:true});
    await load();await waitFor(()=>probe.displayReady,'member CSS ready beneath modal');document.fonts.dispatchEvent(new Event('loadingdone'));probe.setHeight(4200);await frames();
    equal(document.activeElement,modalButton,'ready restoration must respect open modal');equal(focusCount,0,'modal blocks exact focus');
    probe.setModal(false);await waitFor(()=>!document.querySelector('[role=dialog]'),'modal closed');outside.focus({preventScroll:true});document.fonts.dispatchEvent(new Event('loadingdone'));probe.setHeight(4300);
    await waitFor(()=>document.activeElement===exact,'late font/resize restores exact saved member trigger');equal(focusCount,1,'exact saved trigger restored once');
    other.focus({preventScroll:true});document.fonts.dispatchEvent(new Event('loadingdone'));probe.setHeight(4400);await frames();
    equal(document.activeElement,other,'later layout must not steal focus again');equal(focusCount,1,'restoration does not repeat after success');
  }finally{exact.removeEventListener('focus',recordFocus);}
});

function syntheticCatalog(groupId='rec28ldfRTiC1X'){
  const work={id:'recEditor',name:'Synthetic work',song:'Synthetic work',groupIds:[groupId],url:'',score:8,stageScore:null,note:'original synthetic note',watched:'未观看',videoType:'MV',version:'original',releaseDate:'2000-01-01',verification:'',officialTitle:'',channel:'',ratingIds:[],source:'',stage:null,stageResearch:{status:'pending',reason:'synthetic',checkedAt:null}};
  return {mode:'live',capturedAt:'2000-01-01',loadedAt:'2000-01-01',warning:null,groups:[{id:groupId,name:'Synthetic group',generation:'test',company:'',country:'',note:'',debut:'',memberIds:[],workIds:[work.id],average:8,ratedCount:1,social:[]}],members:[],works:[work],ratings:[],counts:{groups:1,members:0,works:1,ratings:0,ratedWorks:1,scoreSum:8}};
}
async function inputValue(input:HTMLInputElement,value:string){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));await frames();}
function recordReads(){return requests.filter(request=>request.url.startsWith('/api/records?')).length;}
test('Production App gate preserves real Editor mount, DOM input, draft and one record fetch',async()=>{
  await reset([saved('/?view=works&work=recEditor',0,0)]);catalog=syntheticCatalog();win.__editorLifecycle={mounts:0,unmounts:0};const reads=recordReads();
  root=createRoot(rootElement);root.render(<App/>);await waitFor(()=>document.querySelector('input[aria-label="MV 分数"]'),'actual App Editor');
  const input=document.querySelector('input[aria-label="MV 分数"]') as HTMLInputElement;await inputValue(input,'9.5');equal(input.value,'9.5','edited score');assert(document.querySelector('.editor[data-dirty=true]'),'real Editor dirty marker');
  equal(recordReads()-reads,1,'one initial record read');equal(win.__editorLifecycle.mounts,1,'one Editor mount');
  catalog=syntheticCatalog('rec28ldfRTiC6k');const refresh=[...document.querySelectorAll('button')].find(button=>button.textContent==='更新内容')!;refresh.click();
  await waitFor(()=>document.querySelector('[data-style-status]'),'same-work refresh opens CSS gate');assert(document.querySelector('[data-browse-content]')!.hasAttribute('inert'),'pending subtree inert');
  equal(document.querySelector('input[aria-label="MV 分数"]'),input,'pending uses same input DOM');equal(input.value,'9.5','draft preserved pending');equal(recordReads()-reads,1,'no record fetch on gate');
  await fail();await waitFor(()=>document.querySelector('[data-style-status]')!.textContent!.includes('加载失败'),'App style error');equal(input.value,'9.5','draft preserved error');
  [...document.querySelectorAll('[data-style-status] button')].find(button=>button.textContent==='重试样式')!.click();await frames();await load();
  await waitFor(()=>!document.querySelector('[data-style-status]'),'App retry visible');
  equal(document.querySelector('input[aria-label="MV 分数"]'),input,'retry retains original input DOM');equal(input.value,'9.5','retry preserves draft');equal(win.__editorLifecycle.mounts,1,'no remount across gate');equal(win.__editorLifecycle.unmounts,0,'no unmount across gate');equal(recordReads()-reads,1,'no extra records fetch');equal(requests.filter(request=>request.method==='POST').length,0,'no save side effect');assert(document.querySelector('.editor[data-dirty=true]'),'draft still guarded');
});


test('Production App pending save stays guarded through stylesheet error and retry',async()=>{
  await reset([saved('/?view=works&work=recEditor',0,0)]);catalog=syntheticCatalog();win.__editorLifecycle={mounts:0,unmounts:0};const reads=recordReads(),beforeAlerts=alerts;
  root=createRoot(rootElement);root.render(<App/>);await waitFor(()=>document.querySelector('input[aria-label="MV 分数"]'),'pending-save App Editor');
  const input=document.querySelector('input[aria-label="MV 分数"]') as HTMLInputElement;await inputValue(input,'9');savePending=true;
  (document.querySelector('.editor-actions button') as HTMLButtonElement).click();await waitFor(()=>document.querySelector('.editor[data-navigation-blocked=true]'),'save in flight');
  catalog=syntheticCatalog('rec28ldfRTiCpp');[...document.querySelectorAll('button')].find(button=>button.textContent==='更新内容')!.click();await waitFor(()=>document.querySelector('[data-style-status]'),'save-preserving style gate');
  await fail();await waitFor(()=>document.querySelector('[data-style-status]')!.textContent!.includes('加载失败'),'save-preserving style error');
  [...document.querySelectorAll('nav button')].find(button=>button.textContent==='作品库')!.click();equal(alerts,beforeAlerts+1,'pending save blocks main navigation');assert(location.search.includes('work=recEditor'),'work route kept while save pending');
  [...document.querySelectorAll('[data-style-status] button')].find(button=>button.textContent==='重试样式')!.click();await frames();await load();await waitFor(()=>!document.querySelector('[data-style-status]'),'save-preserving retry ready');
  equal(document.querySelector('input[aria-label="MV 分数"]'),input,'same pending input node');equal(input.value,'9','pending draft kept');assert(document.querySelector('.editor[data-navigation-blocked=true]'),'save still navigation-blocked');equal(win.__editorLifecycle.mounts,1,'pending editor mounted once');equal(win.__editorLifecycle.unmounts,0,'pending editor never unmounted');equal(recordReads()-reads,1,'pending editor never reread');
  [...document.querySelectorAll('nav button')].find(button=>button.textContent==='作品库')!.click();equal(alerts,beforeAlerts+2,'guard survives retry success');
  savePending=false;pendingSaveResolve!(new Response(JSON.stringify({revision:'b'.repeat(64),values:{score:9,stageScore:null,note:'original synthetic note',watched:'未观看'},verified:true}),{status:200,headers:{'content-type':'application/json'}}));await waitFor(()=>!document.querySelector('.editor[data-navigation-blocked=true]'),'synthetic save finishes');
});

(async()=>{
  for(const [name,run] of tests){try{await run();win.__cssReadinessResults.results.push({name,status:'pass'});}catch(error){win.__cssReadinessResults.results.push({name,status:'fail',error:String((error as Error).stack??error),state:latestState,scrollY,history:history.state});}refreshReport();}
  win.__cssReadinessResults.status=win.__cssReadinessResults.results.every((result:any)=>result.status==='pass')?'pass':'fail';win.__cssReadinessResults.total=tests.length;win.__cssReadinessResults.passed=win.__cssReadinessResults.results.filter((result:any)=>result.status==='pass').length;refreshReport();
})().catch(error=>{win.__cssReadinessResults.status='fail';win.__cssReadinessResults.error=String(error);refreshReport();});
