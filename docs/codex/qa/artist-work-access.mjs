/*
 * 在 Codex 自带浏览器的 CUA REPL 中传入已登录的后台测试标签页。
 * const {checkArtistWorkAccess, artistWorkAccessPlan} = await import('file:///D:/porject/idol/docs/codex/qa/artist-work-access.mjs');
 * const result = await checkArtistWorkAccess(tab, {slugs: ['ifeye', 'izna']});
 * 不给 slugs 即测六个团内详情入口。artistWorkAccessPlan() 列出完整的 51 团代表卡。
 * 调用方控制视口和标签。脚本点击本站导航、核对播放按钮和浏览器返回，不启播或写入。
 */
import {createRequire} from 'node:module';
import {performance as clock} from 'node:perf_hooks';
const require = createRequire(import.meta.url);
const homeSample = require('../evidence/20261122-v218/formal-home-access.json');
const detailSample = require('../evidence/20261122-v218/formal-first-work-details.json');
const registry = require('../../../apps/idol-site/data/artist-timeline-registry.json');
const designs = require('../../../apps/idol-site/tests/fixtures/artist-media-order.cjs');

const localDetails = {
  atheart: {title: '3!4!', media: 'atheart:b6bSGu1YdRM', video: 'b6bSGu1YdRM',
    card: 'a.ah-video[data-artist-media="atheart:b6bSGu1YdRM"]',
    source: '.ah-video-detail a.ah-button[target="_blank"]', notice: '.ah-video-detail p'},
  witchx: {title: 'BLALA', media: 'blala-lyric', video: 'DYigxyW8Oiw',
    card: '.wk-video[data-video-key="blala-lyric"] a.wk-video-image',
    source: '.wk-film a.wk-film-screen', notice: '.wk-film-heading .wk-record-handoff'},
  ifeye: {title: 'NERDY', work: 'rec28ldfRTrCQ2', media: 'rec28ldfRTrCQ2-mv-I_msu2-4UAU',
    card: '.video-section .work-card[data-work-key="rec28ldfRTrCQ2-mv-I_msu2-4UAU"] > a:first-child',
    bridge: 'button[data-ifeye-native-focus="open-work"]'},
  izna: {title: 'DUMB HOT!', work: 'rec28ldfRTrNYh', media: 'rec28ldfRTrNYh-mv-_kxr2D8-tq8',
    card: '.home-films .film[data-video-key="rec28ldfRTrNYh-mv-_kxr2D8-tq8"] > a:first-child',
    bridge: 'button[data-izna-native-focus="open-work"]'},
  udtt: {title: 'REALLY REALLY', work: 'rec28ldfRTrPxZ', hash: '#/udtt/work/rec28ldfRTrPxZ',
    card: '[data-home-module="mv"] .ud-film-card[data-work-key="rec28ldfRTrPxZ"] > a',
    bridge: '.ud-native-records[data-work-key="rec28ldfRTrPxZ"] button[data-native-action="play"]',
    sourceKey: 'aKRY80dEkJw'},
  badvillain: {title: 'THRILLER', work: 'rec28ldfRTrQ0L', media: 'badvillain-mv-thriller',
    card: 'article.film a.photo-link:is([href*="badvillain-mv-thriller"],[href*="work=rec28ldfRTrQ0L"])',
    bridge: '.actions a[href*="work=rec28ldfRTrQ0L"]'},
};

// Preserve the v218 card when a more recent design added another work in the hero.
export function artistWorkAccessPlan() {
  return registry.map(({slug, path}) => {
    const first = homeSample.rows.find(row => row.slug === slug).first;
    const baseline = detailSample.rows.filter(row => row.slug === slug);
    const passed = baseline.find(row => row.correct && row.back && row.button);
    const oldStatus = passed ? 'shared-player-and-return' : baseline.length ? 'shared-player-missing' : 'home-card-only';
    const item = localDetails[slug];
    if (item) return {slug, path, firstHrefV218: first.href, oldStatus,
      expected: item.source ? 'source-only' : 'shared-player', ...item};
    const work = new URL(first.href, homeSample.site).searchParams.get('work');
    if (!work || (!passed && slug !== 'unis')) throw Error('缺少代表作品 ' + slug);
    const scope = designs.get(slug).homeVideo;
    const link = 'a[href*="work=' + work + '"]';
    return {slug, path, firstHrefV218: first.href, oldStatus, expected: 'shared-player',
      title: passed?.title || 'SUPERWOMAN', work, card: ':is(' + scope + '):is(' + link + '), :is(' + scope + ') ' + link};
  });
}

