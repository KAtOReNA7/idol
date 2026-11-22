// Pass a dedicated Codex in-app tab at the intended width. The optional score check opens the editor only.
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const evidence = require('../evidence/20261122-member-release-portraits/everglow-slay.json');
const formalSite = 'https://idol-lens-private.wuke40758.chatgpt.site';
const cardSelector = '.detail:not(.stage-view) .cast-card[data-photo-member]';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function decodedImage(container, selector, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  do {
    const image = await container.evaluate(async (element, css) => {
      const img = element.querySelector(css);
      if (img?.complete && img.naturalWidth && img.naturalHeight) {
        try {
          if (typeof img.decode === 'function') await img.decode();
          return {src:img.currentSrc || img.src, width:img.naturalWidth, height:img.naturalHeight,
            checkedBy:typeof img.decode === 'function'?'decode':'complete-and-natural-size'};
        } catch {
          return {error:'图片解码失败'};
        }
      }
      if (element.querySelector('.photo-lightbox-error, [data-image-status="error"]')) {
        return {error:'图片未能载入'};
      }
      return null;
    }, selector);
    if (image) return image;
    await pause(150);
  } while (Date.now() < deadline);
  return {error:'等待图片宽高超时'};
}

function matches(actual, url, size, site) {
  return !!actual.src && actual.src === new URL(url, site).href
    && actual.width === size[0] && actual.height === size[1];
}

async function openAndReturn(tab, button, closeVia, timeoutMs) {
  const dialog = tab.playwright.locator('.photo-lightbox[role="dialog"]');
  await button.click({timeoutMs});
  await dialog.waitFor({state:'visible',timeoutMs});
  const close = dialog.getByRole('button',{name:'关闭大图'});
  let image;
  try {
    image = await decodedImage(dialog,'figure img',timeoutMs);
  } finally {
    if (closeVia === 'Escape') await close.press('Escape');
    else await close.click({timeoutMs});
    await dialog.waitFor({state:'hidden',timeoutMs});
  }
  const returned = await button.evaluate(node => node === node.ownerDocument.activeElement);
  return {...image, closeVia, returned};
}

export async function checkSlayPortraits(tab, {site=formalSite, timeoutMs=12000, checkPrevious=true, checkScores=false}={}) {
  await tab.goto(site+'/?view=works&work='+evidence.workId+'&video=mv');
  const pw = tab.playwright;
  const items = pw.locator(cardSelector);
  await items.first().waitFor({state:'visible',timeoutMs});
  const actualCount = await items.count();
  const width = await pw.evaluate(() => document.documentElement.clientWidth);
  const rows = [];
  for (const [index, member] of evidence.portraits.entries()) {
    const row = {name:member.name, memberId:member.memberId};
    rows.push(row);
    const card = pw.locator(cardSelector+'[data-photo-member="'+member.memberId+'"]');
    try {
      if (await card.count() !== 1) throw Error('成员卡数量不符');
      const open = card.locator('button.mv-identity-frame');
      row.original = await openAndReturn(tab,open,index%2?'button':'Escape',timeoutMs);
      row.preview = await decodedImage(card,'.mv-identity-frame img',timeoutMs);
      row.previewMatches = matches(row.preview,member.preview,member.previewDimensions,site);
      row.originalMatches = matches(row.original,member.original,member.originalDimensions,site);
      if (checkPrevious) {
        row.previous = await openAndReturn(tab,card.locator('.mv-identity-previous'),index%2?'Escape':'button',timeoutMs);
        row.previousMatches = matches(row.previous,member.retainedWorkPhoto,member.retainedWorkDimensions,site);
      }
      row.score = await card.evaluate(el => {
        const photo = el.querySelector('.mv-identity-frame').getBoundingClientRect();
        const button = el.querySelector('.editor-open,.credit-score-action');
        return {action:!!button, readOnly:!!el.querySelector('.public-record'),
          below:!!button && button.getBoundingClientRect().top >= photo.bottom-1};
      });
      if (checkScores) {
        if (!row.score.action) throw Error('本人评分入口不可用');
        await card.locator('.editor-open,.credit-score-action').click({timeoutMs});
        await card.locator('input[type="number"]').first().waitFor({state:'visible',timeoutMs});
        row.score.fields = await card.evaluate(el => ({
          performance:!!el.querySelector('input[aria-label$="表现分"]'), styling:!!el.querySelector('input[aria-label$="造型喜欢"]'),
          save:[...el.querySelectorAll('button')].some(b => ['保存此条记录','保存成员评分'].includes(b.textContent.trim())),
        }));
      }
      row.passed = row.previewMatches && row.originalMatches && row.original.returned
        && (!checkPrevious || (row.previousMatches && row.previous.returned))
        && (!checkScores || (row.score.below && row.score.fields.performance && row.score.fields.styling && row.score.fields.save));
    } catch (error) {
      row.passed = false;
      row.error = String(error.message).split('\n')[0];
      const close = pw.locator('.photo-lightbox button.photo-lightbox-close');
      if (await close.count()) await close.click({timeoutMs}).catch(() => {});
    }
  }
  const finalUrl = new URL(await tab.url());
  const samePage = finalUrl.origin === new URL(site).origin && finalUrl.searchParams.get('work') === evidence.workId;
  return {work:evidence.workId, video:evidence.videoId, width, actualCount, checkPrevious, checkScores, samePage, writes:0, rows,
    passed:actualCount === evidence.portraits.length && samePage && rows.every(r => r.passed)};
}
