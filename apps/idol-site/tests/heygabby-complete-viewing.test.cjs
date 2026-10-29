const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const {createHash} = require('node:crypto');
const React = require('react'), {renderToStaticMarkup} = require('react-dom/server');
const load = require('./helpers/public-artist-loader.cjs');
const {beforeHeyGabbyViewing, beforeHeyGabbyViewingBytes, beforeHeyGabbyViewingNotes,
  heyGabbyViewingAdoption: adoption} = require('./helpers/heygabby-viewing-baseline.cjs');
const {beforeHeyGabbyFormalBytes, beforeHeyGabbyFormalStages, beforeHeyGabbyFormalStatuses,
  beforeHeyGabbyFormalPosters, heyGabbyFormalAdoption: formal} = require('./helpers/heygabby-formal-baseline.cjs');
const {validStageAlternative, stageSupplementForWork} = load('lib/idol/supplements.ts');
const {stageForWork} = load('lib/idol/stage.ts');
const stageSource = load('lib/idol/stage-source.ts');
const {stageSourceKey, stageHasValidBinding, formatStageTime} = stageSource;
const {stageMatches} = load('lib/idol/stage-display.ts');
const {projectPublicCatalog} = load('lib/idol/public-catalog.ts');
const {validStageResearchNote} = load('lib/idol/stage-public-research.ts');
const {approvedVideoPoster} = load('lib/idol/approved-video-poster.ts');
const copy = load('lib/idol/product-copy.ts');
const data = require('../data/stages/supplements.json'), notes = require('../data/ui/alternative-notes.json');
const app = path.resolve(__dirname, '..'), id = 'recvxyOz5Xo5fW', video = 'XSpYaEdpKxY';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const supplement = stageSupplementForWork(id), alternative = supplement.alternatives[0];

