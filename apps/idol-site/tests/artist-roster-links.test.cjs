const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const {buildSync} = require('esbuild');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

const groups = ['atheart', 'hitgs', 'vcha', 'izone', 'fromis9', 'everglow', 'rocketpunch', 'cherrybullet', 'weeekly', 'idle'];
const bundle = buildSync({
  entryPoints: ['components/artist-roster-link.tsx'], bundle: true, write: false,
  jsx: 'automatic', platform: 'node', format: 'cjs', external: ['react/*'],
}).outputFiles[0].text;

function navigation(initialPath) {
  const origin = 'https://example.invalid';
  const location = new URL(initialPath, origin);
  const entries = [{href: location.href, state: {untouched: 'keep'}}];
  let index = 0;
  const history = {
    get state() { return entries[index].state; },
    replaceState(state, _, path) {
      location.href = new URL(path, location).href;
      entries[index] = {state, href: location.href};
    },
    pushState(state, _, path) {
      location.href = new URL(path, location).href;
      entries.splice(++index, entries.length, {state, href: location.href});
    },
    back() { if (index > 0) location.href = entries[--index].href; },
    forward() { if (index < entries.length - 1) location.href = entries[++index].href; },
  };
  const win = {scrollY: 840, scrollTo({top}) { this.scrollY = top; }, dispatchEvent() {}};
  const module = {exports: {}};
  vm.runInNewContext(bundle, {module, exports: module.exports, require, URL, Event, window: win, location, history});
  function click(href, options = {}) {
    return {button: 0, currentTarget: {href: new URL(href, location).href, target: ''},
      preventDefault() { this.defaultPrevented = true; }, ...options};
  }
  return {...module.exports, location, history, entries, click};
}

test('all ten artist directories expose each visible member as an exact, focusable link before and after catalog loading', async () => {
  for (const slug of groups) {
    const group = registry.find(row => row.slug === slug);
    for (const [query, data, options] of [
      [{section: 'members'}, null, {loading: true}],
      [{section: 'members'}, undefined, {}],
      [{section: 'members', roster: 'history'}, undefined, {}],
    ]) {
      const main = parse(await renderArtist(group, query, data, options)).querySelector('main');
      const links = main.querySelectorAll('a[href*="member="]');
      assert.ok(links.length, slug);
      for (const link of links) {
        const url = new URL(link.getAttribute('href'), 'https://example.invalid');
        assert.equal(url.pathname, group.path);
        assert.equal(url.searchParams.get('section'), 'members');
        assert.equal(link.getAttribute('data-artist-member-trigger'), url.searchParams.get('member'), slug);
        assert.match(link.getAttribute('data-artist-roster-action'), /^(portrait|profile)$/);
        assert.equal(link.getAttribute('target'), undefined);
      }
    }
  }
});

test('profile and browser Back both restore the same list entry, search, scroll and originating control', () => {
  for (const back of ['link', 'browser']) {
    for (const action of ['portrait', 'profile']) {
      const list = '/artists/fromis9?section=members&q=LEE&roster=history';
      const detail = list + '&member=recMember';
      const h = navigation(list);
      const member = h.ArtistRosterMemberLink({href: detail, memberId: 'recMember', action});
      const open = h.click(detail);
      member.props.onClick(open);
      assert.equal(open.defaultPrevented, true);
      assert.equal(h.location.pathname + h.location.search, detail);
      assert.equal(h.history.state.untouched, 'keep');
      assert.equal(h.history.state.artistScroll, undefined);
      if (back === 'browser') h.history.back();
      else h.returnToArtistRoster(h.click('/artists/fromis9?section=members&roster=history&q=LEE'));
      assert.equal(h.location.pathname + h.location.search, list);
      assert.equal(h.history.state.artistRosterFocus.key, 'recMember');
      assert.equal(h.history.state.artistRosterFocus.action, action);
      assert.equal(h.history.state.artistScroll.y, 840);
      assert.equal(h.history.state.artistScroll.path, list);
      assert.equal(h.entries.length, 2);
      h.history.forward();
      assert.equal(h.location.pathname + h.location.search, detail);
      assert.equal(h.history.state.artistRosterOrigin.path, list);
    }
  }
});

test('a directly opened profile can return to its named directory card with the active query', () => {
  const list = '/artists/atheart?section=members&q=NAHYUN';
  const h = navigation(list + '&member=recMember');
  h.returnToArtistRoster(h.click(list));
  assert.equal(h.location.pathname + h.location.search, list);
  assert.equal(h.history.state.artistRosterFocus.path, list);
  assert.equal(h.history.state.artistRosterFocus.key, 'recMember');
  assert.equal(h.history.state.artistScroll, undefined);
});

test('modified clicks, new tabs and different destinations retain native link behavior', () => {
  const list = '/artists/atheart?section=members';
  const href = list + '&member=recMember';
  for (const event of [{metaKey:true}, {ctrlKey:true}, {shiftKey:true}, {altKey:true}, {button:1}, {defaultPrevented:true}, {currentTarget:{href:'https://example.invalid'+href,target:'_blank'}}]) {
    const h = navigation(list);
    const member = h.ArtistRosterMemberLink({href, memberId:'recMember'});
    member.props.onClick(h.click(href, event));
    assert.equal(h.entries.length, 1);
    assert.equal(h.history.state.artistRosterFocus, undefined);
    const detail = navigation(href);
    detail.returnToArtistRoster(detail.click(list, event));
    assert.equal(detail.entries.length, 1);
    assert.equal(detail.location.pathname + detail.location.search, href);
  }
  const h = navigation(list);
  const member = h.ArtistRosterMemberLink({href, memberId:'recMember'});
  for (const path of ['/artists/vcha?section=members&member=recMember', 'https://elsewhere.invalid'+href]) {
    const event = h.click(path);
    member.props.onClick(event);
    assert.equal(event.defaultPrevented, undefined);
  }
});
