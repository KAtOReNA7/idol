const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),postcss=require('postcss');
const root=path.resolve(__dirname,'..');
const sources=['app/katseye-experience.css','app/nmixx-experience.css','app/artists/expanded-artist.css','app/artists/lesserafim/lesserafim-artist.css','app/artists/kissoflife/kiof-artist.css','app/artists/stayc/stayc-artist.css','app/artists/itzy/itzy-artist.css','app/artists/nmixx/nmixx-artist.css','app/artists/katseye/katseye-artist.css'];
test('Space Grotesk source and complete WOFF2 are immutable known artifacts',()=>{
 const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
 assert.equal(hash('public/fonts/SpaceGrotesk.ttf'),'acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72');
 assert.equal(hash('public/fonts/SpaceGrotesk.woff2'),'8e085aa438094f11487a836652edd5c054fa6a96f63fc7c282105ee3a4b08c07');
 const b=fs.readFileSync(path.join(root,'public/fonts/SpaceGrotesk.woff2'));assert.equal(b.subarray(0,4).toString(),'wOF2');assert.equal(b.length,49256);
 assert.equal(hash('public/fonts/spacegrotesk-OFL.txt'),'564ce565c371c5e5bbf286006565a7c9aa55a9f56e7ca58d56e05d649dd61a72');
 assert.match(fs.readFileSync(path.join(root,'public/fonts/spacegrotesk-OFL.txt'),'utf8'),/Copyright 2020 The Space Grotesk Project Authors/);
});
test('all nine source styles prefer full WOFF2 and retain TTF fallback and swap',()=>{
 let count=0;
 for(const file of sources){let matches=0;postcss.parse(fs.readFileSync(path.join(root,file),'utf8')).walkAtRules('font-face',r=>{let src=r.nodes.find(n=>n.prop==='src');if(!src?.value.includes('SpaceGrotesk'))return;matches++;count++;
 assert.equal(src.value,"url('/fonts/SpaceGrotesk.woff2') format('woff2'),url('/fonts/SpaceGrotesk.ttf') format('truetype')");assert.equal(r.nodes.find(n=>n.prop==='font-display')?.value,'swap');assert.ok(r.nodes.find(n=>n.prop==='font-family'));assert.ok(r.nodes.find(n=>n.prop==='font-weight'));
 });assert.ok(matches,file)}assert.equal(count,10);
});
