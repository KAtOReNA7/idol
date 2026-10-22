const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const cache={};function load(file){if(cache[file])return cache[file];const out={};cache[file]=out;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams,crypto:require('node:crypto').webcrypto})(n=>require('./helpers/timeline-dependency-loader.cjs').timelineDependency(n)??load('lib/idol/'+n.slice(2)+'.ts'),out);return out;}
const a=load('lib/idol/artist-navigation.ts'),j=load('lib/idol/journey.ts'),p=load('lib/idol/artist-preview.ts');
test('artist return destinations are exact same-origin approved pages only',()=>{for(const bad of ['https://evil.test/artists/babymonster','//evil.test/artists/babymonster','javascript:alert(1)','/api/save','/manage','/artists/unreleased','/artists/babymonster?secret=abc','/artists/babymonster?member=https://evil.test','/artists/babymonster?section=no','/artists/babymonster#fragment'])assert.equal(a.safeArtistReturn(bad),null,bad);assert.equal(a.safeArtistReturn('/artists/babymonster?section=works&q=DRIP'),'/artists/babymonster?section=works&q=DRIP');});
test('work and stage return keep artist filters without changing source or ratings',()=>{const dest='/artists/babymonster?section=works&queue=rewatch&q=DRIP',work={id:'recWork'};const url=p.artistWorkUrl(work,true,dest),r=j.readRoute(url);assert.equal(r.artistReturn,dest);assert.equal(r.video,'stage');assert.equal(j.routeUrl(r),url);const next=j.nextEntry(j.newEntry(url),{work:'recNext'},'Next');assert.equal(next.route.artistReturn,dest);assert.equal(next.route.video,'mv');const home=j.nextEntry(next,{nav:'home',work:null,member:null},'Home');assert.equal(home.route.artistReturn,undefined);});
test('only released artists are promoted; unrelated group and member routes remain unchanged',()=>{assert.equal(a.groupArtistUrl(a.BABYMONSTER_GROUP_ID),'/artists/babymonster');assert.equal(a.groupArtistUrl('recElse'),null);assert.equal(a.memberArtistUrl({id:'recM',groupIds:['recElse']}),null);assert.equal(a.memberArtistUrl({id:'recM',groupIds:[a.BABYMONSTER_GROUP_ID]}),'/artists/babymonster?section=members&member=recM');});
test('cross-page navigation retains draft guard and captures browse position before leaving',()=>{const s=fs.readFileSync('components/use-browse-journey.ts','utf8');assert.match(s,/function leaveTo\(href:string,preferBack=false\).*safeArtistReturn\(href\).*mayLeave\(\).*capture\(\);.*window.location.assign\(safe\)/);assert.match(s,/data-navigation-blocked/);assert.match(s,/data-dirty/);const app=fs.readFileSync('app/page.tsx','utf8');assert.match(app,/route.artistReturn\)\{journey.leaveTo\(route.artistReturn,true\)/);assert.match(app,/bmExperience\?'bm-experience'/);});
test('published official social cards retain observed precision and date',()=>{const d=JSON.parse(fs.readFileSync('data/babymonster-artist.json'));assert.equal(d.social.length,3);assert.deepEqual(d.social.map(x=>x.display),['1042万','100万','1340万']);for(const x of d.social){assert.equal(x.approximate,true);assert.match(x.observedAt,/^2026-10-14T/);assert.ok(new URL(x.url).protocol==='https:');}const s=fs.readFileSync('components/artist-sample.tsx','utf8');assert.match(s,/as-social-reach/);assert.match(s,/约 \{s.display\}/);});
test('seven member headers share one official concept set, never changing MV screenshot selection',()=>{const d=JSON.parse(fs.readFileSync('data/babymonster-artist.json'));assert.deepEqual(Object.keys(d.memberVisuals),['RUKA','PHARITA','ASA','AHYEON','RAMI','RORA','CHIQUITA']);assert.equal(new Set(Object.values(d.memberVisuals).map(v=>v.setId)).size,1);for(const v of Object.values(d.memberVisuals)){assert.equal(v.isMvScreenshot,false);assert.match(v.date,/^2024-03-/);assert.equal(new URL(v.sourceUrl).hostname,'yg-life.com');assert.ok(fs.existsSync('public'+v.image));}const src=fs.readFileSync('app/page.tsx','utf8');const work=src.slice(src.indexOf('function WorkDetail'),src.indexOf('function MemberWorkCard'));assert.doesNotMatch(work,/memberVisuals|bmArtistContent|concept/);assert.match(work,/<section hidden=\{view==='stage'\}/);assert.match(work,/stageSourceKey\(stage\)/);});

