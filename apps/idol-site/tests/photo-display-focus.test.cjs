const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file){const out={};vm.runInNewContext('(function(exports){'+ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'})')(out);return out;}
const {photoDisplayFocus}=load('lib/idol/photo-display-focus.ts'),fixture=JSON.parse(fs.readFileSync('tests/fixtures/photo-import-soldelta4-15.json')),nxde=fixture.entries.filter(e=>e.candidate.song==='Nxde');
test('only the exact five approved candidate and original-SHA pairs select the right photograph',()=>{
 assert.equal(nxde.length,5);
 for(const {candidate:c,displayFocus:expected}of nxde){const focus=photoDisplayFocus(c.id,c.sha256);assert.ok(focus);assert.deepEqual(JSON.parse(JSON.stringify(focus.sourceCrop)),expected.sourceCrop);assert.equal(focus.sourceWidth,c.width);assert.equal(focus.sourceHeight,c.height);assert.equal(focus.qualityTier,'card_only');assert.equal(focus.maxEffectiveWidth,350);assert.equal(focus.preserveOriginal,true);assert.ok(Object.isFrozen(focus));assert.ok(Object.isFrozen(focus.sourceCrop));assert.equal(focus.sourceCrop.x+focus.sourceCrop.width,c.width);assert.equal(focus.sourceCrop.y+focus.sourceCrop.height,c.height);}
});
test('no broad song, member, suffix, hash-only or forged pair can request this crop',()=>{
 for(const {candidate:c}of nxde){for(const [id,sha]of [[undefined,c.sha256],[c.id,undefined],['Nxde',c.sha256],[c.memberId,c.sha256],[c.ratingId,c.sha256],[c.id,'0'.repeat(64)],['prefix'+c.id,c.sha256],[c.id,c.sha256.toUpperCase()]])assert.equal(photoDisplayFocus(id,sha),null);for(const {candidate:other}of nxde)if(other.id!==c.id)assert.equal(photoDisplayFocus(c.id,other.sha256),null);}
 for(const {candidate:c}of fixture.entries.filter(e=>e.candidate.song!=='Nxde'))assert.equal(photoDisplayFocus(c.id,c.sha256),null);
 assert.equal(photoDisplayFocus(null,null),null);
});
test('focus scales down proportionally without exposing left pixels or enlarging the 350px photograph',()=>{
 const focus=photoDisplayFocus(nxde[0].candidate.id,nxde[0].candidate.sha256),crop=focus.sourceCrop;
 for(const [availableWidth,heightCap]of [[200,600],[350,612],[900,1000],[350,480]]){const scale=Math.min(1,availableWidth/crop.width,heightCap/crop.height),w=crop.width*scale,h=crop.height*scale;assert.ok(w<=350);assert.ok(w<=availableWidth);assert.ok(h<=heightCap);assert.ok(Math.abs(w/h-350/612)<1e-12);assert.equal(-crop.x*scale+(crop.x+crop.width)*scale,w);}
});
