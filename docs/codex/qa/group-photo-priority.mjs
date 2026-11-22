const production = 'https://idol-lens-private.wuke40758.chatgpt.site';
const groups = {
  everglow: {hero:'.eg-hero', photo:'.eg-hero-photo img', original:'.eg-hero-photo', actions:'.eg-hero nav'},
  rocketpunch: {hero:'.rp-hero', photo:'.rp-hero-photo img', original:'.rp-hero-photo', actions:'.rp-hero nav'},
  weeekly: {hero:'.wk-hero', photo:'.wk-group-original img', original:'.wk-group-original', actions:'.wk-hero-caption nav'},
  wooah: {hero:'.wa-group-hero', photo:'.wa-group-photo img', original:'.wa-group-photo a[aria-haspopup="dialog"]', actions:'.wa-group-roster'},
};

async function imageSize(locator,timeoutMs) {
  const end=Date.now()+timeoutMs;
  let observation=null;
  do {
    observation=await locator.evaluate(img=>({source:img.getAttribute('src'),complete:img.complete,size:[img.naturalWidth,img.naturalHeight]}));
    if(observation.complete&&observation.size[0]&&observation.size[1])return observation;
    await new Promise(resolve=>setTimeout(resolve,150));
  }while(Date.now()<end);
  return observation;
}

function readOpening({slug, hero, photo, actions}) {
  const block=document.querySelector(hero), img=block?.querySelector(photo), title=block?.querySelector('h1');
  const action=block?.querySelector(actions), width=document.documentElement.clientWidth;
  const bounds=element=>{
    if(!element)return null;
    const r=element.getBoundingClientRect();
    return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};
  };
  const p=bounds(img), a=bounds(action), t=bounds(title);
  const obsolete={everglow:'2026.03.03',rocketpunch:'历年六人成员档案',weeekly:'6th Mini Album',wooah:'认识 WOOAH'};
  const photoDominates=!!(p&&a&&t&&p.w*p.h>2*(a.w*a.h+t.w*t.h));
  const logo=title?.querySelector('img');
  const headings={everglow:'EVERGLOW',rocketpunch:'Rocket Punch',weeekly:'Weeekly',wooah:'WOOAH'};
  const accessibleName=title?.textContent?.trim()||logo?.alt;
  const actionsInOrder=Array.from(action?.querySelectorAll('a')??[]).map(el=>({text:el.textContent.trim(),href:el.getAttribute('href')}));
  const correctLinks=slug==='wooah'
    ? actionsInOrder.length===5&&actionsInOrder.every(link=>link.href.includes('member='))
    : !!(actionsInOrder[0]?.href.includes('work=')&&actionsInOrder[1]?.href.includes('release='));
  return {slug,width,photo:p,title:t,actions:a,initialPhotoTop:p?.y,source:img?.getAttribute('src'),
    natural:[img?.naturalWidth??0,img?.naturalHeight??0],logo:logo?.getAttribute('src')??null,accessibleName,
    actionsInOrder,oldHeading:(block?.textContent??'').includes(obsolete[slug]),
    ok:!!(img?.complete&&img.naturalWidth&&img.naturalHeight&&p&&p.x>=0&&p.x+p.w<=width+1&&
      p.y<(document.documentElement.clientHeight||window.innerHeight)&&accessibleName===headings[slug]&&photoDominates&&correctLinks&&
      !(block?.textContent??'').includes(obsolete[slug])&&
      (slug!=='weeekly'||!document.querySelector('img[src*="bliss-banner"]')))};
}

function udttRequests() {
  if(typeof performance==='undefined'||typeof performance.getEntriesByType!=='function')return null;
  return performance.getEntriesByType('resource').flatMap(entry=>{
    const url=new URL(entry.name);
    const catalog=url.pathname==='/api/catalog'&&url.searchParams.get('artist')==='udtt';
    const viewer=['/api/editorial-assets/viewer','/api/manage/editorial-assets/viewer'].includes(url.pathname);
    return url.origin===location.origin&&(catalog||viewer)
      ? [{path:url.pathname,startMs:Math.round(entry.startTime),endMs:Math.round(entry.responseEnd)}] : [];
  });
}

function udttCard(anchor) {
  const card=anchor.closest('.ud-edition-home'), sleeve=anchor.getBoundingClientRect();
  const title=card.querySelector('h2'), detail=card.querySelector('.ud-text-link').getBoundingClientRect();
  return {title:title.textContent.trim(),w:Math.round(sleeve.width),h:Math.round(sleeve.height),
    rowHeight:Math.round(card.getBoundingClientRect().height),detailHeight:Math.round(detail.height),
    detailNextToCover:title.getBoundingClientRect().left>=sleeve.right-1,marginRight:Math.round(document.documentElement.clientWidth-card.getBoundingClientRect().right),
    target:anchor.getAttribute('href')};
}

