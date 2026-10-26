'use strict';
// Node >=24 test-only loader. Runtime source stays unchanged; no dependencies,
// network, project build, or generated JavaScript are required.
const path = require('node:path');
const { registerHooks } = require('node:module');
const { fileURLToPath } = require('node:url');
const timelineRoot = path.resolve(__dirname, '../lib/idol/timeline');
const prefix = `${timelineRoot}${path.sep}`;
function inside(file) { return file.startsWith(prefix); }
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' && error.code !== 'MODULE_NOT_FOUND') throw error;
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) throw error;
      if (!context.parentURL?.startsWith('file:')) throw error;
      const parent = fileURLToPath(context.parentURL);
      if (!inside(parent) || path.extname(specifier)) throw error;
      const target = path.resolve(path.dirname(parent), `${specifier}.ts`);
      if (!inside(target)) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});
function loadTs(relativePath) {
  const target = path.resolve(__dirname, '..', relativePath);
  if (!inside(target) || !target.endsWith('.ts')) throw new Error('Test loader only reads timeline TypeScript.');
  return require(target);
}
function loadTimeline(name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Invalid timeline module name.');
  return loadTs(`lib/idol/timeline/${name}.ts`);
}
module.exports = { loadTimeline, loadTs };
