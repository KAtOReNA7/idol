import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {auditGenblueBuildAssets} from '../scripts/audit-genblue-build-assets.mjs';
function fixture(run){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'genblue-retention-'));
 const entries=[];
 try{
  for(const subject of ['group',...Array.from({length:6},(_,i)=>'card-'+(i+1))])for(const kind of ['display','original']){
   const ref='/artist/genblue/batch-b-20261016/'+subject+'-'+kind+'.jpg',bytes=Buffer.from('synthetic '+ref);
   for(const base of ['public','dist/client']){const target=path.join(root,base,ref);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
   entries.push({path:ref,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),retain:kind==='display'});
  }
  run(root,entries);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
test('only unused originals enter the plan; current seven JPGs and every public source remain, including on a repeated run',()=>fixture((root,entries)=>{
 const plan=auditGenblueBuildAssets(root,[{p:'data/genblue-bluecut.json',text:entries.filter(e=>e.retain).map(e=>e.path).join('\n')}],entries);
 assert.equal(plan.length,7);assert.ok(plan.every(p=>p.file.endsWith('-original.jpg')));
 for(const p of plan)fs.unlinkSync(path.join(root,p.file));
 assert.equal(auditGenblueBuildAssets(root,[],entries).length,0);
 for(const e of entries){assert.ok(fs.existsSync(path.join(root,'public',e.path)));if(e.retain)assert.ok(fs.existsSync(path.join(root,'dist/client',e.path)));}
}));
test('new original references prevent pruning',()=>fixture((root,entries)=>assert.throws(()=>auditGenblueBuildAssets(root,[{p:'runtime.ts',text:entries.find(e=>!e.retain).path}],entries),/now referenced/)));
test('missing or altered runtime JPG fails closed',()=>fixture((root,entries)=>{const e=entries.find(e=>e.retain),p=path.join(root,'dist/client',e.path);fs.writeFileSync(p,'changed');assert.throws(()=>auditGenblueBuildAssets(root,[],entries),/integrity/);fs.unlinkSync(p);assert.throws(()=>auditGenblueBuildAssets(root,[],entries),/integrity/);}));
test('an unexpected build file is retained for manual review, never silently pruned',()=>fixture((root,entries)=>{fs.writeFileSync(path.join(root,'dist/client/artist/genblue/batch-b-20261016/new.jpg'),'new');assert.throws(()=>auditGenblueBuildAssets(root,[],entries),/unexpected asset/);}));