test('the human-confirmed complete Korean Performance has one fresh exact formal binding while its retained candidate stays view-only', () => {
  assert.equal(adoption.workId, id); assert.equal(adoption.sourceId, video);
  assert.equal(supplement.alternatives.length, 1); assert.equal(validStageAlternative(alternative), true);
  assert.equal(alternative.sourceId, video); assert.equal(alternative.url, 'https://www.youtube.com/watch?v=' + video);
  assert.equal(alternative.sourceClass, 'official'); assert.equal(alternative.performerScope, 'full_group');
  assert.equal(alternative.completeness, 'full'); assert.equal(alternative.version.match, 'exact');
  assert.deepEqual(alternative.version.differences, []);
  assert.equal(alternative.performanceType, 'produced_dance_performance');
  assert.equal(alternative.selection.occasion, 'produced_performance');
  assert.equal(alternative.scorePolicy, 'view_only');
  assert.match(alternative.sameSongEvidence.note, /人工核看已确认.*完整演出及韩语原版/);
  assert.match(alternative.performerEvidence.note, /人工核看确认.*七名成员均参与/);
  assert.match(alternative.version.evidence.note, /人工确认/);
  assert.match(alternative.version.evidence.note, /不表示独立全片播放、逐句音轨比对或现场人声已核实/);
  assert.deepEqual(adoption.humanVerification, {exactVideoId: video, date: '2026-10-29', sevenMembersParticipate: true,
    completeBeginningAndEnding: true, koreanOriginalAudio: true, independentAgentPlayback: false});
  assert.equal(supplement.searchReview.publicNote, undefined); assert.equal(supplement.researchNote, undefined);
  assert.match(supplement.searchReview.limitations.join(' '), /没有独立全片播放或逐句音轨比对/);
  for (const key of ['scoreBinding', 'memberIds', 'performerNames', 'durationSeconds', 'clip']) assert.equal(key in alternative, false, key);
  const stage = stageForWork(id);
  assert.deepEqual(stage, formal.stageVideos.afterRow);
  assert.equal(stage.completeness, 'full'); assert.equal(stage.selection.occasion, 'produced_performance');
  assert.equal(stageSourceKey(stage), video); assert.equal(stageHasValidBinding(stage), true);
  assert.deepEqual(stage.scoreBinding, {videoId: video, sourceKey: video, initializedAt: formal.ownerPreimage.capturedAt, initialScore: null});
  assert.equal(stage.reusesOriginalVideo, false); assert.deepEqual(stage.previousSources, []);
  assert.equal(stage.clip, undefined); assert.equal(stage.scorePolicy, undefined);
  assert.equal(stageHasValidBinding({...stage, scoreBinding: {...stage.scoreBinding, initialScore: 0}}), false);
  assert.equal(stageHasValidBinding({...stage, scoreBinding: {...stage.scoreBinding, sourceKey: 'xBrrdxtyWHw'}}), false);
  assert.equal(formal.ownerPreimage.targetStageScoreEmpty, true); assert.equal(formal.ownerPreimage.targetSaveRows, 0);
  assert.equal(formal.ownerPreimage.journalRows, 206); assert.equal(formal.ownerPreimage.publishedTargetSourceAbsent, true);
  assert.equal(formal.ownerPreimage.all496PublishedSourcesMatchLocal, true);
  const age = Date.parse(formal.stageStatuses.afterUpdatedAt) - Date.parse(stage.scoreBinding.initializedAt);
  assert.ok(age >= 0 && age <= 15 * 60 * 1000, 'merge is inside the fresh owner-export window');
  assert.equal(formal.newLocalBindings, 1); assert.equal(formal.existingStageBindingsChanged, 0);
  assert.equal(formal.privateWrites, 0); assert.equal(formal.deployment, 0);
  const metadata = require('../../../docs/codex/evidence/20261029-heygabby-complete/youtube-public-metadata.json');
  assert.equal(metadata.videoDetails.videoId, video); assert.equal(metadata.httpStatus, 200);
  assert.equal(stage.likes.value, 38873); assert.equal(stage.likes.precision, 'exact');
  assert.ok(metadata.likeRelatedLabels.some(label => label.text === 'like this video along with 38,873 other people'));
  assert.equal(stageSourceKey({...alternative, videoId: video}), null);
  assert.equal(stageHasValidBinding({...alternative, videoId: video}), false);
});

