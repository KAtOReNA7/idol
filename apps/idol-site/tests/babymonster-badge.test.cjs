const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
test('BM seven roster indices remain intact while full Chinese and Latin names may wrap',()=>{
 const source=fs.readFileSync('components/artist-sample.tsx','utf8'),roster=source.split('\n').find(s=>s.startsWith(' const renderRoster='));
 const content=JSON.parse(fs.readFileSync('data/babymonster-artist.json'));
 const orderedMembers=content.profile.members.map((stageName,i)=>({id:'recMember'+i,stageName,cnName:i===0?'河井瑠花':'完整中文长成员名字',status:'在团'}));
 const before=JSON.stringify(orderedMembers),exports={};
 const code=ts.transpileModule(roster+'\nexports.renderRoster=renderRoster;',{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require,orderedMembers,memberVisual:()=>null,imageUrl:()=>'',memberDisplayName:m=>m.cnName+' · '+m.stageName,openMember:()=>{},Picture:()=>null});
 const html=renderToStaticMarkup(React.createElement(exports.renderRoster));
 for(let i=1;i<=7;i++)assert.ok(html.includes('<small>0'+i+'</small>'));
 assert.match(html,/河井瑠花 · RUKA/);assert.match(html,/完整中文长成员名字 · PHARITA/);
 assert.equal(JSON.stringify(orderedMembers),before);
 const css=fs.readFileSync('app/preview/babymonster/artist.css','utf8'),global=fs.readFileSync('app/globals.css','utf8');
 const badge=css.match(/\.as-roster strong small\{([^}]+)\}/)[1];
 assert.match(badge,/flex-shrink:0/);assert.match(badge,/white-space:nowrap/);
 const name=global.match(/\.member-display-name\{([^}]+)\}/)[1];
 assert.match(name,/min-width:0/);assert.match(name,/overflow-wrap:anywhere/);assert.match(name,/white-space:normal/);
 assert.doesNotMatch(name,/text-overflow:ellipsis|overflow:hidden/);
});
