import {publicMvPortrait} from './mv-public-media';

// Existing named, exact-MV portraits: historical evidence, not current promo art.
const visuals:Record<string,{groupId:string;workId:string;videoId:string;title:string}>={
 'recvxyICzHyM9P':{groupId:'recvxyEBDZOpTf',workId:'recvxyOz5Xv1vV',videoId:'3GWscde8rM8',title:'O.O · 2022'},
 'recvxyICzHeqSw':{groupId:'recvxyEBDZvpPh',workId:'recvxyOz5XwAaP',videoId:'4vbDFu0PUew',title:'FEARLESS · 2022'},
};
export function historicalMemberVisual(memberId:string,groupId:string){
 const row=visuals[memberId];
 if(!row||row.groupId!==groupId)return null;
 const work={id:row.workId,url:`https://www.youtube.com/watch?v=${row.videoId}`};
 return publicMvPortrait(work,memberId)?{work,title:row.title}:null;
}
