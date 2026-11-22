const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

const group = registry.find(artist => artist.slug === 'witchx');

test('W!TCHX identifies portrait crops and directs visitors to the full company cards', async () => {
  for (const query of [{}, {section: 'members'}]) {
    const html = await renderArtist(group, query);
    assert.match(html, /成员人像截自 IN MEDIA A&amp;D 官网档案卡，可在成员页查看完整原卡。/);
    for (const person of ['lucia', 'mago', 'mari', 'niaa', 'mew']) {
      assert.ok(html.includes('/artist/witchx/portraits/' + person + '.webp'));
    }
  }
  const empty = await renderArtist(group, {section: 'members', q: 'absent-member'});
  assert.match(empty, /没有符合条件的成员/);
  assert.doesNotMatch(empty, /成员人像截自/);
  const detail = await renderArtist(group, {section: 'members', member: 'recvxAPQCFYRd0'});
  assert.match(detail, /查看原图/);
});

test('both W!TCHX home links present the company wordmark in its light version', async () => {
  const html = await renderArtist(group);
  for (const tag of ['header', 'footer']) {
    const sections = html.match(new RegExp('<' + tag + '\\b[\\s\\S]*?<\\/' + tag + '>', 'g'));
    assert.ok(sections.some(section =>
      /class="wk-wordmark"[^>]*>[\s\S]*?src="\/artist\/witchx\/portraits\/company-wordmark\.png"/.test(section)
    ));
  }
  const css = readFileSync('components/witchx-artist.css', 'utf8');
  assert.match(css, /^\.wk-wordmark img\s*\{[^}]*filter:\s*invert\(1\)/m);
});
