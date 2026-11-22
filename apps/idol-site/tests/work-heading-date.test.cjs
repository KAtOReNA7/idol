const assert = require('node:assert/strict');
const test = require('node:test');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {parse} = require('next/dist/compiled/node-html-parser');
const {currentDetail, turn, posts} = require('./helpers/current-work-detail.cjs');
const {harness} = require('./helpers/personal-mv-ratings.cjs');

function summary(h) {
  const header = h.find(h.tree(), node => node.type === 'header' && node.props.className === 'music-work-title');
  return h.txt(h.find(header, node => node.type === 'p'));
}

for (const [group, id] of [['SAY MY NAME', 'rec28ldfRTrBCv'], ['XG', 'recvxDMFHNyJoh']]) {
  test(group + ' updates the heading with the selected video and preserves its score binding', async () => {
    const h = currentDetail(id);
    const work = h.wp.work;
    const mvText = [work.videoType, work.version, work.releaseDate].filter(Boolean).join(' · ');
    await h.settle();
    assert.equal(summary(h), mvText);

    await turn(h, 'stage');
    assert.ok(summary(h).includes(work.stage.publishedDate));
    assert.ok(!summary(h).includes(work.releaseDate.slice(0, 10)));
    const editor = h.find(h.tree(), node => node.props.table === 'works');
    assert.equal(editor.props.id, work.id);
    assert.equal(editor.props.stageVideoId, work.stage.scoreBinding.videoId);
    assert.equal(editor.props.sourceKey, work.stage.scoreBinding.sourceKey ?? work.stage.scoreBinding.videoId);

    await turn(h, 'mv');
    assert.equal(summary(h), mvText);
    assert.equal(h.player().props.videoId, new URL(work.url).searchParams.get('v'));
    assert.equal(posts(h).length, 0);
  });
}

test('stage deep links show their recorded version and omit unknown or absent stage dates', t => {
  const {api, sql} = harness();
  t.after(() => sql.close());
  const snapshot = require('../data/snapshot.json');
  const catalog = api.projectPublicCatalog(api.projectCatalog(snapshot.tables, 'snapshot', snapshot.capturedAt));
  const noop = () => {};
  function render(id) {
    const work = catalog.works.find(row => row.id === id);
    const data = api.projectWorkCatalog(catalog, work);
    const html = renderToStaticMarkup(React.createElement(api.PublicAccessProvider, {canEdit: false},
      React.createElement(api.WorkDetail, {work, data, initialView: 'stage', onBack: noop, onMember: noop, onVersion: noop, onSaved: noop})));
    const page = parse(html);
    assert.equal(page.querySelector('#stage-tab').getAttribute('aria-selected'), 'true');
    return page.querySelector('.music-work-title > p').text;
  }
  assert.equal(render('recvxyHuKMFzlZ'), '舞台表演 · 视频发布于 2025-02-07');
  assert.equal(render('recvxDMFHNyJoh'), '音乐节目舞台 · 视频发布于 2026-01-22');
  assert.equal(render('rec28ldfRTrNcl'), '表演视频 · 同曲后备 · 不同版本 · 视频发布于 2025-03-14');
  assert.equal(render('recvxyOz5XkyEY'), '表演视频 · 同曲后备 · 节选');
  assert.equal(render('recvxIZy35Xwr7'), '暂无舞台');
});

test('changing works on a stage deep link replaces the prior stage date without saving or carrying it into the MV', async () => {
  const h = currentDetail('recvxyHuKMFzlZ');
  h.wp.initialView = 'stage';
  await h.settle();
  assert.match(summary(h), /2025-02-07/);
  const next = currentDetail('recvxDMFHNyJoh');
  h.wp.work = next.wp.work;
  h.wp.data = next.wp.data;
  await h.settle();
  assert.match(summary(h), /2026-01-22/);
  assert.doesNotMatch(summary(h), /2025-02-07/);
  assert.equal(h.player().props.videoId, h.wp.work.stage.videoId);

  await turn(h, 'mv');
  assert.match(summary(h), /2025-09-19/);
  assert.doesNotMatch(summary(h), /2026-01-22/);
  assert.equal(posts(h).length, 0);
});
