const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const {parse} = require('next/dist/compiled/node-html-parser');
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

test('Per shows the five credited Genie set photos and keeps each member’s earlier jersey portrait and named MV still', async () => {
  const workId = 'rec28ldfRTrH9V';
  const videoId = 'v08zVNXb4is';
  const work = {id: workId, url: 'https://www.youtube.com/watch?v=' + videoId};
  const cast = [
    ['recvxAPKXChZPr', 'yeonsu', '872c5dc1f3ce54'],
    ['recvxAPQCFEeoQ', 'seowon', '237ad03eeeca91'],
    ['recvxAPQCF1pq2', 'sena', '50368b8e3517f1'],
    ['recvxAPQCFdy35', 'chaeeun', '6b3bef1157474f'],
    ['recvxAPQCFRLvq', 'seungchae', 'bd4eb0ea3c4306'],
  ];
  const old = media.portraits.filter(item => item.workId === workId && item.videoId === videoId);
  assert.deepEqual(new Set(old.map(item => item.memberId)), new Set(cast.map(([memberId]) => memberId)));
  for (const [memberId, name, jersey] of cast) {
    const photo = mvRecognitionEdition({workId, videoId, memberId});
    const still = old.find(item => item.memberId === memberId);
    assert.equal(photo.preview, '/artist/recognition-editions/adya/per-' + name + '.card.webp');
    assert.equal(photo.sourceUrl, 'https://genie.co.kr/magazine/subMain?ctid=1&mgz_seq=13145');
    assert.equal(photo.previousEdition.original, '/artist/mv-identity-batch-w-20261027/identities/adya-' + jersey + '.jpg');
    assert.equal(photo.previousEdition.sourceUrl, 'https://kprofiles.com/adya-members-profile/');
    const images = await Promise.all([photo.preview, photo.original, photo.previousEdition.original].map(src => sharp(path.join(__dirname, '../public', src)).metadata()));
    assert.deepEqual(images.slice(0, 2).map(({format, width, height}) => [format, width, height]), [['webp', 480, 640], ['jpeg', 840, 1260]]);
    assert.ok(images[2].width > 0 && images[2].height > 0, name);
    const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId, label: name, selectEdition: mvRecognitionEdition}));
    assert.ok(html.includes('src="' + photo.preview + '"') && html.includes('本 MV 拍摄现场照'));
    assert.ok(html.includes('查看红色球衣写真') && html.includes('href="' + photo.previousEdition.sourceUrl + '"'));
    assert.ok(html.includes('查看原作品图') && html.includes('href="' + still.sourceUrl + '"'));
    assert.equal(mvRecognitionEdition({workId, videoId: 'MTGRTklCseU', memberId}), null);
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
  const debut = editions['wooah-exclamation-202005'].works.find(work => work.memberIds.includes('recvxyICzHxcEJ'));
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

test('COCOCO credits each member’s own official photo and keeps the following day’s performance separate', () => {
  const members = [
    ['recvxAPQCFaXuH', 'ayako', '1829085664148894033'],
    ['recvxAPQCFvZsO', 'ayeon', '1829085797242622002'],
    ['recvxAPQCFSVcE', 'lili', '1829085464877510785'],
    ['recvxAPQCFWGjX', 'nico', '1829085372992700479'],
    ['recvxAPQCFknfS', 'xxin', '1829085562839674942'],
    ['recvxAPQCFlVPw', 'yuan', '1829085897939095954'],
  ];
  const workId = 'rec28ldfRTrCU6';
  for (const [memberId, name, post] of members) {
    const portrait = mvRecognitionEdition({workId, videoId: 'Ke5jk7Ngpqs', memberId});
    const base = '/artist/recognition-editions/genblue/cococo-' + name;
    assert.equal(portrait.preview, base + '.card.webp');
    assert.equal(portrait.original, base + '.original.jpg');
    assert.equal(portrait.sourceUrl, 'https://x.com/GENBLUE_ten/status/' + post);
    assert.equal(mvRecognitionEdition({workId, videoId: 'b7G7_EePN9s', memberId}), null);
  }
});

