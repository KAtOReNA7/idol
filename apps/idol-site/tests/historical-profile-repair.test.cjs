const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const esbuild=require('esbuild'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const code=esbuild.buildSync({stdin:{contents:`export {projectArtistCatalog} from './lib/idol/artist-catalog';export {groupCollection} from './lib/idol/group-detail';export {default as Nmixx} from './components/nmixx-artist';export {default as Lesserafim} from './components/lesserafim-artist';export {default as Badvillain} from './components/candidate/badvillain-design';export {ArtistTimelineHostProvider as Provider} from './components/artist-timeline-host';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},external:['react','react/*','react-dom','react-dom/*','cloudflare:workers','server-only'],logLevel:'silent'}).outputFiles[0].text;
const mod={exports:{}};vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(n=>n==='cloudflare:workers'?{env:{}}:n==='server-only'?{}:require(n),mod,mod.exports);const api=mod.exports;
const seed={mode:'snapshot',capturedAt:'synthetic',members:[],groups:[],works:[],ratings:[],counts:{}};
const person=(id,stageName,groupIds,formerGroupIds=[])=>({id,stageName,name:stageName,cnName:'',groupIds,formerGroupIds,photo:null,favorite:null,note:'',status:'',country:'',birthDate:'',role:'',profile:'',officialUrl:''});
function html(Component,content,data,route){return renderToStaticMarkup(React.createElement(api.Provider,{value:{catalog:data,serverRoute:route}},React.createElement(Component,{content})));}
for(const [slug,component,id,name,workId,video] of [['nmixx','Nmixx','recvxyICzHyM9P','JINNI','recvxyOz5Xv1vV','3GWscde8rM8'],['lesserafim','Lesserafim','recvxyICzHeqSw','KIM GARAM','recvxyOz5XwAaP','4vbDFu0PUew']]){
 test(`${slug}: historical detail renders, while current roster and source relations stay unchanged`,()=>{
  const c=JSON.parse(fs.readFileSync('data/'+slug+'-artist.json'));
  const current=Object.keys(c.memberVisuals).map((name,i)=>person('current'+i,name,[c.groupId]));
  const former=person(id,name,[],[c.groupId]);
  const work={id:workId,song:'Synthetic MV',name:'Synthetic MV',groupIds:[c.groupId],url:'https://youtu.be/'+video,score:null,stageScore:null,placeholder:false};
  const d={...seed,groups:[{id:c.groupId,name:slug}],members:[...current,former,person('recForeign','FOREIGN',[],['unrelated'])],works:[work],ratings:[{id:'syntheticRating',memberIds:[id],workIds:[workId],score:0,stylingScore:8,note:'synthetic note',memory:'',recognition:'',photo:null}]};
  const before=JSON.stringify(d),p=api.projectArtistCatalog(d,c.groupId);
  assert(p.members.some(m=>m.id===id));assert(!p.members.some(m=>m.id==='recForeign'));
  assert.equal(api.groupCollection(p,p.groups[0]).members.length,current.length);
  assert.deepEqual(p.ratings,d.ratings);
  const route='/artists/'+slug+'?section=members&member='+id,detail=html(api[component],c,p,route);
  assert.match(detail,/历史成员 · 曾属本团/);assert.match(detail,/历史时期影像/);assert(detail.includes('/artist/mv-identity-20261025/identities/'+video));
  assert(detail.includes('member='+id));assert(detail.includes(encodeURIComponent(route).replaceAll('&','&amp;')));
  assert.doesNotMatch(detail,/这个成员不在|api\/media\?table=ratings/);
  const directory=html(api[component],c,p,'/artists/'+slug+'?section=members');assert(directory.includes('data-artist-member-trigger="'+id+'"'));
  const bad=html(api[component],c,p,'/artists/'+slug+'?section=members&member=recForeign');assert.match(bad,/这个成员不在/);
  assert.equal(JSON.stringify(d),before);
 });
}
test('all seven BADVILLAIN profiles link to their exact shared journal and preserve artist return',()=>{
 const c=JSON.parse(fs.readFileSync('data/badvillain-figma-public.json'));
 const d={...seed,groups:[{id:c.groupId,name:'BADVILLAIN'}],members:c.members.map(m=>person(m.id,m.stageName,[c.groupId]))};
 for(const m of c.members){const route='/artists/badvillain?section=members&member='+m.id,s=html(api.Badvillain,{groupId:c.groupId},d,route);const link=s.match(/href="([^"]+)"[^>]*>个人档案与记录/);assert(link);const u=new URL(link[1].replaceAll('&amp;','&'),'https://test.invalid');assert.equal(u.searchParams.get('member'),m.id);assert.equal(u.searchParams.get('returnTo'),route);}
});
