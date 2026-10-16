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
