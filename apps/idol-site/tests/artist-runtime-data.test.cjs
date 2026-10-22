const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');

const names=['hearts2hearts-figma-assets.json','billlie-figma-catalog.json','idle-design-public.json'];
const read=name=>JSON.parse(fs.readFileSync('data/'+name));
test('generated runtime projections are fresh and preserve authoritative originals',async()=>{
 const {generate,projections}=await import('../scripts/build-artist-runtime-data.mjs');
 generate({check:true});
 for(const name of names)assert.deepEqual(read('runtime/'+name),projections[name](read(name)));
 assert.ok(read(names[0]).assets.every(asset=>asset.sourceSha256));
 assert.ok(Object.values(read(names[2]).assets).every(asset=>asset.sha256));
});
test('runtime projections retain exact image/video identities and remove unused evidence only',()=>{
 const h=read('runtime/'+names[0]);assert.deepEqual(Object.keys(h),['members','heroImage','releaseImages']);
 const full=read(names[1]),b=read('runtime/'+names[1]);assert.deepEqual(b.members,full.members);
 for(let i=0;i<b.works.length;i++){assert.equal(b.works[i].id,full.works[i].id);for(const kind of ['mv','stage'])if(b.works[i][kind])assert.deepEqual(b.works[i][kind],{id:full.works[i][kind].id,src:full.works[i][kind].src});}
 const idle=read('runtime/'+names[2]),original=read(names[2]);for(const key of ['members','releases','media','nativeMediaIds'])assert.deepEqual(idle[key],original[key]);
 for(const [key,asset]of Object.entries(idle.assets)){assert.deepEqual(Object.keys(asset),['src','width','height','alt']);for(const field of Object.keys(asset))assert.equal(asset[field],original.assets[key][field]);}
});
function harness(file,suffix,original){
 const wrappedFs={...fs,readFileSync(file,...args){const value=String(file);return fs.readFileSync(original?value.replace(/data\/runtime\//g,'data/'):file,...args);}};
 const localRequire=name=>name==='node:fs'||name==='fs'?wrappedFs:require(name.startsWith('./')?path.resolve('tests',name):name);
 const context={require:localRequire,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout};
 const code=fs.readFileSync(file,'utf8').split(/\ntest\(/)[0];
 vm.runInNewContext(code+'\n'+suffix,context);return context;
}
test('H2H and i-dle render identical HTML with full evidence or runtime projection',()=>{
 for(const [file,slug]of [['tests/hearts2hearts-figma.test.cjs','hearts2hearts'],['tests/idle-verified-design.test.cjs','idle']]){
  const before=harness(file,'globalThis.renderPage=render;',true),after=harness(file,'globalThis.renderPage=render;',false);
  const data=read(slug==='idle'?names[2]:names[0]);
  const routes=['','?section=members','?section=works','?section=records','?section=updates',...data.members.map(m=>'?section=members&member='+m.id)];
  if(slug==='idle')routes.push(...data.releases.map(r=>'?section=records&release='+r.id),'?section=works&media=idle-stage-kbs-music-bank-20220318-tomboy');
  else routes.push('?section=records&release=iconic-heart','?section=records&release=moonride');
  for(const route of routes)assert.equal(after.renderPage('/artists/'+slug+route),before.renderPage('/artists/'+slug+route),slug+route);
 }
});
test('Billlie renders identical HTML and video decisions with full evidence or runtime projection',()=>{
 const before=harness('tests/billlie-figma-design.test.cjs','globalThis.renderPage=render;globalThis.scene=scene;',true),after=harness('tests/billlie-figma-design.test.cjs','globalThis.renderPage=render;globalThis.scene=scene;',false);
 const {c,data}=before.scene();const design=read(names[1]);
 const routes=['','?section=members','?section=works','?section=works&format=mv','?section=works&format=stage','?section=updates',...design.members.map(m=>'?section=members&member='+m.id),...design.releases.map(r=>'?section=works&release='+encodeURIComponent(r.id))];
 for(const route of routes)assert.equal(after.renderPage(c,data,'/artists/billlie'+route),before.renderPage(c,data,'/artists/billlie'+route),route);
});
test('primary detail images receive high-priority scheduling without layout changes',()=>{
 const idle=fs.readFileSync('components/candidate/idle-design.tsx','utf8'),h=fs.readFileSync('components/hearts2hearts-artist.tsx','utf8');
 assert.ok(idle.includes("fetchPriority={priority?'high':'auto'}"));
 assert.ok(h.includes('alt={`${selectedRelease.title} 发行封面`} priority/>'));
});

const careerSources={
 'source-ids.json':['source-index.json','81203903cadb8abcc6a30bd20b9c24e934eb2f421594c85662f67c90ce3e0506'],
 'trusted-hashes.json':['adoption-ledger.json','69b8258cf792197db0c96c22f4f26447ebfa5dc13e56a31508bda3bc58186e07'],
 'accepted-claims.json':['canonical.json','7197872dd2897a0bfef51b66ceb5720ab90b9a856094ab2aa72314e9a6176fd1'],
};
const evidencePath=name=>'research/member-careers/data/'+name;
const sha256=file=>require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('career guard projections equal original expressions and generation preserves evidence bytes',async()=>{
 const {generate,projections}=await import('../scripts/build-artist-runtime-data.mjs');
 const originals=Object.fromEntries(Object.entries(careerSources).map(([name,[file,expectedHash]])=>{
  assert.equal(sha256(evidencePath(file)),expectedHash,file);
  return [name,JSON.parse(fs.readFileSync(evidencePath(file)))];
 }));
 const expected={
  'source-ids.json':originals['source-ids.json'].sources.map(s=>s.sourceId),
  'trusted-hashes.json':Object.fromEntries(originals['trusted-hashes.json'].records.map(c=>[c.id,c.adoptedClaimHash])),
  'accepted-claims.json':originals['accepted-claims.json'].memberClaims.filter(c=>c.kind==='member_patch'&&['accepted','accepted_with_revision'].includes(c.decision)),
 };
 generate();generate({check:true});
 for(const [name,[file,expectedHash]]of Object.entries(careerSources)){
  assert.deepEqual(projections['member-careers/'+name](originals[name]),expected[name]);
  assert.deepEqual(read('runtime/member-careers/'+name),expected[name]);
  assert.equal(sha256(evidencePath(file)),expectedHash,file);
 }
});
test('career projections preserve unsorted duplicate source IDs, last hash wins, full accepted objects and order',async()=>{
 const {projections}=await import('../scripts/build-artist-runtime-data.mjs');
 const project=name=>projections['member-careers/'+name+'.json'];
 assert.deepEqual(project('source-ids')({sources:[{sourceId:'z'},{sourceId:'a'},{sourceId:'z'}]}),['z','a','z']);
 const hashes=project('trusted-hashes')({records:[{id:'z',adoptedClaimHash:'old'},{id:'a',adoptedClaimHash:'other'},{id:'z',adoptedClaimHash:'new'}]});
 assert.deepEqual(hashes,{z:'new',a:'other'});assert.deepEqual(Object.keys(hashes),['z','a']);
 const first={id:'z',kind:'member_patch',decision:'accepted_with_revision',sourceIds:['b','a'],extra:{all:['properties',1]}},last={id:'a',kind:'member_patch',decision:'accepted',beforePublicHash:'hash',other:null};
 const claims=project('accepted-claims')({memberClaims:[first,{id:'rejected',kind:'member_patch',decision:'rejected'},{id:'overlay',kind:'display_overlay',decision:'accepted'},last,first]});
 assert.deepEqual(claims,[first,last,first]);assert.equal(claims[0],first);assert.equal(claims[1],last);
});
test('career projection check rejects stale bytes without silently regenerating and build retains mandatory check',async()=>{
 const {generate}=await import('../scripts/build-artist-runtime-data.mjs');
 for(const name of Object.keys(careerSources)){
  const file='data/runtime/member-careers/'+name,original=fs.readFileSync(file);
  try{fs.writeFileSync(file,'[]\n');assert.throws(()=>generate({check:true}),/Stale runtime data/);assert.equal(fs.readFileSync(file,'utf8'),'[]\n');}
  finally{fs.writeFileSync(file,original);}
 }
 generate({check:true});
 assert.match(JSON.parse(fs.readFileSync('package.json')).scripts.build,/^node scripts\/build-artist-runtime-data\.mjs --check && /);
});
test('full career evidence is absent from application imports and guard projections stay outside client graphs',()=>{
 const ts=require('typescript'),root=process.cwd(),files=[];
 function walk(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.[cm]?[jt]sx?$/.test(file))files.push(path.resolve(file));}}
 for(const dir of ['app','components','lib','db','build'])walk(dir);
 const originals=new Set(Object.values(careerSources).map(([file])=>path.resolve(evidencePath(file))));
 const generated=new Set(Object.keys(careerSources).map(name=>path.resolve('data/runtime/member-careers/'+name)));
 const graph=new Map(),clients=[];
 function resolve(from,specifier){
  const base=specifier.startsWith('@/')?path.join(root,specifier.slice(2)):specifier.startsWith('.')?path.resolve(path.dirname(from),specifier):null;
  if(!base)return null;
  return [base,...['.ts','.tsx','.js','.mjs','.cjs','.json','/index.ts','/index.tsx','/index.js'].map(ext=>base+ext)].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
 }
 for(const file of files){
  const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  if(ast.statements.some(statement=>ts.isExpressionStatement(statement)&&ts.isStringLiteral(statement.expression)&&statement.expression.text==='use client'))clients.push(file);
  const imports=ts.preProcessFile(source,true,true).importedFiles.map(ref=>resolve(file,ref.fileName)).filter(Boolean);
  graph.set(file,imports);
  for(const target of imports){assert.ok(!originals.has(target),'Full evidence imported by '+path.relative(root,file));if(generated.has(target))assert.equal(file,path.resolve('lib/idol/member-careers.ts'));}
 }
 assert.deepEqual(graph.get(path.resolve('lib/idol/member-careers.ts')).filter(file=>generated.has(file)).sort(),[...generated].sort());
 assert.ok(clients.length>0);
 for(const client of clients){
  const seen=new Set(),pending=[client];
  while(pending.length){const file=pending.pop();if(seen.has(file))continue;seen.add(file);assert.ok(!generated.has(file),'Guard projection reachable from client '+path.relative(root,client));pending.push(...(graph.get(file)||[]));}
 }
});
