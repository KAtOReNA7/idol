const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const overlay = path.resolve(__dirname, '..');
const repo = process.env.IDOL_REPO || overlay;
const ts = require(require.resolve('typescript', {paths: [repo]}));
const React = require(require.resolve('react', {paths: [repo]}));
const {renderToStaticMarkup} = require(require.resolve('react-dom/server', {paths: [repo]}));
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/unis-kep1er-public-profiles.json')));
const helperFile = 'lib/idol/member-public-profile.ts';
const cache = new Map();
let stagedSharedSource;

function load(rel) {
  const file = path.join(repo, rel);
  if (cache.has(file)) return cache.get(file);
  if (rel.endsWith('.json')) return JSON.parse(fs.readFileSync(file));
  const source = rel === helperFile ? fs.readFileSync(path.join(overlay, rel), 'utf8')
    : rel === 'components/member-career-facts.tsx' ? stagedSharedSource
    : fs.readFileSync(file, 'utf8');
  const result = {};
  cache.set(file, result);
  const compiled = ts.transpileModule(source, {compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  }}).outputText;
  vm.runInNewContext('(function(require,exports){' + compiled + '})', {URL, Date})(name => {
    if (name.endsWith('.css')) return {};
    if (name.startsWith('@/')) {
      let next = name.slice(2);
      if (!path.extname(next)) next += '.ts';
      return load(next);
    }
    if (name.startsWith('.')) {
      let next = path.posix.normalize(path.posix.join(path.posix.dirname(rel), name));
      if (!path.extname(next)) next += '.ts';
      return load(next);
    }
    return require(require.resolve(name, {paths: [repo]}));
  }, result);
  return result;
}

// Standalone delivery runs the exact proposed two-line wiring in memory only.
// Set PROFILE_COPY_INTEGRATED=1 after applying to require the real callsites.
function sharedSource() {
  const source = fs.readFileSync(path.join(repo, 'components/member-career-facts.tsx'), 'utf8');
  if (/publicMemberProfile\(member\)/.test(source)) return source;
  assert.ok(!process.env.PROFILE_COPY_INTEGRATED, 'Shared profile callsite has not been integrated');
  assert.equal((source.match(/member\.profile/g) || []).length, 3);
  return "import {publicMemberProfile} from '@/lib/idol/member-public-profile';\n" + source
    .replace(' const facts=', ' const profile=publicMemberProfile(member);\n const facts=')
    .replaceAll('member.profile', 'profile');
}
stagedSharedSource = sharedSource();
const {publicMemberProfile} = load(helperFile);
const {MemberCareerFacts} = load('components/member-career-facts.tsx');
const {asText, asIds} = load('lib/idol/values.ts');
const snapshot = JSON.parse(fs.readFileSync(path.join(repo, 'data/snapshot.json')));
const groups = new Set(['rec28ldfRTiCWc', 'recvxyEBDZ8A0W']);
const members = snapshot.tables.members.records.map(row => ({
  id: row.recordId, groupIds: asIds(row.fields.fld6bhQOdO),
  formerGroupIds: asIds(row.fields.fldf1alCIu), profile: asText(row.fields.fld2J3j9r8),
})).filter(member => [...member.groupIds, ...member.formerGroupIds].some(id => groups.has(id)));

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const fullMember = row => ({...row, officialUrl: 'https://example.com/member', note: 'private-note-sentinel', favorite: 7, watched: 'private-view-state'});

test('review covers exactly eight UNIS and nine current/former Kep1er records', () => {
  assert.equal(members.length, 17);
  assert.equal(members.filter(m => m.groupIds.includes('rec28ldfRTiCWc')).length, 8);
  assert.deepEqual(members.map(m => m.id).sort(), fixture.members.map(m => m.id).sort());
  for (const row of fixture.members) {
    const live = members.find(m => m.id === row.id);
    assert.equal(live.profile, row.profile, 'Snapshot source changed: ' + row.id);
  }
});

test('only four reviewed profiles change; all 17 inputs and private fields stay intact', () => {
  let changed = 0;
  for (const row of fixture.members) {
    const member = freeze(fullMember(row));
    const before = JSON.stringify(member);
    const display = publicMemberProfile(member);
    assert.equal(display, row.expected, row.id);
    assert.equal(JSON.stringify(member), before);
    changed += Number(display !== row.profile);
  }
  assert.equal(changed, 4);
});

