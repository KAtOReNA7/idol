// Run with a background Codex tab. Each row follows links in the rendered artist library.
const slugs = ['adya','witchx','geenius','oddyouth','tracer','spia','genblue','youngposse','bewave','candyshop'];

function catalogContents() {
  const root = document.querySelector('main') || document.body;
  const visible = node => node.getBoundingClientRect().height > 0;
  const links = [...root.querySelectorAll('a[href]')].filter(visible).map(a => new URL(a.href));
  const keys = param => [...new Set(links.map(url => url.searchParams.get(param)).filter(Boolean))];
  return {width:document.documentElement.clientWidth, videos:keys('media').length, releases:keys('release').length,
    path:location.pathname+location.search};
}

export async function checkReleaseFilters(tab, {site, groups=slugs}) {
  const rows=[];
  for(const slug of groups) {
    const row={slug};
    rows.push(row);
    try {
      const pw=tab.playwright;
      await tab.goto(site+'/artists/'+slug+'?section=works');
      const release=pw.getByRole('link',{name:/^发行(?:\s+\d+)?$/});
      await release.waitFor({state:'visible',timeoutMs:12000});
      await release.click();
      row.selected=await pw.evaluate(catalogContents);
      const card=pw.locator('main a[href*="release="]').filter({has:pw.locator('img')}).first();
      await card.click({timeoutMs:4000});
      const back=pw.getByRole('link',{name:/返回(?:发行目录|作品|发行)/}).first();
      await back.waitFor({state:'visible',timeoutMs:4000});
      row.detail=await tab.url();
      await back.click();
      await release.waitFor({state:'visible',timeoutMs:4000});
      row.returned=await pw.evaluate(catalogContents);
      if(['adya','witchx'].includes(slug)) {
        const box=pw.getByRole('textbox').first();
        await box.fill('no-match-482');
        await box.press('Enter');
        row.search=await pw.evaluate(catalogContents);
        const clear=pw.getByRole('link',{name:/清除|清空/}).or(pw.getByRole('button',{name:/清除|清空/})).first();
        if(await clear.count()) await clear.click();
        else {await box.fill('');await box.press('Enter');}
        row.cleared=await pw.evaluate(catalogContents);
        for(const [key,name] of [['mv',/^(MV|影像)$/],['stage',/^舞台$/]]) {
          await pw.getByRole('link',{name}).click();
          row[key]=await pw.evaluate(catalogContents);
        }
      }
    } catch(e) {row.error=String(e.message).split('\n')[0];}
  }
  return rows;
}
