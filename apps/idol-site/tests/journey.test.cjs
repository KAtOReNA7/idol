// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node CommonJS test harness dependency.
const {candidateRegistry}=require('./candidate-harness.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function compile(file,requireFn,globals={}){const e={};const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(`(function(require,exports){${code}})`,{URL,URLSearchParams,crypto:require('node:crypto').webcrypto,...globals})(requireFn,e);return e;}
const rotation=compile('lib/idol/home-rotation.ts',()=>({}));
const artistNavigation=compile('lib/idol/artist-navigation.ts',name=>{const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;if(name==='./candidate/registry')return candidateRegistry;if(name==='./member-affiliation')return compile('lib/idol/member-affiliation.ts',()=>({}));throw Error('Unexpected artist-navigation dependency '+name);});
const insightState=compile('lib/idol/personal-insights/view-state.ts',()=>({}));
const pure=compile('lib/idol/journey.ts',n=>n.includes('personal-insights/view-state')?insightState:n.includes('artist-navigation')?artistNavigation:rotation);
function harness(url='https://test.site/?view=works'){
 let current,dirty=false,blocked=false,allow=true,height=10000;let triggers=[];const observers=[];const listeners={},frames=new Map();let frame=0;
 const location={href:url,get pathname(){return new URL(this.href).pathname},get search(){return new URL(this.href).search}};const entries=[{url,state:null}];let index=0;
 const history={scrollRestoration:'auto',get state(){return entries[index].state},replaceState(state,_,url){entries[index]={state:structuredClone(state),url:new URL(url,location.href).href};location.href=entries[index].url},pushState(state,_,url){entries.splice(index+1);entries.push({state:structuredClone(state),url:new URL(url,location.href).href});index++;location.href=entries[index].url},go(delta){const n=index+delta;if(n<0||n>=entries.length)return;index=n;location.href=entries[index].url;listeners.popstate?.()}};
 const window={location:{assign(href){location.href=new URL(href,location.href).href}},innerHeight:800,scrollY:0,scrollTo({top}){this.scrollY=Math.min(top,Math.max(0,height-this.innerHeight))},confirm(){return allow},alert(){}};
 const React={useRef(v){const i=current.i++;return current.hooks[i]??(current.hooks[i]={current:v})},useState(v){const i=current.i++;const r=current;if(!r.hooks[i])r.hooks[i]={value:typeof v==='function'?v():v};return [r.hooks[i].value,x=>{r.hooks[i].value=typeof x==='function'?x(r.hooks[i].value):x}]},useEffect(fn,deps){const i=current.i++,r=current,old=r.hooks[i];if(!old||!deps.every((v,j)=>Object.is(v,old.deps[j]))){r.hooks[i]={deps,cleanup:old?.cleanup};r.effects.push(()=>{old?.cleanup?.();r.hooks[i].cleanup=fn()})}}};React.useLayoutEffect=React.useEffect;React.useCallback=(fn,deps)=>{const i=current.i++,r=current,old=r.hooks[i];if(!old||!deps.every((v,j)=>Object.is(v,old.deps[j])))r.hooks[i]={deps,value:fn};return r.hooks[i].value};
 class Element{constructor(key,anchor,top){this.dataset={memberWorkTrigger:key,browseAnchor:anchor};this.top=top;this.disabled=false;}closest(selector){return selector.includes('[data-browse-anchor]')||selector==='[data-member-work-trigger]'?this:null;}matches(selector){return selector===':disabled'&&this.disabled;}focus(){document.activeElement=this;}getBoundingClientRect(){return {top:this.top-window.scrollY,bottom:this.top-window.scrollY+44};}}
 const document={activeElement:null,body:{},addEventListener(k,f){listeners['document:'+k]=f},removeEventListener(k,f){if(listeners['document:'+k]===f)delete listeners['document:'+k]},querySelector:selector=>selector==='main'?{}:selector==='[data-navigation-blocked="true"]'?(blocked?{}:null):selector==='[data-dirty="true"]'?(dirty?{}:null):null,querySelectorAll:selector=>selector==='[data-member-work-trigger]'||selector.includes('[data-browse-anchor]')?triggers:[]};
 const globals={window,history,location,document,Element,performance:{getEntriesByType:()=>[{type:'reload'}]},ResizeObserver:class{constructor(fn){this.fn=fn;observers.push(this)}observe(){this.active=true}disconnect(){this.active=false}},requestAnimationFrame:fn=>{frames.set(++frame,fn);return frame},cancelAnimationFrame:id=>frames.delete(id),addEventListener:(k,f)=>listeners[k]=f,removeEventListener:(k,f)=>{if(listeners[k]===f)delete listeners[k]}};
 const focus=compile('components/use-member-work-focus.ts',n=>n==='react'?React:{},globals);
 const api=compile('components/use-browse-journey.ts',n=>n==='react'?React:n.includes('personal-insights/view-state')?insightState:n.includes('use-experience-styles')?{useExperienceStyles:()=>({phase:'not-required',retry:()=>{}})}:n.includes('use-member-work-focus')?focus:n.includes('home-rotation')?rotation:n.includes('artist-navigation')?artistNavigation:pure,globals);
 const {resolveRestoreTarget}=require('./helpers/library-browser-dependency-loader.cjs').libraryBrowserDependency('@/components/library-browser');
 const mountedIds=require('./library-fixture.cjs')().works.map(work=>work.id);
 let mountedRequest;
 let runner={hooks:[],i:0,effects:[]};
 function render(){current=runner;runner.i=0;runner.effects=[];const out=api.useBrowseJourney(true);for(const f of runner.effects)f();
 // This hook-only harness models the mounted list acknowledgement using the
 // production resolver. Real DOM mount/focus is covered by library-browser tests.
 const target=out.libraryRestoreTarget;
 if(target&&target.requestKey!==mountedRequest){mountedRequest=target.requestKey;out.libraryRestoreMounted(resolveRestoreTarget(mountedIds,out.filters.pageSize??24,target));}
 return out}
 function flush(){let out=render();for(let i=0;i<3;i++){const jobs=[...frames.values()];frames.clear();for(const f of jobs)f();out=render()}return out}
 let state=render();state=flush();
 return {get api(){return render()},flush,history,location,window,entries,document,mountVersionTrigger(source,target,top=700){const trigger=new Element('version:'+source+':'+target,'version-'+source+'-'+target,top);triggers=[trigger];return trigger;},clearTriggers(){triggers=[];document.activeElement=null;},clickTrigger(trigger){listeners.pointerdown?.({target:trigger});trigger.focus();listeners['document:click']?.({target:trigger,button:0,defaultPrevented:false});},resize(h){height=h;for(const o of observers)if(o.active)o.fn();return flush()},userScroll(y){listeners.wheel?.({target:{closest:()=>null}});window.scrollY=y;listeners.scroll?.();return flush()},setDirty(v,a=true){dirty=v;allow=a},setBlocked(v){blocked=v},scroll(y){listeners.wheel?.({target:{closest:()=>null}});window.scrollY=y;listeners.scroll?.();flush()},reload(){for(const h of runner.hooks)h?.cleanup?.();runner={hooks:[],i:0,effects:[]};render();return flush()}};
}
test('work to member and back restores precise work mode, list scope and scroll',()=>{
 const h=harness();h.api.updateFilters({search:'BATTER',group:'recGroup',stageFilter:'ready',limit:72});h.scroll(2400);
 h.api.navigate({work:'recWork',member:null},'作品库');h.flush();assert.equal(h.window.scrollY,0);h.api.setVideo('stage');h.scroll(530);
 h.api.navigate({work:null,member:'recMember'},'BATTER UP');h.flush();assert.equal(h.api.backLabel,'BATTER UP');
 h.api.back({nav:'members',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,'recWork');assert.equal(h.api.route.video,'stage');assert.equal(h.window.scrollY,530);
 h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,null);assert.equal(h.window.scrollY,2400);assert.equal(h.api.filters.search,'BATTER');assert.equal(h.api.filters.limit,72);
 h.history.go(1);h.flush();assert.equal(h.api.route.work,'recWork');assert.equal(h.window.scrollY,530);
});
test('list filters are independent and survive same-tab reload',()=>{
 const h=harness();h.api.updateFilters({search:'MV',group:'g1',queue:'tonight',limit:48});h.scroll(1200);h.api.navigate({nav:'members',work:null,member:null},'作品库');h.flush();assert.equal(h.api.filters.search,'');assert.equal(h.api.filters.group,'all');h.api.updateFilters({search:'XG'});h.scroll(800);h.reload();assert.equal(h.api.filters.search,'XG');assert.equal(h.window.scrollY,800);
 h.api.navigate({nav:'works',work:null,member:null},'成员档案');h.flush();assert.equal(h.api.filters.search,'MV');assert.equal(h.api.filters.queue,'tonight');assert.equal(h.api.filters.limit,48);assert.equal(h.window.scrollY,1200);
 h.api.updateFilters(pure.defaultFilters());assert.equal(h.api.filters.group,'all');assert.equal(h.api.filters.limit,24);
});
test('cancelled navigation and browser back preserve draft page and do not reset filters',()=>{
 const h=harness();h.api.updateFilters({search:'keep'});h.api.navigate({work:'recWork'},'作品库');h.flush();h.setDirty(true,false);const url=h.location.href;
 assert.equal(h.api.navigate({nav:'works',work:null},'work',{search:'reset'}),false);assert.equal(h.location.href,url);assert.equal(h.api.filters.search,'keep');
 h.history.go(-1);h.flush();assert.equal(h.location.href,url);assert.equal(h.api.route.work,'recWork');assert.equal(h.api.filters.search,'keep');
 h.setDirty(true,true);h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,null);
});
test('direct detail links have a safe return and history contains navigation only',()=>{
 const h=harness('https://test.site/?view=works&work=recW&video=stage');assert.equal(h.api.route.video,'stage');assert.equal(h.api.backLabel,undefined);h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,null);
 assert.deepEqual(Object.keys(h.history.state.idolBrowse).sort(),['home','insights','listScroll','lists','position','route','scrollY','version']);assert.equal(pure.readEntry({idolBrowse:{version:1}},'https://test.site'),null);
});
test('member search includes group names and mobile draft shortcut has a real control',()=>{const s=fs.readFileSync(root+'/app/page.tsx','utf8');assert.ok(s.includes('matchingMembers(memberIndex,journey.filters)'));const index=fs.readFileSync(root+'/lib/idol/member-index.ts','utf8');assert.ok(index.includes('memberChineseName(member)'));assert.ok(index.includes('linked.flatMap(publicGroupNames)'));assert.ok(fs.readFileSync(root+'/lib/idol/public-group-names.ts','utf8').includes('group.name,group.currentName'));assert.match(s,/hasMemberDraft&&<button[^>]+onClick=\{jumpToMemberDraft\}/);assert.match(s,/\(button\?\?card\)\?\.scrollIntoView/);assert.match(s,/querySelector<HTMLButtonElement>\('\.editor-actions button:not\(:disabled\)'\)/);});

