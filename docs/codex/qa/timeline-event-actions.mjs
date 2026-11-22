// A single background Codex tab. Set groups, startAction and maxActions for short, resumable runs.
// The tab's viewport belongs to the caller. Only public event controls and detail return actions are clicked.
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const timelines = {
  adya: 'main#artist-content > .idol-adya-title + .idol-adya-timeline > li[id]',
  witchx: 'main#artist-content > .wk-title + .wk-timeline > li[id]',
  ive: 'main .sr-history [data-timeline-ready="true"][data-timeline-style-ready="true"] [data-timeline-event-id]',
};
const publicReleases = {
  adya: require('../../../apps/idol-site/data/adya-native-design.json'),
  witchx: require('../../../apps/idol-site/data/witchx-native-design.json'),
};
const publicKeys = ['release', 'media', 'member', 'work'];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function destination(slug, action) {
  if (action.kind === 'work') return {heading:'.detail:not(.stage-view) .music-work-title h1', back:'.detail:not(.stage-view) > button.back', title:action.label};
  if (action.kind === 'member') return {heading:'[data-member-layout][data-member-id="'+action.key+'"] h1',
    back:action.path==='/'?'.detail[data-member-layout] > button.back':'main .sr-member-detail .sr-back', title:action.label};
  const data = publicReleases[slug];
  if (data) {
    const prefix = slug === 'adya' ? 'idol-adya' : 'wk';
    const release = action.kind === 'release';
    return {heading:'main > .'+prefix+(release?'-release-detail':'-film')+' h1', back:'main > .'+prefix+'-back',
      title:(release?data.releases:data.works).find(entry => entry.key === action.key)?.title ?? null};
  }
  return {heading:action.kind === 'release' ? 'main .sr-release-detail h1, main .ive-period[data-period="'+action.key+'"] h1'
    : 'main .sr-film-detail h1', back:'main .sr-back', title:null};
}

function discoverEvents(selector) {
  const shown = node => !!node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden';
  const events = [...document.querySelectorAll(selector)].filter(shown).map((el, index) => {
    const id = el.dataset.timelineEventId || el.id;
    const title = el.querySelector('h3,h2')?.textContent.trim();
    const controls = [...el.querySelectorAll('a[href],button')].filter(shown);
    const actions = new Map();
    let sources = 0, unrecognized = 0;
    for (const [controlIndex, control] of controls.entries()) {
      const url = control.matches('a[href]') ? new URL(control.href, location.href) : null;
      if (url && url.origin !== location.origin) { sources++; continue; }
      const kind = control.dataset.timelineTargetKind || (url && ['release','media','member','work'].find(k => url.searchParams.has(k)));
      const key = control.dataset.timelineTargetId || (kind && url?.searchParams.get(kind));
      if (!kind || !key || !['release','media','member','work'].includes(kind) || control.disabled) { unrecognized++; continue; }
      const label = (control.textContent.trim() || control.getAttribute('aria-label') || control.querySelector('img')?.alt || '').slice(0,100);
      const identity = kind + ':' + key;
      // A cover and its text link are the same visitor destination. Prefer the named text link.
      if (!actions.has(identity) || control.textContent.trim()) actions.set(identity, {kind,key,label,controlIndex,
        path:url?.pathname || (kind==='release'?location.pathname:'/'), section:url?.searchParams.get('section') ?? null,
        format:url?.searchParams.get('format') ?? null});
    }
    return {id,title,index,sources,unrecognized,actions:[...actions.values()]};
  });
  return {width:document.documentElement.clientWidth, viewportWidth:innerWidth, height:innerHeight, events};
}

function controlPosition(el) {
  const box = el.getBoundingClientRect(), row = el.closest('[data-timeline-event-id],li[id]');
  const card = row?.getBoundingClientRect();
  const cx=box.left+box.width/2, cy=box.top+box.height/2;
  const onscreen=cx>=0 && cy>=0 && cx<document.documentElement.clientWidth && cy<innerHeight;
  const hit=onscreen?document.elementFromPoint(cx,cy):null;
  return {event:row?.dataset.timelineEventId || row?.id || null, top:Math.round(box.top), y:Math.round(scrollY),
    width:document.documentElement.clientWidth, focused:el===document.activeElement,
    eventFocused:!!row?.contains(document.activeElement), eventTargeted:!!row && (row.matches(':target') || !!row.querySelector(':target')),
    eventVisible:!!card && card.bottom>0 && card.top<innerHeight,
    visible:box.bottom>0 && box.top<innerHeight && box.right>0 && box.left<innerWidth && box.width>0 && box.height>0,
    pointOnControl:!!hit && (el===hit || el.contains(hit))};
}

