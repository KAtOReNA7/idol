// From the repository root:
// node docs/codex/qa/catalog-stage-headings.cjs
// Append --v223 to run the same catalogue through the previously published WorkDetail.
// Pass a JSON output path to retain the result. The default output is stdout.
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const baseline = process.argv[2] === '--v223';
const filename = process.argv[baseline ? 3 : 2];
const output = filename ? path.resolve(filename) : null;
const app = path.resolve(__dirname, '../../../apps/idol-site');
process.chdir(app);
const appRequire = Module.createRequire(path.join(app, 'package.json'));
const React = appRequire('react');
const {renderToStaticMarkup} = appRequire('react-dom/server');
const {parse} = appRequire('next/dist/compiled/node-html-parser');
const snapshot = appRequire('./data/snapshot.json');
const stages = appRequire('./data/stage-videos.json');
const noop = () => {};
const baselineSource = '866268246661269bbc4f1158793af48b98301789:apps/idol-site/components/catalog/work-detail.tsx';

async function loadPage() {
  const plugins = baseline ? [{name: 'published-heading', setup(build) {
    const contents = execFileSync('git', ['show', baselineSource], {cwd: app, encoding: 'utf8'});
    build.onLoad({filter: /[\\/]components[\\/]catalog[\\/]work-detail\.tsx$/}, args => ({
      contents, resolveDir: path.dirname(args.path), loader: 'tsx',
    }));
  }}] : [];
  const entry = [
    "export {WorkDetail} from './components/catalog/work-detail';",
    "export {PublicAccessProvider} from './components/public-access';",
    "export {projectCatalog} from './lib/idol/catalog';",
    "export {projectPublicCatalog} from './lib/idol/public-catalog';",
    "export {projectWorkCatalog} from './lib/idol/work-catalog';",
  ].join('\n');
  const bundle = await appRequire('esbuild').build({stdin: {contents: entry, resolveDir: app},
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', plugins,
    external: ['react', 'react/*', 'react-dom', 'react-dom/*', 'cloudflare:workers', 'server-only'], loader: {'.css': 'empty'}});
  const compiled = new Module(__filename);
  compiled.require = name => name === 'cloudflare:workers' ? {env: {}} : name === 'server-only' ? {} : appRequire(name);
  compiled._compile(bundle.outputFiles[0].text, __filename);
  return compiled.exports;
}

// These independent sample expectations cover a broadcast upload, a full performance,
// a different-language fallback, an excerpt of unknown date, and a missing stage.
const sampleCaptions = new Map([
  ['recvxyHuKMFzlZ', '舞台表演 · 视频发布于 2025-02-07'],
  ['recvxDMFHNyJoh', '音乐节目舞台 · 视频发布于 2026-01-22'],
  ['rec28ldfRTrNcl', '表演视频 · 同曲后备 · 不同版本 · 视频发布于 2025-03-14'],
  ['recvxyOz5XkyEY', '表演视频 · 同曲后备 · 节选'],
  ['recvxIZy35Xwr7', '暂无舞台'],
]);
const samples = {};

function checkPage(api, work, data, mode, stage) {
  const html = renderToStaticMarkup(React.createElement(api.PublicAccessProvider, {canEdit: false},
    React.createElement(api.WorkDetail, {work, data, initialView: mode, onBack: noop, onMember: noop, onVersion: noop, onSaved: noop})));
  const page = parse(html);
  const headings = page.querySelectorAll('.music-work-title');
  assert.equal(headings.length, 1, 'one primary work header');
  assert.equal(headings[0].querySelector('h1').text, work.song || work.name);
  assert.equal(page.querySelector(`#${mode}-tab`).getAttribute('aria-selected'), 'true');
  const caption = headings[0].querySelector('p').text;
  const date = mode === 'stage' ? stage?.publishedDate : work.releaseDate;
  assert.deepEqual(caption.match(/\d{4}-\d{2}-\d{2}/g) ?? [], date ? [date] : [], 'date of the selected video');
  if (mode === 'mv') {
    for (const value of [work.videoType, work.version].filter(Boolean)) assert.ok(caption.includes(value), value);
  } else if (stage) {
    const stageTag = page.querySelectorAll('.work-aside .tags > span')[1].text;
    assert.ok(stageTag && caption.startsWith(stageTag), 'selected stage type agrees with the details');
    if (stage.publishedDate) assert.ok(caption.includes('视频发布于 ' + stage.publishedDate));
    const fallback = stage.sameSongFallback;
    if (fallback) {
      assert.ok(caption.includes('同曲后备'));
      if (fallback.completeness === 'excerpt') assert.ok(caption.includes('节选'));
      if (fallback.version === 'different') assert.ok(caption.includes('不同版本'));
      if (fallback.version === 'unconfirmed') assert.ok(caption.includes('版本未核'));
    }
    if (stage.memberVersionFallback) assert.ok(caption.includes('成员版'));
  } else {
    const options = work.stageSupplement;
    const status = options?.alternatives.length ? '其他现场' : options?.watchLeads?.length ? '相关演出' : '暂无舞台';
    assert.equal(caption, status);
    assert.equal(page.querySelector('.stage-empty h2').text, status);
  }
  if (sampleCaptions.has(work.id)) {
    if (mode === 'stage') assert.equal(caption, sampleCaptions.get(work.id));
    samples[work.id] ??= {song: work.song};
    samples[work.id][mode] = caption;
  }
}

