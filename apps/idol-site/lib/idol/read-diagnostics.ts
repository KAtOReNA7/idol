// Timing-only diagnostics. Never log response bodies, notes, URLs or credentials.
export function readTrace(route:'media'|'records',table:string,recordId:string){
 const start=Date.now();let previous=start;const stages:Record<string,number>={};
 return{mark(stage:string){const now=Date.now();stages[stage]=Math.max(0,now-previous);previous=now;},finish(status:number,errorCode?:string){const elapsedMs=Math.max(0,Date.now()-start);if(elapsedMs<3000&&!errorCode)return;console.warn(JSON.stringify({event:'idol_read_timing',route,table:/^(groups|members|works|ratings)$/.test(table)?table:'invalid',recordId:/^rec[A-Za-z0-9]{1,64}$/.test(recordId)?recordId:'invalid',status,elapsedMs,stages,...(errorCode?{errorCode:/^[A-Za-z0-9_-]{1,80}$/.test(errorCode)?errorCode:'UNKNOWN'}:{})}));}};
}
