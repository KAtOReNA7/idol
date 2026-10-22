'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const timeline = require('./fixtures/timeline-host/explicit-test-aliases.cjs');
const image = require('./fixtures/image-reliability/aliases.cjs');
const entries = [
  ['identity-evidence', 'triples-identity'],
  ['release-evidence', 'triples-identity'],
  ['curated-release-evidence', 'triples-curated-releases'],
];
for (const [name, makePlugin, check] of [
  ['timeline', timeline.explicitTestAliases, timeline.assertExplicitTestInputs],
  ['image', image.aliases, image.checkInputs],
]) {
  test(`${name} fixture aliases exactly the three reviewed metadata ports, never arbitrary actual data`, () => {
    const handlers = [], observed = [];
    makePlugin(observed).setup({onResolve(options, handler) {handlers.push({filter: options.filter, handler});}});
    const resolve = args => handlers.filter(h => h.filter.test(args.path)).map(h => h.handler(args)).find(Boolean);
    for (const [file, module] of entries) {
      const original = `../../data/triples/${file}.json`;
      const importer = path.join(root, `lib/idol/${module}.ts`);
      const result = resolve({path: original, importer});
      assert.ok(result?.path.endsWith(`/content-aliases/triples-${file}.ts`));
      assert.match(fs.readFileSync(result.path, 'utf8'), /entries: \[\]/);
      assert.equal(resolve({path: original, importer: path.join(root, 'lib/idol/unrelated.ts')}), undefined);
      // A real metadata import escaping the explicit substitution still fails closed.
      assert.throws(() => check({inputs: {[`data/triples/${file}.json`]: {}}}, []), /actual data imported/);
    }
    assert.equal(resolve({path: '../../data/triples/private-records.json', importer: path.join(root, 'lib/idol/triples-identity.ts')}), undefined);
    assert.throws(() => check({inputs: {'data/snapshot.json': {}}}, []), /actual data imported/);
    assert.equal(observed.length, 3);
  });
}
