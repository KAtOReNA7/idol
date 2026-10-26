import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const design=read('data/geenius-native-design.json'),content=read('data/geenius-artist.json'),editorial=read('data/geenius-review-editorial.json');
const compiled=await build({stdin:{contents:"export {geeniusOriginalPhoto as original} from './lib/idol/geenius-photos';export {geeniusNativeBinding as binding} from './lib/idol/candidate/geenius-native';export {safeArtistReturn as safe} from './lib/idol/artist-navigation';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
const m={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module:m,exports:m.exports,URL,URLSearchParams});
const {original,binding,safe}=m.exports;
test('all retained photographs, release covers and exact video thumbnails preserve their bytes',()=>{
 const assets=read('data/geenius-review-assets.json').assets;
 assert.equal(new Set(assets.map(a=>a.url)).size,assets.length);
 for(const a of assets){const b=fs.readFileSync(new URL('../public'+a.url,import.meta.url));assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);}
 for(const url of [content.hero.image,...Object.values(content.portraits).map(m=>m.image)]){assert.ok(assets.some(a=>a.url===original(url)));}
 for(const v of design.works)assert.ok(v.preview.endsWith('preview-'+v.videoId+'.jpg'));
 assert.equal(original('/artist/other/group-display.webp'),'/artist/other/group-display.webp');
});
test('official records keep solo releases and five interactive perspectives separate',()=>{
 assert.equal(design.members.length,5);assert.equal(design.releases.length,3);assert.equal(design.works.length,7);
 assert.equal(design.releases.find(r=>r.key==='daydream').date,'2024-06-08');assert.equal(design.releases.find(r=>r.key==='missing-crown-prince-ost').date,'2024-07-03');
 assert.ok(design.releases.filter(r=>r.key!=='voyage').every(r=>r.memberIds.join() === 'recvxAPQCFth1h'));
 const interactive=design.works.filter(v=>v.title==='I.L.Y');assert.equal(interactive.length,5);assert.equal(new Set(interactive.map(v=>v.memberIds[0])).size,5);assert.ok(interactive.every(v=>v.memberIds.length===1&&v.releaseKey===''));
 assert.ok(design.works.filter(v=>v.type==='STAGE').every(v=>v.memberIds.length===0));assert.deepEqual(design.events.map(e=>e.date),[...design.events.map(e=>e.date)].sort());
 assert.ok(!design.releases.some(r=>/Love|Spoiler/.test(r.title)));
});
test('native video bindings preserve zero/null and reject wrong work, group and stage identities',()=>{
 for(const video of design.works.filter(v=>v.id.startsWith('rec'))){
  const base=editorial.works.find(w=>w.id===video.id),work={...base,groupIds:[editorial.group.id],score:0,stageScore:0,stage:base.stage?{...base.stage,scoreBinding:{videoId:base.stage.videoId,initializedAt:'2026-01-01T00:00:00Z',initialScore:null}}:null};
  const valid=binding(video,[work]);assert.ok(valid);assert.equal(valid.stage,video.type==='STAGE');assert.equal(valid.score,0);assert.equal(binding(video,[{...work,score:null,stageScore:null}]).score,null);
  assert.equal(binding({...video,videoId:'wrongVideo1'},[work]),null);assert.equal(binding(video,[{...work,groupIds:['recOther']}]),null);
  if(video.type==='STAGE'){const invalid=binding(video,[{...work,stage:{...work.stage,scoreBinding:null}}]);assert.equal(invalid.score,null);assert.equal(invalid.scoreBindingValid,false);}
 }
 assert.equal(binding({id:'recUnbound',type:'MV',videoId:'unknown1234'},editorial.works),null);
});
test('return URLs retain filter and exact entity identity while rejecting fabricated combinations',()=>{
 for(const r of design.releases){const u='/artists/geenius?section=works&q=Good&release='+r.key;assert.equal(safe(u),u);}
 for(const v of design.works){const u='/artists/geenius?section=works&q=test&format='+v.type.toLowerCase()+'&media='+v.key;assert.equal(safe(u),u);}
 for(const member of design.members){const u='/artists/geenius?section=members&member='+member.id+'&q='+encodeURIComponent(member.cnName);assert.equal(safe(u),u);}
 for(const u of ['/artists/geenius?section=works&release=unknown','/artists/geenius?section=works&media=wrong','/artists/geenius?member=recOther','https://other.invalid/artists/geenius','/artists/geenius?section=works&release=best-friendz&format=stage','/artists/geenius?section=works&media=rec28ldfRTrGY0-mv-JV_2SI-raz0&format=stage'])assert.equal(safe(u),null);
});
