// Validate only editorial metadata. No credentials, network or production writes.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import ts from 'typescript';
const root=process.cwd(),input=JSON.parse(fs.readFileSync(process.argv[2]??path.join(root,'data/stages/supplements.json'),'utf8'));const inventory=JSON.parse(fs.readFileSync(path.join(root,'data/stages/inventory.json'),'utf8'));const known=new Set(inventory.works.map(w=>w.recordId));
const source=fs.readFileSync(path.join(root,'lib/idol/supplements.ts'),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const exports={};vm.runInNewContext(`(function(require,exports){${code}\n})`,{URL,Date,Set})(n=>{if(n==='@/data/stages/supplements.json')return input;throw Error('Unexpected dependency '+n)},exports);
if(input.formatVersion!=='idol.stage-supplements.v1')throw Error('Unsupported supplement metadata');
let alternatives=0,reviews=0,official=0,audience=0,press=0,excerpts=0,watchLeads=0,runtimeAlternatives=0,runtimeWatchLeads=0;const seen=new Set();
for(const [id,row] of Object.entries(input.works)){
 if(!known.has(id)||!Array.isArray(row.alternatives))throw Error('Unknown work or missing alternatives list '+id);
 for(const a of row.alternatives){if(!exports.validStageAlternative(a))throw Error(`Invalid alternative ${id}/${a.id}`);const key=id+':'+a.id;if(seen.has(key))throw Error('Duplicate '+key);seen.add(key);alternatives++;if(a.sourceClass==='official')official++;else if(a.sourceClass==='press_original')press++;else audience++;if(a.completeness==='excerpt')excerpts++;}
 if(row.watchLeads!==undefined&&!Array.isArray(row.watchLeads))throw Error('Invalid viewing leads list '+id);
 for(const a of row.watchLeads??[]){if(!exports.validStageWatchLead(a))throw Error(`Invalid watching lead ${id}/${a.id}`);const key=id+':lead:'+a.id;if(seen.has(key))throw Error('Duplicate '+key);seen.add(key);watchLeads++;}
 if(row.searchReview){if(!exports.validStageSearchReview(row.searchReview))throw Error('Invalid bounded review '+id);reviews++;}
 if(!row.alternatives.length&&!row.watchLeads?.length&&!row.searchReview)throw Error('Empty supplement '+id);
 const visible=exports.stageSupplementForWork(id);runtimeAlternatives+=visible?.alternatives.length??0;runtimeWatchLeads+=visible?.watchLeads?.length??0;
}
const text=JSON.stringify(input);if(/evidenceFile|file:\/\/|\/workspace\/|\/tmp\//.test(text))throw Error('Local evidence path must not enter rendered source metadata');
console.log(JSON.stringify({works:Object.keys(input.works).length,alternatives,reviews,official,audience,press,excerpts,watchLeads,runtimeAlternatives,runtimeWatchLeads,hiddenBySelectionPolicy:alternatives+watchLeads-runtimeAlternatives-runtimeWatchLeads,scoreBindings:0}));
