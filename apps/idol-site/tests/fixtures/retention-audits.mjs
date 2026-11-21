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

// The original-photo manifest belongs to the release before the public-copy edit.
// Reconstruct that exact component so unrelated source changes still fail its full hash.
const originalCopy = [
  ['暂无图片', '图片待补'],
  ['此版本暂无可显示的评分', '评分绑定尚未有效，旧评分不展示'],
  ['正在读取观看记录…', '正在读取原生记录…'],
  ['暂时无法读取观看记录，仍可浏览作品。', '原生记录暂时不可用，公开作品仍可浏览。'],
  ['此版本暂不提供评分。', '尚未核验此精确视频的原生记录绑定。'],
  ['暂无视频预览图。', '此精确视频的预览图待补，发行封面不作为 MV 截图。'],
  ['暂时找不到这个视频版本。', '没有找到此精确视频版本。'],
];

export function retainedSourceBytes(name) {
  const expected = retained.runtimeGuards[name];
  let bytes = fs.readFileSync(path.join(project, name));
  if (name === retained.component && createHash('sha256').update(bytes).digest('hex') !== expected.sha256) {
    let source = bytes.toString('utf8');
    for (const [current, previous] of originalCopy) source = source.replaceAll(current, previous);
    bytes = Buffer.from(source);
  }
  if (bytes.length !== expected.bytes || createHash('sha256').update(bytes).digest('hex') !== expected.sha256) {
    throw Error('Historical YOUNG POSSE fixture source differs from its retained manifest: ' + name);
  }
  return bytes;
}

export function installYoungposseFixture(write) {
  for (const name of Object.keys(retained.runtimeGuards)) write(name, retainedSourceBytes(name));
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
