'use strict';
// Run after applying the overlay: node --test tests/triples-visual-timeline.test.cjs
// For an unapplied overlay, set TRIPLES_REVIEW_BASE to the read-only base checkout.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');

const overlay = path.resolve(__dirname, '..');
const main = process.env.TRIPLES_REVIEW_BASE
  ? path.resolve(process.env.TRIPLES_REVIEW_BASE)
  : fs.existsSync(path.join(overlay, 'package.json'))
    ? overlay
    : path.resolve(overlay, '../idol-day19-restored');
const requireMain = createRequire(path.join(main, 'package.json'));
const ts = requireMain('typescript');
const esbuild = requireMain('esbuild');
const React = requireMain('react');
const {renderToStaticMarkup} = requireMain('react-dom/server');
const entry = path.join(overlay, 'components/design-review/triples-visual-timeline.tsx');
const fallback = file => file.startsWith(overlay + path.sep) ? main + file.slice(overlay.length) : file;
const locate = file => [file, file + '.ts', file + '.tsx', file + '.json', file + '/index.ts', file + '/index.tsx'].find(candidate => fs.existsSync(candidate));
const readJson = file => JSON.parse(fs.readFileSync(path.join(main, file), 'utf8'));
const identity = readJson('data/public-artist-identity-map.json').groups.triples;
const timeline = readJson('data/artist-timelines/triples.json');
let loaded;

function scene() {
  const works = new Map();
  for (const media of identity.media) {
    if (!media.workId || !media.url) continue;
    const work = works.get(media.workId) ?? {id: media.workId, groupIds: [identity.groupId], url: '', placeholder: null, stage: null};
    if (media.kind === 'mv') work.url = media.url;
    else if (media.kind === 'stage') work.stage = {url: media.url, videoId: media.videoId, scoreBinding: null};
    works.set(work.id, work);
  }
  return {
    mode: 'snapshot',
    scope: {type: 'artist', groupId: identity.groupId},
    groups: [{id: identity.groupId}],
    members: identity.members.map(member => ({id: member.memberId, groupIds: [identity.groupId]})),
    works: [...works.values()],
    ratings: [],
  };
}

function render(changes = {}) {
  const links = [];
  const Link = ({href, children, ...rest}) => {
    links.push({href, children, ...rest});
    return React.createElement(href ? 'a' : 'span', {...rest, ...(href ? {href} : {})}, children);
  };
  const Picture = ({src, alt, className}) => React.createElement('img', {src, alt, className, loading: 'lazy'});
  const html = renderToStaticMarkup(React.createElement(loaded.TriplesVisualTimeline, {
    events: timeline.events, members: [], catalog: scene(), Link, Picture, ...changes,
  }));
  return {html, links};
}

