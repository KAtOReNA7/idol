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
const genieOriginal = (issue, file) =>
  `https://image.genie.co.kr/Y/IMAGE/IMG_MUZICAT/IV2/Genie_Magazine/${issue}/Mgz_Sub_IMG_${file}.jpg/dims/resize/Q_80,0`;
const publisherSeries = {
  'vvup-debut-introductions-202402': {
    label: '2024 出道同期 · 官方成员介绍照',
    original: url => url,
    files: {
      recvxAPQCFN2Tn: 'https://images.khan.co.kr/article/2024/02/26/news-p.v1.20240226.be75d7f2840d4874b794de3e85d9cb8e_P1.jpg',
      recvxAPQCFDPha: 'https://images.khan.co.kr/article/2024/02/27/news-p.v1.20240227.30ef6107086142fe8967c7b01aea7286_P1.jpg',
      recvxAPQCFQR2I: 'https://image.starnewskorea.com/21/2024/02/2024022809061718275_1.jpg',
      recvxAPQCFtTIC: 'https://cgeimage.commutil.kr/phpwas/restmb_allidxmake.php?pp=002&idx=999&simg=2024022909410108995d3244b4fed58141237106.jpg&nmt=29',
    },
  },
  'wooah-blush-2024': {
    label: 'BLUSH · 本曲概念照',
    source: 'https://www.etnews.com/20240406000018',
    original: mediaId => 'https://pbs.twimg.com/media/' + mediaId + '?format=jpg&name=orig',
    files: {
      recvxyICzHGJek: 'GKSu6IUa8AA_RvV',
      recvxyICzHzhWr: 'GKSvANUaUAAvz2p',
      recvxyICzHu6mX: 'GKSvEw3a4AAz1tr',
      recvxyICzH84mF: 'GKSvJL_aIAA89C0',
      recvxyICzHi2X6: 'GKSvOf4aEAAemBy',
    },
  },
  'rescene-scenedrome-202408': {
    label: 'SCENEDROME · 本次发行概念照',
    source: 'https://www.hellokpop.com/kpop/rescene-makes-a-splash-with-first-scenedrome-concept-images/',
    original: mediaId => 'https://pbs.twimg.com/media/' + mediaId + '?format=jpg&name=orig',
    files: {
      recvxAPQCFEoKg: 'GVBQYEaa4AElI99',
      recvxAPQCFHERK: 'GU2cD49bUAAUTIp',
      recvxAPQCF0JXd: 'GU2b8gOaMAAU5eG',
      recvxAPQCFmsPH: 'GU2b0cFbcAAtmh4',
      recvxAPQCFbn3I: 'GVBQgW8boAEHPJ1',
    },
  },
  'hearts2hearts-the-chase-2025': {
    label: 'The Chase · 本曲概念照',
    original: mediaId => 'https://pbs.twimg.com/media/' + mediaId + '?format=jpg&name=orig',
    files: {
      rec28ldbniB6s5: 'GjwYDazacAMS27W',
      rec28ldbniB6Jp: 'GjwZdatacAEmLl7',
      rec28ldbniB6Rt: 'GjwZG1qacAAdbkI',
      rec28ldbniB70B: 'GjwZBzHaYAAE3uk',
      rec28ldbniB7cX: 'GjwZiH3acAEedQ2',
      rec28ldbniB7m2: 'GjwZM3fbMAA9Zyt',
      rec28ldbniB7vO: 'GjwZZemacAIGhBO',
      rec28ldbniB7F7: 'GjwZUoLacAI-cTM',
    },
  },
  'all-my-girls-2023': {
    label: 'ALL MY GIRLS · 本次发行概念照',
    original: file => 'https://0.soompi.io/wp-content/uploads/2023/07/' + file,
    files: {
      recvxyICzH3DKT: '31091644/yiren-2.jpeg',
      recvxyICzHDN27: '31091717/eu-2.jpeg',
      recvxyICzHl9XF: '30085311/Onda-1.jpeg',
      recvxyICzHtX1e: '31091611/mia-.jpeg',
      recvxyICzHxIn2: '30085410/Sihyeon-1.jpeg',
      recvxyICzHyLkP: '30085341/Aisha-1.jpeg',
    },
  },
  'wish-2021': {
    label: 'WISH · 本次发行概念照',
    source: 'https://www.genie.co.kr/magazine/subMain?mgz_seq=10231',
    original: file => genieOriginal(10231, file),
    files: {
      recvxyICzHGJek: '20210526110851',
      recvxyICzHzhWr: '20210526110905',
      recvxyICzHu6mX: '20210526110924',
      recvxyICzH84mF: '20210526110939',
      recvxyICzHi2X6: '20210526110954',
    },
  },
  'qurious-2020': {
    label: 'QURIOUS · 本次发行概念照',
    source: 'https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=9397',
    original: file => genieOriginal(9397, file),
    files: {
      recvxyICzHzhWr: '20201124103751',
      recvxyICzHi2X6: '20201124103757',
      recvxyICzH84mF: '20201124103804',
      recvxyICzHu6mX: '20201124103811',
      recvxyICzHGJek: '20201124103837',
    },
  },
};

