/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS Node test harness. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const cases = [
 ['badvillain', 'bv-dossier'], ['genblue', 'genblue-coordinates'],
 ['unis', 'unis-ticket-stub'], ['spia', 'spia-cover-index'],
 ['izone', 'izone-spine'], ['rocketpunch', 'rocket-ticket-stub'],
 ['kep1er', 'kep1er-flight-record'],
];
for (const [slug, shell] of cases) {
 test(`${slug}: absent legacy facts leave no empty shell; supplied source is preserved`, () => {
  const code = ts.transpileModule(fs.readFileSync(`components/candidate/${slug}-design.tsx`, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX}}).outputText;
  let composition;
  const exports = {};
  vm.runInNewContext('(function(require,exports){'+code+'\n})')((name) => {
   if (name === 'react/jsx-runtime') return require(name);
   if (name === '@/components/candidate-artist-experience') return {CandidateArtistExperience: props => {composition = props.composition; return null;}};
   throw new Error(`Unexpected dependency: ${name}`);
  }, exports);
  renderToStaticMarkup(React.createElement(exports.default, {content:{}}));
  const slots = Object.fromEntries(['title','intro','image','actions'].map(k=>[k,React.createElement('span',{'data-slot':k},k)]));
  const empty = renderToStaticMarkup(composition.hero({...slots,facts:null}));
  assert.ok(empty.includes('has-no-facts'));
  assert.ok(!empty.includes(`class="${shell}"`));
  for (const slot of Object.keys(slots)) assert.equal((empty.match(new RegExp(`data-slot="${slot}"`, 'g'))||[]).length, 1);
  const filled = renderToStaticMarkup(composition.hero({...slots,facts:React.createElement('a',{href:'https://example.com/source'},'source')}));
  assert.ok(filled.includes(`class="${shell}"`));
  assert.ok(filled.includes('https://example.com/source'));
  assert.ok(!filled.includes('has-no-facts'));
 });
}
test('portrait stays complete and BADVILLAIN cannot split the final letter',()=>{
 const kep = fs.readFileSync('app/artists/kep1er/kep1er-artist.css','utf8');
 assert.match(kep,/\.kep1er-viewfinder \.ca-image>img\{width:100%;height:auto;max-height:440px;object-fit:contain\}/);
 const bv = fs.readFileSync('app/artists/badvillain/badvillain-artist.css','utf8');
 assert.match(bv,/14cqi/);assert.match(bv,/white-space:nowrap;overflow-wrap:normal;word-break:normal/);
});

test('GENBLUE source-free introduction aligns with the photograph top on desktop',()=>{
 const css = fs.readFileSync('app/artists/genblue/genblue-artist.css','utf8');
 assert.match(css,/\.genblue-horizon\.has-no-facts \.genblue-route\{grid-column:2;grid-row:2;display:block;align-self:start;/);
});
