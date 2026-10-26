const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const {test, after} = require('node:test');
const Module = require('node:module');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'timeline-recovery-labels-'));
const file = path.join(dir, 'bundle.cjs');
require('esbuild').buildSync({
  stdin: {contents: "export {ArtistTimelineHost,ArtistTimelineHostProvider} from './components/artist-timeline-host'; export {ArtistTimeline} from './components/artist-timeline';", resolveDir: root},
  bundle: true, outfile: file, platform: 'node', format: 'cjs', jsx: 'automatic',
  external: ['react', 'react/*'], loader: {'.css': 'empty'}, logLevel: 'silent',
});
const compiled = new Module(file, module);
compiled.filename = file;
compiled.paths = [path.join(root, 'node_modules')];
compiled._compile(fs.readFileSync(file, 'utf8'), file);
const {ArtistTimelineHost, ArtistTimelineHostProvider, ArtistTimeline} = compiled.exports;
after(() => fs.rmSync(dir, {recursive: true, force: true}));
const group = require('../data/artist-timeline-registry.json')[0];
const input = require('../data/artist-timelines/' + group.slug + '.json');
const catalog = {members: [], works: [], groups: [], ratings: []};
function render(options) {
  return renderToStaticMarkup(React.createElement(ArtistTimelineHostProvider,
    {value: {input, catalog, onTimelineRetry() {}, ...options}},
    React.createElement(ArtistTimelineHost, {groupId: group.groupId, catalog})));
}
test('module rejection exposes explicit reload with no navigation targets', () => {
  const html = render({timelineError: 'MODULE_FAILURE', timelineRetryLabel: '重新加载页面'});
  assert.match(html, /重新加载页面/);
  assert.doesNotMatch(html, /data-timeline-target-id/);
});
test('pending deadline labels waiting without promising a reload', () => {
  const html = render({timelineError: 'PENDING_DEADLINE', timelineRetryLabel: '继续等待'});
  assert.match(html, /继续等待/);
  assert.doesNotMatch(html, /重新加载页面/);
});
test('catalog failures do not inherit module reload labels', () => {
  const html = render({error: 'CATALOG_FAILURE', timelineRetryLabel: '重新加载页面'});
  assert.match(html, /CATALOG_FAILURE/);
  assert.match(html, /重新读取/);
  assert.doesNotMatch(html, /重新加载页面/);
});
test('invalid timeline input keeps ordinary retry label', () => {
  const html = render({input: {}, timelineRetryLabel: '重新加载页面'});
  assert.match(html, /时间轴暂时无法显示/);
  assert.match(html, /重新读取/);
  assert.doesNotMatch(html, /重新加载页面/);
});
test('legacy hosts keep their default retry wording', () => {
  assert.match(render({timelineError: 'OLD_HOST_ERROR'}), /重新读取/);
});
test('validation ignores a directly supplied module recovery label', () => {
  const context = require('./fixtures/timeline/synthetic-registry.json');
  const html = renderToStaticMarkup(React.createElement(ArtistTimeline,
    {input: {}, context, onRetry() {}, retryLabel: '重新加载页面'}));
  assert.match(html, /重新读取/);
  assert.doesNotMatch(html, /重新加载页面/);
});
