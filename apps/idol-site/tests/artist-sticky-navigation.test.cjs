/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness uses CommonJS like the existing suite. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const postcss = require('postcss');
const vm = require('node:vm');
const ts = require('typescript');
const artists = [
  ['kiiikiii', 'kiiikiii', 'kk'],
  ['nmixx', 'nmixx', 'nx'],
  ['kissoflife', 'kiof', 'kf'],
  ['lesserafim', 'lesserafim', 'lf'],
];
function styles(css, selector, width) {
  const result = {};
  css.walkRules(rule => {
    if (!rule.selector.split(',').map(s => s.trim()).includes(selector)) return;
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== 'atrule' || parent.name !== 'media') continue;
      const max = parent.params.match(/max-width:\s*(\d+)px/);
      const min = parent.params.match(/min-width:\s*(\d+)px/);
      if ((max && width > Number(max[1])) || (min && width < Number(min[1]))) return;
    }
    rule.walkDecls(decl => { result[decl.prop] = decl.value; });
  });
  return result;
}
for (const [slug, file, prefix] of artists) {
  test(`${slug} tab navigation leaves room for its sticky tabs at every breakpoint`, () => {
    const css = postcss.parse(fs.readFileSync(`app/artists/${slug}/${file}-artist.css`, 'utf8'));
    const source = fs.readFileSync(`components/${file}-artist.tsx`, 'utf8');
    assert.match(source, new RegExp(`className="${prefix}-content" id="artist-content"`));
    assert.match(source, /document\.getElementById\('artist-content'\)\?\.scrollIntoView\(\{block:'start'\}\)/);
    for (const width of [320, 390, 700, 701, 800, 801, 1440]) {
      const nav = styles(css, `.${prefix}-tabs`, width);
      const button = styles(css, `.${prefix}-tabs button`, width);
      const content = styles(css, `.${prefix}-content`, width);
      assert.equal(nav.position, 'sticky');
      assert.equal(nav.top, '0');
      const navHeight = parseFloat(button['min-height']) + (parseFloat(nav['border-bottom']) || 0);
      assert.ok(parseFloat(content['scroll-margin-top']) >= navHeight + 8,
        `${width}px: ${content['scroll-margin-top'] || 'no offset'} must clear ${navHeight}px tabs plus 8px breathing room`);
    }
  });
}

for (const [, file] of artists) {
  test(`${file} scrolls after the route-render frame without changing history or replacement behavior`, () => {
    const source = fs.readFileSync(`components/${file}-artist.tsx`, 'utf8');
    const navigateSource = source.match(/ function navigate[^\n]+/)[0];
    const code = ts.transpileModule(navigateSource, {
      compilerOptions: {target: ts.ScriptTarget.ES2022},
    }).outputText;
    const calls = [], frames = [];
    let rendered = false;
    const state = {existing: 'preserved'};
    const context = {
      rememberScroll() { calls.push('remember'); },
      route: {section: 'overview'}, path: '/artists/example',
      artistRouteUrl(route, path) { return `${path}?section=${route.section}`; },
      newArtistHistoryState(input) { assert.equal(input, state); return {next: true}; },
      Event: class { constructor(type) { this.type = type; } },
      window: {
        history: {
          state,
          pushState(next, title, url) { calls.push(['push', next, title, url]); },
          replaceState(next, title, url) { calls.push(['replace', next, title, url]); },
        },
        dispatchEvent(event) { calls.push(event.type); },
        requestAnimationFrame(callback) { frames.push(callback); },
      },
      document: { getElementById(id) {
        assert.equal(id, 'artist-content');
        return {scrollIntoView(options) {
          assert.equal(rendered, true, 'must not align the previous section geometry');
          assert.equal(options.block, 'start'); calls.push('scroll');
        }};
      }},
    };
    vm.createContext(context);
    vm.runInContext(code, context);
    context.navigate({section: 'members'});
    assert.equal(calls[0], 'remember');
    assert.equal(calls[1][0], 'push');
    assert.equal(calls[1][3], '/artists/example?section=members');
    assert.equal(calls[2], 'artist-location-change');
    assert.equal(calls.includes('scroll'), false);
    assert.equal(frames.length, 1);
    rendered = true;
    frames.shift()();
    assert.equal(calls.at(-1), 'scroll');
    calls.length = 0;
    context.navigate({section: 'works'}, true);
    assert.equal(calls[1][0], 'replace');
    assert.equal(frames.length, 0, 'filter replacements do not reset the scroll');
  });
}
