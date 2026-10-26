// Test-only real TypeScript bundle loader.
// Real executable TS import, bundled with exactly the repository implementation.
function load(relative){const fs=require('node:fs'),os=require('node:os'),path=require('node:path');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'library-model-'));const output=path.join(dir,'module.cjs');require('esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../..',relative)],outfile:output,bundle:true,platform:'node',format:'cjs',logLevel:'silent'});try{return require(output);}finally{fs.rmSync(dir,{recursive:true,force:true});}}
module.exports={...load('tests/library-browser/synthetic-fixture.ts'),load};
