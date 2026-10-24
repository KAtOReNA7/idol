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
import {reviewNavigationSource,reviewTimelineSource} from '../review/spia/native-navigation.mjs';
import {ARTIST_PATH, RECORDS_PATH, canonicalReviewPath, normalizeReviewLocation, installArtistHistory, reviewRecordHref, installRecordHistory, installReviewLinks} from '../review/spia/routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://review.invalid';
const returnTo = '/artists/spia?section=works&q=SING&format=mv';
const query = '?view=works&work=rec28ldfRTrPmh&returnTo=' + encodeURIComponent(returnTo);

test('all physical artist aliases normalize before native routing; other group and record paths retain identity', () => {
  for (const pathname of ['/artists/spia','/artists/spia/','/artists/spia/index.html','/review-spia','/review-spia/','/review-spia/index.html']) assert.equal(canonicalReviewPath(pathname), ARTIST_PATH);
  for (const pathname of [RECORDS_PATH,'/','/index.html','/artists/genblue','/review-genblue/index.html','/artists/spia/unknown','/api/save']) assert.equal(canonicalReviewPath(pathname), pathname);
  const state = {spiaOrigin:{path:returnTo,y:620}};
  const calls = [];
  assert.equal(normalizeReviewLocation({pathname:'/artists/spia/index.html',search:'?section=members&member=recvxAPQCFokd7',hash:'#details'},{state,replaceState:(...args)=>calls.push(args)}), ARTIST_PATH);
  assert.deepEqual(calls, [],'do not replace the physical URL needed by reload');
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

test('native work and release return URLs retain exact identity through the review boundary',async()=>{
  const compiled=await build({stdin:{contents:"export {artistWorkUrl} from './lib/idol/artist-preview';export {safeArtistReturn} from './lib/idol/artist-navigation';",resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
  const module={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,URL,URLSearchParams});
  const back='/artists/spia?section=works&q=daddy&release=daddy';
  assert.equal(module.exports.safeArtistReturn(back),back);
  for(const stage of [false,true]){const href=module.exports.artistWorkUrl({id:'rec28ldfRTrPmh'},stage,back);const mapped=new URL(reviewRecordHref(href,origin+ARTIST_PATH),origin);assert.equal(mapped.pathname,RECORDS_PATH);assert.equal(mapped.searchParams.get('work'),'rec28ldfRTrPmh');assert.equal(mapped.searchParams.get('video')??'mv',stage?'stage':'mv');assert.equal(mapped.searchParams.get('returnTo'),back);}
});

test('actual anchor hrefs are rewritten on mount and later React commits, without event interception', () => {
  const anchor = value => ({value,getAttribute:()=>value,setAttribute(key,next){assert.equal(key,'href');value=next;this.value=next;}});
  const first=anchor('/'+query),artist=anchor('/artists/genblue'),links=[first,artist];
  let notify,options,disconnected=false;
  class Observer { constructor(callback){notify=callback;} observe(_root,value){options=value;} disconnect(){disconnected=true;} }
  const stop=installReviewLinks({querySelectorAll:()=>links},{href:origin+ARTIST_PATH},Observer);
  assert.equal(first.value,RECORDS_PATH+query);
  assert.equal(artist.value,'/artists/genblue');
  const member=anchor('/?view=members&member=recvxAPQCFokd7&returnTo=%2Fartists%2Fspia');links.push(member);notify();
  assert.equal(member.value,RECORDS_PATH+'?view=members&member=recvxAPQCFokd7&returnTo=%2Fartists%2Fspia');
  assert.deepEqual(options,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
  stop();assert.equal(disconnected,true);

  // The owned presentation root is supplied explicitly after its async mount;
  // no document traversal can enter another group's shadow presentation.
  const index=anchor('/?view=groups'),unknown=anchor('/unrecognized?view=groups'),foreign=anchor('/artists/wooah'),external=anchor('https://official.example/?view=groups');
  const otherGroupIndex=anchor('/?view=groups'),shadowLinks=[index,unknown,foreign,external],ownedRoot={querySelectorAll:()=>shadowLinks};
  const observed=[];
  class ShadowObserver {constructor(callback){notify=callback;}observe(node){observed.push(node);}disconnect(){disconnected=true;}}
  disconnected=false;
  const stopShadow=installReviewLinks(ownedRoot,{href:origin+ARTIST_PATH},ShadowObserver);
  assert.deepEqual(observed,[ownedRoot]);
  assert.equal(index.value,RECORDS_PATH+'?view=groups');
  assert.equal(unknown.value,'/unrecognized?view=groups');assert.equal(foreign.value,'/artists/wooah');assert.equal(external.value,'https://official.example/?view=groups');
  assert.equal(otherGroupIndex.value,'/?view=groups');
  const remountedIndex=anchor('/?view=groups');shadowLinks.splice(0,shadowLinks.length,remountedIndex);notify();
  assert.equal(remountedIndex.value,RECORDS_PATH+'?view=groups');
  stopShadow();assert.equal(disconnected,true);
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
    builder.onLoad({filter:/[/\\]components[/\\]use-browse-journey\.ts$/},args=>({contents:reviewNavigationSource(fs.readFileSync(args.path,'utf8')),loader:'ts'}));
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
  assert.equal(browser.history.state.idolBrowse.route.work,'rec28ldfRTrPmh');
  assert.equal(browser.history.state.idolBrowse.route.artistReturn,returnTo);
  assert.equal(journey.navigate({nav:'members',work:null,member:'recvxAPQCFokd7'},'作品记录'),true);
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('member'),'recvxAPQCFokd7');
  journey.navigate({nav:'works',work:'rec28ldfRTrPmh',member:null},'成员记录');
  journey.setVideo('stage');journey.updateFilters({search:'DEBUT SONG'});
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('video'),'stage');
  const beforeReload=JSON.stringify(browser.history.state.idolBrowse);
  mount();
  assert.equal(browser.history.state.idolBrowse.route.work,'rec28ldfRTrPmh');
  assert.equal(browser.history.state.idolBrowse.lists.works.search,'DEBUT SONG');
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.ok(beforeReload.includes('rec28ldfRTrPmh'));
  browser.history.back();
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('member'),'recvxAPQCFokd7');
  const returned=mount();returned.leaveTo(returnTo);
  assert.equal(browser.assignments.at(-1),returnTo.replace('/artists/spia?','/artists/spia/index.html?'));
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
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'spia-review-test-'));
  const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const existing=['review/genblue/entry.tsx','review/genblue/routes.mjs','scripts/build-genblue-review.mjs','review/wooah/entry.tsx','scripts/build-wooah-review.mjs'];
  const before=existing.map(file=>digest(path.join(root,file)));
  try {
    execFileSync(process.execPath,['scripts/build-spia-review.mjs','--out',out],{cwd:root,stdio:'pipe'});
    const manifest=JSON.parse(fs.readFileSync(path.join(out,'review-spia/manifest.json')));
    const html=fs.readFileSync(path.join(out,'artists/spia/index.html'),'utf8');
    for(const entry of manifest.entries) assert.equal(fs.readFileSync(path.join(out,entry),'utf8'),html);
    for(const reserved of ['index.html','review-genblue','artists/genblue','review-wooah','artists/wooah','_redirects','_headers','.openai']) assert.equal(fs.existsSync(path.join(out,reserved)),false,reserved);
    assert.match(html,/示例资料 · 评分不写入正式手帐/);assert.match(html,/connect-src 'none'/);assert.match(html,/form-action 'none'/);
    for(const asset of html.matchAll(/(?:src|href)="(\/review-spia\/[^\"]+\.(?:js|css))"/g)) assert.ok(fs.statSync(path.join(out,asset[1])).size>0);
    assert.equal(manifest.sanitizedRelations,5);assert.equal(manifest.apiIsolationChecks,9);
    assert.ok(manifest.bundleInputs.includes('components/spia-artist.tsx'));
    assert.ok(manifest.bundleInputs.includes('app/page.tsx'));
    assert.ok(manifest.bundleInputs.includes('data/spia-native-design.json'));
    assert.ok(!manifest.bundleInputs.some(file=>/data\/snapshot|native-save|app\/api\//.test(file)));
    for(const asset of manifest.assets) assert.equal(digest(path.join(out,asset.path)),asset.sha256,asset.path);
    assert.equal(manifest.assets.filter(asset=>/\/(nahee|kaya|beeney|sera|hana)\.original\.png$/.test(asset.path)).length,5);
    const compiledCss=fs.readFileSync(path.join(out,'review-spia/app.css'),'utf8');
    assert.match(fs.readFileSync(path.join(out,'review-spia/spia-experience.css'),'utf8'),/\.candidate-spia-experience/,'the native dynamically loaded record stylesheet is packaged');
    assert.match(compiledCss,/\[data-idol-spia-native\]/);
    assert.doesNotMatch(compiledCss,/\.candidate-(?:wooah|genblue)-experience|\.wooah-experience|\.genblue-bluecut/);
    const recordInput=manifest.sourceInputs.find(input=>input.path==='app/spia-experience.css');
    assert.equal(recordInput.sha256,digest(path.join(root,recordInput.path)));
    const bindings=JSON.parse(fs.readFileSync(path.join(root,'data/spia-review-assets.json'))).assets;
    for(const binding of bindings){const copy=manifest.assets.find(asset=>asset.path===binding.url);assert.ok(copy,binding.url);assert.equal(copy.sha256,binding.sha256);assert.equal(copy.bytes,binding.bytes);}
    assert.ok(manifest.assets.some(asset=>asset.path==='/artist/spia/review-20261024/deeeep-group-original.jpg'));
    const firstManifest=fs.readFileSync(path.join(out,'review-spia/manifest.json'),'utf8');
    execFileSync(process.execPath,['scripts/build-spia-review.mjs','--out',out],{cwd:root,stdio:'pipe'});
    assert.equal(fs.readFileSync(path.join(out,'review-spia/manifest.json'),'utf8'),firstManifest,'same source rebuild must be deterministic');
    assert.deepEqual(existing.map(file=>digest(path.join(root,file))),before);
  } finally { fs.rmSync(out,{recursive:true,force:true}); }
});

test('builder refuses the repository, drive root and unrelated nonempty output without modifying them',()=>{
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'spia-review-protected-'));
  const keep=path.join(out,'index.html');fs.writeFileSync(keep,'accepted existing site');
  try{
    for(const target of [root,path.parse(root).root,out]) assert.throws(()=>execFileSync(process.execPath,['scripts/build-spia-review.mjs','--out',target],{cwd:root,stdio:'pipe'}));
    assert.equal(fs.readFileSync(keep,'utf8'),'accepted existing site');
  }finally{fs.rmSync(out,{recursive:true,force:true});}
});

