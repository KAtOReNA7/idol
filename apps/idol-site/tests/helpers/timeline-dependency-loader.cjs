/* Extend legacy VM harnesses with the real timeline modules, without changing their
 * existing catalog fixtures, React parent hooks or assertions. This is test-only. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..');
const cache=new Map();
function bundled(file){
 if(cache.has(file))return cache.get(file);
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-dependency-'));
 const output=path.join(directory,'module.cjs');
 esbuild.buildSync({entryPoints:[path.join(root,file)],bundle:true,outfile:output,platform:'node',format:'cjs',jsx:'automatic',external:['react','react/*'],loader:{'.css':'empty'},logLevel:'silent'});
 const Module=require('node:module'),mod=new Module(output,module);mod.filename=output;mod.paths=module.paths;
 mod._compile(fs.readFileSync(output,'utf8'),output);const result=mod.exports;cache.set(file,result);
 fs.rmSync(directory,{recursive:true,force:true});
 return result;
}
function timelineDependency(name){
 if(/^\.\.\/\.\.\/data\/[a-z0-9-]+-navigation-keys\.json$/.test(name))return {default:JSON.parse(fs.readFileSync(path.join(root,name.slice(6)),'utf8'))};
 if(name==='../../data/izone-navigation-keys.json')return {default:JSON.parse(fs.readFileSync(path.join(root,'data/izone-navigation-keys.json'),'utf8'))};
 if(name==='../../data/katseye-navigation-keys.json')return {default:JSON.parse(fs.readFileSync(path.join(root,'data/katseye-navigation-keys.json'),'utf8'))};
 if(name==='./public-artist-route-keys')return bundled('lib/idol/public-artist-route-keys.ts');
 if(['../../data/public-artist-navigation-keys.json','../../data/hearts2hearts-navigation-keys.json','../../data/idle-navigation-keys.json','../../data/ive-navigation-keys.json','../../data/billlie-navigation-keys.json','../../data/badvillain-navigation-keys.json','../../data/triples-navigation-keys.json','../../data/ive-soft-issue.json','../../data/badvillain-figma-public.json'].includes(name))return {default:JSON.parse(fs.readFileSync(path.join(root,name.replace('../../','')),'utf8'))};
 if(name==='../../data/triples/design-public-catalog.json')return {default:JSON.parse(fs.readFileSync(path.join(root,'data/triples/design-public-catalog.json'),'utf8'))};
 if(name.endsWith('/data/artist-timeline-registry.json'))return {default:JSON.parse(fs.readFileSync(path.join(root,'data/artist-timeline-registry.json'),'utf8'))};
 if(name==='./artist-timeline-host')return {...bundled('components/artist-timeline-host.tsx'),useArtistTimelineHostOptions:()=>({})};
 const match=name.match(/(?:^|\/)timeline\/(route|history-state|navigation)$/);
 if(match)return bundled(`lib/idol/timeline/${match[1]}.ts`);
 return undefined;
}
module.exports={timelineDependency};
