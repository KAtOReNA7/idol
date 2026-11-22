const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {Miniflare, convertV4MiniflareOptions} = require('miniflare');
const {build} = require('esbuild');
const {currentDetail, turn, input, change, posts} = require('./helpers/current-work-detail.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {EDITABLE, F} = load('lib/idol/fields.ts');
const {hash} = load('lib/idol/hash.ts');
const root = path.join(__dirname, '..');
const snapshot = 'detail-test';
const records = [
  ['The Chase', 'rec28ldfRTrzDX'], ['RING X RING', 'recvxyH5pzBi6D'],
  ['TOMBOY', 'recvxyOz5XuYef'], ['Attention', 'recvxyOz5X2J0A'],
  ['Butterfly', 'recvxyOz5X7G95'], ['Girls Never Die', 'rec28ldfRTrCjG'],
];
let runtime, db;

before(async () => {
  // Only this ephemeral D1 is bound. The local worker uses a synthetic owner.
  const ownerEmail = fs.readFileSync(path.join(root, 'lib/idol/http.ts'), 'utf8').match(/toLowerCase\(\)!=='([^']+)'/)[1];
  const bundle = await build({
    stdin: {resolveDir: root, contents: `
      import {env,withEnv} from 'cloudflare:workers';
      import {readNativeDetail} from './lib/idol/native-reader';
      import {saveNativeRecord} from './lib/idol/native-save';
      import {GET as readCatalog} from './app/api/catalog/route';
      import {AppError} from './lib/idol/feishu';
      const logError = console.error.bind(console);
      console.error = (...args) => {
        if (env.TEST_CATALOG_TRACE && args.length===1 && typeof args[0]==='string') {
          const event=JSON.parse(args[0]);
          if(event.event==='idol_catalog_read_failed'){env.TEST_CATALOG_TRACE.push(event);return;}
        }
        logError(...args);
      };
      export default {async fetch(request) {
        const url = new URL(request.url);
        try {
          if (url.pathname === '/test/leave-catalog') {
            // End this real workerd invocation while its native cold read still has request-owned I/O.
            let markStarted;
            const started = new Promise(resolve => { markStarted = resolve; });
            const db = env.DB;
            const tracked = {prepare(sql) {
              const statement = db.prepare(sql);
              if (!sql.includes('FROM idol_native_records')) return statement;
              return {bind(...params) {
                const bound = statement.bind(...params);
                return {async all() {
                  const rows = await bound.all();
                  markStarted();
                  await scheduler.wait(30000);
                  return rows;
                }};
              }};
            }};
            const reading = withEnv({DB: tracked}, () => readCatalog(request));
            await Promise.race([started, reading.then(() => { throw Error('Cold table read did not start'); })]);
            return new Response(null, {status: 204});
          }
          if (url.pathname === '/api/catalog' && request.method === 'GET') {
            const fault=request.headers.get('X-Test-Fault');
            if (!fault && !request.headers.has('X-Test-Queries')) return readCatalog(request);
            const db=env.DB, statements=[];
            const events=[];
            let checks=0, failures=0;
            const tracked={prepare(sql){
              statements.push(sql);
              const point=sql.includes('AS catalog_generation') ? ['source-generation','cache-generation','response-generation'][checks++]
                : sql.includes('FROM idol_native_snapshots') ? 'snapshot'
                : sql.includes('FROM idol_native_fields') ? 'table-schema'
                : sql.includes('FROM idol_native_records') ? 'table-rows'
                : sql.includes('FROM idol_personal_mv_ratings') ? 'personal-ratings'
                : sql.includes('FROM idol_storage_control') ? 'public-control' : null;
              const warmFence=fault==='warm-final'&&point==='cache-generation';
              if(fault==='table-decode'&&point==='table-schema'){
                failures++;
                return db.prepare(sql.replace('table_key,fields_json',"table_key,'{' AS fields_json"));
              }
              if(fault && (point===fault||warmFence)){failures++;throw Error('synthetic opaque failure; private-marker');}
              return db.prepare(sql);
            }};
            const result=await withEnv({DB:tracked,TEST_CATALOG_TRACE:events,TEST_PUBLIC:request.headers.has('X-Test-Public')},()=>readCatalog(request));
            result.headers.set('X-Test-Queries',JSON.stringify(statements));
            if(fault){result.headers.set('X-Test-Events',JSON.stringify(events));result.headers.set('X-Test-Failures',String(failures));}
            return result;
          }
          if (url.pathname === '/api/records' && request.method === 'GET') {
            return Response.json(await readNativeDetail('test-owner', url.searchParams.get('table'), url.searchParams.get('id')));
          }
          if (url.pathname === '/api/save' && request.method === 'POST') {
            return Response.json(await saveNativeRecord('test-owner', await request.json()));
          }
          return new Response(null, {status: 404});
        } catch (e) {
          if (e instanceof AppError) return Response.json({error: e.code}, {status: e.status});
          throw e;
        }
      }};
    `},
    bundle: true, write: false, format: 'esm', platform: 'browser',
    external: ['cloudflare:workers'], logLevel: 'silent',
    plugins: [{name: 'isolated-catalog-reader', setup(build) {
      build.onResolve({filter: /^(server-only|@\/app\/chatgpt-auth)$/}, args => ({path: args.path, namespace: 'local-test'}));
      build.onLoad({filter: /.*/, namespace: 'local-test'}, args => ({contents: args.path === 'server-only' ? '' :
        'import {env} from "cloudflare:workers"; export const getChatGPTUser=async()=>env.TEST_PUBLIC?null:('+JSON.stringify({userId:'test-owner',email:ownerEmail})+');'}));
    }}],
  });
  runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true, script:bundle.outputFiles[0].text, host: '127.0.0.1', port: 0, cf: false,
    compatibilityDate: '2026-11-01', d1Databases: {DB: 'work-detail-tests'}, d1Persist: false,
  }));
  db = await runtime.getD1Database('DB');
  const migrations = fs.readdirSync(path.join(root, 'drizzle')).filter(f => f.endsWith('.sql')).sort();
  for (const file of migrations) {
    const statements = fs.readFileSync(path.join(root, 'drizzle', file), 'utf8').split('--> statement-breakpoint');
    await db.batch(statements.map(sql => db.prepare(sql.trim())));
  }
  await db.prepare("INSERT INTO idol_storage_control VALUES ('main', 'test-owner', 'native', 1, ?, NULL, 0)").bind(snapshot).run();
  await db.prepare("INSERT INTO idol_catalog_state (user_id,generation) VALUES ('test-owner',0)").run();
  await db.prepare("INSERT INTO idol_native_snapshots VALUES (?, 'test-owner', 'complete', '2026-11-22', 'test', '{}', 0)").bind(snapshot).run();
  for(const table of ['groups','members']) {
    await db.prepare("INSERT INTO idol_native_fields VALUES (?,?,?,'[]')").bind(snapshot+':'+table,snapshot,table).run();
  }
  await seed('groups','recGroup',{[F.groups.name]:'Synthetic group'});
  await seed('members','recMember',{[F.members.name]:'Synthetic member',[F.members.groups]:['recGroup']});
  for (const table of ['works', 'ratings']) {
    const fields = Object.entries(EDITABLE[table]).map(([name, def]) => ({
      field_id: def.id, field_name: name, type: def.types[0],
      ...(def.type === 'select' ? {property: {options: [{id: 'unwatched', name: '未观看'}]}} : {}),
    }));
    await db.prepare('INSERT INTO idol_native_fields VALUES (?,?,?,?)')
      .bind(snapshot + ':' + table, snapshot, table, JSON.stringify(fields)).run();
  }
});

