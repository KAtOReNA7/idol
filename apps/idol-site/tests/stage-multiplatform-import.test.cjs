const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..'), now = new Date().toISOString(), id = 'recMultiPlatformFixture';
const env = {...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8'};
const evidence = {note: 'Synthetic reviewed same-song Korean full performance and upload provenance.', urls: ['https://example.org/source']};
const key = source => source.platform === 'bilibili'
  ? `bilibili:${source.videoId}:cid:${source.bilibili.cid}:p:${source.bilibili.page}`
  : source.videoId + (source.clip ? `@${source.clip.startSeconds}-${source.clip.endSeconds}` : '');
function candidate(overrides = {}) {
  const source = {videoId: 'BV1Ab2Cd3Ef4', platform: 'bilibili', bilibili: {cid: '123456789', page: 1},
    sourceClass: 'reupload', sourceEvidence: evidence, completeness: 'full', type: 'broadcast_stage',
    selection: {occasion: 'music_program', evidence}, eligibility: 'eligible', versionMatch: true, scorePolicy: 'score',
    title: 'Synthetic complete Korean music-program performance', channel: 'Synthetic uploader',
    publishedAt: '2026-01-01', checkedAt: now, languageVersionEvidence: {basis: evidence.note},
    likes: {value: null, display: '未知', precision: 'unknown'}, ...overrides};
  source.url ??= source.platform === 'bilibili'
    ? `https://www.bilibili.com/video/${source.videoId}?p=${source.bilibili?.page}`
    : `https://www.youtube.com/watch?v=${source.videoId}`;
  source.sourceUrl ??= source.url;
  return source;
}
function youtube(overrides = {}) {
  const source = candidate({platform: 'youtube', videoId: 'abcdefghijk', bilibili: undefined,
    sourceClass: 'official', likes: {value: 10, display: '10', precision: 'exact'}, ...overrides});
  delete source.bilibili;
  return source;
}
const reviewed = (selected, candidates = [selected], extra = {}) => ({checkedAt: now, items: [{recordId: id,
  status: 'verified', selected, candidates, reason: 'Explicit synthetic evidence review.', checkedAt: now, ...extra}]});
function decision(selected, compared) {
  return {method: 'manual_evidence', selectedSourceKey: key(selected), comparedSourceKeys: compared.map(key),
    reason: 'Human reviewed the exact uploads and selected this clearer complete source; metrics are not ranked.',
    evidence: {note: 'Exact versions and upload scope reviewed independently of popularity.', urls: compared.map(source => source.url)}};
}
function temporary(fn) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'idol-multiplatform-import-'));
  try { return fn(directory); } finally { fs.rmSync(directory, {recursive: true, force: true}); }
}
function normalize(input) {
  return temporary(directory => {
    const file = path.join(directory, 'review.json'); fs.writeFileSync(file, JSON.stringify(input));
    return spawnSync('python', [path.join(root, 'scripts/normalize-stage-patch.py'), file], {cwd: root, env, encoding: 'utf8'});
  });
}
function normalized(input) {const result = normalize(input); assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout);}
function identity(source) {
  return spawnSync('python', ['-c', 'import sys,json;sys.path.insert(0,"scripts");from stage_source_identity import checked_identity;print(checked_identity(json.load(sys.stdin)))'],
    {cwd: root, env, encoding: 'utf8', input: JSON.stringify(source)});
}
function merge(batch, options = {}) {
  return temporary(directory => {
    for (const name of ['scripts', 'data/stages']) fs.mkdirSync(path.join(directory, name), {recursive: true});
    for (const name of ['merge-stage-batch.py', 'stage_selection_policy.py', 'stage_source_identity.py']) fs.copyFileSync(path.join(root, 'scripts', name), path.join(directory, 'scripts', name));
    const write = (name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + '\n');
    const videos = options.catalog ? structuredClone(options.catalog) : options.previous ? {[id]: options.previous} : {};
    const inventory = options.inventory ? structuredClone(options.inventory) : [];
    inventory.push({recordId: id, groupIds: ['fixture-group'], song: 'Synthetic Song', mv: {videoId: 'originalMV1', officialTitle: 'Original official MV'}});
    const statuses = Object.fromEntries(inventory.map(work => [work.recordId, {status: videos[work.recordId] ? 'verified' : 'pending', reason: 'Synthetic', checkedAt: now}]));
    write('data/stage-videos.json', videos); write('data/stages/inventory.json', {works: inventory});
    write('data/stages/status.json', {works: statuses}); write('batch.json', batch);
    const capturedAt = options.capturedAt ?? now;
    write('fresh.json', {source: 'native', formatVersion: 'idol.native-data-export.v1', capturedAt,
      tables: {works: {fields: options.omitSchema ? [] : [{field_id: 'fld641ausT'}],
        records: [{recordId: id, fields: {fld641ausT: options.score ?? null}}]}},
      siteMetadata: {stageVideos: options.published ?? videos}, journal: options.journal ?? []});
    const before = fs.readFileSync(path.join(directory, 'data/stage-videos.json'), 'utf8');
    const result = spawnSync('python', [path.join(directory, 'scripts/merge-stage-batch.py'), path.join(directory, 'batch.json'), path.join(directory, 'fresh.json')], {cwd: directory, env, encoding: 'utf8'});
    const after = fs.readFileSync(path.join(directory, 'data/stage-videos.json'), 'utf8');
    return {...result, before, after, videos: JSON.parse(after), artifact: fs.existsSync(path.join(directory, 'data/stages/evidence/batch.json'))};
  });
}

