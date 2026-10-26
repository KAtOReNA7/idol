/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness uses require and a TypeScript VM loader. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// No snapshot, database, server or credentials are loaded by this suite.
class AppError extends Error {
  constructor(code, message, status) { super(message); Object.assign(this, {code, status}); }
}
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename);
  const exports = {}; cache.set(filename, exports);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText;
  const requireLocal = name => {
    const imageModule=require('./helpers/image-dependency-loader.cjs').imageDependency(name);if(imageModule!==undefined)return imageModule;const timelineModule=require('./helpers/timeline-dependency-loader.cjs').timelineDependency(name);if(timelineModule!==undefined)return timelineModule;
    if (name === './feishu') return {AppError};
    if (!name.startsWith('.')) throw new Error('Unexpected dependency in pure test: ' + name);
    return load(path.resolve(path.dirname(filename), name + '.ts'));
  };
  vm.runInNewContext('(function(require,exports){' + code + '\n})', {
    URL, URLSearchParams, crypto: require('node:crypto').webcrypto,
  }, {filename})(requireLocal, exports);
  return exports;
}
const registry = load('lib/idol/candidate/registry.ts');
const navigation = load('lib/idol/artist-navigation.ts');
const catalog = load('lib/idol/artist-catalog.ts');
const preview = load('lib/idol/artist-preview.ts');
const journey = load('lib/idol/journey.ts');
const personal = load('lib/idol/member-works.ts');
const names = load('lib/idol/member-display-name.ts');
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/candidate37.synthetic.json', 'utf8'));
const metadata = fixture._candidate37Test;
const plain = value => JSON.parse(JSON.stringify(value));
const clone = () => plain(fixture);

test('37 registry entries match the reviewed public group identities without collisions', () => {
  assert.equal(registry.candidateArtists.length, 37);
  for (const key of ['slug', 'groupId', 'path']) {
    assert.equal(new Set(registry.candidateArtists.map(x => x[key])).size, 37, key);
  }
  assert.deepEqual(plain(registry.candidateArtists.map(({slug, groupId, name}) => ({slug, groupId, name}))),
    metadata.candidateGroups.map(({slug, groupId, name}) => ({slug, groupId, name})));
  for (const artist of registry.candidateArtists) {
    assert.equal(artist.path, '/artists/' + artist.slug);
    assert.equal(registry.candidateArtistCatalog[artist.slug], artist.groupId);
    assert.equal(navigation.groupArtistUrl(artist.groupId), artist.path);
    assert.equal(navigation.artistReturnLabel(artist.path), artist.name);
    assert.equal(registry.candidateExperienceClass([artist.groupId]), 'candidate-experience candidate-' + artist.slug + '-experience');
  }
  assert.equal(registry.candidateArtistPath('recTestUnknown'), null);
  assert.equal(registry.candidateExperienceClass(['recTestUnknown']), undefined);
});

test('requestedArtist accepts all 37 slugs and rejects malformed or duplicate scopes', () => {
  assert.equal(catalog.requestedArtist(new URLSearchParams()), null);
  for (const artist of registry.candidateArtists) {
    assert.equal(catalog.requestedArtist(new URLSearchParams({artist: artist.slug})), artist.groupId);
  }
  for (const query of ['artist=', 'artist=MEOVV', 'artist=rec28ldfRTiC6k', 'artist=__proto__',
    'artist=constructor', 'artist=toString', 'artist=meovv&artist=idle',
    'artist=meovv&artist=meovv', 'artist=https%3A%2F%2Fevil.invalid', 'artist=..%2Fidle']) {
    assert.throws(() => catalog.requestedArtist(new URLSearchParams(query)), e => e.code === 'INVALID_ARTIST' && e.status === 400, query);
  }
});

