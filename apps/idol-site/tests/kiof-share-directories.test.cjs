const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const sharp=require('sharp');
const {parse}=require('next/dist/compiled/node-html-parser');
const {registry,artistCatalog,renderArtist,loadArtistTimeline,bundlePages}=require('./fixtures/current-artist-pages.cjs');
const source=require('../data/kissoflife-artist.json');
const directory=require('../data/kissoflife-share-directory.json');
const load=require('./helpers/public-artist-loader.cjs');
const {artistCollection}=load('lib/idol/artist-preview.ts');
const {kiofDirectoryRecord}=load('lib/idol/kiof-directory-record.ts');

const group=registry.find(g=>g.slug==='kissoflife'), catalog=artistCatalog(group);
const records=artistCollection(catalog,group.groupId).works;
const base=group.path, origin='https://site.example';
const cold=async fields=>parse(await renderArtist(group,fields,null,{serverRoute:undefined,input:null,loading:true,timelineLoading:true}));
const ready=async(fields,options={})=>parse(await renderArtist(group,fields,catalog,options));
const to=node=>new URL(node.getAttribute('href'),origin);

function frame(doc,title,section){
  assert.equal(doc.querySelector('main h1').text,title);
  assert.equal(to(doc.querySelector('nav[aria-label="团体内容"] [aria-current=page]')).searchParams.get('section'),section);
  assert.equal(doc.querySelector('.kf-hero,.kf-encyclopedia,.kf-social,.kf-empty[role=status]'),null);
  assert.equal(doc.querySelector('.kf-directory-mark img').getAttribute('src'),'/artist/kissoflife/directory/japan-official-logo.png');
}
function destination(link,id,returnTo,stage=false){
  assert.equal(link.tagName,'A');
  const url=to(link);assert.equal(url.origin,origin);assert.equal(url.pathname,'/');
  assert.equal(url.searchParams.get('view'),'works');assert.equal(url.searchParams.get('work'),id);
  assert.equal(url.searchParams.get('video'),stage?'stage':null);
  const event=link.getAttribute('data-timeline-event-trigger');
  const anchor=event?'event-'+event+'-work-'+id:(stage?'stage-':'mv-')+id;
  assert.equal(link.id,anchor);
  assert.equal(url.searchParams.get('returnTo'),returnTo+'#'+anchor);
}

test('KISS OF LIFE shared roster contains four named 2026 SWEAT portraits, their native member links and the original Japan logo at first response',async()=>{
  const query={section:'members'}, srcDir=path.resolve(__dirname,'../public');
  for(const doc of [await cold(query),await ready(query)]){
    frame(doc,'成员名录','members');
    assert.equal(doc.querySelector('.kf-directory-title p').text,'4 位成员');
    assert.equal(doc.querySelector('.kf-directory-credit').getAttribute('href'),'https://kissoflife.jp/#biography');
    assert.match(doc.querySelector('.kf-directory-credit').text,/SWEAT -JAPANESE EP-.*2026\.08\.28.*© KISS OF LIFE JAPAN/);
    const cards=doc.querySelectorAll('a[data-artist-member-trigger]');assert.equal(cards.length,4);
    for(const [i,card] of cards.entries()){
      const person=directory.members[i],visual=source.memberVisuals[person.stageName],url=to(card);
      assert.equal(card.querySelector('strong').text,source.profile.members[i]);
      assert.equal(card.querySelector('small').text,person.status);assert.equal(card.getAttribute('data-artist-member-trigger'),person.id);
      assert.equal(card.getAttribute('data-member-work-trigger'),'roster:'+person.id);
      assert.equal(url.pathname,base);assert.deepEqual(Object.fromEntries(url.searchParams),{section:'members',member:person.id});
      const photo=card.querySelector('img'),img='/artist/kissoflife/directory/'+person.stageName.toLowerCase();
      assert.equal(photo.getAttribute('src'),img+'-360.webp');assert.equal(photo.getAttribute('srcset'),img+'-360.webp 360w, '+img+'-540.webp 540w, '+visual.image+' 720w');
      assert.match(photo.getAttribute('alt'),/SWEAT/);
    }
  }
  const logo=await sharp(path.join(srcDir,'/artist/kissoflife/directory/japan-official-logo.png')).metadata();
  assert.deepEqual([logo.width,logo.height,logo.hasAlpha],[600,128,true]);
  for(const member of directory.members){
    const dir='/artist/kissoflife/directory/'+member.stageName.toLowerCase();
    for(const [w,file] of [[360,dir+'-360.webp'],[540,dir+'-540.webp'],[720,source.memberVisuals[member.stageName].image]]){
      const {info}=await sharp(path.join(srcDir,file)).raw().toBuffer({resolveWithObject:true});
      assert.deepEqual([info.width,info.height],[w,w*1.5]);
    }
  }
});

