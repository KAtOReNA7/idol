/*
 * 在 Codex 自带浏览器的 CUA REPL 导入本模块，传入已有的后台测试标签页 tab。
 * 下列导入路径对应本机正式检出，其他电脑请换为自己的仓库路径。
 * const {checkArtistRosterReturns} = await import('file:///D:/porject/idol/docs/codex/qa/member-roster-return.mjs');
 * const browser = await cua.getBrowser({id:'iab'});
 * const viewport = await browser.capabilities.get('viewport');
 * const result = await checkArtistRosterReturns(tab, viewport);
 * nodeRepl.write(result);
 *
 * 默认十团 × 手机/桌面 × 页内返回/浏览器后退，共 40 次。整批请为 CUA REPL
 * 留出足够的 timeout_ms，也可以在同一标签中按团分批执行：
 * await checkArtistRosterReturns(tab, viewport, {slugs:['atheart','hitgs','vcha'], widths:[390]})
 * 实际正文宽度由页面报告。默认允许 4 CSS px 位置误差，可用 tolerancePx 调整。
 * 函数只点成员目录及返回链接，并在结束时复原视口。测试标签由调用方管理。
 */
export async function checkArtistRosterReturns(tab, viewport, options = {}) {
  const origin = new URL(options.origin || 'https://idol-lens-private.wuke40758.chatgpt.site').origin;
  const widths = options.widths || [390, 1280];
  const tolerance = options.tolerancePx ?? 4;
  const cases = [
    ['atheart', 'recvxAPQCFExXO', 'Nahyun', '.ah-roster .ah-person'],
    ['hitgs', 'recvxAPQCFQvki', 'Iyoo', '.hg-roster .hg-person'],
    ['vcha', 'recvxAPQCFmJJw', 'Kaylee', '.vc-roster .vc-person'],
    ['idle', 'recvxyICzHdvGf', 'SOOJIN', '.idv-history-row > a'],
    ['izone', 'recvxyICzH8OvK', 'WONYOUNG'],
    ['fromis9', 'recvxyICzHu868', 'BAEK JIHEON'],
    ['everglow', 'recvxyICzHyLkP', 'AISHA'],
    ['rocketpunch', 'recvxyICzHrWlC', 'DAHYUN'],
    ['cherrybullet', 'recvxyICzHzt6q', 'MAY'],
    ['weeekly', 'recvxyICzHXzUs', 'ZOA'],
  ];
  const slugs = options.slugs || cases.map(([slug]) => slug);
  if (!slugs.length || slugs.some(slug => !cases.some(([known]) => known === slug))) throw Error('未知或空团体范围');
  if (!widths.length || !widths.every(width => Number.isInteger(width) && width > 0) || !Number.isFinite(tolerance) || tolerance < 0) throw Error('无效的视口或位置误差');
  const visits = cases.filter(([slug]) => slugs.includes(slug));
  const rows = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const timeout = {timeoutMs: 10000};

  // This callback executes in the page. Return only geometry and public route identity.
  function geometry(element) {
    const box = element.getBoundingClientRect();
    const active = document.activeElement;
    const params = new URLSearchParams(location.search);
    return {
      pathname: location.pathname, section: params.get('section'), member: params.get('member'),
      action: element.dataset.artistRosterAction || null,
      focused: active === element, activeTag: active?.tagName || null,
      width: document.documentElement.clientWidth, viewportWidth: window.innerWidth,
      scrollY: Math.round(window.scrollY), top: Math.round(box.top), left: Math.round(box.left),
      visible: box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < window.innerHeight
        && box.right > 0 && box.left < window.innerWidth,
    };
  }
  const samePosition = (a, b, delta) => ['scrollY', 'top', 'left'].every(key => Math.abs(a[key] - b[key]) <= delta);
  async function sample(locator, matches, waitMs) {
    const until = Date.now() + waitMs;
    let previous;
    let current;
    do {
      current = await locator.evaluate(geometry);
      if (previous && matches(current) && matches(previous) && samePosition(previous, current, 1)) return {...current, settled: true};
      previous = current;
      await delay(90);
    } while (Date.now() < until);
    return {...current, settled: false};
  }
  async function visit(width, mode, [slug, memberId, name, selector]) {
    const path = '/artists/' + slug;
    const css = selector || 'main a[href*="member=' + memberId + '"]';
    let source = tab.playwright.locator(css);
    if (selector && slug !== 'idle') source = source.filter({hasText: name});
    const row = {slug, memberId, name, mode, requestedWidth: width, ok: false};
    function fail(reason) { row.reason = reason; return row; }
    try {
      row.step = '打开成员目录';
      const directoryUrl = origin + path + '?section=members';
      if (await tab.url() !== directoryUrl) await tab.goto(directoryUrl);
      if (['atheart', 'hitgs', 'vcha'].includes(slug)) {
        await tab.playwright.getByRole('heading', {name: 'MEMBERS', exact: true}).waitFor({state: 'visible', ...timeout});
      } else {
        await tab.playwright.getByLabel('搜索成员', {exact: true}).waitFor({state: 'visible', ...timeout});
      }
      await source.first().waitFor({state: 'visible', ...timeout});
      if (await source.count() !== 1) return fail('原成员卡不唯一');
      row.step = '记录原卡';
      await source.press('Shift', timeout);
      row.before = await sample(source, s => s.focused && s.visible, 1800);
      // The initial HTML can be replaced by the interactive roster while it loads.
      if (!row.before.settled && !row.before.focused) {
        await source.press('Shift', timeout);
        row.before = await sample(source, s => s.focused && s.visible, 1800);
      }
      // Locator clicks can auto-scroll an edge-clipped photo after we measure it.
      // Centre the already focused control so the click starts at the measured position.
      if (row.before.focused) {
        const cdp = await tab.capabilities.get('cdp');
        await cdp.send('Runtime.evaluate', {expression: "document.activeElement.scrollIntoView({block:'center',behavior:'instant'})"});
        row.before = await sample(source, s => s.focused && s.visible, 1000);
      }
      const before = row.before;
      const directory = s => s.pathname === path && s.section === 'members' && !s.member;
      if (!directory(before) || before.viewportWidth !== width || !before.settled || !before.focused || !before.visible) return fail('未能在指定视口定位原成员卡');
      row.step = '点击原成员卡';
      await source.click(timeout);
      row.step = '核对本人详情';
      const detail = tab.playwright.locator('[data-member-layout][data-member-id="' + memberId + '"]');
      await detail.waitFor({state: 'visible', ...timeout});
      const id = await detail.evaluate(el => ({
        path: location.pathname, member: new URLSearchParams(location.search).get('member'), displayed: el.dataset.memberId,
      }));
      if (id.path !== path || id.member !== memberId || id.displayed !== memberId) return fail('详情与所点成员不符');
      row.detailMember = id.displayed;
      row.step = mode === 'page' ? '点击返回成员目录' : '浏览器后退';
      if (mode === 'page') {
        const back = tab.playwright.locator('main a, main button').filter({hasText: '返回成员目录'});
        await back.first().waitFor({state: 'visible', ...timeout});
        if (await back.count() !== 1) return fail('页面返回入口不唯一');
        await back.click(timeout);
      } else {
        await tab.back();
      }
      row.step = '读取恢复后的焦点和位置';
      await source.waitFor({state: 'visible', ...timeout});
      const restored = s => directory(s) && s.visible && s.focused && s.width === before.width && samePosition(s, before, tolerance);
      row.after = await sample(source, restored, 2500);
      row.delta = {top: row.after.top - before.top, left: row.after.left - before.left, scrollY: row.after.scrollY - before.scrollY};
      if (!directory(row.after)) return fail('未返回原目录');
      if (!row.after.focused) return fail('焦点没有回到原控件');
      if (!row.after.settled || !restored(row.after)) return fail('视口或原卡位置未恢复');
      delete row.step;
      row.ok = true;
    } catch (error) {
      // The first line identifies the failed browser action. Omit snapshots and call traces.
      row.reason = (error.message || error.name || '操作失败').split('\n', 1)[0].slice(0, 220);
      row.observedPath = new URL(await tab.url()).pathname;
      row.observedMember = new URL(await tab.url()).searchParams.get('member');
      row.timeout = /timed?\s*out|timeout/i.test(error.message || '');
    }
    return row;
  }
  try {
    for (const width of widths) {
      await viewport.set({width, height: 900});
      for (const testCase of visits) {
        for (const mode of ['page', 'browser']) rows.push(await visit(width, mode, testCase));
      }
    }
  } finally {
    await viewport.reset();
  }
  const passed = rows.filter(row => row.ok).length;
  return {origin, tolerancePx: tolerance, planned: visits.length * widths.length * 2, passed, failed: rows.length - passed, rows};
}