after(async () => { if (runtime) await runtime.dispose(); });

async function seed(table, id, values) {
  const revision = await hash({snapshotId: snapshot, table, id, version: 1, fields: values});
  await db.prepare('INSERT INTO idol_native_records (key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at) VALUES (?,?,?,?,?,?,1,0)')
    .bind([snapshot, table, id].join(':'), snapshot, table, id, JSON.stringify(values), revision).run();
}

const read = (table, id) => runtime.dispatchFetch('http://localhost/api/records?table=' + table + '&id=' + id);
const post = body => runtime.dispatchFetch('http://localhost/api/save', {method: 'POST', body});
const catalogFor = id => runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1&refresh=1', {
  headers:{Prefer:'omit-stage-candidates, work-detail='+id},
});

test('owner detail GET reads fresh private scores between two generation checks, with one extra check to publish a cold catalog',async()=>{
  const workId='recCatalogDetail',videoId='abcdefghijk',memberId='recMember';
  await seed('works',workId,{[F.works.groups]:['recGroup'],[F.works.song]:'Synthetic MV',[F.works.url]:'https://youtu.be/'+videoId});
  await db.prepare('INSERT INTO idol_personal_mv_ratings (id,owner_id,snapshot_id,work_id,video_id,member_id,score,styling_score,revision) VALUES (?,?,?,?,?,?,0,NULL,1)')
    .bind('test-private-score','test-owner',snapshot,workId,videoId,memberId).run();
  async function checkQueries(tables,score,revision){
    const response=await runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1',{
      headers:{Prefer:'omit-stage-candidates, work-detail='+workId,'X-Test-Queries':'1'},
    });
    assert.equal(response.status,200);
    const queries=JSON.parse(response.headers.get('X-Test-Queries'));
    assert.deepEqual(queries.map(sql=>sql.match(/FROM (idol_[a-z_]+)/i)[1]),tables);
    for(const sql of queries.filter(sql=>sql.includes('FROM idol_storage_control')))assert.match(sql,/JOIN idol_catalog_state/);
    assert.match(queries.find(sql=>sql.includes('FROM idol_personal_mv_ratings')),/owner_id=\? AND snapshot_id=\? AND work_id=\?/);
    const value=await response.json();
    assert.deepEqual(value.scope,{type:'work',workId});
    assert.deepEqual(value.personalMvRatings.entries,[{workId,videoId,memberId,score,stylingScore:null,revision}]);
  }
  const control='idol_storage_control',personal='idol_personal_mv_ratings';
  await checkQueries([control,'idol_native_snapshots','idol_native_fields','idol_native_records',control,personal,control],0,1);
  await db.prepare('UPDATE idol_personal_mv_ratings SET score=8,revision=2 WHERE id=?').bind('test-private-score').run();
  await checkQueries([control,personal,control],8,2);
});

