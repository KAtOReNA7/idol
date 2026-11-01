const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const out={};cache.set(file,out);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,exports){'+code+'})',{URL,URLSearchParams})(n=>require('./helpers/timeline-dependency-loader.cjs').timelineDependency(n)??(n==='./feishu'?{AppError:class extends Error{}}:load(path.resolve(path.dirname(file),n+'.ts'))),out);return out;}
const {historicalRosterMembers,memberAffiliationLabel}=load('lib/idol/member-affiliation.ts'),{projectArtistCatalog}=load('lib/idol/artist-catalog.ts'),{artistRoute,artistRouteUrl,artistWorkUrl}=load('lib/idol/artist-preview.ts'),{safeArtistReturn}=load('lib/idol/artist-navigation.ts'),{memberWorks,memberWorkSummary}=load('lib/idol/member-works.ts'),{groupCollection}=load('lib/idol/group-detail.ts');
const read=p=>JSON.parse(fs.readFileSync(p)),plain=x=>JSON.parse(JSON.stringify(x));
const snapshot=read('data/snapshot.json');const members=snapshot.tables.members.records.map(r=>({id:r.recordId,stageName:r.fields.fld1jPwSAP||'',name:r.fields.fld1jPwSAP||'',cnName:'',groupIds:(r.fields.fld6bhQOdO||[]).map(g=>g.recordId),formerGroupIds:(r.fields.fldf1alCIu||[]).map(g=>g.recordId),photo:{table:'members',recordId:r.recordId,index:0},status:'',birthDate:'',country:'',role:'',profile:'',note:'',favorite:null,officialUrl:''}));
const seed=read('tests/fixtures/candidate37.synthetic.json');
function scenario(slug){const c=read(`data/${slug}-artist.json`),data={...seed,members,ratings:[],works:[]};return {c,data};}
const harness=fs.readFileSync('tests/candidate-density.test.cjs','utf8').split('for(const [slug,count]')[0],ctx={require,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout};vm.runInNewContext(harness+';globalThis.renderCandidate=renderer;',ctx);
for(const [slug,current,total] of [['loona',11,12],['everglow',4,6],['kep1er',6,9]])test(`${slug} current ${current}, history ${total}: real IDs deduplicated and SSR scopes explicit`,()=>{
 const {c,data}=scenario(slug),before=JSON.stringify(data);
 for(const [history,count] of [[false,current],[true,total]]){
  assert.equal(historicalRosterMembers(data.members,c.groupId,history).length,count);
  const html=ctx.renderCandidate(projectArtistCatalog(data,c.groupId),`/artists/${slug}?section=members${history?'&roster=history':''}`).render(c);
  const pattern=slug==='everglow'?/data-member-id="([^"]+)"/g:/data-artist-member-trigger="([^"]+)"/g;
  const ids=[...html.matchAll(pattern)].map(x=>x[1]),expected=slug==='loona'?total:count;
  assert.equal(ids.length,expected);assert.equal(new Set(ids).size,expected);
  assert.deepEqual(ids.slice().sort(),plain(historicalRosterMembers(data.members,c.groupId,slug==='loona'||history).map(m=>m.id)).sort());
  assert.doesNotMatch(html,/已核实离团日期/);
  if(slug==='loona'){
   assert.match(html,/历史成员/);assert.match(html,/十二位成员/);assert.match(html,/全部 12 人/);
  }else if(slug==='everglow'){
   assert.match(html,/官网四位成员与历史档案分开展示/);assert.match(html,/官网四人/);assert.match(html,/历来六人/);
  }else{
   assert.match(html,/历史成员/);assert.match(html,/现有关联/);assert.match(html,/份档案/);
   if(history)assert.match(html,/历来关联成员，含现有和曾属记录/);
  }
 }
 assert.equal(JSON.stringify(data),before);assert.equal(groupCollection(data,data.groups.find(g=>g.id===c.groupId)).members.length,current);
});
test('union uses stable ID not names and does not expand unrelated artists',()=>{const {c}=scenario('loona');const a={...members[0],id:'recA',stageName:'SAME',groupIds:[c.groupId],formerGroupIds:[c.groupId]},b={...a,id:'recB',groupIds:[]};assert.equal(historicalRosterMembers([a,b,a],c.groupId,true).length,2);assert.equal(historicalRosterMembers([a,b,a],c.groupId,false).length,1);assert.equal(historicalRosterMembers([{...b,formerGroupIds:['other']}],'other',true).length,0);assert.equal(memberAffiliationLabel(b,c.groupId),'历史成员 · 曾属本团');});
test('history API projection includes former solo/collaboration work and exact personal summaries without writes',()=>{const {c,data}=scenario('loona'),chuu=members.find(m=>m.id==='recvxyICzHTm4b'),base=seed.works[0];data.works=[{...base,id:'recSolo',groupIds:['recOther'],score:0}];data.ratings=[{id:'recSynthetic',memberIds:[chuu.id],workIds:['recSolo'],score:0,stylingScore:null,photo:null,note:'synthetic private note',memory:'synthetic memory'}];data.groups=[...data.groups,{id:'recOther',name:'Other'}];const before=JSON.stringify(data),p=projectArtistCatalog(data,c.groupId);assert.ok(p.members.some(m=>m.id===chuu.id));assert.ok(p.works.some(w=>w.id==='recSolo'));assert.deepEqual(plain(memberWorks(p,chuu.id)),plain(memberWorks(data,chuu.id)));assert.deepEqual(plain(memberWorkSummary(memberWorks(p,chuu.id))),plain(memberWorkSummary(memberWorks(data,chuu.id))));assert.equal(JSON.stringify(data),before);});
test('only three artist routes preserve history through work return and reject unsafe variants',()=>{for(const slug of ['loona','everglow','kep1er']){const base=`/artists/${slug}`,url=base+'?roster=history&section=members&member=recvxyICzHTm4b&queue=unrated&q=word&format=stage';const r=artistRoute(url);assert.equal(r.roster,'history');assert.equal(artistRoute(artistRouteUrl(r,base)).roster,'history');assert.ok(safeArtistReturn(url));const work=artistWorkUrl({id:'recWork'},true,url);assert.ok(decodeURIComponent(work).includes('roster=history'));for(const bad of ['roster=current','roster=unknown','roster=history&roster=history'])assert.equal(safeArtistReturn(base+'?'+bad),null);}assert.equal(safeArtistReturn('/artists/izna?roster=history'),null);assert.equal(artistRoute('/artists/izna?roster=history').roster,undefined);assert.equal(safeArtistReturn('https://evil.test/artists/loona?roster=history'),null);});
test('former portraits follow the current artist contract; known EVERGLOW archive links remain reachable and other fallbacks stay scoped',()=>{
 const everglow=read('data/everglow-public.json');
 for(const [slug,id] of [['everglow','recvxyICzHtX1e'],['everglow','recvxyICzH3DKT'],['kep1er','recvxyICzHHBnl'],['loona','recvxyICzHTm4b'],['kep1er','rec28ldbniBgam'],['kep1er','rec28ldbniBgvC']]){
  const {c,data}=scenario(slug),projected=projectArtistCatalog(data,c.groupId),url=`/artists/${slug}?section=members&member=${id}`;
  const direct=ctx.renderCandidate(projected,url).render(c),html=ctx.renderCandidate(projected,url+'&roster=history').render(c);
  if(slug==='everglow'){
   // The approved archive uses explicit editorial membership, not the retired
   // candidate renderer's requirement for a roster query on a known profile.
   const portrait=everglow.members.find(m=>m.id===id);assert.ok(portrait?.historical);
   for(const page of [direct,html]){
    assert.match(page,/历史成员档案/);assert.doesNotMatch(page,/这个成员不在本团档案中/);
    assert.ok(page.includes(portrait.cnName));assert.ok(page.includes(portrait.image));
    assert.match(page,/照片来源/);assert.ok(page.includes(portrait.sourceUrl.replaceAll('&','&amp;')));
    assert.match(page,/返回成员目录/);assert.ok(page.includes('roster=history'));
   }
  }else{
   if(slug==='loona')assert.match(direct,/历史成员 · 曾属本团/);else assert.match(direct,/这个成员不在本团档案中/);
   assert.match(html,/历史成员 · 曾属本团/);
   if(slug==='loona'){
    assert.ok(html.includes('/artist/loona/approved-home/chuu.jpg'));assert.match(html,/图片来源/);
   }else if(c.portraits[id]){
    assert.ok(html.includes(c.portraits[id].image));assert.match(html,/图片来源/);assert.ok(html.includes(c.portraits[id].sourceUrl.replaceAll('&','&amp;')));
   }else{
    assert.ok(html.includes(`/api/media?table=members&amp;record=${id}`));assert.ok(!html.includes('/artist/madein/'));
   }
  }
 }
 const {c,data}=scenario('everglow');
 for(const id of ['recForeignArchive','__proto__']){
  const page=ctx.renderCandidate(projectArtistCatalog(data,c.groupId),`/artists/everglow?section=members&member=${id}`).render(c);
  assert.match(page,/未找到此内容/);assert.doesNotMatch(page,/MEMBER PROFILE|历史成员档案/);
 }
});
