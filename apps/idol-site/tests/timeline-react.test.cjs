'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),fs=require('node:fs'),esbuild=require('esbuild'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const baseline=require('./fixtures/timeline/synthetic-baseline.json'),context=require('./fixtures/timeline/synthetic-registry.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-react-')),output=path.join(dir,'component.cjs');
esbuild.buildSync({entryPoints:[path.join(__dirname,'../components/artist-timeline.tsx')],bundle:true,outfile:output,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'});
const {ArtistTimeline}=require(output);
const render=props=>renderToStaticMarkup(React.createElement(ArtistTimeline,{input:baseline,context,...props}));
test.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
test('real React displays one concise axis without controls, audit details, count or legacy background',()=>{
 const html=render({background:React.createElement('p',null,'OLD_BACKGROUND')});
 assert.match(html,/大事时间轴/);assert.match(html,/<time dateTime="2024-02-29">/);
 assert.equal((html.match(/class="at-list"/g)||[]).length,1);
 assert.doesNotMatch(html,/发生／生效|原文发布|资料核验|at-sources|aria-pressed|at-filters|at-badges|OLD_BACKGROUND|<details/);
});
test('held assertions and sources never enter the concise read-only display',()=>{
 const input=structuredClone(baseline);input.events.push({...structuredClone(input.events[0]),id:'held',title:'HIDDEN_TITLE',summary:'HIDDEN_SUMMARY',sources:[{...input.events[0].sources[0],title:'HIDDEN_SOURCE'}],reviewStatus:'hold',holdReasons:['needs evidence']});
 const html=render({input});assert.doesNotMatch(html,/HIDDEN_TITLE|HIDDEN_SUMMARY|HIDDEN_SOURCE|条待核资料/);
});
test('real React distinguishes empty, invalid, loading and error states without audit UI',()=>{
 assert.match(render({input:{...baseline,events:[]}}),/事件正在整理/);assert.match(render({input:{}}),/时间轴暂时无法显示/);
 assert.match(render({loading:true}),/正在读取时间轴/);assert.match(render({error:'SYNTHETIC_READ_FAILURE'}),/SYNTHETIC_READ_FAILURE/);
});
test('partial dates retain their actual precision and arbitrary event ids retain safe heading associations',()=>{
 const input=structuredClone(baseline);input.events[0].id='arbitrary id / \ud800';input.events[0].eventDate={value:'2024',precision:'year'};
 const html=render({input});assert.match(html,/>2024 年</);assert.doesNotMatch(html,/dateTime="2024-01-01"|dateTime="2024"/);
 const heading=html.match(/<h3 id="([^"]+)"/)[1];assert.doesNotMatch(heading,/\s/);assert.ok(html.includes(`aria-labelledby="${heading}"`));
});
test('legacy props cannot revive filtering, reverse order, supporting-event hiding or nested release groups',()=>{
 const input=structuredClone(baseline);const a=input.events[0];input.events=[{...a,id:'z-early-supporting',eventDate:{value:'2020-05',precision:'month'},importance:'supporting'},{...a,id:'a-later',eventDate:{value:'2024-02-29',precision:'day'}}];
 const html=render({input,filters:{type:'organization',importance:'major',order:'recent'},initialFilters:{type:'release',order:'recent'}});
 assert.deepEqual([...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]),['z-early-supporting','a-later']);assert.doesNotMatch(html,/aria-pressed|<details/);
});
test('the concise date/title pair keeps announcements, plans and postponements explicit',()=>{
 const a=structuredClone(baseline.events[0]);
 const input={...baseline,events:[
  {...a,id:'notice',title:'新作品发行',status:'announced',eventDate:null,announcementDate:{value:'2024-01-10',precision:'day'},plannedDate:{value:'2024-05-20',precision:'day'}},
  {...a,id:'plan',title:'日本出道',status:'planned',eventDate:null,announcementDate:{value:'2024-02-10',precision:'day'},plannedDate:{value:'2024-06-20',precision:'day'}},
  {...a,id:'postponed',title:'演出',status:'postponed',eventDate:null,announcementDate:{value:'2024-03-10',precision:'day'},plannedDate:{value:'2024-04-20',precision:'day'}},
  {...a,id:'unknown',title:'日期未知事件',eventDate:null,announcementDate:null,plannedDate:null},
 ]};
 const html=render({input});
 assert.deepEqual([...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]),['notice','postponed','plan','unknown']);
 assert.match(html,/dateTime="2024-01-10"/);assert.match(html,/宣布：新作品发行/);
 assert.match(html,/dateTime="2024-03-10"/);assert.match(html,/已延期：演出/);
 assert.match(html,/dateTime="2024-06-20"/);assert.match(html,/计划：日本出道/);
 assert.match(html,/日期待确认/);assert.doesNotMatch(html,/dateTime="2024-02-20"|dateTime="2024-04-20"|dateTime="2024-05-20"/);
});
test('only book-title brackets receive the CJK font, preserving heading text, escaping and association',()=>{
 const cases=[
  ['中文 《JEWELRY》 & <Latin> “其他”「标点」', 'confirmed', 'punctuation', '中文 《JEWELRY》 & <Latin> “其他”「标点」'],
  ['《A》《B》', 'confirmed', 'adjacent', '《A》《B》'],
  ['JEWELRY》', 'confirmed', 'closing-only', 'JEWELRY》'],
  ['《CRAZY》数字发行', 'confirmed', 'e-lesserafim-crazy', '《CRAZY》发行'],
  ['《作品》发行', 'planned', 'planned-brackets', '计划：《作品》发行'],
  ['《作品》演出', 'cancelled', 'cancelled-brackets', '已取消：《作品》演出'],
  ['《作品》演出', 'postponed', 'postponed-brackets', '已延期：《作品》演出'],
  ['无书名号 Latin & <text>「保留」', 'confirmed', 'plain', '无书名号 Latin & <text>「保留」'],
 ];
 for(const [title,status,id,expected] of cases){
  const input=structuredClone(baseline);input.events=[{...input.events[0],id,title,status,...(status==='planned'?{eventDate:null,plannedDate:{value:'2027-01-01',precision:'day'}}:{})}];
  const before=JSON.stringify(input),html=render({input}),heading=html.match(/<h3 id="([^"]+)">(.*?)<\/h3>/);
  assert.ok(heading,id);assert.ok(html.includes(`aria-labelledby="${heading[1]}"`));
  const spans=[...heading[2].matchAll(/<span class="at-title-punctuation">([^<]*)<\/span>/g)];
  assert.deepEqual(spans.map(match=>match[1]),expected.match(/[《》]/gu)||[]);
  const unwrapped=heading[2].replace(/<span class="at-title-punctuation">([《》])<\/span>/g,'$1');
  assert.equal(unwrapped,renderToStaticMarkup(expected),id);
  assert.doesNotMatch(heading[2],/aria-hidden|role=|<script|<Latin>|<text>/);
  if(!/[《》]/u.test(title))assert.doesNotMatch(heading[2],/<span/);
  assert.equal(JSON.stringify(input),before);
 }
});
test('punctuation font rule is inline and leaves group heading typography unchanged',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../components/artist-timeline.css'),'utf8');
 const rule=css.match(/\.artist-timeline \.at-event h3 \.at-title-punctuation \{([^}]+)\}/);
 assert.ok(rule);
 assert.match(rule[1],/font-family: "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif;/);
 assert.equal(rule[1].trim().split(';').filter(Boolean).length,1);
 assert.match(css,/\.artist-timeline \.at-event h3 \{[^}]*font-family: inherit;/);
});
