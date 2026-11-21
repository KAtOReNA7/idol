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
    await context.close();
  }
} finally {
  await browser.close();
}
results.sort((a, b) => a.width - b.width || a.slug.localeCompare(b.slug));
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(results, null, 2) + '\n');
const failures = results.filter(row => row.failure);
console.log(JSON.stringify({checked: results.length, failures}, null, 2));
if (failures.length) process.exitCode = 1;
