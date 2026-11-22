const assert=require('node:assert/strict');
const {test}=require('node:test');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {parse}=require('next/dist/compiled/node-html-parser');
const esbuild=require('esbuild');
const {registry,nativeSlugs,artistCatalog,renderArtist}=require('./fixtures/current-artist-pages.cjs');
const {mountAstra}=require('./helpers/timeline-production-renderers.cjs');
const source=[
  "export {GroupIndex} from './components/group-index';",
  "export {MusicHome} from './components/music-home';",
  "export {defaultFilters} from './lib/idol/journey';",
  "export {createAstraRuntime} from './lib/idol/izna-runtime/runtime.mjs';",
  "export {createIznaModule} from './lib/idol/izna-runtime/izna.mjs';",
  "export {createIfeyeModule} from './lib/idol/ifeye-runtime/ifeye.mjs';",
  "export {prepareIznaDisplayData} from './lib/idol/izna-native';",
  "export {prepareIfeyeDisplayData} from './lib/idol/ifeye-native';",
  "export {render as renderUdtt} from './lib/idol/udtt-native/presentation.mjs';",
  "export {helpers as udttHelpers,readReviewUrl as udttRoute} from './lib/idol/udtt-native/model.mjs';",
].join('\n');
const bundle=esbuild.buildSync({stdin:{contents:source,resolveDir:process.cwd(),loader:'tsx'},bundle:true,
  write:false,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},
  external:['cloudflare:workers','server-only','react','react/*'],logLevel:'silent'});
const api={exports:{}};
new Function('module','exports','require',bundle.outputFiles[0].text)(api,api.exports,name=>
  name==='cloudflare:workers'?{env:{}}:name==='server-only'?{}:require(name));
const product=api.exports;

const groups=registry.map(g=>artistCatalog(g).groups.find(row=>row.id===g.groupId));
const data={groups,works:[],members:[],ratings:[]};
const cardRows=(component,props)=>parse(renderToStaticMarkup(React.createElement(component,props)))
  .querySelectorAll('.music-group-card').map(card=>({
    key:card.getAttribute('data-browse-anchor'),name:card.querySelector('h3').text,
    lines:card.querySelectorAll('p').map(p=>p.text),
  }));

test('the 51 directory cards and five homepage cards keep a single public company line at every score',()=>{
  for(const average of [0,8.5,null]){
    const catalog={...data,groups:groups.map(g=>({...g,average}))};
    const directory=cardRows(product.GroupIndex,{data:catalog,filters:product.defaultFilters()});
    assert.equal(directory.length,51);
    for(const row of directory){
      assert.equal(row.lines.length,1,row.name);
      assert.ok(row.lines[0].trim());
      assert.doesNotMatch(row.lines[0],/均分|评分|第[一二三四五六七]代|公司未收录/);
    }
    const home=cardRows(product.MusicHome,{data:catalog});
    assert.equal(home.length,5);
    for(const row of home)assert.deepEqual(row,directory.find(g=>g.key===row.key));
  }
});

test('current and historical agencies use the same display, company filter and text search',()=>{
  for(const [name,term] of [['LOONA','BlockBerryCreative'],['Rocket Punch','Woollim Entertainment'],['Weeekly','IST Entertainment']]){
    const company=term+'（历史）';
    for(const filter of [{company},{search:term}]){
      const rows=cardRows(product.GroupIndex,{data,filters:{...product.defaultFilters(),...filter}});
      assert.equal(rows.length,1,term);assert.equal(rows[0].name,name);assert.deepEqual(rows[0].lines,[company]);
    }
  }
  const old=groups.find(g=>g.name==='Rocket Punch');
  const live={...data,groups:[{...old,company:'New company'}]};
  const filtered=cardRows(product.GroupIndex,{data:live,filters:{...product.defaultFilters(),company:'New company'}});
  assert.deepEqual(filtered[0].lines,['New company']);
});

test('each of the 51 actual group home renderers shows exactly one uncollapsed introduction',async()=>{
  for(const group of registry){
    const catalog=artistCatalog(group);
    const route=group.path+'?section=overview';
    let html;
    if(group.slug==='udtt')html=product.renderUdtt({route:product.udttRoute(route),helpers:product.udttHelpers,catalog});
    else if(nativeSlugs.has(group.slug)){
      const display=group.slug==='izna'?product.prepareIznaDisplayData(catalog):product.prepareIfeyeDisplayData(catalog);
      html=mountAstra(product,group.slug,display,route);
    }else html=await renderArtist(group,{},catalog);
    const page=parse(html),paragraphs=page.querySelectorAll('[data-home-introduction]');
    assert.doesNotMatch(page.text,/从一首歌，再一次认识她们|从青春里，听见她们|收藏她们的音乐与日常|穿过树林，走向舞台|六个名字，一起发光|把喜欢的瞬间，一首一首收藏|成员、音乐与值得回看的瞬间|认识她们的声音、舞台与作品/,group.slug);
    assert.equal(paragraphs.length,1,group.slug);
    const p=paragraphs[0];
    assert.equal(p.getAttribute('data-home-introduction'),group.slug);
    assert.equal(p.querySelector('.group-intro-label').text,'团体介绍');
    assert.equal(p.closest('details:not([open]),[hidden],[inert]'),null,group.slug);
    const copy=p.text.replace('团体介绍','').trim();
    assert.ok(copy.length>=20,group.slug);
    assert.equal(page.querySelectorAll('p').filter(n=>n.text.replace('团体介绍','').trim()===copy).length,1,group.slug);
    if(group.slug==='bewave'){
      assert.equal(page.querySelectorAll('h1').length,1);
      assert.equal(page.querySelector('h1 img').getAttribute('src'),'/artist/bewave/be-wave/platform-chrome.webp');
      const picture=page.querySelector('.bw-debut-photo');
      assert.equal(picture.querySelector('img').getAttribute('src'),'/artist/bewave/be-wave/six-concept.webp');
      assert.match(picture.querySelector('.photo-open').getAttribute('href'),/be-wave-publicity-group\.JPG$/);
      assert.equal(picture.querySelector('figcaption a').getAttribute('href'),'https://enews.imbc.com/News/RetrieveNewsInfo/414368');
      assert.equal(page.querySelector('.bw-roster-source').hasAttribute('open'),false);
    }
  }
});
