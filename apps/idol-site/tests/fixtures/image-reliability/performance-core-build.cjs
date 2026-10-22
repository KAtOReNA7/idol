'use strict';
const fs=require('node:fs');const path=require('node:path');const esbuild=require('esbuild');
const {currentRecords,implementations}=require('./performance-extract.cjs');
const before=require('./performance-before-impls.json');
const sourceRoot=path.resolve(__dirname,'../../..');
const {explicitTestAliases}=require('../timeline-host/explicit-test-aliases.cjs');
async function buildCore({phase,output,platform='node',extraEntry=''}){
 if(!['before','after'].includes(phase))throw new Error('phase must be before or after');
 const records=phase==='before'?before.records:currentRecords(sourceRoot);const observed=[];
 const files=implementations.map(name=>'components/'+name+'.tsx');
 const contents=files.map((file,index)=>`import * as module${index} from 'image-impl:${file}';`).join('\n')+"\nimport {PhotoLightbox} from 'image-impl:components/photo-lightbox.tsx';\n"+
  'export const implementations=['+files.map((file,index)=>`{name:${JSON.stringify(path.basename(file,'.tsx'))},Picture:module${index}.Picture,WorkCard:module${index}.WorkCard,Thumb:module${index}.Thumb??module${index}.VideoThumb}`).join(',')+'];export {PhotoLightbox};'+
  (phase==='after'?"export {ImageRecoveryProvider,ImageRecoveryControls} from './components/reliable-image';":'')+extraEntry;
 const result=await esbuild.build({stdin:{contents,resolveDir:sourceRoot,sourcefile:'performance-image-core-entry.tsx',loader:'tsx'},outfile:output,bundle:true,minify:true,treeShaking:true,platform,format:platform==='node'?'cjs':'iife',...(platform==='node'?{external:['react','react/*','react-dom','react-dom/*','lucide-react']}:{globalName:'ImagePerformanceCore',define:{'process.env.NODE_ENV':'"production"'}}),jsx:'automatic',nodePaths:process.env.NODE_PATH?process.env.NODE_PATH.split(path.delimiter):[],loader:{'.css':'empty'},metafile:true,logLevel:'silent',plugins:[{name:'exact-before-or-current-image-declarations',setup(build){build.onResolve({filter:/^image-impl:/},args=>({path:args.path.slice('image-impl:'.length),namespace:'image-implementation'}));build.onLoad({filter:/.*/,namespace:'image-implementation'},args=>({contents:records[args.path].code,loader:'tsx',resolveDir:path.join(sourceRoot,path.dirname(args.path))}));}},explicitTestAliases(observed)]});
 return {records:Object.fromEntries(Object.entries(records).map(([name,row])=>[name,{sourceSha256:row.sourceSha256,selected:row.selected}])),aliases:observed,metafile:result.metafile,phase};
}
module.exports={buildCore,sourceRoot};
