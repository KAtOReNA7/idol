'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const registry=require('../HANDOFF/artist-registry51.json');
const {buildFixture}=require('./fixtures/timeline-host/build.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-host-matrix-'));
let bundle,proof;
function deepFreeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(deepFreeze);}return value;}
test.before(async()=>{
 const output=path.join(temp,'matrix.cjs');
 proof=await buildFixture({output});
 bundle=require(output);
 deepFreeze(bundle.publicCatalog);
 deepFreeze(bundle.syntheticCatalog);
 deepFreeze(bundle.syntheticTimelines);
});
test.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
for(const artist of registry){
 for(const selectedSection of ['overview','updates']){
 test(`actual ${artist.path} ${selectedSection} SSR renders migrated navigation and shared empty host`,()=>{
  const Page=bundle.routes[artist.slug];
  assert.equal(typeof Page,'function');
  const input={schemaVersion:1,groupId:artist.groupId,slug:artist.slug,events:[],gaps:[]};
  const html=renderToStaticMarkup(React.createElement(bundle.ArtistTimelineHostProvider,{value:{catalog:bundle.publicCatalog,input,loading:false,styleReady:true,serverRoute:artist.path+(selectedSection==='updates'?'?section=updates':'')}},React.createElement(Page)));
  assert.match(html,/大事时间轴/);
  assert.match(html,/事件正在整理/,'real selected section must render the shared host after the injected read-only catalog is ready');
  assert.doesNotMatch(html,/at-background|来源与背景资料/,'audit background is not public timeline UI');
  assert.doesNotMatch(html,/>资料与动态<|>官方动态<|>官方发行<|>发行来信</);
  assert.doesNotMatch(html,/正在打开|NEVER_RENDER_HELD_ASSERTION|时间轴暂时无法显示/);
 });
 }
}
test('51 SSR host matrix uses actual routes/components/hooks and only enumerated fixture substitutions',()=>{
 assert.equal(registry.length,51);
 assert.equal(Object.keys(bundle.routes).length,51);
 const inputs=proof.inputs.join('\n');
 for(const artist of registry)assert.ok(inputs.includes(`app/artists/${artist.slug}/page.tsx`),artist.slug);
 for(const source of ['components/artist-timeline.tsx','components/artist-timeline-host.tsx','components/candidate-artist-experience.tsx','components/use-artist-scroll.ts','components/use-member-work-focus.ts','components/use-artist-roster-return.ts'])assert.ok(inputs.includes(source),source);
 for(const item of proof.aliases)assert.ok(item.replacement.includes('/tests/fixtures/timeline-host/'));
 assert.ok(proof.aliases.some(item=>item.original==='./journey'));
 assert.ok(proof.aliases.some(item=>item.original==='@/lib/idol/member-display-name'));
 assert.doesNotMatch(inputs,/data\/snapshot|app\/api\/|components\/use-browse-journey/);
});
function renderHost({input,catalog=bundle.syntheticCatalog,...options}={}){
 return renderToStaticMarkup(React.createElement(bundle.ArtistTimelineHostProvider,{value:{input:input??bundle.syntheticTimelines.recFixtureGroupA,groups:bundle.syntheticGroups,catalog,styleReady:true,navigate(){},...options}},React.createElement(bundle.ArtistTimelineHost,{groupId:'recFixtureGroupA',catalog})));
}
test('real shared host renders synthetic current/former identities, exact focus triples and held exclusion',()=>{
 const html=renderHost();
 assert.doesNotMatch(html,/历史关联（|成员档案|作品档案/);
 assert.match(html,/data-timeline-event-trigger="fixture-multi-target"/);
 assert.match(html,/data-timeline-target-kind="member"/);
 assert.match(html,/data-timeline-target-id="recFixtureFormerA"/);
 assert.match(html,/data-timeline-target-id="recFixtureWorkA2"/);
 assert.match(html,/>2024 年(?: 6 月)?</);assert.doesNotMatch(html,/2024-01-01/);
 assert.match(html,/已延期/);assert.match(html,/已取消/);
 assert.doesNotMatch(html,/NEVER_RENDER_HELD_ASSERTION/);
 assert.doesNotMatch(html,/条待核资料|已核事件.*条/);
});
test('missing catalog links do not erase reviewed assertions or report malformed schema',()=>{
 const catalog={...bundle.syntheticCatalog,members:bundle.syntheticCatalog.members.filter(member=>member.id!=='recFixtureFormerA'),works:bundle.syntheticCatalog.works.filter(work=>work.id!=='recFixtureWorkA2')};
 const html=renderHost({catalog});
 assert.doesNotMatch(html,/来源与核验|范围说明/);
 assert.match(html,/fixture-multi-target/);
 assert.doesNotMatch(html,/时间轴暂时无法显示|data-timeline-target-id="recFixtureFormerA"|data-timeline-target-id="recFixtureWorkA2"/);
});
test('real shared host separates load failure, reading, invalid and all-held states',()=>{
 assert.match(renderHost({loading:true}),/正在读取时间轴/);
 assert.match(renderHost({error:'FIXTURE_READ_ERROR'}),/FIXTURE_READ_ERROR/);
 assert.match(renderHost({input:{schemaVersion:99}}),/时间轴暂时无法显示/);
 const document=bundle.syntheticTimelines.recFixtureGroupA;
 const held={...document,events:document.events.filter(event=>event.reviewStatus==='hold')};
 const html=renderHost({input:held});
 assert.match(html,/事件正在整理/);assert.doesNotMatch(html,/NEVER_RENDER_HELD_ASSERTION/);
});

