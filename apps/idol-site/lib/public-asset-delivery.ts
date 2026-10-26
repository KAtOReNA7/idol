import manifest from '../data/production-asset-delivery.json';

type Fetcher=(url:string,init:RequestInit&{cf?:{cacheEverything:boolean;cacheTtlByStatus:Record<string,number>}})=>Promise<Response>;
const encoded=(value:string)=>value.split('/').map(encodeURIComponent).join('/');
const remote=new Map(manifest.assets.filter(row=>row.delivery==='remote').map(row=>[encoded(row.path),row]));
const safeBase=/^https:\/\/raw\.githubusercontent\.com\/KAtOReNA7\/idol\/[a-f0-9]{40}\/apps\/idol-site\/public$/;
if(!safeBase.test(manifest.baseUrl))throw Error('Invalid immutable original source');
function rasterHeader(bytes:Uint8Array,mime:string){
 if(mime==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(mime==='image/png')return [137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
 if(mime==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 return false;
}

/** Only exact public originals. Private APIs and unknown paths use the app handler. */
export async function publishedPublicAsset(request:Request,fetcher:Fetcher=fetch):Promise<Response|null>{
 if(request.method!=='GET'&&request.method!=='HEAD')return null;
 const url=new URL(request.url),asset=remote.get(url.pathname);
 if(!asset)return null;
 let upstream:Response;
 const controller=new AbortController();
 const headerTimeout=setTimeout(()=>controller.abort(),30000);
 try{
  // Never forward identity, cookies, query strings, origin or application headers.
  upstream=await fetcher(manifest.baseUrl+encoded(asset.path),{method:request.method,redirect:'manual',headers:{'Accept':asset.mime,'Accept-Encoding':'identity'},cf:{cacheEverything:true,cacheTtlByStatus:{'200':31536000,'400-599':0}},signal:controller.signal});
 }catch{return new Response('Original temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}});}
 finally{clearTimeout(headerTimeout);}
 // Once headers arrive, keep streaming for slow clients and large originals.
 // A header deadline must not silently truncate an otherwise valid image body.
 const length=upstream.headers.get('Content-Length');
 const encoding=upstream.headers.get('Content-Encoding');
 const contentType=upstream.headers.get('Content-Type')?.split(';')[0],genericBinary=contentType==='application/octet-stream';
 if(upstream.status!==200||(contentType!==asset.mime&&!genericBinary)||(length!==null&&Number(length)!==asset.bytes)||(encoding!==null&&encoding!=='identity')||(request.method==='GET'&&!upstream.body)){
  await upstream.body?.cancel();
  return new Response('Original temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}});
 }
 let body=upstream.body;
 if(genericBinary&&request.method==='GET'){
  // GitHub returns octet-stream for some genuine JPEG originals. Validate the
  // native raster signature and replay the exact prefix, never transcode it.
  const reader=body!.getReader(),chunks:Uint8Array[]=[];let size=0;
  try{while(size<12){const part=await reader.read();if(part.done)break;chunks.push(part.value);size+=part.value.length;}}catch{await reader.cancel().catch(()=>{});return new Response('Original temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}});}
  const prefix=new Uint8Array(size);let offset=0;for(const chunk of chunks){prefix.set(chunk,offset);offset+=chunk.length;}
  if(!rasterHeader(prefix,asset.mime)){await reader.cancel();return new Response('Original temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}});}
  body=new ReadableStream<Uint8Array<ArrayBuffer>>({start(controller){controller.enqueue(prefix);},async pull(controller){try{const part=await reader.read();if(part.done)controller.close();else controller.enqueue(part.value);}catch(error){controller.error(error);}},cancel(reason){return reader.cancel(reason);}});
 }
 const headers=new Headers({'Content-Type':asset.mime,'Content-Length':String(asset.bytes),'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff','X-Idol-Original-Ref':manifest.publicRef,'X-Idol-Expected-Sha256':asset.sha256});
 // Stream the publisher bytes; large originals do not accumulate in Worker memory.
 return new Response(request.method==='HEAD'?null:body,{status:200,headers});
}
