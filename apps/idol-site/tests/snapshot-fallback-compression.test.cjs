const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const vm=require('node:vm');
const {createHash,webcrypto}=require('node:crypto');
const {gunzipSync}=require('node:zlib');
const {isDeepStrictEqual}=require('node:util');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const sourcePath=path.join(root,'data/snapshot.json');
const generatedPath=path.join(root,'data/snapshot-fallback.generated.ts');
const loaderPath=path.join(root,'lib/idol/snapshot-fallback.ts');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function moduleExports(file,stubs={},globals={}){
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(`(function(require,exports){${code}\n})`,{
  atob,Blob,Response,DecompressionStream,Uint8Array,TextDecoder,crypto:webcrypto,...globals,
 },{filename:file})(name=>{
  if(name==='server-only')return {};
  if(Object.hasOwn(stubs,name))return stubs[name];
  throw Error('Unexpected runtime import');
 },exports);
 return exports;
}
function payload(){return moduleExports(generatedPath);}

test('deterministic gzip packaging restores exact authoritative bytes, SHA and JSON',async()=>{
 const {renderSnapshotFallback,generate}=await import('../scripts/build-snapshot-fallback.mjs');
 const source=fs.readFileSync(sourcePath),p=payload();
 const bytes=gunzipSync(Buffer.from(p.snapshotGzipBase64,'base64'));
 assert.equal(source.length,7921866);
 assert.equal(sha(source),'dedbfb37f19a55d9cc1916ddb0a0ae21e537843343956731fe4089ade6606547');
 assert.equal(p.snapshotByteLength,source.length);
 assert.equal(p.snapshotSha256,sha(source));
 assert.ok(bytes.equals(source),'Decompressed bytes must equal the source without reserialization');
 assert.ok(isDeepStrictEqual(JSON.parse(bytes),JSON.parse(source)),'All JSON values and array order must match');
 assert.ok(Buffer.byteLength(p.snapshotGzipBase64)<1000000,'The server-only encoded snapshot must stay below 1 MB');
 assert.ok(renderSnapshotFallback(source)===fs.readFileSync(generatedPath,'utf8'),'Generated packaging must be reproducible');
 assert.ok(renderSnapshotFallback(source)===renderSnapshotFallback(source),'Repeated compression must be deterministic');
 generate({check:true});
});

test('generator check rejects stale packaging without rewriting source or output',async()=>{
 const {generate}=await import('../scripts/build-snapshot-fallback.mjs');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'snapshot-fallback-check-'));
 try{
  const sourcePath=path.join(temp,'source.json'),destinationPath=path.join(temp,'generated.ts');
  const original=Buffer.from('{"tables":{},"capturedAt":"synthetic"}\n');
  fs.writeFileSync(sourcePath,original);
  generate({sourcePath,destinationPath});
  generate({check:true,sourcePath,destinationPath});
  fs.writeFileSync(destinationPath,'stale\n');
  assert.throws(()=>generate({check:true,sourcePath,destinationPath}),/Stale fallback snapshot/);
  assert.equal(fs.readFileSync(destinationPath,'utf8'),'stale\n');
  assert.ok(fs.readFileSync(sourcePath).equals(original));
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
 const build=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts.build;
 assert.match(build,/node scripts\/build-snapshot-fallback\.mjs --check && node scripts\/run-framework\.mjs build/);
});

test('standard Web Streams loader is lazy, lossless, coalesced and shares the original object',async()=>{
 let decompressions=0;
 class CountedDecompressionStream extends DecompressionStream{constructor(format){assert.equal(format,'gzip');super(format);decompressions++;}}
 const {loadFallbackSnapshot}=moduleExports(loaderPath,{'@/data/snapshot-fallback.generated':payload()},{DecompressionStream:CountedDecompressionStream});
 assert.equal(decompressions,0);
 const first=loadFallbackSnapshot(),peer=loadFallbackSnapshot();
 assert.equal(first,peer);
 const result=await first;
 assert.ok(isDeepStrictEqual(JSON.parse(JSON.stringify(result)),JSON.parse(fs.readFileSync(sourcePath))),'Loader must preserve every snapshot field');
 assert.equal(await peer,result);
 assert.equal(await loadFallbackSnapshot(),result);
 assert.equal(decompressions,1);
});

