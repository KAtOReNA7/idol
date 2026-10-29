import type {StageResearchNote} from './types';

// Plain external links only; no proxying, fetching, embedding or score binding.
export function safePublicStageUrl(value:unknown):value is string {
 if(typeof value!=='string'||value.length>2000)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname.includes('.')&&!/^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(u.hostname)&&!u.hostname.startsWith('[')&&!/^\d+(?:\.\d+){3}$/.test(u.hostname)&&!u.hostname.endsWith('.localhost')&&!u.hostname.endsWith('.local')&&!u.hostname.endsWith('.internal');}catch{return false;}
}

export function validStageResearchNote(value:unknown):value is StageResearchNote {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const note=value as Record<string,unknown>;
 if(Object.keys(note).some(key=>!['summary','sources'].includes(key))||typeof note.summary!=='string'||!note.summary.trim()||note.summary.length>1200||!Array.isArray(note.sources)||!note.sources.length||note.sources.length>5)return false;
 return note.sources.every(source=>{
  if(!source||typeof source!=='object'||Array.isArray(source))return false;
  return Object.keys(source).every(key=>key==='label'||key==='url')&&typeof source.label==='string'&&!!source.label.trim()&&source.label.length<=160&&safePublicStageUrl(source.url);
 });
}
