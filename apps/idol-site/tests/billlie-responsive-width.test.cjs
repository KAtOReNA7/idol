/* eslint-disable @typescript-eslint/no-require-imports */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),postcss=require('postcss');
const css=fs.readFileSync('components/candidate/billlie-figma-design.css','utf8'),ast=postcss.parse(css);
function rules(selector,width){let result={};ast.walkRules(rule=>{if(rule.selector!==selector)return;let parent=rule.parent;while(parent&&parent.type!=='root'){if(parent.type==='atrule'&&parent.name==='media'){const min=parent.params.match(/min-width:(\d+)px/),max=parent.params.match(/max-width:(\d+)px/);if(min&&width<+min[1]||max&&width>+max[1])return;}parent=parent.parent;}for(const d of rule.nodes.filter(x=>x.type==='decl'))result[d.prop]=d.value;});return result;}
test('main removes inherited max-width and duplicate global gutters',()=>{const main=rules('.billlie-figma .bf-main',2560);assert.equal(main.width,'100%');assert.equal(main['max-width'],'none');assert.equal(main.margin,'0');assert.equal(main.padding,'0');assert.equal(main['min-width'],'0');assert.doesNotMatch(css,/100vw|overflow-x:\s*hidden/);});
test('actual CSS gutter/grid calculations remain positive at 320/390/1440/2048/2560 and 80/100/125 percent effective widths',()=>{for(const viewport of [320,390,1440,2048,2560])for(const zoom of [.8,1,1.25]){const width=viewport/zoom,section=rules('.bf-section',width),parts=section.padding.split(' ').map(parseFloat),gutter=parts.at(-1),content=width-2*gutter;assert.ok(content>=224);const mobile=width<=767,columns=mobile?2:4,gap=mobile?(width<=359?12:16):width>=1800?32:24,card=(content-(columns-1)*gap)/columns;assert.ok(card>100,`${viewport} @ ${zoom}: ${card}`);if(!mobile){const heroGap=width>=1800?64:48;assert.ok((content-heroGap)/1.9>280);}const header=width-(mobile?32:width>=1800?128:80),nav=mobile?header:header*.48,navGap=mobile?(width<=359?6:8):24,navButton=(nav-navGap*3)/4;assert.ok(navButton>44,`${viewport} @ ${zoom}: nav ${navButton}`);}});
test('navigation uses short single-line labels and square uncropped art',()=>{assert.match(css,/white-space:nowrap/);assert.match(css,/\.bf-square\{[^}]*aspect-ratio:1/);assert.match(css,/object-fit:contain/);assert.match(css,/\.bf-video-image\{aspect-ratio:16\/9/);const source=fs.readFileSync('components/candidate/billlie-design.tsx','utf8');assert.match(source,/\['updates','大事'\]/);assert.doesNotMatch(source,/bg-\[|https:\/\/www\.figma\.com\/api\/mcp\/asset/);});

test('Billlie leads with its MV above the original album cover across the one- and two-column layouts', async () => {
  const {parse} = require('next/dist/compiled/node-html-parser');
  const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
  const latest = require('../data/runtime/billlie-figma-catalog.json').releases[0];
  const group = registry.find(artist => artist.slug === 'billlie');
  const hero = parse(await renderArtist(group)).querySelector('.bf-hero');
  const elements = hero.childNodes.filter(node => node.nodeType === 1);
  assert.equal(elements.length, 3);
  const [intro, releaseCopy, cover] = elements;
  assert.ok(intro.classList.contains('bf-hero-intro'));
  assert.equal(intro.querySelector('h1').text, 'BILLLIE');
  assert.match(intro.querySelector('.bf-hero-mv').getAttribute('href'), /[?&]work=/);
  assert.equal(releaseCopy.querySelector('h2').text, latest.title);
  assert.ok(cover.classList.contains('bf-square'));
  assert.equal(cover.querySelector('img').getAttribute('src'), latest.src);
  for (const width of [320, 375, 390, 767, 768, 1265, 1440, 2048]) {
    assert.equal(rules('.bf-hero', width).display, 'grid');
    const columns = rules('.bf-hero', width)['grid-template-columns'];
    assert.equal(columns, width <= 767 ? 'minmax(0,1fr)' : 'minmax(0,.9fr) minmax(0,1fr)');
    assert.equal(rules('.bf-hero-intro', width)['grid-column'], '1 / -1', 'full first row at ' + width);
  }
});
