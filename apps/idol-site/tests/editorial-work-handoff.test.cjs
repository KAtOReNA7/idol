const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const {parse} = require('next/dist/compiled/node-html-parser');
const {React, jsxRuntime, Runner, find} = require('./helpers/read-recovery-harness.cjs');
const {registry, artistCatalog, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const imports = require('../data/reviewed-editorial-work-imports.json');

test('an old editorial MV link keeps its native work, group filter and search in the manual action', async () => {
  for (const entry of imports) {
    const group = registry.find(row => row.groupId === entry.groupId);
    const native = artistCatalog(group);
    const videos = group.slug === 'atheart'
      ? require('../data/atheart-review-editorial.json').videos
      : require('../data/witchx-native-design.json').works;
    const video = videos.find(row => row.videoId === entry.videoId);
    const query = {section:'works', format:'mv', media:video.key, q:entry.song};
    const work = {...native.works[0], id:entry.workId, song:entry.song, groupIds:[entry.groupId],
      url:'https://www.youtube.com/watch?v=' + entry.videoId, placeholder:null};
    const catalog = {...native, works:[...native.works.filter(row => row.id !== work.id), work]};
    const page = parse(await renderArtist(group, query, catalog));
    const action = page.querySelector('.editorial-work-handoff a');
    assert.equal(page.querySelector('.editorial-work-handoff h1')?.text, entry.song);
    assert.equal(action?.getAttribute('aria-label'), '打开《' + entry.song + '》播放与评分');
    assert.equal(action.hasAttribute('target'), false);
    const target = new URL(action.getAttribute('href'), 'https://site.invalid');
    assert.equal(target.pathname, '/');
    assert.equal(target.searchParams.get('work'), entry.workId);
    const back = new URL(target.searchParams.get('returnTo'), target);
    assert.equal(back.pathname, group.path);
    assert.equal(back.searchParams.get('media'), null);
    assert.equal(back.searchParams.get('format'), 'mv');
    assert.equal(back.searchParams.get('q'), entry.song);
  }
});

test('automatic navigation and keyboard fallback share the exact URL even when replace is denied', () => {
  const source = fs.readFileSync('components/editorial-work-handoff.tsx', 'utf8');
  const {outputText} = ts.transpileModule(source, {compilerOptions:{
    jsx:ts.JsxEmit.ReactJSX, module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022,
  }});
  for (const blocked of [false, true]) {
    const attempts = [];
    const window = {location:{replace(url) {
      attempts.push(url);
      if (blocked) throw new DOMException('Navigation denied', 'SecurityError');
    }}};
    const component = {};
    const imports = name => name === 'react' ? React : name === 'react/jsx-runtime' ? jsxRuntime : {};
    vm.runInNewContext('(function(require, exports){' + outputText + '})', {window})(imports, component);
    const runner = new Runner(component.EditorialWorkHandoff);
    const href = '/?view=works&work=' + (blocked ? 'recNativeMvDYigxyW8Oiw' : 'recNativeMvb6bSGu1YdRM');
    const tree = runner.render({href, title:blocked ? 'BLALA' : '3!4!'});
    const link = find(tree, node => node.type === 'a');
    assert.deepEqual(attempts, [href]);
    assert.equal(link.props.href, href);
    assert.equal(link.props.onClick, undefined);
    assert.equal(link.props.tabIndex, undefined);
  }
});
