const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const sharp = require('sharp');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, artistCatalog, renderArtist, bundlePages, loadArtistTimeline} = require('./fixtures/current-artist-pages.cjs');
const content = require('../data/babymonster-artist.json');
const headings = require('./fixtures/artist-journey-headings.json').babymonster.section;

const group = registry.find(entry => entry.slug === 'babymonster');
const catalog = artistCatalog(group);
const origin = 'https://site.example';
const pending = {loading:true, serverRoute:undefined, timelineLoading:true, input:null};
const cold = async query => parse(await renderArtist(group,query,null,pending));
const hydrated = async (query, options={}) => parse(await renderArtist(group,query,catalog,options));
const url = link => new URL(link.getAttribute('href'),origin);
const publicWorkFields = ['id','name','song','version','videoType','officialTitle','releaseDate','videoId','stageAction'];
function dedicated(doc, section) {
  assert.equal(doc.querySelector('main h1').text, headings[section]);
  assert.equal(url(doc.querySelector('nav[aria-label="团体内容"] [aria-current="page"]')).searchParams.get('section'),section);
  assert.equal(doc.querySelector('.as-hero,.as-facts,.as-social-reach,.as-summary'),null);
  assert.doesNotMatch(doc.querySelector('main').text,/正在打开你的作品收藏/);
}
function recordLink(link,type,id,returnTo) {
  assert.equal(link.tagName,'A');
  const dest=url(link);
  assert.equal(dest.origin,origin);
  assert.equal(dest.pathname,'/');
  assert.equal(dest.searchParams.get(type),id);
  assert.equal(dest.searchParams.get('view'),type==='member'?'members':'works');
  assert.equal(dest.searchParams.get('returnTo'),returnTo);
}
test('BABYMONSTER cold and hydrated rosters retain all seven official names, dated portraits, profile IDs and RAMI’s hiatus', async () => {
  const query={section:'members'}, first=await cold(query), ready=await hydrated(query);
  const order=content.profile.members.map(name=>catalog.members.find(member=>member.stageName===name&&member.groupIds.includes(group.groupId)));
  assert.equal(order.length,7);
  for (const doc of [first,ready]) {
    dedicated(doc,'members');
    const cards=doc.querySelectorAll('[data-artist-member-trigger]');
    assert.deepEqual(cards.map(card=>card.getAttribute('data-artist-member-trigger')),order.map(person=>person.id));
    assert.match(doc.querySelector('.bm-directory-credit').text,/2024.03.*YG Entertainment/);
    for (const [index,card] of cards.entries()) {
      const person=order[index], portrait=content.memberVisuals[person.stageName], image=card.querySelector('img');
      assert.equal(card.querySelector('strong').text,person.stageName);
      assert.ok(card.text.includes(person.cnName.split('（')[0]));
      assert.equal(card.querySelector('small').text,person.status);
      assert.equal(card.getAttribute('data-member-work-trigger'),'roster:'+person.id);
      assert.equal(url(card).pathname,group.path);
      assert.equal(url(card).searchParams.get('member'),person.id);
      assert.equal(url(card).searchParams.get('section'),'members');
      assert.equal(image.getAttribute('src'),portrait.directoryPreview360);
      assert.equal(image.getAttribute('srcset'),[portrait.directoryPreview360+' 360w',portrait.directoryPreview540+' 540w',portrait.image+' 800w'].join(', '));
      if (person.stageName==='RAMI') assert.equal(card.querySelector('small').text,'暂停活动');
    }
  }
  for (const portrait of Object.values(content.memberVisuals)) {
    for (const [file,width] of [[portrait.directoryPreview360,360],[portrait.directoryPreview540,540],[portrait.image,800]]) {
      const {info}=await sharp(path.join(__dirname,'../public',file)).raw().toBuffer({resolveWithObject:true});
      assert.equal(info.width,width);
      assert.equal(info.height,width * 1.5);
    }
  }
});

