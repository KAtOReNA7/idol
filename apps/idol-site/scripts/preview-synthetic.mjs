import {spawn, spawnSync} from 'node:child_process';
import {mkdtempSync, existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import './sites-env.mjs';

const config = 'dist/server/wrangler.json';
if (!existsSync(config)) throw Error('Build the application first with npm run build.');
const directory = mkdtempSync(path.join(os.tmpdir(), 'idol-synthetic-'));
const sql = path.join(directory, 'catalog.sql');
function run(command, args) {
  const result = spawnSync(command, args, {stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const port = process.argv[2] ?? '8787';
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw Error('Expected a local port.');
run(process.platform === 'win32' ? 'python' : 'python3', ['scripts/synthetic-catalog.py', sql]);
const wrangler = 'node_modules/wrangler/bin/wrangler.js';
const local = ['--config', config, '--local', '--persist-to', directory];
run(process.execPath, [wrangler, 'd1', 'execute', 'DB', ...local, '--file', sql]);
console.log(`Synthetic preview http://127.0.0.1:${port} · ${directory}`);
const worker = spawn(process.execPath, [wrangler, 'dev', ...local, '--ip', '127.0.0.1', '--port', port, '--inspector-port', '0'], {stdio:'inherit'});
for (const signal of ['SIGINT','SIGTERM']) process.once(signal, () => worker.kill(signal));
worker.once('error', error => {throw error;});
worker.once('exit', code => {process.exitCode = code ?? 1;});
