const assert = require('node:assert/strict');
const test = require('node:test');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, artistCatalog, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const selectors = require('./fixtures/artist-media-order.cjs');
const {mountAstra} = require('./helpers/timeline-production-renderers.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {artistMvHref, artistMvWorkId} = load('lib/idol/artist-mv-link.ts');
const {safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {routeUrl} = load('lib/idol/journey.ts');
const origin = 'https://artist.test';
const reviewedImports = require('../data/reviewed-editorial-work-imports.json');
const url = href => new URL(href, origin);
const linkOf = node => node.tagName==='A' ? node : node.querySelector('a');
const assertPlayer = (href, work, from, slot = 'MV') => {
  const target = url(href);
  assert.equal(target.origin, origin);
  assert.equal(target.pathname, '/');
  assert.equal(target.searchParams.get('view'), 'works');
  assert.equal(target.searchParams.get('work'), work);
  assert.equal(target.searchParams.get('video'), slot === 'STAGE' ? 'stage' : null);
  const back = url(target.searchParams.get('returnTo'));
  assert.equal(back.pathname, url(from).pathname);
  assert.deepEqual(Object.fromEntries(back.searchParams), Object.fromEntries(url(from).searchParams));
};

test('an old media bookmark opens the reviewed native detail and returns to its video catalog without looping',async()=>{
  for(const entry of reviewedImports){
    const group=registry.find(item=>item.groupId===entry.groupId);
    const catalog=artistCatalog(group);
    const film=editorialMvs(group.slug).find(item=>item.videoId===entry.videoId);
    const query={section:'works',format:'mv',media:film.key};
    const source='https://www.youtube.com/watch?v='+entry.videoId;
    const work={...catalog.works[0],id:entry.workId,song:entry.song,url:source,groupIds:[entry.groupId],placeholder:null};
    const manualAction='a[aria-label="打开《'+entry.song+'》播放与评分"]';
    const old=parse(await renderArtist(group,query,catalog));
    assert.equal(old.querySelector(manualAction),null);
    for(const works of [[...catalog.works,work],[...catalog.works,{...work,url:'https://youtu.be/I5-ZVMQVJsQ'}]]){
      const current=parse(await renderArtist(group,query,{...catalog,works}));
      const link=current.querySelector(manualAction);
      if(works.at(-1).url===source){
        assert.ok(link,film.key);
        assertPlayer(link.getAttribute('href'),entry.workId,group.path+'?section=works&format=mv');
      }else assert.equal(link,null);
    }
  }
});

function editorialMvs(slug) {
  if (['hitgs','vcha','atheart'].includes(slug))
    return require('../data/'+slug+'-review-editorial.json').videos.filter(v=>v.type==='mv').map(v=>({...v,id:v.workId}));
  if (slug==='genblue')
    return require('../data/genblue-bluecut.json').media.filter(v=>v.kind==='mv').map(v=>({...v,id:v.workId}));
  if (slug==='wooah')
    return require('../data/wooah-editorial.json').videos.filter(v=>v.kind==='mv').map(v=>({...v,id:v.workId}));
  return require('../data/'+slug+'-native-design.json').works.filter(v=>v.type==='MV');
}

for (const slug of ['adya','bewave','candyshop','geenius','oddyouth','spia','tracer','witchx','youngposse','genblue','wooah','hitgs','vcha','atheart']) {
  test(slug+' MV directory offers a same-tab player only for the exact public version, including cold links',async()=>{
    const group=registry.find(g=>g.slug===slug);
    const catalog=artistCatalog(group);
    const videos=editorialMvs(slug);
    const query={section:'works',format:'mv'};
    const from=group.path+'?'+new URLSearchParams(query);
    for(const [data,options] of [[catalog,{}],[null,{loading:true}]]){
      const doc=parse(await renderArtist(group,query,data,options));
      const cards=doc.querySelectorAll(selectors.get(slug).worksVideo);
      assert.equal(cards.length,videos.length,slug);
      for(const video of videos){
        const card=cards.find(node=>[node.getAttribute('data-video-key'),node.getAttribute('data-media-key'),
          node.getAttribute('data-artist-media'),node.getAttribute('data-genblue-link-trigger')?.replace(/^media:/,'')].includes(video.key));
        assert.ok(card, video.key);
        const link=linkOf(card);
        const matches=catalog.works.filter(w=>w.id===video.id&&w.url==='https://www.youtube.com/watch?v='+video.videoId);
        const reviewed = !data && reviewedImports.find(row => row.groupId === group.groupId && row.videoId === video.videoId);
        if(matches.length===1 || reviewed){
          assert.ok(link,video.key);
          assertPlayer(link.getAttribute('href'),reviewed ? reviewed.workId : video.id,from);
          assert.ok(!link.hasAttribute('target'));
        }else{
          assert.ok(!link||url(link.getAttribute('href')).pathname!== '/',video.key);
        }
      }
    }
  });
}

test('BADVILLAIN home and catalog expose their five exact MVs before and after the catalog arrives',async()=>{
  const group=registry.find(g=>g.slug==='badvillain'),catalog=artistCatalog(group);
  const videos=require('../data/badvillain-figma-public.json').media.filter(v=>v.kind==='mv');
  for(const [query,expected] of [[{},videos.slice(0,1)],[{section:'works'},videos]]){
    const from=group.path+(query.section?'?section=works':'');
    for(const data of [null,catalog]){
      const doc=parse(await renderArtist(group,query,data,{loading:!data}));
      const cards=doc.querySelectorAll('article.film[data-kind="mv"]');
      assert.equal(cards.length,expected.length);
      cards.forEach((card,i)=>{
        const work=catalog.works.find(w=>w.url===expected[i].watchUrl);
        assert.ok(work,expected[i].id);
        for(const a of card.querySelectorAll('a'))assertPlayer(a.getAttribute('href'),work.id,from);
      });
    }
  }
  const source=videos[0];
  const changed={...catalog,works:catalog.works.map(w=>w.url===source.watchUrl?{...w,url:'https://youtu.be/aaaaaaaaaaa'}:w)};
  const doc=parse(await renderArtist(group,{},changed));
  assert.equal(url(doc.querySelector('article.film[data-kind="mv"] a').getAttribute('href')).searchParams.get('media'),source.id);
});

test('same-title sources, conflicting record IDs, duplicates and placeholders cannot acquire another MV’s route',()=>{
  const g=registry.find(g=>g.slug==='atheart'),cat=artistCatalog(g);
  const v=editorialMvs('atheart').find(row=>row.title==='Butterfly Doors'&&row.id);
  const source='https://www.youtube.com/watch?v='+v.videoId;
  for(const data of [cat,null]){
    assert.equal(artistMvWorkId(data,g.groupId,source,v.id),v.id);
    assert.equal(artistMvWorkId(data,g.groupId,source,'recOther'),null);
    assert.equal(artistMvWorkId(data,g.groupId,source,''),null);
  }
  const w=cat.works.find(w=>w.id===v.id);
  for(const works of [[{...w,placeholder:{}}],[w,{...w,id:'recOther'}],[w,{...w,url:'https://youtu.be/aaaaaaaaaaa'}],[{...w,groupIds:['recOther']}]])
    assert.equal(artistMvWorkId({works},g.groupId,source,v.id),null);
  const alt=editorialMvs('atheart').find(row=>row.title===v.title&&!row.id);
  assert.equal(artistMvHref(cat,g.groupId,'https://youtu.be/'+alt.videoId,g.path,v.id),null);
});

for(const slug of ['ifeye','izna']){
  test(slug+' original home, filtered directories and related cards open every MV and exact stage player',()=>{
    const native=load('lib/idol/'+slug+'-native.ts');
    const model=load('lib/idol/'+slug+'-runtime/model.mjs');
    const {bindEditorialLinks,editorialRequest}=load('lib/idol/editorial-mv-links.mjs');
    const runtime=load('lib/idol/izna-runtime/runtime.mjs');
    const renderer=load('lib/idol/'+slug+'-runtime/'+slug+'.mjs');
    const group=registry.find(g=>g.slug===slug),catalog=artistCatalog(group);
    const bindings=slug==='izna'?native.iznaNativeBindings(catalog):native.ifeyeNativeBindings(catalog);
    const {design}=native;
    const field=slug==='izna'?'kind':'type',category=slug==='izna'?'MV':'mv';
    const mvDirectory='#/works?'+field+'='+category;
    const stageDirectory='#/works?'+field+'='+(slug==='izna'?'STAGE':'stage');
    const mvs=design.works.filter(v=>v.type==='MV');
    const stages=design.works.filter(v=>v.type==='STAGE');
    const sample=mvs.find(v=>v.title===(slug==='izna'?'IZNA':'NERDY'));
    const detailHash=v=>'#/works?'+field+'='+category+'&detail='+encodeURIComponent(v.key);
    const routes=['#/home',mvDirectory,stageDirectory,mvDirectory+'&q='+encodeURIComponent(sample.title),
      stageDirectory+'&q='+encodeURIComponent(stages[0].title),
      ...design.releases.map(r=>'#/works?'+field+'=release&detail='+encodeURIComponent(r.key)),
      ...design.members.map(m=>'#/person/'+m.id),'#/timeline'];
    const seen=new Set(),seenStages=new Set();let filteredSample=false;
    const nativeRequest=(hash,back)=>editorialRequest(design,hash,back,model.routeCategory);
    for(const route of routes){
      const html=mountAstra({...runtime,...renderer},slug,design,route);
      for(const state of ['ready','loading','missing']){
        const doc=parse(html);
        const anchors=doc.querySelectorAll('a[href^="#/"]');
        const originals=new Map(anchors.map(a=>[a,a.getAttribute('href')]));
        anchors.forEach(a=>{a.dataset={};});
        const services={routeUrl,safeArtistReturn,bindings:state==='ready'?bindings:[]};
        if(state==='loading')services.pendingMvHref=(id,video,back)=>artistMvHref(null,group.groupId,'https://youtu.be/'+video,back,id);
        bindEditorialLinks({root:doc,data:design,origin:route,artistUrl:model.artistUrl,nativeRequest,nativeHref:model.nativeHref,native:services});
        for(const [anchor,raw] of originals){
          const request=nativeRequest(raw,route);
          const href=anchor.getAttribute('href');
          if(!request?.slotType||state==='missing'||request.slotType==='STAGE'&&state!=='ready'){
            assert.equal(href,model.artistUrl(design,raw));
            continue;
          }
          assertPlayer(href,request.workId,model.artistUrl(design,route),request.slotType);
          assert.equal(anchor.dataset.editorialFocusHref,model.artistUrl(design,raw));
          if(route===mvDirectory)seen.add(request.workId);
          if(route===stageDirectory)seenStages.add(request.videoId);
          if(route.includes('&q=')&&request.workId===sample.id)filteredSample=true;
        }
      }
    }
    assert.deepEqual(seen,new Set(mvs.map(v=>v.id)));
    assert.deepEqual(seenStages,new Set(stages.map(v=>v.videoId)));
    assert.ok(filteredSample);
    assert.equal(new URL(model.artistUrl(design,detailHash(sample)),origin).pathname,group.path);
  });

  test(slug+' legacy stage bookmarks retain a single in-site watch action and the original video identity',()=>{
    const {design}=load('lib/idol/'+slug+'-native.ts');
    const {presentEditorialStageAction}=load('lib/idol/editorial-mv-links.mjs');
    const runtime=load('lib/idol/izna-runtime/runtime.mjs');
    const renderer=load('lib/idol/'+slug+'-runtime/'+slug+'.mjs');
    const prefix=slug==='izna'?'#/works?kind=STAGE':'#/works?type=stage';
    for(const stage of design.works.filter(v=>v.type==='STAGE')){
      const html=mountAstra({...runtime,...renderer},slug,design,prefix+'&detail='+encodeURIComponent(stage.key));
      const root=parse(html),actions=root.querySelector('.detail-actions'),button=actions.querySelector('[data-open-work]');
      assert.equal(actions.querySelector('a[target="_blank"]').getAttribute('href'),stage.url);
      button.dataset={};
      presentEditorialStageAction(root,button,stage.url);
      presentEditorialStageAction(root,button,stage.url);
      assert.equal(actions.querySelector('a[target="_blank"]'),null);
      assert.deepEqual(actions.querySelectorAll('button').map(b=>b.textContent),['站内观看舞台']);
      assert.equal(button.getAttribute('data-open-work'),stage.key);
      assert.equal(button.dataset.editorialStageOpen,'true');
      if(stage.videoId==='rTj06CFlDTU'){
        assert.match(root.textContent,/KBS Music Bank 舞台/);
        assert.ok(root.querySelector('img[src="/artist/stage-video-previews/rTj06CFlDTU.webp"]'));
      }
    }
  });
}

test('UDTT links the original MV from its directory, release, cast and related performance with an exact return',()=>{
  const product=load('lib/idol/udtt-native/model.mjs');
  const presentation=load('lib/idol/udtt-native/presentation.mjs');
  const production={safeArtistReturn,routeUrl,...load('lib/idol/stage-source.ts')};
  const group=registry.find(g=>g.slug==='udtt'),data=artistCatalog(group);
  const original=product.group.media.find(v=>v.kind==='mv');
  const routes=[group.path,group.path+'#/udtt/works?type=mv&q=REALLY',...presentation.artist.works.map(w=>group.path+'#/udtt/work/'+encodeURIComponent(product.helpers.entityKey(w))),...presentation.artist.members.map(m=>group.path+'#/udtt/member/'+m.id)];
  let present=0;
  for(const from of routes){
    const route=product.readReviewUrl(from);
    const mvHref=key=>product.mvCardHref(key,from,data,production);
    const html=parse(presentation.render({route,helpers:product.helpers,catalog:data,mvHref}));
    for(const a of html.querySelectorAll('a[data-udtt-mv]')){
      present++;
      assert.equal(a.getAttribute('data-entity-key'),original.key);
      const target=url(a.getAttribute('href')),back=target.searchParams.get('returnTo');
      assertPlayer(target.href,original.key,back);
      const memory={path:from,key:original.key,y:123};
      assert.deepEqual(product.mvReturnPosition(memory,back,target.href,origin,data,production),{path:from,y:123,focus:mvHref(original.key)});
      assert.equal(product.mvReturnPosition(memory,back,'https://elsewhere.invalid/',origin,data,production),null);
    }
    const legacy=parse(presentation.render({route,helpers:product.helpers,catalog:data}));
    const legacyMv=legacy.querySelectorAll('a[href]').filter(a=>a.getAttribute('href').split('?')[0]==='#/udtt/work/'+original.key&&!a.classNames.includes('ud-back'));
    assert.equal(html.querySelectorAll('a[data-udtt-mv]').length,legacyMv.length,from);
  }
  assert.ok(present>=7);
  const mismatch={...data,works:data.works.map(w=>w.id===original.key?{...w,url:'https://youtu.be/aaaaaaaaaaa'}:w)};
  assert.equal(product.mvCardHref(original.key,group.path,mismatch,production),null);
});
for(const slug of ['izna','ifeye']){
  test(slug+' preserves its mounted host and the same focused MV anchor when its live catalog arrives',async()=>{
    const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
    const {Runner,React,jsxRuntime,find,tick}=require('./helpers/read-recovery-harness.cjs');
    const {editorialRequest,bindEditorialLinks}=load('lib/idol/editorial-mv-links.mjs');
    const native=load('lib/idol/'+slug+'-native.ts'),model=load('lib/idol/'+slug+'-runtime/model.mjs');
    const {design}=native,cap=slug==='izna'?'Izna':'Ifeye',key=slug==='izna'?'kind=MV':'type=mv';
    const original=design.works.find(v=>v.type==='MV');
    const route='#/works?'+key,raw=route+'&detail='+encodeURIComponent(original.key);
    const link={href:raw,dataset:{},getAttribute(name){assert.equal(name,'href');return this.href;},setAttribute(name,v){assert.equal(name,'href');this.href=v;}};
    const mountedRoot={querySelectorAll(selector){assert.ok(selector.includes('a[data-'+slug+'-route]'));return [link];}};
    let mounts=0,destroys=0,updates=0,options={catalog:null,loading:true};
    const refresh=services=>bindEditorialLinks({root:mountedRoot,data:design,origin:route,artistUrl:model.artistUrl,
      nativeRequest:(hash,origin)=>editorialRequest(design,hash,origin,model.routeCategory),nativeHref:model.nativeHref,native:services});
    const ports={
      react:React,'react/jsx-runtime':jsxRuntime,'./identity.css':{},
      '@/components/artist-timeline-host':{useArtistTimelineHostOptions:()=>options},
      '@/lib/idol/catalog-read-deadline':{},'@/lib/idol/artist-navigation':{safeArtistReturn},
      '@/lib/idol/journey':{routeUrl},'@/lib/idol/artist-mv-link':{artistMvHref},
      ['@/lib/idol/'+slug+'-native']:native,
      ['@/lib/idol/'+slug+'-runtime/host.mjs']:{['mount'+cap+'Editorial']:({native:services})=>{
        mounts++;refresh(services);
        return {ready:Promise.resolve(),root:mountedRoot,updateCatalog(_accounts,next){updates++;refresh(next);},destroy(){destroys++;}};
      }},
    };
    const source=fs.readFileSync('components/'+slug+'/editorial.tsx','utf8');
    const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
    const exports={};vm.runInNewContext('(function(require,exports){'+compiled+'})')(
      name=>{assert.ok(name in ports,name);return ports[name];},exports);
    const runner=new Runner(exports.default);
    const tree=runner.render({});
    find(tree,node=>node.type==='div'&&node.props.ref).props.ref.current={};
    await tick();
    assertPlayer(link.href,original.id,model.artistUrl(design,route));
    const catalog=artistCatalog(registry.find(g=>g.slug===slug));
    options={catalog,loading:false};runner.render({});
    assert.equal(mounts,1);assert.equal(destroys,0);assert.equal(updates,1);
    assertPlayer(link.href,original.id,model.artistUrl(design,route));
    options={catalog:{...catalog,works:catalog.works.filter(w=>w.id!==original.id)},loading:false};runner.render({});
    assert.equal(link.href,model.artistUrl(design,raw));assert.equal(link.dataset.editorialFocusHref,undefined);
    assert.equal(mounts,1);assert.equal(destroys,0);
    runner.unmount();assert.equal(destroys,1);
  });
}