test('Bilibili identity requires exact BV/CID/explicit page and preserves legacy YouTube keys', () => {
  const source = candidate(); assert.equal(identity(source).stdout.trim(), key(source));
  for (const variant of [candidate({bilibili: {cid: '123456789', page: 2}}), candidate({bilibili: {cid: '987654321', page: 1}})]) {
    assert.notEqual(identity(variant).stdout.trim(), key(source)); assert.equal(identity(variant).status, 0);
  }
  assert.equal(identity({...source, url: source.url.replace('www.', '') + '&cid=123456789'}).status, 0);
  const plain = youtube(), clip = {...plain, clip: {startSeconds: 12, endSeconds: 34}};
  assert.equal(identity(plain).stdout.trim(), 'abcdefghijk'); assert.equal(identity(clip).stdout.trim(), 'abcdefghijk@12-34');
  const invalid = [candidate({videoId: 'BVshort'}), candidate({bilibili: {cid: '0', page: 1}}),
    candidate({bilibili: {cid: '01', page: 1}}), candidate({bilibili: {cid: '1'.repeat(21), page: 1}}),
    candidate({bilibili: {cid: 123, page: 1}}), candidate({bilibili: {cid: '123', page: 0}}),
    candidate({bilibili: {cid: '123', page: true}}), candidate({bilibili: {cid: '123', page: Number.MAX_SAFE_INTEGER + 1}}),
    {...source, bilibili: undefined}, {...source, clip: {startSeconds: 0, endSeconds: 120}},
    ...[source.url.replace('?p=1', ''), source.url + '&p=2', source.url + '&cid=999', source.url + '#part2',
      source.url.replace('https:', 'http:'), source.url.replace('.com/', '.com:443/'), source.url.replace('//', '//user:pass@'),
      source.url.replace('bilibili.com', 'bilibili.com.example.org')].map(url => ({...source, url}))];
  for (const value of invalid) assert.notEqual(identity(value).status, 0, JSON.stringify(value));
});

test('unknown likes and an honestly marked reupload can become a fresh exact Bilibili stage', () => {
  const selected = candidate(), batch = normalized(reviewed(selected)), result = merge(batch);
  assert.equal(result.status, 0, result.stderr);
  const stage = result.videos[id];
  assert.equal(stage.sourceClass, 'reupload'); assert.match(stage.kind, /转载/); assert.doesNotMatch(stage.kind, /官方/);
  assert.deepEqual(stage.bilibili, selected.bilibili); assert.equal(stage.scoreBinding.sourceKey, key(selected));
  assert.equal(stage.scoreBinding.initialScore, null); assert.equal(stage.scoreBinding.initializedAt, now);
  assert.deepEqual(stage.likes, {value: null, display: '未知', precision: 'unknown'});
  assert.equal(stage.likesScope, 'whole_video'); assert.doesNotMatch(stage.selectionNote, /点赞最高/);
  assert.deepEqual(stage.candidates[0].bilibili, selected.bilibili); assert.equal(stage.candidates[0].platform, 'bilibili');
  assert.equal(stage.candidates[0].videoId, selected.videoId);
  assert.equal(merge(normalized(reviewed(youtube({sourceClass: 'third_party'})))).status, 0);
});

