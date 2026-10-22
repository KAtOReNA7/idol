/* eslint-disable @typescript-eslint/no-require-imports -- isolated Node component regression */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),sharp=require('sharp');
const manifest=JSON.parse(fs.readFileSync('docs/meovv-roster-portraits.json','utf8'));
const harness=fs.readFileSync('tests/candidate-density.test.cjs','utf8').split('for(const [slug,count]')[0];
const context={require,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout};
vm.runInNewContext(harness+';globalThis.renderCandidate=renderer;globalThis.makeScenario=scenario;',context);
function scene(){const {c,data}=context.makeScenario('meovv',5);data.members=data.members.map((member,i)=>({...member,id:manifest.entries[i].memberId,stageName:manifest.entries[i].stageName}));return {c,data};}
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
test('all five display images retain source and output hashes, square dimensions, and smaller files',async()=>{
 assert.equal(manifest.entries.length,5);assert.equal(new Set(manifest.entries.map(e=>e.memberId)).size,5);
 for(const entry of manifest.entries){
  for(const key of ['source','derivative']){const asset=entry[key],bytes=fs.readFileSync('public'+asset.image),metadata=await sharp(bytes).metadata();assert.equal(sha(bytes),asset.sha256);assert.equal(bytes.length,asset.bytes);assert.equal(metadata.width,asset.width);assert.equal(metadata.height,asset.height);assert.equal(metadata.width,metadata.height);assert.equal(metadata.space,'srgb');}
  assert.equal(entry.derivative.width,Math.min(1200,entry.source.width));assert.ok(entry.derivative.bytes<entry.source.bytes);
  // Compare full-frame images at a conservative 400 CSS-pixel display size.
  // This guards gross crop/color/identity mistakes; it is not a substitute for visual QA.
  const resized=await sharp('public'+entry.source.image).resize(manifest.pipeline.resize).raw().toBuffer({resolveWithObject:true});
  const reference=await sharp(resized.data,{raw:resized.info}).resize({width:400}).raw().toBuffer();
  const display=await sharp('public'+entry.derivative.image).resize({width:400}).raw().toBuffer();
  let error=0;const channelDelta=[0,0,0];for(let i=0;i<reference.length;i++){error+=Math.abs(reference[i]-display[i]);channelDelta[i%3]+=display[i]-reference[i];}
  assert.ok(error/reference.length<2,entry.stageName+' full-frame mean absolute error');
  for(const delta of channelDelta)assert.ok(Math.abs(delta/(reference.length/3))<1,entry.stageName+' channel mean drift');
 }
});
test('roster alone selects matching identity derivatives and preserves lazy loading, framing and original detail images',()=>{
 const {c,data}=scene(),before=JSON.stringify({c,data});
 for(const section of ['overview','members']){
  const html=context.renderCandidate(data,'/artists/meovv?section='+section).render(c);
  for(const entry of manifest.entries){const card=html.match(new RegExp('<button[^>]*data-artist-member-trigger="'+entry.memberId+'"[\\s\\S]*?</button>'))?.[0];assert.ok(card,entry.stageName);assert.ok(card.includes('src="'+entry.derivative.image+'"'));assert.match(card,/loading="lazy"/);assert.match(card,/fetchPriority="auto"/);assert.match(card,/decoding="async"/);assert.match(card,/object-fit:contain/);assert.doesNotMatch(card,/srcSet=|sizes=|<button[^>]*<button/);}
 }
 for(const entry of manifest.entries){const html=context.renderCandidate(data,'/artists/meovv?section=members&member='+entry.memberId).render(c);assert.ok(html.includes('src="'+entry.source.image+'"'));assert.ok(!html.includes(entry.derivative.image));}
 assert.equal(JSON.stringify({c,data}),before);
});
test('foreign identities, changed names, changed source URLs, archive photos and missing photos never get aliased',()=>{
 const {c,data}=scene(),loader=context.renderCandidate(data,'/artists/meovv');
 const {meovvRosterPortrait}=loader.load('lib/idol/candidate/meovv-roster-portrait.ts');
 for(const entry of manifest.entries){const member={id:entry.memberId,stageName:entry.stageName};assert.equal(meovvRosterPortrait(member,entry.source.image),entry.derivative.image);
  for(const source of [null,undefined,'/new-portrait.jpg','/api/media?table=members&record='+member.id+'&index=0'])assert.equal(meovvRosterPortrait(member,source),source);
  assert.equal(meovvRosterPortrait({...member,id:'foreign'},entry.source.image),entry.source.image);assert.equal(meovvRosterPortrait({...member,stageName:'renamed'},entry.source.image),entry.source.image);
 }
 // Missing/updated content takes its normal source through the actual component too.
 c.portraits[data.members[0].id].image='/new-portrait.jpg';const html=loader.render(c);assert.match(html,/src="\/new-portrait.jpg"/);assert.ok(!html.includes(manifest.entries[0].derivative.image));
});
test('static derivative retries retain the exact single source and invalidate stale generations',()=>{
 const {data}=scene(),loader=context.renderCandidate(data,'/artists/meovv');
 const {createImagePresentation,commitImageResult,retryImagePresentation,imageAttemptSource}=loader.load('lib/idol/image-presentation.ts');
 for(const entry of manifest.entries){const initial=createImagePresentation(entry.derivative.image,entry.memberId),failed=commitImageResult(initial,initial.generation,'error'),retry=retryImagePresentation(failed,failed.generation,10000,0);assert.equal(retry.attempt,1);assert.equal(retry.status,'loading');assert.notEqual(retry.generation,failed.generation);assert.equal(imageAttemptSource(retry.source,retry.attempt),entry.derivative.image);assert.equal(commitImageResult(retry,failed.generation,'loaded'),retry);}
});
