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
async function render(artist,route){const stream=await renderToReadableStream(React.createElement(bundle.ArtistTimelineHostProvider,{value:{catalog:bundle.imageCatalog,serverRoute:route,loading:false}},React.createElement(bundle.routes[artist.slug],{searchParams:Promise.resolve(Object.fromEntries(new URL(route,'https://image-fixture.example').searchParams))})));await stream.allReady;return new Response(stream).text();}
test.before(async()=>{const output=path.join(directory,'entry.cjs');proof=await build({outfile:output});bundle=require(output);freeze(bundle.imageCatalog);});
test.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
for(const [index,artist]of registry.entries()){
 test(`real ${artist.slug} overview: original source/alt/priority, two members, zero score and safe parent interaction`,async()=>{
  const html=await render(artist,artist.path);const imgs=images(html);
  const hero=imgs.find(image=>image.src===`/image-fixture/hero.png?host=${artist.slug}`);
  assert.ok(hero,'real hero remains in SSR, not deferred to effect/blob');
  assert.equal(hero.loading,'eager');assert.equal(hero.fetchPriority,'high');assert.equal(hero.decoding,'async');assert.ok(hero.alt);
  const portraits=imgs.filter(image=>image.src?.startsWith('/image-fixture/portrait-')||image.src?.startsWith('/api/media?table=members&'));
  if(['loona','madein'].includes(artist.slug)){
   assert.equal(portraits.length,0,'historical name index intentionally defers portraits to their real member detail');
   for(const suffix of ['A','B']){const detail=await render(artist,`${artist.path}?section=members&member=${bundle.fixtureMemberId(index,suffix)}`);assert.ok(images(detail).some(image=>image.src===`/image-fixture/portrait-${suffix.toLowerCase()}.png?host=${artist.slug}`),'both exact portraits remain reachable in member details');}
  }else assert.ok(portraits.length>=2,'both synthetic members retain their own portraits');
  for(const image of portraits){assert.equal(image.loading,'lazy');assert.notEqual(image.fetchPriority,'high');assert.equal(image.decoding,'async');}
  if(index<37)for(const image of portraits)assert.match(image.style||'',/object-fit:contain/,'verified candidate portrait remains complete rather than cropped');
  const thumbs=imgs.filter(image=>image.src?.startsWith('https://i.ytimg.com/vi/'));
  for(const image of thumbs){assert.match(image.src,/^https:\/\/i\.ytimg\.com\/vi\/FixtUrE000[12]\/hqdefault\.jpg$/);assert.equal(image.loading,'lazy');}
  assert.match(html,/FIXTURE_A/);assert.match(html,/FIXTURE_B/);assert.match(html,/0\.0/,'image branch must preserve real numeric zero');
  assert.ok(imgs.every(image=>image.src&&image.alt));noNestedInteractive(html);
 });
 test(`real ${artist.slug} works: both actual thumbnail sources and zero scores survive`,async()=>{
  const html=await render(artist,`${artist.path}?section=works`);const thumbs=images(html).filter(image=>image.src?.startsWith('https://i.ytimg.com/vi/'));
  if(['triples','loona','madein'].includes(artist.slug)){
   assert.equal(thumbs.length,0,'text-only work entries must not fetch unavailable thumbnails');
   for(const suffix of ['A','B'])assert.ok(html.includes('work='+bundle.fixtureWorkId(index,suffix)),'both original works remain reachable');
   assert.equal((html.match(/data-work-id=/g)||[]).length,2);
  }else{
  assert.ok(thumbs.some(image=>image.src==='https://i.ytimg.com/vi/FixtUrE0001/hqdefault.jpg'));
  assert.ok(thumbs.some(image=>image.src==='https://i.ytimg.com/vi/FixtUrE0002/hqdefault.jpg'));
  }
  for(const image of thumbs){assert.equal(image.loading,'lazy');assert.equal(image.decoding,'async');assert.notEqual(image.fetchPriority,'high');}
  assert.match(html,/0\.0/);noNestedInteractive(html);
 });
 for(const suffix of ['A','B'])test(`real ${artist.slug} member ${suffix}: own MV identity/source and zero dimensions preserved`,async()=>{
  const memberId=bundle.fixtureMemberId(index,suffix);const workId=bundle.fixtureWorkId(index,suffix);
  const html=await render(artist,`${artist.path}?section=members&member=${memberId}`);const imgs=images(html);
  assert.match(html,new RegExp(`FIXTURE_${suffix}`));
  assert.ok(imgs.some(image=>image.src===`/api/media?table=ratings&record=recFixtureImageRating${index}${suffix}&index=0`),'member-specific MV photo must preserve table/record/index');
  assert.ok(html.includes(workId),'correct member work target retained');
  assert.match(html,/0\.0/);noNestedInteractive(html);
 });
}
test('actual 51 route closure has no data/API substitution outside the declared test-only input ports',()=>{
 assert.equal(Object.keys(bundle.routes).length,51);const inputs=proof.inputs.join('\n');
 for(const row of registry)assert.ok(inputs.includes(`app/artists/${row.slug}/page.tsx`));
 assert.ok(inputs.includes('components/reliable-image.tsx'));assert.ok(inputs.includes('lib/idol/image-presentation.ts'));
 assert.ok(inputs.includes('components/use-artist-scroll.ts'));assert.doesNotMatch(inputs,/data\/snapshot|app\/api\//);
 for(const alias of proof.aliases)assert.ok(alias.replacement.includes('/tests/'));
});

test('career integration keeps the actual component and formatter with explicit synthetic metadata only',()=>{assert.ok(proof.inputs.includes('components/member-career-facts.tsx'));assert.ok(proof.inputs.includes('lib/idol/member-career-runtime.ts'));assert.ok(proof.inputs.includes('lib/idol/member-career-core.ts'));assert.ok(!proof.inputs.some(input=>input.startsWith('data/')));assert.ok(proof.aliases.some(a=>a.original==='@/data/runtime/member-careers/periods.json'&&a.replacement.endsWith('/content-aliases/career-runtime-periods.ts')));});

test('runtime/editorial migration retains actual redesigned image components',()=>{
 for(const input of ['components/candidate/idle-design.tsx','components/candidate/billlie-design.tsx','components/candidate/triples-design.tsx','components/candidate/newjeans-design.tsx','components/candidate/badvillain-design.tsx','components/hearts2hearts-artist.tsx','components/ive-artist.tsx','lib/idol/artist-navigation.ts','lib/idol/triples-design-catalog.ts'])assert.ok(proof.inputs.includes(input),input);
});
