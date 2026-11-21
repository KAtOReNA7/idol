const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {currentDetail, turn} = require('./helpers/current-work-detail.cjs');
const testArtistWorkDetail = require('./helpers/artist-work-detail.cjs');
const id = 'recvxyOz5XuYef';

testArtistWorkDetail({
  id, title: 'TOMBOY', groupId: 'recvxyEBDZqkpg', artistPath: '/artists/idle',
  returnPath: '/artists/idle?section=records&release=idle-release-cube-498', channel: 'i-dle (아이들)',
  mv: 'Jh4QFaPmdss', stage: 'ql-q-biGUlU', memberCount: 5,
});

test('TOMBOY keeps the KBS artwork available but labels and shows the bound STUDIO CHOOM stage', async () => {
  const media = 'media-idle-stage-kbs-music-bank-20220318-tomboy';
  const kbsPoster = '/artist/idle/display/' + media + '--' + media + '.jpg';
  const originals = [
    '/artist/idle/display/media-recvxyOz5XuYef--media-recvxyOz5XuYef.jpg',
    '/artist/idle/display/cover-idle-release-cube-498--cover-cube-498.jpg',
    kbsPoster,
  ];
  for (const src of originals) assert.ok(fs.statSync(path.join(__dirname, '../public', src)).size > 0);
  const h = currentDetail(id);
  await h.settle();
  await turn(h, 'stage');
  assert.match(h.txt(h.tree()), /STUDIO CHOOM/);
  assert.equal(h.player().props.videoId, 'ql-q-biGUlU');
  assert.notEqual(h.player().props.posterSrc, kbsPoster);
  assert.doesNotMatch(h.player().props.title, /Music Bank/i);
});
