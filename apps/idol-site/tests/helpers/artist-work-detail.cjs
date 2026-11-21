const test = require('node:test');
const assert = require('node:assert/strict');
const {currentDetail, turn, input, change, posts, assertWorkDrafts, assertHiddenMemberDraft} = require('./current-work-detail.cjs');
const assertReboundStageDraft = require('./assert-rebound-stage-draft.cjs');
const load = require('./public-artist-loader.cjs');
const {approvedVideoPoster, approvedStagePoster} = load('lib/idol/approved-video-poster.ts');
const {asIds, asText, asUrl} = load('lib/idol/values.ts');
const {F} = load('lib/idol/fields.ts');
const {groupArtistUrl, safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {tables} = require('../../data/snapshot.json');

module.exports = function testArtistWorkDetail({id, title, groupId, artistPath, returnPath, channel, mv, stage, memberCount}) {
  const harness = () => currentDetail(id);

  test(title + ' uses the credited music video and the selected full stage', async () => {
    const h = harness();
    await h.settle();
    const fields = tables.works.records.find(row => row.recordId === id).fields;
    assert.deepEqual(asIds(fields[F.works.groups]), [groupId]);
    assert.equal(asUrl(fields[F.works.url]), h.wp.work.url);
    assert.equal(h.wp.work.channel, channel);
    const player = h.player().props;
    assert.equal(player.videoId, mv);
    assert.equal(player.title, h.wp.work.officialTitle);
    assert.equal(player.sourceKey, null);
    assert.equal(player.posterSrc, approvedVideoPoster(id, mv, 'mv').src);
    assert.equal(approvedVideoPoster(id, 'another-mv', 'mv'), null);
    assert.equal(approvedVideoPoster('another-work', mv, 'mv'), null);

    await turn(h, 'stage');
    const stagePlayer = h.player().props;
    assert.equal(stagePlayer.videoId, stage);
    assert.equal(stagePlayer.sourceKey, stage);
    assert.equal(stagePlayer.url, h.wp.work.stage.url);
    assert.ok(stagePlayer.posterSrc.includes(stage), stagePlayer.posterSrc);
    assert.notEqual(stagePlayer.posterSrc, player.posterSrc);
    assert.equal(approvedStagePoster(id, {...h.wp.work.stage, clip: {startSeconds: 1, endSeconds: 9}}), null);
    assert.equal(approvedStagePoster(id, {...h.wp.work.stage, url: h.wp.work.url}), null);
  });

  test(title + ' keeps the existing cast, member notes and photo-to-score association', () => {
    const h = harness();
    const fields = tables.works.records.find(row => row.recordId === id).fields;
    const castIds = asIds(fields[F.works.ratings]);
    const cast = tables.ratings.records
      .filter(row => asIds(row.fields[F.ratings.works]).includes(id))
      .map(row => ({
        id: row.recordId,
        name: asText(row.fields[F.ratings.name]),
        workIds: asIds(row.fields[F.ratings.works]),
        memberIds: asIds(row.fields[F.ratings.members]),
        score: null, stylingScore: null, note: '', memory: '',
      }));
    assert.deepEqual(new Set(cast.map(r => r.id)), new Set(castIds));
    assert.equal(cast.length, memberCount);
    const memberIds = new Set(cast.flatMap(r => r.memberIds));
    assert.equal(memberIds.size, memberCount);
    h.wp.data.members = tables.members.records.filter(row => memberIds.has(row.recordId))
      .map(row => ({id: row.recordId, stageName: asText(row.fields[F.members.stageName]), photo: null}));
    const unrelated = {...cast[0], id: 'another-rating', workIds: ['another-work']};
    cast[0].note = 'isolated member note';
    h.wp.data.ratings = [...cast, unrelated];
    const tree = h.renderWork();
    const section = h.find(tree, n => n.props.className === 'section cast-section');
    assert.equal(section.props.hidden, false);
    assert.equal(h.walk(section).filter(({node}) => node.type === 'article').length, memberCount);
    assert.match(h.txt(tree), /existing note/);
    assert.match(h.txt(section), /isolated member note/);
    for (const row of cast) {
      const card = h.find(section, n => n.props.id === 'mv-cast-' + row.id);
      assert.equal(card.props['data-photo-member'], row.memberIds[0]);
      assert.ok(h.find(card, n => n.props.memberId === row.memberIds[0] && n.props.work?.id === id));
      const score = h.find(card, n => n.props.table === 'ratings' || n.props.recordId === row.id);
      assert.equal(score.props.id ?? score.props.recordId, row.id);
      assert.ok(h.find(tree, n => n.props['aria-controls'] === card.props.id));
    }
    h.wp.data.ratings = [unrelated];
    const empty = h.renderWork();
    assert.equal(h.find(empty, n => n.props.className === 'section cast-section').props.hidden, true);
    assert.equal(h.find(empty, n => n.props['aria-label'] === '本支成员'), undefined);
  });

  test(title + ' keeps zero, a decimal stage draft and a cleared score through a failed save', () => assertWorkDrafts(id));
  test(title + ' keeps a draft on its original stage after a catalogue change', () => assertReboundStageDraft(harness));
  test(title + ' returns to the same member draft and restores focus without saving', () => assertHiddenMemberDraft(id));

  test(title + ' reads the existing scores and saves only the member selected under the photo', async () => {
    const h = harness();
    await h.settle();
    assert.equal(input(h, 'MV 分数').props.value, 8);
    assert.equal(input(h, 'MV 分数').props.step, '0.1');
    const card = h.find(h.tree(), n => n.props.id === 'mv-cast-recRating');
    const editor = h.find(card, n => n.props.table === 'ratings');
    h.find(h.member(), n => n.type === 'button').props.onClick();
    await h.settle();
    const field = label => h.find(h.member(), n => n.props['aria-label'] === label);
    assert.equal(field('表现分').props.value, 7);
    assert.equal(field('造型喜欢').props.value, '');
    change(field('表现分'), '0');
    await h.settle();
    change(field('造型喜欢'), '8.6');
    await h.settle();
    assert.equal(posts(h).length, 0);
    await h.find(h.member(), n => n.type === 'button' && h.txt(n).includes('保存此条记录')).props.onClick();
    await h.settle();
    assert.equal(posts(h).length, 1);
    const saved = JSON.parse(posts(h)[0].body);
    assert.equal(saved.table, 'ratings');
    assert.equal(saved.recordId, editor.props.id);
    assert.deepEqual(saved.values, {score: 0, stylingScore: 8.6});
    assert.equal(input(h, 'MV 分数').props.value, 8);
    assert.equal(h.member().props['data-dirty'], undefined);
  });

  test(title + ' opens the credited group and returns to the accepted catalogue route', async () => {
    const h = harness();
    let target;
    h.wp.onGroup = selected => { target = groupArtistUrl(selected); };
    h.wp.onBack = () => { target = safeArtistReturn(returnPath); };
    await h.settle();
    const group = h.find(h.tree(), n => n.type?.name === 'GroupLinks');
    h.find(group.type(group.props), n => n.type === 'button').props.onClick();
    assert.equal(target, artistPath);
    assert.equal(safeArtistReturn(target), artistPath);
    h.find(h.tree(), n => n.props.className === 'button detail-back').props.onClick();
    assert.equal(target, returnPath);
    assert.equal(posts(h).length, 0);
  });
};