test('long multilingual artist searches survive and duplicate query fields fail closed',()=>{const dest=p.artistRouteUrl({section:'works',member:null,queue:'all',search:'好'.repeat(200)},'/artists/babymonster');assert.ok(dest.length>600);assert.equal(a.safeArtistReturn(dest),dest);assert.equal(j.readRoute(p.artistWorkUrl({id:'recW'},false,dest)).artistReturn,dest);assert.equal(a.safeArtistReturn('/artists/babymonster?section=works&section=BAD'),null);});

test('BM watch styles are scoped and lightbox controls retain contrast',()=>{const css=fs.readFileSync('app/babymonster-experience.css','utf8');assert.match(css,/\.bm-experience \.photo-lightbox-close\{background:#FF3154;color:#fff/);assert.match(css,/\.bm-experience \.member-photo-expand\{background:#151619ed;color:#F4F2EF/);assert.doesNotMatch(css,/(?:^|\})\s*(?:body|html|:root|\.header|\.cast-card)\s*\{/);assert.match(css,/\.bm-experience \.header\{height:auto;min-height:78px/);});

test('ILLIT routes isolate its collection and retain return context',()=>{assert.equal(a.groupArtistUrl(a.ILLIT_GROUP_ID),'/artists/illit');assert.equal(a.memberArtistUrl({id:'recI',groupIds:[a.ILLIT_GROUP_ID]}),'/artists/illit?section=members&member=recI');const dest=p.artistRouteUrl({section:'works',member:null,queue:'all',search:'Magnetic'},'/artists/illit');assert.equal(dest,'/artists/illit?section=works&q=Magnetic');assert.equal(j.readRoute(p.artistWorkUrl({id:'recW'},true,dest)).artistReturn,dest);assert.equal(a.artistReturnLabel(dest),'ILLIT');assert.equal(a.artistReturnLabel('/artists/babymonster'),'BABYMONSTER');});

test('IVE and BADVILLAIN public release/media return keys are scoped and preserve exact context',()=>{
 for(const [slug,file] of [['ive','data/ive-soft-issue.json'],['badvillain','data/badvillain-figma-public.json']]){
  const d=JSON.parse(fs.readFileSync(file));
  for(const [key,list] of [['release',d.releases],['media',d.media]])for(const row of list){
   const dest=`/artists/${slug}?section=works&${key}=${row.id}`;
   assert.equal(a.safeArtistReturn(dest),dest);
   assert.equal(j.readRoute(p.artistWorkUrl({id:'recW'},false,dest)).artistReturn,dest);
   assert.equal(a.safeArtistReturn(`/artists/loona?section=works&${key}=${row.id}`),null);
  }
  assert.equal(a.safeArtistReturn(`/artists/${slug}?release=unknown`),null);
  assert.equal(a.safeArtistReturn(`/artists/${slug}?media=${d.media[0].id}&release=${d.releases[0].id}`),null);
  assert.equal(a.safeArtistReturn(`/artists/${slug}?media=${d.media[0].id}&media=${d.media[0].id}`),null);
 }
});

test('NewJeans release and single read-only stage returns use exact bounded keys',()=>{
 const d=JSON.parse(fs.readFileSync('data/newjeans-design.json'));
 for(const r of d.releases){const dest='/artists/newjeans?section=records&release='+r.id;assert.equal(a.safeArtistReturn(dest),dest);}
 const stage='/artists/newjeans?section=works&media=newjeans-stage-super-shy-inkigayo-20230806';assert.equal(a.safeArtistReturn(stage),stage);
 assert.equal(a.safeArtistReturn('/artists/newjeans?media=recvxyOz5X2J0A'),null);
 assert.equal(a.safeArtistReturn('/artists/newjeans?release=ive-release-308216'),null);
});

test('i-dle navigation keys stay ID-only and exactly match the existing allowed catalog subset',()=>{
 const catalog=JSON.parse(fs.readFileSync('data/idle-design-public.json'));
 const keys=JSON.parse(fs.readFileSync('data/idle-navigation-keys.json'));
 const stageId='idle-stage-kbs-music-bank-20220318-tomboy';
 assert.deepEqual(Object.keys(keys).sort(),['media','releases']);
 assert.equal(keys.releases.length,41);
 assert.equal(new Set(keys.releases.map(row=>row.id)).size,41);
 assert.deepEqual(keys.releases,catalog.releases.map(({id})=>({id})));
 assert.deepEqual(keys.media,[{id:stageId}]);
 assert.ok(catalog.media.some(row=>row.id===stageId));
 for(const row of [...keys.releases,...keys.media])assert.deepEqual(Object.keys(row),['id']);
 const navigation=fs.readFileSync('lib/idol/artist-navigation.ts','utf8');
 assert.ok(navigation.includes("from '../../data/idle-navigation-keys.json'"));
 assert.ok(!navigation.includes('idle-design-public.json'));
 assert.ok(fs.readFileSync('components/candidate/idle-design.tsx','utf8').includes("from '@/data/runtime/idle-design-public.json'"));
 for(const [key,rows] of [['release',keys.releases],['media',keys.media]])for(const row of rows){
  const dest=`/artists/idle?section=works&queue=rewatch&q=TOMBOY&${key}=${row.id}`;
  assert.equal(a.safeArtistReturn(dest),dest);
  assert.equal(j.readRoute(p.artistWorkUrl({id:'recW'},true,dest)).artistReturn,dest);
  assert.equal(a.safeArtistReturn(`/artists/newjeans?${key}=${row.id}`),null);
 }
 for(const row of catalog.media.filter(row=>row.id!==stageId))assert.equal(a.safeArtistReturn('/artists/idle?media='+row.id),null);
 for(const query of ['release=unknown','media=unknown',`release=${keys.releases[0].id}&media=${stageId}`,`media=${stageId}&media=${stageId}`,`release=${keys.releases[0].id}&release=${keys.releases[0].id}`])assert.equal(a.safeArtistReturn('/artists/idle?'+query),null);
});

test('IVE, BADVILLAIN and tripleS navigation tables exactly project their original allowlists',()=>{
 const navigation=fs.readFileSync('lib/idol/artist-navigation.ts','utf8');
 for(const [slug,source,field,display] of [
  ['ive','data/ive-soft-issue.json','id','components/ive-artist.tsx'],
  ['badvillain','data/badvillain-figma-public.json','id','components/candidate/badvillain-design.tsx'],
  ['triples','data/triples/design-public-catalog.json','key','lib/idol/triples-design-catalog.ts'],
 ]){
  const catalog=JSON.parse(fs.readFileSync(source));
  const keyFile=`data/${slug}-navigation-keys.json`;
  const keys=JSON.parse(fs.readFileSync(keyFile));
  const expected={releases:catalog.releases.map(row=>({[field]:row[field]}))};
  if(field==='id')expected.media=catalog.media.map(({id})=>({id}));
  assert.deepEqual(keys,expected,slug+' exact projection, with no display payload');
  assert.ok(navigation.includes(`from '../../${keyFile}'`));
  assert.ok(!navigation.includes(source.slice(5)));
  assert.ok(fs.readFileSync(display,'utf8').includes(source.slice(5)),slug+' retains full display catalog');
  for(const [param,rows] of [['release',keys.releases],['media',keys.media??[]]])for(const row of rows){
   assert.deepEqual(Object.keys(row),[field]);
   const dest=`/artists/${slug}?section=works&queue=rewatch&q=test&${param}=${row[field]}`;
   assert.equal(a.safeArtistReturn(dest),dest);
   assert.equal(j.readRoute(p.artistWorkUrl({id:'recW'},true,dest)).artistReturn,dest);
   for(const other of ['ive','badvillain','triples','idle','newjeans'].filter(x=>x!==slug))assert.equal(a.safeArtistReturn(`/artists/${other}?${param}=${row[field]}`),null);
   assert.equal(a.safeArtistReturn(`/artists/${slug}?${param}=${row[field]}&${param}=${row[field]}`),null);
  }
  for(const query of ['release=unknown','media=unknown',`release=${keys.releases[0][field]}&media=unknown`])assert.equal(a.safeArtistReturn(`/artists/${slug}?${query}`),null);
  if(slug==='triples'){
   // tripleS has always accepted release.key only, and no media selector.
   for(const row of catalog.releases)if(row.id&&!keys.releases.some(entry=>entry.key===row.id))assert.equal(a.safeArtistReturn('/artists/triples?release='+row.id),null);
   for(const row of [...catalog.musicVideos,...catalog.stages])for(const field of ['id','key'])if(row[field])assert.equal(a.safeArtistReturn('/artists/triples?media='+row[field]),null);
  }
 }
});


test('Hearts2Hearts readonly release returns preserve exact approved keys only',()=>{
 const keys=JSON.parse(fs.readFileSync('data/hearts2hearts-navigation-keys.json'));
 assert.deepEqual(keys,{release:['moonride','iconic-heart','lemon-tang']});
 for(const id of keys.release){const dest='/artists/hearts2hearts?section=records&release='+id;assert.equal(a.safeArtistReturn(dest),dest);assert.equal(j.readRoute(p.artistWorkUrl({id:'recW'},true,dest)).artistReturn,dest);}
 for(const query of ['release=unknown','release=moonride&release=moonride','release=moonride&media=x','media=moonride'])assert.equal(a.safeArtistReturn('/artists/hearts2hearts?'+query),null);
 assert.equal(a.safeArtistReturn('/artists/billlie?release=moonride'),null);
});
