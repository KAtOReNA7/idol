const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {transformSync} = require('esbuild');
const {Runner, React, jsxRuntime, find, all, text, tick} = require('./helpers/read-recovery-harness.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const source = fs.readFileSync(path.join(__dirname, '../components/candidate/udtt-native-design.tsx'), 'utf8');
const compiled = transformSync(source, {loader:'tsx', format:'cjs', jsx:'automatic', target:'es2022'}).code;
const fixture = require('./fixtures/udtt-review-catalog.json');
const catalog = {...fixture, works:[
  {...fixture.works[0], song:'未公开作品', placeholder:true},
  {...fixture.works[1], song:'REALLY REALLY'},
  {...fixture.works[1], id:'recForeign', song:'其他团作品', groupIds:['recForeignGroup']},
]};

function mount(initialFailure) {
  let failure = initialFailure;
  const requests = [];
  const window = {location:new URL('https://site.invalid/artists/udtt?section=works')};
  const unexpected = () => { throw Error('failed internal transport'); };
  const ports = {
    react:React,
    'react/jsx-runtime':jsxRuntime,
    '@/components/public-access':{useCanEdit:() => false},
    '@/lib/idol/journey':load('lib/idol/journey.ts'),
    '@/lib/idol/artist-navigation':load('lib/idol/artist-navigation.ts'),
    '@/lib/idol/stage-source':load('lib/idol/stage-source.ts'),
    '@/lib/idol/catalog-read-deadline':load('lib/idol/catalog-read-deadline.ts'),
    '@/lib/idol/udtt-native/host.mjs':{
      catalogBelongs:load('lib/idol/udtt-native/model.mjs').catalogBelongs,
      async prepareUdttNativePortrait() {
        if (failure === 'portrait') unexpected();
        return {destroy() {}};
      },
      createUdttNative({onStatus}) {
        if (failure === 'page') unexpected();
        onStatus('UDTT · 资料已载入');
        return {ready:Promise.resolve(), destroy() {}};
      },
    },
  };
  async function fetch(url) {
    requests.push(url);
    if (url.startsWith('/api/catalog?')) {
      if (failure === 'catalog') unexpected();
      return Response.json(failure === 'identity' ? {...catalog, groups:[]} : catalog);
    }
    assert.equal(url, '/api/editorial-assets/viewer');
    if (failure === 'viewer') unexpected();
    return Response.json({entries:Array(10).fill(null)});
  }
  const modulePort = {exports:{}};
  vm.runInNewContext('(function(require,module,exports){' + compiled + '})', {window, fetch, AbortController})(
    name => {assert.ok(Object.hasOwn(ports, name), name); return ports[name];}, modulePort, modulePort.exports);
  const runner = new Runner(modulePort.exports.default);
  function render() {
    const tree = runner.render();
    find(tree, node => node.type === 'div' && node.props.ref).props.ref.current = {};
    return tree;
  }
  render();
  return {render, requests, recover() {failure = null;}, unmount() {runner.unmount();}};
}

for (const [stage, message, hasWork] of [
  ['catalog', '暂时无法读取 UDTT 资料。', false],
  ['identity', '暂时无法读取 UDTT 资料。', false],
  ['viewer', 'UDTT 图片暂时无法加载。', true],
  ['portrait', 'UDTT 图片暂时无法加载。', true],
  ['page', 'UDTT 页面暂时无法加载。', true],
]) {
  test('UDTT explains a ' + stage + ' failure and reloads from the current group', async () => {
    const page = mount(stage);
    try {
      await tick();
      const tree = page.render();
      const status = find(tree, node => node.props.role === 'status');
      assert.equal(text(status), message + ' 重新读取');
      const links = all(tree, node => node.type === 'a');
      assert.deepEqual(links.map(link => text(link)), hasWork ? ['REALLY REALLY', '浏览作品库'] : ['浏览作品库']);
      if (hasWork) {
        const url = new URL(links[0].props.href, 'https://site.invalid');
        assert.equal(url.searchParams.get('work'), fixture.works[1].id);
        assert.equal(url.searchParams.get('returnTo'), '/artists/udtt?section=works');
      }
      page.recover();
      find(status, node => node.type === 'button').props.onClick();
      page.render();
      await tick();
      const recovered = page.render();
      assert.equal(text(find(recovered, node => node.props.role === 'status')), 'UDTT · 资料已载入');
      assert.equal(all(recovered, node => node.type === 'button' || node.type === 'a').length, 0);
      assert.equal(page.requests.filter(url => url.startsWith('/api/catalog?')).length, 2);
    } finally {
      page.unmount();
    }
  });
}
