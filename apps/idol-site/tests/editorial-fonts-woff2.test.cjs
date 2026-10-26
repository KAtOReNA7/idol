const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),postcss=require('postcss');
const root=path.resolve(__dirname,'..');
const fonts=[
 {name:'PlayfairDisplay-Variable',ttf:'c40f2293766a503bc70cce9e512ef844a4ccb7cbcde792fe2ea31d191917d8d6',woff:'4297e9ec39f1b8157623d048fb99eab03c90e482669599e8fc662ee178994c49',size:106440,license:'playfairdisplay-OFL.txt',licenseHash:'566be814f8e96e93dfa16101331557eb6b5467e9e03f627c0910fe93ca12300e',family:'SmnPlayfair',weight:'400 900',files:['app/saymyname-experience.css','app/artists/saymyname/saymyname-artist.css']},
 {name:'DMSans-Variable',ttf:'8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d',woff:'40c3837c53c103a38fbce7faaa590b76edd61a8ede14672eb1e2f7eab0e0c6a4',size:88820,license:'dmsans-OFL.txt',licenseHash:'9af36190332437f5ecd09974de43c1f7c77a310a996cdd8ceb25628b458840e1',family:'IveSans',weight:'100 1000',files:['app/ive-experience.css','app/artists/ive/ive-artist.css']}
];
const bytes=f=>fs.readFileSync(path.join(root,'public/fonts',f));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const font of fonts){
 test(font.name+' retains original source/license and deterministic complete WOFF2',()=>{
  assert.equal(hash(bytes(font.name+'.ttf')),font.ttf);assert.equal(hash(bytes(font.license)),font.licenseHash);
  const output=bytes(font.name+'.woff2');assert.equal(output.length,font.size);assert.equal(output.subarray(0,4).toString(),'wOF2');assert.equal(hash(output),font.woff);
 });
 test(font.name+' has WOFF2 priority and unchanged descriptors in both source styles',()=>{
  for(const file of font.files){let count=0;postcss.parse(fs.readFileSync(path.join(root,file),'utf8')).walkAtRules('font-face',rule=>{
   const decl=Object.fromEntries(rule.nodes.map(n=>[n.prop,n.value]));if(decl['font-family']!==font.family)return;count++;
   assert.equal(decl.src,`url('/fonts/${font.name}.woff2') format('woff2'),url('/fonts/${font.name}.ttf') format('truetype')`);
   assert.equal(decl['font-weight'],font.weight);assert.equal(decl['font-style'],'normal');assert.equal(decl['font-display'],'swap');
  });assert.equal(count,1,file)}
 });
}