test('host readiness markers obey explicit style and blocked gates without changing wire facts',()=>{
 const pending=renderHost({styleReady:false});
 assert.match(pending,/data-timeline-style-ready="false"/);
 assert.match(pending,/data-timeline-ready="false"/);
 assert.match(pending,/fixture-multi-target/,'reviewed evidence remains readable while focus readiness waits');
 const blocked=renderHost({blocked:true});
 assert.match(blocked,/fixture-multi-target/);
 assert.doesNotMatch(blocked,/时间轴暂时无法显示/);
});

test('cross-group links stay noninteractive while reviewed title and evidence remain intact',()=>{
 const document=bundle.syntheticTimelines.recFixtureGroupA;
 const input={...document,events:[...document.events,{...document.events[0],id:'fixture-cross-group',title:'SYNTHETIC_CROSS_GROUP_ASSERTION',memberIds:['recFixtureMemberC'],workIds:['recFixtureWorkC']}]};
 const html=renderHost({input});
 assert.match(html,/SYNTHETIC_CROSS_GROUP_ASSERTION/);
 assert.doesNotMatch(html,/来源与核验|范围说明/);
 assert.doesNotMatch(html,/data-timeline-target-id="recFixtureMemberC"|data-timeline-target-id="recFixtureWorkC"|时间轴暂时无法显示/);
});

test('host rejects a supplied wire document for another group rather than displaying it under the wrong artist',()=>{
 const html=renderHost({input:bundle.syntheticTimelines.recFixtureGroupB});
 assert.doesNotMatch(html,/fixture-b-event/);
 assert.match(html,/时间轴资料与当前团体不匹配|时间轴暂时无法显示|当前团体/);
});
test('initial catalog failure takes precedence over missing-data loading and preserves retry',()=>{
 const html=renderHost({catalog:null,error:'INITIAL_LOAD_FAILED',onRetry(){}});
 assert.match(html,/INITIAL_LOAD_FAILED/);
 assert.match(html,/<button[^>]*>重新读取<\/button>/);
 assert.doesNotMatch(html,/正在读取时间轴/);
 assert.match(html,/role="alert"/);
});

test('career integration keeps the actual component and formatter with explicit synthetic metadata only',()=>{assert.ok(proof.inputs.includes('components/member-career-facts.tsx'));assert.ok(proof.inputs.includes('lib/idol/member-career-display.ts'));assert.ok(!proof.inputs.includes('data/member-careers/periods.json'));assert.ok(proof.aliases.some(a=>a.original==='@/data/member-careers/periods.json'&&a.replacement.endsWith('/content-aliases/career-periods.ts')));});
