import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {auditUnusedIfeyeOriginalBuildAssets} from '../scripts/audit-unused-ifeye-original-build-assets.mjs';
const require=createRequire(import.meta.url);
test('native ifeye retains all fourteen old image files, even when a legacy manifest requests deletion',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ifeye-native-retention-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const put=(p,s)=>{p=path.join(root,p);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
 const prefix='/artist/ifeye/batch-b-20261016/';
 put('data/ifeye-assets.json',JSON.stringify([{url:prefix+'kasia-display.jpg'}]));
 const inventory={},files=[];
 for(const stem of ['group','kasia','meu','rahee','sasha','taerin','won-hwayeon'])for(const suffix of ['original.png','display.jpg']){const name=stem+'-'+suffix;inventory[name]={};put('dist/client'+prefix+name,'retained');if(suffix==='display.jpg')files.push({path:prefix+name});}
 put('dist/server/index.js','');
 assert.deepEqual(auditUnusedIfeyeOriginalBuildAssets(root),[]);
 // Isolate the unrelated YOUNG POSSE audit; never relax its production pins.
 const result=await build({entryPoints:['scripts/audit-unused-display-assets.mjs'],bundle:true,platform:'node',format:'cjs',write:false,define:{'import.meta.url':JSON.stringify(new URL('../scripts/audit-unused-display-assets.mjs',import.meta.url).href)},plugins:[{name:'unrelated-audit-fixture',setup(b){b.onResolve({filter:/audit-youngposse-retained-originals/},()=>({path:'stub',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const youngposseAuditTexts=()=>((_file,text)=>text)',loader:'js'}));}}],logLevel:'silent'});
 const module={exports:{}};vm.runInThisContext('(function(require,module,exports){'+result.outputFiles[0].text+'\n})')(require,module,module.exports);
 assert.deepEqual(module.exports.auditUnusedDisplayAssets(root,{version:1,groups:{ifeye:inventory},files}),[]);
 for(const name of Object.keys(inventory))assert.equal(fs.readFileSync(path.join(root,'dist/client',prefix,name),'utf8'),'retained');
});