test('physical artist links preserve parameters and the native adapter refuses changed source contracts',()=>{
 const a={value:'/artists/spia?section=members&q=Sunhye',getAttribute(){return this.value},setAttribute(_k,v){this.value=v}};
 class Observer{observe(){}disconnect(){}}
 installReviewLinks({querySelectorAll:()=>[a]},{href:origin+ARTIST_PATH},Observer);
 assert.equal(a.value,'/artists/spia/index.html?section=members&q=Sunhye');
 assert.throws(()=>reviewNavigationSource('changed navigation'),/Native artist navigation changed/);
 const source=fs.readFileSync(path.join(root,'components/use-browse-journey.ts'),'utf8');
 const adapted=reviewNavigationSource(source);assert.ok(adapted.includes('!safe||!mayLeave()'));assert.ok(adapted.includes('window.location.assign(reviewArtistHref(safe,location.href))'));
});

test('artist history retains physical reload/copy URLs without changing route queries or state',()=>{
 const browser=fakeBrowser(origin+ARTIST_PATH+'/index.html?section=members&q=Sunhye');const stop=installArtistHistory(browser.history,browser.location);
 browser.history.pushState({focus:'recvxAPQCFrweo'},'',ARTIST_PATH+'?section=members&member=recvxAPQCFrweo&q=Sunhye');
 assert.equal(browser.location.pathname,ARTIST_PATH+'/index.html');assert.equal(new URL(browser.location.href).searchParams.get('q'),'Sunhye');assert.equal(browser.history.state.focus,'recvxAPQCFrweo');
 assert.equal(normalizeReviewLocation(browser.location,browser.history),ARTIST_PATH);assert.equal(browser.location.pathname,ARTIST_PATH+'/index.html');stop();
});

