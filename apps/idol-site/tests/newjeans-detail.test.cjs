const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const {currentDetail, turn} = require('./helpers/current-work-detail.cjs');
const testArtistWorkDetail = require('./helpers/artist-work-detail.cjs');
const id = 'recvxyOz5X2J0A';

testArtistWorkDetail({
  id, title: 'Attention', groupId: 'recvxyEBDZ9qVl', artistPath: '/artists/newjeans',
  returnPath: '/artists/newjeans?section=works&release=newjeans-release-new-jeans', channel: 'HYBE LABELS',
  mv: 'js1CtxSY38I', stage: 'CHp0Kaidr14', memberCount: 5,
});

test('the five approved NewJeans design assets retain their file bytes and image dimensions', async () => {
  const {assets} = require('../data/newjeans-image-sources.json');
  const keys = [
    'logo', 'cover-newjeans-release-new-jeans', 'media-recvxyOz5X2J0A',
    'media-recvxyOz5X4MBp', 'media-recvxyOz5XVlTp',
  ];
  for (const key of keys) {
    const image = assets.find(row => row.key === key).figmaDisplay;
    const bytes = fs.readFileSync(path.join(__dirname, '..', image.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), image.sha256, key);
    const size = await sharp(bytes).metadata();
    assert.equal(size.width, image.width, key);
    assert.equal(size.height, image.height, key);
  }
});

test('Attention uses its KBS stage preview and keeps the separate Super Shy performance distinct', async () => {
  const h = currentDetail(id);
  await h.settle();
  await turn(h, 'stage');
  assert.match(h.txt(h.tree()), /KBS Kpop/);
  const other = require('../data/stage-videos.json').recvxyOz5XdFJL;
  assert.equal(other.videoId, 'P14lg1Nlwa0');
  assert.notEqual(h.player().props.videoId, other.videoId);
  assert.doesNotMatch(h.player().props.posterSrc, /inkigayo|super-shy|P14lg1Nlwa0/i);
});
