import {spawnSync} from 'node:child_process';
import {mkdtempSync, readdirSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = {...process.env, NODE_PATH: [path.join(root, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter)};
const current = [
  'stage-owner-preflight', 'crush-prepared-20261101', 'crush-adoption-20261101',
  'gnarly-adoption-20261101', 'gnarly-prepared-20261101', 'research-closeout-20261101',
  'same-song-stage-adoption-20261030', 'same-song-stage-fallback', 'mcp-protocol',
  'native-storage', 'x-stage-source', 'project-optimization',
  'stage-import-policy', 'stage-multiplatform-import', 'read-recovery',
  'journey', 'image-app-integration', 'photo-priority', 'sign-in-entry',
].map(name => `tests/${name}.test.cjs`).concat('tests/stage-selection-policy.test.mjs');
const isolated = 'tests/artist-runtime-data.test.cjs';
const python = process.platform === 'win32' ? 'python' : 'python3';
function run(args, executable = process.execPath, environment = env) {
  const child = spawnSync(executable, args, {cwd: root, env: environment, stdio: 'inherit'});
  if (child.error) throw child.error;
  if (child.status !== 0) process.exitCode = 1;
}
if (process.argv.includes('--built')) {
  run(['--test', 'tests/udtt-private-build-assets.test.mjs']);
  const directory = mkdtempSync(path.join(os.tmpdir(), 'idol-css-check-'));
  try {
    run(['tests/css-http-fixture-build.mjs', directory]);
    run(['tests/css-http-fixture-server.test.py'], python, {...env, CSS_HTTP_FIXTURE_ROOT: directory});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
} else if (process.argv.includes('--current')) {
  run(['--test', '--test-concurrency=4', ...current]);
  run(['--test', 'tests/stage-owner-preflight.test.cjs'], process.execPath, {...env, PYTHONOPTIMIZE: '1'});
} else {
  const files = readdirSync(path.join(root, 'tests'), {recursive: true})
    .map(name => 'tests/' + name.replaceAll('\\', '/'))
    .filter(name => /\.test\.(?:cjs|mjs)$/.test(name) && name !== isolated).sort();
  run(['--test', '--test-concurrency=4', '--test-reporter=tap', ...files]);
  run(['--test', '--test-concurrency=1', '--test-reporter=tap', isolated]);
  run(['tests/personal-insights/run-tests.mjs']);
}
if (!process.argv.includes('--built')) {
  for (const flags of [[], ['-O']]) run([...flags, 'tests/stage-batch-files.test.py'], python);
}
