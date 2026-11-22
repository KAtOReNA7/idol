// The caller owns the dedicated Codex tab and its viewport. Scores are only opened for inspection.
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const slay = require('../evidence/20261122-member-release-portraits/everglow-slay.json');
const formalSite = 'https://idol-lens-private.wuke40758.chatgpt.site';
const cardSelector = '.detail:not(.stage-view) .cast-card[data-photo-member]';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function openWork(tab, evidence, site, timeoutMs) {
  const members = evidence.portraits.map(person => person.memberId);
  if (!members.length || new Set(members).size !== members.length || members.some(id => !/^rec[a-zA-Z0-9]+$/.test(id))) {
    throw Error('成员清单为空，或存在无效、重复的成员 ID');
  }
  const url = new URL('/', site);
  url.search = new URLSearchParams({view:'works',work:evidence.workId,video:'mv'}).toString();
  await tab.goto(url.href);
  const items = tab.playwright.locator(cardSelector);
  await items.first().waitFor({state:'visible',timeoutMs});
  const page = await tab.playwright.evaluate(() => ({
    width:document.documentElement.clientWidth,
    heading:document.querySelector('.detail .music-work-title h1')?.textContent.trim(),
    mv:document.querySelector('#mv-tab')?.getAttribute('aria-selected') === 'true',
  }));
  if (page.heading !== (evidence.title ?? evidence.work) || !page.mv) throw Error('作品标题或 MV 选项与清单不符');
  return {...page,actualCount:await items.count()};
}

function sameWork(address, site, workId) {
  const url = new URL(address);
  return url.origin === new URL(site).origin && url.pathname === '/' && url.searchParams.get('view') === 'works'
    && url.searchParams.get('work') === workId && (url.searchParams.get('video') ?? 'mv') === 'mv';
}

function selectorFor(member) {
  return cardSelector+'[data-photo-member="'+member.memberId+'"]';
}

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
  return !!actual.src && !!url && Array.isArray(size) && actual.src === new URL(url, site).href
    && actual.width === size[0] && actual.height === size[1];
}

// CDP exposes Resource Timing in the real document, including cache hits. The IAB DOM reader
// deliberately presents a smaller Window. Never substitute header-inclusive transferSize for file bytes.
async function pageRead(cdp, read, value) {
  const response = await cdp.send('Runtime.evaluate', {
    expression:'('+read.toString()+')('+JSON.stringify(value)+')',returnByValue:true,
  });
  if (response.exceptionDetails) throw Error('页面采样失败');
  return response.result?.value;
}

function previewTiming(src) {
  const entries = performance.getEntriesByName(src, 'resource').filter(entry => entry.initiatorType === 'img');
  const entry = entries.findLast(item => item.encodedBodySize > 0) ?? entries.at(-1);
  return {
    bytes:entry?.encodedBodySize > 0 ? entry.encodedBodySize : null,
    transferBytes:Number.isFinite(entry?.transferSize) ? entry.transferSize : null,
  };
}