test('all candidate routes round-trip member, queue, multilingual search and video format', () => {
  for (const artist of registry.candidateArtists) {
    // These three public readers now allow only their reviewed member identities.
    const memberId = require('../data/public-artist-navigation-keys.json').groups[artist.slug]?.memberIds[0] ?? 'recTestRouteMember';
    for (const section of ['overview', 'works', 'members', 'updates', 'records']) {
      const route = {section, member: memberId, queue: 'rewatch', search: '中文 空格 & +' + artist.name, format: 'stage'};
      const href = preview.artistRouteUrl(route, artist.path);
      assert.equal(navigation.safeArtistReturn(href), href);
      assert.deepEqual(plain(preview.artistRoute(href)), {...route,timeline:section==='updates'?{type:'all',importance:'major',order:'recent'}:null});
      const workHref = preview.artistWorkUrl({id: 'recTestRouteWork'}, true, href);
      assert.equal(journey.readRoute(workHref).artistReturn, href);
      assert.equal(journey.readRoute(workHref).video, 'stage');
      assert.equal(journey.routeUrl(journey.readRoute(workHref)), workHref);
      assert.equal(navigation.memberArtistUrl({id: memberId, groupIds: [artist.groupId]}), artist.path + '?section=members&member=' + memberId);
    }
  }
});

test('candidate return navigation rejects external URLs, private parameters and invalid values', () => {
  for (const artist of registry.candidateArtists) {
    for (const value of ['https://evil.invalid' + artist.path, '//evil.invalid' + artist.path,
      'javascript:alert(1)', '/api/save', artist.path + '#fragment',
      artist.path + '?token=private', artist.path + '?score=9', artist.path + '?note=test',
      artist.path + '?section=bad', artist.path + '?section=works&section=members',
      artist.path + '?member=https://evil.invalid', artist.path + '?member=recTest%2Fother',
      artist.path + '?queue=bad', artist.path + '?format=bad', artist.path + '?format=mv&format=stage',
      artist.path + '?q=' + '中'.repeat(201)]) {
      assert.equal(navigation.safeArtistReturn(value), null, value);
    }
  }
});

test('the existing 14 artist entry identities retain their exact routes', () => {
  const previous = [
    ['BABYMONSTER', 'babymonster'], ['ILLIT', 'illit'], ['XG', 'xg'], ['AESPA', 'aespa'],
    ['IVE', 'ive'], ['KIOF', 'kissoflife'], ['STAYC', 'stayc'], ['NMIXX', 'nmixx'],
    ['HEARTS2HEARTS', 'hearts2hearts'], ['KIIIKIII', 'kiiikiii'], ['ITZY', 'itzy'],
    ['LESSERAFIM', 'lesserafim'], ['SAYMYNAME', 'saymyname'], ['KATSEYE', 'katseye'],
  ];
  assert.equal(previous.length, 14);
  for (const [constant, slug] of previous) {
    const id = navigation[constant + '_GROUP_ID'];
    assert.ok(id);
    assert.equal(navigation.groupArtistUrl(id), '/artists/' + slug);
    assert.equal(catalog.requestedArtist(new URLSearchParams({artist: slug})), id);
    assert.equal(navigation.safeArtistReturn('/artists/' + slug + '?section=works'), '/artists/' + slug + '?section=works');
    assert.equal(registry.candidateArtists.some(x => x.groupId === id), false);
  }
});

test('synthetic fixture preserves source fixture rows and never pretends test identities are production members', () => {
  const source = JSON.parse(fs.readFileSync('tests/fixtures/catalog.synthetic.json', 'utf8'));
  for (const collection of ['groups', 'members', 'works', 'ratings']) {
    for (const row of source[collection]) assert.deepEqual(fixture[collection].find(item => item.id === row.id), row);
    assert.equal(new Set(fixture[collection].map(row => row.id)).size, fixture[collection].length);
  }
  assert.equal(fixture.mode, 'snapshot');
  assert.match(fixture.warning, /合成测试数据，保存已禁用/);
  assert.equal(metadata.notProductionRecords, true);
  const publicIds = new Set(metadata.publicSampleMembers.map(m => m.memberId));
  assert.equal(publicIds.size, 10);
  for (const group of metadata.candidateGroups) {
    assert.equal(group.workIds.length, 3);
    for (const memberId of group.memberIds) {
      const member = fixture.members.find(m => m.id === memberId);
      assert.equal(member.favorite, null);
      assert.equal(member.note, '');
      if (!publicIds.has(memberId)) { assert.match(memberId, /^recTest/); assert.match(member.cnName, /测试成员/); }
    }
  }
  for (const identity of metadata.publicSampleMembers) {
    const member = fixture.members.find(m => m.id === identity.memberId);
    assert.equal(member.stageName, identity.stageName);
    assert.equal(names.memberChineseName(member), identity.displayName);
    assert.equal(names.memberDisplayName(member), identity.displayName + ' · ' + identity.stageName);
  }
});

