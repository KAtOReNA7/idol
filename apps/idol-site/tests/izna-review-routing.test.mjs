import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {ARTIST_PATH, RECORDS_PATH, canonicalReviewPath, normalizeReviewLocation, reviewRecordHref, installRecordHistory, installReviewLinks} from '../review/izna/routes.mjs';
import {nativeHref} from '../lib/idol/izna-runtime/model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://review.invalid';
const returnTo = '/artists/izna?section=works&format=mv&media=rec28ldfRTrNwO-mv-2fyFx2u5fbU';
const query = '?view=works&work=rec28ldfRTrNwO&returnTo=' + encodeURIComponent(returnTo);

test('all physical artist aliases normalize before native routing; other group and record paths retain identity', () => {
  for (const pathname of ['/artists/izna','/artists/izna/','/artists/izna/index.html','/review-izna','/review-izna/','/review-izna/index.html']) assert.equal(canonicalReviewPath(pathname), ARTIST_PATH);
  for (const pathname of [RECORDS_PATH,'/','/index.html','/artists/genblue','/review-genblue/index.html','/artists/izna/unknown','/api/save']) assert.equal(canonicalReviewPath(pathname), pathname);
  const state = {iznaOrigin:{path:returnTo,y:620}};
  const calls = [];
  assert.equal(normalizeReviewLocation({pathname:'/artists/izna/index.html',search:'?section=members&member=rec28ldbniBc6L',hash:'#details'},{state,replaceState:(...args)=>calls.push(args)}), ARTIST_PATH);
  assert.deepEqual(calls, [[state,'','/artists/izna?section=members&member=rec28ldbniBc6L#details']]);
  assert.strictEqual(calls[0][0], state);
});

test('record mapping preserves exact query and returnTo, supports copy/new-tab, and leaves artist/external targets intact', () => {
  assert.equal(reviewRecordHref('/'+query+'#score', origin+ARTIST_PATH), RECORDS_PATH+query+'#score');
  assert.equal(reviewRecordHref(origin+'/index.html'+query, origin+ARTIST_PATH), RECORDS_PATH+query);
  for (const value of [ARTIST_PATH+'?section=members','/artists/genblue','https://official.example/'+query,'mailto:help@example.com',RECORDS_PATH+query,null,undefined]) assert.equal(reviewRecordHref(value,origin+ARTIST_PATH),value);
  // A copied or newly opened target is a real HTML file; normalization does not
  // turn it back into the GENBLUE root entry.
  const copied = new URL(reviewRecordHref('/'+query,origin+ARTIST_PATH),origin);
  assert.equal(canonicalReviewPath(copied.pathname),RECORDS_PATH);
  assert.equal(copied.searchParams.get('returnTo'),returnTo);
});

