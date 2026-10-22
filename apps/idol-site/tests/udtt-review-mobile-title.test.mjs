import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const css=fs.readFileSync(new URL('../public/design-review/sol15/udtt/styles.css',import.meta.url),'utf8');
const mobileTitle='[data-artist="udtt"] .ud-cover-copy h1{font-size:32vw;margin:0 0 20px}';

test('UDTT title change is exactly one mobile font-size token; only exact approved gap/portrait CSS differs',()=>{
 assert.equal(css.split(mobileTitle).length-1,1);
 assert.equal(createHash('sha256').update(css).digest('hex'),'5ec5362ba287dc9d81f8a2fd24ffeb49c5cfa0d5641a40b5235d2bbe0662a534');
 const baseline=css.slice(0,css.indexOf('\n/* Lu Yuting:')).replace('width:100%;height:auto;aspect-ratio:3/4','width:100%;aspect-ratio:3/4').replace('grid-template-columns:minmax(0,1fr);gap:28px;padding:6% 8%','grid-template-columns:1fr 1.6fr;gap:8%;padding:6% 8%').replace('font-weight:500;max-width:none;font-size:38px','font-weight:500;max-width:240px;font-size:38px').replace(mobileTitle,mobileTitle.replace('32vw','42vw'));
 assert.equal(createHash('sha256').update(baseline).digest('hex'),'06460f8b86f5e8d374fda3bce43bcd308b32e95f478cf959f5282009a91822c3');
});

test('mobile title rule follows the 900px rule and applies only within the existing 600px media query',()=>{
 const phone=css.indexOf('@media(max-width:600px)'),title=css.indexOf(mobileTitle),nextMedia=css.indexOf('@media(',phone+1);
 assert.ok(title>phone&&title<nextMedia);
 assert.ok(css.indexOf('.ud-cover-copy h1{font-size:19vw}')<phone);
 assert.match(css,/font-size:clamp\(110px,15vw,260px\)/);
 assert.deepEqual([...css.matchAll(/\.ud-cover-copy h1\{[^}]*font-size:([^;}]+)/g)].map(match=>match[1]),['clamp(110px,15vw,260px)','19vw','32vw']);
});

test('320px and 390px source-level title sizes have no fixed minimum; layout verification still requires a browser',()=>{
 const size=Number(mobileTitle.match(/font-size:(\d+)vw/)[1]);
 for(const [viewport,expected] of [[320,102.4],[390,124.8]])assert.equal(Number((viewport*size/100).toFixed(1)),expected);
 assert.ok(css.includes('.ud-opening{display:flex;flex-direction:column;align-items:stretch;padding:40px 6% 0;gap:32px}'));
});

// Source-level CSS coverage; visual broken-image suppression still needs a real browser.
test('UDTT waiting CSS targets only queued/loading/decoding IMG; loaded restores opacity and failed/cancel retain semantics',()=>{
 const rule=css.slice(css.indexOf('/* UDTT private IMG waiting state:'));
 const states=[...rule.matchAll(/img\[data-private-image-state="([^"]+)"\]/g)].map(m=>m[1]);
 assert.deepEqual(states,['not-triggered','loading','decoding','loaded']);
 assert.equal((rule.match(/\[data-artist="udtt"\] img/g)||[]).length,4);
 assert.match(rule,/decoding"\]\{opacity:0\}/);assert.match(rule,/loaded"\]\{opacity:1\}/);
 assert.doesNotMatch(rule.slice(rule.indexOf('*/')+2),/display:|visibility:|alt|failed"|cancelled"|button|figure/);
 const previous=css.slice(0,css.indexOf('\n/* UDTT private IMG waiting state:'));
 assert.equal(createHash('sha256').update(previous).digest('hex'),'0446514b779e5290e89074f4bad35711f7c7ae2d786cf361b9cf0f1e2853688e');
});
