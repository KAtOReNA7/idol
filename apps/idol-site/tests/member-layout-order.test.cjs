// Actual React SSR with the repository snapshot and current read-only projections.
// No network, owner export or production writes. Browser checks are recorded separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, nativeSlugs, artistCatalog, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const ranks={identity:0,basic:1,scores:2,works:2,records:2,public:3,career:4,personal:5,sources:5};
for(const group of registry.filter(row=>!nativeSlugs.has(row.slug)))test(group.name+' real member render keeps private works before public evidence and sources',async()=>{
 const data=artistCatalog(group);
 const member=data.members.find(m=>m.groupIds.includes(group.groupId)||(m.formerGroupIds??[]).includes(group.groupId));assert.ok(member);
 const before=JSON.stringify(data);
 const html=await renderArtist(group,{section:'members',member:member.id},data);
 assert.match(html,/data-member-layout="ordered-v1"/);
 const modules=[...html.matchAll(/data-member-module="([^"]+)"/g)].map(m=>m[1]);assert.ok(modules.includes('identity'));let previous=-1;
 for(const name of modules){assert.ok(ranks[name]>=previous,group.slug+': '+modules.join(' -> '));previous=ranks[name];}
 assert.equal(JSON.stringify(data),before);
});

const memberPhotoSources = [
  ['oddyouth', 'TOP Media'],
  ['geenius', 'HOMe'],
  ['tracer', 'GLEAMMEDIA'],
  ['hitgs', 'Kprofiles'],
  ['atheart', 'AtHeart'],
];
for (const [slug, publisher] of memberPhotoSources) {
  test(slug + ' keeps every portrait credit available on demand and the original photo accessible', async () => {
    const group = registry.find(row => row.slug === slug);
    const catalog = artistCatalog(group);
    const hasEditorialPortraits = slug === 'hitgs' || slug === 'atheart';
    const {members} = require('../data/' + slug + (hasEditorialPortraits ? '-review-editorial.json' : '-native-design.json'));
    const {portraits} = require('../data/' + slug + '-artist.json');
    const {assets} = require('../data/' + slug + '-review-assets.json');
    for (const member of members) {
      const page = parse(await renderArtist(group, {section:'members', member:member.id}, catalog));
      const identity = page.querySelector('[data-member-module="identity"]');
      const original = hasEditorialPortraits && assets.find(asset => asset.url === member.image);
      const sourceUrl = original ? original.sourcePage || original.sourceUrl : portraits[member.id].sourceUrl;
      const displayPhoto = slug === 'hitgs' ? member.image : portraits[member.id].image;
      assert.equal(identity.getAttribute('data-member-id'), member.id);
      assert.equal(identity.querySelector('img').getAttribute('src'), displayPhoto);
      assert.ok(identity.querySelectorAll('button,a').some(control => /原图/.test(control.text)));
      if (slug === 'atheart') assert.equal(identity.querySelector('[data-original-photo]').getAttribute('href'), member.image);
      const credits = identity.querySelectorAll('details').filter(panel => panel.querySelector('a[href="' + sourceUrl + '"]')
        && panel.querySelector('summary')?.text === '照片出处');
      assert.equal(credits.length, 1, member.stageName);
      const [credit] = credits;
      assert.equal(credit.hasAttribute('open'), false);
      assert.ok(credit.text.toLowerCase().includes(publisher.toLowerCase()), member.stageName);
      assert.match(credit.text, /拍摄(?:日期|时间|时期)/);
      if (slug === 'hitgs') {
        for (const reference of member.sources.filter(url => url !== sourceUrl)) {
          assert.ok(page.querySelector('[data-member-module="sources"] a[href="' + reference + '"]'));
          assert.equal(credit.querySelector('a[href="' + reference + '"]'), null);
        }
      }
      for (const panel of page.querySelectorAll('details')) {
        if (!panel.hasAttribute('open')) panel.innerHTML = panel.querySelector('summary')?.outerHTML ?? '';
      }
      assert.doesNotMatch(identity.text, /拍摄(?:日期|时间|时期)(?:未|不详)|保留原始资料图|中文名为本页转写|官方资料页以/);
      if (slug === 'tracer') assert.match(identity.text, /历史/);
      if (slug === 'tracer' && member.stageName === 'Soeun') assert.match(identity.text, /SOEUN.*SOWON/);
      if (hasEditorialPortraits) assert.ok(identity.text.includes(member.birthDate));
    }
  });
}

test('BEWAVE keeps its six historical members identifiable and the original interview photos available on first activation', async () => {
  const group = registry.find(row => row.slug === 'bewave');
  const catalog = artistCatalog(group);
  const {members} = require('../data/bewave-native-design.json');
  const {portraits} = require('../data/bewave-artist.json');
  const {bewaveOriginalPhoto} = require('./helpers/public-artist-loader.cjs')('lib/idol/bewave-photos.ts');
  for (const member of members) {
    const page = parse(await renderArtist(group, {section:'members', member:member.id}, catalog));
    const portrait = portraits[member.id];
    const identity = page.querySelector('[data-member-module="identity"]');
    const source = identity.querySelector('details');
    assert.equal(page.querySelector('h1').text, member.cnName);
    assert.match(page.querySelector('header.identity').text, /2024 年六人阵容/);
    assert.equal(identity.getAttribute('data-member-id'), member.id);
    assert.equal(identity.querySelector('img').getAttribute('src'), portrait.image);
    const originals = identity.querySelectorAll('a[data-original-photo]');
    assert.equal(originals.length, 2);
    assert.ok(originals.every(link => link.getAttribute('href') === bewaveOriginalPhoto(portrait.image)));
    assert.equal(source.querySelector('summary').text, '照片出处');
    assert.equal(source.hasAttribute('open'), false);
    assert.match(source.text, /Edaily.*2024 年 6 月 7 日/);
    assert.equal(source.querySelector('a').getAttribute('href'), portrait.sourceUrl);
    assert.ok(identity.querySelector('[data-member-module="basic"]').text.includes(member.nationality));
    source.remove();
    assert.doesNotMatch(identity.text, /采访|具名/);
    assert.doesNotMatch(page.text, /更多参与资料持续补充/);
  }
});
