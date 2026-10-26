// Read-only browser verification of the new izna hero. Run only after the new
// review overlay is built, merged, and served by the task's existing server.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/20240513/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const out = 'E:/project/idol-hero-web-20261023';
const site = 'E:/project/idol-review-20261023/out';
const origin = 'http://127.0.0.1:4173';
const executablePath = 'C:/Users/20240513/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';
const home = origin + '/artists/izna/index.html';
const manifestFile = path.join(site, 'review-izna/manifest.json');
const resultFile = path.join(out, 'hero-qa-results.json');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const near = (actual, expected, tolerance = 2) => Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
const result = {
  startedAt: new Date().toISOString(),
  browserReason: 'Browser plugin not available; regular Playwright with an existing local Chromium executable',
  environment: 'Windows / Chromium 1228 / Playwright / native browser zoom 100%',
  origin,
  scope: 'izna homepage geometry, original-image viewer, hero navigation, and unchanged accepted group smoke checks',
  unverified: ['80% and 125% native browser zoom', 'live deployed Site', 'real owner save', 'whole-group visual acceptance'],
  harnessAdjustments: ['Initial screenshot scrollTo used the page smooth-scroll behavior; corrected to instant scrolling and a zero-scroll wait.', 'Protected group selectors corrected from the izna ShadowRoot selector to the existing GENBLUE/WOOAH native wrappers.'],
  layoutCases: [], interactionCases: [], recoveryCases: [], protectedCases: []
};
const save = () => fs.writeFileSync(resultFile, JSON.stringify(result, null, 2) + '\n');
const check = (row, condition, message) => { if (!condition) row.failures.push(message); };