test('restoration survives async short-page clamp and stops when user takes over',()=>{const h=harness();h.scroll(2200);h.api.navigate({work:'recWork'},'作品库');h.flush();h.resize(1000);h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.window.scrollY,200);h.resize(4000);assert.equal(h.window.scrollY,2200);h.userScroll(900);h.resize(5000);assert.equal(h.window.scrollY,900);});

test('in-page alternative shortcut scrolls without creating an untracked history entry',()=>{const s=fs.readFileSync(root+'/app/page.tsx','utf8');assert.ok(s.includes("document.getElementById('other-performances')?.scrollIntoView"));assert.ok(!s.includes('href=\"#other-performances\"'));});

test('next work retains original list return, sequence, reload and browser history',()=>{
 const h=harness();h.api.updateFilters({queue:'tonight',search:'song',limit:48});h.scroll(1800);
 const sequence={ids:['recA','recB','recC'],label:'待看',filters:{...pure.defaultFilters(),queue:'tonight'}};
 h.api.navigate({work:'recA',member:null},'作品库',undefined,sequence);h.flush();h.api.setVideo('stage');
 assert.equal(h.api.continueWork('recB'),true);h.flush();assert.equal(h.api.route.work,'recB');assert.equal(h.api.route.video,'mv');assert.equal(h.api.backLabel,'作品库');h.reload();assert.deepEqual(h.api.sequence.ids,sequence.ids);
 h.history.go(-1);h.flush();assert.equal(h.api.route.work,'recA');assert.equal(h.api.route.video,'stage');h.history.go(1);h.flush();assert.equal(h.api.route.work,'recB');
 h.api.navigate({work:null,member:'recMember'},'B');h.flush();h.api.back({nav:'members',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,'recB');assert.deepEqual(h.api.sequence.ids,sequence.ids);
 h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,null);assert.equal(h.window.scrollY,1800);assert.equal(h.api.filters.search,'song');assert.equal(h.api.filters.limit,48);
});
test('next work respects dirty cancellation and never rewinds or leaves the chosen sequence',()=>{
 const h=harness();h.api.navigate({work:'recA'},'作品库',undefined,{ids:['recA','recB'],label:'待看',filters:pure.defaultFilters()});h.flush();h.setDirty(true,false);const url=h.location.href;
 assert.equal(h.api.continueWork('recB'),false);assert.equal(h.location.href,url);assert.equal(h.api.route.work,'recA');assert.equal(h.entries.length,2);
 h.setDirty(false);assert.equal(h.api.continueWork('recOther'),false);assert.equal(h.api.continueWork('recA'),false);assert.equal(h.api.continueWork('recB'),true);h.flush();assert.equal(h.api.continueWork('recA'),false);
});
test('malformed playback sequences are ignored on reload',()=>{
 const e=pure.newEntry('https://test.site/?work=recA');const seq={ids:['recA','recB'],label:'待看',filters:pure.defaultFilters()};e.sequence=seq;assert.ok(pure.readEntry({idolBrowse:e},'https://test.site/?work=recA'));
 for(const ids of [['recA','recA'],['https://bad.test'],[{},'recA']])assert.equal(pure.readEntry({idolBrowse:{...e,sequence:{...seq,ids}}},'https://test.site/?work=recA'),null);
});

