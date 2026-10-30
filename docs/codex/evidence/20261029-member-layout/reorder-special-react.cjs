// Explicitly reviewed detail/folded templates. No data or image edits.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module'),{createHash}=require('node:crypto'),cp=require('node:child_process');
const app=path.resolve(__dirname,'../../../../apps/idol-site'),ts=createRequire(path.join(app,'package.json'))('typescript');
const configs=[
 {file:'components/vvup-artist.tsx',fn:'memberPage',hero:'vu-member-detail',works:'vu-videos',data:'state.data'},
 {file:'components/hearts2hearts-artist.tsx',fn:'memberPage',hero:'h2h-member-hero',works:'h2h-member-works',score:'h2h-member-summary',fold:'h2h-member-facts',data:'data',hint:'s.composite===null'},
 {file:'components/candidate/meovv-design.tsx',fn:'memberPage',hero:'mf-person-grid',works:'mf-looks',score:'mf-person-scores',data:'state.data'},
 {file:'components/candidate/badvillain-design.tsx',fn:'memberPage',hero:'member-spread',works:'films',data:'state.data',member:'member'},
 {file:'components/candidate/loona-design.tsx',fn:'memberPage',hero:'member-layout',works:'ln-looks',score:'ln-scores',fold:'ln-inner-facts',data:'state.data'},
 {file:'components/candidate/newjeans-design.tsx',fn:'memberPage',hero:'nj-split nj-profile',works:'nj-media-grid',fold:'nj-existing-details',data:'state.data',adjacent:'nj-adjacent',newjeans:true},
 {file:'components/candidate/billlie-design.tsx',fn:'person',hero:'bf-section bf-person',works:'bf-related',data:'state.data'},
 {file:'components/design-review/kep1er-design-review.tsx',fn:'person',hero:'kf-person',works:'kf-section kf-related',data:'state.data'},
];
const walk=(n,f)=>{f(n);ts.forEachChild(n,c=>walk(c,f));},tag=n=>ts.isJsxElement(n)?n.openingElement:ts.isJsxSelfClosingElement(n)?n:null;
const cl=n=>tag(n)?.attributes.properties.find(p=>p.name?.getText()==='className')?.initializer?.text;
const sha=s=>createHash('sha256').update(s).digest('hex'),plans=[],receipt=[];
for(const cfg of configs){
 const file=cfg.file,absolute=path.join(app,file),before=cp.execFileSync('git',['show','d07242bf99626d1948de6a78919ba037c5fa3658:apps/idol-site/'+file],{cwd:app,encoding:'utf8'}),sf=ts.createSourceFile(file,before,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),functions=[];
 walk(sf,n=>{if(ts.isFunctionDeclaration(n)&&n.name?.text===cfg.fn)functions.push(n);});if(functions.length!==1)throw Error(file+': function not unique');const fn=functions[0],nodes=[];walk(fn,n=>{if(tag(n))nodes.push(n);});
 const one=(f,label)=>{const list=nodes.filter(f);if(list.length!==1)throw Error(file+': '+label+' count '+list.length);return list[0];};
 const hero=one(n=>cl(n)===cfg.hero,'hero'),career=one(n=>tag(n).tagName.getText(sf)==='MemberCareerFacts','career'),works=one(n=>cl(n)===cfg.works,'works');
 const result=fn.body.statements.filter(ts.isReturnStatement).at(-1).expression,tail=ts.isJsxFragment(result)?result.closingFragment.getStart(sf):result.closingElement.getStart(sf);
 const edits=[],insert=(i,s)=>edits.push({a:i,b:i,s}),replace=(n,s)=>edits.push({a:n.getStart(sf),b:n.end,s}),attr=(n,s)=>insert(tag(n).attributes.end,' '+s);
 attr(hero,'data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"');attr(works,'data-member-module="works"');
 replace(career,career.getText(sf).replace(/\s*\/>$/,' part="intro"/>'));
 let nav='';if(cfg.adjacent){const n=one(n=>cl(n)===cfg.adjacent,'adjacency');nav=n.getText(sf);replace(n,'');}
 let fold=null;
 if(cfg.fold){
  fold=one(n=>cl(n)===cfg.fold,'folded facts');if(tag(fold).tagName.getText(sf)!=='details')throw Error('Expected existing details');
  const opening=tag(fold),closing=fold.closingElement;
  edits.push({a:opening.tagName.getStart(sf),b:opening.tagName.end,s:'section'},{a:closing.tagName.getStart(sf),b:closing.tagName.end,s:'section'});
  attr(fold,'data-member-module="basic"');
  const summaries=fold.children.filter(n=>ts.isJsxElement(n)&&tag(n).tagName.getText(sf)==='summary');if(summaries.length!==1)throw Error('Expected one details summary');replace(summaries[0],'<h2 className="member-profile-heading">个人资料</h2>');
 }
 if(cfg.score){
  const score=one(n=>cl(n)===cfg.score,'score');
  if(score.getStart(sf)>hero.getStart(sf)&&score.end<hero.end){
   let s=score.getText(sf),offset=tag(score).attributes.end-score.getStart(sf);s=s.slice(0,offset)+' data-member-module="scores"'+s.slice(offset);replace(score,'');
   if(cfg.hint){const hints=[];walk(fold,n=>{if(ts.isJsxExpression(n)&&n.parent===fold&&n.getText(sf).includes(cfg.hint))hints.push(n);});if(hints.length!==1)throw Error('Expected score explanation');s+=hints[0].getText(sf);replace(hints[0],'');}
   insert(hero.end,'\n'+s+'\n');
  }else attr(score,'data-member-module="scores"');
 }
 if(cfg.newjeans){
  const score=fold.children.find(n=>ts.isJsxElement(n)&&n.getText(sf).startsWith('<p>作品综合分'));
  if(!score)throw Error('Expected NewJeans score paragraph');
  const empty=fold.children.find(n=>ts.isJsxExpression(n)&&n.getText(sf).startsWith('{!items.length'));
  if(!empty)throw Error('Expected NewJeans work empty state');
  replace(score,'');replace(works,'');replace(empty,'');
  // The grid itself remains unchanged; only its old mixed disclosure is split.
  const workText=works.getText(sf).replace('className="nj-media-grid"','className="nj-media-grid" data-member-module="works"');
  // The moved original grid cannot also receive an insertion at its old position.
  const attributeEdit=edits.findIndex(e=>e.a===tag(works).attributes.end&&e.a===e.b);if(attributeEdit<0)throw Error('Grid marker missing');edits.splice(attributeEdit,1);
  insert(fold.end,'<section className="nj-existing-details" data-member-module="scores"><h2 className="member-profile-heading">作品与评分</h2>'+score.getText(sf)+workText+empty.getText(sf)+'</section>');
 }
 const member=cfg.member??'m',condition=cfg.member?'member&&'+cfg.data:cfg.data;
 const publicBlock='{'+condition+'&&<MemberPublicCredits memberId={m.id} data={'+cfg.data+'} renderLink={(work,label)=><a href={artistWorkUrl(work,false,returnTo)}>{label}</a>}/>}';
 const history=cfg.member?'{member&&<MemberCareerFacts member={member} part="history"/>}':'<MemberCareerFacts member={m} part="history"/>';
 const sources=cfg.member?'{member&&<MemberCareerFacts member={member} part="sources"/>}':'<MemberCareerFacts member={m} part="sources"/>';
 insert(tail,'\n'+publicBlock+'\n'+history+'\n'+sources+'\n'+nav+'\n');
 let after=before;for(const e of edits.sort((a,b)=>b.a-a.a||b.b-a.b))after=after.slice(0,e.a)+e.s+after.slice(e.b);
 if(!before.includes("from '@/components/public-work-credits'"))after=after.replace("import {MemberCareerFacts}","import {MemberPublicCredits} from '@/components/public-work-credits';\nimport {MemberCareerFacts}");
 if(!after.includes('import {MemberPublicCredits}'))throw Error(file+': new public import absent');
 if(ts.createSourceFile(file,after,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length)throw Error('JSX parse error '+file);
 const current=fs.readFileSync(absolute,'utf8');if(current!==before&&current!==after)throw Error('Unreviewed preimage '+file);
 plans.push({absolute,after});receipt.push({file,beforeSha256:sha(before),afterSha256:sha(after),movedOnlyViewNodes:true,dataChanges:0});
}
for(const p of plans)fs.writeFileSync(p.absolute,p.after);fs.writeFileSync(path.join(__dirname,'special-react-movement.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({templates:plans.length}));
