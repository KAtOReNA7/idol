import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const project = fileURLToPath(new URL('../../', import.meta.url));
const scripts = path.join(project, 'scripts');
const readManifest = name => JSON.parse(fs.readFileSync(path.join(scripts, name), 'utf8'));
const youngposseFile = 'youngposse-original-retention-manifest.json';
const retained = readManifest(youngposseFile);
const body = 'const ' + retained.compiledHelper + ';export {C};';
const pin = {bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex')};
const builtCarriers = Object.fromEntries(Object.keys(retained.builtCarriers).map(name => [name, pin]));
const youngposseFixture = {...retained, builtCarriers, importNormalizedCarriers: {}};

// Keep production hashes for every source and image. Only the two compiled
// modules are deterministic examples of the historical bundler's output.
export function installYoungposseFixture(write) {
  for (const name of Object.keys(retained.runtimeGuards)) write(name, fs.readFileSync(path.join(project, name)));
  for (const name of Object.keys(builtCarriers)) write(name, body);
  for (const image of retained.retainedImages) {
    const bytes = fs.readFileSync(path.join(project, 'public', image.path));
    for (const prefix of ['public','dist/client']) write(prefix + image.path, bytes);
  }
  return youngposseFixture;
}

// Modules in this temporary directory read only its adjacent fixture manifests.
// The normal CLI and its release manifests have no override for these hashes.
export async function loadRetentionFixtureAudits(after, ifeyeManifest) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'idol-audit-modules-'));
  after(() => fs.rmSync(dir, {recursive: true, force: true}));
  for (const file of ['audit-unused-display-assets.mjs', 'audit-unused-ifeye-original-build-assets.mjs',
    'audit-built-carriers.mjs', 'audit-youngposse-retained-originals.mjs',
    'unused-display-assets-manifest.json', 'unused-ifeye-original-build-assets-manifest.json']) {
    fs.copyFileSync(path.join(scripts, file), path.join(dir, file));
  }
  fs.writeFileSync(path.join(dir, youngposseFile), JSON.stringify(youngposseFixture));
  if (ifeyeManifest) fs.writeFileSync(path.join(dir, 'unused-ifeye-original-build-assets-manifest.json'), JSON.stringify(ifeyeManifest));
  const {auditUnusedDisplayAssets} = await import(pathToFileURL(path.join(dir, 'audit-unused-display-assets.mjs')));
  const {auditUnusedIfeyeOriginalBuildAssets} = await import(pathToFileURL(path.join(dir, 'audit-unused-ifeye-original-build-assets.mjs')));
  return {auditUnusedDisplayAssets, auditUnusedIfeyeOriginalBuildAssets};
}
