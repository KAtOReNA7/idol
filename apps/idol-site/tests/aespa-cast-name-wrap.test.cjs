const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const css=fs.readFileSync('app/expanded-experience.css','utf8');
test('aespa cast names override anywhere wrapping on both text containers without truncation',()=>{
 const rule=css.match(/\.aespa-experience \.cast-card \.member-name strong,\.aespa-experience \.cast-card \.member-name \.member-display-name\{([^}]+)\}/);assert.ok(rule);assert.match(rule[1],/overflow-wrap:normal/);assert.match(rule[1],/word-break:normal/);assert.match(rule[1],/white-space:normal/);assert.match(rule[1],/hyphens:none/);assert.doesNotMatch(rule[1],/nowrap|hidden|ellipsis|break-all|anywhere/);
 assert.match(css,/\.aespa-experience \.cast-card \.member-name\{font-size:clamp\(16px,1\.8vw,18px\);align-items:flex-start\}/);assert.match(css,/@media\(max-width:760px\)\{\.aespa-experience \.cast-card \.member-name\{font-size:20px\}\}/);
 const scoped=css.slice(css.indexOf('/* Keep Latin stage-name words intact'));for(const selector of scoped.matchAll(/([^{}]+)\{/g)){if(selector[1].trim().startsWith('@media')||selector[1].includes('/*'))continue;assert.ok(selector[1].trim().startsWith('.aespa-experience .cast-card'));}
});
test('NINGNING remains complete and Chinese-first text is unchanged',()=>{
 const exports={};vm.runInNewContext('(function(exports){'+ts.transpileModule(fs.readFileSync('lib/idol/member-display-name.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText+'})')(exports);
 assert.equal(exports.memberDisplayName({id:'fixture',name:'NINGNING',stageName:'NINGNING',cnName:'宁艺卓',groupIds:[]}),'宁艺卓 · NINGNING');
 const page=fs.readFileSync('app/page.tsx','utf8');assert.match(page,/<strong><span className="member-display-name">\{m\?memberDisplayName\(m\):r.name\}<\/span><\/strong>/);
});

test('Syne 800 NINGNING fits narrowest desktop and tablet name columns',()=>{
 // Measured from the shipped variable Syne font at weight 800: 8.72 em.
 for(const viewport of [761,800,900,1000,1100,1101,1200,1440]){
  const columns=viewport<=1100?3:4,available=(viewport-96-24*(columns-1))/columns-28-12-10-15;
  const fontSize=Math.max(16,Math.min(viewport*.018,18));assert.ok(8.72*fontSize<=available,`${viewport}px width must fit NINGNING without letter splitting`);
 }
});
