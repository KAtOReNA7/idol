import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const design=read('data/youngposse-native-design.json'),content=read('data/youngposse-artist.json'),editorial=read('data/youngposse-review-editorial.json');
const compiled=await build({stdin:{contents:"export {youngposseOriginalPhoto} from './lib/idol/youngposse-photos';export {youngposseNativeBinding} from './lib/idol/candidate/youngposse-native';export {safeArtistReturn} from './lib/idol/artist-navigation';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
const m={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module:m,exports:m.exports,URL,URLSearchParams});
const {youngposseOriginalPhoto:original,youngposseNativeBinding:binding,safeArtistReturn:safe}=m.exports;
test('all 27 verified assets retain exact bytes; display photos resolve to real originals',()=>{
 const assets=read('data/youngposse-review-assets.json').assets;assert.equal(assets.length,27);assert.equal(new Set(assets.map(a=>a.url)).size,27);
 for(const a of assets){const bytes=fs.readFileSync(new URL('../public'+a.url,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.ok(a.width>0&&a.height>0);}
 for(const url of [content.hero.image,...Object.values(content.portraits).map(m=>m.image)]){assert.notEqual(original(url),url);assert.ok(assets.some(a=>a.url===original(url)&&a.variant==='original'));assert.match(original(url),/-original\.(jpg|png)$/);}
 assert.equal(original('/artist/vvup/batch-b-20261016-webp-v1/group-display.webp'),'/artist/vvup/batch-b-20261016-webp-v1/group-display.webp');
});
test('the older 18 image pins and two source guards remain byte-identical',()=>{
 const manifest=read('scripts/youngposse-original-retention-manifest.json');
 for(const [file,pin] of Object.entries(manifest.runtimeGuards)){const bytes=fs.readFileSync(new URL('../'+file,import.meta.url));assert.equal(bytes.length,pin.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256);}
 for(const pin of manifest.retainedImages){const bytes=fs.readFileSync(new URL('../public'+pin.path,import.meta.url));assert.equal(bytes.length,pin.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256);}
});
test('release uncertainty and subunit membership stay distinct from the whole official roster',()=>{
 assert.equal(design.members.length,5);assert.equal(design.releases.length,15);assert.equal(design.releases.find(r=>r.key==='youngposse-street-carol').date,null);
 assert.deepEqual(design.releases.find(r=>r.key==='youngposse-haze-unit').memberIds,['recvxAPQCFTDpN','recvxAPQCFWkr2','recvxAPQCFg3or']);
 assert.ok(design.works.filter(v=>v.label==='小分队 MV').every(v=>v.memberIds.length===0));
 assert.equal(design.works.length,22);assert.equal(editorial.works.length,14);
});
test('native binding preserves zero, null, exact slot and same-video distinct slots',()=>{
 for(const video of design.works){
  const base=editorial.works.find(w=>w.id===video.id),work={...base,groupIds:[editorial.group.id],score:0,stageScore:0,stage:base.stage?{...base.stage,scoreBinding:{videoId:base.stage.videoId,initializedAt:'2026-01-01T00:00:00Z',initialScore:null}}:null};
  const valid=binding(video,[work]);assert.ok(valid,video.key);assert.equal(valid.stage,video.type==='STAGE');assert.equal(valid.score,0);
  assert.equal(binding(video,[{...work,score:null,stageScore:null}]).score,null);
  assert.equal(binding({...video,videoId:'wrongVideo1'},[work]),null);assert.equal(binding(video,[{...work,groupIds:['recOther']}]),null);
  if(video.type==='STAGE'){const invalid=binding(video,[{...work,stage:{...work.stage,scoreBinding:null}}]);assert.equal(invalid.score,null);assert.equal(invalid.scoreBindingValid,false);}
 }
 const street=design.works.filter(v=>v.id==='rec28ldfRTrGwK');assert.equal(street.length,2);assert.equal(street[0].videoId,street[1].videoId);assert.notEqual(street[0].key,street[1].key);
});
test('precise release, member and video returns retain search; invalid identities are rejected',()=>{
 for(const r of design.releases){const u='/artists/youngposse?section=works&q=Haze&release='+r.key;assert.equal(safe(u),u);}
 for(const v of design.works){const u='/artists/youngposse?section=works&q=test&format='+v.type.toLowerCase()+'&media='+v.key;assert.equal(safe(u),u);}
 for(const member of design.members){const u='/artists/youngposse?section=members&member='+member.id+'&q='+encodeURIComponent(member.cnName);assert.equal(safe(u),u);}
 for(const u of ['/artists/youngposse?section=works&release=unknown','/artists/youngposse?section=works&media=wrong','/artists/youngposse?member=recOther','https://other.invalid/artists/youngposse'])assert.equal(safe(u),null);
});
