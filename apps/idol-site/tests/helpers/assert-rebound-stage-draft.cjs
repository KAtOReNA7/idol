const assert = require('node:assert/strict');

module.exports = async function assertReboundStageDraft(harness) {
  const h = harness();
  await h.settle();
  h.find(h.tree(), node => node.props.id === 'stage-tab').props.onClick();
  await h.settle();

  const input = () => h.find(h.editor(), node => node.props['aria-label'] === '作品整体舞台分');
  input().props.onChange({target: {value: '8.7'}});
  await h.settle();
  assert.equal(h.footer().props.disabled, false);

  const videoId = 'different01';
  h.wp.work = {...h.wp.work, stage: {...h.wp.work.stage, videoId, title: 'Different verified stage',
    url: 'https://www.youtube.com/watch?v=' + videoId, scoreBinding: {videoId}}};
  await h.settle();
  assert.equal(input().props.value, 8.7);
  assert.match(h.txt(h.editor()), /你的输入仍对应上一支视频/);
  assert.equal(h.footer().props.disabled, true);
  await h.footer().props.onClick();
  assert.equal(h.requests.filter(request => request.url === '/api/save').length, 0);

  const player = h.find(h.tree(), node => node.props.workId === h.wp.work.id && node.props.view === 'stage');
  assert.equal(player.props.videoId, videoId);
  assert.equal(player.props.sourceKey, videoId);
  assert.equal(player.props.posterSrc, undefined);
};
