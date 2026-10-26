import 'server-only';
import {snapshotByteLength,snapshotGzipBase64,snapshotSha256} from '@/data/snapshot-fallback.generated';
import type {Tables} from './catalog';

type FallbackSnapshot={tables:Tables;capturedAt:string};
let pending:Promise<FallbackSnapshot>|null=null;

// This entire module is imported only inside catalog's !configured() branch.
// Keep the successful object shared, matching the former JSON module import.
export function loadFallbackSnapshot():Promise<FallbackSnapshot>{
 if(!pending){
  pending=(async()=>{
   const binary=atob(snapshotGzipBase64);
   const compressed=Uint8Array.from(binary,character=>character.charCodeAt(0));
   const bytes=await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
   if(bytes.byteLength!==snapshotByteLength||hash!==snapshotSha256)throw new Error('Fallback snapshot integrity check failed');
   return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)) as FallbackSnapshot;
  })().catch(error=>{pending=null;throw error;});
 }
 return pending;
}