test('pending save blocks next, return and history even without dirty fields',()=>{const h=harness();h.api.navigate({work:'recA'},'作品库',undefined,{ids:['recA','recB'],label:'待看',filters:pure.defaultFilters()});h.flush();h.setBlocked(true);assert.equal(h.api.continueWork('recB'),false);assert.equal(h.api.navigate({work:null},''),false);h.history.go(-1);h.flush();assert.equal(h.api.route.work,'recA');h.setBlocked(false);assert.equal(h.api.continueWork('recB'),true);});

 test('home picks survive detail/back and manual rotation does not affect the other pools',()=>{const h=harness('https://test.site/');const first=h.api.home;first.tonight.ids=['recA','recB','recC'];first.photos.ids=['recM','recN'];h.api.updateHome(first);h.scroll(950);h.api.navigate({nav:'works',work:'recA'},'我的放映室');h.flush();h.api.back({nav:'home',work:null,member:null,video:'mv'});h.flush();assert.equal(JSON.stringify(h.api.home),JSON.stringify(first));assert.equal(h.window.scrollY,950);const next=rotation.shuffleHomePool(h.api.home,'photos',77);h.api.updateHome(next);assert.equal(JSON.stringify(h.api.home.tonight),JSON.stringify(first.tonight));assert.deepEqual(Array.from(h.api.home.photos.previous),['recM','recN']);assert.equal(h.api.home.photos.ids.length,0);});
 test('fresh reload rotates with previous ids while a new home entry preserves the old back entry',()=>{const h=harness('https://test.site/');let first=h.api.home;first.tonight.ids=['recA'];h.api.updateHome(first);h.reload();assert.notEqual(h.api.home.tonight.seed,first.tonight.seed);assert.deepEqual(Array.from(h.api.home.tonight.previous),['recA']);const onReload=h.api.home;h.api.navigate({nav:'members'},'home');h.flush();h.api.navigate({nav:'home'},'members');h.flush();assert.notEqual(h.api.home.tonight.seed,onReload.tonight.seed);h.history.go(-2);h.flush();assert.equal(JSON.stringify(h.api.home),JSON.stringify(onReload));});
 test('home history rejects unbounded ids and private payload-shaped picks',()=>{const e=pure.newEntry('https://test.site/');e.home=rotation.newHomeRotation(undefined,10);assert.ok(pure.readEntry({idolBrowse:e},'https://test.site/'));e.home.photos.ids=['https://arbitrary.test'];assert.equal(pure.readEntry({idolBrowse:e},'https://test.site/'),null);});

