import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const registry=require('../../../apps/idol-site/data/artist-timeline-registry.json');
const historical=[
  ['loona','BlockBerryCreative'],
  ['rocketpunch','Woollim Entertainment'],
  ['weeekly','IST Entertainment'],
];
const formal='https://idol-lens-private.wuke40758.chatgpt.site';

function readIntro(slug) {
  const host=document.querySelector('[data-'+slug+'-native-host]');
  const shadow=host&&[host,...host.querySelectorAll('*')].find(el=>el.shadowRoot)?.shadowRoot;
  const root=shadow?.querySelector('[data-home-introduction]')?shadow:document;
  const paragraphs=[...(root?.querySelectorAll('[data-home-introduction]')??[])];
  const p=paragraphs[0];
  const bounds=p?.getBoundingClientRect();
  const label=p?.querySelector('.group-intro-label');
  const width=document.documentElement.clientWidth;
  return {
    path:location.pathname,width,count:paragraphs.length,slug:p?.dataset.homeIntroduction??null,
    labelled:label?.textContent.trim()==='团体介绍',
    characters:(p?.textContent??'').replace('团体介绍','').trim().length,
    readable:!!(bounds&&bounds.width>0&&bounds.height>0&&getComputedStyle(p).visibility!=='hidden'&&!p.closest('details:not([open]),[hidden],[inert]')),
    fitsWidth:!!(bounds&&bounds.left>=-1&&bounds.right<=width+1),
    shadow:!!shadow&&root===shadow,
  };
}

export async function checkGroupIntroductions(tab,{site=formal,slugs=registry.map(g=>g.slug),timeoutMs=20000}={}) {
  const results=[];
  for(const slug of slugs) {
    const group=registry.find(g=>g.slug===slug);
    if(!group)throw Error('Unknown group '+slug);
    try {
      await tab.goto(new URL(group.path,site).href);
      await tab.playwright.locator('[data-home-introduction="'+slug+'"]').first().waitFor({state:'visible',timeoutMs});
      const row=await tab.playwright.evaluate(readIntro,slug);
      results.push({...row,ok:row.count===1&&row.slug===slug&&row.path===group.path&&row.labelled&&row.characters>20&&row.readable&&row.fitsWidth});
    }catch(error){
      results.push({slug,ok:false,error:String(error.message??error).split('\n')[0].slice(0,210)});
    }
  }
  return results;
}

function readCards(selector) {
  return [...document.querySelectorAll(selector)].map(card=>{
    const rows=[...card.querySelectorAll('p')];
    return {
      anchor:card.dataset.browseAnchor,name:card.querySelector('h3')?.textContent.trim(),
      company:rows[0]?.textContent.trim(),lines:rows.length,
      hasScore:rows.some(p=>/均分|评分/.test(p.textContent)),
      hasGeneration:rows.some(p=>/第.+代|非K-pop/.test(p.textContent)),
      width:document.documentElement.clientWidth,
    };
  });
}

export async function checkGroupIndexContent(tab,{site=formal,timeoutMs=20000}={}) {
  const index= new URL('/?view=groups',site).href;
  const selector='#group-index-results .music-group-card';
  await tab.goto(index);
  await tab.playwright.locator(selector).last().waitFor({state:'visible',timeoutMs});
  const cards=await tab.playwright.evaluate(readCards,selector);
  const expected=new Set(registry.map(g=>'group-'+g.groupId));
  const all=cards.length===expected.size&&new Set(cards.map(r=>r.anchor)).size===expected.size&&
    cards.every(r=>expected.has(r.anchor)&&r.name&&r.company&&r.lines===1&&!r.hasScore&&!r.hasGeneration);
  const filters=[];
  for(const [slug,company] of historical){
    const wanted='group-'+registry.find(g=>g.slug===slug).groupId;
    const control=tab.playwright.getByRole('searchbox',{name:'搜索团体或公司'});
    await control.fill(company);
    let card=tab.playwright.locator(selector+'[data-browse-anchor="'+wanted+'"]');
    await card.waitFor({state:'visible',timeoutMs});
    const searched=await tab.playwright.evaluate(readCards,selector);
    await tab.playwright.getByRole('button',{name:'重置团体筛选'}).click();
    await tab.playwright.getByRole('combobox',{name:'按公司筛选团体'}).selectOption(company+'（历史）');
    await card.waitFor({state:'visible',timeoutMs});
    const selected=await tab.playwright.evaluate(readCards,selector);
    filters.push({slug,searchHits:searched.map(row=>row.anchor),selectedHits:selected.map(row=>row.anchor),
      ok:searched.length===1&&selected.length===1&&searched[0].anchor===wanted&&selected[0].company===company+'（历史）'});
    await tab.playwright.getByRole('button',{name:'重置团体筛选'}).click();
  }
  await tab.goto(new URL('/',site).href);
  const homeSelector='.music-group-rail .music-group-card';
  await tab.playwright.locator(homeSelector).last().waitFor({state:'visible',timeoutMs});
  const home=await tab.playwright.evaluate(readCards,homeSelector);
  const homeMatches=home.length===5&&home.every(r=>r.lines===1&&!r.hasScore&&cards.some(c=>c.anchor===r.anchor&&c.company===r.company));
  return {ok:all&&homeMatches&&filters.every(f=>f.ok),indexCount:cards.length,cards,filters,home,homeMatches};
}

