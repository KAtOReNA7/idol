const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const sharp = require('sharp');
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

test('the same portrait is captioned for each release and historical members retain their own provenance', () => {
  const portraits = editions['idle-i-feel'];
  const release = portraits.works.find(work => work.label.includes('本次发行'));
  const reference = portraits.works.find(work => work.label.includes('跨期'));
  const memberId = release.memberIds.find(id => reference.memberIds.includes(id));
  const photoFor = work => mvRecognitionEdition({...work, memberId});
  assert.equal(photoFor(release).original, photoFor(reference).original);
  assert.equal(photoFor(release).label, release.label);
  assert.equal(photoFor(reference).label, reference.label);
  const debut = editions['wooah-archive'].works.find(work => work.memberIds.includes('recvxyICzHxcEJ'));
  const historical = mvRecognitionEdition({...debut, memberId: 'recvxyICzHxcEJ'});
  assert.match(historical.label, /EXCLAMATION/);
  assert.match(historical.sourceUrl, /kstationtv/);
  assert.equal(mvRecognitionEdition({...debut, videoId: 'other-video', memberId: 'recvxyICzHxcEJ'}), null);
});

test('Attention shows each member’s 2022 debut portrait, with the credited full image and original work photo', async () => {
  const workId = 'recvxyOz5X2J0A';
  const videoId = 'js1CtxSY38I';
  const work = {id: workId, url: 'https://www.youtube.com/watch?v=' + videoId};
  const members = [
    ['recvxyICzHGklh', 'MINJI', 2],
    ['recvxyICzHhlFz', 'HANNI', 16],
    ['recvxyICzHLSfX', 'DANIELLE', 12],
    ['recvxyICzHpQud', 'HAERIN', 18],
    ['recvxyICzHLR6M', 'HYEIN', 11],
  ];
  const previous = media.portraits.filter(row => row.workId === workId && row.videoId === videoId);
  assert.deepEqual(new Set(previous.map(row => row.memberId)), new Set(members.map(([id]) => id)));
  for (const [memberId, name, officialNumber] of members) {
    const photo = mvRecognitionEdition({workId, videoId, memberId});
    assert.ok(photo, name);
    assert.equal(photo.preview, '/artist/recognition-editions/newjeans/new-jeans-2022-' + name.toLowerCase() + '.card.webp');
    assert.equal(photo.label, 'New Jeans · 本次发行概念照');
    const archived = new URL(photo.sourceUrl);
    assert.equal(archived.host, 'web.archive.org');
    assert.ok(archived.pathname.includes('/https://newjeans.kr/imgs/boost-a/'));
    assert.ok(archived.pathname.endsWith('/0722_0_' + officialNumber + '.jpg'), name);
    const preview = await sharp(path.join(__dirname, '../public', photo.preview)).metadata();
    assert.deepEqual([preview.format, preview.width, preview.height], ['webp', 480, 640]);
    const original = await sharp(path.join(__dirname, '../public', photo.original)).metadata();
    assert.ok(original.width > preview.width && original.height > preview.height, name);

    const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId, label: name, selectEdition: mvRecognitionEdition}));
    assert.ok(html.includes('src="' + photo.preview + '"') && html.includes('href="' + photo.sourceUrl + '"'), name);
    assert.ok(html.includes('查看' + name + '的' + photo.label + '原图'), name);
    const old = previous.find(row => row.memberId === memberId);
    assert.equal(html.includes('查看原作品图'), old.src !== photo.original, name);
    if (old.src !== photo.original) assert.ok(html.includes('href="' + old.sourceUrl + '"'), name);
    assert.equal(mvRecognitionEdition({workId, videoId: 'CHp0Kaidr14', memberId}), null);
    assert.equal(mvRecognitionEdition({workId: 'another-work', videoId, memberId}), null);
  }
  assert.equal(mvRecognitionEdition({workId, videoId, memberId: 'another-member'}), null);
});
