// Actual React SSR with the repository snapshot and current read-only projections.
// No network, owner export or production writes. Browser checks are recorded separately.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),React=require('react'),{renderToPipeableStream}=require('react-dom/server'),{PassThrough}=require('node:stream'),esbuild=require('esbuild');
function render(node){return new Promise((resolve,reject)=>{const output=new PassThrough(),chunks=[];output.on('data',chunk=>chunks.push(chunk));output.on('end',()=>resolve(Buffer.concat(chunks).toString()));output.on('error',reject);const stream=renderToPipeableStream(node,{onAllReady(){stream.pipe(output);},onError:reject});});}
const registry=require('../data/artist-timeline-registry.json').filter(g=>!['ifeye','izna','udtt'].includes(g.slug));
const contents=registry.map((g,i)=>`import Page${i} from './app/artists/${g.slug}/page';`).join('\n')+`\nexport const pages={${registry.map((g,i)=>JSON.stringify(g.slug)+':Page'+i).join(',')}};export {ArtistTimelineHostProvider} from './components/artist-timeline-host';export {projectCatalog} from './lib/idol/catalog';export {projectArtistCatalog} from './lib/idol/artist-catalog';export {projectBrowserCatalog} from './lib/idol/browser-catalog';`;
const output=esbuild.buildSync({stdin:{contents,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*','cloudflare:workers','server-only'],loader:{'.css':'empty'},logLevel:'silent'}).outputFiles[0].text;
const filename=path.resolve('tests/.member-order-ssr.cjs'),compiled=new Module(filename,module);compiled.filename=filename;compiled.paths=module.paths;compiled.require=name=>name==='cloudflare:workers'?{env:{}}:name==='server-only'?{}:require(name);compiled._compile(output,filename);
const api=compiled.exports,snapshot=require('../data/snapshot.json'),catalog=api.projectCatalog(snapshot.tables,'snapshot',snapshot.capturedAt);
const ranks={identity:0,basic:1,scores:2,works:2,records:2,public:3,career:4,personal:5,sources:5};
for(const group of registry)test(group.name+' real member render keeps private works before public evidence and sources',async()=>{
 const member=catalog.members.find(m=>m.groupIds.includes(group.groupId)||(m.formerGroupIds??[]).includes(group.groupId));assert.ok(member);
 const data=api.projectBrowserCatalog(api.projectArtistCatalog(catalog,group.groupId)),before=JSON.stringify(data),url=group.path+'?section=members&member='+member.id;
 const html=await render(React.createElement(api.ArtistTimelineHostProvider,{value:{catalog:data,serverRoute:url}},React.createElement(api.pages[group.slug],{searchParams:Promise.resolve({section:'members',member:member.id})})));
 assert.match(html,/data-member-layout="ordered-v1"/);
 const modules=[...html.matchAll(/data-member-module="([^"]+)"/g)].map(m=>m[1]);assert.ok(modules.includes('identity'));let previous=-1;
 for(const name of modules){assert.ok(ranks[name]>=previous,group.slug+': '+modules.join(' -> '));previous=ranks[name];}
 assert.equal(JSON.stringify(data),before);
});
