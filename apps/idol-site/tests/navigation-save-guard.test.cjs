/**
 * Read-only synthetic regression probe for the next-MV navigation review.
 * Run from any directory with:
 *   node --test tests/navigation-save-guard.test.cjs
 *
 * The production TSX/hook are transpiled in memory through the existing local
 * fixture harnesses. Every Editor request is handled by fakeFetch. This file
 * never calls the network, changes application source, or writes catalog data.
 * It prints observed behavior and exits nonzero until pending-save navigation
 * guards are present. Hook-model evidence is not a browser test.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const testDirectory = path.join(root, 'tests');

function replaceRequired(source, needle, replacement) {
  if (!source.includes(needle)) throw new Error('Fixture harness changed: ' + needle);
  return source.replace(needle, replacement);
}

async function editorScenario(table, scenario) {
  const filename = path.join(testDirectory, 'editor-flow.test.cjs');
  let source = fs.readFileSync(filename, 'utf8').split('(async()=>{')[0];
  source = replaceRequired(source, 'let saveFailure=null;', 'let saveFailure=null;let saveGate=null;let recordPending=null;');
  source = replaceRequired(source, "revision:'a'.repeat(64),watchedOptions:", "revision:'a'.repeat(64),pendingSave:recordPending===u.searchParams.get('table'),watchedOptions:");
  source = replaceRequired(source, "if(url==='/api/save'){let p=JSON.parse(opts.body);", "if(url==='/api/save'){if(saveGate)await saveGate;let p=JSON.parse(opts.body);");
  source += `
(async () => {
  const table = ${JSON.stringify(table)};
  const scenario = ${JSON.stringify(scenario)};
  if (scenario === 'serverPending') recordPending = table;
  await settle();
  if (table === 'ratings') {
    find(mt, n => n.type === 'button').props.onClick();
    await settle();
  }
  if (scenario !== 'serverPending') {
    find(table === 'works' ? et : mt, n => n.type === 'input' && n.props['aria-label'] === (table === 'works' ? 'MV 分数' : '表现分')).props.onChange({target: {value: '9'}});
    await settle();
    let release;
    saveGate = new Promise(resolve => release = resolve);
    const saveButton = table === 'works' ? footer : find(mt, n => n.type === 'button' && txt(n).includes('保存此条记录'));
    const operation = saveButton.props.onClick();
    await settle();
    if (scenario === 'unknownResult') {
      saveFailure = {error: 'SAVE_UNCERTAIN'};
      release();
      await operation;
      await settle();
    }
  }
  const editor = table === 'works' ? et : mt;
  const next = find(wt, n => n.type === 'button' && n.props.className?.includes('next-work-button'));
  const observation = {
    table, scenario,
    editorDirty: editor.props['data-dirty'] === 'true',
    navigationBlocked: editor.props['data-navigation-blocked'] === 'true',
    nextDisabled: !!next.props.disabled,
    retryLabelVisible: txt(editor).includes('核对上次保存'),
    serverPendingWarningVisible: txt(editor).includes('上次保存结果还未确认'),
    unloadGuardCount: listeners.get('beforeunload')?.size ?? 0,
    mockedReads: requests.filter(r => r.url.startsWith('/api/records?')).length,
    mockedWrites: requests.filter(r => r.url === '/api/save').length
  };
  report(observation);
})().catch(reject);
`;
  return new Promise((resolve, reject) => {
    vm.runInNewContext(source, {
      require: createRequire(filename), __dirname: testDirectory,
      console, URL, URLSearchParams, crypto, structuredClone, setImmediate, AbortController, setTimeout, clearTimeout,
      process, report: resolve, reject
    });
  });
}

function journeyScenarios() {
  const filename = path.join(testDirectory, 'journey.test.cjs');
  let source = fs.readFileSync(filename, 'utf8').split("test('work to member")[0];
  // Use an explicit selector-aware DOM shim, rather than treating every
  // non-main selector as the dirty flag. This is essential for this regression.
  source = replaceRequired(source, 'dirty=false,', 'dirty=false,navigationBlocked=false,');
  source = source.replace(/querySelector:selector=>[^,]+,querySelectorAll:/,
    `querySelector:selector=>selector==='main'?{}:selector==='[data-dirty="true"]'?(dirty?{}:null):selector==='[data-navigation-blocked="true"]'?(navigationBlocked?{}:null):null,querySelectorAll:`);
  source = replaceRequired(source, 'setDirty(v,a=true)', 'setNavigationBlocked(v){navigationBlocked=v},setDirty(v,a=true)');
  // A notice is allowed, but it must not create a confirm-to-bypass path.
  source = replaceRequired(source, 'confirm(){return allow}', 'alert(){},confirm(){return allow}');
  source += `
const observations = [];
for (const dirty of [false, true]) {
  for (const action of ['next', 'back', 'member', 'mainNav', 'browserBack']) {
    const h = harness();
    h.api.navigate({work:'recA'}, '作品库', undefined, {ids:['recA','recB','recC'],label:'待看',filters:pure.defaultFilters()});
    h.flush();
    h.setDirty(dirty, true);
    h.setNavigationBlocked(true);
    if (action === 'next') h.api.continueWork('recB');
    if (action === 'back') h.api.back({nav:'works',work:null,member:null,video:'mv'});
    if (action === 'member') h.api.navigate({work:null,member:'recMember'}, 'A');
    if (action === 'mainNav') h.api.navigate({nav:'home',work:null,member:null}, 'A');
    if (action === 'browserBack') h.history.go(-1);
    h.flush();
    observations.push({dirty, action, remainedOnCurrentWork:h.api.route.work === 'recA', routeWork:h.api.route.work, url:h.location.href});
  }
}
const clean = harness();
clean.api.navigate({work:'recA'}, '作品库', undefined, {ids:['recA','recB'],label:'待看',filters:pure.defaultFilters()});clean.flush();
const first = clean.api.continueWork('recB'), second = clean.api.continueWork('recB');
observations.push({action:'sameTargetRepeated',first,second,routeWork:clean.api.route.work});
report(observations);
`;
  let result;
  vm.runInNewContext(source, {
    require: createRequire(filename), __dirname: testDirectory,
    console, URL, URLSearchParams, structuredClone, report: value => result = value
  });
  return result;
}

(async () => {
  const editors = [];
  for (const table of ['works', 'ratings']) {
    for (const scenario of ['saving', 'unknownResult', 'serverPending']) {
      editors.push(await editorScenario(table, scenario));
    }
  }
  const journeys = journeyScenarios();
  const pass = editors.every(row => row.navigationBlocked && row.nextDisabled && row.unloadGuardCount > 0)
    && journeys.filter(row => row.action !== 'sameTargetRepeated').every(row => row.remainedOnCurrentWork)
    && journeys.at(-1).first === true && journeys.at(-1).second === false;
  console.log(JSON.stringify({pass, network:'fakeFetch only; no real network', editors, journeys}, null, 2));
  if (!pass) process.exitCode = 1;
})().catch(error => {console.error(error);process.exitCode = 1;});