test('opaque owner read failures identify their native operation without retrying or exposing data',async()=>{
  const workId='recOpaqueProbe';
  await seed('works',workId,{[F.works.groups]:['recGroup'],[F.works.song]:'Synthetic probe',[F.works.url]:'https://youtu.be/abcdefghijk'});
  const headers={Prefer:'omit-stage-candidates, work-detail='+workId};
  for(const [point,step] of [
    ['source-generation','source-generation'],['snapshot','snapshot'],['table-schema','table-schema'],
    ['table-rows','table-rows'],['table-decode','table-decode'],['cache-generation','cache-generation'],['response-generation','response-generation'],
    ['personal-ratings',null],['public-control',null],
  ]){
    await db.prepare("UPDATE idol_catalog_state SET generation=generation+1 WHERE user_id='test-owner'").run();
    const response=await runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1',{
      headers:{...headers,'X-Test-Fault':point,...(point==='public-control'&&{'X-Test-Public':'1'})},
    });
    assert.equal(response.status,502,point);
    assert.equal(response.headers.get('X-Test-Failures'),'1',point);
    assert.equal(response.headers.get('Server-Timing'),null,point);
    const body=await response.json();
    assert.equal(body.error,'REQUEST_FAILED');
    assert.doesNotMatch(JSON.stringify(body),/private-marker|test-owner|recOpaqueProbe/);
    const phase=point==='public-control'?'public-read':point==='personal-ratings'?'member-ratings':'native-read';
    const event={event:'idol_catalog_read_failed',phase,kind:point==='table-decode'?'data':'unknown',status:502,retried:false,cancelled:false};
    if(step)event.nativeStep=step;
    if(step&&point!=='source-generation')event.nativeCache='miss';
    assert.deepEqual(JSON.parse(response.headers.get('X-Test-Events')),[event],point);
  }
  const recovered=await runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1',{headers});
  assert.equal(recovered.status,200);
  assert.equal(recovered.headers.get('X-Catalog-Access'),'owner');
  assert.deepEqual((await recovered.json()).scope,{type:'work',workId});
  const warm=await runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1',{headers:{...headers,'X-Test-Fault':'warm-final'}});
  assert.equal(warm.status,502);
  assert.equal(warm.headers.get('X-Test-Failures'),'1');
  assert.deepEqual(JSON.parse(warm.headers.get('X-Test-Events')),[
    {event:'idol_catalog_read_failed',phase:'native-read',kind:'unknown',nativeStep:'response-generation',nativeCache:'hit',status:502,retried:false,cancelled:false},
  ]);
  const publicRead=await runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1',{
    headers:{...headers,'X-Test-Public':'1','X-Test-Queries':'1'},
  });
  assert.equal(publicRead.status,200);
  assert.equal(publicRead.headers.get('X-Catalog-Access'),'public');
  const publicData=await publicRead.json();
  assert.deepEqual(publicData.scope,{type:'work',workId});
  assert.equal(Object.hasOwn(publicData,'personalMvRatings'),false);
  const publicSql=JSON.parse(publicRead.headers.get('X-Test-Queries'));
  assert.equal(publicSql.some(sql=>sql.includes('idol_personal_mv_ratings')),false);
  assert.equal(publicSql.filter(sql=>sql.includes('SELECT generation FROM idol_catalog_state')).length,2);
});

