'use strict';
const path=require('node:path');const fs=require('node:fs');const esbuild=require('esbuild');
const {root,aliases,checkInputs}=require('./aliases.cjs');
async function build({entry='ssr-entry.tsx',outfile,platform='node',external=[],development=false}){
 const observed=[];
 const result=await esbuild.build({entryPoints:[path.join(__dirname,entry)],absWorkingDir:root,bundle:true,outfile,platform,format:platform==='node'?'cjs':'iife',jsx:'automatic',
 nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),plugins:[aliases(observed)],metafile:true,logLevel:'silent',
 ...(platform==='node'?{external:['react','react/*',...external],loader:{'.css':'empty'}}:{define:{'process.env.NODE_ENV':development?'"development"':'"production"'}})});
 const proof=checkInputs(result.metafile,observed);fs.writeFileSync(outfile+'.metafile.json',JSON.stringify(result.metafile,null,2));fs.writeFileSync(outfile+'.aliases.json',JSON.stringify(proof,null,2));return proof;
}
module.exports={build};
