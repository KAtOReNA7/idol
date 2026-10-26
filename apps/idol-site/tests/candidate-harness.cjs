// This helper executes the real, public candidate registry; it never supplies fake routes.
/* eslint-disable @typescript-eslint/no-require-imports -- This Node CommonJS test helper uses require to load test dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
/* eslint-enable @typescript-eslint/no-require-imports */
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'lib/idol/candidate/registry.ts');
const candidateRegistry = {};
const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText;
vm.runInNewContext('(function(require,exports){' + code + '\n})', {}, {filename})(
  name => {throw new Error('Unexpected candidate registry dependency: ' + name);},
  candidateRegistry,
);
const candidateCss = new Set([
  './candidate-experience.css',
  ...candidateRegistry.candidateArtists.map(artist => './' + artist.slug + '-experience.css'),
]);
function isCandidateExperienceCss(name) {
  if (!candidateCss.has(name)) return false;
  // Only registered candidate styles that actually exist may be ignored by the JS harness.
  fs.readFileSync(path.join(root, 'app', name), 'utf8');
  return true;
}
module.exports = {candidateRegistry, isCandidateExperienceCss};
