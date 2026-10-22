import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {artist,render} from '../lib/idol/design-review/sol15-runtime/groups/udtt/index.js';
import {helpers} from '../lib/idol/design-review/sol15-runtime/model.mjs';
const replacements=[['从一首歌，开始认识她们。','成员 · 作品 · 时间轴'],['下课后，继续播放。','发行与影像'],['名字、声音，以及每个人的故事。','UDTT 成员资料'],['听一张唱片，看一段影像。','发行 · MV · 舞台'],['从最初开始，慢慢往后读。','发行与团体事件'],['成员 · 作品 · 那些值得重看的瞬间','成员 · 作品 · 时间轴']];
const route=(page,key=null)=>({slug:'udtt',page,key,query:new URLSearchParams()});
test('original Sol source retained; six-substitution neutral baseline retained before the public display projection',()=>{
 const original=fs.readFileSync(new URL('../evidence/sol15/udtt/index.js',import.meta.url));
 assert.equal(createHash('sha256').update(original).digest('hex'),'cabd20c0c9ae254c0571992e4037a49bc5aaaa1e9fd13e38d89c4ba360205761');
 let expected=original.toString();for(const [before,after] of replacements){assert.equal(expected.split(before).length-1,1);expected=expected.replace(before,after);}
 assert.equal(fs.readFileSync(new URL('../evidence/sol15/udtt/pre-public-copy-index.js',import.meta.url),'utf8'),expected);
});
for(const item of [...['home','members','works','timeline'].map(page=>route(page)),...artist.members.map(member=>route('member',member.id)),...artist.works.map(work=>route('work',helpers.entityKey(work)))])test(`UDTT ${item.page}${item.key?': '+item.key:''} contains no unsupported creative tagline`,()=>{
 const html=render({route:item,helpers});for(const [before] of replacements)assert.equal(html.includes(before),false,before);
 assert.ok(html.includes('成员 · 作品 · 时间轴'));
 if(item.page==='members')assert.ok(html.includes('UDTT 成员资料'));
 if(item.page==='works')assert.ok(html.includes('发行 · MV · 舞台'));
 if(item.page==='timeline')assert.ok(html.includes('发行与团体事件'));
});
