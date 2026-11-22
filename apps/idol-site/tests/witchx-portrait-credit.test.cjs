const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

const group = registry.find(artist => artist.slug === 'witchx');

test('W!TCHX identifies portrait crops and directs visitors to the full company cards', async () => {
  for (const query of [{}, {section: 'members'}]) {
    const html = await renderArtist(group, query);
    assert.match(html, /成员人像截自 IN MEDIA A&amp;D 官网具名档案卡，可在成员页查看完整原卡。/);
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
  assert.match(css, /\.wk-wordmark img\s*\{[^}]*filter:\s*invert\(1\)/m);
});

test('W!TCHX unites its original wordmark, group photograph, introduction and both catalog paths', async () => {
  const {parse}=require('next/dist/compiled/node-html-parser');
  const document=parse(await renderArtist(group));
  const hero=document.querySelector('.wk-artist-hero');
  assert.equal(hero.querySelector('h1').text,'W!TCHX');
  assert.equal(hero.querySelector('h1 img').getAttribute('src'),'/artist/witchx/portraits/company-wordmark.png');
  assert.equal(hero.querySelector('figure img').getAttribute('src'),'/artist/witchx/dot-three-hero-20261016/group.display.webp');
  assert.match(hero.querySelector('figure a').getAttribute('href'),/group\.original\.jpg$/);
  assert.match(hero.querySelector('[data-home-introduction]').text,/2024 年 10 月 31 日/);
  assert.equal(document.querySelectorAll('[data-home-introduction]').length,1);
  assert.deepEqual(hero.querySelectorAll('nav a').map(a=>a.getAttribute('href')),
    ['/artists/witchx?section=members','/artists/witchx?section=works']);
  assert.equal(document.querySelectorAll('.wk-home-members .wk-member').length,5);
  for(const query of [{},{section:'works'}]){
    const page=parse(await renderArtist(group,query));
    assert.equal(page.querySelector('.wk-masthead [aria-current="page"]').text,query.section?'作品':'首页');
    assert.equal(page.querySelector('.wk-releases').parentNode.querySelector('h2').text,'发行');
    const cards=page.querySelectorAll('.wk-video,.wk-release');
    assert.equal(cards.length,9);
    assert.deepEqual(cards.map(card=>card.getAttribute('class')),Array(6).fill('wk-video').concat(Array(3).fill('wk-release')));
    for(const card of cards){
      assert.equal(card.querySelectorAll('a').length,1);
      assert.ok(card.querySelector('a img')&&card.querySelector('a h3'));
    }
  }
});
