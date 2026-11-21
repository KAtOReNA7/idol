// The embedded app is the actual local production build. Use its controls and check the resulting
// identity. Never start a player or edit a record. Each window has its own browser history.
const frame = document.querySelector('iframe');
const status = document.querySelector('output');
const params = new URLSearchParams(location.search);
const width = Number(params.get('width') || 1280);
frame.style.width = width+'px';
const doc = () => frame.contentDocument;
const win = () => frame.contentWindow;
const normal = value => (value||'').replace(/\s+/g,' ').trim();
const text = el => normal(el?.textContent);
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function until(probe, description, timeout=10000) {
  const end = performance.now()+timeout;
  do {const result=probe();if(result)return result;await delay(25);} while(performance.now()<end);
  throw Error(description);
}
function elements(selector,root=doc()) {
  const found=Array.from(root.querySelectorAll(selector));
  for(const node of root.querySelectorAll('[data-ifeye-native-host] > div,[data-izna-native-host] > div,[data-udtt-native-host] > div')) {
    if(node.shadowRoot) found.push(...elements(selector,node.shadowRoot));
  }
  return found;
}
function open(path) {
  const destination=new URL(path,location.origin);
  const current=new URL(win().location.href);
  if(destination.origin===current.origin && destination.pathname===current.pathname && destination.search===current.search && destination.hash!==current.hash) {
    win().location.hash=destination.hash;
    return until(()=>win().location.href===destination.href,'时间轴定位地址未更新');
  }
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{frame.onload=null;reject(Error('页面打开超时'));},18000);
    frame.onload=()=>{clearTimeout(timer);resolve();};
    frame.src=path;
  });
}
let batch=[];
let activeId='';
async function flush() {
  if(!batch.length)return;
  const response=await fetch('/__qa/report',{method:'POST',body:JSON.stringify(batch)});
  if(!response.ok)throw Error('测试回执保存失败');
  batch=[];
}
function record(g,kind,id,ok,detail={}) {
  batch.push({slug:g.slug,kind,id,ok,width,...detail});
}
async function library(g) {
  await open('/?view=works');
  const select=await until(()=>doc().querySelector('.lb-filters select[aria-label="团体"]'),'团体筛选未出现');
  select.value=g.groupId;
  select.dispatchEvent(new (win().Event)('change',{bubbles:true}));
  const expected=new Map(g.works.filter(w=>w.mv).map(w=>[w.id,w]));
  const cards=()=>Array.from(doc().querySelectorAll('[data-lb-work-id]'));
  await until(()=>expected.size ? cards().length&&cards().every(c=>expected.has(c.dataset.lbWorkId)) : doc().querySelector('.lb-results-empty'),'团体筛选结果错误');
  const seen=new Set();
  const search=doc().querySelector('.lb-filters input[data-library-focus="search"]');
  if(search&&expected.size) {
    const set=Object.getOwnPropertyDescriptor(win().HTMLInputElement.prototype,'value').set;
    const update=value=>{set.call(search,value);search.dispatchEvent(new (win().Event)('input',{bubbles:true}));};
    update('no-matching-title-2748');
    await until(()=>doc().querySelector('.lb-results-empty'),'无匹配时搜索结果未清空');
    update('');
    await until(()=>cards().length,'清空搜索未恢复作品');
    record(g,'search','empty-and-restore',true);
  }
  while(true) {
    const pageIds=cards().map(c=>c.dataset.lbWorkId);
    for(const id of pageIds) {
      activeId=id;
      if(seen.has(id))throw Error('作品分页重复');
      seen.add(id);
      const work=expected.get(id);
      const button=doc().querySelector('[data-lb-work-id="'+id+'"] button');
      await delay(240);
      button.click();
      await until(()=>new URL(win().location.href).searchParams.get('work')===id&&text(doc().querySelector('.detail h1'))===normal(work.title),'作品详情身份错误');
      record(g,work.mv?'mv':'placeholder',id,true,{inlinePlayers:doc().querySelectorAll('.detail iframe').length});
      if(work.stage) {
        await delay(150);
        doc().querySelector('#stage-tab').click();
        await until(()=>doc().querySelector('#stage-tab[aria-selected="true"]')&&doc().querySelector('.detail.stage-view .stage-source'),'舞台来源未展开');
        await delay(150);
        doc().querySelector('#mv-tab').click();
        await until(()=>doc().querySelector('#mv-tab[aria-selected="true"]'),'返回 MV 失败');
        record(g,'stage',id,true);
      }
      await delay(150);
      doc().querySelector('.detail .back').click();
      await until(()=>doc().querySelector('[data-lb-work-id="'+id+'"]')&&!doc().querySelector('.detail'),'返回列表丢失当前页');
    }
    const next=Array.from(doc().querySelectorAll('.lb-results-paging button')).find(b=>text(b)==='下一页');
    if(!next||next.disabled)break;
    next.click();
    await until(()=>cards().length&&cards()[0].dataset.lbWorkId!==pageIds[0],'下一页未更新');
  }
  for(const [id,work] of expected) if(!seen.has(id))record(g,work.mv?'mv':'placeholder',id,false,{error:'目录缺少作品'});
  record(g,'library','return-and-paging',seen.size===expected.size,{seen:seen.size,expected:expected.size});
  for(const work of g.works.filter(w=>!w.mv)) {
    await open('/?view=works&work='+encodeURIComponent(work.id));
    const back=await until(()=>Array.from(doc().querySelectorAll('.empty button')).find(b=>text(b)==='返回作品库'),'占位作品缺少返回入口');
    back.click();
    await until(()=>doc().querySelector('.lb-browser'),'占位页无法返回作品库');
    record(g,'placeholder',work.id,true);
  }
}
async function detail(g,r) {
  const href=new URL(r.url,location.origin);
  const matches=()=>win().location.pathname===href.pathname && win().location.hash===href.hash &&
    Array.from(href.searchParams).every(([k,v])=>new URLSearchParams(win().location.search).get(k)===v);
  const link=elements('a[href]').find(el=>el.href===href.href && !el.target && el.getBoundingClientRect().height);
  if(link&&win().location.href!==href.href) {
    link.click();
    await until(matches,'站内链接没有到达目标');
  } else await open(r.url);
  const memberQuery=href.searchParams.get('member')||(r.kind==='artist-member'?r.id:null);
  const identity=()=>memberQuery?elements('[data-member-layout][data-member-id], [data-member-native-header], [data-member-layout]').find(el=>el.dataset.memberId===memberQuery||el.closest('[data-member-id]')?.dataset.memberId===memberQuery):null;
  const ready=()=> {
    if(!matches())return false;
    if(g.slug==='udtt'&&!elements('[data-review-root]').length)return false;
    const headings=elements('h1,h2').filter(e=>e.getBoundingClientRect().height);
    const heading=headings.map(text).join(' ');
    if(!heading||/Application error|Internal Server Error|无法打开这个页面/i.test(heading))return false;
    if(memberQuery) return identity()||false;
    const expectedTitle=r.expectedHeading||r.title;
    if(r.kind==='event'&&r.targetSelector) {
      const anchor=elements(r.targetSelector)[0];
      const target=anchor&&(text(anchor)?anchor:anchor.closest('article,li'));
      return target?.getBoundingClientRect().height&&(!expectedTitle||text(target).includes(normal(expectedTitle)));
    }
    if(r.target==='anchor') return elements('[id], [data-event-id], [data-timeline-event-id]').find(el=>el.id===r.id||el.dataset.eventId===r.id||el.dataset.timelineEventId===r.id);
    if(r.targetText&&!elements(r.targetSelector).some(el=>text(el).includes(normal(r.targetText))))return false;
    if(expectedTitle&&!heading.toLowerCase().includes(normal(expectedTitle).toLowerCase()))return false;
    return headings;
  };
  await until(ready,'未定位到该页面内容',6500);
  const expandable=elements('details:not([open]) > summary').find(el=>el.getBoundingClientRect().height);
  if(expandable){expandable.click();if(!expandable.parentElement.open)throw Error('详情展开无效');expandable.click();}
  const viewport=doc().documentElement;
  const initialOverflow=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  if(initialOverflow)await delay(220);
  record(g,r.kind,r.id||r.url,true,{url:r.url,clientWidth:viewport.clientWidth,initialOverflow,overflow:Math.max(0,viewport.scrollWidth-viewport.clientWidth),openedDisclosure:!!expandable,
    identity:memberQuery?'member-id':r.target==='anchor'?'event-id':r.expectedHeading||r.title?'heading':'route-and-content',
    via:link?'page-link':'deep-link',heading:text(elements('h1').find(e=>e.getBoundingClientRect().height)).slice(0,100)});
}
document.querySelector('#run').onclick=async event=>{
  event.target.disabled=true;
  try {
    if(params.has('inspect')){
      const target=new URL(params.get('inspect'),location.origin);
      if(target.origin!==location.origin||!target.pathname.startsWith('/artists/'))throw Error('请选择本地团页');
      await open(target.pathname+target.search+target.hash);
      status.value='单页检查';
      return;
    }
    const mode=params.get('mode')||'all';
    const inventoryMode=['library','member','artist-member'].includes(mode)?'library':mode;
    const all=await (await fetch('/__qa/inventory?mode='+encodeURIComponent(inventoryMode))).json();
    const groups=all.filter((g,i)=>g.slug!==params.get('exclude')&&(params.has('slug')?params.get('slug')===g.slug:i%Number(params.get('parts')||1)===Number(params.get('part')||0)));
    for(const g of groups) {
      status.value=g.name||g.slug;
      if(mode==='all'||mode==='library') {
        activeId='';
        try{await library(g);}catch(e){record(g,'library',activeId||'interaction',false,{error:e.message,path:win().location.pathname+win().location.search,heading:text(doc()?.querySelector('.detail h1')),firstCard:doc()?.querySelector('[data-lb-work-id]')?.dataset.lbWorkId||''});}
        await flush();
      }
      if(mode==='library')continue;
      const routes=[...g.routes,...g.members.map(id=>({kind:'member',id,url:'/?view=members&member='+id})),
        ...(!['udtt','ifeye','izna'].includes(g.slug)?g.members.map(id=>({kind:'artist-member',id,url:g.path+'?section=members&member='+id})):[])];
      for(const route of routes) {
        if(mode==='artist' && !g.routes.includes(route))continue;
        if(mode!=='all'&&mode!=='artist'&&mode!==route.kind)continue;
        try{await detail(g,route);}catch(e){record(g,route.kind,route.id||route.url,false,{url:route.url,error:e.message});}
        if(batch.length>=8)await flush();
      }
      await flush();
    }
    status.value='本批已完成';
  }catch(e){status.value=e.message;}
};