test.before(async () => {
  const result = await esbuild.build({
    stdin: {
      contents: [
        "export {TriplesVisualTimeline} from '@/components/design-review/triples-visual-timeline';",
        "export {canonicalReviewUrl, readTriplesReviewRoute} from '@/lib/idol/design-review/triples-visual-model';",
        "export {resolvePublicArtistEntity} from '@/lib/idol/public-artist-bridge';",
      ].join('\n'),
      resolveDir: overlay,
      sourcefile: 'timeline-verification-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    external: ['react', 'react/*'],
    nodePaths: [path.join(main, 'node_modules')],
    logLevel: 'silent',
    plugins: [{
      name: 'read-only-overlay',
      setup(build) {
        build.onResolve({filter: /^(@\/|\.)/}, args => {
          const target = args.path.startsWith('@/')
            ? path.join(overlay, args.path.slice(2))
            : path.resolve(path.dirname(args.importer), args.path);
          return {path: locate(target) || locate(fallback(target)) || target};
        });
      },
    }],
  });
  const module = {exports: {}};
  vm.runInThisContext('(function(require,module,exports){' + result.outputFiles[0].text + '})')(requireMain, module, module.exports);
  loaded = module.exports;
});

test('timeline component passes focused strict TypeScript checking without editing the base', () => {
  const options = {
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true,
    module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    resolveJsonModule: true, jsx: ts.JsxEmit.ReactJSX,
    baseUrl: main, paths: {'@/*': [overlay + '/*', main + '/*']},
    types: ['node'], typeRoots: [path.join(main, 'node_modules/@types')],
  };
  const host = ts.createCompilerHost(options);
  const originalRead = host.readFile, originalExists = host.fileExists, originalDirectory = host.directoryExists;
  host.readFile = file => originalRead(file) ?? originalRead(fallback(file));
  host.fileExists = file => originalExists(file) || originalExists(fallback(file));
  host.directoryExists = file => originalDirectory(file) || originalDirectory(fallback(file));
  host.getSourceFile = (file, version) => {
    const content = host.readFile(file);
    return content === undefined ? undefined : ts.createSourceFile(file, content, version);
  };
  const errors = ts.getPreEmitDiagnostics(ts.createProgram([entry], options, host));
  assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, {
    getCanonicalFileName: file => file, getCurrentDirectory: () => main, getNewLine: () => '\n',
  }));
});

test('all 24 canonical events retain their IDs and exact dates with no input mutation', () => {
  const before = JSON.stringify(timeline);
  const {html} = render();
  assert.equal(timeline.events.length, 24);
  assert.equal((html.match(/data-timeline-event=/g) || []).length, 24);
  assert.match(html, /data-event-count="24"/);
  for (const event of timeline.events) {
    assert.ok(html.includes('id="' + event.id + '"'), event.id);
    assert.ok(html.includes('data-event-date="' + event.eventDate.value + '"'), event.id);
  }
  assert.equal(JSON.stringify(timeline), before);
});

test('every canonical internal link is non-null and remains a valid review route, including the release footer', () => {
  const {html, links} = render();
  assert.ok(links.length > 0);
  for (const link of links) {
    assert.equal(typeof link.href, 'string', JSON.stringify({className: link.className, href: link.href}));
    assert.ok(link.href.startsWith('/design-review/triples-v2?'), link.href);
    assert.ok(loaded.canonicalReviewUrl(link.href), link.href);
    assert.equal(new URL(link.href, 'https://site.invalid').hash, '');
  }
  const footer = html.slice(html.indexOf('<footer class="timeline-end">'));
  assert.match(footer, /href="\/design-review\/triples-v2\?section=works"/);
  assert.doesNotMatch(footer, /format=release|<span class="text-link"/);
  assert.match(html, /\/design-review\/triples-v2\?section=updates&amp;year=2022/);
  assert.doesNotMatch(html, /#\/timeline|href="\/artists\//);
  for (const link of links.filter(link => link.className === 'timeline-work-link text-link')) {
    const route = loaded.readTriplesReviewRoute(link.href);
    const resolved = loaded.resolvePublicArtistEntity('triples', {kind: route.format, key: route.media}, scene());
    assert.ok(resolved && 'work' in resolved);
    assert.equal(route.format, link['data-media-kind']);
    assert.equal(route.media, link['data-media-key']);
    assert.ok(timeline.events.some(event => event.workIds.includes(resolved.work.id)));
  }
});

test('missing work entities and selected event/year never reduce the canonical event count', () => {
  const {html} = render({catalog: {...scene(), works: []}});
  assert.equal((html.match(/data-timeline-event=/g) || []).length, 24);
  assert.doesNotMatch(html, /timeline-work-link/);
  const selected = render({selectedYear: '2024', selectedEvent: timeline.events[0].id}).html;
  assert.equal((selected.match(/data-timeline-event=/g) || []).length, 24);
  assert.match(selected, /aria-current="location"/);
  assert.match(selected, /aria-current="true"/);
});

test('announcement, planned, imprecise, and unknown dates never acquire invented day precision', () => {
  const announced = {
    ...timeline.events[0], id: 'e-review-announced', status: 'announced', title: '未来发行',
    eventDate: null, announcementDate: {value: '2026-09', precision: 'month'},
    plannedDate: {value: '2027', precision: 'year'}, releaseKey: null, workIds: [],
  };
  const planned = {...announced, id: 'e-review-planned', status: 'planned'};
  const unknown = {...announced, id: 'e-review-unknown', status: 'uncertain', announcementDate: null, plannedDate: null};
  const {html} = render({events: [announced, planned, unknown]});
  assert.match(html, /data-event-date="2026-09" data-event-precision="month" data-date-kind="announcement"/);
  assert.match(html, /data-event-date="2027" data-event-precision="year" data-date-kind="planned"/);
  assert.match(html, /宣布：未来发行/);
  assert.match(html, /计划：未来发行/);
  assert.match(html, /data-event-date="" data-event-precision="" data-date-kind="unknown"/);
  assert.equal((html.match(/data-timeline-event=/g) || []).length, 3);
  assert.doesNotMatch(html, /2026-09-01|2027-01-01/);
});

test('sources use safe external URLs and React escapes source text', () => {
  const unsafe = {
    ...timeline.events[0],
    sources: [
      {id: 'unsafe', url: 'javascript:alert(1)', title: 'Unsafe', publisher: 'Unsafe', scopeNote: '', sourcePublishedAt: null},
      {id: 'safe', url: 'https://www.triples-official.jp/', title: '<script>alert(1)</script>', publisher: 'tripleS', scopeNote: 'INTERNAL_SOURCE_AUDIT', sourcePublishedAt: null},
    ],
    summary: 'INTERNAL_EVENT_AUDIT', scopeNote: 'INTERNAL_SCOPE_AUDIT',
  };
  const {html} = render({events: [unsafe]});
  assert.doesNotMatch(html, /href="javascript:|<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /INTERNAL_(?:SOURCE|EVENT|SCOPE)_AUDIT/);
  assert.match(html, /<summary>来源<\/summary>/);
  assert.match(render().html, /class="timeline-source-details"/);
});


test('all canonical research notes stay in data while sources and factual events remain visible', () => {
  const before = JSON.stringify(timeline);
  const {html} = render();
  const escaped = value => renderToStaticMarkup(React.createElement('span', null, value)).slice(6, -7);
  for (const event of timeline.events) {
    for (const note of [event.summary, event.scopeNote, ...event.sources.map(source => source.scopeNote)].filter(Boolean)) {
      assert.ok(!html.includes(escaped(note)), `Internal note rendered for ${event.id}`);
    }
    for (const source of event.sources) {
      assert.ok(html.includes(escaped(source.title || source.publisher)), source.id);
      assert.ok(html.includes(source.url.replaceAll('&', '&amp;')), source.id);
    }
    assert.ok(html.includes(`data-timeline-event="${event.id}"`));
  }
  assert.equal(JSON.stringify(timeline), before);
  assert.doesNotMatch(html, /groupId|memberIds|reviewStatus|L314|L359|后续证据更新|不购买或绕区域限制/);
});
