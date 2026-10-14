#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Check a repository-relative path without reading the referenced file. */
export function isForbiddenPath(path) {
  const parts = path.replaceAll('\\', '/').split('/').filter(Boolean);
  const directories = new Set([
    '.git', 'node_modules', 'backups', 'private-data', '.aws', '.ssh',
    'credentials', 'secrets',
  ]);
  return parts.some((part) => {
    const name = part.toLowerCase();
    if (directories.has(name)) return true;
    if (name === '.env.example') return false;
    if (name === '.env' || name.startsWith('.env.')) return true;
    if (name === '.dev.vars' || name.startsWith('.dev.vars.')) return true;
    if (/\.(?:pem|key|p12|pfx|sqlite|sqlite3|db|log|bak|backup)$/.test(name)) return true;
    if (/\.(?:sqlite|sqlite3|db)-(?:wal|shm|journal)$/.test(name)) return true;
    if (/\.log\.\d+(?:\.gz)?$/.test(name)) return true;
    return /^(?:id_rsa|id_dsa|id_ecdsa|id_ed25519|credentials(?:\.json)?|service-account\.json)$/.test(name);
  });
}

function main() {
  let paths;
  try {
    // NUL delimiters preserve spaces and newlines in Git filenames.
    paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .split('\0').filter(Boolean);
  } catch {
    console.error('Unable to list repository paths with git ls-files.');
    process.exitCode = 2;
    return;
  }
  const forbidden = paths.filter(isForbiddenPath);
  if (forbidden.length) {
    console.error('Forbidden tracked paths:');
    for (const path of forbidden) console.error(JSON.stringify(path));
    process.exitCode = 1;
  } else {
    console.log(`Repository hygiene passed (${paths.length} tracked paths checked).`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
