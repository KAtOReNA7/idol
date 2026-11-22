const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {createHash} = require('node:crypto');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');

const pathFor = slug => registry.find(row => row.slug === slug);

test('five member directories open on the roster while the overview retains group information', async () => {
  for(const slug of ['stayc','itzy','nmixx','aespa','lesserafim']){
    const group=pathFor(slug), directory=await renderArtist(group,{section:'members'});
    assert.match(directory, /data-artist-member-trigger=/, slug);
    assert.doesNotMatch(directory, /class="(?:sc|nx|iz|lf)-hero"/, slug);
    assert.match(directory, /<h1>[^<]+<\/h1>/, slug);
    const overview=await renderArtist(group);
    assert.match(overview, /data-home-module="information"/, slug);
    assert.match(overview, /class="(?:sc|nx|iz|lf)-hero"/, slug);
  }
});

test('IVE release pages retain distinct casts of photographs, exact videos and return links', async () => {
  for(const [release,folder,videos] of [
    ['ive-release-love-dive','love-dive',['recvxyHuKMaCIP']],
    ['ive-release-ive-mine','ive-mine',['recvxyHuKMfJi3','recvxyHuKMScGV','recvxyHuKMEnUT']],
  ]){
    const html=await renderArtist(pathFor('ive'),{section:'works',release});
    assert.ok(html.includes('data-period="'+release+'"'));
    assert.equal((html.match(/class="ive-period-portrait"/g)||[]).length,6);
    for(const member of ['yujin','gaeul','rei','wonyoung','liz','leeseo'])
      assert.ok(html.includes('/artist/ive/'+folder+'/'+member+'.webp'),member);
    const links=[...html.matchAll(/href="([^"]+)"/g)].map(x=>new URL(x[1].replaceAll('&amp;','&'),'https://test.invalid'));
    const mvLinks=links.filter(link=>link.searchParams.has('work')&&!link.searchParams.has('video'));
    assert.deepEqual(mvLinks.map(link=>link.searchParams.get('work')).sort(),[...videos].sort());
    assert.ok(mvLinks.every(link=>link.searchParams.get('returnTo')==='/artists/ive?section=works&release='+release));
  }
});
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
  const {parse} = require('next/dist/compiled/node-html-parser');
  const opening = parse(html).querySelector('.ive-artist-opening');
  const archive = require('../data/ive-love-dive-archive.json');
  const photo = opening.querySelector('a[aria-label="查看 IVE 六人团照原图"]');
  assert.equal(photo.getAttribute('href'), archive.original);
  assert.equal(photo.querySelector('img').getAttribute('src'), archive.image);
  assert.equal(opening.querySelector('figcaption a').getAttribute('href'), archive.sourceUrl);
  assert.match(opening.querySelector('a[href="/artist/ive/love-dive/group.jpg"]').text, /学院造型原图/);
  const watch = new URL(opening.querySelector('a.ive-dive-mv').getAttribute('href'), 'https://artist.test');
  assert.equal(watch.searchParams.get('work'), 'recvxyHuKMaCIP');
  assert.equal(watch.searchParams.get('returnTo'), '/artists/ive');
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