const reviewedReleases = [
  ['LOVE BOMB', 'fromis-from9-201810', 'recvxyOz5XR2zO', '-SK6cvkK4c0', 9],
  ['To Heart', 'fromis-to-heart-201801', 'recvxyOz5X4q4h', 'iFUHS1Ei7qw', 9],
  ['DKDK', 'fromis-to-day-201806', 'recvxyOz5X3fM9', 'B3KuJqe3Epg', 8],
  ['woo!ah!', 'wooah-exclamation-202005', 'recvxyH5pzlG0W', 'X2FB37r4Oyw', 6],
  ['Forever (약속)', 'aespa-forever-202102', 'recvxyHuKM4HSw', 'wog1R1d4zls', 4],
  ['Danger', 'wooah-joy-danger-202206', 'recvxyH5pz4vBM', '_X9720wjipE', 5],
  ['Catch the Stars', 'wooah-catch-the-stars-202201', 'recvxyH5pzzH06', 'g5B6zCSMrcc', 5],
  ['COCOCO', 'genblue-cococo-202408', 'rec28ldfRTrCU6', 'Ke5jk7Ngpqs', 6],
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

test('Forever keeps the Black Mamba originals and credits the SM release portraits for the right members', async () => {
  const work = {id: 'recvxyHuKM4HSw', url: 'https://www.youtube.com/watch?v=wog1R1d4zls'};
  const februaryFirst = 'https://www.spotvnews.co.kr/news/articleView.html?idxno=402713';
  const februarySecond = 'https://enter.etoday.co.kr/news/view/196755';
  const members = [
    ['recvxyICzHaPe7', 'giselle', februarySecond],
    ['recvxyICzH9h49', 'karina', februaryFirst],
    ['recvxyICzHE7ST', 'ningning', februaryFirst],
    ['recvxyICzHT9Ft', 'winter', februarySecond],
  ];
  for (const [memberId, name, sourceUrl] of members) {
    const photo = mvRecognitionEdition({workId: work.id, videoId: 'wog1R1d4zls', memberId});
    const earlier = mvRecognitionEdition({workId: 'recvxyHrxVovnG', videoId: 'ZeerrnuLi5E', memberId});
    const prefix = '/artist/recognition-editions/aespa/forever-' + name;
    assert.equal(photo.preview, prefix + '.card.webp');
    assert.equal(photo.original, prefix + '.original.jpg');
    assert.equal(photo.sourceUrl, sourceUrl);
    assert.equal(earlier.label, 'Black Mamba · 本次发行概念照');
    assert.deepEqual(photo.previousEdition, {
      original: earlier.original, sourceUrl: earlier.sourceUrl, label: '《Black Mamba》概念照',
    });
    const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId, label: name, selectEdition: mvRecognitionEdition}));
    assert.ok(html.includes('查看《Black Mamba》概念照') && html.includes('查看原作品图'), name);
    const preview = await sharp(path.join(__dirname, '../public', photo.preview)).metadata();
    const full = await sharp(path.join(__dirname, '../public', photo.original)).metadata();
    assert.deepEqual([preview.width, preview.height, full.width, full.height], [480, 640, 2000, 2997], name);
  }
});

test('woo!ah! retains its six debut members and each member’s own original MV still', () => {
  const series = editions['wooah-exclamation-202005'];
  const work = {id: 'recvxyH5pzlG0W', url: 'https://www.youtube.com/watch?v=X2FB37r4Oyw'};
  const roster = [
    ['recvxyICzH84mF', 'LUCY', '1255874555471491073', '2024 年 Singles 写真'],
    ['recvxyICzHi2X6', 'MINSEO', '1255149777370546184', '2024 年 Singles 写真'],
    ['recvxyICzHGJek', 'NANA', '1258411267095556096', '日本官网档案照'],
    ['recvxyICzHxcEJ', 'SONGYEE', null, null],
    ['recvxyICzHu6mX', 'SORA', '1257686490018189313', '2024 年 Singles 写真'],
    ['recvxyICzHzhWr', 'WOOYEON', '1254424997847658499', null],
  ];
  assert.deepEqual(series.works[0].memberIds, roster.map(([id]) => id));
  for (const [memberId, name, officialPost, previousLabel] of roster) {
    const still = media.portraits.find(row => row.workId === work.id && row.videoId === 'X2FB37r4Oyw' && row.memberId === memberId);
    const portrait = mvRecognitionEdition(still);
    assert.equal(portrait.label, 'EXCLAMATION · 出道发行预告照', name);
    if (officialPost) {
      const prefix = '/artist/recognition-editions/wooah/exclamation-' + name.toLowerCase();
      assert.equal(portrait.sourceUrl, 'https://x.com/WOOAH_HM/status/' + officialPost, name);
      assert.equal(portrait.preview, prefix + '.card.webp');
      assert.equal(portrait.original, prefix + '.original.jpg');
    } else {
      assert.equal(portrait.preview, '/artist/mv-release-portraits/cards/d2cfda4a4678b66f897b1120.webp', name);
      assert.match(portrait.sourceUrl, /2020\/05\/04\/wooah-a-4th-young-and-talented-member/);
    }
    assert.equal(portrait.previousEdition?.label ?? null, previousLabel, name);
    const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId, label: name, selectEdition: mvRecognitionEdition}));
    assert.ok(html.includes('查看原作品图') && html.includes('href="' + still.sourceUrl + '"'), name);
    assert.equal((html.match(/class="mv-identity-previous"/g) ?? []).length, previousLabel ? 2 : 1, name);
    if (previousLabel) {
      assert.ok(html.includes('查看' + previousLabel) && html.includes('href="' + portrait.previousEdition.sourceUrl + '"'), name);
      assert.ok(fs.existsSync(path.join(__dirname, '../public', portrait.previousEdition.original)), name);
    }
  }
});

