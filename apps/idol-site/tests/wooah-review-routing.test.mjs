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
import {ARTIST_PATH, RECORDS_PATH, canonicalReviewPath, normalizeReviewLocation, reviewRecordHref, installRecordHistory, installReviewLinks} from '../review/wooah/routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://review.invalid';
const returnTo = '/artists/wooah?section=works&format=mv&media=recvxyH5pzlG0W';
const query = '?view=works&work=recvxyH5pzlG0W&returnTo=' + encodeURIComponent(returnTo);

test('all physical artist aliases normalize before native routing; other group and record paths retain identity', () => {
  for (const pathname of ['/artists/wooah','/artists/wooah/','/artists/wooah/index.html','/review-wooah','/review-wooah/','/review-wooah/index.html']) assert.equal(canonicalReviewPath(pathname), ARTIST_PATH);
  for (const pathname of [RECORDS_PATH,'/','/index.html','/artists/genblue','/review-genblue/index.html','/artists/wooah/unknown','/api/save']) assert.equal(canonicalReviewPath(pathname), pathname);
  const state = {wooahOrigin:{path:returnTo,y:620}};
  const calls = [];
  assert.equal(normalizeReviewLocation({pathname:'/artists/wooah/index.html',search:'?section=members&member=recvxyICzHGJek',hash:'#details'},{state,replaceState:(...args)=>calls.push(args)}), ARTIST_PATH);
  assert.deepEqual(calls, [[state,'','/artists/wooah?section=members&member=recvxyICzHGJek#details']]);
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

test('actual anchor hrefs are rewritten on mount and later React commits, without event interception', () => {
  const anchor = value => ({value,getAttribute:()=>value,setAttribute(key,next){assert.equal(key,'href');value=next;this.value=next;}});
  const first=anchor('/'+query),artist=anchor('/artists/genblue'),links=[first,artist];
  let notify,options,disconnected=false;
  class Observer { constructor(callback){notify=callback;} observe(_root,value){options=value;} disconnect(){disconnected=true;} }
  const stop=installReviewLinks({querySelectorAll:()=>links},{href:origin+ARTIST_PATH},Observer);
  assert.equal(first.value,RECORDS_PATH+query);
  assert.equal(artist.value,'/artists/genblue');
  const member=anchor('/?view=members&member=recvxyICzHGJek&returnTo=%2Fartists%2Fwooah');links.push(member);notify();
  assert.equal(member.value,RECORDS_PATH+'?view=members&member=recvxyICzHGJek&returnTo=%2Fartists%2Fwooah');
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
  assert.equal(browser.history.state.idolBrowse.route.work,'recvxyH5pzlG0W');
  assert.equal(browser.history.state.idolBrowse.route.artistReturn,returnTo);
  assert.equal(journey.navigate({nav:'members',work:null,member:'recvxyICzHGJek'},'作品记录'),true);
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('member'),'recvxyICzHGJek');
  journey.navigate({nav:'works',work:'recvxyH5pzV8fK',member:null},'成员记录');
  journey.setVideo('stage');journey.updateFilters({search:'Catch the Stars'});
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('video'),'stage');
  const beforeReload=JSON.stringify(browser.history.state.idolBrowse);
  mount();
  assert.equal(browser.history.state.idolBrowse.route.work,'recvxyH5pzV8fK');
  assert.equal(browser.history.state.idolBrowse.lists.works.search,'Catch the Stars');
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.ok(beforeReload.includes('recvxyH5pzV8fK'));
  browser.history.back();
  assert.equal(browser.location.pathname,RECORDS_PATH);
  assert.equal(new URL(browser.location.href).searchParams.get('member'),'recvxyICzHGJek');
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

test('build produces additive physical entries, actual components, originals and nested fonts without modifying GENBLUE', () => {
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'wooah-review-test-'));
  const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const existing=['review/genblue/entry.tsx','review/genblue/routes.mjs','scripts/build-genblue-review.mjs'];
  const before=existing.map(file=>digest(path.join(root,file)));
  try {
    execFileSync(process.execPath,['scripts/build-wooah-review.mjs','--out',out],{cwd:root,stdio:'pipe'});
    const manifest=JSON.parse(fs.readFileSync(path.join(out,'review-wooah/manifest.json')));
    const html=fs.readFileSync(path.join(out,'artists/wooah/index.html'),'utf8');
    for(const entry of manifest.entries) assert.equal(fs.readFileSync(path.join(out,entry),'utf8'),html);
    for(const reserved of ['index.html','review-genblue','artists/genblue','_redirects','_headers']) assert.equal(fs.existsSync(path.join(out,reserved)),false,reserved);
    assert.match(html,/示例资料 · 评分不写入正式手帐/);assert.match(html,/connect-src 'none'/);assert.match(html,/form-action 'none'/);
    for(const asset of html.matchAll(/(?:src|href)="(\/review-wooah\/[^\"]+\.(?:js|css))"/g)) assert.ok(fs.statSync(path.join(out,asset[1])).size>0);
    assert.equal(manifest.sanitizedRelations,56);assert.equal(manifest.apiIsolationChecks,9);
    assert.ok(manifest.bundleInputs.includes('components/wooah/editorial.tsx'));
    assert.ok(manifest.bundleInputs.includes('app/page.tsx'));
    assert.ok(!manifest.bundleInputs.some(file=>/data\/snapshot|native-save|app\/api\//.test(file)));
    for(const asset of manifest.assets) assert.equal(digest(path.join(out,asset.path)),asset.sha256,asset.path);
    for(const sheet of ['fonts/genblue/genblue-text.css','fonts/wooah/wooah-text.css']) for(const match of fs.readFileSync(path.join(out,sheet),'utf8').matchAll(/url\(['"]?(\/[^)'"\s]+)/g)) assert.ok(fs.existsSync(path.join(out,match[1])),match[1]);
    assert.ok(fs.existsSync(path.join(out,'fonts/Syne.ttf')));
    assert.deepEqual(existing.map(file=>digest(path.join(root,file))),before);
  } finally { fs.rmSync(out,{recursive:true,force:true}); }
});
