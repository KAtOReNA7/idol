const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {parse} = require('next/dist/compiled/node-html-parser');
const {artistCatalog, registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {safeArtistReturn} = load('lib/idol/artist-navigation.ts');
const {directoryWork, directoryPerformances} = load('lib/idol/expanded-work-directory.ts');
const origin = 'https://site.example';
const groups = [{slug:'xg',count:23,shows:19,bindings:20,viewOnly:0,query:'NEW DANCE',key:'RjmSBb-eeYU',
  related:['recvxDMFHNLljT','recvxDMFHN1Y9G'],unrelated:'recvxyHuKMKPod',title:'KBS WORLD TV 230825'}];

function target(link,id,stage,route) {
  assert.ok(link,id);
  const url=new URL(link.getAttribute('href'),origin);
  const anchor=(stage?'stage-':'mv-')+id, back=route+'#'+anchor;
  assert.equal(link.id,anchor);
  assert.equal(link.getAttribute('data-directory-record-id'),id);
  assert.equal(url.origin,origin);assert.equal(url.pathname,'/');
  assert.equal(url.searchParams.get('view'),'works');assert.equal(url.searchParams.get('work'),id);
  assert.equal(url.searchParams.get('video'),stage?'stage':null);
  assert.equal(url.searchParams.get('returnTo'),back);assert.equal(safeArtistReturn(back),back);
}

for (const spec of groups) {
  const group=registry.find(g=>g.slug===spec.slug), catalog=artistCatalog(group), base=group.path+'?section=works';
  const published=require('../data/'+spec.slug+'-work-directory.json');
  const cold=async query=>parse(await renderArtist(group,query,null,{serverRoute:undefined,loading:true}));
  const ready=async(query,data=catalog,options={})=>parse(await renderArtist(group,query,data,options));
  const all={section:'works'}, stageQuery={section:'works',q:spec.query,format:'stage'};
  const filteredRoute=group.path+'?'+new URLSearchParams(stageQuery);

  test(spec.slug+' cold and ready directories keep every original MV and one primary movie link per card',async()=>{
    assert.equal(published.length,spec.count);
    assert.equal(new Set(published.map(w=>w.videoId)).size,spec.count);
    assert.equal(published.filter(w=>w.stage&&!w.stage.viewOnly).length,spec.bindings);
    assert.equal(published.filter(w=>w.stage?.viewOnly).length,spec.viewOnly);
    const actual=catalog.works.filter(w=>w.url).map(directoryWork);
    for(const w of published){
      const live=actual.find(r=>r.id===w.id);
      assert.equal(live.videoId,w.videoId);
      assert.equal(live.stage?.key,w.stage?.key);
      if(w.stage?.poster.startsWith('/'))assert.ok(fs.existsSync(path.join('public',w.stage.poster)),w.stage.poster);
      assert.deepEqual(Object.keys(w).sort(),['id','name','song','officialTitle','videoType','version','releaseDate','videoId','stage'].sort());
    }
    for(const doc of [await cold(all),await ready(all)]){
      assert.equal(doc.querySelector('main h1').text,(spec.slug==='xg'?'XG':'aespa')+' 作品与舞台');
      assert.equal(doc.querySelector('[aria-label="团体内容"] [aria-current=page]').getAttribute('href'),base);
      assert.equal(doc.querySelector('.nx-hero,.nx-social,.nx-directory-score,.nx-directory-queues,[role=status]'),null);
      const cards=doc.querySelectorAll('.nx-directory-movie');assert.equal(cards.length,spec.count);
      for(const [i,card] of cards.entries()){
        const w=published[i];assert.equal(card.getAttribute('data-work-id'),w.id);
        assert.ok(card.querySelector('img').getAttribute('src').includes(w.videoId));
        assert.equal(card.querySelectorAll('a').length,w.stage?2:1);
        target(card.querySelector('.nx-directory-movie-link'),w.id,false,base);
        if(w.stage)target(card.querySelector('.nx-directory-stage-link'),w.id,true,base);
      }
    }
  });

  test(spec.slug+' stage list groups exact recordings, links each original MV and keeps its own return control',async()=>{
    assert.equal(directoryPerformances(published,'').length,spec.shows);
    for(const doc of [await cold({...all,format:'stage'}),await ready({...all,format:'stage'})]){
      const shows=doc.querySelectorAll('.nx-directory-show');assert.equal(shows.length,spec.shows);
      assert.equal(doc.querySelectorAll('.nx-directory-related li').length,spec.bindings+spec.viewOnly);
      assert.equal(new Set(shows.map(s=>s.getAttribute('data-stage-source'))).size,spec.shows);
    }
    for(const doc of [await cold(stageQuery),await ready(stageQuery)]){
      const card=doc.querySelectorAll('.nx-directory-show');assert.equal(card.length,1);
      assert.equal(card[0].getAttribute('data-stage-source'),spec.key);
      assert.ok(card[0].querySelector('h2').text.includes(spec.title));
      assert.ok(card[0].querySelector('img').getAttribute('src').includes(spec.key));
      target(card[0].querySelector('.nx-directory-show-main'),spec.related[0],true,filteredRoute);
      const rel=card[0].querySelectorAll('.nx-directory-related a');assert.equal(rel.length,spec.related.length);
      for(const [i,id] of spec.related.entries())target(rel[i],id,false,filteredRoute);
      assert.equal(doc.querySelector('.nx-directory-score'),null);
      const form=doc.querySelector('form[role=search]');assert.equal(form.getAttribute('method'),'get');
      assert.equal(form.getAttribute('action'),group.path);
      const fields=Object.fromEntries(form.querySelectorAll('input[name]').map(el=>[el.getAttribute('name'),el.getAttribute('value')]));
      assert.deepEqual(fields,{section:'works',format:'stage',q:spec.query});
      assert.equal(new URL(form.querySelector('a').getAttribute('href'),origin).searchParams.has('q'),false);
      assert.equal((await cold({...all,q:spec.query,format:'mv'})).querySelectorAll('.nx-directory-movie').length,spec.related.length);
    }
    assert.equal(safeArtistReturn(base+'#mv-'+spec.unrelated),null);
    assert.equal(safeArtistReturn(group.path+'?section=members&format=stage'),null);
    assert.equal(safeArtistReturn(base+'#stage-'+published.find(w=>!w.stage).id),null);
    assert.equal(safeArtistReturn(base+'&format=stage#mv-'+published.find(w=>!w.stage).id),null);
  });

  test(spec.slug+' cold errors still show public movies, and distinct owner-only scores and queues survive hydration',async()=>{
    const error=parse(await renderArtist(group,all,null,{serverRoute:undefined,loading:false,error:'读取超时'}));
    assert.equal(error.querySelectorAll('.nx-directory-movie').length,spec.count);
    assert.ok(error.querySelector('[role=alert]').text.includes('重新加载'));
    assert.equal((await cold({...all,queue:'tonight'})).querySelector('[data-work-id]'),null);
    const isolated=structuredClone(catalog),first=isolated.works.find(w=>w.id===spec.related[0]), second=isolated.works.find(w=>w.id===spec.related[1]);
    first.score=0;first.stageScore=0;first.watched='已观看';second.score=9.5;second.stageScore=8;
    const owner=await ready(all,isolated,{canEdit:true});
    assert.match(owner.querySelector('[data-work-id="'+first.id+'"] .nx-directory-score').text,/0\.0 \/ 10/);
    assert.ok(owner.querySelector('.nx-directory-queues'));
    const shows=await ready(stageQuery,isolated,{canEdit:true});
    assert.match(shows.querySelector('.nx-directory-related').text,/0\.0/);
    const secondary=shows.querySelector('#stage-'+second.id);
    assert.match(secondary.text,/8\.0/);target(secondary,second.id,true,filteredRoute);
    const queued=await ready({...all,q:spec.query,queue:'rewatch'},isolated,{canEdit:true});
    assert.equal(queued.querySelector('.nx-directory-movie').getAttribute('data-work-id'),second.id);
  });
}