test('after a request ends during the cold D1 read, the next HTTP request opens the work without a retry', async () => {
  const workId = 'recDepartedRead';
  await seed('works',workId,{[F.works.groups]:['recGroup'],[F.works.song]:'Synthetic work',[F.works.url]:'https://youtu.be/abcdefghijk'});
  for (const access of ['owner','public']) {
    await db.prepare("UPDATE idol_catalog_state SET generation=generation+1 WHERE user_id='test-owner'").run();
    const departed = await runtime.dispatchFetch('http://localhost/test/leave-catalog?shape=display-v1');
    assert.equal(departed.status,204);
    const headers = {Prefer:'omit-stage-candidates, work-detail='+workId,'X-Test-Queries':'1'};
    if (access === 'public') headers['X-Test-Public']='1';
    for (const expectedTableReads of [1,0]) {
      const response = await runtime.dispatchFetch('http://localhost/api/catalog?shape=display-v1',{headers});
      assert.equal(response.status,200,access);
      assert.equal(response.headers.get('X-Catalog-Access'),access);
      assert.equal(response.headers.get('Server-Timing'),null);
      const sql = JSON.parse(response.headers.get('X-Test-Queries'));
      assert.equal(sql.filter(statement=>statement.includes('FROM idol_native_records')).length,expectedTableReads);
      assert.equal(sql.some(statement=>statement.includes('FROM idol_personal_mv_ratings')),access==='owner');
      const data = await response.json();
      assert.deepEqual(data.scope,{type:'work',workId});
      assert.equal(Object.hasOwn(data,'personalMvRatings'),access==='owner');
    }
  }
});

