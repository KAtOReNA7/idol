const test = require('node:test');
const assert = require('node:assert/strict');
const {currentDetail, turn, input, change, posts} = require('./helpers/current-work-detail.cjs');

const workId = 'rec28ldfRTrArg';
const shortcuts = (h, tree) => h.find(tree, node => node.props.className === 'mv-member-shortcuts'
  || node.props['aria-label'] === '本支成员');
const cast = (h, tree) => h.find(tree, node => node.props.className === 'section cast-section');

test('MVs show the historical cast and their records once without the roster of buttons below the player', () => {
  const h = currentDetail(workId);
  const roster = [
    {id:'recMember', stageName:'MEMBER', cnName:'小美', groupIds:[], photo:null, status:'已退团'},
    {id:'recOther', stageName:'OTHER', groupIds:[]},
  ];
  h.wp.data.members = roster;
  h.wp.data.ratings.push({id:'unidentified', name:'待核对艺名', memberIds:[], workIds:[workId], score:null, stylingScore:null},
    {id:'another-work', memberIds:['recOther'], workIds:['another'], score:null, stylingScore:null});
  const tree = h.renderWork(), section = cast(h,tree);
  assert.equal(shortcuts(h,tree), undefined);
  assert.equal(section.props.hidden, false);
  assert.equal(h.txt(h.find(section, node => node.type === 'h2')), '成员与评分');
  const cards = h.walk(section).map(item => item.node).filter(node => node.type === 'article');
  assert.deepEqual(Array.from(cards, node => node.props['data-native-score-record']), ['recRating','unidentified']);
  assert.deepEqual(Array.from(cards, card => h.txt(h.find(card, node => node.props.className === 'member-name'))),
    ['小美 · MEMBER','待核对艺名']);
  for(const card of cards) {
    assert.equal(h.find(card, node => node.props.table === 'ratings').props.id, card.props['data-native-score-record']);
  }
  assert.equal(posts(h).length, 0);
});

test('the member editor stays below its own portrait and keeps its draft across the stage tab', async () => {
  const h = currentDetail(workId);
  await h.settle();
  const card = h.find(cast(h,h.tree()), node => node.props['data-native-score-record'] === 'recRating');
  const parts = h.walk(card).map(item => item.node);
  const photo = parts.findIndex(node => node.props.memberId === 'recMember' && node.props.work?.id === workId);
  const form = parts.findIndex(node => node.props.table === 'ratings' && node.props.id === 'recRating');
  assert.ok(photo >= 0 && form > photo);
  h.find(h.member(), node => node.type === 'button').props.onClick();
  await h.settle();
  change(input(h,'表现分',h.member()),'0');
  await h.settle();
  await turn(h,'stage');
  assert.equal(cast(h,h.tree()).props.hidden, true);
  assert.equal(shortcuts(h,h.tree()), undefined);
  await turn(h,'mv');
  assert.equal(cast(h,h.tree()).props.hidden, false);
  assert.equal(shortcuts(h,h.tree()), undefined);
  assert.equal(input(h,'表现分',h.member()).props.value, 0);
  assert.equal(posts(h).length, 0);
  h.wp.data.ratings = [];
  assert.equal(cast(h,h.renderWork()).props.hidden, true);
});
