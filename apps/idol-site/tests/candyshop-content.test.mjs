import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const design=read('data/candyshop-native-design.json'),content=read('data/candyshop-artist.json'),editorial=read('data/candyshop-review-editorial.json');
const compiled=await build({stdin:{contents:"export {candyshopOriginalPhoto as original} from './lib/idol/candyshop-photos';export {candyshopNativeBinding as binding} from './lib/idol/candidate/candyshop-native';export {safeArtistReturn as safe} from './lib/idol/artist-navigation';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
const m={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module:m,exports:m.exports,URL,URLSearchParams});
const {original,binding,safe}=m.exports;
test('all retained photographs, release covers and exact video thumbnails preserve their bytes',()=>{
 const assets=read('data/candyshop-review-assets.json').assets;
 assert.equal(new Set(assets.map(a=>a.url)).size,assets.length);
 for(const a of assets){const b=fs.readFileSync(new URL('../public'+a.url,import.meta.url));assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);}
 for(const url of [content.hero.image,...Object.values(content.portraits).map(m=>m.image)]){assert.notEqual(original(url),url);assert.ok(assets.some(a=>a.url===original(url)));}
 for(const v of design.works)assert.ok(v.preview.endsWith('video-'+v.videoId+'.jpg'));
 assert.equal(original('/artist/other/group-display.webp'),'/artist/other/group-display.webp');
});
test('Yuina stays historical and is not replaced by Julia in Good Girl participation',()=>{
 const yuina=design.members.find(m=>m.stageName==='Yuina'),julia=design.members.find(m=>m.stageName==='Julia');
 assert.equal(design.members.length,5);assert.equal(yuina.roster,'historical');assert.equal(design.members.filter(m=>m.roster==='official-profile').length,4);
 const good=design.works.find(v=>v.videoId==='RkBEM8Q3qMQ');assert.ok(good.memberIds.includes(yuina.id));assert.ok(!good.memberIds.includes(julia.id));
 for(const id of ['J2A3jzgtRjI','mS_ol5Wa8Ac']){const v=design.works.find(v=>v.videoId===id);assert.ok(v.memberIds.includes(julia.id));assert.ok(!v.memberIds.includes(yuina.id));}
 assert.ok(design.works.filter(v=>v.type==='STAGE').every(v=>v.memberIds.length===0));
 assert.ok(design.releases.every(r=>r.memberIds.length===0));
 assert.ok(design.events.every(e=>!e.id.includes('departure')));
});
test('native video bindings preserve zero/null and reject wrong work, group and stage identities',()=>{
 for(const video of design.works.filter(v=>v.id.startsWith('rec'))){
  const base=editorial.works.find(w=>w.id===video.id),work={...base,groupIds:[editorial.group.id],score:0,stageScore:0,stage:base.stage?{...base.stage,scoreBinding:{videoId:base.stage.videoId,initializedAt:'2026-01-01T00:00:00Z',initialScore:null}}:null};
  const valid=binding(video,[work]);assert.ok(valid);assert.equal(valid.stage,video.type==='STAGE');assert.equal(valid.score,0);assert.equal(binding(video,[{...work,score:null,stageScore:null}]).score,null);
  assert.equal(binding({...video,videoId:'wrongVideo1'},[work]),null);assert.equal(binding(video,[{...work,groupIds:['recOther']}]),null);
  if(video.type==='STAGE'){const invalid=binding(video,[{...work,stage:{...work.stage,scoreBinding:null}}]);assert.equal(invalid.score,null);assert.equal(invalid.scoreBindingValid,false);}
 }
 const clip=design.works.find(v=>v.videoId==='rSaTAyy8Ia4');assert.equal(binding(clip,editorial.works),null);assert.ok(!editorial.works.some(w=>w.id===clip.id));
});
test('return URLs retain filter and exact entity identity while rejecting fabricated combinations',()=>{
 for(const r of design.releases){const u='/artists/candyshop?section=works&q=Good&release='+r.key;assert.equal(safe(u),u);}
 for(const v of design.works){const u='/artists/candyshop?section=works&q=test&format='+v.type.toLowerCase()+'&media='+v.key;assert.equal(safe(u),u);}
 for(const member of design.members){const u='/artists/candyshop?section=members&member='+member.id+'&q='+encodeURIComponent(member.cnName);assert.equal(safe(u),u);}
 for(const u of ['/artists/candyshop?section=works&release=unknown','/artists/candyshop?section=works&media=wrong','/artists/candyshop?member=recOther','https://other.invalid/artists/candyshop','/artists/candyshop?section=works&release=hashtag&format=stage','/artists/candyshop?section=works&media=rec28ldfRTrGMp-mv-RkBEM8Q3qMQ&format=stage'])assert.equal(safe(u),null);
});
