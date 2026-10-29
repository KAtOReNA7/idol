const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),{createRequire}=require('node:module'),{createHash}=require('node:crypto');
const app=path.resolve(__dirname,'../../../../apps/idol-site'),ts=createRequire(path.join(app,'package.json'))('typescript');
const registry=JSON.parse(fs.readFileSync(path.join(app,'data/artist-timeline-registry.json'),'utf8'));
const configs=[
 ...['youngposse','bewave'].map(slug=>({slug,file:'components/'+slug+'-artist.tsx',hero:'personal-spread',copy:'bio',works:'member-related',publicInside:'member-related',data:'state.data',member:'m',next:'person-next'})),
 {slug:'candyshop',file:'components/candyshop-artist.tsx',hero:'cs-detail cs-person-detail',copy:'cs-detail-copy',works:'cs-related',data:'state.data',member:'m',next:'cs-next'},
 ...[['oddyouth','oy'],['adya','idol-adya'],['geenius','idol-geenius']].map(([slug,p])=>({slug,file:'components/'+slug+'-artist.tsx',hero:p+'-person-detail',copy:p+'-person-copy',works:p+'-related',data:'state.data',member:'m',next:p+'-next'})),
 ...[['tracer','tr'],['witchx','wk'],['spia','sp']].map(([slug,p])=>({slug,file:'components/'+slug+'-artist.tsx',hero:p+'-person-detail',copy:p+'-person-copy',data:'state.data',member:'m',next:p+'-next',publicOnly:true})),
 ...[['vcha','vc'],['hitgs','hg'],['atheart','ah']].map(([slug,p])=>({slug,file:'components/'+slug+'-artist.tsx',hero:p+'-member-detail',works:p+'-linked',data:'data',member:'member',next:p+'-next'})),
 ...[['izone','iz'],['fromis9','f9'],['everglow','eg'],['rocketpunch','rp'],['cherrybullet','cb'],['weeekly','wk']].map(([slug,p])=>({slug,file:'components/candidate/'+slug+'-design.tsx',hero:p+'-person-detail',copy:p+'-identity',works:p+'-section',data:'catalog',member:'person',addIntro:true})),
 {slug:'idle',file:'components/candidate/idle-design.tsx',heroPrefix:'idv-section idv-person-detail',copy:'idv-identity',data:'catalog',member:'person',addIntro:true,idle:true},
 {slug:'genblue',file:'components/genblue/bluecut-experience.tsx',hero:'gb-member-detail',copy:'gb-member-bio',works:'gb-video-list',data:'state.data',member:'m',next:'gb-next-members',returnTo:'returnTo'},
];
const sha=s=>createHash('sha256').update(s).digest('hex'),walk=(n,f)=>{f(n);ts.forEachChild(n,c=>walk(c,f));},tag=n=>ts.isJsxElement(n)?n.openingElement:ts.isJsxSelfClosingElement(n)?n:null;
const cl=n=>tag(n)?.attributes.properties.find(p=>p.name?.getText()==='className')?.initializer?.text;
const classText=n=>tag(n)?.attributes.properties.find(p=>p.name?.getText()==='className')?.initializer?.getText()??'';
const previous=JSON.parse(fs.readFileSync(path.join(__dirname,'editorial-react-movement.json'),'utf8'));
const plans=[],receipts=[];
for(const cfg of configs){
 const absolute=path.join(app,cfg.file),before=cp.execFileSync('git',['show','d07242bf99626d1948de6a78919ba037c5fa3658:apps/idol-site/'+cfg.file],{cwd:app,encoding:'utf8'}),sf=ts.createSourceFile(cfg.file,before,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),all=[];
 walk(sf,n=>{if(tag(n))all.push(n);});const candidates=all.filter(n=>cfg.hero?cl(n)===cfg.hero:classText(n).includes(cfg.heroPrefix));if(candidates.length!==1)throw Error(cfg.file+': hero count '+candidates.length);
 const hero=candidates[0];let root=hero;while(ts.isJsxElement(root.parent)||ts.isJsxFragment(root.parent))root=root.parent;
 if(!ts.isJsxElement(root)&&!ts.isJsxFragment(root))throw Error('Member branch root missing');
 const nodes=[];walk(root,n=>{if(tag(n))nodes.push(n);});const tail=ts.isJsxFragment(root)?root.closingFragment.getStart(sf):root.closingElement.getStart(sf);
 const group=registry.filter(g=>g.slug===cfg.slug);if(group.length!==1)throw Error('Exact group registry entry required '+cfg.slug);
 const edits=[],removed=[],insert=(i,s)=>edits.push({a:i,b:i,s}),attrs=(n,s)=>insert(tag(n).attributes.end,' '+s);
 const take=n=>{let p=n;while(ts.isBinaryExpression(p.parent)||ts.isConditionalExpression(p.parent)||ts.isParenthesizedExpression(p.parent))p=p.parent;if(ts.isJsxExpression(p.parent))p=p.parent;return p;};
 const move=n=>{const p=take(n);if(removed.some(r=>p.getStart(sf)>=r.getStart(sf)&&p.end<=r.end))return null;if(removed.some(r=>p.getStart(sf)<=r.getStart(sf)&&p.end>=r.end))throw Error('Nested source moves need explicit review');removed.push(p);edits.push({a:p.getStart(sf),b:p.end,s:''});return p.getText(sf);};
 attrs(hero,'data-member-layout="ordered-v1" data-member-id={'+cfg.member+'.id} data-member-module="identity"');
 const copies=cfg.copy?nodes.filter(n=>cl(n)===cfg.copy):hero.children.filter(n=>ts.isJsxElement(n)&&tag(n).tagName.getText(sf)==='div');
 if(copies.length!==1)throw Error(cfg.file+': basic copy count '+copies.length);const copy=copies[0];attrs(copy,'data-member-module="basic"');
 if(cfg.addIntro)insert(copy.closingElement.getStart(sf),'<ScopedMemberCareerFacts data={'+cfg.data+'} memberId={'+cfg.member+'.id} groupId="'+group[0].groupId+'" part="intro"/>');
 const publicParts=[],sourceParts=[];let navigation='';
 const inside=n=>n.getStart(sf)>hero.getStart(sf)&&n.end<hero.end;
 if(cfg.publicInside){const ps=nodes.filter(n=>inside(n)&&cl(n)===cfg.publicInside);if(ps.length!==1)throw Error('Unique existing public release block required');const s=move(ps[0]);if(s)publicParts.push(s);}
 if(cfg.idle){const solo=[];walk(root,n=>{if(ts.isJsxExpression(n)&&n.parent===root&&n.getText(sf).includes('solo.length>0'))solo.push(n);});if(solo.length!==1)throw Error('Exact IDLE solo release block required');const s=move(solo[0]);if(s)publicParts.push(s);}
 for(const n of nodes.filter(inside)){
  const name=tag(n).tagName.getText(sf),c=cl(n)??'',text=n.getText(sf);
  if(name==='Sources'||/(?:^|-)source$/.test(c)&&['a','div','p'].includes(name)||['a','Link','External','Source'].includes(name)&&/照片来源|公开人物资料/.test(text)&&!/<(?:Picture|img|Art)\b/.test(text)){
   const s=move(n);if(s)sourceParts.push(s);
  }
 }
 if(cfg.next){const nav=nodes.filter(n=>cl(n)===cfg.next);if(nav.length===1)navigation=move(nav[0])??'';else if(nav.length>1)throw Error('Ambiguous next-member navigation');}
 if(cfg.works){const matches=nodes.filter(n=>cl(n)===cfg.works&&!inside(n));
  if(matches.length===1&&!removed.some(r=>matches[0].getStart(sf)>=r.getStart(sf)&&matches[0].end<=r.end))attrs(matches[0],'data-member-module="works"');
 }
 if(cfg.publicOnly){const sections=nodes.filter(n=>cl(n)?.endsWith('-section')&&!inside(n));if(sections.length===1)attrs(sections[0],'data-member-module="public"');}
 const back=cfg.returnTo??(['candyshop','geenius','oddyouth','spia','tracer','youngposse','adya','bewave'].includes(cfg.slug)?'safeArtistReturn(url)??path':(/\breturnTo\s*=/.test(before)?'returnTo':'safeArtistReturn(url)??path'));
 const reference='{'+cfg.data+'&&<MemberPublicCredits memberId={'+cfg.member+'.id} data={'+cfg.data+'} renderLink={(work,label)=><a href={artistWorkUrl(work,false,'+back+')}>{label}</a>}/>}';
 const scope='data={'+cfg.data+'} memberId={'+cfg.member+'.id} groupId="'+group[0].groupId+'"';
 insert(tail,'\n'+publicParts.join('\n')+'\n'+reference+'\n<ScopedMemberCareerFacts '+scope+' part="history"/>\n'+(sourceParts.length?'<section className="member-profile-sources" data-member-module="sources">'+sourceParts.join('')+'</section>':'')+'\n<ScopedMemberCareerFacts '+scope+' part="sources"/>\n'+navigation+'\n');
 let after=before;for(const e of edits.sort((a,b)=>b.a-a.a||b.b-a.b))after=after.slice(0,e.a)+e.s+after.slice(e.b);
 const imports=["import {ScopedMemberCareerFacts} from '@/components/member-career-facts';","import {MemberPublicCredits} from '@/components/public-work-credits';"];
 const importedWorkUrl=sf.statements.some(n=>ts.isImportDeclaration(n)&&n.importClause?.namedBindings&&ts.isNamedImports(n.importClause.namedBindings)&&n.importClause.namedBindings.elements.some(b=>b.name.text==='artistWorkUrl'));
 if(!importedWorkUrl)imports.push("import {artistWorkUrl} from '@/lib/idol/artist-preview';");
 after=after.replace(/(['"]use client['"];)/,'$1\n'+imports.join('\n'));
 if(ts.createSourceFile(cfg.file,after,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length)throw Error('Invalid JSX '+cfg.file);
 const current=fs.readFileSync(absolute,'utf8');if(current!==before&&current!==after&&sha(current)!==previous.find(r=>r.file===cfg.file)?.afterSha256)throw Error('Unreviewed current text '+cfg.file);
 plans.push({absolute,after});receipts.push({file:cfg.file,slug:cfg.slug,groupId:group[0].groupId,beforeSha256:sha(before),afterSha256:sha(after),movedPublicBlocks:publicParts.length,movedSourceBlocks:sourceParts.length,newPrivateRelations:0,dataChanges:0});
}
for(const p of plans)fs.writeFileSync(p.absolute,p.after);fs.writeFileSync(path.join(__dirname,'editorial-react-movement.json'),JSON.stringify(receipts,null,2)+'\n');console.log(JSON.stringify({templates:plans.length}));