test('partial videos, mismatched language/version, excluded occasions and fabricated upload classes still fail', () => {
  for (const change of [{completeness: 'excerpt'}, {versionMatch: false}, {sourceClass: 'unknown'}, {sourceEvidence: undefined},
    {selection: {occasion: 'concert', evidence}}, {type: 'festival_stage'}, {scorePolicy: 'view_only'}]) {
    assert.notEqual(normalize(reviewed(candidate(change))).status, 0, JSON.stringify(change));
  }
  for (const metric of ['views', 'coins', 'favorites']) assert.notEqual(normalize(reviewed(candidate({likes: {value: 500, display: '500', precision: 'exact', metric}}))).status, 0);
  assert.notEqual(normalize(reviewed(candidate({likes: {value: 0, display: '未知', precision: 'unknown'}}))).status, 0);
});

test('same BV with different CID or page cannot satisfy selected-candidate evidence or same-source matching', () => {
  const selected = candidate(), other = candidate({bilibili: {cid: '222222222', page: 2}});
  assert.notEqual(normalize(reviewed(selected, [other])).status, 0);
  const batch = normalized(reviewed(selected)); batch.items[0].selected.bilibili = other.bilibili; batch.items[0].selected.url = other.url;
  const result = merge(batch); assert.notEqual(result.status, 0); assert.equal(result.before, result.after); assert.equal(result.artifact, false);
});

test('cross-platform popularity requires an exact manual decision and never ranks views or coins as likes', () => {
  const selected = candidate({likes: {value: 100000, display: '100000', precision: 'exact'}}), other = youtube();
  assert.notEqual(normalize(reviewed(selected, [selected, other])).status, 0);
  const proof = decision(selected, [selected, other]);
  const batch = normalized(reviewed(selected, [selected, other], {selectionDecision: proof}));
  const result = merge(batch); assert.equal(result.status, 0, result.stderr);
  assert.match(result.videos[id].selectionNote, /人工选择/); assert.doesNotMatch(result.videos[id].selectionNote, /最高/);
  for (const change of [{selectedSourceKey: other.videoId}, {comparedSourceKeys: [key(selected)]}, {reason: ''},
    {evidence: {note: 'Unsupported choice', urls: [selected.url]}}]) {
    assert.notEqual(normalize(reviewed(selected, [selected, other], {selectionDecision: {...proof, ...change}})).status, 0);
  }
  const bypass = structuredClone(batch); delete bypass.items[0].selectionDecision;
  const refused = merge(bypass); assert.notEqual(refused.status, 0); assert.equal(refused.before, refused.after);
});

test('unknown metrics cannot erase better policy tiers and ambiguous same-tier choices require evidence', () => {
  const program = candidate(), practice = youtube({type: 'practice_room', selection: {occasion: 'practice_room', evidence}});
  assert.notEqual(normalize(reviewed(practice, [program, practice])).status, 0);
  assert.notEqual(normalize(reviewed(program, [program, practice])).status, 0, 'different platform still requires documented human choice');
  assert.equal(normalize(reviewed(program, [program, practice], {selectionDecision: decision(program, [program, practice])})).status, 0);
  const other = candidate({videoId: 'BV9Xy8Za7Bc6', likes: {value: 20, display: '20', precision: 'exact'}});
  assert.notEqual(normalize(reviewed(other, [program, other])).status, 0);
  assert.equal(normalize(reviewed(other, [program, other], {selectionDecision: decision(other, [program, other])})).status, 0);
});

test('new-platform adoption holds zero/nonempty scores and any save history; malformed or stale preimages fail atomically', () => {
  const batch = normalized(reviewed(candidate()));
  for (const options of [{score: 0}, {score: 5}, {journal: [{record_id: id, table_key: 'works', status: 'done'}]},
    {journal: [{record_id: id, table_key: 'works', status: 'pending'}]}]) {
    const result = merge(batch, options); assert.equal(result.status, 0, result.stderr); assert.equal(result.after, result.before);
  }
  for (const options of [{omitSchema: true}, {journal: [{recordId: id}]}, {capturedAt: '2020-01-01T00:00:00Z'},
    {published: {[id]: youtube()}}]) {
    const result = merge(batch, options); assert.notEqual(result.status, 0); assert.equal(result.after, result.before); assert.equal(result.artifact, false);
  }
});

