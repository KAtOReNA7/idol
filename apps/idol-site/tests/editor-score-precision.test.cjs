// Exercises the real Editor with synthetic records and fakeFetch only.
// Hook-model checks do not establish browser or production-save acceptance.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness({owner = true} = {}) {
  const prefix = fs.readFileSync(path.join(__dirname, 'editor-flow.test.cjs'), 'utf8').split('(async()=>{')[0];
  const h = vm.runInNewContext('(function(require,__dirname){' + prefix + `
    return {settle,wp,find,txt,requests,records,editor:()=>et,member:()=>mt,tree:()=>wt,
      setOwner(value){canEdit=value;},fail(){saveFailure={error:'EDIT_CONFLICT'};},recover(){saveFailure=null;}};
  })`, {console, crypto: globalThis.crypto, URL, URLSearchParams, Date, AbortController, setTimeout, clearTimeout, setImmediate, structuredClone})(require, __dirname);
  const root = path.join(__dirname, '..');
  const content = JSON.parse(fs.readFileSync(path.join(root, 'data/genblue-bluecut.json'), 'utf8'));
  const mv = content.media.find(media => media.kind === 'mv');
  const stage = JSON.parse(fs.readFileSync(path.join(root, 'data/stage-videos.json'), 'utf8'))[mv.workId];
  h.wp.work = {...h.wp.work, id: mv.workId, song: mv.title, name: mv.title, url: mv.url, groupIds: [content.groupId], stage};
  h.wp.data.works = [h.wp.work];
  h.wp.data.ratings[0].workIds = [mv.workId];
  h.setOwner(owner);
  return h;
}

const score = (h, label, member = false) => h.find(member ? h.member() : h.editor(), n => n.type === 'input' && n.props['aria-label'] === label);
const save = h => h.find(h.editor(), n => n.type === 'button' && n.props.ref).props.onClick();
const posts = h => h.requests.filter(r => r.url === '/api/save').map(r => JSON.parse(r.body));

test('GENBLUE existing editor accepts decimal MV/stage drafts and binds the exact stage on save', async () => {
  const h = harness();
  await h.settle();
  assert.equal(score(h, 'MV 分数').props.step, '0.1');
  score(h, 'MV 分数').props.onChange({target: {value: '9.1'}});
  await h.settle();
  h.find(h.tree(), n => n.props.id === 'stage-tab').props.onClick();
  await h.settle();
  assert.equal(score(h, '作品整体舞台分').props.step, '0.1');
  score(h, '作品整体舞台分').props.onChange({target: {value: '8.2'}});
  await h.settle();
  assert.equal(posts(h).length, 0, 'typing and switching video never save');
  await save(h);
  await h.settle();
  const payload = posts(h).at(-1);
  assert.equal(payload.recordId, h.wp.work.id);
  assert.deepEqual(payload.values, {score: 9.1, stageScore: 8.2});
  assert.equal(payload.stageVideoId, h.wp.work.stage.videoId);
  assert.equal(payload.stageSourceKey, h.wp.work.stage.videoId);
  assert.equal(h.records.ratings.score, 7, 'work save never changes the member record');
});

test('zero and clearing a score produce distinct saves without changing stage or member scores', async () => {
  const h = harness();
  await h.settle();
  for (const [input, expected] of [['0', 0], ['', null]]) {
    score(h, 'MV 分数').props.onChange({target: {value: input}});
    await h.settle();
    assert.equal(score(h, 'MV 分数').props.value, expected === null ? '' : expected);
    await save(h);
    await h.settle();
    assert.deepEqual(posts(h).at(-1).values, {score: expected});
    assert.equal(h.records.works.score, expected);
    assert.equal(h.records.works.stageScore, null);
    assert.equal(h.records.ratings.score, 7);
  }
  assert.equal(posts(h).length, 2);
});

test('a conflicting decimal save retains input; a member draft remains separate', async () => {
  const h = harness();
  await h.settle();
  h.find(h.member(), n => n.type === 'button').props.onClick();
  await h.settle();
  for (const label of ['表现分', '造型喜欢']) assert.equal(score(h, label, true).props.step, '0.1');
  score(h, '表现分', true).props.onChange({target: {value: '0.1'}});
  score(h, 'MV 分数').props.onChange({target: {value: '9.1'}});
  await h.settle();
  h.fail();
  await save(h);
  await h.settle();
  assert.equal(score(h, 'MV 分数').props.value, 9.1);
  assert.equal(h.editor().props['data-dirty'], 'true');
  assert.match(h.txt(h.editor()), /输入已保留/);
  assert.equal(h.records.works.score, 8);
  assert.equal(score(h, '表现分', true).props.value, 0.1);
  assert.equal(h.member().props['data-dirty'], 'true');
  assert.equal(h.records.ratings.score, 7);
});

test('the public reader sees zero and unscored values without editable controls or record requests', async () => {
  const h = harness({owner: false});
  h.wp.work.score = 0;
  h.wp.data.ratings[0].score = 0;
  await h.settle();
  assert.match(h.txt(h.editor()), /MV 分数：0/);
  assert.match(h.txt(h.member()), /表现分：0/);
  assert.match(h.txt(h.member()), /造型喜欢：未评分/);
  assert.equal(h.find(h.editor(), n => n.type === 'input' || n.type === 'button'), undefined);
  assert.equal(h.find(h.member(), n => n.type === 'input' || n.type === 'button'), undefined);
  assert.equal(h.requests.length, 0);
});