test('strict formal then viewing preimages preserve the original 496 sources, every other work and historical bytes', () => {
  const text = fs.readFileSync(path.join(app, 'data/stages/supplements.json'), 'utf8');
  const restoredBytes = beforeHeyGabbyViewingBytes(text), snapshot = structuredClone(data);
  assert.deepEqual(beforeHeyGabbyViewing(data), JSON.parse(restoredBytes)); assert.deepEqual(data, snapshot);
  assert.equal(sha(restoredBytes), '6085ec68c7a4223a45fd9f571375a773f01e5c77876cb0f0821cf17ac34614c2');
  assert.equal(sha(fs.readFileSync(path.join(app, 'data/ui/alternative-notes.json'))), adoption.viewingNote.afterFileSha256);
  const oldNotes = beforeHeyGabbyViewingNotes(notes);
  assert.equal(oldNotes[id], undefined);
  assert.equal(sha(JSON.stringify(oldNotes, null, 2) + '\n'), '9d3878feb57124271036fc60dc179250a4410ee4c6510a965df73b7a77b2ffbd');
  const previous = require('../../../docs/codex/evidence/20261029-group-followup/heygabby-review-update.json');
  for (const [file, proof] of Object.entries(previous.preservation.protectedFiles)) {
    assert.equal(sha(beforeHeyGabbyFormalBytes(file, fs.readFileSync(path.join(app, file)))), proof.afterSha256, file);
  }
  for (const [key, restore] of [['stageVideos', beforeHeyGabbyFormalStages], ['stageStatuses', beforeHeyGabbyFormalStatuses], ['poster', beforeHeyGabbyFormalPosters]]) {
    const proof = formal[key], file = path.resolve(app, '../..', proof.path), raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const current=['stageVideos','stageStatuses'].includes(key)?require('./helpers/password-formal-baseline.cjs').beforePassword(key,raw):raw;
    assert.equal(sha(JSON.stringify(current,null,2)+'\n'), proof.afterFileSha256);
    const old = restore(current);
    assert.equal(sha(JSON.stringify(old, null, 2) + '\n'), proof.beforeFileSha256);
    if (key === 'stageVideos') {
      assert.equal(Object.keys(current).length, 497); assert.equal(Object.keys(old).length, 496); assert.equal(old[id], undefined);
      for (const oldId of Object.keys(old)) assert.deepEqual(current[oldId], old[oldId], oldId);
      const changed = structuredClone(current); changed[Object.keys(old)[0]].title += ' unreviewed';
      assert.throws(() => restore(changed), /complete current formal stageVideos object/);
    }
  }
  assert.equal(adoption.stageBindingsChanged, 0); assert.equal(adoption.memberRelationsChanged, 0);
  assert.equal(adoption.frozenQueueChanged, false); assert.equal(adoption.appSourceOrAuthChanged, false);
  const wrongTarget = structuredClone(data); wrongTarget.works[id].alternatives[0].version.match = 'unconfirmed';
  assert.throws(() => beforeHeyGabbyViewing(wrongTarget), /complete current Hey Gabby formal supplementsUpdate row/);
  const otherWork = structuredClone(data); otherWork.works.rec28ldfRTrNsK.watchLeads[0].leadTimeSeconds++;
  assert.throws(() => beforeHeyGabbyViewing(otherWork), /all other supplements and metadata preserved/);
});

