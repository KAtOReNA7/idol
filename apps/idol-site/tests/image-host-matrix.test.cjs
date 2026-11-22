'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const React=require('react');const {renderToReadableStream}=require('react-dom/server');
const registry=require('../HANDOFF/artist-registry51.json');const {build}=require('./fixtures/image-reliability/build.cjs');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'image-host-matrix-'));let bundle,proof;
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
function attrs(tag){return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(match=>[match[1],match[2].replaceAll('&amp;','&')]));}
function images(html){return [...html.matchAll(/<img\b[^>]*>/g)].map(match=>attrs(match[0]));}
function noNestedInteractive(html){
 const stack=[];const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
 for(const match of html.matchAll(/<(\/)?([a-z][a-z0-9-]*)\b[^>]*>/gi)){
  const tag=match[2].toLowerCase();
  if(match[1]){const index=stack.lastIndexOf(tag);if(index>=0)stack.length=index;continue;}
  if(['a','button'].includes(tag))assert.ok(!stack.includes('button')&&!stack.includes('a'),`nested ${tag} inside ${stack.join('/')}`);
  if(!voids.has(tag)&&!match[0].endsWith('/>'))stack.push(tag);
 }
}
async function render(artist,route,mode){const stream=await renderToReadableStream(React.createElement(bundle.ArtistTimelineHostProvider,{value:{catalog:{...bundle.imageCatalog,mode},serverRoute:route,loading:false}},React.createElement(bundle.routes[artist.slug],{searchParams:Promise.resolve(Object.fromEntries(new URL(route,'https://image-fixture.example').searchParams))})));await stream.allReady;return new Response(stream).text();}
test.before(async()=>{const output=path.join(directory,'entry.cjs');proof=await build({outfile:output});bundle=require(output);freeze(bundle.imageCatalog);});
test.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
const {artistCatalog, renderArtist, nativeSlugs} = require('./fixtures/current-artist-pages.cjs');
const heroSources = require('./fixtures/approved-artist-heroes.json');
const groupOriginals = require('./fixtures/home-group-originals.json');
const homePreviewSlots = {cherrybullet:['hero'], everglow:['communityPhoto'], rocketpunch:['hero'], weeekly:['hero']};
const externalPlayable = /(?:youtube\.com|youtu\.be|bilibili\.com|x\.com)/;
const privateModes = new Set(['ive','loona','aespa','kissoflife','stayc','nmixx','itzy','lesserafim','triples','madein','illit','qwer','purplekiss','rescene']);