test('timeline adapters normalize only the static path while retaining return and navigation guards',()=>{
 for(const file of ['artist-timeline-host.tsx','use-timeline-return.ts']){const source=fs.readFileSync(path.join(root,'components',file),'utf8');const adapted=reviewTimelineSource(file,source);assert.ok(adapted.includes('canonicalReviewPath(location.pathname)+location.search'));assert.throws(()=>reviewTimelineSource(file,'changed location'),/Native timeline location changed/);}
});

test('optional public-original delivery pins five untouched portraits to a full immutable SHA',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'spia-public-originals-')),ref='a'.repeat(40);
 try{
  assert.throws(()=>execFileSync(process.execPath,['scripts/build-spia-review.mjs','--out',out,'--public-originals-ref','main'],{cwd:root,stdio:'pipe'}));
  execFileSync(process.execPath,['scripts/build-spia-review.mjs','--out',out,'--public-originals-ref',ref],{cwd:root,stdio:'pipe'});
  const manifest=JSON.parse(fs.readFileSync(path.join(out,'review-spia/manifest.json'))),remote=manifest.assets.filter(a=>a.delivery==='public-original');
  assert.equal(remote.length,5);
  const js=fs.readFileSync(path.join(out,'review-spia/app.js'),'utf8'),html=fs.readFileSync(path.join(out,'artists/spia/index.html'),'utf8');
  for(const a of remote){assert.equal(a.url,'https://raw.githubusercontent.com/KAtOReNA7/idol/'+ref+'/apps/idol-site/public'+a.path);assert.equal(fs.existsSync(path.join(out,a.path)),false);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,'public',a.path))).digest('hex'),a.sha256);assert.ok(js.includes(a.url));}
  assert.match(html,/img-src[^;]+https:\/\/raw\.githubusercontent\.com/);assert.match(html,/connect-src 'none'/);assert.match(html,/form-action 'none'/);
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
