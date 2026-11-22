// Use a signed-in Codex IAB test tab. The checks open controls but do not submit a score or play media.
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const baseline = require('../evidence/20261122-v225/formal-billionaire-scores.json');
const stages = require('../evidence/20261122-v225/formal-exclusive-stages.json').rows;
const site = 'https://idol-lens-private.wuke40758.chatgpt.site';

export async function checkBillionaireScores(tab) {
  const id = baseline.work;
  const members = [...new Set(baseline.rows.map(row => row.id))];
  await tab.goto(site+'/?view=works&work='+id+'&video=mv');
  const slot = tab.playwright.locator('.detail:not(.stage-view) .public-recognition-grid .mv-inline-score');
  await slot.first().waitFor({state:'visible',timeoutMs:12000});
  if (await slot.count() !== members.length) throw Error('首发版的成员卡数量与七人名册不符');
  const rows = [];
  for (const member of members) {
    const card = tab.playwright.locator('.public-recognition-grid li:has([data-score-member="'+member+'"])');
    const control = card.locator('button.credit-score-action');
    await control.click();
    const fields = card.locator('input[type="number"]');
    await fields.first().waitFor({state:'visible',timeoutMs:4000});
    const result = await card.evaluate(el => {
      const img = el.querySelector('img');
      const box = img?.getBoundingClientRect();
      const button = el.querySelector('button.credit-score-action');
      const action = button.getBoundingClientRect();
      return {
        width: document.documentElement.clientWidth,
        below: !!box && box.width>0 && box.height>0 && action.top>=box.bottom-1,
        open: button.getAttribute('aria-expanded')==='true',
        photo: [img?.naturalWidth||0,img?.naturalHeight||0],
        fields: [...el.querySelectorAll('input[type=number]')].map(input=>input.getAttribute('aria-label')),
        save: [...el.querySelectorAll('button')].some(b=>b.textContent.trim()==='保存成员评分'),
      };
    });
    rows.push({id:member,...result});
  }
  return rows;
}

export async function checkExclusiveStageControls(tab) {
  const rows = [];
  for (const stage of stages) {
    await tab.goto(site+'/?view=works&work='+stage.id+'&video=stage');
    const detail = tab.playwright.locator('.detail.stage-view');
    await detail.waitFor({state:'visible',timeoutMs:12000});
    const controls = await detail.evaluate(el => ({
      sources:[...el.querySelectorAll('a[href]')].map(a=>a.href).filter(href=>href.startsWith('https://www.bilibili.com/video/')),
      playButtons:el.querySelectorAll('.video-play').length,iframes:el.querySelectorAll('.video-stage iframe').length,
      unavailable:el.querySelector('.video-unavailable')?.textContent.trim()==='此舞台暂无站内高清片源',
    }));
    rows.push({id:stage.id,title:stage.title,same:controls.sources.includes(stage.source),...controls});
  }
  return rows;
}
