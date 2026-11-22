/** Codex 自带浏览器的后台测试标签。逐团读取实际目录卡，用两张反馈截图中的卡片验证单击和返回。 */
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const selectors=require('../../../apps/idol-site/tests/fixtures/artist-media-order.cjs');
const inventory=require('../evidence/20261122-v236/mv-card-directories.json');
const nativeSelectors={ifeye:'.work-card[data-work-key]',izna:'article.film[data-video-key]',udtt:'.ud-film-card[data-work-key]'};
const pause=ms=>new Promise(done=>setTimeout(done,ms));

function readDirectory(first,selector){
  return [...first.getRootNode().querySelectorAll(selector)].map(card=>{
    const a=card.matches('a[href]')?card:card.querySelector('a[href]');
    const p=new URL(a?.getAttribute('href')||location.href,location.href);
    const stage=card.getAttribute('data-kind')==='stage'||p.searchParams.get('video')==='stage'||p.searchParams.get('format')==='stage'||p.searchParams.get('media')?.includes('-stage-');
    return {stage,work:p.origin===location.origin&&p.pathname==='/'&&p.searchParams.get('view')==='works'?p.searchParams.get('work'):null,
      key:card.getAttribute('data-video-key')||card.getAttribute('data-artist-media')||card.getAttribute('data-media-key'),target:a?.target||null};
  }).filter(row=>!row.stage);
}

export async function checkMvDirectories(tab,{origin,slugs,timeoutMs=12000}){
  const selected=inventory.groups.filter(group=>!slugs||slugs.includes(group.slug));
  const results=[];
  for(const expected of selected){
    const {slug}=expected,selector=nativeSelectors[slug]||selectors.get(slug).worksVideo;
    const start=Date.now(),row={slug,passed:false};
    try{
      await tab.goto(origin+'/artists/'+slug+'?section=works&format=mv');
      const first=tab.playwright.locator(selector).first();
      await first.waitFor({state:'visible',timeoutMs});
      let matches=false;
      do {
        const cards=await first.evaluate(readDirectory,selector);
        const ids=cards.filter(c=>c.work).map(c=>c.work).sort();
        const keys=cards.filter(c=>!c.work).map(c=>c.key).sort();
        row.cards=cards.length;row.direct=ids.length;row.sourceOnly=keys;
        matches=cards.length===expected.total&&cards.every(c=>!c.work||!c.target)&&
          JSON.stringify(ids)===JSON.stringify([...expected.directWorkIds].sort())&&
          JSON.stringify(keys)===JSON.stringify(expected.sourceOnly.map(v=>v.key).sort());
        if(matches)break;
        if(Date.now()-start>=timeoutMs)throw Error('目录卡数量、去向或视频版本与快照不一致');
        await pause(160);
      }while(true);
      row.passed=matches;
    }catch(error){row.error=String(error?.message||error).slice(0,350);}
    results.push(row);
  }
  return results;
}

export async function checkReportedMvClicks(tab,{origin,timeoutMs=12000}){
  const results=[];
  for(const sample of inventory.specificCases){
    const {slug,work,title}=sample;
    for(const q of ['',title]){
      const path='/artists/'+slug+'?section=works&format=mv'+(q?'&q='+encodeURIComponent(q):'');
      const row={slug,title,path,passed:false};
      try{
        await tab.goto(origin+path);
        const card=tab.playwright.locator(nativeSelectors[slug]+' a[href*="work='+work+'"]').first();
        await card.waitFor({state:'visible',timeoutMs});
        await card.click({timeoutMs});
        const player=tab.playwright.locator('.detail:not(.stage-view) button.video-play:not(:disabled)').first();
        await player.waitFor({state:'visible',timeoutMs});
        const current=new URL(await tab.url()),back=new URL(current.searchParams.get('returnTo'),origin),expected=new URL(path,origin);
        const same=(a,b)=>a.pathname===b.pathname&&[...a.searchParams].sort().join() === [...b.searchParams].sort().join();
        if(current.pathname!=='/'||current.searchParams.get('work')!==work||!same(back,expected))throw Error('共享播放器或返回路径不符');
        row.clicks=1;row.work=work;
        row.player=await player.evaluate(el=>el.textContent.trim());
        await tab.back();
        await card.waitFor({state:'visible',timeoutMs});
        row.back=same(new URL(await tab.url()),expected);
        if(!row.back)throw Error('返回后丢失筛选或原目录');
        row.passed=true;
      }catch(error){row.error=String(error?.message||error).slice(0,350);}
      results.push(row);
    }
  }
  return results;
}