const reportedOpenings={
  bewave:{hero:'.bw-debut-opening',photo:'.bw-debut-photo img',mark:'h1 img',extra:null},
  candyshop:{hero:'.cs-japan-opening',photo:'.cs-japan-photo',mark:'h1 img',extra:null},
  geenius:{hero:'.ge-home-profile',photo:'.ge-home-portrait img',mark:'.ge-home-title h1 img',extra:'.ge-home-mv img',video:'.ge-home-mv h2 a',work:'rec28ldfRTrPmh'},
  newjeans:{hero:'.nj-debut-opening',photo:'.nj-hero-photo img',mark:'#nj-debut-name img',extra:null,video:'.nj-debut-watch',work:'recvxyOz5X2J0A'},
  spia:{hero:'.sp-marquee',photo:'.sp-marquee-photo img',mark:'.sp-marquee-title>img',extra:'.sp-official-illustration'},
};

/** Read the actual rendered boxes and decoded sources after navigating in the built-in browser. */
export async function checkReportedOpenings(tab,{site=formal,slugs=Object.keys(reportedOpenings),timeoutMs=15000}={}){
  const output=[];
  for(const slug of slugs){
    const selectors=reportedOpenings[slug];
    if(!selectors)throw Error('No reported opening for '+slug);
    await tab.goto(new URL('/artists/'+slug,site).href);
    await tab.playwright.locator(selectors.hero).waitFor({state:'visible',timeoutMs});
    await tab.playwright.locator(selectors.photo).waitFor({state:'visible',timeoutMs});
    const measure=()=>tab.playwright.evaluate(({slug,selectors})=>{
      const hero=document.querySelector(selectors.hero);
      const photo=hero.querySelector(selectors.photo),mark=hero.querySelector(selectors.mark);
      const extra=selectors.extra?hero.querySelector(selectors.extra):null, width=document.documentElement.clientWidth;
      function item(el){
        if(!el)return null;
        const r=el.getBoundingClientRect();
        return {src:el.getAttribute('src'),alt:el.alt,width:Math.round(r.width),height:Math.round(r.height),
          left:Math.round(r.left),right:Math.round(r.right),natural:[el.naturalWidth,el.naturalHeight],
          fit:getComputedStyle(el).objectFit,decoded:el.complete&&el.naturalWidth>0};
      }
      const images=[photo,mark,...(extra?[extra]:[])].map(item);
      const paragraph=hero.querySelector('[data-home-introduction]'),photoControl=photo.closest('a');
      const mv=selectors.video?hero.querySelector(selectors.video):null;
      return {slug,width,images,original:photoControl?.getAttribute('href')??null,
        featuredMv:mv?.getAttribute('href')??null,accountListClosed:slug==='geenius'?!hero.querySelector('details').open:null,
        pass:images.length===(selectors.extra?3:2)&&images.every(im=>im&&im.decoded&&im.width>30&&im.height>15&&im.left>=-1&&im.right<=width+1)
          &&paragraph?.dataset.homeIntroduction===slug&&photoControl?.getAttribute('aria-haspopup')==='dialog'
          &&(!selectors.work||(!!mv&&new URL(mv.href).searchParams.get('work')===selectors.work))};
    },{slug,selectors});
    const deadline=Date.now()+timeoutMs;
    let row=await measure();
    while(row.images.some(im=>im&&!im.decoded)&&Date.now()<deadline){
      await new Promise(resolve=>setTimeout(resolve,150));
      row=await measure();
    }
    output.push(row);
  }
  return output;
}