function routeKind(url, item, origin) {
  if (url.origin !== origin) return 'unexpected';
  if (item.work && url.pathname === '/' && url.searchParams.get('view') === 'works'
      && url.searchParams.get('work') === item.work && (url.searchParams.get('video') || 'mv') === 'mv') return 'shared';
  if (url.pathname !== item.path) return 'unexpected';
  if (item.hash && url.hash.split('?')[0] === item.hash) return 'group-detail';
  if (item.media && url.searchParams.get('section') === 'works' && url.searchParams.get('media') === item.media
      && (url.searchParams.get('format') || 'mv') === 'mv') return 'group-detail';
  if (!url.search && (!url.hash || url.hash === '#/' + item.slug + '/home')) return 'home';
  return 'unexpected';
}

// Read only completed, same-origin catalogue timings and public routes. Resource timing clocks
// restart on a full navigation; timeOrigin makes each capture comparable to the click baseline.
function browserSample() {
  const finite = value => Number.isFinite(value) ? value : null;
  const entries = performance.getEntriesByType('resource').flatMap(resource => {
    const url = new URL(resource.name);
    if (url.origin !== location.origin || url.pathname !== '/api/catalog') return [];
    return [{work: url.searchParams.get('work'), artist: url.searchParams.get('artist'), shape: url.searchParams.get('shape'),
      start: finite(resource.startTime), request: finite(resource.requestStart), response: finite(resource.responseStart),
      end: finite(resource.responseEnd), status: finite(resource.responseStatus), transfer: finite(resource.transferSize),
      encoded: finite(resource.encodedBodySize), decoded: finite(resource.decodedBodySize),
      recovered: resource.serverTiming?.some(entry => entry.name === 'catalog-retry') ?? false}];
  });
  const nav = performance.getEntriesByType('navigation')[0];
  const navigation = nav ? Object.fromEntries([
    'fetchStart', 'requestStart', 'responseStart', 'responseEnd', 'domInteractive',
    'domContentLoadedEventEnd', 'loadEventEnd', 'transferSize', 'encodedBodySize', 'decodedBodySize',
  ].map(field => [field, finite(nav[field])])) : null;
  const detailCatalog = entries.find(resource => !resource.artist && resource.shape === 'display-v1');
  let assetsBeforeCatalog = null;
  if (detailCatalog && detailCatalog.start !== null) {
    const resources = performance.getEntriesByType('resource').filter(resource => {
      const url = new URL(resource.name);
      return url.origin === location.origin && url.pathname.startsWith('/_next/static/')
        && resource.startTime <= detailCatalog.start && resource.responseEnd <= detailCatalog.start;
    });
    const scripts = resources.filter(resource => new URL(resource.name).pathname.endsWith('.js'));
    const styles = resources.filter(resource => new URL(resource.name).pathname.endsWith('.css'));
    const measure = items => ({
      count: items.length,
      lastResponseEnd: items.length ? Math.max(...items.map(item => item.responseEnd)) : null,
      transferBytes: items.reduce((sum, item) => sum + item.transferSize, 0),
    });
    assetsBeforeCatalog = {scripts: measure(scripts), styles: measure(styles)};
  }
  return {origin: performance.timeOrigin, now: performance.now(), width: document.documentElement.clientWidth,
    route: location.pathname, work: new URL(location.href).searchParams.get('work'), entries, navigation, assetsBeforeCatalog};
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function relative(url) {return url.pathname + url.search + url.hash;}
async function checkOne(tab, cdp, item, origin, timeoutMs) {
  const timeout = {timeoutMs};
  const visible = locator => locator.waitFor({state: 'visible', ...timeout});
  const first = selector => tab.playwright.locator(selector).first();
  const sample = async () => {
    const result = await cdp.send('Runtime.evaluate', {expression: '(' + browserSample.toString() + ')()', returnByValue: true});
    if (!result.result?.value) throw Error('Resource Timing 采样失败');
    return result.result.value;
  };
  const row = {slug: item.slug, title: item.title, expected: item.expected, oldStatus: item.oldStatus,
    status: 'unverified', clickCount: 0, toPlayerMs: null, toSourceMs: null, back: false, entries: []};
  const catalog = new Map();
  const navigationStart = clock.now();
  let baseline, started;
  function collect(data) {
    if (!baseline) return;
    data.entries.forEach((entry, index) => {
      if (entry.start === null || data.origin + entry.start < baseline.origin + baseline.now) return;
      catalog.set(data.origin + '/' + index, {documentTimeOrigin: data.origin, ...entry});
    });
    row.entries = [...catalog.values()];
    if (data.route === '/' && data.work === item.work && data.navigation) {
      row.detailDocument = {navigation: data.navigation, assetsBeforeCatalog: data.assetsBeforeCatalog};
    }
  }
  const elapsed = () => Math.round(clock.now() - started);
  async function destination() {
    const deadline = clock.now() + timeoutMs;
    do {
      const url = new URL(await tab.url());
      const kind = routeKind(url, item, origin);
      if (kind !== 'home') return {url, kind};
      await delay(30);
    } while (clock.now() < deadline);
    throw Error('点卡后仍停在原首页');
  }
  try {
    row.step = 'home-card';
    await tab.goto(origin + item.path);
    const card = first(item.card);
    await visible(card);
    row.homeReadyMs = Math.round(clock.now() - navigationStart);
    const link = await card.evaluate(el => ({href: el.getAttribute('href'), target: el.getAttribute('target')}));
    const home = new URL(await tab.url());
    if (routeKind(home, item, origin) !== 'home' || !link.href || link.target === '_blank') throw Error('首页或入口不符');
    const href = new URL(link.href, home);
    if (!['group-detail','shared'].includes(routeKind(href, item, origin))) throw Error('卡片指向其他版本');
    row.first = relative(href);
    baseline = await sample();
    row.width = baseline.width;
    row.homeCatalogAtCard = baseline.entries;
    started = clock.now();
    await card.click(timeout);
    row.clickCount++;
    const {url, kind} = await destination();
    row.firstDestination = relative(url);
    if (kind !== 'shared' && kind !== 'group-detail') throw Error('进入了未预期的地址');
    if (kind === 'group-detail') {
      row.step = 'group-detail';
      await visible(tab.playwright.getByRole('heading', {name: item.title, exact: true, level: 1}).first());
      row.groupDetailMs = elapsed();
      if (item.source) {
        await visible(tab.playwright.locator(item.notice).filter({hasText: '此版本暂无站内播放或评分。'}).first());
        const source = first(item.source);
        await visible(source);
        const address = new URL(await source.evaluate(el => el.href));
        if (address.origin !== 'https://www.youtube.com' || address.pathname !== '/watch'
            || address.searchParams.get('v') !== item.video) throw Error('原片出处不符合此剪辑');
        row.toSourceMs = elapsed();
        row.source = address.href;
        row.status = 'source-only';
      } else {
        row.step = 'group-to-shared';
        const bridge = first(item.bridge + ':not(:disabled)');
        await visible(bridge);
        const control = await bridge.evaluate(el => ({label: el.textContent.trim(), href: el.getAttribute('href'),
          sourceKey: el.getAttribute('data-source-key'), target: el.getAttribute('target')}));
        if (control.target === '_blank' || (control.href && routeKind(new URL(control.href, url), item, origin) !== 'shared')
            || (item.sourceKey && control.sourceKey !== item.sourceKey)) throw Error('团内入口版本不符');
        row.bridge = control.label;
        row.bridgeAvailableMs = elapsed();
        collect(await sample());
        await bridge.click(timeout);
        row.clickCount++;
      }
    }
    if (row.status !== 'source-only') {
      row.step = 'shared-player';
      const play = first('.detail:not(.stage-view) button.video-play:not(:disabled)');
      await visible(play);
      const buttonTime = elapsed();
      const details = await play.evaluate(el => ({label: el.textContent.trim(),
        title: el.closest('.detail')?.querySelector('.music-work-title h1')?.textContent?.trim()}));
      const url = new URL(await tab.url());
      if (routeKind(url, item, origin) !== 'shared' || item.title !== details.title || !/^播放视频/.test(details.label))
        throw Error('共享播放控件、标题或作品版本不符');
      row.button = details.label;
      row.status = 'shared-player';
      row.toPlayerMs = buttonTime;
    }
    row.final = relative(new URL(await tab.url()));
    collect(await sample());
    await delay(350);
    collect(await sample());
    row.sampledAtMs = elapsed();
    row.step = 'browser-back';
    row.backSteps = 0;
    for (let step = 0; step < row.clickCount; step++) {
      await tab.back();
      row.backSteps++;
      if (routeKind(new URL(await tab.url()), item, origin) === 'home') break;
    }
    await visible(card);
    row.back = routeKind(new URL(await tab.url()), item, origin) === 'home';
    if (!row.back) throw Error('未返回原团首页');
    delete row.step;
  } catch (error) {
    row.reason = String(error.message || error).split('\n', 1)[0].slice(0, 200);
    // A login redirect can have its own URL parameters. Retain only its origin and path.
    try {
      const observed = new URL(await tab.url());
      const observedKind = routeKind(observed, item, origin);
      row.observedPath = observedKind === 'unexpected' ? observed.origin + observed.pathname : relative(observed);
      if (observedKind === 'unexpected') return row;
      const atFailure = await sample();
      row.failureScreen = {
        urlKind: observedKind, width: atFailure.width,
        observedAtUtc: new Date(atFailure.origin + atFailure.now).toISOString(),
        alertVisible: await tab.playwright.locator('[role="alert"]').filter({visible:true}).count() > 0,
        catalogResponses: atFailure.entries.map(entry => ({
          artist: entry.artist, status: entry.status, recovered: entry.recovered,
          receivedAtUtc: entry.end === null ? null : new Date(atFailure.origin + entry.end).toISOString(),
        })),
      };
      if (row.step === 'group-to-shared') {
        const control = first(item.bridge);
        if (await control.count()) row.bridgeDisabled = await control.evaluate(el => el.matches(':disabled'));
      }
      collect(atFailure);
    } catch { /* Keep the original failure when the document is no longer reachable. */ }
  }
  return row;
}

export async function checkArtistWorkAccess(tab, options = {}) {
  const plan = artistWorkAccessPlan();
  const origin = new URL(options.origin || homeSample.site).origin;
  const slugs = options.slugs || Object.keys(localDetails);
  const timeoutMs = options.timeoutMs ?? 12000;
  if (!Array.isArray(slugs) || !slugs.length || new Set(slugs).size !== slugs.length
      || !slugs.every(slug => plan.some(item => item.slug === slug))) throw Error('未知、重复或空的团体范围');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw Error('无效的超时时间');
  const cdp = await tab.capabilities.get('cdp');
  const rows = [];
  for (const slug of slugs) rows.push(await checkOne(tab, cdp, plan.find(item => item.slug === slug), origin, timeoutMs));
  return {origin, baselineVersion: 218, method: 'Host monotonic time from home click dispatch to first observed visible, enabled player or verified original-source link. Includes IAB scheduling. Resource Timing uses per-document millisecond offsets; entries started from the pre-click browser baseline and completed by collection are included. No media started.',
    planned: rows.length, playerAndReturn: rows.filter(row => row.status === 'shared-player' && row.back).length,
    sourceOnlyAndReturn: rows.filter(row => row.status === 'source-only' && row.back).length,
    incomplete: rows.filter(row => !!row.reason).length, rows};
}