const glassShoesForestProfiles = {
  JIHEON: ['933720556385443840', '2025《White Memories》认人照'],
  GYURI: ['933721822356373504', '2021《Talk & Talk》认人照'],
  CHAEYOUNG: ['933715527641567233', '2025《White Memories》认人照'],
  NAGYUNG: ['933716782308720642', '2019《FUN FACTORY》概念照'],
  SAEROM: ['933714268729384962', '2021《Talk & Talk》认人照'],
  SEOYEON: ['933719301005000704', '2021《Talk & Talk》认人照'],
  JIWON: ['933718041459810304', '2019《FUN FACTORY》概念照'],
  JISUN: ['933711748556664835', '2021《Talk & Talk》认人照'],
  HAYOUNG: ['933713008609566727', '2025《White Memories》认人照'],
};

test('Glass Shoes uses the nine named 2017 Forest profiles and keeps each dated earlier photo on its original recording', async () => {
  const workId = 'recvxyOz5XpBWP';
  const videoId = 'n2TtQYuFfWw';
  const fromis = require('../data/fromis9-public.json');
  const ids = Object.fromEntries(fromis.members.map(member => [member.stageName.split(' ').at(-1), member.id]));
  const work = {id: workId, url: 'https://www.youtube.com/watch?v=' + videoId};
  const campaign = editions['fromis-glass-shoes-forest-201711'];
  assert.equal(campaign.label, '2017 预出道 · 官方成员照');
  assert.deepEqual(new Set(campaign.works[0].memberIds), new Set(Object.keys(glassShoesForestProfiles).map(name => ids[name])));
  for (const [name, [post, priorLabel]] of Object.entries(glassShoesForestProfiles)) {
    const memberId = ids[name];
    const key = {workId, videoId, memberId};
    const selected = mvRecognitionEdition(key);
    const base = '/artist/recognition-editions/fromis9/glass-shoes-' + name.toLowerCase();
    assert.deepEqual([selected.preview, selected.original], [base + '.card.webp', base + '.original.jpg']);
    assert.equal(selected.sourceUrl, 'https://x.com/realfromis_9/status/' + post);
    const native = media.portraits.find(row => row.workId === workId && row.videoId === videoId && row.memberId === memberId);
    const hasSingleHistory = !['JIWON', 'NAGYUNG'].includes(name);
    const prior = hasSingleHistory ? native : editions['fromis-fun'].portraits[memberId];
    assert.deepEqual(selected.previousEdition, {label: priorLabel, original: prior.original ?? prior.src, sourceUrl: prior.sourceUrl});
    const tree = parse(renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId, label: name, selectEdition: mvRecognitionEdition})));
    assert.equal(tree.querySelector('.mv-identity-frame img').getAttribute('src'), selected.preview);
    assert.equal(tree.querySelector('figcaption').firstChild.text, campaign.label);
    assert.equal(tree.querySelector('figcaption a').getAttribute('href'), selected.sourceUrl);
    const history = tree.querySelectorAll('.mv-identity-history');
    assert.deepEqual(history.map(item => item.querySelector('button').text), hasSingleHistory ? ['查看' + priorLabel] : ['查看' + priorLabel, '查看原作品图']);
    assert.deepEqual(history.map(item => item.querySelector('a').getAttribute('href')), hasSingleHistory ? [prior.sourceUrl] : [prior.sourceUrl, native.sourceUrl]);
    const images = await Promise.all([selected.preview, selected.original].map(file => sharp(path.join(__dirname, '../public', file)).metadata()));
    assert.deepEqual(images.map(({format, width, height}) => [format, width, height]), [['webp', 480, 640], ['jpeg', 1500, 2250]]);
    assert.equal(mvRecognitionEdition({...key, videoId: 'KPFhzAtjbUo'}), null);
  }
});

