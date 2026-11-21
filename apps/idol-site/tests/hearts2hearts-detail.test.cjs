const test = require('node:test');
const assert = require('node:assert/strict');
const {currentDetail, posts} = require('./helpers/current-work-detail.cjs');
const testArtistWorkDetail = require('./helpers/artist-work-detail.cjs');
const inventory = require('../data/stages/inventory.json').works;
const reviewed = require('../data/versions/verified-display.json');

const id = 'rec28ldfRTrzDX';
testArtistWorkDetail({
  id, title: 'The Chase', groupId: 'rec28ldfRTiBAq', artistPath: '/artists/hearts2hearts',
  returnPath: '/artists/hearts2hearts?section=works', channel: 'SMTOWN',
  mv: 'kxUA2wwYiME', stage: 'GtPPT-qSXj8', memberCount: 8,
});

test('The Chase keeps distinct catalogue IDs and navigates using the reviewed performance link', async () => {
  const h = currentDetail(id);
  const performanceId = 'rec28ldfRTrJKM';
  const lyricId = 'rec28ldfRTrI0Y';
  assert.equal(inventory.find(row => row.recordId === performanceId).mv.videoId, 'GtPPT-qSXj8');
  assert.equal(inventory.find(row => row.recordId === lyricId).mv.videoId, '80-Q7b1qaFg');
  const relation = reviewed.relations.find(row => row.toWorkId === id && row.relationType === 'performance_of');
  assert.equal(relation.fromWorkId, performanceId);
  const label = '表演版';
  h.wp.work.versionDisplay = {tags: [], links: [{
    workId: relation.fromWorkId, title: 'The Chase', labels: [label], categories: ['其他版本'],
  }]};
  let selected;
  h.wp.onVersion = workId => { selected = workId; };
  await h.settle();
  const versions = h.find(h.tree(), n => n.props['aria-label'] === '作品版本与关联');
  const buttons = h.walk(versions).filter(({node}) => node.type === 'button');
  assert.equal(buttons.length, 1);
  assert.match(h.txt(buttons[0].node), /The Chase表演版/);
  let focused = false;
  buttons[0].node.props.onClick({currentTarget: {focus() { focused = true; }}});
  assert.equal(focused, true);
  assert.equal(selected, performanceId);
  assert.equal(posts(h).length, 0);
  h.wp.work.versionDisplay = {tags: [], links: []};
  assert.equal(h.find(h.renderWork(), n => n.props['aria-label'] === '作品版本与关联'), undefined);
});

test('The Chase keyboard tabs move focus before activation and leave browser shortcuts available', async () => {
  const h = currentDetail(id);
  let changes = 0;
  h.wp.onViewChange = () => { changes++; };
  await h.settle();
  const list = h.find(h.tree(), n => n.props.role === 'tablist');
  let active = 0;
  let prevented = 0;
  const tabs = h.walk(list).filter(({node}) => node.props.role === 'tab').map(({node}, index) => ({
    node, tabIndex: node.props.tabIndex, getClientRects: () => [{}],
    focus() {
      active = index;
      list.props.onFocus({currentTarget: container, target: this});
    },
  }));
  const container = {querySelectorAll: () => tabs};
  const key = (key, extra) => list.props.onKeyDown({
    key, target: tabs[active], currentTarget: container, preventDefault() { prevented++; }, ...extra,
  });
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) key('ArrowLeft', {[modifier]: true});
  assert.equal(prevented, 0);
  key('ArrowRight');
  assert.equal(active, 1);
  assert.deepEqual(Array.from(tabs, tab => tab.tabIndex), [-1, 0]);
  key('Home');
  assert.equal(active, 0);
  key('End');
  assert.equal(active, 1);
  assert.equal(changes, 0);
  tabs[active].node.props.onClick();
  await h.settle();
  assert.equal(changes, 1);
  assert.equal(h.find(h.tree(), n => n.props.role === 'tabpanel').props['aria-labelledby'], 'stage-tab');
  assert.equal(posts(h).length, 0);
});
