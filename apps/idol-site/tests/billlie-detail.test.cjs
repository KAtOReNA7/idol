const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const testArtistWorkDetail = require('./helpers/artist-work-detail.cjs');
const id = 'recvxyH5pzBi6D';

testArtistWorkDetail({
  id, title: 'RING X RING', groupId: 'recvxyEBDZPXW9', artistPath: '/artists/billlie',
  returnPath: '/artists/billlie?section=works', channel: '1theK (원더케이)',
  mv: '9c2JruM56fM', stage: 'wBMRRQKEweU', memberCount: 6,
});

test('the Billlie MV and Mnet stage original artwork retain their recorded bytes', () => {
  const manifest = require('../data/billlie-figma-asset-manifest.json');
  for (const [kind, videoId] of [['mv', '9c2JruM56fM'], ['stage', 'wBMRRQKEweU']]) {
    const asset = manifest.find(row => row.workId === id && row.kind === kind && row.videoId === videoId);
    assert.ok(asset, videoId);
    const bytes = fs.readFileSync(path.join(__dirname, '../public', asset.runtime));
    assert.equal(bytes.length, asset.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  }
});

test('the six debut MV rating relationships retain their original member IDs', () => {
  const {tables} = require('../data/snapshot.json');
  const {asIds} = require('./helpers/public-artist-loader.cjs')('lib/idol/values.ts');
  const {F} = require('./helpers/public-artist-loader.cjs')('lib/idol/fields.ts');
  const ratings = tables.ratings.records.filter(row => asIds(row.fields[F.ratings.works]).includes(id));
  assert.deepEqual(new Set(ratings.flatMap(row => asIds(row.fields[F.ratings.members]))), new Set([
    'recvxyICzH9odN', 'recvxyICzH2hbG', 'recvxyICzHhav7',
    'recvxyICzHtQXk', 'recvxyICzHJHn8', 'recvxyICzHBhTg',
  ]));
});
