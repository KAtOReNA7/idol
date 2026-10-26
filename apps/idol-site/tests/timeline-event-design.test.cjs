'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const baseline=require('./fixtures/timeline/synthetic-baseline.json'),registry=require('./fixtures/timeline/synthetic-registry.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-event-design-')),output=path.join(dir,'component.cjs');
esbuild.buildSync({entryPoints:[path.join(__dirname,'../components/artist-timeline.tsx')],bundle:true,outfile:output,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'});
const {ArtistTimeline}=require(output),context={...registry,members:[...registry.members,{id:'recSyntheticMemberTwo',groupIds:[baseline.groupId]}]};
const render=input=>renderToStaticMarkup(React.createElement(ArtistTimeline,{input,context,onMember(){},onWork(){},memberLabels:{recSyntheticMember:'成员中文名',recSyntheticMemberTwo:'另一成员'},workLabels:{recSyntheticWork:'作品名称'}}));
test.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
const expected={debut:'debut',release:'release',member_join:'people',member_departure:'people',hiatus:'people',resume:'people',agency_change:'organization',rename:'organization',disband:'organization',notice:'ordinary',other:'ordinary'};
test('event types have distinct non-interactive visual markers on the same chronological axis',()=>{
 const input=structuredClone(baseline);input.events=Object.keys(expected).map((eventType,i)=>({...structuredClone(baseline.events[0]),id:'visual-'+eventType,eventType,title:'原事件正文 '+eventType,eventDate:{value:'2024-03-'+String(i+1).padStart(2,'0'),precision:'day'}}));
 const before=JSON.stringify(input),html=render(input);
 assert.equal((html.match(/class="at-list"/g)||[]).length,1);assert.equal((html.match(/data-timeline-event-id=/g)||[]).length,input.events.length);
 for(const [type,visual] of Object.entries(expected))assert.match(html,new RegExp(`data-timeline-event-type="${type}" data-timeline-visual="${visual}"`));
 assert.equal((html.match(/class="at-node at-node--[^"]+" aria-hidden="true"/g)||[]).length,input.events.length);
 assert.equal((html.match(/<svg viewBox="0 0 24 24" focusable="false"/g)||[]).length,input.events.length-2);
 assert.deepEqual([...html.matchAll(/data-timeline-event-id="([^"]+)"/g)].map(m=>m[1]),input.events.map(e=>e.id));
 assert.deepEqual([...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(m=>m[1]),input.events.map(e=>e.title));
 assert.deepEqual([...html.matchAll(/<time dateTime="([^"]+)"/g)].map(m=>m[1]),input.events.map(e=>e.eventDate.value));
 assert.equal((html.match(/data-timeline-target-id="recSyntheticMember"/g)||[]).length,input.events.length);
 assert.equal((html.match(/data-timeline-target-id="recSyntheticWork"/g)||[]).length,input.events.length);
 assert.equal((html.match(/>成员中文名<\/button>/g)||[]).length,input.events.length);assert.equal((html.match(/>作品名称<\/button>/g)||[]).length,input.events.length);
 assert.doesNotMatch(html,/aria-pressed|at-filters|at-badges|<details|来源与核验/);assert.equal(JSON.stringify(input),before);
});
test('single-person contracts use the person visual without changing their contract semantics',()=>{
 for(const ids of [['recSyntheticMember'],['recSyntheticMember','recSyntheticMemberTwo'],[]]){
  const input=structuredClone(baseline);input.events[0]={...input.events[0],eventType:'contract_end',title:'原合约事项',memberIds:ids};
  const html=render(input);assert.match(html,new RegExp(`data-timeline-event-type="contract_end" data-timeline-visual="${ids.length===1?'people':'organization'}"`));
  assert.match(html,/<span class="at-event-kind">合约变动<\/span>/);assert.match(html,/>原合约事项<\/h3>/);assert.doesNotMatch(html,/>成员退出</);
 }
});
test('visual hierarchy uses theme accents and shapes, never new cards or visible category badges',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../components/artist-timeline.css'),'utf8');
 assert.match(css,/\.at-node svg \{[^}]*stroke: currentColor/);
 assert.match(css,/data-timeline-visual="debut"[^}]+font-weight: 700/);
 assert.match(css,/data-timeline-visual="debut"[^}]+h3::after[^}]+width: 36px[^}]+background: var\(--at-accent\)/);
 assert.match(css,/data-timeline-visual="people"[^}]+border-inline-start: 2px solid var\(--at-accent\)/);
 assert.match(css,/\.at-event-kind \{[^}]+clip-path: inset\(50%\)/);
 assert.match(css,/\.at-node \{[^}]+pointer-events: none/);
 assert.match(css,/\.at-event \{[^}]+border: 0; background: transparent/);
 assert.doesNotMatch(css,/\.at-node[^}]+background:\s*#[0-9a-f]/i);
});