/** Run on a new, muted built-in browser tab at each requested desktop/mobile viewport. */
export async function checkGroupPhotoPriority(tab,{site=production,slugs=Object.keys(groups),timeoutMs=20000}={}) {
  const results=[];
  for(const slug of slugs){
    const config=groups[slug];
    if(!config)throw Error('Unknown group '+slug);
    let step='打开团页',row={slug};
    try{
      await tab.goto(new URL('/artists/'+slug,site).href);
      const picture=tab.playwright.locator(config.photo);
      step='等待首图';
      await picture.waitFor({state:'visible',timeoutMs});
      step='读取首图实际尺寸';
      const preview=await imageSize(picture,timeoutMs);
      row={...await tab.playwright.evaluate(readOpening,{slug,...config}),preview};
      const control=tab.playwright.locator(config.original);
      const expected=await control.getAttribute('href');
      step='从团照打开原图';
      if(slug==='wooah')await control.click({timeoutMs});
      else await control.press('Enter',{timeoutMs});
      const dialog=tab.playwright.getByRole('dialog');
      step='等待原图对话框';
      await dialog.waitFor({state:'visible',timeoutMs});
      step='读取原图实际尺寸';
      const original=await imageSize(dialog.locator('img'),timeoutMs);
      row={...row,original};
      step='关闭原图并返回团照';
      await dialog.getByRole('button',{name:'关闭大图'}).press('Escape',{timeoutMs});
      await dialog.waitFor({state:'hidden',timeoutMs});
      const restoredFocus=await control.evaluate(el=>el===el.ownerDocument.activeElement);
      const sameOriginal=!!expected&&!!original.source&&new URL(original.source,site).href===new URL(expected,site).href;
      results.push({...row,openingOk:row.ok,sameOriginal,restoredFocus,ok:row.ok&&preview.complete&&preview.size[0]>0&&original.complete&&original.size[0]>0&&sameOriginal&&restoredFocus});
    }catch(error){
      const observed=await tab.playwright.evaluate(({hero,photo,original})=>{
        const img=document.querySelector(photo),link=document.querySelector(original),dialog=document.querySelector('[role="dialog"]');
        return {path:location.pathname,hero:!!document.querySelector(hero),image:img?.getAttribute('src'),original:link?.getAttribute('href'),
          dialog:dialog?.getAttribute('aria-label')??dialog?.className??null,status:document.querySelector('[role="alert"]')?.textContent.trim().slice(0,110)??null};
      },config).catch(()=>null);
      results.push({...row,ok:false,step,observed,error:String(error.message??error).split('\n')[0].slice(0,220)});
    }
  }
  return results;
}

export async function checkUdttPhotoLayout(tab,{site=production,timeoutMs=30000}={}) {
  const home=new URL('/artists/udtt',site);
  await tab.goto(home.href);
  const sleeves=tab.playwright.locator('.ud-home-works .ud-edition-home .ud-sleeve');
  await sleeves.first().waitFor({state:'visible',timeoutMs});
  const width=await tab.playwright.evaluate(()=>document.documentElement.clientWidth);
  const requests=await tab.playwright.evaluate(udttRequests).catch(()=>null);
  const index=requests?.find(r=>r.path.endsWith('/editorial-assets/viewer'));
  const catalog=requests?.find(r=>r.path==='/api/catalog');
  const overlapMs=index&&catalog?Math.min(index.endMs,catalog.endMs)-Math.max(index.startMs,catalog.startMs):null;
  const cards=[],visits=[],expectedTitles=['School Rush','VIPER','RETRY'],count=await sleeves.count();
  for(let i=0;i<count;i++){
    const sleeve=sleeves.nth(i);
    await sleeve.press('Tab',{timeoutMs});
    const observation=await imageSize(sleeve.locator('img'),Math.min(timeoutMs,12000));
    const card=await sleeve.evaluate(udttCard);
    cards.push({...card,natural:observation.size,decoded:observation.complete&&observation.size.every(Boolean)});
    const target=new URL(card.target,home);
    if(i===1)await sleeve.press('Enter',{timeoutMs});else await sleeve.click({timeoutMs});
    const heading=tab.playwright.locator('.ud-release-opening h1');
    await heading.waitFor({state:'visible',timeoutMs});
    const title=await heading.evaluate(el=>el.textContent.trim()),opened=new URL(await tab.url());
    await tab.back();
    await sleeves.first().waitFor({state:'visible',timeoutMs});
    const returned=new URL(await tab.url());
    visits.push({title,opened:opened.pathname+opened.search+opened.hash,
      returned:returned.pathname===home.pathname&&(!returned.hash||returned.hash==='#/udtt/home'),
      matched:title===card.title&&opened.href===target.href});
  }
  const equalCovers=cards.length===3&&cards.every(c=>Math.abs(c.w-cards[0].w)<=1&&c.w===c.h);
  const fits=cards.every(c=>c.detailNextToCover&&c.detailHeight>=44&&c.marginRight>=0&&c.w>=80&&c.w<=(width<=760?99:169));
  return {width,cards,equalCovers,requests,overlapMs,ownerIndex:index?index.path==='/api/manage/editorial-assets/viewer':null,visits,
    ok:equalCovers&&fits&&cards.every((c,i)=>c.title===expectedTitles[i]&&c.decoded)&&visits.every(v=>v.matched&&v.returned)};
}
