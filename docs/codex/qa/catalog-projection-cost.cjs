// From the repository root: node docs/codex/qa/catalog-projection-cost.cjs <before> <after>
const {execFileSync} = require('node:child_process');
const {createRequire, Module} = require('node:module');
const path = require('node:path');
const {performance} = require('node:perf_hooks');
const {isDeepStrictEqual} = require('node:util');

const root = path.resolve(__dirname, '../../..');
const app = path.join(root, 'apps/idol-site');
const appRequire = createRequire(path.join(app, 'package.json'));
const esbuild = appRequire('esbuild');
const snapshot = appRequire('./data/snapshot.json');
const source = 'apps/idol-site/lib/idol/catalog.ts';
const pairs = 14;

function git(args) {
  return execFileSync('git', args, {cwd: root, encoding: 'utf8'});
}

// Build only the projector from each revision. Both use the same snapshot, imported
// modules, installed dependencies, Node process and monotonic clock.
function loadProjector(revision) {
  const commit = git(['rev-parse', '--verify', '--end-of-options', revision + '^{commit}']).trim();
  const entry = esbuild.buildSync({
    absWorkingDir: app,
    stdin: {
      contents: git(['show', commit + ':' + source]),
      resolveDir: path.join(app, 'lib/idol'),
      sourcefile: 'catalog.ts',
      loader: 'ts',
    },
    bundle: true,
    format: 'cjs',
    platform: 'node',
    tsconfig: path.join(app, 'tsconfig.json'),
    external: ['cloudflare:workers', 'server-only'],
    write: false,
    logLevel: 'silent',
  });
  const filename = path.join(app, 'catalog-projection-benchmark.cjs');
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.require = name => {
    if (name === 'cloudflare:workers') return {env: {}};
    if (name === 'server-only') return {};
    return appRequire(name);
  };
  compiled._compile(entry.outputFiles[0].text, filename);
  const read = () => compiled.exports.projectCatalog(snapshot.tables, 'live', snapshot.capturedAt);
  return {commit, read, samples: []};
}

function measure(projector, expectedWorks) {
  const start = performance.now();
  const result = projector.read();
  projector.samples.push(performance.now() - start);
  if (result.works.length !== expectedWorks) throw Error('The projected work count changed.');
}

const round = value => Number(value.toFixed(2));
function summarize({commit, samples}) {
  const sorted = [...samples].sort((a, b) => a - b);
  const middle = sorted.length / 2;
  return {
    commit,
    samplesMs: samples.map(round),
    minimumMs: round(sorted[0]),
    medianMs: round((sorted[middle - 1] + sorted[middle]) / 2),
    maximumMs: round(sorted.at(-1)),
  };
}

const [beforeRef, afterRef] = process.argv.slice(2);
if (!beforeRef || !afterRef) throw Error('Provide the baseline and candidate Git revisions.');
const before = loadProjector(beforeRef);
const after = loadProjector(afterRef);
const original = before.read();
const candidate = after.read();
if (!isDeepStrictEqual({...original, loadedAt: null}, {...candidate, loadedAt: null})) {
  throw Error('The projected catalog differs after normalizing the load timestamp.');
}
for (let i = 0; i < 3; i++) {
  before.read();
  after.read();
}
for (let i = 0; i < pairs; i++) {
  for (const projector of i % 2 ? [after, before] : [before, after]) {
    measure(projector, original.works.length);
  }
}
const baseline = summarize(before);
const indexed = summarize(after);
const linkedWorkOccurrences = original.ratings.reduce((count, row) => count + new Set(row.workIds).size, 0);
console.log(JSON.stringify({
  command: 'node docs/codex/qa/catalog-projection-cost.cjs ' + before.commit + ' ' + after.commit,
  runtime: {node: process.version, platform: process.platform, arch: process.arch},
  input: {
    snapshotCapturedAt: snapshot.capturedAt,
    rows: Object.fromEntries(Object.entries(snapshot.tables).map(([table, data]) => [table, data.records.length])),
  },
  method: 'Same checkout dependencies. Three warm-up pairs followed by 14 alternating baseline/candidate and candidate/baseline pairs. Each call rebuilds the full projectCatalog from identical raw input. Milliseconds exclude bundle compilation, database, network, subsequent enrichment and browser work.',
  fullProjectionEqualExceptLoadedAt: true,
  priorRatingRowChecks: original.works.length * original.ratings.length,
  indexedWorkMemberships: linkedWorkOccurrences,
  baseline,
  indexed,
  medianDifferenceMs: round(indexed.medianMs - baseline.medianMs),
  medianDifferencePercent: round((indexed.medianMs / baseline.medianMs - 1) * 100),
}, null, 2));
