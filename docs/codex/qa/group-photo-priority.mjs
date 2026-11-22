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

function readUdtt() {
  const outer=document.querySelector('[data-udtt-native-host]'), parent=[outer,...(outer?.querySelectorAll('*')??[])].find(e=>e?.shadowRoot);
  const root=parent?.shadowRoot;
  const cards=Array.from(root?.querySelectorAll('.ud-home-works .ud-edition-home')??[]).map(el=>{
    const sleeve=el.querySelector('.ud-sleeve'), box=sleeve.getBoundingClientRect();
    return {title:el.querySelector('h2')?.textContent.trim(),w:Math.round(box.width),h:Math.round(box.height),target:sleeve.getAttribute('href')};
  });
  const [one,two]=cards, equalCovers=!!(one&&two&&one.w>0&&one.h>0&&Math.abs(one.w-two.w)<=1&&Math.abs(one.h-two.h)<=1);
  let requests=null;
  if(typeof performance!=='undefined' && typeof performance.getEntriesByType==='function'){
    const rows=performance.getEntriesByType('resource').filter(e=>e.name.includes('/api/catalog?artist=udtt')||e.name.includes('/editorial-assets/viewer'));
    requests=rows.map(e=>({path:new URL(e.name).pathname,startMs:Math.round(e.startTime),endMs:Math.round(e.responseEnd)}));
  }
  const index=requests?.find(e=>e.path.endsWith('/editorial-assets/viewer')), cat=requests?.find(e=>e.path==='/api/catalog');
  const overlapMs=index&&cat?Math.min(index.endMs,cat.endMs)-Math.max(index.startMs,cat.startMs):null;
  return {width:document.documentElement.clientWidth,cards,equalCovers,requests,overlapMs,
    ownerIndex:index?index.path==='/api/manage/editorial-assets/viewer':null,
    ok:equalCovers&&cards.length===2&&cards.every(card=>card.target)};
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
      const dialog=tab.playwright.locator('.photo-lightbox[role="dialog"]');
      step='等待原图对话框';
      await dialog.waitFor({state:'visible',timeoutMs});
      step='读取原图实际尺寸';
      const original=await imageSize(dialog.locator('img'),timeoutMs);
      row={...row,original};
      step='关闭原图并返回团照';
      await dialog.getByRole('button',{name:'关闭大图'}).press('Escape',{timeoutMs});
      await dialog.waitFor({state:'hidden',timeoutMs});
      const restoredFocus=await control.evaluate(el=>el===el.ownerDocument.activeElement);
      results.push({...row,restoredFocus,ok:row.ok&&preview.complete&&preview.size[0]>0&&original.complete&&original.size[0]>0&&original.source===expected&&restoredFocus});
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
  await tab.goto(new URL('/artists/udtt',site).href);
  const sleeves=tab.playwright.locator('.ud-home-works .ud-edition-home .ud-sleeve');
  await sleeves.first().waitFor({state:'visible',timeoutMs});
  const row=await tab.playwright.evaluate(readUdtt);
  const target=await sleeves.first().getAttribute('href');
  await sleeves.first().click({timeoutMs});
  const expected=new URL(target,site);
  const opened=await tab.playwright.evaluate(()=>location.pathname+location.search);
  await tab.back();
  await sleeves.first().waitFor({state:'visible',timeoutMs});
  return {...row,opened,returned:true,ok:row.ok&&opened===expected.pathname+expected.search};
}