function deepFocus() {
  let node = document.activeElement;
  while (node?.shadowRoot?.activeElement) node = node.shadowRoot.activeElement;
  return node ? {tag: node.tagName, label: node.getAttribute('aria-label'), text: node.textContent, href: node.getAttribute('href')} : null;
}
async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function decoded(locator) {
  await locator.waitFor({state: 'visible'});
  await locator.evaluate(img => img.decode());
}
async function fullPageImages(page, root) {
  // Trigger the actual lazy images without replacing or injecting any content.
  await page.mouse.wheel(0, 1);
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 650) {
      window.scrollTo({top: y, left: 0, behavior: 'instant'});
      await new Promise(resolve => setTimeout(resolve, 65));
    }
  });
  await root.locator('img').evaluateAll(async images => {
    await Promise.all(images.map(img => img.decode().catch(() => {})));
  });
  await page.evaluate(() => scrollTo({top: 0, left: 0, behavior: 'instant'}));
  await page.waitForFunction(() => scrollY === 0);
  await settle(page);
}
async function attach(browser, row, width, height = width < 500 ? 844 : 1000) {
  row.width = width; row.height = height; row.failures = []; row.pageErrors = []; row.consoleErrors = []; row.httpErrors = []; row.blockedExternal = []; row.screenshots = [];
  const context = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1});
  const page = await context.newPage();
  page.on('pageerror', error => row.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') row.consoleErrors.push({message: message.text(), url: message.location().url}); });
  page.on('response', response => { if (response.status() >= 400) row.httpErrors.push({url: response.url(), status: response.status()}); });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { row.blockedExternal.push(url.origin + url.pathname); return route.abort(); }
    return route.continue();
  });
  return {context, page};
}
function finish(row) {
  row.unexpectedConsoleErrors = row.consoleErrors.filter(error => !(row.expectedBlockedStylesheet && error.url?.endsWith('/artist/izna/native-v3/izna.css') && error.message.includes('ERR_FAILED')));
  for (const field of ['pageErrors', 'unexpectedConsoleErrors', 'httpErrors', 'blockedExternal']) check(row, row[field].length === 0, field + ' was not empty');
  row.passed = row.failures.length === 0;
  save();
}
async function screenshot(page, row, name, fullPage = false) {
  const file = path.join(out, name + '.png');
  await page.screenshot({path: file, fullPage}); row.screenshots.push(file);
}
async function geometry(root) {
  return root.evaluate(root => {
    const rect = node => node?.getBoundingClientRect().toJSON() ?? null;
    const hero = root.querySelector('.home-hero-viewport');
    const img = hero?.querySelector('img');
    if (!hero || !img) throw Error('The homepage .home-hero-viewport image was not found; update the QA selector only from the delivered renderer.');
    const imageRect = img.getBoundingClientRect();
    let visible = {left: imageRect.left, top: imageRect.top, right: imageRect.right, bottom: imageRect.bottom};
    const clippers = [];
    for (let node = img.parentElement; node && root.contains(node); node = node.parentElement) {
      const css = getComputedStyle(node), box = node.getBoundingClientRect();
      const clipX = /hidden|clip|auto|scroll/.test(css.overflowX);
      const clipY = /hidden|clip|auto|scroll/.test(css.overflowY);
      if (clipX || clipY) {
        clippers.push({tag: node.tagName, className: node.className, overflowX: css.overflowX, overflowY: css.overflowY, rect: box.toJSON()});
        if (clipX) { visible.left = Math.max(visible.left, box.left); visible.right = Math.min(visible.right, box.right); }
        if (clipY) { visible.top = Math.max(visible.top, box.top); visible.bottom = Math.min(visible.bottom, box.bottom); }
      }
      if (node === root) break;
    }
    const sx = imageRect.width / img.naturalWidth, sy = imageRect.height / img.naturalHeight;
    const sourceVisible = {x: (visible.left - imageRect.left) / sx, y: (visible.top - imageRect.top) / sy, width: (visible.right - visible.left) / sx, height: (visible.bottom - visible.top) / sy};
    const controls = [...root.querySelectorAll('.home-hero-nav a,.home-hero-nav button')].map(node => ({tag: node.tagName, text: node.textContent.trim(), href: node.getAttribute('href'), label: node.getAttribute('aria-label'), rect: rect(node)}));
    const visibleDecorations = [...root.querySelectorAll('.hero-orb,.header-ring,.hero-edition,.hero-masthead')].filter(node => { const css = getComputedStyle(node); return css.display !== 'none' && css.visibility !== 'hidden' && node.getClientRects().length > 0; }).map(node => node.className);
    return {title: root.querySelector('h1')?.textContent, viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, rootWidth: root.scrollWidth, rootRect: rect(root),
      outerIndexLinks: [...document.querySelectorAll('[data-izna-native-host] > div a[href="/?view=groups"]')].filter(node => node.getClientRects().length && getComputedStyle(node).display !== 'none').length,
      indexLink: root.querySelector('.home-brand a') ? {label: root.querySelector('.home-brand a').getAttribute('aria-label'), href: root.querySelector('.home-brand a').getAttribute('href')} : null,
      header: rect(root.querySelector('.home-header')), hero: rect(hero), image: {rect: rect(img), src: img.currentSrc, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete, objectFit: getComputedStyle(img).objectFit, objectPosition: getComputedStyle(img).objectPosition},
      scaleX: sx, scaleY: sy, sourceVisible, clippers, controls, visibleDecorations,
      badImages: [...root.querySelectorAll('img')].filter(node => !node.complete || !node.naturalWidth).map(node => ({src: node.currentSrc, alt: node.alt})),
      frameworkOverlays: document.querySelectorAll('vite-error-overlay,nextjs-portal').length};
  });
}
async function layout(browser, width) {
  const row = {kind: 'homepage-layout'}; result.layoutCases.push(row);
  const {context, page} = await attach(browser, row, width);
  try {
    const response = await page.goto(home, {waitUntil: 'networkidle'}); row.status = response.status(); row.url = page.url();
    const root = page.locator('[data-astra-review-root="izna"]');
    await root.locator('.home-hero-viewport img').waitFor({state: 'visible'}); await decoded(root.locator('.home-hero-viewport img'));
    await fullPageImages(page, root); row.geometry = await geometry(root);
    const g = row.geometry, s = g.sourceVisible;
    const imageFile = path.join(site, decodeURIComponent(new URL(g.image.src).pathname));
    row.heroFileSha256 = sha(fs.readFileSync(imageFile));
    check(row, row.heroFileSha256 === '31139045704dc66a4101af43a9e74bb067f37e403a2d8b6e1d4f753316e9fe2c', 'Served hero bytes differ from the approved original PNG');
    check(row, row.status === 200, 'Homepage did not return HTTP 200');
    check(row, g.documentWidth <= width + 1 && g.rootWidth <= width + 1, 'Horizontal overflow');
    check(row, g.badImages.length === 0, 'A rendered image did not decode');
    check(row, g.frameworkOverlays === 0, 'Framework error overlay');
    check(row, g.visibleDecorations.length === 0, 'Old ring, side decoration, or giant masthead remains visible');
    check(row, g.outerIndexLinks === 0, 'The normal homepage still shows the outer index toolbar');
    check(row, g.indexLink?.label === '返回团体索引' && g.indexLink?.href === '/review-izna/records.html?view=groups', 'The small brand does not preserve the review-specific index return entry');
    check(row, g.image.naturalWidth === 1500 && g.image.naturalHeight === 2100, 'Hero is not the approved 1500x2100 original PNG');
    check(row, near(g.scaleX, g.scaleY, 0.001), 'Hero image aspect ratio is distorted');
    check(row, near(s.x, 0) && near(s.width, 1500), 'Hero crops either side of the original image');
    if (width < 500) {
      check(row, near(g.hero.y - g.rootRect.y, 76), 'Mobile photo top differs from the compact header and 16px gap');
      check(row, near(g.hero.width, width - 32), 'Mobile hero does not keep 16px side gutters');
      check(row, near(s.y, 0) && near(s.height, 2100), 'Mobile does not show the whole original');
      check(row, near(g.hero.height / g.hero.width, 1.4, 0.005), 'Mobile hero is not 5:7');
    } else {
      const expectedWidth = Math.min(g.rootRect.width * 7 / 9, 1500);
      check(row, near(g.hero.y - g.rootRect.y, 105), 'Desktop photo top differs from the approved host-relative y105');
      check(row, near(g.hero.width, expectedWidth), 'Desktop hero does not use the 77.7778% host track with native 1500px cap');
      check(row, near(g.hero.height, expectedWidth * 2 / 3), 'Desktop visible window is not 3:2');
      check(row, near(s.y, 850, 3) && near(s.height, 1000, 3), 'Desktop source window differs from y850..1850');
      check(row, s.y < 930 && s.y + s.height > 1740, 'Known head/shoe extents fall outside the source window');
    }
    for (const control of g.controls) check(row, control.rect.width > 0 && control.rect.height >= 43 && control.rect.x >= -1 && control.rect.right <= width + 1, 'Hero control has an invalid hit area: ' + control.text);
    row.screenshotScrollY = await page.evaluate(() => scrollY);
    check(row, row.screenshotScrollY === 0, 'Homepage screenshot is not at the top of the page');
    await screenshot(page, row, 'hero-' + width); await screenshot(page, row, 'home-full-' + width, true);
    const compositionFile = path.join(out, 'hero-composition-' + width + '.png');
    await root.locator('.home-hero').screenshot({path: compositionFile}); row.screenshots.push(compositionFile);
  } catch (error) { row.failures.push(error.stack); await screenshot(page, row, 'layout-failure-' + width).catch(() => {}); }
  finally { finish(row); await context.close(); }
}
async function interactions(browser, width) {
  const row = {kind: 'hero-viewer-and-navigation'}; result.interactionCases.push(row);
  const {context, page} = await attach(browser, row, width);
  try {
    await page.goto(home, {waitUntil: 'networkidle'});
    const root = page.locator('[data-astra-review-root="izna"]');
    await decoded(root.locator('.home-hero-viewport img'));
    const opener = root.getByRole('button', {name: /查看原图/});
    assert.equal(await opener.count(), 1, 'Expected one distinct original-image button under the hero');
    await opener.scrollIntoViewIfNeeded(); row.opener = await opener.evaluate(node => ({text: node.textContent, label: node.getAttribute('aria-label'), rect: node.getBoundingClientRect().toJSON()}));
    row.viewer = [];
    for (const closeMethod of ['Escape', 'button']) {
      await opener.click(); const dialog = root.locator('dialog.astra-image-dialog');
      await dialog.waitFor({state: 'visible'}); await decoded(dialog.locator('img')); await settle(page);
      const entry = {closeMethod, openFocus: await page.evaluate(deepFocus), image: await dialog.locator('img').evaluate(img => ({src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, rect: img.getBoundingClientRect().toJSON(), objectFit: getComputedStyle(img).objectFit})), dialog: await dialog.boundingBox()};
      assert.equal(entry.image.width, 1500); assert.equal(entry.image.height, 2100); assert.equal(entry.openFocus.label, '关闭图片');
      assert.ok(entry.dialog.x >= -1 && entry.dialog.x + entry.dialog.width <= width + 1, 'Viewer exceeds viewport width');
      await page.keyboard.press('Tab');
      assert.ok(await dialog.evaluate(node => { let active = document.activeElement; while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement; return node.contains(active); }), 'Tab leaves the viewer');
      await page.keyboard.press('Shift+Tab');
      await screenshot(page, row, 'hero-viewer-' + width + '-' + closeMethod);
      if (closeMethod === 'Escape') await page.keyboard.press('Escape'); else await dialog.getByRole('button', {name: '关闭图片', exact: true}).click();
      await dialog.waitFor({state: 'hidden'}); await settle(page);
      entry.closeFocus = await page.evaluate(deepFocus);
      entry.focusRestored = await opener.evaluate(node => { let active = document.activeElement; while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement; return node === active; });
      assert.equal(entry.focusRestored, true, 'Viewer did not restore focus to the actual under-photo opener'); row.viewer.push(entry);
    }
    row.navigation = [];
    for (const label of ['成员', '作品', '时间轴']) {
      const link = root.locator('.home-hero-nav a').filter({hasText: new RegExp('^' + label)});
      assert.equal(await link.count(), 1, 'Expected one hero navigation link for ' + label);
      const href = await link.getAttribute('href'); await link.click();
      await page.waitForURL(url => url.pathname + url.search === href); await root.locator('main').waitFor({state: 'visible'}); await settle(page);
      const state = await root.evaluate(node => ({headings: [...node.querySelectorAll('h1')].map(h => h.textContent), textLength: node.textContent.length, width: node.scrollWidth, documentWidth: document.documentElement.scrollWidth}));
      assert.ok(state.textLength > 100 && state.width <= width + 1 && state.documentWidth <= width + 1, label + ' route is blank or overflows');
      row.navigation.push({label, href, url: page.url(), ...state});
      await page.goBack(); await root.locator('.home-hero-viewport img').waitFor({state: 'visible'}); await settle(page);
    }
    const brand = root.getByRole('link', {name: '返回团体索引', exact: true});
    row.index = {href: await brand.getAttribute('href')};
    assert.equal(row.index.href, '/review-izna/records.html?view=groups');
    await brand.click();
    await page.waitForURL(url => url.pathname === '/review-izna/records.html' && url.searchParams.get('view') === 'groups');
    const groupCard = page.locator('[data-browse-anchor="group-rec28ldfRTiCpp"]');
    await groupCard.waitFor({state: 'visible'});
    await decoded(groupCard.locator('img'));
    row.index.url = page.url(); row.index.heading = await page.locator('h1').allTextContents(); row.index.cardText = await groupCard.innerText();
    row.index.image = await groupCard.locator('img').evaluate(img => ({src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, complete: img.complete}));
    assert.ok(row.index.heading.some(text => text.includes('团体索引'))); assert.ok(row.index.cardText.includes('izna'));
    await screenshot(page, row, 'hero-group-index-' + width);
    await groupCard.click(); await page.waitForURL(url => url.pathname === '/artists/izna');
    await decoded(root.locator('.home-hero-viewport img')); row.index.returnUrl = page.url();
    await screenshot(page, row, 'hero-returned-' + width);
  } catch (error) { row.failures.push(error.stack); await screenshot(page, row, 'interaction-failure-' + width).catch(() => {}); }
  finally { finish(row); await context.close(); }
}
async function stylesheetRecovery(browser, width) {
  const row = {kind: 'stylesheet-error-exit-and-retry', expectedBlockedStylesheet: true, blockedStylesheet: 0}; result.recoveryCases.push(row);
  const {context, page} = await attach(browser, row, width);
  try {
    await page.route('**/artist/izna/native-v3/izna.css', route => {
      if (!row.blockedStylesheet) { row.blockedStylesheet++; return route.abort(); }
      return route.continue();
    });
    await page.goto(home, {waitUntil: 'networkidle'});
    const status = page.getByRole('status').filter({hasText: '本团样式未能载入'});
    await status.waitFor({state: 'visible'});
    const retry = page.getByRole('button', {name: '重新打开', exact: true}); await retry.waitFor({state: 'visible'});
    const exit = page.locator('[data-izna-native-host] > div > a').filter({hasText: '团体索引'});
    await exit.waitFor({state: 'visible'}); row.error = {text: await status.innerText(), role: await status.getAttribute('role'), href: await exit.getAttribute('href')};
    assert.equal(row.blockedStylesheet, 1); assert.equal(row.error.href, '/review-izna/records.html?view=groups');
    await screenshot(page, row, 'hero-style-error-' + width);
    // A real modified-click proves the exit while preserving this failed
    // document for the retry-button check; only one stylesheet is blocked.
    const [exitPage] = await Promise.all([context.waitForEvent('page'), exit.click({modifiers: ['Control']})]);
    await exitPage.waitForURL(url => url.pathname === '/review-izna/records.html' && url.searchParams.get('view') === 'groups');
    await exitPage.locator('[data-browse-anchor="group-rec28ldfRTiCpp"]').waitFor({state: 'visible'});
    await decoded(exitPage.locator('[data-browse-anchor="group-rec28ldfRTiCpp"] img'));
    row.exitUrl = exitPage.url(); row.exitHeadings = await exitPage.locator('h1').allTextContents();
    assert.ok(row.exitHeadings.some(text => text.includes('团体索引'))); await exitPage.close();
    await retry.click(); const root = page.locator('[data-astra-review-root="izna"]');
    await decoded(root.locator('.home-hero-viewport img'));
    await root.getByRole('link', {name: '返回团体索引', exact: true}).waitFor({state: 'visible'});
    assert.equal(await page.getByRole('button', {name: '重新打开', exact: true}).count(), 0);
    row.recovered = await geometry(root); assert.equal(row.recovered.outerIndexLinks, 0); assert.equal(row.recovered.image.naturalWidth, 1500);
    await page.evaluate(() => scrollTo({top: 0, left: 0, behavior: 'instant'})); await page.waitForFunction(() => scrollY === 0);
    await screenshot(page, row, 'hero-style-recovered-' + width);
  } catch (error) { row.failures.push(error.stack); await screenshot(page, row, 'style-recovery-failure-' + width).catch(() => {}); }
  finally { finish(row); await context.close(); }
}
async function protectedSmoke(browser, slug, width) {
  const row = {kind: 'accepted-group-smoke', slug}; result.protectedCases.push(row);
  const {context, page} = await attach(browser, row, width);
  try {
    const response = await page.goto(origin + '/artists/' + slug + '/index.html', {waitUntil: 'networkidle'});
    const root = page.locator(slug === 'genblue' ? '[data-genblue-native="bluecut"]' : '.wooah-editorial[data-artist="wooah"]'); await root.locator('main').waitFor({state: 'visible'});
    await fullPageImages(page, root);
    row.status = response.status(); row.title = await page.title();
    row.state = await root.evaluate(node => ({textLength: node.textContent.length, width: node.scrollWidth, documentWidth: document.documentElement.scrollWidth, headings: [...node.querySelectorAll('h1')].map(h => h.textContent), badImages: [...node.querySelectorAll('img')].filter(img => !img.complete || !img.naturalWidth).map(img => img.currentSrc)}));
    check(row, row.status === 200 && row.state.textLength > 100, 'Accepted group page is unavailable or blank');
    check(row, row.state.width <= width + 1 && row.state.documentWidth <= width + 1, 'Accepted group horizontal overflow');
    check(row, row.state.badImages.length === 0, 'Accepted group image decode failure');
    if (slug === 'genblue' && width === 320 && row.state.documentWidth === 360 && result.protectedFiles.mismatches.length === 0) row.baselineObservation = 'Existing protected GENBLUE package has 360px document width at a 320px viewport. All 100 protected files match the pre-change baseline; not an izna regression and not corrected in this scope.';
    await screenshot(page, row, 'protected-' + slug + '-' + width);
  } catch (error) { row.failures.push(error.stack); await screenshot(page, row, 'protected-failure-' + slug + '-' + width).catch(() => {}); }
  finally { finish(row); await context.close(); }
}

