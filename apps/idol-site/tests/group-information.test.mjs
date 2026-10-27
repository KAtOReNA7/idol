import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/idol/group-information.mjs'],bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
const {followersInWan,renderGroupInformation,groupInformationModel}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('EVERGLOW new Instagram count retains its historical date and account identity',()=>{
 const evidence=JSON.parse(fs.readFileSync('data/group-statistics-completion-evidence.json','utf8'));
 const row=evidence.groups.everglow.social.find(a=>a.platform==='instagram');
 assert.equal(row.url,'https://www.instagram.com/everglow.offcl/');assert.equal(row.observedValue,86501);assert.equal(row.observedAt,'2026-05-30');assert.equal(row.checkedAt,'2026-10-27');
 const html=renderGroupInformation('everglow',{});assert.match(html,/>9万</);assert.match(html,/2026-05-30/);assert.match(html,/非实时/);assert.doesNotMatch(html,/2,400,599/);
 const accounts=Object.values(evidence.groups).flatMap(g=>g.social);assert.equal(accounts.filter(a=>a.observedValue===null).length,5);assert.equal(evidence.summary.socialFallbackZero,5);
 assert.equal(Object.values(evidence.groups).filter(g=>g.sales.observedValue===null).length,9);assert.equal(Object.values(evidence.groups).filter(g=>g.wins.observedValue===null).length,3);
});
test('follower counts round display only and preserve integer counts below ten thousand',()=>{for(const [input,expected]of [['约587.1万粉丝','587万'],['约492.3K Followers','49万'],['8.1M followers','810万'],['72.6万位订阅者','73万'],['12,345 followers','1万'],['0 subscribers','0人'],['1.2亿','12000万']])assert.equal(followersInWan(input),expected);for(const x of [null,'未知','100 or 200','负数 -1','1M views'])assert.equal(followersInWan(x),null);});
test('undated accounts cannot show a count and renamed accounts remain identified',()=>{const group={social:[{platform:'youtube',url:'https://www.youtube.com/@GIRLSET',subjectName:'GIRLSET',countLabel:'100万',observedAt:null}]};const html=renderGroupInformation('fixture',group);assert.match(html,/GIRLSET/);assert.doesNotMatch(html,/100万/);assert.match(html,/>0人</);assert.match(html,/不是已确认的零/);});
test('rendered account text and links cannot inject markup or executable schemes',()=>{const group={social:[{platform:'instagram',url:'https://www.instagram.com/example/',subjectName:'<img src=x onerror=alert(1)>',countLabel:'1M followers',observedAt:'2026-10-09'},{platform:'x',url:'javascript:alert(1)',countLabel:'10M',observedAt:'2026-10-09'}]};const html=renderGroupInformation('fixture',group);assert.match(html,/100万/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img|javascript:|1000万/);});
test('all group metrics have explicit scope, sources and conflict handling',()=>{const facts=JSON.parse(fs.readFileSync('data/group-information-facts.json','utf8')),groups=JSON.parse(fs.readFileSync('data/music-index-artwork.json','utf8'));assert.equal(Object.keys(facts).length,groups.length);for(const g of groups)for(const kind of ['sales','wins']){const row=facts[g.slug][kind];assert.ok(row.scope);if(row.value!==null){assert.ok(Number.isSafeInteger(row.value)&&row.value>=0);assert.match(row.sourceUrl,/^https:\/\//);assert.notEqual(row.status,'conflicting');}if(row.status==='conflicting')assert.equal(row.value,null);}});
test('public metrics do not mutate catalog records or copy private fields',()=>{const group={note:'private-canary',average:9,social:[{platform:'x',url:'https://x.com/test',subjectName:'test',countLabel:'12K Followers',observedAt:'2026-10-09'}]},before=JSON.stringify(group);const model=groupInformationModel('meovv',group);assert.equal(JSON.stringify(group),before);assert.ok(!JSON.stringify(model).includes('private-canary'));assert.ok(!renderGroupInformation('fixture',group).includes('private-canary'));});

 test('all 51 completion rows render only verified accounts and keep unavailable zero distinct',()=>{
 const evidence=JSON.parse(fs.readFileSync('data/group-statistics-completion-evidence.json','utf8'));assert.equal(Object.keys(evidence.groups).length,51);
 for(const [slug,g]of Object.entries(evidence.groups)){const model=groupInformationModel(slug,{}),html=renderGroupInformation(slug,{});assert.equal(model.accounts.length,g.social.filter(a=>a.accountExists===true&&(a.platform!=='x'||a.observedValue>0)).length);assert.equal((html.match(/class="group-info-stat"/g)||[]).length,model.accounts.length+2);for(const a of model.accounts){assert.equal(a.accountExists,true);assert.match(a.value,/^[0-9]+(?:万|人)$/);if(a.observedValue===null){assert.equal(a.value,'0人');assert.equal(a.fallbackZero,true);}else{assert(a.observedAt);assert(a.sourceUrl);}}
 for(const k of ['sales','wins']){const v=g[k];assert(v.scope);if(v.status==='unavailable'){assert.equal(v.observedValue,null);assert.equal(v.displayValue,0);}if(v.observedValue!==null)assert(v.sources.length>0);}
 assert.doesNotMatch(html,/>约|>待核实</);
 }
 });

test('zero or unknown X is omitted without hiding small positive audiences',()=>{
 const account={platform:'x',url:'https://x.com/fixture',observedAt:'2026-10-26'};
 for(const label of ['0','0万',null]){const group={social:[{...account,countLabel:label}]};assert.equal(groupInformationModel('fixture',group).accounts.length,0);assert.doesNotMatch(renderGroupInformation('fixture',group),/https:\/\/x.com/);}
 assert.equal(groupInformationModel('fixture',{social:[{...account,countLabel:'6800'}]}).accounts[0].value,'6800人');
 assert.equal(followersInWan('12.7万'),'13万');assert.equal(followersInWan('9999'),'9999人');assert.equal(followersInWan('10000'),'1万');
});
