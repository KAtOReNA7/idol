'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
// Reviewed ID/key-only public navigation tables at 3be8e09. No catalog or
// private payload is admitted, and changed bytes require explicit re-review.
const publicNavigationInputs=require('./PUBLIC_NAVIGATION_INPUTS.json');
function assertPublicNavigationContent(row,content){
 if(crypto.createHash('sha256').update(content).digest('hex')!==row.sha256)throw new Error('Public navigation input differs from reviewed bytes: '+row.path);
 const value=JSON.parse(content);
 if(JSON.stringify(Object.keys(value).sort())!==JSON.stringify(Object.keys(row.shape).sort()))throw new Error('Unexpected public navigation fields: '+row.path);
 if(row.schema==='public-artist-navigation-v1'){assertPublicArtistNavigation(value,row.path);return;}
 for(const [key,field] of Object.entries(row.shape)){
  if(!Array.isArray(value[key])||!value[key].every(item=>field==='string'?typeof item==='string':item&&Object.keys(item).length===1&&typeof item[field]==='string'))throw new Error('Non-key public navigation payload: '+row.path);
 }
}
function assertPublicArtistNavigation(value,file){
 const exact=(object,keys)=>object&&typeof object==='object'&&!Array.isArray(object)&&JSON.stringify(Object.keys(object).sort())===JSON.stringify([...keys].sort());
 const strings=(list,pattern)=>Array.isArray(list)&&list.every(item=>typeof item==='string'&&pattern.test(item))&&new Set(list).size===list.length;
 const key=/^[a-z0-9][A-Za-z0-9:_-]{0,199}$/;
 const record=/^rec[A-Za-z0-9]+$/;
 const fail=()=>{throw new Error('Non-key public navigation payload: '+file);};
 if(value.schemaVersion!==1||!exact(value.groups,['triples','rescene','purplekiss']))fail();
 for(const [slug,group]of Object.entries(value.groups)){
  if(!exact(group,['groupId','path','memberIds','releases','media','units','years','events'])||!record.test(group.groupId)||group.path!=='/artists/'+slug)fail();
  if(!strings(group.memberIds,record)||!strings(group.releases,key)||!strings(group.units,key)||!strings(group.years,/^20[0-9]{2}$/))fail();
  if(!Array.isArray(group.media)||!group.media.every(item=>exact(item,['key','kind'])&&typeof item.key==='string'&&key.test(item.key)&&['mv','stage'].includes(item.kind))||new Set(group.media.map(item=>item.kind+':'+item.key)).size!==group.media.length)fail();
  if(!Array.isArray(group.events)||!group.events.every(item=>exact(item,['id','year'])&&typeof item.id==='string'&&key.test(item.id)&&group.years.includes(item.year))||new Set(group.events.map(item=>item.id)).size!==group.events.length)fail();
 }
}
const sourceRoot=path.resolve(__dirname,'../../..');
const manifest=require('./ALIAS_MANIFEST.json');
const substitutions=manifest.filter(row=>row.original.startsWith('@/')).map(row=>[row.original,path.resolve(sourceRoot,row.replacement)]);
const aliasMap=new Map(substitutions);
const journeyImporter=path.join(sourceRoot,'lib/idol/artist-preview.ts');
function explicitTestAliases(observed=[]) {
 return {name:'explicit-timeline-host-test-content-only',setup(build){
  build.onResolve({filter:/^@\//},args=>{
   const target=aliasMap.get(args.path);
   if(!target)return;
   observed.push({original:args.path,replacement:target});
   return {path:target};
  });
  build.onResolve({filter:/^\.\.\/\.\.\/data\/triples\//},args=>{
   const row=manifest.find(row=>row.importer&&row.original===args.path&&path.resolve(sourceRoot,row.importer)===path.resolve(args.importer));
   if(!row)return;
   const target=path.resolve(sourceRoot,row.replacement);
   observed.push({original:args.path,importer:args.importer,replacement:target});
   return {path:target};
  });
  build.onResolve({filter:/^\.\/journey$/},args=>{
   if(path.resolve(args.importer)!==journeyImporter)return;
   const target=path.join(__dirname,'journey-route-adapter.ts');
   observed.push({original:args.path,importer:args.importer,replacement:target});
   return {path:target};
  });
 }};
}
function assertExplicitTestInputs(meta,observed){
 const testsRoot=path.join(sourceRoot,'tests/fixtures/timeline-host')+path.sep;
 for(const item of observed){if(!item.replacement.startsWith(testsRoot))throw new Error('Alias outside explicit fixture: '+item.replacement);}
 for(const input of Object.keys(meta.inputs)){
  const absolute=path.resolve(sourceRoot,input);
  if(absolute===path.join(sourceRoot,'data/artist-timeline-registry.json')){
   if(fs.readFileSync(absolute,'utf8')!==fs.readFileSync(path.join(sourceRoot,'HANDOFF/artist-registry51.json'),'utf8'))throw new Error('Production registry differs from frozen routes');
   continue;
  }
  const reviewed=publicNavigationInputs.find(row=>absolute===path.join(sourceRoot,row.path));
  if(reviewed){
   const importers=Object.entries(meta.inputs).filter(([,info])=>(info.imports??[]).some(item=>!item.external&&path.resolve(sourceRoot,item.path)===absolute)).map(([file])=>path.resolve(sourceRoot,file));
   if(importers.length!==1||importers[0]!==path.join(sourceRoot,reviewed.importer))throw new Error('Unauthorized public navigation importer: '+input);
   assertPublicNavigationContent(reviewed,fs.readFileSync(absolute,'utf8'));
   continue;
  }
  if(absolute.startsWith(path.join(sourceRoot,'data')+path.sep))throw new Error('Unauthorized actual data imported: '+input);
 }
 return {aliases:observed,inputs:Object.keys(meta.inputs),limitations:manifest.map(({original,unverified})=>({original,unverified}))};
}
module.exports={sourceRoot,explicitTestAliases,assertExplicitTestInputs,manifest,publicNavigationInputs,assertPublicNavigationContent};
