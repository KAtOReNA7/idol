const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const {sevenDesigns}=load('components/seven-redesign/catalog.ts');
const {safeArtistReturn}=load('lib/idol/artist-navigation.ts');
const {sevenJournalPortrait,sevenJournalContext}=load('components/seven-redesign/journal.ts');
const art=require('../components/seven-redesign/art-direction.json');
test('historical membership preserves the reviewed artist theme only within its explicit return journey',()=>{
 const m={groupIds:[],formerGroupIds:[sevenDesigns.purplekiss.groupId]};
 assert.equal(sevenJournalContext(m,'/artists/purplekiss?section=members')?.slug,'purplekiss');
 assert.equal(sevenJournalContext(m,'/artists/qwer?section=members'),null);
 assert.equal(sevenJournalContext(m,null),null);
});
test('every new release can round-trip without accepting a foreign release identifier',()=>{
 for(const d of Object.values(sevenDesigns))for(const release of d.releases){const url=`/artists/${d.slug}?section=works&release=${release.id}`;assert.equal(safeArtistReturn(url),url,url);assert.equal(safeArtistReturn('/artists/loona?section=works&release='+release.id),null);}
});
test('invalid and duplicate new release keys still fail closed',()=>{
 for(const slug of ['madein','qwer','illit']){assert.equal(safeArtistReturn(`/artists/${slug}?section=works&release=unknown`),null);const id=sevenDesigns[slug].releases[0].id;assert.equal(safeArtistReturn(`/artists/${slug}?section=works&release=${id}&release=${id}`),null);assert.equal(safeArtistReturn(`https://evil.test/artists/${slug}?section=works&release=${id}`),null);}
});
test('public media returns retain the exact finite media identity',()=>{
 for(const d of Object.values(sevenDesigns))for(const film of d.films){const format=['triples','purplekiss','rescene'].includes(d.slug)?'&format='+film.kind:'';const url=`/artists/${d.slug}?section=works${format}&media=${film.id}`;assert.ok(safeArtistReturn(url),url);}
});
test('new journal portraits require both artist context and existing membership',()=>{
 const m={id:'rec28ldbniBgam',stageName:'MASHIRO',groupIds:[sevenDesigns.madein.groupId]};assert.equal(sevenJournalPortrait(m,null),null);assert.equal(sevenJournalPortrait(m,'/artists/kep1er?section=members'),null);assert.equal(sevenJournalPortrait({...m,groupIds:[]},'/artists/madein?section=members'),null);assert.equal(sevenJournalPortrait(m,'/artists/madein?section=members').image,art.madein.portraits[m.id].image);
});
test('official asset files preserve the recorded original bytes',()=>{
 for(const slug of Object.keys(sevenDesigns)){const manifest=JSON.parse(fs.readFileSync(`public/artist/${slug}/redesign-20261025/manifest.json`));for(const asset of manifest.assets){if(!asset.path||!asset.sha256)continue;const bytes=fs.readFileSync('public'+asset.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);}}
});
test('all portrait bindings are real local resources and tripleS retains 24 exact IDs',()=>{
 assert.equal(Object.keys(art.triples.portraits).length,24);for(const group of Object.values(art))for(const portrait of Object.values(group.portraits??{}))assert.ok(fs.existsSync('public'+portrait.image),portrait.image);
});
