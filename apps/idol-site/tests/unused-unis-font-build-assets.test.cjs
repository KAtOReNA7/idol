const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const root = process.env.GROUP_FONT_TEST_ROOT || path.resolve(__dirname, '..');
const script = path.resolve(__dirname, '../scripts/audit-unused-unis-font-build-assets.mjs');
const entries = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scripts/unused-unis-font-build-assets-manifest.json'), 'utf8')).files;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const put = (root, relative, body) => {const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);};
const audit = async dir => (await import(pathToFileURL(script))).auditUnusedUnisFontBuildAssets(dir);
async function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unis-font-prune-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  const udtt=JSON.parse(fs.readFileSync(path.join(root,'scripts/udtt-font-retention-manifest.json'),'utf8'));
  const {resolveAuditedCarriers}=await import(pathToFileURL(path.join(root,'scripts/audit-built-carriers.mjs')));
  const previousCarriers=Object.fromEntries(Object.entries(udtt.runtimeGuards).filter(([p])=>p.includes('/_next/')));
  const carriers=resolveAuditedCarriers(root,previousCarriers,'udtt-native-design',udtt.importNormalizedCarriers);
  put(dir,'scripts/udtt-font-retention-manifest.json',JSON.stringify(udtt));
  for(const name of [...Object.keys(udtt.runtimeGuards).filter(p=>!p.includes('/_next/')),...Object.keys(carriers)])put(dir,name,fs.readFileSync(path.join(root,name)));
  const publicPaths = ['/'+udtt.sharedFontProvenance.path, ...udtt.retainedFonts.map(f=>f.path), '/fonts/udtt/fonts.css', '/artist/udtt/figma-native.css', ...entries.flatMap(e => [e.path,e.replacement]), '/fonts/InstrumentSerif-Italic.ttf','/fonts/unis/NotoSansCJK-LICENSE.txt'];
  for (const url of publicPaths) {
    const bytes = fs.readFileSync(path.join(root,'public',url));
    put(dir,path.join('public',url),bytes);put(dir,path.join('dist/client',url),bytes);
  }
  const css = entries.map(e=>`@font-face{font-family:UNISBody;src:url('${e.replacement}') format('woff2')}`).join('\n');
  put(dir,'components/design-review/unis-design-review.css',css);
  put(dir,'dist/client/_next/static/css/unis-design-review.fixture.css',css);
  put(dir,'dist/server/index.js','const publicFiles=new Set(`'+publicPaths.sort().join(',')+'`.split(`,`));');
  return dir;
}
test('full font derivatives, retained sources and licenses are immutable pinned artifacts', () => {
  for (const e of entries) {
    assert.equal(fs.statSync(path.join(root,'public',e.path)).size,e.bytes);
    assert.equal(hash(path.join(root,'public',e.path)),e.sha256);
    assert.equal(fs.statSync(path.join(root,'public',e.replacement)).size,e.replacementBytes);
    assert.equal(hash(path.join(root,'public',e.replacement)),e.replacementSha256);
    assert.equal(fs.readFileSync(path.join(root,'public',e.replacement)).subarray(0,4).toString(),'wOF2');
  }
  assert.equal(hash(path.join(root,'public/fonts/InstrumentSerif-Italic.ttf')),'08939b8bdf534afec24ae0ef5e03f948940cd9a8fe08e7fecbad040e62327385');
  assert.equal(hash(path.join(root,'public/fonts/InstrumentSerif-Italic.woff2')),'4f7aacc18d491dea8778bbc591db87b9455625899ed5f913957e7fd82604c294');
  assert.equal(hash(path.join(root,'public/fonts/unis/NotoSansCJK-LICENSE.txt')),'849f4ea9c214fa4ac3593b770c699f387534b11ce671264c1b10d85bdcb5997b');
  assert.equal(hash(path.join(root,'public/fonts/InstrumentSerif-OFL.txt')),'129ed7618959716959f2941fdd5b49e0ad6e6c1d78726761786a00253d865521');
});
test('only the two promoted designs change font src; descriptors and shared TTF consumers stay', () => {
  const unis=fs.readFileSync(path.join(root,'components/design-review/unis-design-review.css'),'utf8');
  assert.ok(unis.includes("src:url('/fonts/unis/NotoSansSC-Regular.woff2') format('woff2');font-style:normal;font-weight:400 500;font-display:swap"));
  assert.ok(unis.includes("src:url('/fonts/unis/NotoSansSC-Bold.woff2') format('woff2');font-style:normal;font-weight:600 900;font-display:swap"));
  assert.ok(unis.includes("src:url('/fonts/unis/URWGothic-Demi.otf') format('opentype')"));
  const kep=fs.readFileSync(path.join(root,'components/design-review/kep1er-figma-design.css'),'utf8');
  assert.ok(kep.includes("src:url('/fonts/InstrumentSerif-Italic.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap"));
  for (const p of ['app/newjeans-experience.css','app/artists/newjeans/newjeans-artist.css','app/artists/nmixx/nmixx-artist.css','app/artists/illit/artist.css'])
    assert.ok(fs.readFileSync(path.join(root,p),'utf8').includes('/fonts/InstrumentSerif-Italic.ttf'),p);
});
test('audit returns exactly two build-only paths and never writes public/shared assets', async t => {
  const dir=await fixture(t), plan=await audit(dir);
  assert.deepEqual(plan,entries.map(e=>({file:'dist/client'+e.path,bytes:e.bytes})));
  assert.equal(plan.reduce((sum,x)=>sum+x.bytes,0),644580);
  for(const e of entries) assert.equal(hash(path.join(dir,'public',e.path)),e.sha256);
  assert.ok(fs.existsSync(path.join(dir,'dist/client/fonts/InstrumentSerif-Italic.ttf')));
  for(const p of plan) assert.ok(fs.existsSync(path.join(dir,p.file)));
});
test('already-pruned build copies are idempotent while public originals are still required', async t => {
  const dir=await fixture(t);for(const e of entries)fs.unlinkSync(path.join(dir,'dist/client',e.path));
  assert.deepEqual(await audit(dir),[]);
  fs.unlinkSync(path.join(dir,'public',entries[0].path));
  await assert.rejects(audit(dir),/inventory|integrity/);
});
for(const [name,relative] of [
  ['public original','public'+entries[0].path],['public derivative','public'+entries[0].replacement],
  ['built original','dist/client'+entries[0].path],['built derivative','dist/client'+entries[0].replacement],
]) test(`rejects a changed ${name}`,async t=>{const dir=await fixture(t);fs.appendFileSync(path.join(dir,relative),'x');await assert.rejects(audit(dir),/integrity/);});
for(const [name,file,text] of [
  ['old source consumer','app/consumer.ts',`const font='${entries[0].path}';`],
  ['old emitted consumer','dist/client/consumer.js',`const font='${entries[0].path}';`],
  ['escaped old consumer','data/consumer.json',JSON.stringify({font:entries[0].path}).replaceAll('/','\\/')],
  ['dynamic filename','app/consumer.ts',"const font='/fonts/unis/'+'NotoSansSC-'+weight+'.woff';"],
]) test(`rejects ${name}`,async t=>{const dir=await fixture(t);put(dir,file,text);await assert.rejects(audit(dir),/consumer|dynamic/);});
test('rejects partial or duplicate public inventories',async t=>{
  const dir=await fixture(t),file=path.join(dir,'dist/server/index.js'),original=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,original.replace('/fonts/InstrumentSerif-Italic.ttf,',''));
  await assert.rejects(audit(dir),/inventory/);
  fs.writeFileSync(file,original+'\n'+original);
  await assert.rejects(audit(dir),/inventory/);
});
test('rejects missing active built CSS even if the public inventory lists replacements',async t=>{
  const dir=await fixture(t);fs.unlinkSync(path.join(dir,'dist/client/_next/static/css/unis-design-review.fixture.css'));
  await assert.rejects(audit(dir),/built CSS/);
});
test('rejects runtime symlinks',async t=>{
  const dir=await fixture(t);fs.symlinkSync(path.join(dir,'components/design-review/unis-design-review.css'),path.join(dir,'components/alias.css'));
  await assert.rejects(audit(dir),/symlink/);
});
test('GENBLUE may reuse complete retained UDTT font URLs and name their retained license',async t=>{
  const dir=await fixture(t);
  put(dir,'components/genblue/bluecut.css',"@font-face{font-family:GenblueText;src:url('/fonts/udtt/NotoSansSC-01.woff2')}");
  assert.ok(fs.existsSync(path.join(dir,'public/fonts/genblue/NotoSansSC-supplements-provenance.json')));
  assert.equal((await audit(dir)).length,2);
  for(const relative of ['public/fonts/udtt/NotoSansSC-01.woff2','dist/client/fonts/udtt/NotoSansSC-20.woff2'])assert.ok(fs.existsSync(path.join(dir,relative)));
});
for(const [name,text]of [
 ['transformed retained URL',"const font='/fonts/udtt/NotoSansSC-01.woff2'.replace('udtt','unis').replace('-01','-Regular').replace('woff2','woff');"],
 ['unknown shared subset',"const font='/fonts/udtt/NotoSansSC-21.woff2';"],
 ['assembled shared font',"const font='/fonts/udtt/'+'NotoSansSC-'+n+'.woff2';"],
 ['obsolete WOFF beside a valid shared font',"const fonts=['/fonts/udtt/NotoSansSC-01.woff2','/fonts/unis/NotoSansSC-Regular.woff'];"],
])test('rejects '+name,async t=>{const dir=await fixture(t);put(dir,'components/genblue/consumer.ts',text);await assert.rejects(audit(dir),/consumer|dynamic/);});
test('shared fonts stay mandatory when a new group reuses them',async t=>{
 const dir=await fixture(t);fs.unlinkSync(path.join(dir,'dist/client/fonts/udtt/NotoSansSC-01.woff2'));
 await assert.rejects(audit(dir),/integrity/);
});