test('integrity mismatch rejects without returning partial data and retries can recover',async()=>{
 const p=payload(),correct=p.snapshotSha256;p.snapshotSha256='0'.repeat(64);
 const {loadFallbackSnapshot}=moduleExports(loaderPath,{'@/data/snapshot-fallback.generated':p});
 await assert.rejects(loadFallbackSnapshot(),/Fallback snapshot integrity check failed/);
 p.snapshotSha256=correct;
 const result=await loadFallbackSnapshot();
 assert.equal(typeof result.capturedAt,'string');
 assert.equal(await loadFallbackSnapshot(),result);
});

test('loader and generated payload are server-only, with exactly one guarded lazy catalog import',()=>{
 for(const file of [loaderPath,generatedPath])assert.match(fs.readFileSync(file,'utf8'),/^import 'server-only';/m);
 const catalogPath=path.join(root,'lib/idol/catalog.ts'),source=fs.readFileSync(catalogPath,'utf8');
 const ast=ts.createSourceFile(catalogPath,source,ts.ScriptTarget.Latest,true);
 const dynamic=[];
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword){
   assert.equal(node.arguments.length,1);
   if(node.arguments[0].text==='./snapshot-fallback')dynamic.push(node);
  }
  ts.forEachChild(node,visit);
 }
 visit(ast);assert.equal(dynamic.length,1);
 let parent=dynamic[0].parent;
 while(parent&&!ts.isIfStatement(parent))parent=parent.parent;
 assert.ok(parent,'Lazy import must remain inside a branch');
 assert.equal(parent.expression.getText(ast),'!configured()');
 assert.doesNotMatch(source,/snapshot\.json|snapshot-fallback\.generated|from ['"]\.\/snapshot-fallback/);
 const loader=fs.readFileSync(loaderPath,'utf8');
 assert.doesNotMatch(loader,/fetch\(|node:|console\.|snapshot\.json/);
});

test('fallback data and loader are unreachable from every client-module import graph',()=>{
 const files=[];
 function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())walk(file);else if(/\.[cm]?[jt]sx?$/.test(file))files.push(file);}}
 for(const dir of ['app','components','lib','hooks'])walk(path.join(root,dir));
 const blocked=new Set([sourcePath,generatedPath,loaderPath]);
 const graph=new Map(),clients=[];
 function resolve(from,name){
  const base=name.startsWith('@/')?path.join(root,name.slice(2)):name.startsWith('.')?path.resolve(path.dirname(from),name):null;
  if(!base)return null;
  return [base,...['.ts','.tsx','.js','.json','/index.ts','/index.tsx'].map(ext=>base+ext)].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
 }
 for(const file of files){
  const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  if(ast.statements.some(node=>ts.isExpressionStatement(node)&&ts.isStringLiteral(node.expression)&&node.expression.text==='use client'))clients.push(file);
  const dependencies=[];
  function visit(node){
   if(ts.isImportDeclaration(node)&&!node.importClause?.isTypeOnly&&ts.isStringLiteral(node.moduleSpecifier))dependencies.push(resolve(file,node.moduleSpecifier.text));
   if(ts.isExportDeclaration(node)&&!node.isTypeOnly&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))dependencies.push(resolve(file,node.moduleSpecifier.text));
   if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))dependencies.push(resolve(file,node.arguments[0].text));
   ts.forEachChild(node,visit);
  }
  visit(ast);graph.set(file,dependencies.filter(Boolean));
 }
 assert.ok(clients.length>0);
 for(const client of clients){const queue=[client],seen=new Set();while(queue.length){const file=queue.pop();if(seen.has(file))continue;seen.add(file);assert.ok(!blocked.has(file),'Fallback server data reached from '+path.relative(root,client));queue.push(...(graph.get(file)??[]));}}
});

test('production fallback loader and payload pass strict TypeScript with the actual project types',()=>{
 const parsed=ts.parseJsonConfigFileContent(JSON.parse(fs.readFileSync(path.join(root,'tsconfig.json'),'utf8')),ts.sys,root);
 const options={...parsed.options,strict:true,noEmit:true,incremental:false};
 const program=ts.createProgram([loaderPath,generatedPath,path.join(root,'cloudflare-env.d.ts')],options);
 const diagnostics=ts.getPreEmitDiagnostics(program);
 assert.equal(diagnostics.length,0,diagnostics.map(d=>`${d.file?path.relative(root,d.file.fileName):'compiler'}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`).join('\n'));
});
