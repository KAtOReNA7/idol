'use strict';
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const manifest=require('./ALIAS_MANIFEST.json');
const exact=new Map(manifest.filter(row=>row.original.startsWith('@/')).map(row=>[row.original,path.resolve(root,row.replacement)]));
const host=path.join(__dirname,'non-image-host.tsx');
const journey=path.resolve(root,'tests/fixtures/timeline-host/journey-route-adapter.ts');
function aliases(observed=[]){return {name:'explicit-image-fixture-inputs',setup(build){
 build.onResolve({filter:/^@\//},args=>{const replacement=exact.get(args.path);if(!replacement)return;observed.push({original:args.path,replacement});return {path:replacement};});
 build.onResolve({filter:/^\.\/artist-timeline-host$/},args=>{if(path.dirname(args.importer)!==path.join(root,'components'))return;observed.push({original:args.path,replacement:host});return {path:host};});
 build.onResolve({filter:/^\.\.\/\.\.\/data\/artist-timeline-registry\.json$/},args=>{if(!['lib/idol/artist-preview.ts','lib/idol/artist-navigation.ts'].some(file=>args.importer===path.join(root,file)))return;const replacement=path.join(__dirname,'public-route-registry.ts');observed.push({original:args.path,replacement});return {path:replacement};});
 build.onResolve({filter:/^\.\.\/\.\.\/data\//},args=>{
  const row=manifest.find(row=>row.importer&&row.original===args.path&&path.resolve(root,row.importer)===path.resolve(args.importer));
  if(!row)return;
  const replacement=path.resolve(root,row.replacement);observed.push({original:args.path,importer:args.importer,replacement});return {path:replacement};
 });
 build.onResolve({filter:/^\.\/journey$/},args=>{if(args.importer!==path.join(root,'lib/idol/artist-preview.ts'))return;observed.push({original:args.path,replacement:journey});return {path:journey};});
}};}
function checkInputs(meta,observed){for(const row of observed)if(!row.replacement.startsWith(path.join(root,'tests')+path.sep))throw new Error('Fixture replacement outside tests');for(const input of Object.keys(meta.inputs))if(path.resolve(root,input).startsWith(path.join(root,'data')+path.sep))throw new Error('Unexpected actual data imported: '+input);return {inputs:Object.keys(meta.inputs),aliases:observed};}
module.exports={root,aliases,checkInputs,manifest};