test('real native MV and stage links retain exact slots and safe return context after review mapping',async()=>{
  const design=JSON.parse(fs.readFileSync(path.join(root,'data/izna-editorial.json')));
  const compiled=await build({stdin:{contents:"export {routeUrl} from './lib/idol/journey';export {safeArtistReturn} from './lib/idol/artist-navigation';",resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
  const module={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,URL,URLSearchParams});
  for(const slot of ['MV','STAGE']){
    const video=design.works.find(row=>row.id==='rec28ldfRTrNwO'&&row.type===slot);
    const request={action:'open-rating',groupId:design.group.id,workId:video.id,videoId:video.videoId,videoType:video.videoType,slotType:slot,returnTo:'#/works?kind='+slot+'&detail='+video.key};
    const binding={kind:'video',groupId:design.group.id,workId:video.id,videoId:video.videoId,videoType:video.videoType,slotType:slot,sourceKey:video.videoId,parentWorkIds:[video.id],clip:null,scoreBindingVerified:true,evidence:'test:exact-existing-identity'};
    const services={...module.exports,bindings:[binding]};
    const href=nativeHref(design,request,services);assert.ok(href);
    const mapped=new URL(reviewRecordHref(href,origin+ARTIST_PATH),origin);
    assert.equal(mapped.pathname,RECORDS_PATH);assert.equal(mapped.searchParams.get('work'),video.id);
    assert.equal(mapped.searchParams.get('video')??'mv',slot.toLowerCase());
    const back=new URL(mapped.searchParams.get('returnTo'),origin);
    assert.equal(back.pathname,ARTIST_PATH);assert.equal(back.searchParams.get('media'),video.key);assert.equal(back.searchParams.get('format'),slot.toLowerCase());
    assert.equal(nativeHref(design,{...request,videoId:'wrongVideo1'},services),null);
  }
});

test('actual anchor hrefs are rewritten on mount and later React commits, without event interception', () => {
  const anchor = value => ({value,getAttribute:()=>value,setAttribute(key,next){assert.equal(key,'href');value=next;this.value=next;}});
  const first=anchor('/'+query),artist=anchor('/artists/genblue'),links=[first,artist];
  let notify,options,disconnected=false;
  class Observer { constructor(callback){notify=callback;} observe(_root,value){options=value;} disconnect(){disconnected=true;} }
  const stop=installReviewLinks({querySelectorAll:()=>links},{href:origin+ARTIST_PATH},Observer);
  assert.equal(first.value,RECORDS_PATH+query);
  assert.equal(artist.value,'/artists/genblue');
  const member=anchor('/?view=members&member=rec28ldbniBc6L&returnTo=%2Fartists%2Fizna');links.push(member);notify();
  assert.equal(member.value,RECORDS_PATH+'?view=members&member=rec28ldbniBc6L&returnTo=%2Fartists%2Fizna');
  assert.deepEqual(options,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
  stop();assert.equal(disconnected,true);
});

function fakeBrowser(url) {
  let current=new URL(url);const listeners=new Map();const stack=[{url:current.href,state:{reviewScroll:210}}];let position=0;
  const assignments=[];
  const location={get href(){return current.href;},get pathname(){return current.pathname;},assign:value=>assignments.push(value),reload:()=>assignments.push('reload')};
  const history={get state(){return stack[position].state;},get length(){return stack.length;},scrollRestoration:'auto',
    pushState(state,_title,url){current=new URL(url??current.href,current);stack.splice(++position);stack.push({url:current.href,state});},
    replaceState(state,_title,url){current=new URL(url??current.href,current);stack[position]={url:current.href,state};},
    go(delta){position+=delta;current=new URL(stack[position].url);listeners.get('popstate')?.();},back(){this.go(-1);}};
  return {location,history,assignments,stack,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
}

test('the real shared App navigation hook keeps records.html on initialization, navigation, reload and back', async () => {
  const compiled=await build({entryPoints:[path.join(root,'components/use-browse-journey.ts')],absWorkingDir:root,bundle:true,write:false,platform:'node',format:'cjs',external:['react'],plugins:[{name:'non-navigation-effects',setup(builder){
    builder.onResolve({filter:/^\.\/use-(?:experience-styles|member-work-focus)$/},args=>({path:args.path,namespace:'test-effect'}));
    builder.onLoad({filter:/.*/,namespace:'test-effect'},()=>({contents:'export const useExperienceStyles=()=>({phase:"not-required"}); export const useMemberWorkFocus=()=>{}; export const restoreMemberWorkFocus=()=>false;'}));
  }}],logLevel:'silent'});
  const browser=fakeBrowser(origin+RECORDS_PATH+query);
  const restore=installRecordHistory(browser.history,browser.location);
  let slots=[],index=0,effects=[];
  const React={useState(initial){const i=index++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next;}];},useRef(value){const i=index++;return slots[i]??(slots[i]={current:value});},useCallback:fn=>fn,useEffect:fn=>effects.push(fn),useLayoutEffect:()=>{}};
  const module={exports:{}};
  const context={module,exports:module.exports,require:name=>{assert.equal(name,'react');return React;},...browser,window:{location:browser.location,scrollY:0},document:{querySelector:()=>null},performance:{getEntriesByType:()=>[]},URL,URLSearchParams,Date,Math,crypto:globalThis.crypto,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}};
  vm.runInNewContext(compiled.outputFiles[0].text,context);
  const mount=()=>{slots=[];index=0;effects=[];const value=module.exports.useBrowseJourney(false);effects.forEach(fn=>fn());return value;};
  const journey=mount();
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(browser.history.state.reviewScroll,210);
  assert.equal(browser.history.state.idolBrowse.route.work,'rec28ldfRTrNwO');
  assert.equal(browser.history.state.idolBrowse.route.artistReturn,returnTo);
  assert.equal(journey.navigate({nav:'members',work:null,member:'rec28ldbniBc6L'},'作品记录'),true);
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('member'),'rec28ldbniBc6L');
  journey.navigate({nav:'works',work:'rec28ldfRTrNSv',member:null},'成员记录');
  journey.setVideo('stage');journey.updateFilters({search:'METRONOME'});
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('video'),'stage');
  const beforeReload=JSON.stringify(browser.history.state.idolBrowse);
  mount();
  assert.equal(browser.history.state.idolBrowse.route.work,'rec28ldfRTrNSv');
  assert.equal(browser.history.state.idolBrowse.lists.works.search,'METRONOME');
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.ok(beforeReload.includes('rec28ldfRTrNSv'));
  browser.history.back();
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('member'),'rec28ldbniBc6L');
  const returned=mount();returned.leaveTo(returnTo);
  assert.equal(browser.assignments.at(-1),returnTo);
  restore();
});

test('history adapter leaves state, missing URLs and non-root destinations unchanged', () => {
  const calls=[],state={idolBrowse:{position:4},artistScroll:{y:32}};
  const history={pushState(...args){calls.push(args);},replaceState(...args){calls.push(args);}};
  const original=history.replaceState;
  const stop=installRecordHistory(history,{href:origin+RECORDS_PATH+query});
  history.replaceState(state,'title','/'+query);history.pushState(state,'title');history.replaceState(state,'title',null);history.pushState(state,'title',ARTIST_PATH);
  assert.strictEqual(calls[0][0],state);assert.equal(calls[0][1],'title');assert.equal(calls[0][2],RECORDS_PATH+query);
  assert.equal(calls[1].length,2);assert.equal(calls[2][2],null);assert.equal(calls[3][2],ARTIST_PATH);
  stop();assert.strictEqual(history.replaceState,original);
});

