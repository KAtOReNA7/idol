// node docs/codex/qa/native-catalog-cold-cost.cjs
// Independent local D1 and fictional member/score records; no production bindings or snapshot import.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire, Module} = require('node:module');
const {performance} = require('node:perf_hooks');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const app = path.join(root, 'apps/idol-site');
const appRequire = createRequire(path.join(app, 'package.json'));
const {Miniflare, convertV4MiniflareOptions} = appRequire('miniflare');
const {build} = appRequire('esbuild');
const owner = 'synthetic-benchmark-owner', snapshot = 'synthetic-benchmark-snapshot';
const workId = 'rec28ldfRTrH9V';
const registry = appRequire('./HANDOFF/artist-registry51.json');
const inventory = appRequire('./data/stages/inventory.json').works;
const counts = {groups:51,members:338,works:614,ratings:2828};
let active;
const round = value => Number(value.toFixed(2));
function record(label, elapsed) {
  if (active) (active[label] ??= []).push(elapsed);
}
function time(label, fn) {
  if (!active) return fn();
  const start = performance.now();
  const result = fn();
  if (result?.then) return result.finally(() => record(label, performance.now()-start));
  record(label, performance.now()-start);
  return result;
}
function wrapDB(db) {
  return {prepare(sql) {
    const label = sql.includes('AS catalog_generation') ? 'generationSql'
      : sql.includes('FROM idol_native_snapshots') ? 'snapshotSql'
      : sql.includes('FROM idol_native_fields') ? 'schemaSql'
      : sql.includes('FROM idol_native_records') ? 'rowsSql'
      : sql.includes('FROM idol_personal_mv_ratings') ? 'personalSql' : null;
    if (!label) throw Error('Unexpected benchmark SQL');
    function tracked(statement) {
      return {
        bind: (...values) => tracked(statement.bind(...values)),
        first: (...args) => time(label, () => statement.first(...args)),
        all: (...args) => time(label, () => statement.all(...args)),
      };
    }
    return tracked(db.prepare(sql));
  }};
}
function change(source, from, to) {
  assert.equal(source.split(from).length, 2, 'Benchmark source marker: '+from);
  return source.replace(from,to);
}
async function loadReader(db, skipUnrelatedPhotoReview=false) {
  const bundle = await build({absWorkingDir:app, stdin:{resolveDir:app, contents:`
    export {withNativeCatalog} from './lib/idol/native-reader';
    export {personalMvRatingsForOwner} from './lib/idol/personal-mv-ratings';
    export {findDetailWork,projectWorkCatalog} from './lib/idol/work-catalog';
    export {projectBrowserCatalog,withoutStageCandidates} from './lib/idol/browser-catalog';
    export {F} from './lib/idol/fields';
    export {projectCatalog} from './lib/idol/catalog';
  `},bundle:true,format:'cjs',platform:'node',write:false,logLevel:'silent',
  external:['cloudflare:workers','server-only'],plugins:[{name:'local-catalog-stage-timings',setup(esbuild) {
    esbuild.onResolve({filter:/^\.\/snapshot-fallback$/},()=>({path:'unused',namespace:'no-fallback'}));
    esbuild.onLoad({filter:/.*/,namespace:'no-fallback'},()=>({contents:"export function loadFallbackSnapshot(){throw Error('Unexpected non-native read');}"}));
    esbuild.onLoad({filter:/[\\/]native-reader\.ts$/}, ({path:source}) => {
      let code = fs.readFileSync(source,'utf8');
      code = change(code,'await nativeTables(before.state.active_snapshot!,step=>{progress.step=step;})',
        "await globalThis.catalogBenchTime('nativeTables',()=>nativeTables(before.state.active_snapshot!,step=>{progress.step=step;}))");
      code = change(code,"const catalog=withGroupMilestones(withVerifiedVersionDisplay(projectCatalog(tables,'live',new Date().toISOString()),tables));",
        "const base=globalThis.catalogBenchTime('projectCatalog',()=>projectCatalog(tables,'live',new Date().toISOString()));"+
        "const reviewed=globalThis.catalogBenchTime('verifiedVersions',()=>withVerifiedVersionDisplay(base,tables));"+
        "const catalog=globalThis.catalogBenchTime('milestones',()=>withGroupMilestones(reviewed));");
      code = change(code,'await withSocialFacts(catalog,tables)',"await globalThis.catalogBenchTime('socialFacts',()=>withSocialFacts(catalog,tables))");
      return {contents:code,resolveDir:path.dirname(source),loader:'ts'};
    });
    esbuild.onLoad({filter:/[\\/]native-storage\.ts$/}, ({path:source}) => {
      let code=fs.readFileSync(source,'utf8');
      code=change(code,'const result={} as NativeTables;', 'const started=performance.now(); const result={} as NativeTables;');
      code=change(code,"return result;\n }catch(error){onFailure?.('table-decode');",
        "globalThis.catalogBenchRecord('decodeTables',performance.now()-started);return result;\n }catch(error){onFailure?.('table-decode');");
      return {contents:code,resolveDir:path.dirname(source),loader:'ts'};
    });
    esbuild.onLoad({filter:/[\\/]lib[\\/]idol[\\/]catalog\.ts$/}, ({path:source}) => {
      let code=fs.readFileSync(source,'utf8');
      if(skipUnrelatedPhotoReview) code=change(code,
        'if(!Array.isArray(raw))return {photo:legacy};',
        "if(!Array.isArray(raw)||!raw.some(attachment=>attachment?.source_kind==='mv_look_photo'))return {photo:legacy};");
      const starts=[
        ['const members=t.members.records.map(',null],['const ratings=t.ratings.records.map(','membersProjection'],
        ['const ratingIdsByWork = new Map','ratingsProjection'],['const works=t.works.records.map(','ratingIndex'],
        ['const groups=t.groups.records.map(','worksProjection'],['const rated=works.filter(x=>x.score!==null);return','groupsProjection'],
      ];
      for(const [operation,previous] of starts) {
        code=change(code,operation,(previous?"globalThis.catalogBenchRecord('"+previous+"',performance.now()-sectionStart);sectionStart=performance.now();":'let sectionStart=performance.now();')+operation);
      }
      for(const [key,call] of [['stageSupplements','stageSupplementForWork(r.recordId)'],['stageSources','stageForWork(r.recordId)']]) {
        code=change(code,call,"globalThis.catalogBenchTime('"+key+"',()=>"+call+")");
      }
      return {contents:code,resolveDir:path.dirname(source),loader:'ts'};
    });
  }}]});
  const filename=path.join(app,'native-catalog-local-benchmark.cjs'),compiled=new Module(filename,module);
  compiled.filename=filename;
  compiled.require=name=>name==='cloudflare:workers'?{env:{DB:wrapDB(db)}}:name==='server-only'?{}:appRequire(name);
  compiled._compile(bundle.outputFiles[0].text,filename);
  return compiled.exports;
}
async function seed(db, fields) {
  for (const file of fs.readdirSync(path.join(app,'drizzle')).filter(f=>f.endsWith('.sql')).sort()) {
    const sql=fs.readFileSync(path.join(app,'drizzle',file),'utf8').split('--> statement-breakpoint');
    await db.batch(sql.map(s=>db.prepare(s.trim())));
  }
  await db.prepare("INSERT INTO idol_storage_control VALUES('main',?,'native',1,?,NULL,0)").bind(owner,snapshot).run();
  await db.prepare('INSERT INTO idol_catalog_state(user_id,generation) VALUES(?,0)').bind(owner).run();
  await db.prepare("INSERT INTO idol_native_snapshots VALUES(?,?,'complete','2026-11-22','test','{}',0)").bind(snapshot,owner).run();
  const memberIds=Array.from({length:counts.members},(_,i)=>'recSyntheticMember'+i);
  const membersByGroup=registry.map((_,group)=>memberIds.filter((_,i)=>i%registry.length===group));
  const workMembers=inventory.map(w=>membersByGroup[registry.findIndex(g=>w.groupIds.includes(g.groupId))]);
  const entries=[];
  const add=(table,id,values)=>{
    const cells=Object.fromEntries(Object.entries(values).map(([name,value])=>[fields[table][name],value]));
    entries.push({table,id,serialized:JSON.stringify(cells)});
  };
  registry.forEach((g,i)=>add('groups',g.groupId,{name:g.name,members:membersByGroup[i],works:inventory.filter(w=>w.groupIds.includes(g.groupId)).map(w=>w.recordId)}));
  memberIds.forEach((id,i)=>add('members',id,{name:'Synthetic member '+i,groups:[registry[i%registry.length].groupId]}));
  inventory.forEach(w=>add('works',w.recordId,{name:w.name,song:w.song,groups:w.groupIds,version:w.version,url:typeof w.mv==='string'?w.mv:w.mv?.url??''}));
  for(let i=0;i<counts.ratings;i++) {
    const index=i%inventory.length,cast=workMembers[index];
    add('ratings','recSyntheticRating'+i,{name:'Synthetic rating '+i,works:[inventory[index].recordId],members:[cast[Math.floor(i/inventory.length)%cast.length]],score:i%11,stylingScore:i%10});
  }
  for(const [table,count] of Object.entries(counts)) {
    assert.equal(entries.filter(r=>r.table===table).length,count);
    const schema=Object.entries(fields[table]).map(([name,id])=>({field_id:id,field_name:name,type:1}));
    await db.prepare('INSERT INTO idol_native_fields VALUES(?,?,?,?)').bind(snapshot+':'+table,snapshot,table,JSON.stringify(schema)).run();
  }
  const insert='INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,updated_at,version,source_order) VALUES(?,?,?,?,?,\'synthetic\',0,1,?)';
  for(let i=0;i<entries.length;i+=100) {
    await db.batch(entries.slice(i,i+100).map((r,idx)=>db.prepare(insert).bind(snapshot+':'+r.table+':'+r.id,snapshot,r.table,r.id,r.serialized,i+idx)));
  }
  const tables=Object.fromEntries(Object.keys(counts).map(table=>[table,{fields:[],records:entries
    .filter(r=>r.table===table).map(r=>({recordId:r.id,fields:JSON.parse(r.serialized)}))}]));
  return {tables,syntheticRowBytes:entries.reduce((total,entry)=>total+Buffer.byteLength(entry.serialized),0)};
}
async function run(api,force) {
  active={};
  const start=performance.now(),trace={},request=new Request('https://local.test/api/catalog?shape=display-v1');
  const result=await api.withNativeCatalog(owner,force,async(catalog,control)=>{
    const work=api.findDetailWork(catalog,workId);
    assert.ok(work);
    const personal=await time('personalSelection',()=>api.personalMvRatingsForOwner(owner,control,catalog,work.id));
    return {catalog,work,personal};
  },trace,request);
  const {catalog,work,personal}=result.value;
  const scoped=time('scopeWork',()=>api.projectWorkCatalog(catalog,work,personal.entries));
  const view=time('browserView',()=>api.withoutStageCandidates(api.projectBrowserCatalog(scoped)));
  const json=time('serializeWork',()=>JSON.stringify({...view,personalMvRatings:personal}));
  assert.equal(view.scope.workId,workId);
  const timings=Object.fromEntries(Object.entries(active).map(([name,values])=>[name,round(values.reduce((a,b)=>a+b,0))]));
  const counts=Object.fromEntries(Object.entries(active).map(([name,values])=>[name,values.length]));
  active=null;
  return {cache:trace.cache,totalMs:round(performance.now()-start),timings,operationCounts:counts,scopeCount:scoped.works.length,responseBytes:Buffer.byteLength(json)};
}
function summarize(rows) {
  const labels=Object.keys(rows[0].timings),median=values=>values.slice().sort((a,b)=>a-b)[Math.floor(values.length/2)];
  return {totalMs:median(rows.map(r=>r.totalMs)),timingsMs:Object.fromEntries(labels.map(k=>[k,median(rows.map(r=>r.timings[k]))])),
    operationCounts:rows[0].operationCounts};
}
async function probeSnapshotRoundTrip(db) {
  const control="SELECT c.*, g.generation AS catalog_generation FROM idol_storage_control c LEFT JOIN idol_catalog_state g ON g.user_id = c.owner_id WHERE c.id = 'main'";
  const combined=control.replace('FROM idol_storage_control',
    ', EXISTS(SELECT 1 FROM idol_native_snapshots s WHERE s.id=c.active_snapshot AND s.owner_id=c.owner_id) AS snapshot_exists FROM idol_storage_control');
  const snapshotRow=(id,ownerId)=>db.prepare('SELECT captured_at FROM idol_native_snapshots WHERE id=? AND owner_id=?').bind(id,ownerId).first();
  const exists=(id,ownerId)=>db.prepare('SELECT EXISTS(SELECT 1 FROM idol_native_snapshots WHERE id=? AND owner_id=?) AS present').bind(id,ownerId).first('present');
  for(const [id,ownerId,expected] of [[snapshot,owner,true],['missing',owner,false],[snapshot,'other-owner',false]]) {
    assert.equal(Boolean(await snapshotRow(id,ownerId)),expected);
    assert.equal(Boolean(await exists(id,ownerId)),expected);
  }
  async function measure(kind) {
    const start=performance.now();
    let row=await db.prepare(kind==='combined'?combined:control).first();
    let valid;
    if(kind==='separate') valid=Boolean(await snapshotRow(row.active_snapshot,row.owner_id));
    if(kind==='combined') {
      valid=Boolean(row.snapshot_exists);
      const {snapshot_exists:_,...original}=row;
      row=original;
    }
    const elapsed=round(performance.now()-start);
    if(kind!=='control')assert.equal(valid,true);
    return {elapsed,row};
  }
  const timings={separate:[],combined:[],control:[]};
  let expected;
  for(let i=0;i<13;i++) {
    const order=['separate','combined','control'];
    for(let j=0;j<3;j++) {
      const kind=order[(i+j)%order.length],{elapsed,row}=await measure(kind);
      expected??=row;
      assert.deepEqual(row,expected);
      if(i>=2)timings[kind].push(elapsed);
    }
  }
  return {method:'Separate first generation/owner SELECT followed by snapshot SELECT versus the same first SELECT with a correlated owner-bound EXISTS; control is the first SELECT alone. Two warm-ups then 11 rotation-balanced passes. No later fence or owner checks removed. Real production remote latency not simulated.',
    allControlFieldsEqual:true,missingAndWrongOwnerRejected:true,
    mediansMs:Object.fromEntries(Object.entries(timings).map(([k,a])=>[k,[...a].sort((x,y)=>x-y)[5]])),samplesMs:timings};
}
function probeRatingPhotoReview(api,candidate,tables) {
  const F=api.F,coverage={unchangedReviewPath:0,ordinaryStills:0,noAttachment:0};
  tables.ratings.records.forEach((r,i)=>{
    if(i%5===0){coverage.noAttachment++;return;}
    const video=inventory[i%inventory.length].mv, work=r.fields[F.ratings.works][0],member=r.fields[F.ratings.members][0];
    // Synthetic attachment metadata only. No file is read or fetched.
    const still={source_kind:'mv_still',file_token:'native_photo_'+'1'.repeat(64),work_id:work,member_id:member,exact_video_id:video?.videoId??''};
    if(i%5===1){coverage.unchangedReviewPath++;r.fields[F.ratings.photo]=[{source_kind:'mv_look_photo'},still];}
    else {coverage.ordinaryStills++;r.fields[F.ratings.photo]=[still];}
  });
  const read=projector=>projector.projectCatalog(tables,'live','2026-11-22T00:00:00Z');
  const base=read(api),variant=read(candidate);
  assert.deepEqual({...variant,loadedAt:''},{...base,loadedAt:''});
  const samples={baseline:[],candidate:[]};
  for(let i=0;i<11;i++) {
    for(const label of i%2?['candidate','baseline']:['baseline','candidate']) {
      const start=performance.now();
      read(label==='baseline'?api:candidate);
      if(i>=2)samples[label].push(round(performance.now()-start));
    }
  }
  const medians=Object.fromEntries(Object.entries(samples).map(([key,values])=>[key,[...values].sort((a,b)=>a-b)[4]]));
  return {method:'Pure full projectCatalog CPU. Both implementations use identical synthetic photo metadata and public work identities. Nine alternating measured pairs after two warm-ups. Only the in-memory benchmark variant skips the separate official-look approval scan when no attachment has source_kind mv_look_photo. Ordinary still identity checks still run. Production attachment mix is unknown.',
    coverage,fullOutputsEqualExceptLoadedAt:true,mediansMs:medians,samplesMs:samples};
}
(async()=>{
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){ return new Response(null); }}',
    host:'127.0.0.1',port:0,cf:false,compatibilityDate:'2026-11-01',d1Databases:{DB:'isolated-catalog-cost'},d1Persist:false}));
  globalThis.catalogBenchTime=time;
  globalThis.catalogBenchRecord=record;
  try {
    const db=await runtime.getD1Database('DB'),api=await loadReader(db),{syntheticRowBytes,tables}=await seed(db,api.F);
    const samples={cold:[],warm:[]};
    for(let i=0;i<9;i++) {
      const cold=await run(api,true),warm=await run(api,false);
      assert.equal(cold.cache,'miss');assert.equal(warm.cache,'hit');
      assert.equal(cold.responseBytes,warm.responseBytes);assert.equal(cold.scopeCount,warm.scopeCount);
      if(i>=2){samples.cold.push(cold);samples.warm.push(warm);}
    }
    const snapshotReadProbe=await probeSnapshotRoundTrip(db);
    const ratingPhotoProbe=probeRatingPhotoReview(api,await loadReader(db,true),tables);
    const result={runAt:new Date().toISOString(),node:process.version,platform:process.platform,counts,syntheticRowBytes,fixture:'Public group registry and work inventory; synthetic members and score rows, no personal MV score entries and no fallback or production database.',
      method:'Two discarded warm-up pairs then seven cold/warm pairs. Native projection is forced on cold requests. D1 statements run in a temporary Miniflare D1, application logic runs in the same Node process with monotonic instrumentation. nativeTables includes schema/rows and decode; schema and row statements run in parallel. personalSelection includes personalSql. Local bridge, dataset shape and execution differ from production.',
      medians:{cold:summarize(samples.cold),warm:summarize(samples.warm)},samples,snapshotReadProbe,ratingPhotoProbe};
    console.log('CATALOG_COST '+JSON.stringify(result));
  } finally {delete globalThis.catalogBenchTime;delete globalThis.catalogBenchRecord;await runtime.dispose();}
})().catch(error=>{console.error(error);process.exitCode=1;});