const fromis2018Campaigns = [
  {series: 'fromis-from9-201810', prefix: 'love-bomb', posts: {
    JIHEON: '1047095373452328961', GYURI: '1047094444208484353', CHAEYOUNG: '1047095084515123200',
    NAGYUNG: '1047095228052566016', SAEROM: '1047093881156718592', SEOYEON: '1047094909499392001',
    JIWON: '1047094594985283585', JISUN: '1047094757057429504', HAYOUNG: '1047094065282473985',
  }},
  {series: 'fromis-to-heart-201801', prefix: 'to-heart', posts: {
    JIHEON: '952878037636272128', GYURI: '952884327901220864', CHAEYOUNG: '952876781823918080',
    NAGYUNG: '952880552784248832', SAEROM: '952875542344228864', SEOYEON: '952879295436746754',
    JIWON: '952883083295932416', JISUN: '952874267623931904', HAYOUNG: '952881826737020928',
  }},
  {series: 'fromis-to-day-201806', prefix: 'dkdk', posts: {
    JIHEON: '999621044972339200', CHAEYOUNG: '999983685532246016', NAGYUNG: '999983727605202944',
    SAEROM: '999983427486081024', SEOYEON: '999621145480462338', JIWON: '999621342587600896',
    JISUN: '999621559819030528', HAYOUNG: '999983553101287429',
  }},
];

for (const {series, prefix, posts} of fromis2018Campaigns) {
  test(prefix + ' uses the original 2018 campaign, retaining each member’s earlier source once', () => {
    const ids = Object.fromEntries(require('../data/fromis9-public.json').members.map(person => [person.stageName.split(' ').at(-1), person.id]));
    const campaign = editions[series];
    const binding = campaign.works[0];
    assert.deepEqual(new Set(binding.memberIds), new Set(Object.keys(posts).map(name => ids[name])));
    const work = {id: binding.workId, url: 'https://www.youtube.com/watch?v=' + binding.videoId};
    for (const [name, id] of Object.entries(posts)) {
      const memberId = ids[name];
      const photo = mvRecognitionEdition({...binding, memberId});
      const base = '/artist/recognition-editions/fromis9/' + prefix + '-' + name.toLowerCase();
      assert.equal(photo.preview, base + '.card.webp');
      assert.equal(photo.original, base + '.original.jpg');
      assert.equal(photo.sourceUrl, 'https://x.com/realfromis_9/status/' + id);
      const original = media.portraits.find(p => p.workId === work.id && p.videoId === binding.videoId && p.memberId === memberId);
      const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId, label: name, selectEdition: mvRecognitionEdition}));
      const oldLabel = (prefix === 'dkdk' && name === 'SEOYEON') ? '2021《Talk & Talk》认人照' : '《FUN FACTORY》概念照';
      const earlier = oldLabel.startsWith('2021') ? original : editions['fromis-fun'].portraits[memberId];
      assert.deepEqual(photo.previousEdition, {label: oldLabel, original: earlier.original ?? earlier.src, sourceUrl: earlier.sourceUrl});
      const history = parse(html).querySelectorAll('.mv-identity-history');
      assert.deepEqual(history.map(item => item.querySelector('button').text),
        earlier === original ? ['查看' + oldLabel] : ['查看' + oldLabel, '查看原作品图']);
      assert.deepEqual(history.map(item => item.querySelector('a').getAttribute('href')),
        earlier === original ? [original.sourceUrl] : [earlier.sourceUrl, original.sourceUrl]);
      if (earlier === original) {
        assert.equal(original.label, '同系列概念照 · 认人参考');
        assert.equal(history[0].querySelector('button').getAttribute('aria-label'), '查看' + name + '的' + oldLabel);
      }
    }
    if (prefix === 'dkdk') assert.equal(mvRecognitionEdition({...binding, memberId: ids.GYURI}), null);
  });
}

