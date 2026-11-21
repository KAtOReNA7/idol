const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {createHash} = require('node:crypto');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

const pathFor = slug => registry.find(row => row.slug === slug);
const marks = {
  ive: '/artist/ive/love-dive/official-mark.png',
  illit: '/artist/illit/redesign-20261025/official-mark.svg',
  purplekiss: '/artist/purplekiss/redesign-20261025/official-mark.png',
  rescene: '/artist/rescene/redesign-20261025/official-emblem.webp',
  madein: '/artist/madein/redesign-20261025/logo-white.png',
  qwer: '/artist/qwer/redesign-20261025/logo.png',
  triples: '/artist/triples/redesign-20261025/typo.svg',
};

test('the seven official redesign routes render their group mark in the home link', async () => {
  for (const [slug, src] of Object.entries(marks)) {
    const html = await renderArtist(pathFor(slug), {section:'members'});
    const link = html.match(/<a\b[^>]*class="sr-brand"[^>]*>[\s\S]*?<\/a>/)?.[0];
    assert.ok(link?.includes('src="' + src + '"'), slug);
    assert.ok(readFileSync('public'+src).length > 0);
  }
});

test('IVE keeps the verified April 2022 official white mark and its clickable original group images', async () => {
  const mark = readFileSync('public' + marks.ive);
  assert.equal(createHash('sha256').update(mark).digest('hex'), '43b9034014bccae36297d81c8103d463ec20c1e8dbd4c48e3fd96305ea838047');
  const html = await renderArtist(pathFor('ive'));
  for (const label of ['放大IVE团体照','放大 2022 年官网团照','查看 LOVE DIVE 发行详情'])
    assert.ok(html.includes('aria-label="'+label+'"'), label);
});

test('the new member portraits appear on the real directory and directly linked member page', async () => {
  for (const [slug,id,src] of [
    ['newjeans','recvxyICzHLSfX','/artist/newjeans/how-sweet/danielle.webp'],
    ['adya','recvxAPQCFEeoQ','/artist/adya/portraits/seowon.webp'],
    ['witchx','recvxAPQCFYRd0','/artist/witchx/portraits/lucia.webp'],
    ['genblue','recvxAPQCFknfS','/artist/genblue/portraits/xxin.webp'],
    ['rocketpunch','recvxyICzHfdEb','/artist/rocketpunch/portraits/suyun.webp'],
  ]) {
    const group = pathFor(slug);
    const directory = await renderArtist(group,{section:'members'});
    const detail = await renderArtist(group,{section:'members',member:id});
    assert.ok(directory.includes('src="'+src+'"'),slug+' directory');
    assert.ok(detail.includes('src="'+src+'"'),slug+' personal page');
    assert.ok(detail.includes('data-member-id="'+id+'"'),slug+' identity');
    if(slug==='newjeans') {
      assert.ok(directory.includes('历史成员'));
      assert.ok(detail.includes('查看 SPUR 原封面'));
    }
  }
});
