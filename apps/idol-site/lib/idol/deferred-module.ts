// Only executable UI modules are retained in memory. Never store catalog data,
// user records, or credentials here. Imports start exclusively from load().
export type DeferredModuleState<T> =
 | {phase:'idle'|'loading'|'error';value:null}
 | {phase:'ready';value:T};

export function createDeferredModule<T>(importModule:()=>Promise<T>,timeoutMs=30000){
 const initial:DeferredModuleState<T>={phase:'idle',value:null};
 let state:DeferredModuleState<T>=initial,attempt=0;
 const listeners=new Set<()=>void>();
 function publish(next:DeferredModuleState<T>){state=next;for(const listener of listeners)listener();}
 function load(){
  // A browser may retain a rejected native import in its module map. Calling
  // the same importer again is not a reliable recovery; use a guarded reload.
  if(state.phase!=='idle')return;
  const current=++attempt;
  publish({phase:'loading',value:null});
  const timeout=setTimeout(()=>{if(current===attempt&&state.phase==='loading'){attempt++;publish({phase:'error',value:null});}},timeoutMs);
  void Promise.resolve().then(importModule).then(value=>{
   clearTimeout(timeout);if(current===attempt)publish({phase:'ready',value});
  },()=>{
   clearTimeout(timeout);if(current===attempt)publish({phase:'error',value:null});
  });
 }
 return {
  load,
  getSnapshot:()=>state,
  // SSR always renders the same unloaded shell as the first client render.
  getServerSnapshot:()=>initial,
  subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},
 };
}