test('KISS OF LIFE shares exactly 25 matching video posters with one native MV target and 24 independent stage targets',async()=>{
  const query={section:'works'},back=base+'?section=works';
  for(const doc of [await cold(query),await ready(query)]){
    frame(doc,'作品与舞台','works');
    const cards=doc.querySelectorAll('.kf-work-grid [data-work-id]');
    assert.equal(cards.length,25);assert.equal(doc.querySelectorAll('.kf-directory-stage').length,24);
    assert.equal(doc.querySelector('.kf-score,.kf-directory-queues'),null);
    for(const [i,card] of cards.entries()){
      const work=directory.works[i], mv=card.querySelector('.kf-directory-mv');
      assert.equal(card.getAttribute('data-work-id'),work.id);assert.equal(card.querySelectorAll('a').length,work.stage?2:1);
      assert.equal(mv.querySelector('h3').text,work.song);assert.ok(mv.querySelector('img').getAttribute('src').includes(work.videoId));
      destination(mv,work.id,back);if(work.stage)destination(card.querySelector('.kf-directory-stage'),work.id,back,true);
    }
  }
});

test('all 24 cold stage cards agree with their verified performances and their ready versions, including both languages of SWEAT',async()=>{
  const query={section:'works',format:'stage'},back=base+'?section=works&format=stage';
  for(const doc of [await cold(query),await ready(query)]){
    const cards=doc.querySelectorAll('.kf-stage-card');assert.equal(cards.length,24);
    assert.equal(doc.querySelector('.kf-directory-mv,.kf-score'),null);
    for(const card of cards){
      const work=directory.works.find(w=>w.id===card.getAttribute('data-work-id')),link=card.querySelector('a'),s=work.stage;
      assert.equal(card.querySelectorAll('a').length,1);destination(link,work.id,back,true);
      assert.equal(link.getAttribute('data-member-work-trigger'),work.id);assert.ok(link.text.includes(s.detail));
      assert.equal(link.querySelector('.artist-work-preview img').getAttribute('src'),s.poster);
      assert.equal(link.text.includes('与 MV 页为同一支表演视频'),work.song==='Te Quiero');
    }
    assert.match(doc.querySelector('[data-work-id=rec28ldfRTrN03] img').getAttribute('src'),/6bIVPKhafSI/);
    assert.match(doc.querySelector('[data-work-id=rec28ldfRTrMRu] img').getAttribute('src'),/Iccsdu-GjSU/);
    assert.match(doc.querySelector('[data-work-id=rec28ldfRTrBpe] img').getAttribute('src'),/CXN-qdYRCfc/);
  }
});

test('KISS OF LIFE native search, clear, format toggles and reset preserve exact return filters for bookmarked shares',async()=>{
  for(const doc of [await cold({section:'works',q:'sWEat',format:'stage'}),await ready({section:'works',q:'sWEat',format:'stage'})]){
    const form=doc.querySelector('form[role=search]');assert.equal(form.getAttribute('method'),'get');assert.equal(form.getAttribute('action'),base);
    const fields=new URLSearchParams(form.querySelectorAll('input[name]').map(f=>[f.getAttribute('name'),f.getAttribute('value')]));
    assert.deepEqual(Object.fromEntries(fields),{section:'works',format:'stage',q:'sWEat'});
    const clear=to(form.querySelector('a'));assert.deepEqual(Object.fromEntries(clear.searchParams),{section:'works',format:'stage'});
    assert.equal((await cold(Object.fromEntries(clear.searchParams))).querySelectorAll('.kf-stage-card').length,24);
    fields.set('q','Sticky');const found=await cold(Object.fromEntries(fields));
    const matches=found.querySelectorAll('.kf-stage-card');assert.equal(matches.length,1);
    destination(matches[0].querySelector('a'),'rec28ldfRTrBpe',base+'?section=works&q=Sticky&format=stage',true);
    const mv=found.querySelectorAll('.kf-directory-filter-links a').find(link=>link.text==='MV');
    const switched=await cold(Object.fromEntries(to(mv).searchParams));
    destination(switched.querySelector('.kf-directory-mv'),'rec28ldfRTrBpe',base+'?section=works&q=Sticky&format=mv');
  }
  const empty=await cold({section:'works',q:'A & B',format:'stage'});
  assert.equal(empty.querySelector('.kf-directory-notice a').getAttribute('href'),base+'?section=works');
});