test('group detail deep link and group-scoped filters preserve index, work, member and return context',()=>{
 const h=harness('https://test.site/?view=groups');h.api.updateFilters({search:'BABY',generation:'第五代'});h.scroll(1300);
 h.api.navigate({nav:'groups',groupId:'recGroup',work:null,member:null},'团体索引');h.flush();assert.equal(h.window.scrollY,0);assert.equal(h.api.backLabel,'团体索引');
 h.api.updateGroupFilters({search:'BATTER',queue:'tonight',limit:48});h.scroll(1900);h.reload();assert.equal(h.api.groupFilters.search,'BATTER');assert.equal(h.api.groupFilters.group,'recGroup');
 h.api.navigate({nav:'works',work:'recWork',member:null},'BABYMONSTER');h.flush();assert.equal(h.api.route.groupId,null);h.api.navigate({work:null,member:'recMember'},'BATTER UP');h.flush();
 h.api.back({nav:'members',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,'recWork');
 h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.groupId,'recGroup');assert.equal(h.api.groupFilters.search,'BATTER');assert.equal(h.window.scrollY,1900);
 h.api.back({nav:'groups',groupId:null,work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.filters.search,'BABY');assert.equal(h.window.scrollY,1300);
 h.api.navigate({nav:'groups',groupId:'recOther'},'团体索引');h.flush();assert.equal(h.api.groupFilters.search,'');assert.equal(h.api.groupFilters.queue,'all');
 h.api.navigate({nav:'home',work:null,member:null},'other');h.flush();assert.equal(h.api.route.groupId,null);
});
test('group deep links return to index and invalid history filters are rejected',()=>{
 const h=harness('https://test.site/?view=groups&group=recGroup');assert.equal(h.api.route.groupId,'recGroup');h.api.back({nav:'groups',groupId:null,work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.groupId,null);
 const e=pure.newEntry('https://test.site/?view=groups&group=recGroup');e.groupLists={recGroup:pure.defaultFilters()};assert.ok(pure.readEntry({idolBrowse:e},'https://test.site/?view=groups&group=recGroup'));e.groupLists.recGroup.search={private:'not navigation'};assert.equal(pure.readEntry({idolBrowse:e},'https://test.site/?view=groups&group=recGroup'),null);
});

test('artist cross-page return blocks unknown saves and cancelled drafts, then preserves list position',()=>{const h=harness();h.api.updateFilters({search:'BABYMONSTER',limit:48});h.scroll(1200);h.setBlocked(true);assert.equal(h.api.leaveTo('/artists/babymonster'),false);h.setBlocked(false);h.setDirty(true,false);assert.equal(h.api.leaveTo('/artists/babymonster'),false);h.setDirty(false);assert.equal(h.api.leaveTo('https://evil.test/'),false);assert.equal(h.api.leaveTo('/artists/babymonster'),true);assert.equal(h.location.href,'https://test.site/artists/babymonster');assert.equal(h.history.state.idolBrowse.scrollY,1200);assert.equal(h.history.state.idolBrowse.lists.works.search,'BABYMONSTER');});

test('sorted library retains bounded page and sort through next, Back, Forward and reload',()=>{
 const h=harness();h.api.updateFilters({sort:'release-asc',limit:72});h.api.setLibraryPage(3,24);h.flush();h.scroll(2100);
 const sequence={ids:['recOld','recNew','recLatest'],label:'作品库',filters:{...pure.defaultFilters(),sort:'release-asc',limit:72}};
 h.api.navigate({work:'recOld'},'作品库',undefined,sequence);h.flush();
 assert.equal(h.api.continueWork('recNew'),true);h.flush();assert.equal(h.api.sequence.filters.sort,'release-asc');
 h.reload();assert.equal(h.api.route.work,'recNew');assert.equal(h.api.filters.limit,72);assert.equal(h.api.filters.page,3);
 h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();
 assert.equal(h.api.route.work,null);assert.equal(h.api.filters.sort,'release-asc');assert.equal(h.api.filters.limit,72);assert.equal(h.api.filters.page,3);assert.equal(h.api.filters.pageSize,24);assert.equal(h.window.scrollY,2100);
 h.history.go(1);h.flush();assert.equal(h.api.route.work,'recOld');assert.equal(h.api.sequence.filters.sort,'release-asc');
 h.history.go(-1);h.flush();h.api.updateFilters({sort:'score-desc',limit:24});h.flush();
 assert.equal(h.api.filters.sort,'score-desc');assert.equal(h.api.filters.limit,24);assert.equal(h.api.filters.page,1);assert.equal(h.history.state.idolBrowse.listScroll.works,0);
});
test('old history without sort restores expanded page; invalid sort values are rejected in every scope',()=>{
 const e=pure.newEntry('/?view=works');e.lists.works.limit=72;for(const f of Object.values(e.lists))delete f.sort;
 assert.equal(pure.readEntry({idolBrowse:e},'/?view=works').lists.works.limit,72);
 const h=harness();h.history.replaceState({idolBrowse:e},'','/?view=works');h.reload();assert.equal(h.api.filters.sort??'default','default');assert.equal(h.api.filters.limit,72);
 for(const value of ['unexpected',null,{},['score-desc'],1]){
  const list=structuredClone(e);list.lists.works.sort=value;assert.equal(pure.readEntry({idolBrowse:list},'/?view=works'),null);
  const seq=structuredClone(e);seq.sequence={ids:['recA'],label:'作品库',filters:{...pure.defaultFilters(),sort:value}};assert.equal(pure.readEntry({idolBrowse:seq},'/?view=works'),null);
  const group=structuredClone(e);group.groupLists={recGroup:{...pure.defaultFilters(),sort:value}};assert.equal(pure.readEntry({idolBrowse:group},'/?view=works'),null);
 }
});
test('history roster cross-page navigation keeps draft and uncertain-save guards',()=>{const h=harness(),url='/artists/loona?section=members&roster=history';h.setBlocked(true);assert.equal(h.api.leaveTo(url),false);h.setBlocked(false);h.setDirty(true,false);assert.equal(h.api.leaveTo(url),false);h.setDirty(false);assert.equal(h.api.leaveTo(url),true);assert.equal(h.location.href,'https://test.site'+url);});

test('insights preferences survive detail Back, Forward and reload without an unrelated watch sequence',()=>{
 const h=harness('https://test.site/?view=insights');
 h.api.updateInsights(previous=>({...previous,domain:'stage',groupSort:'samples',memberMetric:'styling',revisitKind:'watched-unrated',pageSize:20,groupsPage:3,membersPage:4,revisitPage:2,tracePage:5,selectedMemberId:'recMember'}));
 const expected=JSON.stringify(h.api.insights);h.scroll(1400);
 h.api.navigate({nav:'works',work:'recWork',member:null,video:'stage'},'我的偏好');h.flush();
 assert.equal(h.api.route.video,'stage');assert.equal(h.api.sequence,undefined);
 h.api.back({nav:'insights',work:null,member:null,video:'mv'});h.flush();
 assert.equal(h.api.route.nav,'insights');assert.equal(JSON.stringify(h.api.insights),expected);assert.equal(h.window.scrollY,1400);
 h.reload();assert.equal(JSON.stringify(h.api.insights),expected);
 h.history.go(1);h.flush();assert.equal(h.api.route.video,'stage');assert.equal(h.api.sequence,undefined);
});
test('insights state accepts only bounded navigation fields and strips private payloads',()=>{
 const e=pure.newEntry('/?view=insights');
 e.insights={...insightState.defaultInsightsViewState(),domain:'stage',groupsPage:99999,membersPage:NaN,tracePage:2.5,revisitPage:0,pageSize:48,selectedMemberId:'private query',note:'SECRET',score:10,catalog:{},search:'SECRET'};
 const restored=pure.readEntry({idolBrowse:e},'/?view=insights').insights;
 assert.equal(restored.domain,'stage');assert.equal(restored.groupsPage,1);assert.equal(restored.membersPage,1);assert.equal(restored.tracePage,1);assert.equal(restored.revisitPage,1);assert.equal(restored.pageSize,10);assert.equal(restored.selectedMemberId,null);
 assert.deepEqual(Object.keys(restored).sort(),Object.keys(insightState.defaultInsightsViewState()).sort());assert.doesNotMatch(JSON.stringify(restored),/SECRET|"(?:score|catalog|search|note)":/);
 const h=harness('https://test.site/?view=insights');h.api.updateInsights({...restored,selectedMemberId:'recMember',note:'SECRET'});assert.doesNotMatch(JSON.stringify(h.history.state),/SECRET/);assert.equal(h.api.insights.selectedMemberId,'recMember');
});
test('explicit stage intent survives nextEntry while unspecified new works reset to MV',()=>{
 const e=pure.newEntry('/?view=insights');assert.equal(pure.nextEntry(e,{work:'recW',video:'stage'},'偏好').route.video,'stage');
 const stage=pure.nextEntry(e,{work:'recW',video:'stage'},'偏好');assert.equal(pure.nextEntry(stage,{work:'recOther'},'作品').route.video,'mv');
});
test('insights updates compose within one event and preserve navigation guards',()=>{
 const h=harness('https://test.site/?view=insights');h.api.updateInsights(p=>({...p,domain:'stage'}));h.api.updateInsights(p=>({...p,revisitPage:3}));assert.equal(h.api.insights.domain,'stage');assert.equal(h.api.insights.revisitPage,3);
 h.setDirty(true,false);assert.equal(h.api.navigate({work:'recWork',video:'stage'},'偏好'),false);assert.equal(h.api.route.work,null);assert.equal(h.api.insights.revisitPage,3);
 h.setBlocked(true);assert.equal(h.api.navigate({work:'recWork'},'偏好'),false);
});


test('related-work navigation retains the queue, exact source return, focus, filters and scroll across reload, Back and Forward',()=>{
 const h=harness();h.api.updateFilters({search:'original scope',queue:'tonight',sort:'release-asc',limit:72});h.api.setLibraryPage(3,24);h.flush();h.scroll(1800);
 const sequence={ids:['recSource','recNext'],label:'待看',filters:{...pure.defaultFilters(),queue:'tonight',sort:'release-asc'}};
 h.api.navigate({nav:'works',work:'recSource',member:null,video:'mv'},'作品库',undefined,sequence);h.flush();h.scroll(650);
 let trigger=h.mountVersionTrigger('recSource','recRelated');h.clickTrigger(trigger);
 const sourceState=structuredClone(h.history.state);
 assert.equal(h.api.navigate({nav:'works',work:'recRelated',member:null,video:'mv'},'Source song',undefined,h.api.sequence),true);h.clearTriggers();h.flush();
 assert.equal(h.api.route.work,'recRelated');assert.equal(h.api.route.video,'mv');assert.equal(h.api.backLabel,'Source song');assert.deepEqual(h.api.sequence,sequence);
 assert.equal(h.api.sequence.ids.includes(h.api.route.work),false);assert.equal(h.api.continueWork('recNext'),false,'an off-queue related work cannot continue the suspended queue');
 h.reload();assert.deepEqual(h.api.sequence,sequence);assert.equal(h.api.filters.search,'original scope');assert.equal(h.api.filters.page,3);
 h.api.back({nav:'works',work:null,member:null,video:'mv'});trigger=h.mountVersionTrigger('recSource','recRelated');h.flush();
 assert.equal(h.api.route.work,'recSource');assert.equal(h.api.sequence.ids.indexOf(h.api.route.work)+1,1);assert.equal(h.window.scrollY,650);assert.equal(h.document.activeElement,trigger);assert.equal(h.history.state.memberWorkFocus.key,'version:recSource:recRelated');
 assert.equal(h.history.state.memberWorkFocus.path,sourceState.memberWorkFocus.path);
 h.clearTriggers();h.history.go(1);h.flush();assert.equal(h.api.route.work,'recRelated');assert.deepEqual(h.api.sequence,sequence);
 h.history.go(-1);h.mountVersionTrigger('recSource','recRelated');h.flush();assert.equal(h.api.route.work,'recSource');assert.equal(h.api.continueWork('recNext'),true);h.clearTriggers();h.flush();
 assert.equal(h.api.route.work,'recNext');assert.equal(h.api.backLabel,'作品库');h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();
 assert.equal(h.api.route.work,null);assert.equal(h.window.scrollY,1800);assert.equal(h.api.filters.page,3);assert.equal(h.api.filters.sort,'release-asc');
});
test('related-work navigation uses draft and pending-save guards without modifying the original queue',()=>{
 const h=harness(),sequence={ids:['recSource','recNext'],label:'待看',filters:pure.defaultFilters()};
 h.api.navigate({work:'recSource',member:null},'作品库',undefined,sequence);h.flush();const before=h.entries.length,url=h.location.href;
 const openRelated=()=>h.api.navigate({nav:'works',work:'recRelated',member:null,video:'mv'},'Source song',undefined,h.api.sequence);
 h.setDirty(true,false);assert.equal(openRelated(),false);assert.equal(h.entries.length,before);assert.equal(h.location.href,url);assert.deepEqual(h.api.sequence,sequence);
 h.setDirty(false);h.setBlocked(true);assert.equal(openRelated(),false);assert.equal(h.entries.length,before);assert.equal(h.api.route.work,'recSource');
 h.setBlocked(false);h.setDirty(true,true);assert.equal(openRelated(),true);h.flush();assert.equal(h.api.route.work,'recRelated');assert.deepEqual(h.api.sequence,sequence);
 h.setDirty(false);h.setBlocked(true);h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,'recRelated');
 h.setBlocked(false);h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();assert.equal(h.api.route.work,'recSource');
});
test('artist deep-link origin survives related versions and returns through the source work',()=>{
 const artist='/artists/babymonster',h=harness('https://test.site/?view=works&work=recSource&returnTo='+encodeURIComponent(artist));
 h.scroll(480);h.api.navigate({nav:'works',work:'recRelated',member:null,video:'mv'},'Source song',undefined,h.api.sequence);h.flush();
 assert.equal(h.api.route.artistReturn,artist);assert.equal(new URL(h.location.href).searchParams.get('returnTo'),artist);assert.equal(h.api.sequence,undefined);
 h.reload();assert.equal(h.api.route.artistReturn,artist);h.api.back({nav:'works',work:null,member:null,video:'mv'});h.flush();
 assert.equal(h.api.route.work,'recSource');assert.equal(h.api.backLabel,undefined);assert.equal(h.api.route.artistReturn,artist);assert.equal(h.window.scrollY,480);
 assert.equal(h.api.leaveTo(h.api.route.artistReturn),true);assert.equal(h.location.href,'https://test.site'+artist);
});
