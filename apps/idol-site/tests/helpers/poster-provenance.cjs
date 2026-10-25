// Older batches remain immutable evidence; current renderer precedence is tested
// against the complete refreshed inventory in mv-public-media.test.cjs.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
function checkOriginals(name,rows){
 test(name+' retains every original file and pinned SHA',()=>{
  assert(rows.length>0);
  for(const p of rows){const src=p.src??p.url,file=p.repositoryFile??p.file??'public'+src,bytes=fs.readFileSync(file);
   assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.sha256??p.sha,file);
   if(p.bytes??p.byteCount)assert.equal(bytes.length,p.bytes??p.byteCount,file);
  }
 });
}
module.exports={checkOriginals};
