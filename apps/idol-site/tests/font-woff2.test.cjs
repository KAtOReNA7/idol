const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {artistStyle, journalStyle, assertFace, assertStack} = require('./helpers/routed-fonts.cjs');
const root=path.resolve(__dirname,'..');
test('Space Grotesk source and complete WOFF2 are immutable known artifacts',()=>{
 const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
 assert.equal(hash('public/fonts/SpaceGrotesk.ttf'),'acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72');
 assert.equal(hash('public/fonts/SpaceGrotesk.woff2'),'8e085aa438094f11487a836652edd5c054fa6a96f63fc7c282105ee3a4b08c07');
 const b=fs.readFileSync(path.join(root,'public/fonts/SpaceGrotesk.woff2'));assert.equal(b.subarray(0,4).toString(),'wOF2');assert.equal(b.length,49256);
 assert.equal(hash('public/fonts/spacegrotesk-OFL.txt'),'564ce565c371c5e5bbf286006565a7c9aa55a9f56e7ca58d56e05d649dd61a72');
 assert.match(fs.readFileSync(path.join(root,'public/fonts/spacegrotesk-OFL.txt'),'utf8'),/Copyright 2020 The Space Grotesk Project Authors/);
});
test('routed Space Grotesk faces prefer the complete WOFF2, retain the TTF and use their published weights', () => {
  const urls = ['/fonts/SpaceGrotesk.woff2', '/fonts/SpaceGrotesk.ttf'];
  const homes = [
    ['xg', '../expanded-artist.css', 'ArtistNumber'],
    ['aespa', '../expanded-artist.css', 'ArtistNumber'],
    ['lesserafim', './lesserafim-artist.css', 'LeMono'],
    ['kissoflife', './kiof-artist.css', 'KiofMono'],
    ['stayc', './stayc-artist.css', 'StaycMono'],
    ['itzy', './itzy-artist.css', 'ItzyDisplay'],
    ['nmixx', './nmixx-artist.css', 'NMixxDisplay'],
  ];
  for (const [slug, specifier, family] of homes) {
    assertFace(artistStyle(slug, specifier), family, urls, '300 700');
  }
  assertFace(journalStyle('nmixx', false), 'NMixxDisplay', urls, '200 700');
});

test('KATSEYE uses its licensed Nimbus Sans Narrow on its home and work page', () => {
  const urls = ['/fonts/Katseye-NimbusSansNarrow-Bold.otf'];
  const home = artistStyle('katseye', './katseye-artist.css');
  const journal = journalStyle('katseye', false);
  assertFace(home, 'KeDisplay', urls, '700');
  assertFace(journal, 'KatseyeDisplay', urls, '300 700');
  assertStack(home, 'KeDisplay,Arial Narrow,Noto Sans SC,sans-serif');
  assertStack(journal, 'KatseyeDisplay,Noto Sans SC,sans-serif');
  assert.ok(fs.statSync(path.join(root, 'public/fonts/Katseye-Nimbus-LICENSE.txt')).size > 0);
});
