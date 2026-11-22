import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const groups=['adya','geenius','oddyouth','tracer','spia','candyshop','bewave','youngposse'];

// Follow the same first MV from the mixed catalogue on both releases. Never activate a publisher link.
export async function checkArtistFilmPrimary(tab,{site,slugs=groups}) {
  const rows=[];
  for(const slug of slugs) {
    const v=require('../../../apps/idol-site/data/'+slug+'-native-design.json').works.find(item=>item.type==='MV');
    const row={slug,key:v.key,work:v.id};rows.push(row);
    try {
      await tab.goto(site+'/artists/'+slug+'?section=works');
      const pw=tab.playwright;
      await pw.getByRole('navigation',{name:'作品类型'}).waitFor({state:'visible',timeoutMs:12000});
      const card=pw.locator('main a[href*="media="]').filter({hasText:v.title}).first();
      await card.click();
      await pw.getByRole('heading',{name:v.title,exact:true}).first().waitFor({state:'visible',timeoutMs:6000});
      const detail=pw.locator('main').first();
      const bound=detail.locator('a[href*="work='+v.id+'"]').first();
      await bound.waitFor({state:'visible',timeoutMs:9000});
      const backUrl=new URL(await tab.url());
      row.detail=backUrl.pathname+backUrl.search;
      const meta=await detail.evaluate((el,source)=>{
        const anchors=[...el.querySelectorAll('a[href]')];
        const primary=el.querySelector('[data-film-primary]') || anchors.find(a=>a.href===source && a.querySelector('img')) || anchors.find(a=>a.href===source);
        return {width:document.documentElement.clientWidth,primary:primary?.getAttribute('href'),target:primary?.getAttribute('target'),sourceLinks:anchors.filter(a=>a.href===source).length};
      },v.url);
      Object.assign(row,meta);
      if(meta.primary && new URL(meta.primary,site).origin===site) {
        await detail.locator('[data-film-primary="onsite"]').click();
        const url=new URL(await tab.url());
        const back=new URL(url.searchParams.get('returnTo') || '/',site);
        back.searchParams.sort();
        const expectedBack=new URL(backUrl);
        expectedBack.searchParams.sort();
        row.exact=url.origin===site && url.searchParams.get('work')===v.id && !url.searchParams.has('video') && back.href===expectedBack.href;
        const play=pw.locator('.detail:not(.stage-view) button.video-play:not(:disabled)').first();
        await play.waitFor({state:'visible',timeoutMs:9000});
        row.playerButton=true;
        await tab.back();
        await pw.getByRole('heading',{name:v.title,exact:true}).first().waitFor({state:'visible',timeoutMs:9000});
        row.back=(await tab.url())===backUrl.href;
      }
    } catch(e) {row.error=String(e.message).split('\n')[0];}
  }
  return rows;
}
