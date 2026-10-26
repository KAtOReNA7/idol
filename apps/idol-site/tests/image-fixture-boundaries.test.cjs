'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');
const {root,aliases,checkInputs,manifest}=require('./fixtures/image-reliability/aliases.cjs');
function resolver(){const handlers=[];aliases().setup({onResolve(options,callback){handlers.push({filter:options.filter,callback});}});return args=>{for(const handler of handlers)if(handler.filter.test(args.path)){const result=handler.callback(args);if(result)return result;}return undefined;};}
test('runtime inputs are exact declared test-only replacements, not wildcard data imports',()=>{
 const resolve=resolver();
 for(const original of ['@/data/runtime/member-careers/periods.json','@/data/runtime/idle-design-public.json','@/data/runtime/billlie-figma-catalog.json','@/data/runtime/hearts2hearts-figma-assets.json']){
  const row=manifest.find(row=>row.original===original);assert.ok(row);assert.deepEqual(resolve({path:original,importer:path.join(root,'components/member-career-facts.tsx')}),{path:path.resolve(root,row.replacement)});
 }
 for(const original of ['@/data/runtime/unlisted.json','@/data/snapshot.json','@/app/api/catalog/route'])assert.equal(resolve({path:original,importer:path.join(root,'components/member-career-facts.tsx')}),undefined);
});
test('relative data ports require both the exact specifier and exact importer',()=>{
 const resolve=resolver();
 for(const row of manifest.filter(row=>row.importer)){
  assert.deepEqual(resolve({path:row.original,importer:path.resolve(root,row.importer)}),{path:path.resolve(root,row.replacement)});
  assert.equal(resolve({path:row.original,importer:path.join(root,'components/unlisted.tsx')}),undefined);
 }
 assert.equal(resolve({path:'../../data/unlisted.json',importer:path.join(root,'lib/idol/artist-navigation.ts')}),undefined);
});
test('actual data and non-test replacement proofs still fail closed',()=>{
 for(const input of ['data/snapshot.json','data/runtime/member-careers/periods.json','data/unlisted.json'])assert.throws(()=>checkInputs({inputs:{[input]:{}}},[]),/Unexpected actual data imported/);
 assert.throws(()=>checkInputs({inputs:{}},[{replacement:path.join(root,'lib/idol/types.ts')}]),/Fixture replacement outside tests/);
});
