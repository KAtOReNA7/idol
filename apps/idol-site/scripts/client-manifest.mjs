import fs from 'node:fs';
import path from 'node:path';

export function clientReferenceKey(directory, manifest, source) {
  if (Object.hasOwn(manifest, source)) return source;
  const references = JSON.parse(fs.readFileSync(path.join(directory, '.vite/vinext-client-reference-sources.json'), 'utf8'));
  const matches = Object.entries(manifest).filter(([, chunk]) => chunk.file === references[source]);
  if (matches.length !== 1) throw Error('Expected one emitted client reference for ' + source);
  return matches[0][0];
}

export function layoutStyles(directory) {
  const file = path.resolve(directory, '../server/__vite_rsc_assets_manifest.js');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^export default /, ''));
  const css = manifest.serverResources?.['app/layout.tsx']?.css;
  if (!Array.isArray(css) || !css.length) throw Error('Missing compiled root layout stylesheet');
  return css;
}