test('build produces additive physical entries, actual components and original images without changing accepted reviews', () => {
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'izna-review-test-'));
  const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const existing=['review/genblue/entry.tsx','review/genblue/routes.mjs','scripts/build-genblue-review.mjs','review/wooah/entry.tsx','scripts/build-wooah-review.mjs'];
  const before=existing.map(file=>digest(path.join(root,file)));
  try {
    execFileSync(process.execPath,['scripts/build-izna-review.mjs','--out',out],{cwd:root,stdio:'pipe'});
    const manifest=JSON.parse(fs.readFileSync(path.join(out,'review-izna/manifest.json')));
    const html=fs.readFileSync(path.join(out,'artists/izna/index.html'),'utf8');
    for(const entry of manifest.entries) assert.equal(fs.readFileSync(path.join(out,entry),'utf8'),html);
    for(const reserved of ['index.html','review-genblue','artists/genblue','review-wooah','artists/wooah','_redirects','_headers','.openai']) assert.equal(fs.existsSync(path.join(out,reserved)),false,reserved);
    assert.match(html,/示例资料 · 评分不写入正式手帐/);assert.match(html,/connect-src 'none'/);assert.match(html,/form-action 'none'/);
    for(const asset of html.matchAll(/(?:src|href)="(\/review-izna\/[^\"]+\.(?:js|css))"/g)) assert.ok(fs.statSync(path.join(out,asset[1])).size>0);
    assert.ok(manifest.sanitizedRelations>=12);assert.equal(manifest.apiIsolationChecks,9);
    assert.ok(manifest.bundleInputs.includes('components/izna/editorial.tsx'));
    assert.ok(manifest.bundleInputs.includes('app/page.tsx'));
    assert.ok(!manifest.bundleInputs.some(file=>/data\/snapshot|native-save|app\/api\//.test(file)));
    for(const asset of manifest.assets) assert.equal(digest(path.join(out,asset.path)),asset.sha256,asset.path);
    assert.ok(manifest.assets.some(asset=>asset.path==='/artist/izna/native-v3/izna.css'));
    const recordStyle=manifest.assets.find(asset=>asset.path==='/review-izna/izna-experience.css');
    assert.ok(recordStyle,'native record stylesheet is a verified deployment asset');
    assert.equal(recordStyle.source,'app/izna-experience.css');
    assert.equal(recordStyle.sha256,digest(path.join(root,recordStyle.source)));
    assert.equal(manifest.sourceInputs.find(input=>input.path===recordStyle.source)?.sha256,recordStyle.sha256);
    const appJs=fs.readFileSync(path.join(out,'review-izna/app.js'),'utf8');
    assert.ok(appJs.includes('/review-izna/izna-experience.css'),'dynamic native style loader receives the real izna stylesheet URL');
    assert.deepEqual([...appJs.matchAll(/\/review-[a-z0-9-]+\/[a-z0-9-]+-experience\.css/g)].map(match=>match[0]),['/review-izna/izna-experience.css']);
    const compiledCss=fs.readFileSync(path.join(out,'review-izna/app.css'),'utf8');
    assert.doesNotMatch(compiledCss,/\.candidate-(?:wooah|genblue)-experience|\.wooah-experience|\.genblue-bluecut/,'other groups do not enter the izna stylesheet');
    assert.doesNotMatch(fs.readFileSync(path.join(out,recordStyle.path),'utf8'),/\.candidate-(?:wooah|genblue)-experience|\.wooah-experience|\.genblue-bluecut/);
    const bindings=JSON.parse(fs.readFileSync(path.join(root,'data/izna-assets.json')));
    for(const binding of bindings){const copy=manifest.assets.find(asset=>asset.path===binding.url);assert.ok(copy,binding.url);assert.equal(copy.sha256,binding.sha256);assert.equal(copy.bytes,binding.bytes);}
    const firstManifest=fs.readFileSync(path.join(out,'review-izna/manifest.json'),'utf8');
    execFileSync(process.execPath,['scripts/build-izna-review.mjs','--out',out],{cwd:root,stdio:'pipe'});
    assert.equal(fs.readFileSync(path.join(out,'review-izna/manifest.json'),'utf8'),firstManifest,'same source rebuild must be deterministic');
    assert.deepEqual(existing.map(file=>digest(path.join(root,file))),before);
  } finally { fs.rmSync(out,{recursive:true,force:true}); }
});

test('builder refuses the repository, drive root and unrelated nonempty output without modifying them',()=>{
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'izna-review-protected-'));
  const keep=path.join(out,'index.html');fs.writeFileSync(keep,'accepted existing site');
  try{
    for(const target of [root,path.parse(root).root,out]) assert.throws(()=>execFileSync(process.execPath,['scripts/build-izna-review.mjs','--out',target],{cwd:root,stdio:'pipe'}));
    assert.equal(fs.readFileSync(keep,'utf8'),'accepted existing site');
  }finally{fs.rmSync(out,{recursive:true,force:true});}
});
