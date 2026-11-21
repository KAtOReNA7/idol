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
const {renderArtist, artistCatalog, nativeSlugs} = require('./fixtures/current-artist-pages.cjs');
const customTimelines = new Set(['adya','bewave','candyshop','geenius','genblue','oddyouth','spia','tracer','witchx','wooah','youngposse']);
const customHome = new Set([...customTimelines,'loona','unis']);

for (const artist of registry) {
 for (const section of ['overview','updates']) {
  test(`actual ${artist.path} ${section} exposes its published timeline entry`, async () => {
   const document = require(`../data/artist-timelines/${artist.slug}.json`);
   assert.equal(document.groupId, artist.groupId);
   const html = await renderArtist(artist, section === 'updates' ? {section} : {}, artistCatalog(artist), {
    groups: registry, input: document, timelineLoading: false, styleReady: true,
   });
   if (nativeSlugs.has(artist.slug)) {
    assert.ok(html.includes(`data-${artist.slug}-native-host="true"`));
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /data-timeline-host=/);
    return;
   }
   assert.doesNotMatch(html, /时间轴暂时无法显示|时间轴资料与当前团体不匹配|NEVER_RENDER_HELD_ASSERTION/);
   assert.doesNotMatch(html, /at-background|来源与背景资料/);
   for (const match of html.matchAll(/data-timeline-host="([^"]+)"/g)) assert.equal(match[1], artist.groupId);
   const ownHost = html.includes(`data-timeline-host="${artist.groupId}"`);
   if (section === 'overview' && customHome.has(artist.slug) && !ownHost) {
    assert.match(html, /section=updates|时间轴/);
    return;
   }
   if (section === 'updates' && customTimelines.has(artist.slug)) {
    assert.match(html, /<ol\b[^>]*>[\s\S]*?<li\b/, 'editorial timeline must contain actual entries');
   } else {
    assert.ok(ownHost, 'expected a timeline belonging to this group');
    // Reported announcements can share the subject ID with a held effective date.
    // Only canonical event articles assert the event on the chronological axis.
    const visible = [...html.matchAll(/<article\b[^>]*data-timeline-event-id="([^"]+)"/g)].map(match => match[1]);
    const reviewed = new Set(document.events.filter(event => event.reviewStatus === 'ready').map(event => event.id));
    if (reviewed.size) assert.ok(visible.some(id => reviewed.has(id)), 'missing reviewed events');
    for (const event of document.events.filter(row => row.reviewStatus === 'hold')) assert.ok(!visible.includes(event.id));
    if (!reviewed.size) assert.match(html, /暂无时间轴事件。/);
   }
  });
 }
}
test('51 SSR host matrix uses actual routes/components/hooks and only enumerated fixture substitutions',()=>{
 assert.equal(registry.length,51);
 assert.equal(Object.keys(bundle.routes).length,51);
 const inputs=proof.inputs.join('\n');
 for(const artist of registry)assert.ok(inputs.includes(`app/artists/${artist.slug}/page.tsx`),artist.slug);
 for(const source of ['components/artist-timeline.tsx','components/artist-timeline-host.tsx','components/seven-redesign/artist.tsx','components/use-artist-scroll.ts','components/use-member-work-focus.ts','components/use-artist-roster-return.ts'])assert.ok(inputs.includes(source),source);
 for(const item of proof.aliases)assert.ok(path.relative(path.join(__dirname,'fixtures/timeline-host'), item.replacement).split(path.sep)[0] !== '..');
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
 assert.match(html,/暂无时间轴事件。/);assert.doesNotMatch(html,/NEVER_RENDER_HELD_ASSERTION/);
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

test('career facts compile against the synthetic runtime projection', () => {
 for (const input of ['components/member-career-facts.tsx','lib/idol/member-career-runtime.ts','lib/idol/member-career-core.ts','editorial-fixture:runtime/member-careers/periods.json']) assert.ok(proof.inputs.includes(input), input);
 assert.ok(!proof.inputs.includes('data/runtime/member-careers/periods.json'));
});
