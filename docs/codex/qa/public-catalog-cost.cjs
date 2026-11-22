// Run from the repository root with two committed revisions.
const {execFileSync} = require('node:child_process');
const {createRequire, Module} = require('node:module');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const app = path.join(root, 'apps/idol-site');
const appRequire = createRequire(path.join(app, 'package.json'));
const esbuild = appRequire('esbuild');
const rounds = 20;

function load(contents, filename) {
  const build = esbuild.buildSync({
    absWorkingDir: app,
    stdin: {contents, resolveDir: path.join(app, 'lib/idol'), loader: 'ts', sourcefile: filename},
    bundle: true, write: false, platform: 'node', format: 'cjs',
    external: ['cloudflare:workers', 'server-only'],
  });
  const compiled = new Module(filename, module);
  compiled.require = name => name === 'cloudflare:workers' ? {env: {}} : name === 'server-only' ? {} : appRequire(name);
  compiled._compile(build.outputFiles[0].text, filename);
  return compiled.exports;
}

const refs = process.argv.slice(2);
if (refs.length !== 2) throw new Error('Provide the before and after Git revisions.');
const git = args => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
const commits = refs.map(ref => git(['rev-parse', '--verify', '--end-of-options', ref + '^{commit}']));
const projectors = commits.map(commit => load(git(['show', commit + ':apps/idol-site/lib/idol/public-catalog.ts']), 'public-catalog.ts').projectPublicCatalog);
const api = load([
  "export {projectArtistCatalog} from './artist-catalog';",
  "export {projectBrowserCatalog} from './browser-catalog';",
  "export {projectCatalog} from './catalog';",
  "export {projectWorkCatalog} from './work-catalog';",
].join('\n'), 'snapshot.ts');
const snapshot = appRequire('./data/snapshot.json');
const catalog = api.projectCatalog(snapshot.tables, 'snapshot', snapshot.capturedAt);
const full = api.projectBrowserCatalog(catalog);
const artists = catalog.groups.map(group => api.projectBrowserCatalog(api.projectArtistCatalog(catalog, group.id)));

function check(input) {
  assert.deepStrictEqual(projectors[0](input), projectors[1](input));
}
check(full);
artists.forEach(check);
for (const work of catalog.works) check(api.projectBrowserCatalog(api.projectWorkCatalog(catalog, work)));

function measure(inputs) {
  const samples = [[], []];
  for (let i = -4; i < rounds; i++) {
    for (const index of i % 2 ? [0, 1] : [1, 0]) {
      const start = performance.now();
      for (const input of inputs) projectors[index](input);
      if (i >= 0) samples[index].push(Number((performance.now() - start).toFixed(2)));
    }
  }
  const medians = samples.map(rows => {
    const sorted = rows.toSorted((a, b) => a - b), mid = sorted.length / 2;
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  });
  return {beforeMs: samples[0], afterMs: samples[1], beforeMedian: medians[0], afterMedian: medians[1]};
}

console.log(JSON.stringify({
  commits, node: process.version, platform: process.platform, snapshot: snapshot.capturedAt,
  equal: {full: true, groups: artists.length, works: full.works.length, members: full.members.length, ratings: full.ratings.length},
  method: 'Four warm-up pairs and twenty alternating pairs on one process. Measures only the visitor field projection, excluding database, network and browser time.',
  full: measure([full]), allArtists: measure(artists),
}, null, 2));
