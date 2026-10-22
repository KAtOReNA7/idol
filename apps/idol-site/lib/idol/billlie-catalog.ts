import type {Work} from './types';
import {inQueue} from './queues';
export type BilllieRelease={id:string;title:string;kind:string;date:string};
/** Queues retain native work-record semantics: no independent stage watched field exists. */
export function billlieCatalog<T extends BilllieRelease>(releases:T[],works:Work[],format:string,query:string,queue:string){
 const q=query.trim().toLocaleLowerCase();
 const matchedReleases=releases.filter(r=>r.title.toLocaleLowerCase().includes(q));
 const videos=works.filter(w=>!w.placeholder&&inQueue(w,queue,[]));
 const text=(w:Work)=>`${w.song} ${w.name} ${w.version} ${w.videoType} ${w.officialTitle}`.toLocaleLowerCase();
 const mv=videos.filter(w=>!!w.url&&text(w).includes(q));
 const stage=videos.filter(w=>!!w.stage?.url&&`${text(w)} ${w.stage.title.toLocaleLowerCase()}`.includes(q));
 const shown={releases:format==='all'||format==='release'?matchedReleases:[],mv:format==='all'||format==='mv'?mv:[],stage:format==='all'||format==='stage'?stage:[]};
 return {...shown,total:shown.releases.length+shown.mv.length+shown.stage.length};
}
