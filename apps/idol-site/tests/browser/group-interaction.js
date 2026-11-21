// Reuse the CSS selectors from mixed-media-routes.cjs in the local frame and in
// a Codex in-app browser tab on the real site. The observer only reads the page.
function observeGroupOrder(anchor, spec, frameView) {
  const root = anchor.getRootNode();
  const visible = element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const matches = selector => Array.from(root.querySelectorAll(selector)).filter(visible);
  const rect = element => {
    if (!element) return null;
    const r = element.getBoundingClientRect();
    return {x:Math.round(r.left + (frameView?.x ?? scrollX)),y:Math.round(r.top + (frameView?.y ?? scrollY)),
      bottom:Math.round(r.bottom + (frameView?.y ?? scrollY))};
  };
  const byPosition = (a,b) => Math.abs(a.y-b.y) <= 1 ? a.x-b.x : a.y-b.y;
  const earliest = cards => cards.map(rect).sort(byPosition)[0] || null;
  const videoCards = matches(spec.video);
  const albumCards = matches(spec.album);
  const mv = earliest(videoCards);
  const album = earliest(albumCards);
  const cards = matches(spec.video + ', ' + spec.album);
  const docOrder = mv && album ? cards.indexOf(videoCards[0]) < cards.indexOf(albumCards[0]) : null;
  const focusSelector = 'a[href],button:not([disabled]),[tabindex]';
  const focusTarget = element => element && [element.closest(focusSelector), ...element.querySelectorAll(focusSelector)]
    .find(control => control && visible(control) && control.getAttribute('tabindex') !== '-1');
  const mvFocus = focusTarget(videoCards[0]);
  const albumFocus = focusTarget(albumCards[0]);
  let focusOrder = null;
  if (mvFocus && albumFocus) {
    const controls = matches(focusSelector);
    const mvTab = Number(mvFocus.getAttribute('tabindex')) || 0;
    const albumTab = Number(albumFocus.getAttribute('tabindex')) || 0;
    focusOrder = mvTab === albumTab ? controls.indexOf(mvFocus) < controls.indexOf(albumFocus)
      : mvTab > 0 && (!albumTab || mvTab < albumTab);
  }
  const nav = [];
  for (const menu of root.querySelectorAll('nav,.work-tabs,.bf-tabs,.sr-row-links,.nj-library-nav')) {
    const labels = Array.from(menu.querySelectorAll('a,button')).filter(visible)
      .map(el => el.textContent.trim());
    const v = labels.findIndex(text => /^(?:MV(?: 与舞台)?|影像)(?:\s*(?:\d+|↓))?$/.test(text));
    const a = labels.findIndex(text => /^(?:音乐|发行|唱片发行)(?:\s*(?:\d+|↓))?$/.test(text));
    if (v >= 0 && a >= 0) nav.push(v < a);
  }
  const actualMode = mv && album ? 'mixed' : mv ? 'video' : album ? 'album' : 'empty';
  const visual = mv && album ? byPosition(mv,album) < 0 : null;
  return {slug:spec.slug,view:spec.view,path:spec.path,mode:actualMode,
    width:frameView?.width ?? document.documentElement.clientWidth,mv,album,docOrder,visual,focusOrder,nav,
    ok:actualMode === spec.mode && (spec.mode !== 'mixed' || (docOrder && visual && focusOrder !== false)) && nav.every(Boolean)};
}

async function checkGroupOrder(tab, origin, spec) {
  await tab.goto(new URL(spec.path,origin).href);
  const anchorSelector = spec.mode === 'album' ? spec.album : spec.video;
  const anchor = tab.playwright.locator(anchorSelector).filter({visible:true}).first();
  await anchor.waitFor({state:'visible',timeoutMs:14000});
  if (spec.mode === 'mixed') {
    await tab.playwright.locator(spec.album).filter({visible:true}).first().waitFor({state:'visible',timeoutMs:14000});
  }
  return anchor.evaluate(observeGroupOrder,spec);
}

async function runGroupOrderBatch(tabs, origin, specs) {
  const results = [];
  for (let index=0; index<specs.length; index+=tabs.length) {
    const batch = specs.slice(index,index+tabs.length);
    const checked = await Promise.allSettled(batch.map((spec,i) => checkGroupOrder(tabs[i],origin,spec)));
    checked.forEach((item,i) => results.push(item.status === 'fulfilled' ? item.value
      : {slug:batch[i].slug,view:batch[i].view,path:batch[i].path,ok:false,error:String(item.reason).slice(0,180)}));
  }
  return results;
}

function connectLocalRunner() {
  const run = document.getElementById('run');
  const status = document.querySelector('output');
  const frame = document.querySelector('iframe');
  if (!run || !status || !frame) return;
  const params = new URLSearchParams(location.search);
  const width = Number(params.get('width')) || 390;
  frame.style.width = width + 'px';
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
  async function observeFrame(spec) {
    frame.src = spec.path;
    const deadline = performance.now()+14000;
    const required = spec.mode === 'album' ? spec.album : spec.video;
    do {
      await wait(80);
      const page = frame.contentDocument;
      if (!page || frame.contentWindow.location.pathname !== spec.path.split('?')[0] ||
        frame.contentWindow.location.search !== new URL(spec.path,location.origin).search) continue;
      const roots = [page];
      for (const host of page.querySelectorAll('[data-ifeye-native-host]>div,[data-izna-native-host]>div,[data-udtt-native-host]>div')) {
        if (host.shadowRoot) roots.push(host.shadowRoot);
      }
      for (const root of roots) {
        const anchor = [...root.querySelectorAll(required)].find(el => el.getBoundingClientRect().height);
        if (!anchor || (spec.mode === 'mixed' && !root.querySelector(spec.album))) continue;
        return observeGroupOrder(anchor,spec,{
          x:frame.contentWindow.scrollX,y:frame.contentWindow.scrollY,width:page.documentElement.clientWidth,
        });
      }
    } while (performance.now()<deadline);
    throw Error('页面未显示对应卡片');
  }
  run.addEventListener('click',async () => {
    run.disabled = true;
    let passed = 0;
    try {
      const response = await fetch('/__qa/mixed-media-routes');
      if (!response.ok) throw Error('读取测试入口失败');
      const specs = (await response.json()).filter(row=>
        (!params.has('slug') || row.slug === params.get('slug')) &&
        (!params.has('view') || row.view === params.get('view')));
      for (const [i,spec] of specs.entries()) {
        status.textContent = (i+1)+'/'+specs.length+' · '+spec.slug+' · '+spec.view;
        let result;
        try {result=await observeFrame(spec);} catch (error) {
          result={slug:spec.slug,view:spec.view,path:spec.path,ok:false,error:String(error)};
        }
        const saved=await fetch('/__qa/report',{method:'POST',body:JSON.stringify([{...result,kind:'media-order'}])});
        if (!saved.ok) throw Error('保存本地测试结果失败');
        if (result.ok) passed++;
      }
      status.textContent = '已完成 '+specs.length+' 个入口，'+passed+' 个通过。';
    } catch (error) {status.textContent=String(error);}
    finally {run.disabled=false;}
  });
}

if (typeof document !== 'undefined' && location.pathname === '/__qa/interactions') connectLocalRunner();

export {observeGroupOrder,checkGroupOrder,runGroupOrderBatch};
