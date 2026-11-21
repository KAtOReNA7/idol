import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const registry = require('../HANDOFF/artist-registry51.json');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = new URL(process.argv[2] || 'http://127.0.0.1:8787');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw Error('Use a local synthetic preview.');
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_PATH});
const results = [];
const groupCardScores = [];

async function checkGroupCardScores(context, width, average) {
  const page = await context.newPage();
  try {
    // Provide score states through the synthetic catalog response without saving any records.
    await page.route(url => url.origin === base.origin && url.pathname === '/api/catalog', async route => {
      const response = await route.fetch();
      const catalog = await response.json();
      for (const group of catalog.groups) group.average = average;
      await route.fulfill({response, json: catalog});
    });
    const expectedText = average === null ? null : `我的 MV 均分 ${average.toFixed(1)}`;
    const featured = new Set(['ive', 'illit', 'triples', 'badvillain', 'katseye']);
    for (const [view, groups] of [['groups', registry], ['home', registry.filter(group => featured.has(group.slug))]]) {
      await page.goto(new URL(`/?view=${view}`, base).href);
      const cards = page.locator(view === 'groups' ? '#group-index-results .music-group-card' : '.music-group-rail .music-group-card');
      await cards.first().waitFor();
      const rows = await cards.evaluateAll(nodes => nodes.map(node => ({
        target: node.getAttribute('data-browse-anchor'),
        score: [...node.querySelectorAll('p')].map(p => p.textContent.trim()).find(text => text.startsWith('我的 MV 均分')) ?? null,
        overflow: node.scrollWidth > node.clientWidth + 1,
      })));
      assert.deepEqual(rows.map(row => row.target).sort(), groups.map(group => `group-${group.groupId}`).sort());
      for (const row of rows) {
        assert.equal(row.score, expectedText, `${view} ${row.target} at ${width}px`);
        assert.equal(row.overflow, false, `${view} ${row.target} at ${width}px`);
      }
      groupCardScores.push({width, view, average, checked: rows.length});
    }
  } finally {
    await page.close();
  }
}

async function inspect(context, group, width) {
  const page = await context.newPage();
  const row = {slug: group.slug, width, pageErrors: []};
  page.on('pageerror', error => row.pageErrors.push(error.message));
  try {
    const response = await page.goto(new URL(group.path, base).href, {waitUntil: 'domcontentloaded'});
    row.status = response?.status();
    assert.equal(row.status, 200);
    if (group.slug === 'udtt') {
      const region = page.getByRole('region', {name: 'UDTT 公开作品'});
      await region.waitFor();
      row.publicWorks = await region.locator('a[href*="work="]').count();
      assert.ok(row.publicWorks > 0);
      await page.getByRole('button', {name: '重新读取'}).waitFor();
      row.view = 'public works fallback';
    } else if (['izna', 'ifeye'].includes(group.slug)) {
      // These two real artist layouts mount in open shadow roots.
      await page.waitForFunction(() => [...document.querySelectorAll('*')].some(host =>
        host.shadowRoot && [...host.shadowRoot.querySelectorAll('a,button')].some(control =>
          control.getBoundingClientRect().height > 0 && control.textContent.trim().length > 0)));
      row.view = 'shadow layout';
    } else {
      await page.waitForFunction(() => [...document.querySelectorAll('h1,h2')].some(node =>
        node.getBoundingClientRect().height > 0 && node.innerText.trim().length > 0)
        && document.body.innerText.trim().length > 45);
      row.view = 'React layout';
    }
    await page.evaluate(() => document.fonts.ready);
    row.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(row.overflow, false, 'Horizontal overflow');
    assert.deepEqual(row.pageErrors, []);
  } catch (error) {
    row.failure = error.message.split('\n')[0];
  } finally {
    results.push(row);
    await page.close();
  }
}

try {
  assert.equal(new Set(registry.map(group => group.slug)).size, 51);
  for (const width of [390, 1440]) {
    const context = await browser.newContext({viewport: {width, height: 900}});
    context.setDefaultTimeout(15000);
    await context.route('**/*', route =>
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
    for (let index = 0; index < registry.length; index += 4) {
      await Promise.all(registry.slice(index, index + 4).map(group => inspect(context, group, width)));
    }
    for (const average of [null, 0, 7.5]) await checkGroupCardScores(context, width, average);
    await context.close();
  }
} finally {
  await browser.close();
}
results.sort((a, b) => a.width - b.width || a.slug.localeCompare(b.slug));
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(results, null, 2) + '\n');
const failures = results.filter(row => row.failure);
console.log(JSON.stringify({checked: results.length, failures, groupCardScores}, null, 2));
if (failures.length) process.exitCode = 1;
