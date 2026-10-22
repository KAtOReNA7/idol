const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '../..');
function load(relative) {
  const filename = path.join(root, relative);
  const {outputFiles} = esbuild.buildSync({entryPoints: [filename], bundle: true, write: false,
    platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/*'],
    loader: {'.css': 'empty'}, logLevel: 'silent'});
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(outputFiles[0].text, filename);
  return loaded.exports;
}
const {ResultsView} = load('components/library-browser/results-view.tsx');
const {SequencePreview} = load('components/library-browser/sequence-preview.tsx');
const {buildLibraryModel} = load('lib/idol/library-browser/query-model.ts');
const filters = {search:'', group:'all', generation:'all', queue:'all', stageFilter:'all', watch:'all', sort:'default', limit:24};
function fixture(count = 100) {
  const works = Array.from({length:count}, (_, i) => ({id:`recWork${i}`,name:`SYNTHETIC ${i}`,song:`Song ${i}`,
    officialTitle:'MV',version:'',videoType:'MV',groupIds:[],url:'https://example.invalid/video',
    stage:null,stageScore:null,score:null,watched:'未观看',note:'SYNTHETIC_PRIVATE_SENTINEL'}));
  const catalog = {works,groups:[],members:[],ratings:[]};
  const sequence = {ids: works.map(work=>work.id),label:'SYNTHETIC session', filters:{...filters}};
  return {catalog,sequence};
}
const freeze = object => {Object.freeze(object); for (const value of Object.values(object)) if (value && typeof value==='object' && !Object.isFrozen(value)) freeze(value); return object;};
function results(catalog, sequence, options = {}) {
  const page = options.page ?? 1, pageSize = options.pageSize ?? 24;
  return renderToStaticMarkup(React.createElement(ResultsView, {model: buildLibraryModel(catalog,filters,page,pageSize),
    page,pageSize,sequence,onPageChange:()=>assert.fail('SSR must not change page'),onOpenWork:()=>{},
    renderWork:(work,onOpen)=>React.createElement('button',{type:'button',onClick:onOpen},work.name),...options}));
}
const count = (html, token) => html.split(token).length-1;
test('actual ResultsView SSR mounts only requested 24/48 rows on deep pages',()=>{
  const {catalog,sequence}=freeze(fixture(5000));
  for (const pageSize of [24,48]) {
    const html=results(catalog,sequence,{page:3,pageSize});
    assert.equal(count(html,'data-lb-work-id='),pageSize);
    assert.match(html,new RegExp(`data-lb-work-id="recWork${pageSize*2}"`));
    assert.ok(!html.includes('SYNTHETIC_PRIVATE_SENTINEL'));
    assert.match(html,/共 5000 项/);
    assert.ok(!html.includes('data-lb-work-id="recWork0"'));
  }
});
test('card slot receives original complete sequence, never a page-sized replacement',()=>{
  const {catalog,sequence}=freeze(fixture(100)); let open, actual;
  results(catalog,sequence,{page:3,renderWork:(work,callback)=>{if(!open)open=callback;return work.name;},
    onOpenWork:(id,seq)=>{actual={id,seq};}});
  open(); assert.equal(actual.id,'recWork48'); assert.equal(actual.seq,sequence); assert.equal(actual.seq.ids.length,100);
});
test('loading, error, empty library and no-match states are honest and do not render stale cards',()=>{
  const {catalog,sequence}=fixture();
  assert.equal(count(results(catalog,sequence,{loading:true}),'data-lb-work-id='),0);
  assert.match(results(catalog,sequence,{loading:true}),/aria-busy="true"/);
  const error=results(catalog,sequence,{error:'Synthetic failure'});
  assert.equal(count(error,'data-lb-work-id='),0); assert.match(error,/role="alert"/);
  const empty=fixture(0); assert.match(results(empty.catalog,empty.sequence),/作品库暂无作品/);
  const noMatch=buildLibraryModel(catalog,{...filters,search:'nothing matches'});
  assert.match(results(catalog,sequence,{model:noMatch}),/没有符合当前条件/);
});
test('SSR restoration does not invoke host or steal focus; client layout effect handles ready gate',()=>{
  const {catalog,sequence}=fixture();
  const html=results(catalog,sequence,{restoreTarget:{anchorId:'recWork70',legacyLimit:96},restoreReady:true,
    onRestoreReady:()=>assert.fail('Server cannot restore geometry')});
  assert.equal(count(html,'data-lb-work-id='),24);
});
test('actual read-only SequencePreview remains bounded and states original total/current/next',()=>{
  const {catalog,sequence}=freeze(fixture(100));
  const before=JSON.stringify({catalog,sequence});
  const html=renderToStaticMarkup(React.createElement(SequencePreview,{catalog,sequence,currentId:'recWork0',onNext:()=>assert.fail('SSR cannot navigate')}));
  assert.equal(count(html,'data-lb-sequence-id='),24);
  assert.match(html,/原会话第 1 \/ 100 项/);assert.match(html,/当前可继续 99 项/);
  assert.match(html,/aria-current="step"/);assert.match(html,/下一支 · 可观看/);
  assert.ok(!html.includes('SYNTHETIC_PRIVATE_SENTINEL'));
  assert.equal(JSON.stringify({catalog,sequence}),before);
});
test('queue preview displays missing/unavailable/filtered and refuses unknown current continuation',()=>{
  const {catalog,sequence}=fixture(4);
  catalog.works[1].url='';catalog.works.splice(2,1);catalog.works[2].watched='已观看';sequence.filters.watch='unwatched';
  const html=renderToStaticMarkup(React.createElement(SequencePreview,{catalog,sequence,currentId:'recWork0',onNext:()=>{}}));
  assert.match(html,/来源不可用/);assert.match(html,/已删除或不存在/);assert.match(html,/已不符合本次条件/);
  assert.match(html,/没有可继续的下一支/);assert.match(html,/class="lb-sequence-next" type="button" disabled=""/);
  const unknown=renderToStaticMarkup(React.createElement(SequencePreview,{catalog,sequence,currentId:'recUnknown',onNext:()=>{}}));
  assert.match(unknown,/无法恢复会话位置/);assert.ok(!unknown.includes('aria-current="step"'));
  assert.match(unknown,/class="lb-sequence-next" type="button" disabled=""/);
});
test('pending-save host guard disables exposed next button despite available successor',()=>{
  const {catalog,sequence}=fixture(2);
  const html=renderToStaticMarkup(React.createElement(SequencePreview,{catalog,sequence,currentId:'recWork0',onNext:()=>{},nextDisabled:true}));
  assert.match(html,/class="lb-sequence-next" type="button" disabled=""/);
});
