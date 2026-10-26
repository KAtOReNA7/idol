import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const content=read('data/vvup-artist.json'),releases=read('data/vvup-releases.json'),editorial=read('data/vvup-review-editorial.json');
test('official four portrait identities are distinct from the retained fifth historical archive',()=>{
 assert.deepEqual(Object.keys(content.portraits).sort(),['recvxAPQCFDPha','recvxAPQCFQR2I','recvxAPQCFtTIC','recvxAPQCF1Jqn'].sort());
 assert.equal(editorial.members.length,5);assert.ok(editorial.members.some(m=>m.id==='recvxAPQCFN2Tn'));
 for(const [id,p] of Object.entries(content.portraits))assert.equal(editorial.members.find(m=>m.id===id).stageName.toLowerCase(),p.stageName.toLowerCase());
});
test('seven release associations retain exact video identity and unknown actual 4 Life date',()=>{
 assert.equal(releases.entries.length,7);assert.equal(releases.entries.filter(r=>r.image).length,7);
 assert.equal(releases.entries.find(r=>r.id==='4-life').date,'');assert.match(releases.entries.find(r=>r.id==='4-life').note,/延期/);
 assert.equal(releases.entries.find(r=>r.id==='locked-on').date,'2024-04-01');
 assert.equal(releases.entries.find(r=>r.id==='doo-doom-chit').date,'2024-03-13');
 const videos=editorial.works.map(w=>new URL(w.url).searchParams.get('v'));
 assert.deepEqual(releases.entries.flatMap(r=>r.videoIds).sort(),videos.sort());
 assert.equal(editorial.works.find(w=>w.id==='rec28ldfRTrFGi').videoType,'Special Video (Full ver.)');
});
test('thirteen adopted assets retain their original bytes and independent identity bindings',()=>{
 const assets=read('data/vvup-review-assets.json').assets;assert.equal(assets.length,13);
 assert.equal(new Set(assets.map(a=>a.url)).size,13);
 for(const a of assets){const bytes=fs.readFileSync(new URL('../public'+a.url,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.ok(a.width>0&&a.height>0);}
});
test('return guard accepts all exact releases and historical member context, rejecting foreign/duplicate identities',async()=>{
 const compiled=await build({stdin:{contents:"export {safeArtistReturn} from './lib/idol/artist-navigation';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
 const m={exports:{}};vm.runInNewContext(compiled.outputFiles[0].text,{module:m,exports:m.exports,URL,URLSearchParams});const safe=m.exports.safeArtistReturn;
 for(const r of releases.entries){const url='/artists/vvup?section=records&q=VV&release='+r.id;assert.equal(safe(url),url);}
 const history='/artists/vvup?section=members&member=recvxAPQCFN2Tn&q=Hyunny&roster=history';assert.equal(safe(history),history);
 for(const url of ['/artists/vvup?release=unknown','/artists/vvup?release=vvon&release=vvon','/artists/vvup?roster=current','/artists/vvup?roster=history&roster=history','https://foreign.invalid/artists/vvup?release=vvon','/artists/saymyname?release=vvon'])assert.equal(safe(url),null,url);
});
