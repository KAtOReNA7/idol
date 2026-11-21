const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {MvIdentityPhoto, mvRecognitionEdition} = require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/mv-identity-photo');
const editions = require('../data/mv-recognition-editions.json');
const media = require('../data/mv-public-media.json');

test('every display selection belongs to one existing work, video and member and has distinct preview and original files', () => {
  const key = row => [row.workId, row.videoId, row.memberId].join('/');
  const old = new Set(media.portraits.map(key));
  const selected = new Set();
  const workIds = new Set();
  for (const edition of Object.values(editions)) {
    const used = new Set();
    for (const binding of edition.works) {
      assert(!workIds.has(binding.workId), binding.workId);
      workIds.add(binding.workId);
      for (const memberId of binding.memberIds) {
        const id = key({...binding, memberId});
        assert(old.has(id) && !selected.has(id), id);
        assert(edition.portraits[memberId], id);
        selected.add(id);
        used.add(memberId);
      }
    }
    assert.deepEqual([...used].sort(), Object.keys(edition.portraits).sort());
    for (const p of Object.values(edition.portraits)) {
      assert.match(p.sourceUrl, /^https?:\/\//);
      assert.notEqual(p.original, p.preview);
      for (const url of [p.original, p.preview]) {
        assert.match(url, /^\/artist\//);
        assert(fs.existsSync(path.join(__dirname, '../public', url)), url);
      }
    }
  }
});

test('MV cards show the reviewed series and retain the old work image only for the bound recording and member', () => {
  const edition = editions['love-dive-academy'];
  const {workId, videoId, memberIds} = edition.works[0];
  const member = memberIds[0];
  const work = {id: workId, url: 'https://www.youtube.com/watch?v=' + videoId};
  const draw = (item, id) => renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work: item, memberId: id, label: 'IVE', selectEdition: mvRecognitionEdition}));
  const image = draw(work, member);
  assert(image.includes(edition.portraits[member].preview));
  assert(image.includes(edition.label));
  assert(image.includes('查看原作品图'));
  for (const wrong of [draw({...work, id: 'other'}, member), draw({...work, url: 'https://youtu.be/abcdefghijk'}, member), draw(work, 'other')]) {
    assert(!wrong.includes(edition.portraits[member].preview));
    assert(!wrong.includes('查看原作品图'));
  }
});
