import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isForbiddenPath } from '../scripts/repo-hygiene.mjs';

test('rejects synthetic credential, environment, runtime and internal paths', () => {
  const forbidden = [
    '.env', '.env.local', 'app/.env.production', '.dev.vars', '.dev.vars.local',
    'tls/server.pem', 'tls/server.key', 'cert.p12', 'cert.pfx', '.ssh/id_rsa',
    'id_ed25519', '.aws/credentials', 'credentials.json', 'service-account.json',
    'secrets/token.txt', 'credentials/token.txt', 'data/state.sqlite',
    'data/state.sqlite3', 'data/state.db', 'data/state.db-wal',
    'data/state.sqlite3-shm', 'data/state.sqlite-journal', 'backups/export.json',
    'app/backups/archive.zip', 'state.bak', 'state.backup', 'private-data/notes.json',
    'node_modules/pkg/index.js', 'app/node_modules/pkg/index.js',
    'runtime/server.log', 'server.log.1', 'server.log.2.gz', '.git/config',
    'nested/.git/objects/abc', '.git', 'APP/.ENV.LOCAL',
    'app\\node_modules\\pkg\\index.js', 'data\\state.db', 'app\\.env.local',
  ];
  for (const path of forbidden) assert.equal(isForbiddenPath(path), true, path);
});

test('allows examples and similar names without substring false positives', () => {
  const allowed = [
    'README.md', '.gitignore', 'src/index.mjs', '.env.example', 'app/.env.example',
    'app\\.env.example', '.environment', '.env-example', 'env.local',
    'docs/node_modules-guide.md', 'node_modules_backup/index.js', 'mybackups/a.json',
    'backups.md', 'logs/README.md', 'catalog.json', 'state.db.json', 'key.ts',
    'monkey.js', 'server.pem.md', 'credential-helper.mjs', 'credentials.md',
    'service-account.example.json', 'id_rsa.pub', '.github/workflows/check.yml',
    '.gitkeep', 'git/config', 'secrets-guide.md', '',
  ];
  for (const path of allowed) assert.equal(isForbiddenPath(path), false, path);
  assert.equal(isForbiddenPath('secrets/.env.example'), true);
});

test('CLI checks synthetic tracked paths, including names containing newlines', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'idol-hygiene-'));
  const script = fileURLToPath(new URL('../scripts/repo-hygiene.mjs', import.meta.url));
  try {
    execFileSync('git', ['init', '--quiet'], { cwd });
    writeFileSync(join(cwd, '.env.example'), 'synthetic fixture');
    execFileSync('git', ['add', '--', '.env.example'], { cwd });
    const clean = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.equal(clean.status, 0, clean.stderr);
    assert.match(clean.stdout, /1 tracked paths checked/);
    const forbidden = 'synthetic\nstate.db';
    writeFileSync(join(cwd, forbidden), 'synthetic fixture');
    execFileSync('git', ['add', '--', forbidden], { cwd });
    const dirty = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.equal(dirty.status, 1, dirty.stderr);
    assert.ok(dirty.stderr.includes(JSON.stringify(forbidden)));
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('CLI fails when git cannot list a repository', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'idol-hygiene-no-git-'));
  const script = fileURLToPath(new URL('../scripts/repo-hygiene.mjs', import.meta.url));
  try {
    const result = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /Unable to list repository paths/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
