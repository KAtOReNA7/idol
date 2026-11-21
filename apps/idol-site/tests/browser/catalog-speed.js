// Run inside the existing loopback QA page using the Codex browser. All interactions are read-only.
const frame = document.querySelector('iframe');
const startButton = document.querySelector('#run');
const status = document.querySelector('output');
const params = new URLSearchParams(location.search);
const width = Math.min(2560, Math.max(320, Number(params.get('width')) || 1280));
frame.style.width = width + 'px';
const trialCount = Math.min(5, Math.max(1, Number(params.get('trials')) || 1));
const groupScope = params.get('scope') || 'sample';
const run = (params.get('run') || 'local').slice(0,64);
const publication = new Set(['ive','adya','cherrybullet']);
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const round = n => Math.round(n * 10) / 10;

function visible(el) {
  return !!(el && el.getBoundingClientRect().width && el.getBoundingClientRect().height &&
    !el.closest('[hidden],[inert],[aria-hidden="true"]') &&
    !el.disabled && el.getAttribute('aria-disabled') !== 'true');
}

function groupRoot(doc) {
  for (const node of doc.querySelectorAll('[data-ifeye-native-host] > div,[data-izna-native-host] > div,[data-udtt-native-host] > div')) {
    if (node.shadowRoot) return node.shadowRoot;
  }
  return doc;
}

function firstAction(root, selector, work) {
  if (!selector) return null;
  for (const card of root.querySelectorAll(selector)) {
    if (!visible(card)) continue;
    const buttons = card.matches('button,a[href]') ? [card] : card.querySelectorAll('a[href],button');
    for (const item of buttons) {
      if (!visible(item) || item.target === '_blank') continue;
      if (item.href && new URL(item.href).origin !== location.origin) continue;
      if (work && (!item.href || new URL(item.href).searchParams.get('work') !== work)) continue;
      return item;
    }
  }
  return null;
}

async function waitFor(probe, label) {
  const end = performance.now()+8500;
  let last = performance.now();
  do {
    const found = probe();
    const now = performance.now();
    if (found) return {found, at:now, interval:now-last};
    last = now;
    await sleep(12);
  } while (performance.now()<end);
  throw Error(label);
}

function resources(win, started) {
  const absolute = performance.timeOrigin + started;
  const entries = win.performance.getEntriesByType('resource')
    .filter(row=>win.performance.timeOrigin + row.startTime >= absolute && new URL(row.name,location.origin).origin === location.origin);
  const ours=entries.filter(row=>new URL(row.name).pathname === '/api/catalog');
  const sum=(rows,key)=>rows.reduce((total,row)=>total+(Number(row[key])||0),0);
  return {catalogRequests:ours.length, catalogTransferBytes:sum(ours,'transferSize'),
    catalogDecodedBytes:sum(ours,'decodedBodySize'), catalogEncodedBytes:sum(ours,'encodedBodySize'),
    sameOriginResourceCount:entries.length, resourceTransferBytes:sum(entries,'transferSize'),
    scriptsTransferBytes:sum(entries.filter(e=>e.initiatorType==='script'||new URL(e.name).pathname.endsWith('.js')),'transferSize'),
    zeroTransferWithBody:entries.filter(e=>e.transferSize===0&&e.decodedBodySize>0).length};
}

async function measure(g,trial,scene,trigger,probe) {
  const started=performance.now();
  trigger();
  const {found,at,interval}=await waitFor(probe,g.slug+' '+scene+' 未找到预期可操作元素');
  const app=frame.contentWindow, doc=frame.contentDocument;
  const nav=app.performance.getEntriesByType('navigation')[0];
  const result={slug:g.slug,kind:'catalog-speed',id:scene,trial,run,ok:true,elapsedMs:round(at-started),
    pollGapMs:round(interval),width:doc.documentElement.clientWidth,visibility:document.visibilityState,
    page:app.location.pathname+app.location.search, navigationType:nav?.type||null,
    resourcesAtReady:resources(app,started)};
  if (found.getBoundingClientRect) {
    result.targetTop=Math.round(found.getBoundingClientRect().top+app.scrollY);
    if (found.href) result.target=new URL(found.href).pathname+new URL(found.href).search;
  }
  // Resource Timing is populated when a request finishes. Keep this fixed observation window
  // independent from the already measured first-card time, including on links rendered by SSR.
  await sleep(350);
  result.resourcesAfter350ms=resources(app,started);
  return {item:found,row:result};
}

