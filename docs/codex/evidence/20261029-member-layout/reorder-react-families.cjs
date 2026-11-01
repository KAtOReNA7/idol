// One-time, preimage-checked JSX movement for the ten explicitly inspected templates.
// Keep every card, photo control, data derivation and scoped link component intact.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module'),{createHash}=require('node:crypto');
const app=path.resolve(__dirname,'../../../../apps/idol-site'),ts=createRequire(path.join(app,'package.json'))('typescript');
const configs=[
 ['kiof','memberPage','kf-member-hero','kf-member-summary','kf-member-works'],
 ['stayc','memberPage','sc-member-hero','sc-member-summary','sc-member-works'],
 ['nmixx','memberPage','nx-member-hero','nx-member-summary','nx-member-works'],
 ['kiiikiii','memberPage','kk-member-hero','kk-member-summary','kk-member-works'],
 ['itzy','memberPage','iz-member-hero','iz-member-summary','iz-member-works'],
 ['lesserafim','memberPage','lf-member-hero','lf-member-summary','lf-member-works'],
 ['saymyname','memberPage','smn-member-hero','smn-member-summary','smn-member-works'],
 ['katseye','memberPage','ke-member-hero','ke-member-summary','ke-member-works'],
 ['expanded','renderMember','nx-member-hero','nx-member-summary','nx-member-works'],
 ['artist-sample','renderMember','as-member-hero','as-member-scores','as-member-works'],
];
const sha=s=>createHash('sha256').update(s).digest('hex'),report=[],plans=[];
const walk=(n,fn)=>{fn(n);ts.forEachChild(n,c=>walk(c,fn));};
const tag=n=>ts.isJsxElement(n)?n.openingElement:ts.isJsxSelfClosingElement(n)?n:null;
const classOf=n=>tag(n)?.attributes.properties.find(p=>p.name?.getText()==='className')?.initializer?.text;
for(const [name,fnName,heroClass,scoreClass,worksClass] of configs){
 const file='components/'+(name==='expanded'?'expanded-artist':name==='artist-sample'?name:name+'-artist')+'.tsx',absolute=path.join(app,file);
 const before=require('node:child_process').execFileSync('git',['show','d07242bf99626d1948de6a78919ba037c5fa3658:apps/idol-site/'+file],{cwd:app,encoding:'utf8'});
 const sf=ts.createSourceFile(file,before,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),functions=[];
 walk(sf,n=>{if(ts.isFunctionDeclaration(n)&&n.name?.text===fnName)functions.push(n);});
 if(functions.length!==1)throw Error('Unique inspected function required: '+file);
 const fn=functions[0],nodes=[];walk(fn,n=>{if(tag(n))nodes.push(n);});
 const unique=(filter,label)=>{const rows=nodes.filter(filter);if(rows.length!==1)throw Error(file+': expected one '+label+', got '+rows.length);return rows[0];};
 const hero=unique(n=>classOf(n)===heroClass,'hero'),score=unique(n=>classOf(n)===scoreClass,'score'),works=unique(n=>classOf(n)===worksClass,'works');
 const career=unique(n=>tag(n)?.tagName.getText(sf)==='MemberCareerFacts','career');
 if(career.getText(sf).includes('part='))throw Error('Already migrated: '+file);
 if(!(score.pos>hero.pos&&score.end<hero.end))throw Error('Score must be inside the inspected hero preimage');
 const rootReturn=fn.body.statements.filter(ts.isReturnStatement).at(-1)?.expression;
 if(!rootReturn||!ts.isJsxFragment(rootReturn)&&!ts.isJsxElement(rootReturn))throw Error('Unexpected member return');
 const tail=ts.isJsxFragment(rootReturn)?rootReturn.closingFragment.getStart(sf):rootReturn.closingElement.getStart(sf);
 const edits=[],insert=(at,text)=>edits.push({start:at,end:at,text}),replace=(n,text)=>edits.push({start:n.getStart(sf),end:n.end,text});
 const attrs=(node,text)=>insert(tag(node).attributes.end,' '+text);
 attrs(hero,'data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"');
 const copy=hero.children.find(n=>ts.isJsxElement(n)&&tag(n).tagName.getText(sf)==='div'&&(name!=='artist-sample'||classOf(n)==='as-member-copy'));
 if(!copy)throw Error('Inspected hero copy missing: '+file);attrs(copy,'data-member-module="basic"');
 attrs(works,'data-member-module="works"');
 let scoreText=score.getText(sf),offset=tag(score).attributes.end-score.getStart(sf);scoreText=scoreText.slice(0,offset)+' data-member-module="scores"'+scoreText.slice(offset);
 const additions=[scoreText];
 if(name==='artist-sample'){
  const hints=[];walk(copy,n=>{if(ts.isJsxExpression(n)&&n.parent===copy&&n.getText(sf).includes('summary.composite===null'))hints.push(n);});
  if(hints.length!==1)throw Error('Expected BABYMONSTER empty-score hint');
  additions.push(hints[0].getText(sf));replace(hints[0],'');
 }
 replace(score,'');insert(hero.end,'\n'+additions.join('\n')+'\n');
 const careerText=career.getText(sf);replace(career,careerText.replace(/\s*\/>$/,' part="intro"/>'));
 const link=name==='artist-sample'?'<LinkTo href={workUrl(work)}>{label}</LinkTo>':'<A href={artistWorkUrl(work,false,returnTo)}>{label}</A>';
 insert(tail,'\n<MemberPublicCredits memberId={m.id} data={data} renderLink={(work,label)=>'+link+'}/>\n<MemberCareerFacts member={m} part="history"/>\n<MemberCareerFacts member={m} part="sources"/>\n');
 let after=before;for(const e of edits.sort((a,b)=>b.start-a.start||b.end-a.end))after=after.slice(0,e.start)+e.text+after.slice(e.end);
 if(!before.includes("from '@/components/public-work-credits'"))after=after.replace("import {MemberCareerFacts}","import {MemberPublicCredits} from '@/components/public-work-credits';\nimport {MemberCareerFacts}");
 if(after===before||!after.includes('import {MemberPublicCredits}'))throw Error('Missing new public-reference import: '+file);
 const parsed=ts.createSourceFile(file,after,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);if(parsed.parseDiagnostics.length)throw Error(file+': generated JSX does not parse');
 const current=fs.readFileSync(absolute,'utf8');if(current!==before&&current!==after)throw Error('Unreviewed preimage: '+file);
 plans.push({absolute,after});report.push({file,function:fnName,beforeSha256:sha(before),afterSha256:sha(after),originalPhotoAndCardNodesPreserved:true,scoreMovedOutsideHero:true,sourceDataChanges:0});
}
for(const {absolute,after} of plans)fs.writeFileSync(absolute,after);
fs.writeFileSync(path.join(__dirname,'react-family-movement.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({templates:report.length,groups:11,files:report.map(r=>r.file)}));
