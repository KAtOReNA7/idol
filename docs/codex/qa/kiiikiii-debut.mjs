const workId = 'rec28ldfRTrAb0';
const groupImage = '/artist/kiiikiii/uncut-gem/group-original.jpg';
const members = ['jiyu', 'leesol', 'sui', 'haum', 'kya'];

/** Uses a dedicated, muted Codex browser tab. Pass a new tab at each desired viewport. */
export async function checkKiiikiiiDebut(tab, origin) {
  const home = new URL('/artists/kiiikiii', origin).href;
  const page = tab.playwright;
  const result = {};
  const waitVisible = locator => locator.waitFor({state: 'visible', timeoutMs: 15000});
  const lightbox = page.locator('.photo-lightbox[role="dialog"]');
  const closeOriginal = () => lightbox.getByRole('button', {name: '关闭大图'}).press('Escape');
  let step = '打开团体首页';
  try {
  async function picture(locator) {
    await waitVisible(locator);
    const end = Date.now() + 10000;
    let reading;
    do {
      reading = await locator.evaluate(img => ({
        source: img.getAttribute('src'), pixels: [img.naturalWidth, img.naturalHeight],
        box: [img.clientWidth, img.clientHeight], complete: img.complete,
      }));
      if (reading.complete && reading.pixels.every(Boolean)) return reading;
      await new Promise(resolve => setTimeout(resolve, 100));
    } while (Date.now() < end);
    throw Error('Picture did not decode: ' + reading.source);
  }
  await tab.goto(home);
  await waitVisible(page.locator('.kk-home-members .kk-roster button').first());
  result.opening = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    title: document.querySelector('.kk-campaign-heading h1 img')?.alt,
    roster: Array.from(document.querySelectorAll('.kk-home-members .member-display-name'), n => n.textContent.trim()),
    mixedOrder: Array.from(document.querySelectorAll('.kk-content section h2'), n => n.textContent.trim()),
  }));
  result.mark = await picture(page.locator('.kk-campaign-heading h1 img'));
  result.photo = await picture(page.locator('.kk-campaign figure img'));
  result.jar = await picture(page.locator('.kk-campaign-work > img'));
  await page.locator('.kk-campaign figure a').press('Enter');
  result.original = await picture(lightbox.locator('img'));
  if (result.original.source !== groupImage) throw Error('The photo opened a different original');
  await closeOriginal();
  result.restoredOriginalFocus = await page.locator('.kk-campaign figure a').evaluate(el => document.activeElement === el);
  step = '进入首位成员并返回团体概览';
  await page.locator('.kk-home-members [data-artist-member-trigger]').first().click();
  result.member = await picture(page.locator('.kk-member-hero figure img'));
  await page.locator('.kk-back').first().click();
  await waitVisible(page.locator('.kk-roster button').first());
  await page.getByRole('button', {name: '概览', exact: true}).click();
  const entry = page.locator('.kk-campaign-work');
  result.workLink = await entry.getAttribute('href');
  if (new URL(result.workLink, origin).searchParams.get('work') !== workId) throw Error('Home linked a different recording');
  step = '进入 I DO ME 并读取五人卡';
  await entry.click();
  const cards = page.locator('.cast-section .cast-card:has(.mv-identity-frame img[src*="/kiiikiii/uncut-gem/"])');
  await waitVisible(cards.first());
  result.cards = [];
  for (const member of members) {
    step = member + ' 的认人照与原图';
    const card = page.locator('.cast-section .cast-card').filter({has: page.locator('img[src$="/' + member + '-card.webp"]')});
    const frame = card.locator('.mv-identity-frame');
    const preview = await picture(frame.locator('img'));
    await frame.click();
    const original = await picture(lightbox.locator('img'));
    await closeOriginal();
    step = member + ' 的评分入口';
    const score = card.locator('.mv-inline-score .credit-score-action,button.editor-open').first();
    const hasScore = await score.count() > 0;
    if (hasScore) {
      await score.click();
      result.cards.push({member, preview, original, scoreControls: await card.locator('input').count()});
    } else {
      result.cards.push({member, preview, original, readonlyScores: await card.locator('.cast-scores > span').count()});
    }
  }
  step = '切换 1theK 舞台';
  await page.getByRole('tab', {name: '舞台', exact: true}).click();
  result.stage = await picture(page.locator('#work-video-panel .video-stage img').first());
  result.stageShowsMemberScores = await page.locator('.cast-section').isVisible();
  } catch (error) {
    result.failure = {step, message: String(error?.message ?? error).slice(0, 360)};
  }
  return result;
}