test('unknown-like or cross-platform replacement cannot happen automatically, even at a better program priority', () => {
  const previous = youtube({type: 'practice_room', selection: {occasion: 'practice_room', evidence}});
  previous.scoreBinding = {videoId: previous.videoId, sourceKey: key(previous), initializedAt: now, initialScore: null};
  const selected = candidate(), batch = normalized(reviewed(selected));
  const held = merge(batch, {previous}); assert.equal(held.status, 0, held.stderr); assert.equal(held.before, held.after);
  batch.items[0].replacementDecision = decision(selected, [previous, selected]);
  const accepted = merge(batch, {previous}); assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(accepted.videos[id].scoreBinding.sourceKey, key(selected));
  const archived = {...accepted.videos[id].previousSources.at(-1)};
  for (const field of ['changedAt', 'reason', 'preference', 'previousOccasionReview']) delete archived[field];
  assert.deepEqual(archived, previous);
  for (const options of [{score: 0}, {journal: [{record_id: id, table_key: 'works', status: 'done'}]}]) {
    const result = merge(batch, {previous, ...options}); assert.equal(result.status, 0); assert.equal(result.before, result.after);
  }
  const changed = merge(batch, {previous, published: {[id]: {...previous, title: 'Changed published preimage'}}});
  assert.notEqual(changed.status, 0); assert.equal(changed.before, changed.after);
  const unknownPrevious = {...previous, likes: {value: null, display: '未知', precision: 'unknown'}};
  const knownNext = youtube({videoId: 'newsource12'});
  const unknownHeld = merge(normalized(reviewed(knownNext)), {previous: unknownPrevious});
  assert.equal(unknownHeld.status, 0, unknownHeld.stderr); assert.equal(unknownHeld.before, unknownHeld.after);
});

test('different Bilibili parts never retain the old binding as a same-video metadata update', () => {
  const previous = candidate({likes: {value: 10, display: '10', precision: 'exact'}});
  previous.scoreBinding = {videoId: previous.videoId, sourceKey: key(previous), initializedAt: '2026-01-01T00:00:00Z', initialScore: null};
  const selected = candidate({bilibili: {cid: '222222222', page: 2}}), batch = normalized(reviewed(selected));
  const held = merge(batch, {previous}); assert.equal(held.status, 0, held.stderr); assert.equal(held.before, held.after);
  const knownPart = candidate({bilibili: {cid: '222222222', page: 2}, likes: {value: 1000, display: '1000', precision: 'exact'}});
  const knownHeld = merge(normalized(reviewed(knownPart)), {previous});
  assert.equal(knownHeld.status, 0, knownHeld.stderr); assert.equal(knownHeld.before, knownHeld.after, 'BV-level counts cannot rank its parts');
  batch.items[0].replacementDecision = decision(selected, [previous, selected]);
  const replaced = merge(batch, {previous}); assert.equal(replaced.status, 0, replaced.stderr);
  assert.equal(replaced.videos[id].scoreBinding.sourceKey, key(selected));
  assert.deepEqual(JSON.parse(replaced.stdout).updatedSameVideoMetadata, []);
  assert.deepEqual(JSON.parse(replaced.stdout).replacedUnscoredSources, [id]);
});

test('cross-work reuse and audio equivalence compare the complete BV/CID/page identity', () => {
  const existingId = 'recOtherWork', existing = candidate(), inventory = [{recordId: existingId, groupIds: ['fixture-group'], song: 'Different Song'}];
  const options = {catalog: {[existingId]: existing}, inventory};
  const samePart = merge(normalized(reviewed(candidate())), options); assert.notEqual(samePart.status, 0); assert.equal(samePart.before, samePart.after);
  const differentPart = candidate({bilibili: {cid: '222222222', page: 2}});
  assert.equal(merge(normalized(reviewed(differentPart)), options).status, 0);
  differentPart.audioEquivalence = {originalBoundWorkId: existingId, sameAudio: true, basis: 'Synthetic same audio assertion', evidence: [{url: existing.url}]};
  const wrongPart = merge(normalized(reviewed(differentPart)), options); assert.notEqual(wrongPart.status, 0); assert.equal(wrongPart.before, wrongPart.after);
});

test('adding a separate Bilibili fixture preserves all 497 existing YouTube objects and legacy key bytes', () => {
  const catalogFile = path.join(root, 'data/stage-videos.json'), originalBytes = fs.readFileSync(catalogFile);
  const catalog = JSON.parse(originalBytes), inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/stages/inventory.json'))).works;
  assert.equal(Object.keys(catalog).length, 497);
  assert.equal(crypto.createHash('sha256').update(originalBytes).digest('hex'), 'b84a7261ed7b139526ca75e070779f84946ef6968bc2eeb4bb09e314f6d79b56');
  const result = merge(normalized(reviewed(candidate())), {catalog, inventory}); assert.equal(result.status, 0, result.stderr);
  delete result.videos[id]; assert.deepEqual(result.videos, catalog);
  for (const [workId, source] of Object.entries(catalog)) {
    assert.equal(JSON.stringify(result.videos[workId]), JSON.stringify(source));
    assert.equal(key(result.videos[workId]), key(source));
  }
  assert.deepEqual(fs.readFileSync(catalogFile), originalBytes, 'no application writes');
});
