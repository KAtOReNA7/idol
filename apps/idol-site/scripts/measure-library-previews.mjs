import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
function localOrigin(value) {
  const url = new URL(value);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw Error('Use two local synthetic previews.');
  return url.origin;
}
const origins = {before: localOrigin(process.argv[2]), after: localOrigin(process.argv[3])};
assert.notEqual(origins.before, origins.after);

async function catalog(origin, artist) {
  const url = new URL('/api/catalog?shape=display-v1', origin);
  if (artist) url.searchParams.set('artist', artist);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  const bytes = Buffer.from(await response.arrayBuffer());
  const {groups, members, works, ratings, counts} = JSON.parse(bytes);
  return {
    bytes: bytes.length, counts, stages: works.filter(work => work.stage).length,
    rowsSha256: createHash('sha256').update(JSON.stringify([groups, members, works, ratings])).digest('hex'),
  };
}
const contract = {};
for (const [name, origin] of Object.entries(origins)) {
  contract[name] = {all: await catalog(origin), ive: await catalog(origin, 'ive')};
}
assert.deepEqual(contract.before, contract.after, 'Both builds must serve the same synthetic catalog.');

const conditions = {
  samplesPerWidthAndBuild: 7, warmupPairsExcluded: 1, latencyMs: 25, downMbps: 20, upMbps: 10,
  browserCache: 'fresh context per navigation', workerCache: 'warm', externalRequests: 'blocked',
  metric: 'Milliseconds from navigation start until the first work title has text and non-zero layout height.',
};
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_PATH});
async function sample(origin, width) {
  const context = await browser.newContext({viewport: {width, height: 900}});
  try {
    await context.route('**/*', route =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: conditions.latencyMs, downloadThroughput: 2500000, uploadThroughput: 1250000,
    });
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const title = document.querySelector('.work-card h3');
        if (!title?.textContent || title.getBoundingClientRect().height <= 0) return;
        window.firstWorkTitleMs = performance.now();
        observer.disconnect();
      });
      observer.observe(document, {subtree: true, childList: true});
    });
    await page.goto(new URL('/?view=works', origin).href, {waitUntil: 'commit'});
    await page.waitForFunction(() => window.firstWorkTitleMs > 0);
    assert.deepEqual(errors, []);
    return await page.evaluate(() => window.firstWorkTitleMs);
  } finally {
    await context.close();
  }
}

const measurements = [], median = {};
try {
  for (const width of [390, 1440]) {
    for (let round = -1; round < conditions.samplesPerWidthAndBuild; round++) {
      const order = round % 2 === 0 ? ['before', 'after'] : ['after', 'before'];
      for (const name of order) {
        const ms = await sample(origins[name], width);
        if (round >= 0) measurements.push({name, width, round, ms});
      }
    }
    median[width] = {};
    for (const name of Object.keys(origins)) {
      const values = measurements.filter(row => row.width === width && row.name === name).map(row => row.ms);
      values.sort((a, b) => a - b);
      median[width][name] = values[Math.floor(values.length / 2)];
    }
  }
} finally {
  await browser.close();
}
const result = {conditions, contract, measurements, median};
if (process.argv[4]) fs.writeFileSync(process.argv[4], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(median, null, 2));
