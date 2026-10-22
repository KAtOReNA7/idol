'use strict';
const path=require('node:path');
const fs=require('node:fs');
const esbuild=require('esbuild');
const {sourceRoot,explicitTestAliases,assertExplicitTestInputs}=require('./explicit-test-aliases.cjs');
async function buildFixture({entry='ssr-entry.tsx',output,platform='node'}){
 const observed=[];
 const result=await esbuild.build({entryPoints:[path.join(__dirname,entry)],bundle:true,outfile:output,
  absWorkingDir:sourceRoot,platform,format:platform==='node'?'cjs':'iife',jsx:'automatic',
  ...(platform==='node'?{external:['react','react/*'],loader:{'.css':'empty'}}:{define:{'process.env.NODE_ENV':'"production"'}}),
  nodePaths:process.env.NODE_PATH?process.env.NODE_PATH.split(path.delimiter):[],
  plugins:[explicitTestAliases(observed)],metafile:true,logLevel:'silent'});
 const proof=assertExplicitTestInputs(result.metafile,observed);
 fs.writeFileSync(output+'.metafile.json',JSON.stringify(result.metafile,null,2));
 fs.writeFileSync(output+'.aliases.json',JSON.stringify(proof,null,2));
 return proof;
}
module.exports={buildFixture};
