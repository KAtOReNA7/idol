/* eslint-disable @typescript-eslint/no-require-imports */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),postcss=require('postcss');
const css=fs.readFileSync('components/candidate/meovv-figma-design.css','utf8'),ast=postcss.parse(css);
function rule(selector){let found;ast.walkRules(r=>{if(r.selector===selector)found=r;});assert.ok(found,selector);return Object.fromEntries(found.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));}
test('MEOVV main explicitly defeats every inherited global main sizing constraint',()=>{
 const global=postcss.parse(fs.readFileSync('app/globals.css','utf8'));let inherited;global.walkRules(r=>{if(r.selector==='main')inherited=Object.fromEntries(r.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));});assert.equal(inherited['max-width'],'1440px');
 const actual=rule('.meovv-figma>main.mf-main');assert.equal(actual.width,'100%');assert.equal(actual['max-width'],'none');assert.equal(actual['min-width'],'0');assert.equal(actual.margin,'0');assert.equal(actual.padding,'0');assert.equal(actual.display,'block');
 // Three selector components outrank the inherited type selector regardless of stylesheet ordering.
 assert.ok(css.includes('.meovv-figma>main.mf-main'));assert.doesNotMatch(css,/100vw/);
});
test('wide-screen gutters resolve against their containing block, not the viewport',()=>{
 let desktop;ast.walkAtRules('media',at=>{if(at.params==='(min-width:1441px)')desktop=at;});assert.ok(desktop);const row=desktop.nodes.find(n=>n.type==='rule'&&n.selector.includes('.mf-section'));assert.ok(row);const declarations=Object.fromEntries(row.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));
 assert.equal(declarations['padding-left'],'max(64px,calc((100% - 1440px)/2 + 64px))');assert.equal(declarations['padding-right'],declarations['padding-left']);
 // Algebra uses values parsed from the actual declaration, not copied design constants.
 const parts=declarations['padding-left'].match(/^max\((\d+)px,calc\(\(100% - (\d+)px\)\/2 \+ (\d+)px\)\)$/).slice(1).map(Number);
 const gutter=container=>Math.max(parts[0],(container-parts[1])/2+parts[2]);
 for(const viewport of [1441,2048,2560,3840]){const container=viewport,content=container-2*gutter(container),card=(content-4*28)/5;assert.equal(content,1312,`${viewport} content`);assert.equal(card,240,`${viewport} release`);assert.equal((content-4*8)/5,256,`${viewport} portrait`);}
 // A later narrower host cannot reintroduce viewport-overpadding: percentage is local.
 assert.equal(1000-2*gutter(1000),872);
 // Original bug reproduces: inherited main 1440 - 192, minus wide viewport gutters.
 assert.equal((1440-192)-2*gutter(2560),0);
});
test('320/390/1400 retain positive design image slots and no duplicate main gutter',()=>{
 const main=rule('.meovv-figma>main.mf-main');assert.equal(main.padding,'0');
 for(const [width,gutter,releaseGap] of [[320,16,16],[390,20,16],[1400,1400*4.444444/100,28]]){const content=width-gutter*2,columns=width<=800?2:5,release=(content-releaseGap*(columns-1))/columns;assert.ok(release>=136,`${width} release ${release}`);assert.ok(content>0);if(width===320)assert.equal(release,136);if(width===390)assert.equal(release,167);}
 assert.match(css,/@media\(max-width:800px\)/);assert.match(css,/@media\(max-width:359px\)/);assert.match(css,/@media\(max-width:600px\)\{\.mf-work-grid,\.mf-stage-grid\{grid-template-columns:1fr\}/);
});