test('KISS OF LIFE timeline shares contain seventeen dates and nineteen work links, with distinct return triggers for repeated Midas Touch',async()=>{
  const {input}=await loadArtistTimeline(group.slug), query={section:'updates'}, back=base+'?section=updates';
  const events=input.events.filter(event=>event.reviewStatus==='ready').sort((a,b)=>a.eventDate.value.localeCompare(b.eventDate.value)||a.id.localeCompare(b.id));
  for(const doc of [await cold(query),await ready(query,{input})]){
    frame(doc,'大事时间轴','updates');
    const rows=doc.querySelectorAll('[data-timeline-event-id]');assert.equal(rows.length,17);assert.equal(doc.querySelectorAll('.at-references a').length,19);
    assert.deepEqual(rows.map(r=>r.querySelector('time').getAttribute('datetime')),events.map(e=>e.eventDate.value));
    for(const row of rows){
      const event=events.find(e=>e.id===row.getAttribute('data-timeline-event-id')),links=row.querySelectorAll('.at-references a');
      assert.deepEqual(links.map(a=>a.getAttribute('data-timeline-target-id')),event.workIds);
      for(const a of links){assert.equal(a.getAttribute('data-timeline-event-trigger'),event.id);destination(a,a.getAttribute('data-timeline-target-id'),back);}
    }
    const same=doc.querySelectorAll('[data-timeline-target-id=rec28ldfRTrBl8]');
    assert.deepEqual(same.map(a=>a.getAttribute('data-timeline-event-trigger')).sort(),['e-kissoflife-midas-touch-launch-showcase','e-kissoflife-midas-touch-music-release']);
    assert.equal(doc.querySelector('[data-timeline-event-id=e-kissoflife-sticky-jp-release] a'),null);
  }
});

