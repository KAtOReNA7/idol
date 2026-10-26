const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const ts = require('typescript');
const vm = require('node:vm');
const index = require('../data/unis-figma-editorial.json');
const canonical = require('../data/artist-timelines/unis.json');
const source = fs.readFileSync('lib/idol/unis-editorial.ts', 'utf8');
const output = {};
vm.runInNewContext('(function(require,exports){' + ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
}).outputText + '})')(name => {
  if (name === '@/data/unis-figma-editorial.json') return index;
  if (name === '@/data/artist-timelines/unis.json') return canonical;
  throw Error('Unexpected dependency ' + name);
}, output);
const releases = output.unisEditorialReleases;
const plain = value => JSON.parse(JSON.stringify(value));
function dimensions(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset++], 0xff);
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    const length = bytes.readUInt16BE(offset);
    if ([0xc0,0xc1,0xc2].includes(marker)) return [bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)];
    offset += length;
  }
  throw Error('No JPEG dimensions');
}

test('unis: complete canonical release coverage, exact stable IDs and no synthetic project IDs', () => {
  assert.equal(releases.length, 10);
  assert.equal(new Set(releases.map(x => x.releaseKey)).size, 10);
  assert.deepEqual(new Set(releases.map(x => x.canonicalEventId)), new Set(canonical.events.filter(x => x.releaseKey).map(x => x.id)));
  for (const release of releases) {
    const event = canonical.events.find(x => x.id === release.canonicalEventId);
    assert.equal(release.releaseKey, event.releaseKey);
    assert.equal(release.projectReleaseId, null);
    for (const key of ['eventDate','announcementDate','plannedDate','sources','workIds']) assert.deepEqual(plain(release[key]), event[key]);
    assert.ok(release.sources.length);
    assert.ok(release.sources.every(x => /^https:\/\//.test(x.url)));
    assert.strictEqual(output.getUNISEditorialRelease(release.releaseKey), release);
  }
  assert.equal(output.getUNISEditorialRelease('rec-not-a-release'), null);
  const dates = releases.map(x => x.eventDate.value);
  assert.deepEqual(plain(dates), [...dates].sort());
});

test('unis: all five new image byte counts, SHA256 and decoded header dimensions match', () => {
  assert.equal(index.assets.length, 5);
  for (const asset of index.assets) {
    assert.ok(asset.image.startsWith('/artist/unis/editorial-20261018/'));
    const bytes = fs.readFileSync('public' + asset.image);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.deepEqual(dimensions(bytes), [asset.width,asset.height]);
    assert.ok(canonical.events.some(x => x.id === asset.canonicalEventId));
    assert.match(asset.sourceUrl, /^https:\/\//);
    assert.match(asset.imageSourceUrl, /^https:\/\//);
  }
});

test('unis: release art and historical solo-edition covers never become portraits or player imagery', () => {
  assert.equal(index.assets.filter(x => x.role === 'release-cover').length, 5);
  assert.equal(output.unisMemberEditionCovers.length, 0);
  assert.equal(releases.filter(x => x.cover).length, 5);
  for (const release of releases) if (release.cover) {
    assert.equal(release.cover.role, 'release-cover');
    assert.equal(release.cover.memberId, null);
    assert.equal(release.cover.canonicalEventId, release.canonicalEventId);
  }
  for (const asset of output.unisMemberEditionCovers) {
    assert.ok(asset.memberId);
    assert.ok(asset.editionLabel);
    assert.equal(asset.photographedAt, null);
    assert.ok(!releases.some(x => x.cover?.assetKey === asset.assetKey));
  }
  const forbidden = new Set(['score','rating','watched','note','poster','thumbnail','videoId','portrait']);
  const visit = value => { if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) { assert.ok(!forbidden.has(key), key); visit(child); } };
  visit(index);
  assert.doesNotMatch(source, /fetch\(|localStorage|sessionStorage|INSERT |UPDATE |DELETE |8\.6/);
  assert.ok(!('events' in index));
  assert.ok(!('members' in index));
  assert.ok(!('works' in index));
  assert.ok(!('videos' in index));
});
