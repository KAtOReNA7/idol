const assert = require('node:assert/strict');
const test = require('node:test');
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const atheart = require('../data/atheart-review-editorial.json');
const witchx = require('../data/witchx-native-design.json');

const queryFor = video => ({section: 'works', format: video.type.toLowerCase(), media: video.key});

test('AtHeart video details keep one exact source and the matching on-site work or stage action', async () => {
  const group = registry.find(group => group.slug === 'atheart');
  const catalog = artistCatalog(group);
  for (const video of atheart.videos) {
    const query = queryFor(video);
    const source = 'https://www.youtube.com/watch?v=' + video.videoId;
    const work = catalog.works.find(work => work.id === video.workId
      && (video.type === 'stage' ? work.stage?.videoId === video.videoId : work.url === source));
    const page = parse(await renderArtist(group, query, catalog));
    const detail = page.querySelector('.ah-video-detail');
    const action = detail.querySelector('a.ah-button');
    const original = detail.querySelector('.ah-video-original');
    assert.equal(page.querySelector('.ah-video-title h1').text, video.title);
    assert.equal(original.getAttribute('href'), video.image);
    assert.equal(original.getAttribute('aria-haspopup'), 'dialog');
    assert.match(original.text, /发布者预览图.*查看原图/);
    const links = detail.querySelectorAll('a');
    for (const url of video.sources) {
      const credited = links.filter(link => link.getAttribute('href') === url);
      assert.equal(credited.length, 1, video.key + ' ' + url);
      assert.equal(credited[0].getAttribute('target'), '_blank');
    }
    if (work) {
      const url = new URL(action.getAttribute('href'), 'https://example.invalid');
      assert.equal(url.origin, 'https://example.invalid');
      assert.equal(url.pathname, '/');
      assert.equal(url.searchParams.get('work'), work.id);
      assert.equal(url.searchParams.get('video'), video.type === 'stage' ? 'stage' : null);
      const back = new URL(url.searchParams.get('returnTo'), url);
      assert.equal(back.pathname, group.path);
      assert.deepEqual(Object.fromEntries(back.searchParams), query);
      assert.match(action.text, /评分/);
      assert.match(detail.querySelector(`details a[href="${source}"]`).text, /YouTube 原片出处/);
    } else {
      assert.match(detail.text, /暂无站内播放或评分/);
      assert.equal(action.getAttribute('href'), source);
      assert.match(action.text, /在 YouTube 观看原片/);
      assert.equal(detail.querySelector('details') !== null, video.sources.some(url => url !== source));
    }
  }
});

test('AtHeart distinguishes a delayed or failed catalog from an unavailable video version', async () => {
  const group = registry.find(group => group.slug === 'atheart');
  const catalog = artistCatalog(group);
  const video = atheart.videos.find(video => video.workId && video.type === 'stage');
  const query = queryFor(video);
  for (const options of [{loading: true}, {error: '读取失败'}]) {
    const detail = parse(await renderArtist(group, query, null, options)).querySelector('.ah-video-detail');
    if (options.loading) {
      assert.match(detail.querySelector('[role="status"]').text, /站内观看入口/);
      assert.equal(detail.querySelector('[role="alert"]'),null);
    } else {
      assert.match(detail.querySelector('[role="alert"] button').text, /重试/);
    }
    assert.equal(detail.querySelector('[data-film-primary="source"]'),null);
    assert.equal(detail.querySelector('[data-film-primary="onsite"]'),null);
    assert.doesNotMatch(detail.text, /暂无站内播放或评分/);
  }
  const works = catalog.works.map(work => work.id === video.workId ? {...work, stage: null} : work);
  const stale = parse(await renderArtist(group, query, {...catalog, works})).querySelector('.ah-video-detail');
  assert.match(stale.text, /暂无站内播放或评分/);
  assert.equal(stale.querySelector('a.ah-button').getAttribute('href'), 'https://www.youtube.com/watch?v=' + video.videoId);
});

test('W!TCHX identifies all external-only versions and credits the publisher once', async () => {
  const group = registry.find(group => group.slug === 'witchx');
  for (const video of witchx.works) {
    const detail = parse(await renderArtist(group, queryFor(video))).querySelector('.wk-film');
    assert.equal(detail.querySelector('h1').text, video.title);
    assert.match(detail.text, /暂无站内播放或评分/);
    const links = detail.querySelectorAll('a').filter(link => link.getAttribute('href') === video.url);
    assert.equal(links.length, 1, video.key);
    assert.equal(links[0].getAttribute('target'), '_blank');
    assert.match(links[0].text, /在 YouTube 观看原片/);
    assert.ok(detail.querySelector('.wk-film-links').text.includes(video.channel));
    assert.ok(detail.querySelector('.wk-film-links a[href*="release="]'));
  }
});
