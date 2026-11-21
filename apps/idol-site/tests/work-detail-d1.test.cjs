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
];
let runtime, db;

before(async () => {
  // Only this ephemeral D1 is bound. The local worker uses a synthetic owner.
  const ownerEmail = fs.readFileSync(path.join(root, 'lib/idol/http.ts'), 'utf8').match(/toLowerCase\(\)!=='([^']+)'/)[1];
  const bundle = await build({
    stdin: {resolveDir: root, contents: `
      import {readNativeDetail} from './lib/idol/native-reader';
      import {saveNativeRecord} from './lib/idol/native-save';
      import {GET as readCatalog} from './app/api/catalog/route';
      import {AppError} from './lib/idol/feishu';
      export default {async fetch(request) {
        const url = new URL(request.url);
        try {
          if (url.pathname === '/api/catalog' && request.method === 'GET') return readCatalog(request);
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
        'export const getChatGPTUser=async()=>('+JSON.stringify({userId:'test-owner',email:ownerEmail})+');'}));
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

for (const [title, id] of records) {
  test(title + ' reads back the correct work and member after a lost D1 save response', async () => {
    const h = currentDetail(id);
    const ratingId = 'recTestRating' + id;
    h.wp.data.ratings[0].id = ratingId;
    const workFields = F.works, memberFields = F.ratings;
    await seed('works', id, {
      [workFields.url]: h.wp.work.url, [workFields.score]: 8, [workFields.stageScore]: null,
      [workFields.groups]: ['recGroup'], [workFields.song]: title,
      [workFields.note]: 'test work note', [workFields.watched]: '未观看',
    });
    await seed('ratings', ratingId, {
      [memberFields.works]: [{recordId: id}], [memberFields.members]: [{recordId: 'recMember'}],
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
    assert.match(h.txt(h.footer()), /核对上次保存/);
    await h.footer().props.onClick();
    await h.settle();
    assert.equal(posts(h)[0].body, posts(h)[1].body);
    const savedWork = await (await read('works', id)).json();
    assert.equal(savedWork.values.score, 0);
    assert.equal(savedWork.values.stageScore, 9.1);
    assert.equal(savedWork.values.note, 'test work note');
    const journals = await db.prepare('SELECT result_json FROM idol_saves WHERE record_id = ?').bind(id).all();
    assert.equal(journals.results.length, 1);
    assert.equal(JSON.parse(journals.results[0].result_json).stageSource.sourceKey, h.wp.work.stage.videoId);

    const card = h.find(h.tree(), n => n.props.id === 'mv-cast-' + ratingId);
    assert.equal(h.find(card, n => n.props.table === 'ratings').props.id, ratingId);
    h.find(h.member(), n => n.type === 'button').props.onClick();
    await settleReads();
    const performance = () => h.find(h.member(), n => n.props['aria-label'] === '表现分');
    change(performance(), '0');
    await h.settle();
    await turn(h, 'stage');
    let focused = false;
    card.props.ref({querySelector: () => ({scrollIntoView() {}, focus() { focused = true; }})});
    h.find(h.tree(), n => n.type === 'button' && h.txt(n).includes('去保存成员评分')).props.onClick();
    await h.settle();
    assert.equal(focused, true);
    assert.equal(performance().props.value, 0);
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
    assert.equal(refreshed.works.find(w=>w.id===id).score,0);
    assert.equal(refreshed.works.find(w=>w.id===id).stageScore,9.1);
    assert.equal(refreshed.ratings.find(r=>r.id===ratingId).score,0);
    assert.ok(refreshed.members.some(m=>m.id==='recMember'));
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