test('each candidate has distinct zero, null and nine scores plus present and missing stages', () => {
  for (const group of metadata.candidateGroups) {
    const collection = preview.artistCollection(fixture, group.groupId);
    assert.ok(collection);
    assert.equal(collection.works.length, 3);
    assert.equal(collection.mv.mean, 4.5);
    assert.equal(collection.mv.count, 2);
    const works = group.workIds.map(id => fixture.works.find(w => w.id === id));
    assert.deepEqual(works.map(w => w.score), [0, null, 9]);
    assert.deepEqual(works.map(w => Boolean(w.stage)), [true, false, true]);
    assert.equal(preview.artistWorkScoreLabel(works[0].score), '0.0');
    assert.equal(preview.artistWorkScoreLabel(works[1].score), '未评分');
    assert.equal(preview.artistWorkRows(works, 'tonight', '').length, 1);
    assert.equal(preview.artistWorkRows(works, 'unrated', '').length, 0, 'unwatched is a separate queue');
    assert.equal(preview.artistWorkRows(works.map(w => ({...w, watched: '已观看'})), 'unrated', '').length, 1);
  }
});

test('IZ*ONE, Cherry Bullet and PURPLE KISS retain true empty member collections', () => {
  for (const slug of metadata.emptyRosterSlugs) {
    const group = metadata.candidateGroups.find(g => g.slug === slug);
    const scoped = catalog.projectArtistCatalog(fixture, group.groupId);
    assert.deepEqual(group.memberIds, []);
    assert.equal(scoped.members.length, 0);
    assert.equal(scoped.ratings.length, 0);
    assert.equal(preview.artistCollection(scoped, group.groupId).members.length, 0);
    assert.equal(scoped.works.length, 3);
  }
  assert.equal(preview.artistCollection(fixture, 'recTestMissing'), null);
  assert.throws(() => catalog.projectArtistCatalog(fixture, 'recTestMissing'), e => e.status === 404);
});

test('candidate projection keeps linked solo and cross-group personal works with equal summaries', () => {
  const data = clone(), before = JSON.stringify(data), relation = metadata.crossGroupCase;
  const scoped = catalog.projectArtistCatalog(data, relation.homeGroupId);
  assert.ok(scoped.works.some(w => w.id === relation.soloWorkId));
  assert.ok(scoped.works.some(w => w.id === relation.otherWorkId));
  assert.ok(scoped.groups.some(g => g.id === relation.otherGroupId));
  assert.deepEqual(plain(personal.memberWorks(scoped, relation.memberId)), plain(personal.memberWorks(data, relation.memberId)));
  assert.deepEqual(plain(personal.memberWorkSummary(personal.memberWorks(scoped, relation.memberId))),
    plain(personal.memberWorkSummary(personal.memberWorks(data, relation.memberId))));
  assert.equal(preview.artistCollection(scoped, relation.homeGroupId).works.length, 3, 'foreign and solo works are retained for members, not relabeled as group releases');
  for (const row of scoped.works) assert.strictEqual(row, data.works.find(w => w.id === row.id));
  for (const row of scoped.ratings) assert.strictEqual(row, data.ratings.find(r => r.id === row.id));
  assert.equal(JSON.stringify(data), before);
});

test('all 37 projections preserve every source row and keep local mode read-only', () => {
  const data = clone(), before = JSON.stringify(data);
  for (const artist of registry.candidateArtists) {
    const scoped = catalog.projectArtistCatalog(data, artist.groupId);
    assert.equal(scoped.mode, 'snapshot');
    assert.equal(scoped.warning, data.warning);
    assert.equal(scoped.scope.groupId, artist.groupId);
    assert.equal(scoped.counts.ratedWorks, scoped.works.filter(w => w.score !== null).length);
    assert.equal(scoped.counts.scoreSum, scoped.works.reduce((sum, w) => sum + (w.score ?? 0), 0));
    for (const member of data.members.filter(m => m.groupIds.includes(artist.groupId))) {
      assert.deepEqual(plain(personal.memberWorkSummary(personal.memberWorks(scoped, member.id))),
        plain(personal.memberWorkSummary(personal.memberWorks(data, member.id))));
    }
  }
  assert.equal(JSON.stringify(data), before);
});
