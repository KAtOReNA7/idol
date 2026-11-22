// Call with a caller-owned background Codex IAB tab. Records only public
// matched sentences and geometry, never arbitrary page text or account data.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const review=require('../evidence/20261122-visitor-timeline-copy/review.json');
const groups=['witchx','geenius','udtt','spia','adya','bewave','candyshop','itzy','tracer','unis','wooah'];
const anchors={
  witchx:'#witchx-company-debut', geenius:'#geenius-release-voyage',
  udtt:'[data-event-id="e-udtt-retry-prerelease-candidate"]', spia:'#spia-debut',
  adya:'#adya-release-adya', bewave:'#e-bewave-official-debut',
  candyshop:'#e-candyshop-formal-debut-hashtag',
  itzy:'[data-timeline-event-id="e-itzy-formal-debut"]', tracer:'#tracer-release-365',
  unis:'[data-timeline-event-id="e-unis-final-lineup-selected"]',
  wooah:'[data-timeline-event-id="e-wooah-formal-debut"]',
};
const viewMarkers={
  witchx:['.wk-home-members','.wk-title h1','时间轴'],
  geenius:['.idol-geenius-home-members','.idol-geenius-title h1','时间轴'],
  udtt:[null,'.ud-intro h1','时间线'], spia:['.sp-home-members','.sp-title h1','时间轴'],
  adya:['.idol-adya-home-members','.idol-adya-title h1','时间轴'],
  bewave:['.opening','.page-heading h1','Through the years'],
  candyshop:['.cs-home-members','.cs-title h1','时间轴'],
  itzy:['.iz-hero','.iz-heading h1','大事时间轴'],
  tracer:['.tr-home-members','.tr-title h1','时间轴'],
  unis:[null,anchors.unis,null], wooah:[null,'.wa-heading h1','时间轴'],
};
const rows=groups.flatMap(slug=>['updates','overview'].flatMap(view=>{
  const route='/artists/'+slug+'?section='+view;
  const change=review.textChanges.find(item=>item.route===route);
  const [overviewMarker,updatesMarker,heading]=viewMarkers[slug];
  return change?[{slug,route,anchor:anchors[slug],viewMarker:view==='overview'?overviewMarker:updatesMarker,heading:view==='updates'?heading:null,
    old:change.removed.map(p=>p.text),fresh:change.added.map(p=>p.text)}]:[];
}));
export const timelineCopyRoutes=rows.map(row=>row.route);

function measure({slug,anchor,viewMarker,heading,old,fresh}){
  const scope=slug==='udtt'?[...document.querySelectorAll('[data-udtt-native-host] > div')].map(el=>el.shadowRoot).find(Boolean):document;
  const marker=scope?.querySelector(anchor);
  const view=scope?.querySelector(viewMarker);
  const main=marker?.closest('main,[role="main"]')||scope?.querySelector('main,[role="main"]');
  const visible=el=>el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden' && !el.closest('[hidden],[inert]');
  const normalize=s=>s.replace(/\s+/gu,' ').trim();
  const wanted=new Set([...old,...fresh].map(normalize));
  const matches=new Map();
  // Observe individual text nodes as well as full headings. Several real
  // timeline headings wrap only their book-title punctuation in child spans.
  for(const el of scope?.querySelectorAll('p,h1,h2,h3,h4,span,strong,small,figcaption,dt,dd')||[]) {
    const labels=new Set([...el.childNodes].filter(n=>n.nodeType===3).map(n=>normalize(n.textContent)));
    if(!labels.size && !el.children.length)continue;
    const whole=normalize(el.textContent);
    if(wanted.has(whole))labels.add(whole);
    for(const label of labels){
      if(!wanted.has(label)||!visible(el))continue;
      const set=matches.get(label)||new Set();
      // A span and its sole parent can both match; keep the text's own element.
      if([...set].some(previous=>el.contains(previous)))continue;
      for(const previous of set)if(previous.contains(el))set.delete(previous);
      set.add(el);
      matches.set(label,set);
    }
  }
  function found(phrases){
    return phrases.map(text=>{
      const nodes=[...(matches.get(normalize(text))||[])];
      return {text,count:nodes.length,widths:nodes.map(el=>Math.round(el.getBoundingClientRect().width))};
    });
  }
  const path=location.pathname+location.search;
  const fragment=location.hash==='#/udtt/timeline'?location.hash:location.hash?'#other':'';
  const viewReady=!!(view && visible(view) && (!heading || normalize(view.textContent)===heading));
  const timelineReady=!!(marker && visible(marker));
  return {path,actualPath:path+fragment,viewReady,timelineReady,shadowContent:slug==='udtt'&&!!scope,viewportWidth:document.documentElement.clientWidth,
    viewportHeight:window.innerHeight,mainWidth:Math.round(main?.getBoundingClientRect().width||0),
    timelineWidth:Math.round((marker?.closest('ol,ul')||main)?.getBoundingClientRect().width||0),
    old:found(old),fresh:found(fresh)};
}

export async function checkTimelineCopy(tab,{phase='before',start=0,limit=19,indices,udttNavigation='query',site='https://idol-lens-private.wuke40758.chatgpt.site',timeoutMs=16000}={}){
  if(!['before','after'].includes(phase)||!Number.isInteger(start)||start<0||!Number.isInteger(limit)||limit<1)throw Error('Invalid timeline copy sample');
  if(indices&&(!Array.isArray(indices)||indices.some(i=>!Number.isInteger(i)||!rows[i])))throw Error('Invalid route index');
  if(!['query','hash'].includes(udttNavigation))throw Error('Unknown UDTT route');
  const runs=[];
  for(const item of indices?indices.map(i=>rows[i]):rows.slice(start,start+limit)){
    const requestedPath=item.slug==='udtt'&&udttNavigation==='hash'?'/artists/udtt#/udtt/timeline':item.route;
    try{
      await tab.goto(new URL(requestedPath,site).href);
      const view=tab.playwright.locator(item.viewMarker);
      await (item.heading?view.filter({hasText:item.heading}):view).first().waitFor({state:'visible',timeoutMs});
      await tab.playwright.locator(item.anchor).first().waitFor({state:'visible',timeoutMs});
      const sample=await tab.playwright.evaluate(measure,item);
      const expected=phase==='before'?sample.old:sample.fresh,absent=phase==='before'?sample.fresh:sample.old;
      const ok=sample.actualPath===requestedPath && sample.viewReady && sample.timelineReady && sample.mainWidth>0 && expected.every(p=>p.count>0) && absent.every(p=>p.count===0);
      runs.push({route:item.route,requestedPath,phase,ok,...sample});
    }catch(error){
      let sample;
      try{sample=await tab.playwright.evaluate(measure,item);}catch{}
      runs.push({route:item.route,requestedPath,phase,ok:false,...sample,error:String(error.message||error).split('\n')[0].slice(0,240)});
    }
  }
  return runs;
}