const wooahPostSets = [
  {
    title: 'Catch the Stars', series: 'wooah-catch-the-stars-202201', assetPrefix: 'catch-the-stars',
    posts: {
      LUCY: '1476206624096194561', MINSEO: '1476206381862731777', NANA: '1476207378802495490',
      SORA: '1476206875423170570', WOOYEON: '1476207127131611146',
    },
  },
  {
    title: 'Danger', series: 'wooah-joy-danger-202206', assetPrefix: 'joy-danger',
    posts: {
      LUCY: '1530202195336962050', MINSEO: '1530202175124606976', NANA: '1530202259543314433',
      SORA: '1530202210964938753', WOOYEON: '1530202239066730496',
    },
  },
];

for (const {title, series, assetPrefix, posts} of wooahPostSets) {
  test(title + ' uses the individual publisher posts and keeps the previous portrait for each of the five members', () => {
    const roster = require('../data/wooah-editorial.json').members;
    const selection = editions[series];
    assert.equal(Object.keys(selection.portraits).length, Object.keys(posts).length);
    for (const [name, post] of Object.entries(posts)) {
      const member = roster.find(person => person.name === name);
      const photo = selection.portraits[member.id];
      const prefix = '/artist/recognition-editions/wooah/' + assetPrefix + '-' + name.toLowerCase();
      assert.equal(photo.preview, prefix + '.card.webp');
      assert.equal(photo.original, prefix + '.original.jpg');
      assert.equal(photo.sourceUrl, 'https://x.com/WOOAH_HM/status/' + post);
      assert.equal(photo.previousEdition.original, member.image.runtime);
      assert.equal(photo.previousEdition.sourceUrl, member.image.sourcePage);
    }
  });
}

test('MACARONI CHEESE reuses its two shooting stills and keeps the earlier images accessible for the other three members', async () => {
  const work = {id: 'rec28ldfRTrFPR', url: 'https://www.youtube.com/watch?v=-6HWMkyTAaA'};
  const retained = new Set(['recvxAPQCFWkr2', 'recvxAPQCFgfgo']);
  const members = media.portraits.filter(row => row.workId === work.id);
  assert.equal(members.length, 5);
  for (const member of members) {
    const photo = mvRecognitionEdition(member);
    assert.equal(photo.label, '本 MV 拍摄现场照');
    assert.equal(photo.sourceUrl, 'https://www.melon.com/musicstory/inform.htm?mstorySeq=14254');
    assert.equal(photo.original === member.src, retained.has(member.memberId));
    const [preview, full] = await Promise.all([photo.preview, photo.original].map(src => sharp(path.join(__dirname, '../public', src)).metadata()));
    assert.deepEqual([preview.format, preview.width, preview.height], ['webp', 480, 640]);
    assert.deepEqual([full.format, full.width, full.height], ['jpeg', 736, 1104]);
    const html = renderToStaticMarkup(React.createElement(MvIdentityPhoto, {work, memberId: member.memberId, label: member.memberId, selectEdition: mvRecognitionEdition}));
    assert.ok(html.includes('src="' + photo.preview + '"'));
    assert.equal(html.includes('查看原作品图'), !retained.has(member.memberId));
    assert.equal(mvRecognitionEdition({...member, videoId: '_Scn9pIxLqU'}), null);
  }
});

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
      assert.equal(html.includes('查看原作品图'), old.src !== photo.original && old.src !== photo.previousEdition?.original, old.memberId);
      const preview = await sharp(path.join(__dirname, '../public', photo.preview)).metadata();
      assert.equal(preview.format, 'webp');
      assert.equal(preview.width * 4, preview.height * 3);
      assert.ok(!html.includes('src="' + photo.original + '"'), 'Full image should load on demand for ' + old.memberId);
      if (publisherSeries[series]) {
        assert.deepEqual([preview.width, preview.height], [480, 640]);
        assert.equal(photo.label, publisherSeries[series].label);
      } else {
        assert.match(photo.label, /本曲概念照|本次发行|出道发行预告照/);
        const original = await sharp(path.join(__dirname, '../public', photo.original)).metadata();
        assert.ok(original.width >= preview.width && original.height >= preview.height, old.memberId);
      }
      assert.equal(mvRecognitionEdition({...old, videoId: 'differentMV'}), null);
    }
  });
}
