import assert from 'node:assert/strict';
import {copyFile, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {build, normalizePath} from 'vite';
import {groupInformationDisplay} from '../build/group-information-display.mjs';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const component = 'components/artist-information.tsx';
const renderer = 'lib/idol/group-information.mjs';
const inputs = ['music-index-artwork.json', 'group-information-facts.json', 'group-statistics-completion-evidence.json'];

async function compile(root, project, entry = component) {
  const filename = normalizePath(path.resolve(root, entry));
  const plugins = [{
    name: 'test-group-information-exports',
    enforce: 'pre',
    transform(source, id) {
      if (entry !== component || id !== filename) return;
      // Exercise the actual component import using its production path and Vite resolution.
      const binding = source.match(/import\s*\{[^}]*\brenderGroupInformation\b[^}]*\}\s*from\s*['"][^'"]+['"]/);
      assert.ok(binding, 'The display component imports the renderer');
      return binding[0].replace(/^import/, 'export');
    },
  }];
  if (project) plugins.push(groupInformationDisplay());
  const [result] = await build({
    root, configFile: false, logLevel: 'error', plugins, resolve: {alias: {'@': root}},
    build: {write: false, minify: true, lib: {entry: filename, formats: ['es']}},
  });
  const [chunk] = result.output.filter(item => item.type === 'chunk');
  const api = await import('data:text/javascript;base64,' + Buffer.from(chunk.code).toString('base64'));
  return {api, code: chunk.code, modules: Object.keys(chunk.modules)};
}

const catalogVariants = [
  undefined,
  {social: []},
  {social: [
    {platform: 'instagram', url: 'https://example.org/group', countLabel: '2万', observedAt: '2026-01-01'},
    {platform: 'youtube', url: 'javascript:void(0)', countLabel: '3万'},
  ], note: 'PRIVATE_GROUP_INFO_CANARY', watched: true, average: 9},
];

function compareRenderers(original, projected, slugs) {
  for (const slug of slugs) {
    assert.equal(projected.informationGroupId(slug), original.informationGroupId(slug), slug);
    for (const group of catalogVariants) {
      const html = projected.renderGroupInformation(slug, group);
      assert.equal(html, original.renderGroupInformation(slug, group), slug);
      assert.doesNotMatch(html, /PRIVATE_GROUP_INFO_CANARY|javascript:void/);
    }
  }
}

test('all artist information and an unknown group render the same first response and catalog states with production browser inputs', async () => {
  const {registry, artistCatalog} = (await import('./fixtures/current-artist-pages.cjs')).default;
  const [original, projected, complete] = await Promise.all([
    compile(appRoot, false), compile(appRoot, true), compile(appRoot, true, renderer),
  ]);
  for (const file of inputs) {
    assert.ok(projected.modules.some(id => id === '\0idol:group-information-display/' + file), file);
    assert.ok(!projected.modules.some(id => id.endsWith('/data/' + file)), file);
    assert.ok(complete.modules.some(id => id.endsWith('/data/' + file)), file);
  }
  assert.equal(groupInformationDisplay().applyToEnvironment({name: 'rsc'}), false);
  assert.equal(groupInformationDisplay().applyToEnvironment({name: 'ssr'}), false);
  compareRenderers(original.api, projected.api, [...registry.map(group => group.slug), 'unlisted-test-group']);
  for (const group of registry) {
    const loaded = artistCatalog(group).groups.find(row => row.id === group.groupId);
    assert.ok(loaded, group.slug);
    assert.equal(projected.api.renderGroupInformation(group.slug, loaded), original.api.renderGroupInformation(group.slug, loaded), group.slug);
  }
  assert.match(complete.api.groupInformationModel('triples').sales.notes.join(' '), /按用户决定不再追查/);
});

test('partial and nested legacy rows keep historic metrics, sources, observed zeros and unknown values', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'idol-group-display-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  await Promise.all(['components', 'lib/idol', 'data'].map(dir => mkdir(path.join(root, dir), {recursive: true})));
  await Promise.all([component, renderer, 'lib/idol/follower-count.mjs'].map(file => copyFile(path.join(appRoot, file), path.join(root, file))));
  const slugs = ['partial', 'legacy', 'unmeasured'];
  const zero = {observedValue: 0, status: 'observed', scope: '节目一位', asOf: '2026-10-29', sources: [{title: '获奖来源', url: 'https://example.org/wins'}]};
  const retail = {observedValue: 20, title: '限期零售', status: 'observed', lowerBound: true,
    evidence: {chart: 'Circle Retail Album Chart', dayRows: [{date: '2026-08-10'}, {date: '2026-08-10'}]},
    sourceTitle: '榜单', sourceUrl: 'https://example.org/chart'};
  const unknown = {observedValue: null, value: 0, status: 'unavailable', notes: ['PRIVATE_GROUP_INFO_CANARY']};
  const latest = {platform: 'instagram', accountExists: true, url: 'https://example.org/latest', countLabel: '8万', observedAt: '2026-08-10'};
  const fixture = {
    [inputs[0]]: slugs.map(slug => ({slug, groupId: 'id-' + slug, name: slug, image: '/irrelevant.webp'})),
    [inputs[1]]: {partial: {sales: retail, wins: unknown}, groups: {legacy: {social: [latest], sales: retail, wins: zero}}},
    [inputs[2]]: {groups: {
      partial: {social: [{...latest, observedAt: '2026-01-01', countLabel: '1万'}, latest], sales: null, wins: zero},
      unmeasured: {social: [], sales: unknown, wins: zero},
    }},
    'artist-home-introductions.json': {},
  };
  await Promise.all(Object.entries(fixture).map(([file, value]) => writeFile(path.join(root, 'data', file), JSON.stringify(value))));
  const [original, projected] = await Promise.all([compile(root, false), compile(root, true)]);
  assert.doesNotMatch(projected.code, /PRIVATE_GROUP_INFO_CANARY|irrelevant\.webp/);
  compareRenderers(original.api, projected.api, [...slugs, 'another-unknown-group']);
  for (const slug of ['partial', 'legacy']) {
    const html = projected.api.renderGroupInformation(slug);
    assert.match(html, /零售销量/);
    assert.match(html, /2026-08-10/);
    assert.match(html, /8万/);
    assert.match(html, /data-stat-status="observed"><span>打歌一位总数<\/span><strong>0<em>次/);
    assert.match(html, /https:\/\/example\.org\/chart/);
  }
  assert.match(projected.api.renderGroupInformation('unmeasured'), /data-stat-status="unavailable"/);
});