// If the image entry has expired from Resource Timing, measure the same public static image
// independently. Report this separately from bytes observed on the original page request.
async function imageBytes(cdp, src, site, timeoutMs) {
  const timing = await pageRead(cdp, previewTiming, src);
  if (timing.bytes !== null) return {...timing,bytesSource:'page-resource-timing'};
  const url = new URL(src);
  if (url.origin !== new URL(site).origin || !url.pathname.startsWith('/artist/')) {
    return {...timing,bytesSource:null};
  }
  try {
    const response = await fetch(url, {credentials:'omit',redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return {...timing,bytesSource:null};
    const bytes = (await response.arrayBuffer()).byteLength;
    if (bytes > 0) return {...timing,bytes,bytesSource:'separate-public-image-get'};
  } catch { /* Keep the missing page observation if the independent static-image read fails. */ }
  return {...timing,bytesSource:null};
}

export async function capturePortraitBaseline(tab, evidence, {site=formalSite,timeoutMs=12000,phase='previous'}={}) {
  if (phase !== 'previous' && phase !== 'current') throw Error('未知的图片对照阶段');
  const page = await openWork(tab,evidence,site,timeoutMs);
  const cdp = await tab.capabilities.get('cdp');
  const rows = [];
  for (const member of evidence.portraits) {
    const row = {name:member.name,memberId:member.memberId,passed:false};
    rows.push(row);
    try {
      const selector = selectorFor(member);
      const card = tab.playwright.locator(selector);
      if (await card.count() !== 1) throw Error('成员卡数量不符');
      await pageRead(cdp, css => {
        document.querySelector(css)?.scrollIntoView({block:'center',behavior:'instant'});
      }, selector+' .mv-identity-frame');
      row.preview = await decodedImage(card,'.mv-identity-frame img',timeoutMs);
      if (!row.preview.src) throw Error(row.preview.error);
      const measurement = await imageBytes(cdp,row.preview.src,site,timeoutMs);
      Object.assign(row.preview,measurement);
      const expected = phase === 'previous' ? member.previousDefault : member.preview;
      const expectedBytes = phase === 'previous' ? member.previousDefaultBytes ?? member.previousBytes : member.previewBytes;
      row.sourceMatches = !!expected && row.preview.src === new URL(expected,site).href;
      row.bytesMatch = Number.isFinite(expectedBytes) ? measurement.bytes === expectedBytes : null;
      row.passed = row.sourceMatches && measurement.bytes !== null && row.bytesMatch !== false;
    } catch (error) {
      row.error = String(error.message).split('\n')[0];
    }
  }
  const samePage = sameWork(await tab.url(),site,evidence.workId);
  const complete = rows.every(row => row.preview?.bytes > 0);
  const unique = new Map(rows.filter(row => row.preview?.bytes > 0).map(row => [row.preview.src,row.preview.bytes]));
  return {work:evidence.workId,video:evidence.videoId,phase,...page,samePage,writes:0,rows,
    distinctImageBytes:complete ? [...unique.values()].reduce((a,b) => a+b,0) : null,
    passed:samePage && page.actualCount === rows.length && rows.every(row => row.passed)};
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

export async function checkReleasePortraits(tab, evidence, {site=formalSite, timeoutMs=12000, checkPrevious=true, checkScores=true}={}) {
  const page = await openWork(tab,evidence,site,timeoutMs);
  const pw = tab.playwright;
  const rows = [];
  for (const [index, member] of evidence.portraits.entries()) {
    const row = {name:member.name, memberId:member.memberId};
    rows.push(row);
    const card = pw.locator(selectorFor(member));
    try {
      if (await card.count() !== 1) throw Error('成员卡数量不符');
      const open = card.locator('button.mv-identity-frame');
      row.original = await openAndReturn(tab,open,index%2?'button':'Escape',timeoutMs);
      row.preview = await decodedImage(card,'.mv-identity-frame img',timeoutMs);
      row.previewMatches = matches(row.preview,member.preview,member.previewDimensions,site);
      row.originalMatches = matches(row.original,member.original ?? member.sourceImage,member.originalDimensions ?? member.fullDimensions,site);
      if (checkPrevious) {
        const originalWorkButton = member.previousEdition
          ? card.getByText('查看原作品图', {exact:true})
          : card.locator('.mv-identity-previous');
        row.previous = await openAndReturn(tab,originalWorkButton,index%2?'Escape':'button',timeoutMs);
        const previous = member.retainedWorkPhoto ?? member.originalWorkImage;
        let size = member.retainedWorkDimensions ?? member.originalWorkDimensions;
        if (!size) {
          const record = require('../../../apps/idol-site/data/mv-public-media.json').portraits.find(photo =>
            photo.workId === evidence.workId && photo.videoId === evidence.videoId && photo.memberId === member.memberId && photo.src === previous);
          if (record) size = [record.width,record.height];
        }
        row.previousMatches = matches(row.previous,previous,size,site);
        if (member.previousEdition) {
          const earlier = member.previousEdition;
          const earlierButton = card.getByText('查看'+earlier.label, {exact:true});
          row.previousEdition = await openAndReturn(tab,earlierButton,index%2?'button':'Escape',timeoutMs);
          row.previousEditionMatches = matches(row.previousEdition,earlier.original,earlier.dimensions,site);
        }
      }
      row.score = await card.evaluate(el => {
        const photo = el.querySelector('.mv-identity-frame').getBoundingClientRect();
        const button = el.querySelector('.editor-open,.credit-score-action');
        const owner = button?.closest('[data-score-member]')?.getAttribute('data-score-member') ?? el.getAttribute('data-photo-member');
        return {action:!!button, readOnly:!!el.querySelector('.public-record'),
          memberMatches:owner === el.getAttribute('data-photo-member'),
          below:!!button && photo.height > 0 && button.getBoundingClientRect().height > 0 && button.getBoundingClientRect().top >= photo.bottom-1};
      });
      if (checkScores) {
        if (!row.score.action) throw Error('本人评分入口不可用');
        await card.locator('.editor-open,.credit-score-action').click({timeoutMs});
        await card.locator('input[type="number"]').first().waitFor({state:'visible',timeoutMs});
        row.score.fields = await card.evaluate(el => {
          const visible = node => !!node && node.getBoundingClientRect().height > 0;
          return {
            performance:visible(el.querySelector('input[aria-label$="表现分"]')),
            styling:visible(el.querySelector('input[aria-label$="造型喜欢"]')),
            save:[...el.querySelectorAll('button')].some(b => visible(b) && ['保存此条记录','保存成员评分'].includes(b.textContent.trim())),
          };
        });
      }
      row.passed = row.previewMatches && row.originalMatches && row.original.returned
        && (!checkPrevious || (row.previousMatches && row.previous.returned))
        && (!checkPrevious || !member.previousEdition || (row.previousEditionMatches && row.previousEdition.returned))
        && (!checkScores || (row.score.below && row.score.memberMatches && row.score.fields.performance && row.score.fields.styling && row.score.fields.save));
    } catch (error) {
      row.passed = false;
      row.error = String(error.message).split('\n')[0];
      const close = pw.locator('.photo-lightbox button.photo-lightbox-close');
      if (await close.count()) await close.click({timeoutMs}).catch(() => {});
    }
  }
  const samePage = sameWork(await tab.url(),site,evidence.workId);
  return {work:evidence.workId, video:evidence.videoId, ...page, checkPrevious, checkScores, samePage, writes:0, rows,
    passed:page.actualCount === evidence.portraits.length && samePage && rows.every(r => r.passed)};
}

export function checkSlayPortraits(tab, options={}) {
  return checkReleasePortraits(tab,slay,{...options,checkScores:options.checkScores ?? false});
}