test('BABYMONSTER shared works list has nineteen exact posters and one MV destination per work plus sixteen separate stage links',async()=>{
  const query={section:'works'}, first=await cold(query), ready=await hydrated(query), returnTo=group.path+'?section=works';
  const expected=catalog.works.filter(w=>w.groupIds.includes(group.groupId)).sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)||a.id.localeCompare(b.id));
  assert.equal(expected.length,19);
  const coldCards=first.querySelectorAll('[data-work-id]'), liveCards=ready.querySelectorAll('[data-work-id]');
  for(const doc of [first,ready]){
    dedicated(doc,'works');
    assert.equal(doc.querySelectorAll('a.bm-directory-stage').length,16);
    assert.equal(doc.querySelector('.bm-directory-score,.bm-directory-queues'),null);
  }
  assert.deepEqual(coldCards.map(card=>card.getAttribute('data-work-id')),expected.map(w=>w.id));
  assert.deepEqual(liveCards.map(card=>card.getAttribute('data-work-id')),expected.map(w=>w.id));
  for(const [i,work] of expected.entries()) {
    for(const card of [coldCards[i],liveCards[i]]) {
      const showStage=!!(work.stage||work.stageSupplement?.alternatives.length);
      assert.equal(card.querySelectorAll('a[href]').length,showStage?2:1);
      const mv=card.querySelector('a.bm-directory-work-main');
      recordLink(mv,'work',work.id,returnTo);
      assert.equal(mv.querySelector('strong').text,work.song);
      assert.ok(mv.querySelector('small').text.includes(work.releaseDate));
      assert.equal(mv.querySelector('img').getAttribute('src'),coldCards[i].querySelector('img').getAttribute('src'));
      assert.equal(url(mv).searchParams.get('video'),null);
      if(showStage){
        const stage=card.querySelector('a.bm-directory-stage');
        recordLink(stage,'work',work.id,returnTo);
        assert.equal(url(stage).searchParams.get('video'),'stage');
      }
    }
  }
});

test('BABYMONSTER shared timeline preserves eleven chronological dates and all eighteen member or work destinations before hydration',async()=>{
  const query={section:'updates'}, {input}=await loadArtistTimeline(group.slug);
  const first=await cold(query), ready=await hydrated(query,{input,loading:false}), source=group.path+'?section=updates';
  const known=input.events.filter(event=>event.reviewStatus==='ready'), publicRows=first.querySelectorAll('[data-timeline-event-id]');
  assert.equal(publicRows.length,11);
  for(const doc of [first,ready]){
    dedicated(doc,'updates');
    const rows=doc.querySelectorAll('[data-timeline-event-id]');
    assert.deepEqual(rows.map(r=>r.getAttribute('data-timeline-event-id')),publicRows.map(r=>r.getAttribute('data-timeline-event-id')));
    const dates=rows.map(row=>row.querySelector('time').getAttribute('datetime'));
    assert.deepEqual(dates,[...dates].sort());
    assert.equal(doc.querySelectorAll('.at-references a[href]').length,18);
    for(const row of rows){
      const event=known.find(e=>e.id===row.getAttribute('data-timeline-event-id'));
      assert.ok(event);
      const links=row.querySelectorAll('.at-references a[href]');
      assert.deepEqual(links.map(a=>a.getAttribute('data-timeline-target-id')),[...event.memberIds,...event.workIds]);
      for(const link of links){
        assert.equal(link.getAttribute('data-timeline-event-trigger'),event.id);
        recordLink(link,link.getAttribute('data-timeline-target-kind'),link.getAttribute('data-timeline-target-id'),source);
      }
    }
  }
});

