import type {CatalogView} from './types';

// Client-side, read-only catalog requests. Never wrap save or mutation requests.
export const CATALOG_READ_TIMEOUT_MS=30000;
export async function catalogReadWithDeadline<T>(read:(signal:AbortSignal)=>Promise<T>,signal:AbortSignal,timeoutMs=CATALOG_READ_TIMEOUT_MS):Promise<T>{
 if(signal.aborted)throw new DOMException('Catalog read cancelled','AbortError');
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 let cancel:()=>void=()=>{};
 const stopped=new Promise<never>((_,reject)=>{
  cancel=()=>{reject(new DOMException('Catalog read cancelled','AbortError'));controller.abort();};
  signal.addEventListener('abort',cancel,{once:true});
  timer=setTimeout(()=>{reject(new Error('资料读取用时较长，请重新加载。'));controller.abort();},timeoutMs);
 });
 try{
  // Promise.race observes late rejection too; a transport ignoring abort cannot
  // keep the UI waiting or cause an unhandled rejection after cancellation.
  return await Promise.race([Promise.resolve().then(()=>{if(controller.signal.aborted)throw new DOMException('Catalog read cancelled','AbortError');return read(controller.signal);}),stopped]);
 }finally{
  clearTimeout(timer);
  signal.removeEventListener('abort',cancel);
 }
}

export function readArtistCatalog(artist: string, signal: AbortSignal): Promise<CatalogView> {
 return catalogReadWithDeadline(async requestSignal => {
  const query = new URLSearchParams({artist, shape: 'display-v1'});
  const response = await fetch('/api/catalog?' + query, {cache: 'no-store', signal: requestSignal});
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
   throw new Error('暂时没有连上你的资料库，请重试。');
  }
  const catalog = await response.json() as CatalogView | null;
  if (!catalog || !Array.isArray(catalog.groups) || !Array.isArray(catalog.members)
      || !Array.isArray(catalog.works) || !Array.isArray(catalog.ratings)) {
   throw new Error('资料暂时没有加载完整，请重试。');
  }
  return catalog;
 }, signal);
}
