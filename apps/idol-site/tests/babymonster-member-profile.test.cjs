const test = require('node:test');
const assert = require('node:assert/strict');
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const {memberVisuals} = require('../data/babymonster-artist.json');

const group = registry.find(entry => entry.slug === 'babymonster');
const catalog = artistCatalog(group);
const members = catalog.members.filter(member => member.groupIds.includes(group.groupId));

for (const member of members) {
  test(member.stageName + ' opens her own published concept photo and its dated source', async () => {
    const query = {section: 'members', member: member.id};
    const page = parse(await renderArtist(group, query, catalog));
    const identity = page.querySelector('[data-member-layout="ordered-v1"]');
    const visual = memberVisuals[member.stageName];

    assert.equal(identity.getAttribute('data-member-id'), member.id);
    assert.match(identity.querySelector('h1').text, new RegExp(member.stageName));
    const heading = identity.querySelector('.as-member-heading');
    const photo = identity.querySelector('.as-member-photo-block');
    assert.ok(identity.childNodes.indexOf(heading) < identity.childNodes.indexOf(photo));
    assert.ok(heading.text.includes(visual.label));
    assert.equal(photo.querySelector('img').getAttribute('src'), visual.image);

    const openers = photo.querySelectorAll('a[data-original-photo]');
    assert.equal(openers.length, 2);
    for (const link of openers) {
      assert.equal(link.getAttribute('href'), visual.image);
      assert.equal(link.getAttribute('aria-haspopup'), 'dialog');
    }
    assert.match(openers[1].text, /查看原图/);
    const source = photo.querySelector('details');
    assert.equal(source.getAttribute('open'), undefined);
    assert.equal(source.querySelector('summary').text.trim(), '照片出处');
    assert.equal(source.querySelector('time').getAttribute('datetime'), visual.date);
    assert.equal(source.querySelector('a').getAttribute('href'), visual.sourceUrl);
    assert.ok(page.querySelector('.as-back'));
    assert.ok(page.querySelector('[data-member-module="scores"]'));
    assert.ok(page.querySelector('[data-member-module="works"]'));
  });
}