test('BABYMONSTER search links retain the exact text, selected work and stage, with a usable clear or reset state',async()=>{
  const query={section:'works',q:'biLLionaire'}, returnTo=group.path+'?section=works&q=biLLionaire';
  for(const doc of [await cold(query),await hydrated(query)]){
    assert.equal(doc.querySelectorAll('[data-work-id]').length,1);
    assert.equal(doc.querySelector('.bm-directory-search input').getAttribute('value'),query.q);
    assert.equal(doc.querySelector('.bm-directory-search button').text,'清空');
    const id=catalog.works.find(w=>w.song==='BILLIONAIRE').id;
    recordLink(doc.querySelector('.bm-directory-work-main'),'work',id,returnTo);
    recordLink(doc.querySelector('.bm-directory-stage'),'work',id,returnTo);
    assert.equal(doc.querySelector('.bm-directory-work-copy strong').text,'BILLIONAIRE');
  }
  const empty=await cold({section:'works',q:'A & B'});
  assert.equal(empty.querySelector('.bm-directory-search input').getAttribute('value'),'A & B');
  assert.equal(empty.querySelector('[data-work-id]'),null);
  assert.equal(empty.querySelector('.bm-directory-empty button').text,'查看全部作品');
});

test('BABYMONSTER public fields and server event props exclude private records, unpublished events and research notes',async()=>{
  assert.deepEqual(Object.keys(content.directory).sort(),['members','works']);
  for(const member of content.directory.members) assert.deepEqual(Object.keys(member).sort(),['id','stageName','cnName','status'].sort());
  for(const work of content.directory.works) assert.deepEqual(Object.keys(work).sort(),[...publicWorkFields].sort());
  const route=bundlePages().pages[group.slug];
  const props=async query=>(await route({searchParams:Promise.resolve(query)})).props.children.props;
  for(const query of [{section:'works'},{section:'members'},{},{section:'updates',member:content.directory.members[0].id}]) assert.equal((await props(query)).initialTimeline,undefined);
  const timeline=(await props({section:'updates'})).initialTimeline;
  assert.equal(timeline.events.length,11);
  assert.deepEqual(timeline.gaps,[]);
  for(const event of timeline.events){
    assert.equal(event.reviewStatus,'ready');
    assert.equal(event.summary,'');
    assert.equal(event.scopeNote,'');
    assert.deepEqual(event.holdReasons,[]);
    assert.ok(event.sources.length);
    for(const reference of event.sources){
      assert.ok(new URL(reference.url).protocol==='https:');
      assert.equal(reference.evidenceRef,null);
      assert.equal(reference.scopeNote,'');
    }
  }
  assert.doesNotMatch(JSON.stringify(timeline),/evidence\/|fileToken|personalMvRatings|scoreBinding/);
});

test('BABYMONSTER private filters require owner access and live data, preserve zero and hide private text from visitors',async()=>{
  const local=structuredClone(catalog);
  const work=local.works.find(w=>w.song==='BILLIONAIRE');
  work.score=0;
  work.note='QA_PRIVATE_NOTE';
  work.watched='已观看';
  const query={section:'works',q:'BILLIONAIRE'}, personal={...query,queue:'rewatch'};
  for(const options of [pending,{loading:false,canEdit:false}]){
    const visitors=parse(await renderArtist(group,personal,options.loading?null:local,options));
    assert.equal(visitors.querySelector('.bm-directory-queues,[data-work-id],.bm-directory-score'),null);
    assert.match(visitors.querySelector('main').text,/个人观看记录仅本人可见/);
    assert.doesNotMatch(visitors.toString(),/QA_PRIVATE_NOTE/);
  }
  const pendingOwner=parse(await renderArtist(group,personal,null,{...pending,canEdit:true}));
  assert.match(pendingOwner.querySelector('main [role="status"]').text,/正在读取个人观看记录/);
  assert.equal(pendingOwner.querySelector('[data-work-id],.bm-directory-score'),null);
  const visitor=parse(await renderArtist(group,query,local,{canEdit:false}));
  assert.equal(visitor.querySelector('.bm-directory-queues,.bm-directory-score'),null);
  assert.doesNotMatch(visitor.toString(),/QA_PRIVATE_NOTE/);
  const owner=parse(await renderArtist(group,query,local,{canEdit:true}));
  assert.match(owner.querySelector('.bm-directory-score').text,/我的 MV 分 0\.0/);
  assert.ok(owner.querySelector('.bm-directory-queues'));
  const none=parse(await renderArtist(group,personal,local,{canEdit:true}));
  assert.equal(none.querySelector('[data-work-id]'),null);
  assert.equal(none.querySelector('.bm-directory-empty button').text,'查看全部作品');
});

