import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const design=read('data/bewave-native-design.json'),content=read('data/bewave-artist.json'),editorial=read('data/bewave-review-editorial.json');
const compiled=await build({stdin:{contents:"export {bewaveOriginalPhoto} from './lib/idol/bewave-photos';export {bewaveNativeBinding} from './lib/idol/candidate/bewave-native';export {safeArtistReturn} from './lib/idol/artist-navigation';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
const m={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module:m,exports:m.exports,URL,URLSearchParams});
const {bewaveOriginalPhoto:original,bewaveNativeBinding:binding,safeArtistReturn:safe}=m.exports;
test('retained photos and new covers keep exact bytes and display images resolve to true originals',()=>{
 const assets=read('data/bewave-review-assets.json').assets;assert.ok(assets.length>=17);assert.equal(new Set(assets.map(a=>a.url)).size,assets.length);
 for(const a of assets){const bytes=fs.readFileSync(new URL('../public'+a.url,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.ok(a.width>0&&a.height>0);}
 for(const url of [content.hero.image,...Object.values(content.portraits).map(m=>m.image)]){assert.notEqual(original(url),url);assert.ok(assets.some(a=>a.url===original(url)&&a.variant==='original'));}
 assert.equal(original('/artist/other/group-display.webp'),'/artist/other/group-display.webp');
});
test('historical roster does not imply current membership or create whole-roster release participation',()=>{
 assert.equal(design.members.length,6);assert.ok(design.members.every(m=>m.roster==='historical'&&m.cnName&&content.portraits[m.id]));
 assert.ok(design.releases.slice(0,2).every(r=>r.memberIds.length===0&&/^2024-\d{2}$/.test(r.date)));
 assert.equal(editorial.works.length,2);assert.equal(design.works.filter(v=>v.id.startsWith('rec')).length,4);
 assert.ok(design.events.every(e=>!e.id.includes('departure')&&!e.id.includes('phase-end')));
});
test('exact native video slots preserve zero/null scores and reject wrong identities',()=>{
 for(const video of design.works.filter(v=>v.id.startsWith('rec'))){
  const base=editorial.works.find(w=>w.id===video.id),work={...base,groupIds:[editorial.group.id],score:0,stageScore:0,stage:base.stage?{...base.stage,scoreBinding:{videoId:base.stage.videoId,initializedAt:'2026-01-01T00:00:00Z',initialScore:null}}:null};
  const valid=binding(video,[work]);assert.ok(valid);assert.equal(valid.stage,video.type==='STAGE');assert.equal(valid.score,0);assert.equal(binding(video,[{...work,score:null,stageScore:null}]).score,null);
  assert.equal(binding({...video,videoId:'wrongVideo1'},[work]),null);assert.equal(binding(video,[{...work,groupIds:['recOther']}]),null);
  if(video.type==='STAGE'){const invalid=binding(video,[{...work,stage:{...work.stage,scoreBinding:null}}]);assert.equal(invalid.score,null);assert.equal(invalid.scoreBindingValid,false);}
 }
});
test('new duo and solo releases use named participants while the undated Special Clip stays browse-only',()=>{
 const jiun=design.members.find(m=>m.stageName==='Jiun').id,yunseul=design.members.find(m=>m.stageName==='Yunseul').id;
 const duo=design.releases.find(r=>r.key==='christmas-eve'),solo=design.releases.find(r=>r.key==='im-so-fine');
 assert.deepEqual(duo.memberIds,[jiun,yunseul]);assert.deepEqual(solo.memberIds,[jiun]);
 assert.equal(duo.catalogDate,'2025-12-09');assert.equal(solo.catalogDate,'2026-08-23');
 const clip=design.works.find(v=>v.key==='christmas-eve-special-clip');
 assert.deepEqual(clip.memberIds,[jiun,yunseul]);assert.equal(clip.date,'');assert.equal(clip.videoId,'ArzJgb9gJZk');assert.ok(!clip.id.startsWith('rec'));
 assert.equal(binding(clip,editorial.works),null);assert.ok(!editorial.works.some(w=>w.id===clip.id));
 assert.ok(!design.works.some(v=>v.releaseKey===solo.key));
});
test('allowlisted member/release/video return paths retain query state and reject fabricated or mixed identities',()=>{
 for(const r of design.releases){const u='/artists/bewave?section=works&q=Wave&release='+r.key;assert.equal(safe(u),u);}
 for(const v of design.works){const u='/artists/bewave?section=works&q=test&format='+v.type.toLowerCase()+'&media='+v.key;assert.equal(safe(u),u);}
 for(const member of design.members){const u='/artists/bewave?section=members&member='+member.id+'&q='+encodeURIComponent(member.cnName);assert.equal(safe(u),u);}
 for(const u of ['/artists/bewave?section=works&release=unknown','/artists/bewave?section=works&media=wrong','/artists/bewave?member=recOther','https://other.invalid/artists/bewave','/artists/bewave?section=works&release=bewave&format=stage','/artists/bewave?section=works&media=rec28ldfRTrGEy-mv-BbcxmtNaesk&format=stage'])assert.equal(safe(u),null);
});