function readDetail(spec) {
  const query = new URLSearchParams(location.search);
  // Public identity and navigation labels only. Never serialize detail bodies, form values, notes or history state.
  const shown = el => !!el.getClientRects().length && getComputedStyle(el).visibility!=='hidden';
  const headings=[...document.querySelectorAll(spec.heading)].filter(shown);
  const backs=[...document.querySelectorAll(spec.back)].filter(shown).filter(el=>/返回|回到/.test(el.textContent));
  const back=backs.length===1?backs[0]:null;
  return {path:location.pathname, origin:location.origin, section:query.get('section'), format:query.get('format'),
    release:query.get('release'), media:query.get('media'), member:query.get('member'), work:query.get('work'),
    headingCount:headings.length, heading:headings.length===1?headings[0].textContent.trim().slice(0,120):null,
    backCount:backs.length, back:back?.textContent.trim().slice(0,80) || null,
    backHref:back?.matches('a[href]')?back.pathname+back.search+back.hash:null};
}

function safeFailure(error) {
  const message = String(error?.message || error);
  if (/timed?\s*out|timeout|deadline/i.test(message)) return 'timeout';
  if (/closed|disconnect|unavailable/i.test(message)) return 'connection';
  return 'interaction-failed';
}

export async function checkTimelineEventActions(tab, {
  site = 'https://idol-lens-private.wuke40758.chatgpt.site', groups = Object.keys(timelines),
  startAction = 0, maxActions = Infinity, deadlineMs = 55000, modes = ['browser','page'],
} = {}) {
  const pw = tab.playwright;
  const origin = new URL(site).origin;
  const results = [];
  const until = Date.now() + deadlineMs;
  const timeout = (max=5000) => ({timeoutMs:Math.max(1,Math.min(max,until-Date.now()))});
  let cdp;
  async function bounded(operation) {
    const remaining = until - Date.now();
    if (remaining <= 0) throw Error('deadline');
    let timer;
    try {
      return await Promise.race([operation(),new Promise((_,reject) => {
        timer = setTimeout(() => reject(Error('deadline')), remaining);
      })]);
    } finally { clearTimeout(timer); }
  }
  async function locateForClick(source,eventId) {
    const stop=Math.min(until,Date.now()+3500);
    let before=null, previous=null;
    do {
      if (!before?.focused || !before.pointOnControl) {
        await source.press('Shift',timeout());
        const focused = await bounded(() => source.evaluate(controlPosition));
        if (focused.focused && focused.event===eventId) {
          cdp ??= await bounded(() => tab.capabilities.get('cdp'));
          // Focus the real link first, then use the same scrollIntoView interaction as the member-directory QA.
          // Refuse to scroll another control if a hydration pass moved focus after the key press.
          const expected=JSON.stringify(eventId);
          const expression='(()=>{const el=document.activeElement,row=el?.closest("[data-timeline-event-id],li[id]");'
            +'if(row && (row.dataset.timelineEventId || row.id)==='+expected+') el.scrollIntoView({block:"center",inline:"nearest",behavior:"instant"});})()';
          await bounded(() => cdp.send('Runtime.evaluate',{expression}));
        }
        previous=null;
      }
      before=await bounded(() => source.evaluate(controlPosition));
      const actionable=before.event===eventId && before.focused && before.visible && before.pointOnControl;
      if (actionable && previous && Math.abs(previous.top-before.top)<=1 && Math.abs(previous.y-before.y)<=1) {
        return {...before,settled:true};
      }
      previous=actionable?before:null;
      if (Date.now()<stop) await delay(90);
    } while(Date.now()<stop);
    return {...before,settled:false};
  }
  const normalize = value => value?.normalize('NFKC').replace(/\s+/g,' ').trim();
  for (const slug of groups) {
    if (Date.now() >= until) break;
    const selector = timelines[slug];
    if (!selector) throw Error('Unmapped artist timeline');
    const path = '/artists/' + slug, timeline = origin + path + '?section=updates';
    const group = {slug, events:[], totalActions:0, attempts:[]};
    results.push(group);
    const onList = url => url.origin===origin && url.pathname===path && url.searchParams.get('section')==='updates'
      && publicKeys.every(kind=>!url.searchParams.has(kind));
    const waitList = async () => {
      if (slug !== 'ive') {
        const title=slug==='adya'?'.idol-adya-title':'.wk-title';
        await pw.locator('main#artist-content > '+title+' > h1').filter({hasText:/^时间轴$/}).waitFor({state:'visible',...timeout(10000)});
      }
      await pw.locator(selector).first().waitFor({state:'visible',...timeout(10000)});
    };
    const list = async () => {
      if (!onList(new URL(await bounded(() => tab.url())))) await bounded(() => tab.goto(timeline));
      await waitList();
    };
    try {
      await list();
      Object.assign(group,await bounded(() => pw.evaluate(discoverEvents,selector)));
      const actions = group.events.flatMap(event => event.actions.map(action => ({event,action})));
      group.totalActions = actions.length;
      group.staticEvents = group.events.filter(e => !e.actions.length && !e.unrecognized).map(e => e.id);
      group.sourceOnlyEvents = group.events.filter(e => !e.actions.length && !e.unrecognized && e.sources).map(e => e.id);
      for (const [actionIndex, {event,action}] of actions.entries()) {
        if (actionIndex < startAction || actionIndex >= startAction + maxActions || Date.now() >= until) continue;
        const rowSelector=selector+(slug==='ive'?'[data-timeline-event-id=':'[id=')+JSON.stringify(event.id)+']';
        const source = pw.locator(rowSelector).locator('a[href]:visible,button:visible').nth(action.controlIndex);
        const spec = destination(slug,action);
        for (const mode of modes) {
          if (Date.now() >= until) break;
          const row = {actionIndex,event:event.id,kind:action.kind,key:action.key,mode};
          group.attempts.push(row);
          try {
            await list();
            row.before = await locateForClick(source,event.id);
            if (!row.before.settled) { row.reason='source-not-in-view-and-focused'; continue; }
            await source.click(timeout());
            const targetIsReady = d => d.origin===origin && d.path===action.path && d[action.kind]===action.key
              && (!action.section || d.section===action.section) && (!action.format || d.format===action.format)
              && d.headingCount===1 && !!d.heading && d.headingMatches;
            row.expectedHeading=spec.title;
            const end = Math.min(until, Date.now()+8000);
            do {
              row.detail = await bounded(() => pw.evaluate(readDetail,spec));
              const heading=normalize(row.detail.heading), title=normalize(spec.title);
              row.detail.headingMatches=!!heading && (!title || heading===title
                || (action.kind==='member' && heading.split(/\s*·\s*/).includes(title)));
              if (targetIsReady(row.detail)) break;
              if (Date.now() < end) await delay(90);
            } while (Date.now() < end);
            row.opened = Boolean(targetIsReady(row.detail));
            if (!row.opened) {row.reason='detail-title-or-identity-not-confirmed';continue;}
            if (mode === 'browser') await bounded(() => tab.back());
            else {
              if (!row.detail.back) { row.reason='no-page-return-control'; continue; }
              const back = pw.locator(spec.back).filter({hasText:row.detail.back});
              if (await back.count()!==1) {row.reason='page-return-control-not-unique';continue;}
              await back.click(timeout());
            }
            // A return may be delayed by a document navigation. Wait only for the original route,
            // then record the actual destination. A direct reset before the next attempt is never a pass.
            const returning = Math.min(until,Date.now()+1500);
            let current;
            do {
              current = new URL(await bounded(() => tab.url()));
              if (onList(current)) break;
              if (Date.now()<returning) await delay(100);
            } while (Date.now()<returning);
            row.returnPath = current.pathname;
            row.returnSection = current.searchParams.get('section');
            row.returned = onList(current);
            if (!row.returned) continue;
            await waitList();
            await source.waitFor({state:'visible',...timeout()});
            const settle = Math.min(until, Date.now()+1300);
            do {
              row.after = await bounded(() => source.evaluate(controlPosition));
              row.samePosition = row.after.visible && row.after.event === row.before.event && row.after.width === row.before.width
                && Math.abs(row.after.top-row.before.top) <= 24 && Math.abs(row.after.y-row.before.y) <= 24;
              if (row.samePosition && row.after.focused) break;
              if (Date.now()<settle) await delay(100);
            } while (Date.now()<settle);
          } catch (error) { row.reason = safeFailure(error); }
        }
      }
    } catch (error) { group.reason = safeFailure(error); }
  }
  return {probeVersion:'timeline-ready-v2',site:origin, requestedGroups:groups, startAction, maxActions:Number.isFinite(maxActions)?maxActions:null, modes,
    deadlineMs, deadlineReached:Date.now()>=until, groups:results};
}