test('KISS OF LIFE cold pages serialize public directory fields and reviewed source facts, and keep available entries through a catalog failure',async()=>{
  const memberFields=['id','stageName','cnName','status'].sort(),workFields=['id','name','song','officialTitle','version','videoType','releaseDate','videoId','stage'].sort();
  for(const m of directory.members){
    assert.deepEqual(Object.keys(m).sort(),memberFields);
    const current=catalog.members.find(member=>member.id===m.id);
    for(const field of memberFields)assert.equal(m[field],current[field]);
  }
  for(const [i,w] of directory.works.entries()){
    assert.deepEqual(Object.keys(w).sort(),workFields);assert.deepEqual(w,kiofDirectoryRecord(records[i]));
    if(w.stage)assert.deepEqual(Object.keys(w.stage).sort(),['videoId','action','detail','poster','posterLabel','workReference','sameVideo'].sort());
  }
  const page=bundlePages().pages.kissoflife;
  for(const q of [{},{section:'works'},{section:'members'},{section:'updates',member:directory.members[0].id}]){
    assert.equal((await page({searchParams:Promise.resolve(q)})).props.children.props.initialTimeline,undefined);
  }
  const timeline=(await page({searchParams:Promise.resolve({section:'updates'})})).props.children.props.initialTimeline;
  assert.equal(timeline.events.length,17);assert.deepEqual(timeline.gaps,[]);
  for(const e of timeline.events){assert.equal(e.reviewStatus,'ready');assert.equal(e.summary,'');assert.equal(e.scopeNote,'');assert.deepEqual(e.holdReasons,[]);
    for(const s of e.sources){assert.equal(s.evidenceRef,null);assert.equal(s.scopeNote,'');}}
  assert.doesNotMatch(JSON.stringify([directory,timeline]),/scoreBinding|personalMvRatings|fileToken|private-note|evidence\//);
  for(const [section,selector,n] of [['members','[data-artist-member-trigger]',4],['works','[data-work-id]',25],['updates','[data-timeline-event-id]',17]]){
    const failed=parse(await renderArtist(group,{section},null,{input:null,error:'资料暂时无法读取'}));
    assert.equal(failed.querySelectorAll(selector).length,n);assert.equal(failed.querySelector('main [role=alert] button').text,'重新加载');
  }
});

test('visitors cannot open private KISS OF LIFE queues or see scores, while the owner retains separate MV and stage zero scores',async()=>{
  const fixture=structuredClone(catalog),w=fixture.works.find(w=>w.song==='Te Quiero');w.score=8;w.stageScore=0;w.note='DO_NOT_PUBLISH_KIOF';
  const q={section:'works',q:'Te Quiero'};
  for(const format of ['mv','stage']){
    const visitor=parse(await renderArtist(group,{...q,format},fixture,{canEdit:false}));
    assert.equal(visitor.querySelector('.kf-directory-queues,.kf-score'),null);assert.doesNotMatch(visitor.toString(),/DO_NOT_PUBLISH_KIOF/);
    const owner=parse(await renderArtist(group,{...q,format},fixture,{canEdit:true}));assert.ok(owner.querySelector('.kf-directory-queues'));
    assert.match(owner.querySelector('.kf-score').text,format==='stage'?/我的整体舞台分 0\.0/:/我的 MV 分 8\.0/);
  }
  for(const view of [await cold({...q,queue:'rewatch'}),parse(await renderArtist(group,{...q,queue:'rewatch'},fixture,{canEdit:false}))]){
    assert.equal(view.querySelector('.kf-score,[data-work-id]'),null);assert.match(view.querySelector('main').text,/个人观看记录仅本人可见/);
  }
});

test('cold native work and timeline links remember the exact occurrence and retain a direct return when history writes fail',async()=>{
  const vm=require('node:vm'),{safeArtistReturn}=load('lib/idol/artist-navigation.ts');
  const other=registry.find(g=>g.slug==='babymonster');
  const docs=[await cold({section:'works'}),await cold({section:'works',q:'SWEAT',format:'stage'}),await cold({section:'updates'}),
    parse(await renderArtist(other,{section:'updates'},null,{serverRoute:undefined,input:null,loading:true,timelineLoading:true}))];
  let count=0;
  for(const doc of docs){
    const region=doc.querySelector('[data-directory-record-links]'),base=region.getAttribute('data-directory-record-links');
    const script=region.querySelector('script').rawText, ids=new Set();
    for(const a of region.querySelectorAll('a[data-member-work-trigger]')){
      const id=a.id;assert.ok(id);assert.ok(!ids.has(id));ids.add(id);
      const nested=to(a).searchParams.get('returnTo');assert.equal(nested,base+'#'+id);assert.equal(safeArtistReturn(nested),nested);
      assert.equal(safeArtistReturn(base+'#unregistered-'+id),null);
      const location=new URL(base,origin),listeners=new Map(),regionNode={dataset:{directoryRecordLinks:base}};
      const window={scrollY:313,addEventListener:(key,fn)=>listeners.set(key,fn)};
      const state={path:base,identity:{eventId:'e-older',targetId:'recOld',kind:'work'}};
      const history={state:{timelineReturn:state},replaceState(next,_,value){this.state=next;location.href=new URL(value,origin);}};
      const data={memberWorkTrigger:a.getAttribute('data-member-work-trigger'),timelineTargetKind:a.getAttribute('data-timeline-target-kind'),
        timelineTargetId:a.getAttribute('data-timeline-target-id'),timelineEventTrigger:a.getAttribute('data-timeline-event-trigger'),directoryRecordId:a.getAttribute('data-directory-record-id')};
      let focused=0,scrolled=0;
      const link={id,dataset:data,href:to(a).href,referrerPolicy:a.getAttribute('referrerpolicy'),
        closest:selector=>selector.startsWith('ol')?null:selector==='[data-directory-record-links]'?regionNode:link,
        hasAttribute:key=>key==='data-member-work-trigger',focus:()=>focused++,scrollIntoView:()=>scrolled++};
      const document={addEventListener:(key,fn)=>listeners.set(key,fn),getElementById:key=>key===id?link:null};
      vm.runInNewContext(script,{URL,window,document,location,history});
      assert.equal(link.referrerPolicy,'no-referrer');listeners.get('click')({button:0,ctrlKey:true,target:link});
      assert.equal(location.hash,'');listeners.get('click')({button:0,target:link});assert.equal(location.hash,'#'+id);
      assert.equal(link.referrerPolicy,'same-origin');assert.equal(history.state.memberWorkFocus.key,data.memberWorkTrigger);
      assert.equal(history.state.artistScroll.y,313);assert.equal(history.state.timelineReturn,undefined);
      listeners.get('pageshow')();assert.equal(focused,1);
      history.replaceState=()=>{throw Error('unavailable');};location.href=new URL(base,origin);
      listeners.get('click')({button:0,target:link});assert.equal(location.hash,'');assert.equal(link.referrerPolicy,'no-referrer');
      location.href=new URL(nested,origin);listeners.get('DOMContentLoaded')();assert.equal(focused,2);assert.equal(scrolled,2);count++;
    }
  }
  assert.equal(count,49+2+19+18);
});