test('every display selection belongs to one existing work, video and member and retains its reviewed original', () => {
  const key = row => [row.workId, row.videoId, row.memberId].join('/');
  const old = new Set(media.portraits.map(key));
  const selected = new Set();
  const workIds = new Set();
  for (const [series, edition] of Object.entries(editions)) {
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
    for (const [memberId, p] of Object.entries(edition.portraits)) {
      assert.match(p.sourceUrl, /^https?:\/\//);
      assert.notEqual(p.original, p.preview);
      const local = [p.preview];
      const publisher = publisherSeries[series];
      if (publisher) {
        assert.ok(publisher.files[memberId], memberId);
        assert.equal(p.original, publisher.original(publisher.files[memberId]));
        if (publisher.source) assert.equal(p.sourceUrl, publisher.source);
      } else {
        local.push(p.original);
      }
      for (const url of local) {
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

const reviewedReleases = [
  ['Doo Doom Chit', 'vvup-debut-introductions-202402', 'rec28ldfRTrFb6', 'dYWGeQ4HFD8', 4],
  ['BLUSH', 'wooah-blush-2024', 'recvxyH5pz0vNt', 'yh5W41ANcjo', 5],
  ['LOVE ATTACK', 'rescene-scenedrome-202408', 'rec28ldfRTrDat', '9XttLI0oH0I', 5],
  ['The Chase', 'hearts2hearts-the-chase-2025', 'rec28ldfRTrzDX', 'kxUA2wwYiME', 8],
  ['SO BAD', 'star-to-a-young-culture-2020', 'recvxyH5pzZo3m', 'gMe1c4UegBY', 6],
  ['Buenos Aires', 'buenos-aires-2019', 'recvxyH5pzEDfw', 'M46FRJsB0Qw', 12],
  ['La Vie en Rose', 'color-iz-2018', 'recvxyGO7qIB31', 'WZwr2a_lFWY', 12],
  ['Suki to Iwasetai', 'suki-to-iwasetai-2019', 'recvxyH5pzydzY', 'dLymsYC7Kmo', 12],
  ['Roller Coaster', 'roller-coaster-2023', 'recvxyOz5XxC5D', 'fqBAzCH4-9g', 6],
  ['DALLA DALLA', 'itz-different-2019', 'recvxyOz5XEqgh', 'pNfTK39k55U', 5],
  ['In the morning', 'guess-who-night-2021', 'recvxyOz5XJljg', '_ysomCGaZLw', 5],
  ['Zig Zag', 'we-can-2020', 'recvxyH5pziABU', '1FqAoADnId4', 7],
  ['Nobody Knows', 'born-to-be-xx-2023', 'rec28ldfRTrBgQ', 'unLuba-TQiE', 4],
  ['SLAY', 'all-my-girls-2023', 'recvxyH5pzPiQ3', 'jI5p2ePoVcc', 6],
  ['Purple', 'wish-2021', 'recvxyH5pzTgrL', 'UE--H12gl2I', 5],
  ['Bad Girl', 'qurious-2020', 'recvxyH5pzV8fK', 'xwDmGC2fTfU', 5],
  ["I Don't Miss U", 'qurious-2020', 'recvxyH5pz4VGa', 'hPzz4cRxtco', 5],
  ['I DO ME', 'kiiikiii-uncut-gem-2025', 'rec28ldfRTrAb0', 'hAEfi_SKTEU', 5],
];

for (const [title, series, workId, videoId, memberCount] of reviewedReleases) {
  test(title + ' shows the full contemporary roster on its original MV and preserves the earlier work images', async () => {
    const selected = editions[series];
    const existing = media.portraits.filter(row => row.workId === workId && row.videoId === videoId);
    assert.equal(existing.length, memberCount);
    const recording = selected.works.find(binding => binding.workId === workId && binding.videoId === videoId);
    assert.ok(recording, title);
    assert.deepEqual(new Set(recording.memberIds), new Set(existing.map(row => row.memberId)));
    const work = {id: workId, url: 'https://www.youtube.com/watch?v=' + videoId};
    for (const old of existing) {
      const photo = mvRecognitionEdition(old);
      assert.ok(photo, old.memberId);
      const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId: old.memberId, label: title, selectEdition: mvRecognitionEdition}));
      assert.ok(html.includes('src="' + photo.preview + '"') && html.includes('href="' + photo.sourceUrl.replaceAll('&', '&amp;') + '"'), old.memberId);
      assert.equal(html.includes('查看原作品图'), old.src !== photo.original, old.memberId);
      const preview = await sharp(path.join(__dirname, '../public', photo.preview)).metadata();
      assert.equal(preview.format, 'webp');
      assert.equal(preview.width * 4, preview.height * 3);
      assert.ok(!html.includes('src="' + photo.original + '"'), 'Full image should load on demand for ' + old.memberId);
      if (publisherSeries[series]) {
        assert.deepEqual([preview.width, preview.height], [480, 640]);
        assert.equal(photo.label, publisherSeries[series].label);
      } else {
        assert.match(photo.label, /本曲概念照|本次发行/);
        const original = await sharp(path.join(__dirname, '../public', photo.original)).metadata();
        assert.ok(original.width >= preview.width && original.height >= preview.height, old.memberId);
      }
      assert.equal(mvRecognitionEdition({...old, videoId: 'differentMV'}), null);
    }
  });
}