for (const [index, artist] of registry.entries()) {
 if (nativeSlugs.has(artist.slug)) {
  test(`real ${artist.slug} starts its native renderer and reports progress before hydration`,async()=>{
   const html=await renderArtist(artist);
   assert.ok(html.includes(`data-${artist.slug}-native-host="true"`));
   assert.match(html,/role="status"/);
   assert.ok(!images(html).some(img=>img.src?.startsWith('/api/media')));
  });
  continue;
 }

 const catalog = artistCatalog(artist);
 const members = catalog.members.filter(member=>member.groupIds.includes(artist.groupId)||member.formerGroupIds?.includes(artist.groupId));
 test(`real ${artist.slug} overview serves its approved hero and usable member entry`,async()=>{
  const html=await renderArtist(artist,{},catalog);
  const slots=homePreviewSlots[artist.slug];
  const photos=slots ? slots.map(slot=>require(`../data/${artist.slug}-public.json`)[slot]) : [{image:heroSources[artist.slug]}];
  assert.equal(photos[0].image,heroSources[artist.slug]);
  const rendered=images(html);
  if (['everglow','rocketpunch','weeekly','wooah'].includes(artist.slug)) {
   const heroClass={everglow:'eg-hero',rocketpunch:'rp-hero',weeekly:'wk-hero',wooah:'wa-group-hero'}[artist.slug];
   const opening=html.match(new RegExp('<section class="'+heroClass+'"[^>]*>([\\s\\S]*?)</section>'))?.[1];
   assert.ok(opening,'group photo section exists');
   const photo=photos[0].preview??photos[0];
   assert.equal(images(opening)[0]?.src,photo.image,'first image in the opening is the group, ahead of the title and release');
   assert.ok(opening.indexOf('src="'+photo.image+'"')<opening.indexOf('<h1>'),'group photo precedes the visible group heading');
   assert.doesNotMatch(opening,/历年六人成员档案|MEET WOOAH|6th Mini Album|eg-hero-date/);
   if(artist.slug==='weeekly')assert.ok(!rendered.some(img=>img.src?.includes('bliss-banner')),'Bliss banner belongs to its release, outside the group home page');
  }
  if (groupOriginals[artist.slug]) {
   const expected=groupOriginals[artist.slug];
   const actual=[...html.matchAll(/<a\b[^>]*>/g)].map(match=>attrs(match[0]))
    .filter(link=>link['aria-haspopup']==='dialog'&&expected.includes(link.href)).map(link=>link.href);
   assert.deepEqual(actual.sort(),[...expected].sort(),'each home group photo control links to its original before hydration');
   for (const href of expected) assert.ok(fs.existsSync(path.resolve(__dirname,'../public','.'+href)),href);
  }
  const preloads=[...html.matchAll(/<link\b[^>]*>/g)].map(match=>attrs(match[0])).filter(link=>link.as==='image');
  for (const photo of photos) {
   const expected=photo.preview ?? photo;
   const hero=rendered.find(img=>img.src===expected.image);
   assert.ok(hero?.alt?.trim(), 'approved source and accessible label');
   assert.equal(hero.loading,'eager');
   assert.equal(hero.fetchPriority,'high');
   assert.equal(hero.decoding,'async');
   assert.ok(fs.existsSync(path.resolve(__dirname,'../public','.'+hero.src)));
   if (slots) {
    assert.ok(photo.preview);
    assert.match(hero.src,/\.webp$/);
    const publicFile=url=>path.resolve(__dirname,'../public','.'+url);
    assert.ok(fs.statSync(publicFile(hero.src)).size<fs.statSync(publicFile(photo.image)).size,'first view uses the lighter file');
    assert.equal(Number(hero.width),expected.width);
    assert.equal(Number(hero.height),expected.height);
    assert.ok(!rendered.some(img=>img.src===photo.image),'original is loaded only on request');
    assert.ok(!preloads.some(link=>link.href===photo.image),'first load must not preload the original');
   }
  }
  assert.ok(members.length>=2);
  assert.match(html,/section=members|成员|PROFILE|MEMBERS/i);
  noNestedInteractive(html);
 });
 test(`real ${artist.slug} works have valid group and video targets`,async()=>{
  const html=await renderArtist(artist,{section:'works'},catalog);
  const hrefs=[...html.matchAll(/<a\b[^>]*>/g)].map(m=>attrs(m[0]).href).filter(Boolean);
  const targets=hrefs.map(href=>new URL(href,'https://host.example'));
  const workIds=new Set(catalog.works.filter(w=>w.groupIds.includes(artist.groupId)).map(w=>w.id));
  const open=targets.filter(u=>u.pathname==='/'&&u.searchParams.has('work'));
  for(const url of open)assert.ok(workIds.has(url.searchParams.get('work')), 'cross-group work link');
  const ownMedia=targets.filter(u=>u.pathname===artist.path&&u.searchParams.has('media'));
  if (['vcha','hitgs','atheart'].includes(artist.slug)) {
   const videos=require(`../data/${artist.slug}-review-editorial.json`).videos;
   const cards=[...html.matchAll(/<a\b[^>]*data-artist-media=[^>]*>/g)].map(m=>attrs(m[0]));
   assert.equal(cards.length,videos.length);
   assert.deepEqual(new Set(cards.map(card=>card['data-artist-media'])),new Set(videos.map(v=>v.key)));
   for (const card of cards) {
    const video=videos.find(v=>v.key===card['data-artist-media']);
    assert.equal(card['data-video-id'],video.videoId);
    const dest=new URL(card.href,'https://host.example');
    assert.equal(dest.origin,'https://host.example');
    if(dest.pathname==='/'){
     const work=catalog.works.find(w=>w.id===dest.searchParams.get('work'));
     assert.ok(work?.groupIds.includes(artist.groupId));
     if(video.workId)assert.equal(work.id,video.workId);
     assert.equal(dest.searchParams.get('video'),video.type==='stage'?'stage':null);
     assert.equal(video.type==='stage'?work.stage?.videoId:new URL(work.url).searchParams.get('v'),video.videoId);
    }else{
     assert.equal(dest.pathname,artist.path);
     assert.equal(dest.searchParams.get('media'),video.key);
     assert.equal(dest.searchParams.get('format'),video.type);
    }
   }
  } else {
   assert.ok(open.length||ownMedia.length||targets.some(u=>externalPlayable.test(u.hostname)), 'reachable work or video');
  }
  noNestedInteractive(html);
 });
 for (const [n,suffix] of ['A','B'].entries()) test(`real ${artist.slug} member ${suffix} preserves portrait, work identity and read mode`,async()=>{
  const member=members[n];
  const html=await renderArtist(artist,{section:'members',member:member.id},catalog);
  assert.ok(html.includes(`data-member-id="${member.id}"`));
  assert.ok(!html.includes(`data-member-id="${members[1-n].id}"`));
  const identity=html.slice(html.indexOf('data-member-module="identity"'));
  const portrait=images(identity).find(image=>image.alt?.trim());
  assert.ok(portrait?.alt?.trim(),'member portrait must be labelled');
  if (portrait.src.startsWith('/api/media?')) {
   const attachment=member.photo;
   assert.equal(attachment?.table,'members');
   assert.equal(attachment.recordId,member.id);
   assert.equal(portrait.src,`/api/media?table=members&record=${member.id}&index=${attachment.index}`);
  } else {
   assert.match(portrait.src,/^\/(?:artist|design-review)\//);
   assert.ok(fs.existsSync(path.resolve(__dirname,'../public','.'+portrait.src)));
  }
  const other=await renderArtist(artist,{section:'members',member:members[1-n].id},catalog);
  const otherPortrait=images(other.slice(other.indexOf('data-member-module="identity"'))).find(image=>image.alt?.trim());
  assert.notEqual(portrait.src,otherPortrait.src,'two distinct members need distinct portraits');
  noNestedInteractive(html);
  if(privateModes.has(artist.slug)){
   const id=bundle.fixtureMemberId(index,suffix),work=bundle.fixtureWorkId(index,suffix);
   const route=`${artist.path}?section=members&member=${id}`;
   const src=`/api/media?table=ratings&record=recFixtureImageRating${index}${suffix}&index=0`;
   const live=await render(artist,route,'live'), snapshot=await render(artist,route,'snapshot');
   assert.ok(images(live).some(img=>img.src===src),'eligible live photo must retain exact attachment identity');
   assert.ok(!images(snapshot).some(img=>img.src===src),'snapshot must not use the live photo URL');
   const photo=images(live).find(img=>img.src===src);
   assert.ok(photo.alt?.trim());
   assert.equal(photo.decoding,'async');
   assert.equal(photo.loading,'lazy');
   for (const detail of [live,snapshot]){
    assert.ok(detail.includes(work));
    assert.match(detail,/0\.0/);
    assert.ok(!detail.includes(`record=recFixtureImageRating${index}${n?'A':'B'}`));
   }
  }
 });
}
test('shared photo controls keep explicit priorities, aspect, video identities and two numeric zero scores',async()=>{
 const artist=registry.find(row=>row.slug==='aespa');
 const overview=await render(artist,artist.path,'live');
 const portraits=images(overview).filter(img=>img.src?.startsWith('/image-fixture/portrait-'));
 assert.equal(portraits.length,2);
 for(const img of portraits){
  assert.ok(img.alt);assert.equal(img.loading,'lazy');assert.equal(img.decoding,'async');assert.notEqual(img.fetchPriority,'high');
 }
 const listing=await render(artist,artist.path+'?section=works','live');
 const thumbs=images(listing).filter(img=>img.src?.startsWith('https://i.ytimg.com/vi/'));
 assert.deepEqual(new Set(thumbs.map(img=>img.src)),new Set(['FixtUrE0001','FixtUrE0002'].map(id=>`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)));
 for(const thumb of thumbs){assert.equal(thumb.loading,'lazy');assert.equal(thumb.decoding,'async');}
 assert.ok((listing.match(/0\.0/g)||[]).length>=2);
 noNestedInteractive(overview);noNestedInteractive(listing);
});
test('actual 51 route closure has no data/API substitution outside the declared test-only input ports',()=>{
 assert.equal(Object.keys(bundle.routes).length,51);const inputs=proof.inputs.join('\n');
 for(const row of registry)assert.ok(inputs.includes(`app/artists/${row.slug}/page.tsx`));
 assert.ok(inputs.includes('components/reliable-image.tsx'));assert.ok(inputs.includes('lib/idol/image-presentation.ts'));
 assert.ok(inputs.includes('components/use-artist-scroll.ts'));assert.doesNotMatch(inputs,/data\/snapshot|app\/api\//);
 for(const alias of proof.aliases)assert.ok(!path.relative(__dirname,alias.replacement).startsWith('..'));
});

test('career integration keeps the actual component and formatter with explicit synthetic metadata only',()=>{assert.ok(proof.inputs.includes('components/member-career-facts.tsx'));assert.ok(proof.inputs.includes('lib/idol/member-career-runtime.ts'));assert.ok(proof.inputs.includes('lib/idol/member-career-core.ts'));assert.ok(!proof.inputs.some(input=>input.startsWith('data/')));assert.ok(proof.aliases.some(a=>a.original==='@/data/runtime/member-careers/periods.json'&&a.replacement.split(path.sep).join('/').endsWith('/content-aliases/career-runtime-periods.ts')));});

test('runtime/editorial migration retains actual redesigned image components',()=>{
 for(const input of ['components/candidate/idle-design.tsx','components/candidate/billlie-design.tsx','components/seven-redesign/artist.tsx','components/candidate/newjeans-design.tsx','components/candidate/badvillain-design.tsx','components/hearts2hearts-artist.tsx','components/izna/editorial.tsx','lib/idol/artist-navigation.ts','lib/idol/triples-design-catalog.ts'])assert.ok(proof.inputs.includes(input),input);
});
