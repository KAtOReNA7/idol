const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),{execFileSync}=require('node:child_process');
const page=fs.readFileSync('app/page.tsx','utf8');
function functionText(source,name){const ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const fn=ast.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name);assert.ok(fn,`Missing function ${name}`);return fn.getText(ast);}
test('combined App keeps Editor and private record search identical to accepted baseline',()=>{
 const base=execFileSync('git',['show','f279765:app/page.tsx'],{encoding:'utf8'});
 assert.equal(functionText(page,'Editor'),functionText(base,'Editor'));
 const region=s=>{const start=s.indexOf('// Private search stays'),end=s.indexOf(' const generations=');assert.ok(start>=0,'private search start marker must exist');assert.ok(end>start,'private search end marker must follow start');return s.slice(start,end);};assert.equal(region(page),region(base));
 for(const file of ['lib/idol/personal-record-search.ts','lib/idol/personal-record-search-browser.ts'])if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),execFileSync('git',['show','f279765:'+file],{encoding:'utf8'}));
});
test('combined group fallback stays inside stable image provider and separate style gate',()=>{
 const ast=ts.createSourceFile('page.tsx',page,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),app=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='App');
 const result=app.body.statements.find(ts.isReturnStatement).expression;
 assert.equal(result.openingElement.tagName.getText(ast),'ImageRecoveryProvider');
 assert.match(page,/data-browse-content inert=\{!!data&&!journey.styleReady\}/);
 assert.match(page,/GroupIndex\?<GroupIndex[\s\S]*?:groupViewsFallback\(\)/);
 assert.match(page,/onClick=\{journey.reloadPage\}/);
 const journey=fs.readFileSync('components/use-browse-journey.ts','utf8');assert.match(journey,/function reloadPage\(\)\{if\(!mayLeave\(\)\)return false;capture\(\);window.location.reload\(\)/);
 const recovery=fs.readFileSync('components/reliable-image.tsx','utf8');assert.doesNotMatch(recovery,/location\.|reloadPage|journey\./);assert.match(recovery,/event.preventDefault\(\); event.stopPropagation\(\);/);
});