(async () => {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.equal(manifest.sourceFingerprint, '217e48000f09bf157f781c62062b01f648eac9199dac02ae991e7bd01441fa50', 'Final review fingerprint changed; do not mix evidence between builds');
  result.sourceFingerprint = manifest.sourceFingerprint; result.manifestSha256 = sha(fs.readFileSync(manifestFile));
  const baseline = JSON.parse(fs.readFileSync(path.join(out, 'protected-site-baseline.json'), 'utf8'));
  result.protectedFiles = {count: Object.keys(baseline).length, mismatches: []};
  for (const [relative, expected] of Object.entries(baseline)) {
    const file = path.join(site, relative);
    if (!fs.existsSync(file) || sha(fs.readFileSync(file)) !== expected) result.protectedFiles.mismatches.push(relative);
  }
  assert.equal(result.protectedFiles.mismatches.length, 0, 'Protected Site files changed before browser verification');
  const browser = await chromium.launch({headless: true, executablePath});
  try {
    for (const width of [320, 390, 1440, 2048, 2560]) { console.log('Homepage geometry: ' + width); await layout(browser, width); }
    for (const width of [320, 1440]) { console.log('Original viewer/navigation: ' + width); await interactions(browser, width); }
    for (const width of [320, 1440]) { console.log('Stylesheet failure exit/retry: ' + width); await stylesheetRecovery(browser, width); }
    for (const slug of ['genblue', 'wooah']) for (const width of [320, 1440]) { console.log('Protected page: ' + slug + ' ' + width); await protectedSmoke(browser, slug, width); }
  } finally { await browser.close(); }
  result.finishedAt = new Date().toISOString();
  const cases = [...result.layoutCases, ...result.interactionCases, ...result.recoveryCases, ...result.protectedCases];
  result.summary = {cases: cases.length, passed: cases.filter(row => row.passed).length, failed: cases.filter(row => !row.passed).map(({kind, slug, width, failures}) => ({kind, slug, width, failures}))};
  save(); console.log(JSON.stringify(result.summary, null, 2));
  if (result.summary.failed.length) process.exitCode = 1;
})().catch(error => { result.fatal = error.stack; save(); console.error(error); process.exitCode = 1; });
