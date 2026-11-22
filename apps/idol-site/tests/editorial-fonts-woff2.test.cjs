const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {artistStyle, journalStyle, importedStyle, assertFace, assertStack} = require('./helpers/routed-fonts.cjs');
const root=path.resolve(__dirname,'..');
const fonts=[
 {name:'PlayfairDisplay-Variable',ttf:'c40f2293766a503bc70cce9e512ef844a4ccb7cbcde792fe2ea31d191917d8d6',woff:'4297e9ec39f1b8157623d048fb99eab03c90e482669599e8fc662ee178994c49',size:106440,license:'playfairdisplay-OFL.txt',licenseHash:'566be814f8e96e93dfa16101331557eb6b5467e9e03f627c0910fe93ca12300e'},
 {name:'DMSans-Variable',ttf:'8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d',woff:'40c3837c53c103a38fbce7faaa590b76edd61a8ede14672eb1e2f7eab0e0c6a4',size:88820,license:'dmsans-OFL.txt',licenseHash:'9af36190332437f5ecd09974de43c1f7c77a310a996cdd8ceb25628b458840e1'}
];
const bytes=f=>fs.readFileSync(path.join(root,'public/fonts',f));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const font of fonts){
 test(font.name+' retains original source/license and deterministic complete WOFF2',()=>{
  assert.equal(hash(bytes(font.name+'.ttf')),font.ttf);assert.equal(hash(bytes(font.license)),font.licenseHash);
  const output=bytes(font.name+'.woff2');assert.equal(output.length,font.size);assert.equal(output.subarray(0,4).toString(),'wOF2');assert.equal(hash(output),font.woff);
 });
}

test('SAY MY NAME loads Nunito Sans and Oswald on its artist and work pages', () => {
  const home = artistStyle('saymyname', './saymyname-artist.css');
  const shared = importedStyle('app/page.tsx', './work-theme-tokens.css');
  const journal = journalStyle('saymyname', false);
  for (const sheet of [home, shared]) {
    assertFace(sheet, 'SmnBody', ['/fonts/NunitoSans-Variable.woff2', '/fonts/NunitoSans-Variable.ttf'], '200 900');
    assertFace(sheet, 'SmnNarrow', ['/fonts/Oswald-Variable.ttf'], '200 700');
  }
  assertFace(journal, 'SmnNarrow', ['/fonts/Oswald-Variable.ttf'], '200 700');
  assertStack(home, 'SmnBody,var(--font-body),sans-serif');
  assertStack(shared, 'SmnBody,Noto Sans SC,sans-serif');
  assertStack(journal, 'SmnNarrow,Arial Narrow,sans-serif');
});

test('IVE LOVE DIVE loads its real display, sans and Chinese fallback through the artist route', () => {
  const sheet = artistStyle('ive', './love-dive.css');
  assertFace(sheet, 'Dive Sans', ['/fonts/DMSans-Variable.woff2'], '100 1000');
  assertFace(sheet, 'Dive Display', ['/fonts/InstrumentSerif-Regular.woff2', '/fonts/InstrumentSerif-Regular.ttf']);
  assertFace(sheet, 'Dive Display', ['/fonts/InstrumentSerif-Italic.woff2'], 'normal', 'italic');
  assertFace(sheet, 'Dive Han', ['/fonts/unis/NotoSansSC-Regular.woff2']);
  assertStack(sheet, 'Dive Sans,Dive Han,Microsoft YaHei,sans-serif');
  assertStack(sheet, 'Dive Display,Dive Han,Georgia,serif');
});

test('Cherry Bullet, BEWAVE, ODD YOUTH and ILLIT use their full WOFF2 before the original on the routed home and work styles', () => {
  const shared = importedStyle('app/page.tsx', './work-theme-tokens.css');
  const fonts = [
    {
      slug: 'cherrybullet', imports: ['./cherrybullet-artist.css'], family: 'CherryBulletGothic',
      base: '/artist/cherrybullet/fonts/NanumGothic', license: 'OFL.txt', fallback: 'woff', weight: '400',
      stack: 'CherryBulletGothic,Microsoft YaHei,sans-serif',
    },
    {
      slug: 'bewave', imports: ['@/components/bewave-artist', './bewave-artist.css'], family: 'BewaveTide',
      base: '/fonts/InstrumentSerif-Regular', license: 'InstrumentSerif-OFL.txt', stack: 'BewaveTide,Georgia,serif',
    },
    {
      slug: 'oddyouth', imports: ['@/components/oddyouth-artist', './oddyouth-artist.css'],
      family: 'OddYouthAlbum', journalFamily: 'OddYouthPages', base: '/fonts/Syne', license: 'syne-OFL.txt',
      stack: 'OddYouthAlbum,Arial,sans-serif',
    },
    {
      slug: 'illit', imports: ['@/components/seven-redesign/artist.css'], family: 'SevenPixel',
      base: '/artist/illit/redesign-20261025/pixelify-sans-bold', license: 'Pixelify-Sans-OFL.txt',
      weight: '700', stack: 'SevenPixel,monospace',
    },
  ];
  for (const {slug, imports, family, journalFamily = family, base, license, fallback = 'ttf', weight, stack} of fonts) {
    const urls = [base + '.woff2', base + '.' + fallback];
    const home = artistStyle(slug, ...imports);
    assertFace(home, family, urls, weight);
    assertFace(shared, family, urls, weight);
    assertFace(journalStyle(slug, slug !== 'illit'), journalFamily, urls, weight);
    assertStack(home, stack);
    const legal = fs.readFileSync(path.join(root, 'public', path.dirname(base), license), 'utf8');
    assert.match(legal, /SIL OPEN FONT LICENSE Version 1\.1/i);
    const [compressed, original] = urls.map(url => fs.statSync(path.join(root, 'public', url)).size);
    assert.ok(compressed < original, base);
  }
  const cherryBold = ['/artist/cherrybullet/fonts/NanumGothicBold.woff2', '/artist/cherrybullet/fonts/NanumGothicBold.woff'];
  for (const sheet of [artistStyle('cherrybullet', './cherrybullet-artist.css'), shared]) {
    assertFace(sheet, 'CherryBulletGothic', cherryBold, '700');
  }
});
