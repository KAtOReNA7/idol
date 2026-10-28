// Reuse the established isolated React hook ports, without executing its test IIFE.
// WorkDetail and Editor are transpiled from the current product source. All reads
// and writes use synthetic records; no real browser, network or personal save.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
module.exports=function harness(stageSourceModule){
 const tests=path.resolve(__dirname,'..');
 const source=fs.readFileSync(path.join(tests,'editor-flow.test.cjs'),'utf8');
 const boundary=source.indexOf('\n(async()=>{');
 assert.ok(boundary>0,'the shared hook setup must remain separate from its test body');
 let prefix=source.slice(0,boundary);
 const marker='const localRequire=n=>{';
 assert.equal(prefix.split(marker).length,2);
 // The source-key and binding behavior under test uses the real pure module.
 prefix=prefix.replace(marker,marker+"if(n==='@/lib/idol/stage-source')return stageSourceModule;");
 const factory=vm.runInNewContext('(function(require,__dirname,stageSourceModule){'+prefix+`
  return {wp,requests,records,listeners,find,all,walk,txt,Editor:exportsObj.Editor,settle,
   tree:()=>wt,editor:()=>et,memberEditor:()=>mt,footer:()=>footer,
   renderWork:()=>w.render(wp),setCanEdit(value){canEdit=value;},
   click(node){if(!node)throw Error('Missing control');if(node.props.disabled)return false;return node.props.onClick();}
  };
 })`,{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone});
 return factory(require('node:module').createRequire(path.join(tests,'core.test.cjs')),tests,stageSourceModule);
};
