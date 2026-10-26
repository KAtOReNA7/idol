/** @param {Record<string, any>} catalogs
 * @param {string} origin
 * @param {{viewer?:any,nativePortrait?:string|null,readAsset?:typeof fetch|null}} options */
export function createReviewFetch(catalogs,origin,{viewer=null,nativePortrait=null,readAsset=null}={}){
 return async function(input,init={}){
  const request=typeof Request!=='undefined'&&input instanceof Request?input:null;
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  if((init.method??request?.method??'GET').toUpperCase()!=='GET')return json({error:'REVIEW_READ_ONLY'},405);
  let url;try{url=new URL(request?.url??String(input),origin);}catch{return json({error:'INVALID_REQUEST'},400);}
  if(url.origin!==origin)return json({error:'EXTERNAL_API_DISABLED'},403);
  if(url.pathname==='/api/catalog'){
   const p=url.searchParams;
   if([...p.keys()].some(k=>!['artist','shape'].includes(k))||p.getAll('artist').length>1||p.getAll('shape').length!==1||p.get('shape')!=='display-v1')return json({error:'INVALID_SCOPE'},400);
   const key=p.get('artist')??'all';
   return Object.hasOwn(catalogs,key)?json(catalogs[key]):json({error:'UNKNOWN_ARTIST'},404);
  }
  if(viewer&&url.pathname==='/api/editorial-assets/viewer'&&!url.search)return json(viewer);
  if(nativePortrait&&readAsset&&url.pathname+url.search==='/api/media?table=members&record=recvxAPQCF66Sl&index=0'){
   const response=await readAsset(nativePortrait,{signal:init.signal??request?.signal});
   if(!response.ok)return json({error:'PORTRAIT_UNAVAILABLE'},503);
   const result=new Response(await response.arrayBuffer(),{headers:{'Content-Type':'image/jpeg'}});
   Object.defineProperty(result,'url',{value:url.href});return result;
  }
  return json({error:'REVIEW_ENDPOINT_UNAVAILABLE'},404);
 };
}
