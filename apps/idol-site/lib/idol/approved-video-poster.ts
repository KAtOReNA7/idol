import posters from '../../data/saymyname-video-posters.json';
import nightPosters from '../../data/night-mv-video-posters.json';
import day19Posters from '../../data/day19-mv-video-posters.json';
import nextDay19Posters from '../../data/day19-next-mv-video-posters.json';
import unisKep1erPosters from '../../data/day19-unis-kep1er-video-posters.json';
import kconStagePhotos from '../../data/day19-kcon-stage-photos.json';
import udttPosters from '../../data/udtt-video-posters.json';
import vchaPosters from '../../data/vcha-video-posters.json';
import iznaPosters from '../../data/izna-video-posters.json';
import geeniusPosters from '../../data/geenius-video-posters.json';
import tracerPosters from '../../data/tracer-video-posters.json';

export type VideoPoster = {
 src:string;
 label:string;
 intrinsicSize?:{width:number;height:number};
};

// SAY MY NAME entries are publisher illustrations. These retained assets
// have separate, exact-video provenance and keep their own truthful labels.
const retainedVideoPosters=[
 {"workId": "recvxyOz5X93Kc", "videoId": "fCO7f0SmrDc", "view": "mv", "src": "/artist/idle/display/media-recvxyOz5X93Kc--media-recvxyOz5X93Kc.jpg","label":"官方 MV 视频封面"},
 {"workId": "recvxyOz5XuYef", "videoId": "Jh4QFaPmdss", "view": "mv", "src": "/artist/idle/display/media-recvxyOz5XuYef--media-recvxyOz5XuYef.jpg","label":"官方 MV 视频封面"},
 {"workId": "rec28ldfRTrCjG", "videoId": "2tda_TCjz8w", "view": "mv", "src": "/artist/triples/approved-design/mv-girls-never-die.jpg","label":"官方 MV 视频封面"},
 {workId:'recvxyOz5XdFJL',videoId:'ArmDp-zijuc',view:'mv',src:'/artist/newjeans/figma-display/media-recvxyOz5XdFJL-ec9a05cc78.jpg',label:'MV 预览图（Bugs 来源）'},
 {workId:'recvxyOz5XEvYC',videoId:'7HDeem-JaSY',view:'mv',src:'/artist/idle/display/media-recvxyOz5XEvYC--media-recvxyOz5XEvYC.jpg',label:'官方 MV 视频封面'},
 {workId:'recvxyOz5XYOoF',videoId:'_ZAgIHmHLdc',view:'mv',src:'/artist/newjeans/figma-display/media-recvxyOz5XYOoF-342d3e0f6c.jpg',label:'MV 预览图（Bugs 来源）'},
 {workId:'recvxyH5pzL7oj',videoId:'RknLOnO6ZtI',view:'mv',src:'/artist/billlie/display/billlie-recvxyH5pzL7oj-mv-RknLOnO6ZtI.jpg',label:'MV 预览图'},
 {workId:'recvxyOz5XJ7W3',videoId:'HM6UpQZvbhY',view:'mv',src:'/artist/fromis9/video-posters/recvxyOz5XJ7W3-mv-HM6UpQZvbhY-bugs-original.jpg',label:'MV 预览图（Bugs 来源）'},
 {workId:'recvxyOz5XKR8M',videoId:'0LiQp7y8Wwc',view:'mv',src:'/artist/fromis9/video-posters/recvxyOz5XKR8M-mv-0LiQp7y8Wwc-bugs-original.jpg',label:'MV 预览图（Bugs 来源）'},
] as const;
// Display-only: exact persistent work + active video + view must all agree.
// Stage support is bounded to explicitly reviewed tuples; the caller also rejects clips.
export function approvedVideoPoster(workId:string,videoId:string|null,view:'mv'|'stage'):VideoPoster|null{
 if(!videoId)return null;
 const tracer=tracerPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view);
 if(tracer)return tracer;
 const geenius=geeniusPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view);
 if(geenius)return geenius;
 const izna=iznaPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view);
 if(izna)return izna;
 const udtt=udttPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view);
 if(udtt)return udtt;
 const vcha=vchaPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view);
 if(vcha)return vcha;
 if(view==='stage')return unisKep1erPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??kconStagePhotos.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??null;
 return posters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??retainedVideoPosters.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??nightPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??day19Posters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??nextDay19Posters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??unisKep1erPosters.entries.find(item=>item.workId===workId&&item.videoId===videoId&&item.view===view)??null;
}