test('exact id, actual group relationship, and complete original-text guards are all required', () => {
  for (const row of fixture.members.filter(m => m.profile !== m.expected)) {
    for (const update of [
      {id: 'unreviewed-member'},
      {groupIds: ['unrelated-group'], formerGroupIds: []},
      {profile: row.profile + '更新资料。'},
      {profile: row.profile.replace('Kep1er', 'Kep1er ')},
    ]) {
      const member = {...row, ...update};
      assert.equal(publicMemberProfile(member), member.profile);
    }
    assert.equal(publicMemberProfile({...row, groupIds: [], formerGroupIds: ['recvxyEBDZ8A0W']}), row.expected);
    assert.equal(publicMemberProfile({...row, formerGroupIds: undefined}), row.expected);
    assert.equal(publicMemberProfile({...row, profile: ''}), '');
  }
});

test('self-report attribution, roster evidence and announcement-date meaning remain specific', () => {
  for (const row of fixture.members.filter(m => m.groupIds.includes('rec28ldfRTiCWc'))) {
    assert.equal(publicMemberProfile(row), row.profile);
  }
  const young = fixture.members.find(m => m.id === 'recvxyICzHHBnl');
  assert.equal(publicMemberProfile(young), young.profile);
  assert.match(publicMemberProfile(young), /2026年3月6日获公告结束在团活动/);
  assert.match(publicMemberProfile(fixture.members.find(m => m.id === 'recvxyICzHkiWq')), /名列公司公布的六人成员名单/);
  const bahiyyih = publicMemberProfile(fixture.members.find(m => m.id === 'recvxyICzHvPnL'));
  assert.equal(bahiyyih, 'Kep1er 出道成员，美国籍。');
  assert.doesNotMatch(bahiyyih, /不能|改填|核验|公开报道明确/);
});

test('staged shared React callsite renders one clean intro per member without exposing private fields', () => {
  for (const row of fixture.members) {
    const member = freeze(fullMember(row));
    const before = JSON.stringify(member);
    const markup = renderToStaticMarkup(React.createElement(MemberCareerFacts, {member}));
    assert.equal((markup.match(/class="member-career-intro"/g) || []).length, 1, row.id);
    assert.ok(markup.includes(row.expected), row.id);
    assert.doesNotMatch(markup, /private-note-sentinel|private-view-state|不能因韩国出生或K组经历改填韩国籍/);
    assert.equal(JSON.stringify(member), before);
  }
});

test('unreviewed shared consumers retain original copy, source links and empty-state behavior', () => {
  const member = {id: 'unreviewed', groupIds: [], formerGroupIds: [], profile: '原始介绍保持不变。', officialUrl: 'https://example.com/profile'};
  const html = m => renderToStaticMarkup(React.createElement(MemberCareerFacts, {member: m}));
  assert.match(html(member), /原始介绍保持不变。/);
  assert.match(html(member), /相关官方页面/);
  assert.equal(html({...member, profile: '', officialUrl: ''}), '');
  assert.doesNotMatch(html({...member, officialUrl: 'javascript:alert(1)'}), /javascript:|相关官方页面/);
});

test('UNIS integration removes only the duplicate raw paragraph and keeps both fact sections', () => {
  const file = path.join(repo, 'components/design-review/unis-design-review.tsx');
  const source = fs.readFileSync(file, 'utf8');
  const duplicate = '{person.profile && <p>{person.profile}</p>}';
  const alreadyIntegrated = !source.includes(duplicate);
  if (process.env.PROFILE_COPY_INTEGRATED) assert.ok(alreadyIntegrated, 'UNIS duplicate raw paragraph is still present');
  else if (!alreadyIntegrated) assert.equal(source.split(duplicate).length - 1, 1);
  const staged = source.replace(duplicate, '');
  assert.doesNotMatch(staged, /\{person\.profile\s*&&/);
  for(const part of ['intro','history','sources'])assert.equal((staged.match(new RegExp('<MemberCareerFacts member=\\{person\\} part="'+part+'"/>','g'))||[]).length,1);
  assert.equal((staged.match(/<MemberPhysicalFacts member=\{person\}\/>/g) || []).length, 1);
});