const counts = () => ({works: 0, placeholders: 0, differentDates: 0, stageDateUnknownWithMvDate: 0,
  noBoundStage: 0, otherViewingOptions: 0, mvPassed: 0, stagePassed: 0});
async function audit() {
  const api = await loadPage();
  const catalog = api.projectPublicCatalog(api.projectCatalog(snapshot.tables, 'snapshot', snapshot.capturedAt));
  const totals = counts();
  const groups = new Map(catalog.groups.map(group => [group.id, {group: group.name, ...counts()}]));
  const failures = [];
  for (const work of catalog.works) {
    const owners = [...new Set(work.groupIds)].map(id => groups.get(id));
    const increment = key => { totals[key]++; for (const group of owners) group[key]++; };
    if (work.placeholder) { increment('placeholders'); continue; }
    increment('works');
    const stage = stages[work.id];
    assert.equal(work.stage?.videoId, stage?.videoId, 'matching public stage for ' + work.id);
    if (!stage) {
      increment('noBoundStage');
      if (work.stageSupplement?.alternatives.length || work.stageSupplement?.watchLeads?.length) increment('otherViewingOptions');
    } else if (work.releaseDate) {
      if (!stage.publishedDate) increment('stageDateUnknownWithMvDate');
      else if (stage.publishedDate !== work.releaseDate) increment('differentDates');
    }
    const data = api.projectWorkCatalog(catalog, work);
    for (const mode of ['mv', 'stage']) {
      try {
        checkPage(api, work, data, mode, stage);
        increment(mode + 'Passed');
      } catch (error) {
        failures.push({id: work.id, mode, message: error.message});
      }
    }
  }
  const report = {
    method: 'Local server rendering of the public, work-scoped catalogue and the production WorkDetail in both initial tabs.',
    inputs: ['apps/idol-site/data/snapshot.json', 'apps/idol-site/data/stage-videos.json'],
    scope: 'Count each work once in totals and once per credited group. Catalogue placeholders have no work detail.',
    groups: groups.size, groupsWithWorks: [...groups.values()].filter(row => row.works).length,
    groupsWithDifferentOrUnknownStageDate: [...groups.values()].filter(row => row.differentDates || row.stageDateUnknownWithMvDate).length,
    statesChecked: 2 * totals.works, totals, samples, byGroup: Object.fromEntries(groups), failures,
  };
  if (baseline) {
    const categories = {};
    for (const failure of failures) {
      const reason = failure.message.split('\n')[0];
      categories[reason] = (categories[reason] ?? 0) + 1;
    }
    report.baselineSource = baselineSource;
    report.reproduce = 'node docs/codex/qa/catalog-stage-headings.cjs --v223';
    report.failureCategories = categories;
    report.failedStates = failures.length;
    report.byGroup = Object.fromEntries([...groups].map(([id, row]) => [id,
      {group: row.group, works: row.works, mvPassed: row.mvPassed, stagePassed: row.stagePassed}]));
    delete report.failures;
    delete report.samples;
    assert.equal(totals.mvPassed, totals.works, 'baseline must retain all MV headings');
    assert.equal(categories['date of the selected video'] + categories['selected stage type agrees with the details'], totals.works,
      'baseline must fail on the stage metadata, without unrelated failures');
  }
  const json = JSON.stringify(report, null, 2) + '\n';
  if (output) fs.writeFileSync(output, json);
  else process.stdout.write(json);
  if (!baseline && failures.length) process.exitCode = 1;
}
audit().catch(error => { console.error(error); process.exitCode = 1; });