for (const [title, id] of records) {
  test(title + ' reads back the correct work and member after a lost D1 save response', async () => {
    const h = currentDetail(id);
    const group = h.wp.data.groups[0];
    const memberId = 'recTestMember' + id;
    const ratingId = 'recTestRating' + id;
    h.wp.data.members[0].id = memberId;
    h.wp.data.ratings[0].memberIds = [memberId];
    h.wp.data.ratings[0].id = ratingId;
    const workFields = F.works, memberFields = F.ratings;
    await seed('groups', group.id, {[F.groups.name]: group.name});
    await seed('members', memberId, {[F.members.name]: 'Synthetic member', [F.members.groups]: [group.id]});
    await seed('works', id, {
      [workFields.url]: h.wp.work.url, [workFields.score]: 8, [workFields.stageScore]: null,
      [workFields.groups]: [group.id], [workFields.song]: title,
      [workFields.note]: 'test work note', [workFields.watched]: '未观看',
    });
    await seed('ratings', ratingId, {
      [memberFields.works]: [{recordId: id}], [memberFields.members]: [{recordId: memberId}],
      [memberFields.score]: '7', [memberFields.stylingScore]: null, [memberFields.memory]: '', [memberFields.note]: 'test member note',
    });
    // Resolve Worker/D1 reads before inspecting a render; setImmediate alone can finish too early.
    const pendingReads = [];
    h.setReadTransport(url => {
      const request = runtime.dispatchFetch('http://localhost' + url).then(async response =>
        new Response(await response.arrayBuffer(), {status: response.status, headers: response.headers}));
      pendingReads.push(request);
      return request;
    });
    const settleReads = async () => {
      await h.settle();
      await Promise.all(pendingReads);
      await h.settle();
    };
    await settleReads();
    const original = input(h, 'MV 分数');
    assert.ok(original, h.txt(h.editor()));
    assert.equal(original.props.value, 8);
    change(input(h, 'MV 分数'), '0');
    await h.settle();
    await turn(h, 'stage');
    change(input(h, '作品整体舞台分'), '9.1');
    await h.settle();
    await turn(h, 'mv');
    assert.equal(input(h, 'MV 分数').props.value, 0);
    assert.equal(posts(h).length, 0);
    let dropReply = true;
    h.setSaveTransport(async ({body}) => {
      const result = await post(body);
      assert.equal(result.status, 200);
      if (dropReply) {
        dropReply = false;
        await result.arrayBuffer();
        throw new TypeError('Synthetic loss after commit');
      }
      return result;
    });
    await h.footer().props.onClick();
    await h.settle();
    assert.equal(h.editor().props['data-dirty'], 'true');
    assert.equal(input(h, 'MV 分数').props.value, 0);
    assert.match(h.txt(h.footer()), /核对上次保存/);
    await h.footer().props.onClick();
    await h.settle();
    assert.equal(posts(h).length, 2);
    assert.equal(posts(h)[0].body, posts(h)[1].body);
    const savedWork = await (await read('works', id)).json();
    assert.equal(savedWork.values.score, 0);
    assert.equal(savedWork.values.stageScore, 9.1);
    assert.equal(savedWork.values.note, 'test work note');
    const journals = await db.prepare('SELECT result_json FROM idol_saves WHERE record_id = ?').bind(id).all();
    assert.equal(journals.results.length, 1);
    const receipt = JSON.parse(journals.results[0].result_json);
    assert.equal(receipt.operationId, JSON.parse(posts(h)[0].body).operationId);
    assert.equal(receipt.recordId, id);
    assert.equal(receipt.stageSource.sourceKey, h.wp.work.stage.videoId);

    const card = h.find(h.tree(), n => n.props.id === 'mv-cast-' + ratingId);
    assert.equal(h.find(card, n => n.props.table === 'ratings').props.id, ratingId);
    h.find(h.member(), n => n.type === 'button').props.onClick();
    await settleReads();
    const performance = () => input(h, '表现分', h.member());
    change(performance(), '0');
    await h.settle();
    await turn(h, 'stage');
    let focused = false;
    card.props.ref({querySelector: () => ({scrollIntoView() {}, focus() { focused = true; }})});
    h.find(h.tree(), n => n.type === 'button' && h.txt(n).includes('去保存成员评分')).props.onClick();
    await h.settle();
    assert.equal(focused, true);
    assert.match(String(performance().props.value), /^0(?:\.0)?$/);
    await h.find(h.member(), n => n.type === 'button' && h.txt(n).includes('保存此条记录')).props.onClick();
    await h.settle();
    const savedRating = await (await read('ratings', ratingId)).json();
    assert.equal(savedRating.values.score, 0);
    assert.equal(savedRating.values.stylingScore, null);
    assert.equal(savedRating.values.note, 'test member note');
    const response = await catalogFor(id);
    assert.equal(response.status,200);
    assert.match(response.headers.get('Preference-Applied'),/work-detail=/);
    const refreshed = await response.json();
    assert.deepEqual(refreshed.scope,{type:'work',workId:id});
    const refreshedWork = refreshed.works.find(work => work.id === id);
    assert.deepEqual(refreshedWork.groupIds, [group.id]);
    assert.equal(refreshedWork.score, 0);
    assert.equal(refreshedWork.stageScore, 9.1);
    const refreshedRating = refreshed.ratings.find(rating => rating.id === ratingId);
    assert.deepEqual(refreshedRating.memberIds, [memberId]);
    assert.deepEqual(refreshedRating.workIds, [id]);
    assert.equal(refreshedRating.score, 0);
    assert.ok(refreshed.members.some(member => member.id === memberId));
    assert.equal(refreshed.personalMvRatings.writable,true);
    change(input(h, 'MV 分数'), '');
    await h.settle();
    await h.footer().props.onClick();
    await h.settle();
    const clearedWork = await (await read('works', id)).json();
    assert.equal(clearedWork.values.score, null);
    assert.equal(clearedWork.values.stageScore, 9.1);
    assert.equal((await (await read('ratings', ratingId)).json()).values.score, 0);
  });
}
