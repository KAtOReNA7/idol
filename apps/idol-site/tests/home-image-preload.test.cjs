/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS Node test harness. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');

const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }}).outputText;
  vm.runInNewContext('(function(require,exports){' + code + '\n})', {}, {filename: file})((name) => {
    if (name.endsWith('.css')) return {};
    if (name.startsWith('@/components/')) return {__esModule: true, default: () => React.createElement('div', {'data-design': 'unchanged'})};
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name);
      const target = [base, base + '.ts', base + '.tsx'].find(value => fs.existsSync(value) && fs.statSync(value).isFile());
      if (!target) throw new Error('Unresolved dependency: ' + name);
      return load(target);
    }
    return require(name);
  }, exports);
  return exports;
}

const cases = [
  ['loona', '/artist/loona/approved-home/hero.jpg', 'no-referrer'],
  ['billlie', JSON.parse(fs.readFileSync('data/runtime/billlie-figma-catalog.json')).releases[0].src, null],
  ['triples', JSON.parse(fs.readFileSync('data/triples-artist.json')).hero.image, 'no-referrer'],
];
const excluded = [
  ...['members', 'works', 'updates', 'records', '', 'unknown'].map(section => ({section})),
  ...['member', 'release', 'reader', 'media', 'roster', 'queue', 'q', 'format', 'timelineType', 'view', 'work', 'returnTo', 'other'].flatMap(key => [
    {[key]: 'recExample'}, {section: 'overview', [key]: 'recExample'}, {[key]: ''},
  ]),
  {section: ['overview', 'overview']}, {section: ['overview', 'members']},
  {section: ['members', 'overview']}, {section: undefined},
];
for (const [slug, asset, referrerPolicy] of cases) {
  const Page = load(`app/artists/${slug}/page.tsx`).default;
  async function render(params) {
    const result = await Page({searchParams: Promise.resolve(params)});
    return renderToStaticMarkup(React.createElement('html', null, React.createElement('body', null, result)));
  }
  test(`${slug}: homepage server preload is hoisted once with exact image request attributes`, async () => {
    assert.ok(fs.existsSync('public' + asset));
    for (const query of [{}, {section: 'overview'}]) {
      const html = await render(query);
      const links = html.match(/<link\b[^>]*>/g) || [];
      assert.equal(links.length, 1);
      assert.ok(html.indexOf(links[0]) < html.indexOf('<body>'));
      assert.ok(links[0].includes(`href="${asset}"`));
      assert.match(links[0], /rel="preload"/);
      assert.match(links[0], /as="image"/);
      assert.match(links[0], /fetchPriority="high"/);
      if (referrerPolicy) assert.ok(links[0].includes(`referrerPolicy="${referrerPolicy}"`));
      else assert.doesNotMatch(links[0], /referrerPolicy/i);
      assert.doesNotMatch(links[0], /crossOrigin|imageSrcSet|imageSizes/i);
      assert.match(html, /data-design="unchanged"/);
    }
  });
  test(`${slug}: inner pages and all ambiguous or deep-link queries have no homepage preload`, async () => {
    for (const query of excluded) {
      const html = await render(query);
      assert.doesNotMatch(html, /rel="preload"/, JSON.stringify(query));
      assert.match(html, /data-design="unchanged"/);
    }
  });
}

test('preload sources remain identical to existing homepage images', () => {
  const loona = fs.readFileSync('components/candidate/loona-home.tsx', 'utf8');
  const billlie = fs.readFileSync('components/candidate/billlie-design.tsx', 'utf8');
  const triples = fs.readFileSync('components/candidate/triples-design.tsx', 'utf8');
  assert.match(loona, /<Picture src=\{loonaHomeAsset\('hero\.jpg'\)\}/);
  assert.match(loona, /referrerPolicy="no-referrer"/);
  assert.match(billlie, /const latest=design\.releases\[0\]/);
  assert.match(billlie, /<Picture src=\{latest\.src\}/);
  assert.match(triples, /<Picture src=\{content\.hero\.image\}/);
  assert.match(triples, /referrerPolicy="no-referrer"/);
});
