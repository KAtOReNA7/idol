import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {normalizeCarrierImports,resolveAuditedCarriers} from '../scripts/audit-built-carriers.mjs';
const dirs=['dist/client/_next/static/chunks','dist/server/ssr/_next/static'];
const integrity=text=>({bytes:Buffer.byteLength(text),sha256:createHash('sha256').update(text).digest('hex')});
function fixture(t,normalized=true){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'carrier-audit-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const put=(name,text)=>{const p=path.join(root,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);};
 const body='import{r as e}from"./dependency-AAAAAAAA.js";const photo="/artist/kept/original.jpg";export{photo};';
 const pins={},normalizedPins={};
 for(const dir of dirs){
  pins[dir+'/sample-OLD__001.js']=integrity(body);
  put(dir+'/sample-NEW__001.js',body);
  if(normalized)normalizedPins[dir]={...integrity(normalizeCarrierImports(body,['./dependency-<hash>.js'])),imports:['./dependency-<hash>.js']};
 }
 return {root,put,body,pins,normalizedPins,audit:()=>resolveAuditedCarriers(root,pins,'sample',normalizedPins)};
}
test('filename changes retain exact legacy content pins',t=>{
 const f=fixture(t,false);assert.deepEqual(Object.keys(f.audit()),dirs.map(d=>d+'/sample-NEW__001.js'));
 f.put(dirs[0]+'/sample-NEW__001.js',f.body.replace('original.jpg','modified.jpg'));
 assert.throws(f.audit,/integrity/);
});
test('only reviewed leading import hashes may rotate; original pins remain unchanged',t=>{
 const f=fixture(t),before=structuredClone(f.pins);
 for(const d of dirs)f.put(d+'/sample-NEW__001.js',f.body.replace('AAAAAAAA','BBBBBBBB'));
 assert.equal(Object.keys(f.audit()).length,2);assert.deepEqual(f.pins,before);
});
for(const [name,mutate,pattern] of [
 ['body literal change',f=>f.put(dirs[0]+'/sample-NEW__001.js',f.body.replace('original.jpg','modified.jpg')),/integrity/],
 ['import binding change',f=>f.put(dirs[0]+'/sample-NEW__001.js',f.body.replace('r as e','r as x')),/integrity/],
 ['unknown dependency',f=>f.put(dirs[0]+'/sample-NEW__001.js',f.body.replace('dependency','maliciousx')),/import inventory/],
 ['extra carrier',f=>f.put(dirs[0]+'/sample-OTHER001.js',f.body),/ambiguous/],
 ['missing carrier',f=>fs.unlinkSync(path.join(f.root,dirs[0]+'/sample-NEW__001.js')),/missing/],
 ['symlink carrier',f=>{fs.unlinkSync(path.join(f.root,dirs[0]+'/sample-NEW__001.js'));fs.symlinkSync(path.join(f.root,dirs[1]+'/sample-NEW__001.js'),path.join(f.root,dirs[0]+'/sample-NEW__001.js'));},/symlink/],
 ['out-of-scope pin',f=>{f.pins['dist/other/sample-OLD__001.js']=f.pins[dirs[0]+'/sample-OLD__001.js'];delete f.pins[dirs[0]+'/sample-OLD__001.js'];},/inventory/],
 ['partial normalized scope',f=>delete f.normalizedPins[dirs[1]],/scope/],
])test('fails closed: '+name,t=>{const f=fixture(t);mutate(f);assert.throws(f.audit,pattern);});
test('a matching filename inside a runtime string is not normalized',()=>{
 const a='import{r as e}from"./dependency-AAAAAAAA.js";const source="./dependency-AAAAAAAA.js";';
 const b=a.replaceAll('AAAAAAAA','BBBBBBBB');
 assert.notEqual(normalizeCarrierImports(a,['./dependency-<hash>.js']),normalizeCarrierImports(b,['./dependency-<hash>.js']));
});
test('new/duplicate imports and unsupported import grammar fail closed',()=>{
 const line='import{r as e}from"./dependency-AAAAAAAA.js";';
 assert.throws(()=>normalizeCarrierImports(line+line,['./dependency-<hash>.js']),/inventory/);
 assert.throws(()=>normalizeCarrierImports(line.replace('./dependency-AAAAAAAA.js','https://example.test/a.js'),['./dependency-<hash>.js']),/unsupported/);
 assert.throws(()=>normalizeCarrierImports(line.replace('import{','import {'),['./dependency-<hash>.js']),/inventory/);
});
