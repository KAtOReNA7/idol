const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module');
const esbuild=require('esbuild'),root=path.resolve(__dirname,'..'),manifest=require('../data/production-asset-delivery.json');
const result=esbuild.buildSync({entryPoints:[path.join(root,'lib/public-asset-delivery.ts')],bundle:true,write:false,platform:'node',format:'cjs',logLevel:'silent'});
const m=new Module(__filename,module);m._compile(result.outputFiles[0].text,__filename);const {publishedPublicAsset}=m.exports;
const asset=manifest.assets.find(r=>r.delivery==='remote'),url='https://formal.example'+asset.path;
const request=(pathname,method='GET')=>new Request(pathname.startsWith('https:')?pathname:'https://formal.example'+pathname,{method});
test('only fixed public originals are proxied; APIs, private paths, local originals and mutations retain app handling',async()=>{
 const forbidden=async()=>{throw Error('Unexpected external fetch')};
 for(const p of ['/api/save','/api/media?table=members','/api/editorial-assets','/signin-with-chatgpt','/unknown.jpg','/artist/udtt/batch-b-20261016/group.display.jpg',...require('../scripts/udtt-private-build-assets-manifest.json').files.map(r=>r.path),manifest.assets.find(r=>r.delivery==='local').path])assert.equal(await publishedPublicAsset(request(p),forbidden),null);
 for(const method of ['POST','PUT','DELETE','PATCH'])assert.equal(await publishedPublicAsset(request(url,method),forbidden),null);
});
test('forwards only the immutable path, streams unchanged bytes and does not forward caller credentials/query/headers',async()=>{
 const bytes=new Uint8Array([0,1,2,255]),req=new Request(url+'?token=private',{headers:{Authorization:'Bearer private',Cookie:'private=yes',Origin:'https://formal.example'}});
 let called;const response=await publishedPublicAsset(req,async(u,init)=>{called={u,init};return new Response(bytes,{headers:{'Content-Type':asset.mime}})});
 assert.equal(called.u,manifest.baseUrl+encodeURI(asset.path));assert.deepEqual(called.init.headers,{'Accept':asset.mime,'Accept-Encoding':'identity'});assert.equal(called.init.redirect,'manual');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);assert.equal(response.headers.get('X-Idol-Expected-Sha256'),asset.sha256);assert.equal(response.status,200);
});
test('HTML, wrong length, redirects, HTTP errors and network errors do not replace originals',async()=>{
 for(const response of [new Response('error',{status:404}),new Response('html',{headers:{'Content-Type':'text/html'}}),new Response('compressed',{headers:{'Content-Type':asset.mime,'Content-Encoding':'gzip'}}),new Response('wrong',{headers:{'Content-Type':asset.mime,'Content-Length':'1'}}),new Response(null,{headers:{'Content-Type':asset.mime}}),new Response(null,{status:302,headers:{Location:'https://other.invalid'}})]){
  const actual=await publishedPublicAsset(request(url),async()=>response);assert.equal(actual.status,502);assert.equal(actual.headers.get('Cache-Control'),'no-store');
 }
 assert.equal((await publishedPublicAsset(request(url),async()=>{throw Error('offline')})).status,502);
});
test('a truncated original remains a failed stream instead of becoming a successful image body',async()=>{
 const body=new ReadableStream({start(controller){controller.enqueue(new Uint8Array([1,2,3]));controller.error(Error('original stream interrupted'));}});
 const response=await publishedPublicAsset(request(url),async()=>new Response(body,{headers:{'Content-Type':asset.mime,'Content-Length':String(asset.bytes)}}));
 await assert.rejects(response.arrayBuffer(),/original stream interrupted/);
});
test('the header deadline cannot abort an accepted original while its body is streaming',async(t)=>{
 t.mock.timers.enable({apis:['setTimeout']});let signal;
 const response=await publishedPublicAsset(request(url),async(u,init)=>{signal=init.signal;return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':asset.mime}})});
 t.mock.timers.tick(31000);assert.equal(signal.aborted,false);
 assert.deepEqual(new Uint8Array(await response.arrayBuffer()),new Uint8Array([1,2,3]));
});
test('generic binary originals require the native raster signature and preserve every streamed byte',async()=>{
 const jpeg=manifest.assets.find(r=>r.delivery==='remote'&&r.mime==='image/jpeg');
 const bytes=new Uint8Array([255,216,255,235,0,1,2,3,4,5,6,7,8,9]);
 const response=await publishedPublicAsset(request(jpeg.path),async()=>new Response(bytes,{headers:{'Content-Type':'application/octet-stream'}}));
 assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/jpeg');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
 const bad=await publishedPublicAsset(request(jpeg.path),async()=>new Response('<html>error</html>',{headers:{'Content-Type':'application/octet-stream'}}));assert.equal(bad.status,502);
});
test('HEAD validates metadata with no response body and the private files are absent from the allowlist',async()=>{
 const response=await publishedPublicAsset(request(url,'HEAD'),async(u,init)=>{assert.equal(init.method,'HEAD');return new Response(null,{headers:{'Content-Type':asset.mime,'Content-Length':String(asset.bytes)}})});
 assert.equal(response.status,200);assert.equal(await response.text(),'');
 for(const row of require('../scripts/udtt-private-build-assets-manifest.json').files)assert(!manifest.assets.some(r=>r.path===row.path));
 const privateHashes=new Set(require('../scripts/udtt-private-build-assets-manifest.json').files.map(r=>r.sha256));assert(!manifest.assets.some(r=>privateHashes.has(r.sha256)));
});