async function writeRow(row) {
  const answer=await fetch('/__qa/report',{method:'POST',body:JSON.stringify([row])});
  if (!answer.ok) throw Error('写入测试结果失败');
}

async function visit(g,trial) {
  const path=g.path;
  const home=()=>frame.contentWindow.location.pathname===path && !frame.contentWindow.location.search;
  const old=frame.contentDocument;
  const link=()=>firstAction(groupRoot(frame.contentDocument),g.home,g.sampleWork);
  let scene='home';
  try {
    const first=await measure(g,trial,scene,()=>{frame.src=path;},()=>frame.contentDocument!==old&&home()&&link());
    await writeRow(first.row);
    if (!publication.has(g.slug) || groupScope==='all') return;
    scene='detail';
    first.item.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    await waitFor(()=>{
      const rect=first.item.getBoundingClientRect(),doc=frame.contentDocument;
      const left=Math.max(0,rect.left),right=Math.min(doc.documentElement.clientWidth,rect.right);
      const top=Math.max(0,rect.top),bottom=Math.min(doc.documentElement.clientHeight,rect.bottom);
      if (right<=left||bottom<=top) return false;
      const hit=doc.elementFromPoint((left+right)/2,(top+bottom)/2);
      return hit&&(hit===first.item||first.item.contains(hit));
    },'作品链接滚入视口后被遮挡');
    const detail=await measure(g,trial,scene,()=>first.item.click(),()=>{
      if (new URL(frame.contentWindow.location.href).searchParams.get('work')!==g.sampleWork) return null;
      const heading=frame.contentDocument.querySelector('main .detail h1,.detail h1');
      return visible(heading)&&heading.textContent.trim()?heading:null;
    });
    await writeRow(detail.row);
    const back=frame.contentDocument.querySelector('.detail .back');
    if (!back) throw Error('未找到详情返回入口');
    scene='return';
    const returned=await measure(g,trial,scene,()=>back.click(),()=>home()&&link());
    await writeRow(returned.row);
    const nav=[...frame.contentDocument.querySelectorAll('nav a[href],nav button')].find(item=>{
      if (!visible(item)) return false;
      return item.href ? new URL(item.href).searchParams.get('section')==='works' : /作品|DISCOGRAPHY/.test(item.textContent);
    });
    scene='works';
    if (!nav) throw Error('未找到团内作品导航');
    const works=await measure(g,trial,scene,()=>nav.click(),()=>{
      const url=new URL(frame.contentWindow.location.href);
      return url.pathname===path&&url.searchParams.get('section')==='works'&&firstAction(groupRoot(frame.contentDocument),g.works);
    });
    await writeRow(works.row);
  } catch (error) {
    await writeRow({slug:g.slug,kind:'catalog-speed',id:scene,trial,run,ok:false,
      width:frame.contentDocument?.documentElement?.clientWidth,error:String(error.message)});
  }
}

startButton.addEventListener('click',async()=>{
  startButton.disabled=true;
  try {
    const targets=await (await fetch('/__qa/speed-targets')).json();
    const selected=params.get('slug');
    const groups=targets.filter(g=>selected?g.slug===selected:groupScope==='all'||publication.has(g.slug));
    if(!groups.length)throw Error('未找到待测团体');
    for(let trial=1;trial<=trialCount;trial++) {
      for(const group of groups) {
        status.value=group.slug+' · '+trial+'/'+trialCount;
        await visit(group,trial);
      }
    }
    status.value='本批已完成';
  } catch(error) {status.value=error.message;}
});
