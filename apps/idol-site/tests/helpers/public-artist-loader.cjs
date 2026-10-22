const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..'), cache = new Map();
module.exports = function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'public-artist-contract-'));
  try {
    const output = path.join(directory, 'module.cjs');
    esbuild.buildSync({entryPoints: [path.join(root, relative)], bundle: true, outfile: output,
      platform: 'node', format: 'cjs', logLevel: 'silent'});
    const result = require(output); cache.set(relative, result); return result;
  } finally { fs.rmSync(directory, {recursive: true, force: true}); }
};