test('actual anonymous stage media SSR shows one formal player, its scope note and no duplicate or stale candidate card', () => {
  const source = fs.readFileSync(path.join(app, 'app/page.tsx'), 'utf8');
  const start = source.indexOf('function StageSupplements('), end = source.indexOf('function PageTitle(', start);
  const code = ts.transpileModule('export ' + source.slice(start, end), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React,
  }}).outputText;
  const player = {};
  const playerCode = ts.transpileModule(fs.readFileSync(path.join(app, 'components/work-video-player.tsx'), 'utf8'), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  }}).outputText;
  new Function('exports', 'require', playerCode)(player, require);
  const tree = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const detail = tree.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'WorkDetail');
  const regions = new Map();
  function collect(node) {
    if (ts.isJsxElement(node)) {
      const attribute = node.openingElement.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === 'className');
      const value = attribute?.initializer?.getText(tree);
      for (const name of ['video-stage', 'video-caption', 'stage-source']) {
        if (value === '"' + name + '"' || (name === 'video-stage' && value?.startsWith("{'video-stage '"))) regions.set(name, node.getText(tree));
      }
    }
    ts.forEachChild(node, collect);
  }
  collect(detail); assert.equal(regions.size, 3, 'real WorkDetail media and source regions');
  const regionCode = ts.transpileModule(`export function StageMedia({work}) {
    const view='stage',activePlatform='youtube',activePlatformLabel='YouTube',stage=work.stage,stageBound=stageHasValidBinding(stage),activeUrl=stageWatchUrl(stage),
      vid=videoId(activeUrl),title=stage.title,approvedPoster=approvedVideoPoster(work.id,vid,view),loonaButterfly=false,triplesMedia=null;
    return <>${[...regions.values()].join('\n')}<StageSupplements work={work}/></>;
  }`, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React}}).outputText;
  const component = {};
  vm.runInNewContext(`(function(exports){${code}})`, {React, ArrowUpRight: () => null,
    platformLabel: {youtube: 'YouTube'}, ...stageSource, validStageResearchNote, formatStageTime, ...copy})(component);
  vm.runInNewContext(`(function(exports){${regionCode}})`, {React, ArrowUpRight: () => null,
    ...stageSource, ...load('lib/idol/values.ts'), ...load('lib/idol/stage-display.ts'),
    approvedVideoPoster, WorkVideoPlayer: player.WorkVideoPlayer, StageSupplements: component.StageSupplements})(component);
  const catalog = {mode: 'live', groups: [], members: [], ratings: [], counts: {}, works: [{
    id, stage: stageForWork(id), stageScore: null, score: 0, note: 'PRIVATE_SYNTHETIC_NOTE', stageSupplement: supplement,
  }]};
  const snapshot = structuredClone(catalog), publicWork = projectPublicCatalog(catalog).works[0];
  const html = renderToStaticMarkup(React.createElement(component.StageMedia, {work: publicWork}));
  assert.equal((html.match(/class="video-play"/g) || []).length, 1);
  assert.match(html, /播放舞台视频/); assert.match(html, /人工看片已确认七名成员参与、完整演出及韩语原版/);
  assert.match(html, /未独立全片播放或逐句音轨比对/); assert.match(html, /官方专门制作表演，不代表现场人声/);
  assert.match(html, /class="stage-version-note"/);
  assert.ok(html.includes(`src="${formal.poster.addedEntry.src}"`));
  assert.ok(html.includes(`href="https://www.youtube.com/watch?v=${video}" target="_blank" rel="noopener noreferrer"`));
  assert.doesNotMatch(html, /其他观看选择|同曲现场表演|待核说明与来源|首尾是否完整|语言和音轨是否|<iframe|<input|<form|PRIVATE_SYNTHETIC_NOTE|AUTH_REQUIRED/);
  assert.equal(renderToStaticMarkup(React.createElement(component.StageSupplements, {work: publicWork})), '');
  assert.equal(publicWork.stage.videoId, video); assert.equal(stageMatches(publicWork, 'ready'), true);
  assert.equal(stageMatches(publicWork, 'alternative'), false);
  assert.equal(publicWork.stageScore, null); assert.equal(publicWork.score, 0);
  assert.equal(publicWork.stageSupplement.searchReview, undefined); assert.equal(publicWork.stageSupplement.researchNote, undefined);
  assert.deepEqual(catalog.ratings, []); assert.deepEqual(catalog, snapshot);
});

test('the new original poster matches only the precise stage tuple and cannot replace either original MV', () => {
  const poster = formal.poster.addedEntry, bytes = fs.readFileSync(path.join(app, 'public', poster.src));
  assert.equal(bytes.length, 100393); assert.equal(bytes.length, poster.byteLength);
  assert.equal(sha(bytes), '3eac19e90779c972f003a8ae8a159382cead34c7deafe68bf8de7b38b9d3d6ad');
  assert.equal(sha(bytes), poster.sha256); assert.equal(poster.originalBytesPreserved, true); assert.equal(formal.poster.reencoded, false);
  assert.deepEqual(poster.intrinsicSize, {width: 1280, height: 720});
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  let size;
  for (let offset = 2; offset < bytes.length;) {
    assert.equal(bytes[offset++], 0xff); const marker = bytes[offset++], length = bytes.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {size = {height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5)}; break;}
    offset += length;
  }
  assert.deepEqual(size, poster.intrinsicSize);
  const selected = approvedVideoPoster(id, video, 'stage');
  assert.equal(selected.src, poster.src); assert.equal(selected.fit, 'contain'); assert.deepEqual(selected.intrinsicSize, size);
  assert.equal(approvedVideoPoster('recWrongWork', video, 'stage'), null);
  assert.equal(approvedVideoPoster(id, video, 'mv'), null);
  for (const original of ['xBrrdxtyWHw', 'z7lv-qLQI3M']) {
    assert.equal(approvedVideoPoster(id, original, 'stage'), null);
    assert.notEqual(approvedVideoPoster(id, original, 'mv')?.src, poster.src);
  }
});
