const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),registry=JSON.parse(fs.readFileSync(path.join(root,'data/artist-timeline-registry.json')));
const result=esbuild.buildSync({entryPoints:[path.join(root,'components/group-detail.tsx')],bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],loader:{'.css':'empty'},logLevel:'silent'});
const filename=path.join(__dirname,'.index-image-compiled.cjs'),mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;mod._compile(result.outputFiles[0].text,filename);const {GroupIndexCard}=mod.exports;
for(const entry of registry)test(`${entry.slug}: public index keeps image, group target, lazy hints and zero average without nested retries`,()=>{
 const group={id:entry.groupId,name:entry.name},member={id:'recFixtureIndexMember',stageName:'FIXTURE',name:'FIXTURE',groupIds:[group.id],photo:{table:'members',recordId:'recFixtureIndexMember',index:0}},work={id:'recFixtureIndexWork',groupIds:[group.id],score:0,stageScore:null,watched:'已观看',url:'https://youtube.com/watch?v=abcdefghijk'};
 const data={groups:[group],members:[member],works:[work]},before=JSON.stringify(data);const html=renderToStaticMarkup(React.createElement(GroupIndexCard,{group,data,onOpen(){throw Error('SSR must not navigate');},renderPhoto(){throw Error('Published group must keep its existing visual path');}}));
 assert.match(html,new RegExp(`data-browse-anchor="group-${group.id}"`));assert.match(html,/0\.0/);assert.equal((html.match(/<button\b/g)||[]).length,1);assert.doesNotMatch(html,/<a\b|src=""|blob:|retry=/);
 const images=html.match(/<img\b[^>]*>/g)||[];assert.ok(images.length>0);for(const image of images){assert.match(image,/src="[^"]+"/);assert.match(image,/alt="[^"]+"/);assert.match(image,/loading="lazy"/);assert.match(image,/decoding="async"/);assert.doesNotMatch(image,/fetchPriority="high"/);}
 assert.equal(JSON.stringify(data),before);
});
test('both public index implementations use stable group/member identities and inherit only external recovery controls',()=>{
 const group=fs.readFileSync('components/group-detail.tsx','utf8'),candidate=fs.readFileSync('components/candidate-index-card.tsx','utf8');
 for(const text of [group,candidate]){assert.doesNotMatch(text,/<img\b|ImageRetryControl|retryMode="inline"|ImageRecoveryProvider/);assert.match(text,/ReliableImage/);}
 assert.equal((group.match(/identityKey=\{`group:\$\{g.id\}:index:hero`\}/g)||[]).length,12);
 assert.match(candidate,/group:\$\{group.id\}:index:hero/);assert.match(candidate,/group:\$\{group.id\}:member:\$\{member.id\}:index:portrait/);
});