test('BABYMONSTER retains public entries on a catalog failure, provides a retry for each failure, and keeps the home group photo on the overview',async()=>{
  for(const [section,selector,length] of [['members','[data-artist-member-trigger]',7],['works','[data-work-id]',19],['updates','[data-timeline-event-id]',11]]){
    const failed=parse(await renderArtist(group,{section},null,{input:null,loading:false,error:'资料读取失败'}));
    assert.equal(failed.querySelectorAll(selector).length,length);
    assert.equal(failed.querySelector('main [role="alert"] button').text,'重新加载');
  }
  const failed=await hydrated({section:'updates'},{input:null,timelineError:'时间轴模块未能加载。',onTimelineRetry(){}});
  assert.match(failed.querySelector('main [role="alert"]').text,/时间轴模块未能加载/);
  assert.ok(failed.querySelector('main [role="alert"] button'));
  const home=await hydrated({});
  assert.ok(home.querySelector('.as-hero'));
  assert.equal(home.querySelector('.bm-directory-panel'),null);
});

test('BABYMONSTER linked event click sends the original event and target to the host; a modified or pre-hydration click keeps the native destination',async()=>{
  const React=require('react'), {renderToStaticMarkup}=require('react-dom/server');
  const {ArtistTimeline}=bundlePages(), {input}=await loadArtistTimeline(group.slug);
  const source=group.path+'?section=updates', memberLabels=Object.fromEntries(catalog.members.map(m=>[m.id,m.stageName]));
  const workLabels=Object.fromEntries(catalog.works.map(w=>[w.id,w.song]));
  const event=input.events.find(e=>e.id==='e-babymonster-drip');
  const targetId=event.workIds[0], calls=[];
  function articleLink(props) {
    let found;
    function inspect(node){
      if(!node||typeof node!=='object')return;
      if(Array.isArray(node)){node.forEach(inspect);return;}
      if(node.type==='a'&&node.props['data-timeline-event-trigger']===event.id&&node.props['data-timeline-target-id']===targetId) found=node.props;
      else if(typeof node.type==='function'&&node.props?.event?.id===event.id&&'recordHref' in node.props) inspect(node.type(node.props));
      else inspect(node.props?.children);
    }
    function MountedTimeline(){
      const timeline=ArtistTimeline({input,context:{groups:[group],members:catalog.members,works:catalog.works},memberLabels,workLabels,
        recordHref:(kind,id)=>'/?view='+(kind==='member'?'members&member=':'works&work=')+id+'&returnTo='+encodeURIComponent(source),...props});
      inspect(timeline);
      return timeline;
    }
    renderToStaticMarkup(React.createElement(MountedTimeline));
    assert.ok(found);
    return found;
  }
  const ready=articleLink({onWork:(id,sourceEvent)=>calls.push({id,sourceEvent})}), first=articleLink({});
  assert.equal(ready.href,first.href);
  assert.equal(new URL(first.href,origin).searchParams.get('returnTo'),source);
  let prevented=0;
  const click={button:0,defaultPrevented:false,preventDefault(){prevented++;}};
  first.onClick(click);
  for(const patch of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}])ready.onClick({...click,...patch});
  assert.equal(prevented,0);
  assert.deepEqual(calls,[]);
  ready.onClick(click);
  assert.equal(prevented,1);
  assert.deepEqual(calls,[{id:targetId,sourceEvent:event.id}]);
});
