import sources from '../../data/verified-work-players.json';
import type {StageVideo} from './types';
import {stageSourceKey,stageSourceMatchesUrl} from './stage-source';

export type PlaybackSource = {label:string;embedUrl:string;credit:string};

type PublicPlayer = {
 original:string;rutube?:string;uploader?:string;
 vimeo?:{id:string;publisher:string};
 okVideo?:{id:string;uploader:string};
 officialPost?:{id:string;publisher:string;verifiedHeight:number};
};
const byWork:Readonly<Record<string,PublicPlayer>>=sources;

// A public player represents the same complete edit; the canonical ID continues to bind scores.
export function workPlayback(workId:string,videoId:string|null,view:'mv'|'stage',stage:StageVideo|null):PlaybackSource|null{
 const player=Object.hasOwn(byWork,workId)?byWork[workId]:undefined;
 if(!player||player.original!==videoId)return null;
 if(view==='stage'&&(!stage?.reusesOriginalVideo||stageSourceKey(stage)!==videoId||!stageSourceMatchesUrl(stage)))return null;
 if(player.officialPost&&view==='mv'){
  const {id,publisher,verifiedHeight}=player.officialPost;
  return {
   label:'官方 X',
   embedUrl:'https://platform.twitter.com/embed/Tweet.html?dnt=true&embedId=twitter-widget-0&frame=false&hideCard=false&hideThread=false&id='+id+'&lang=zh-cn&theme=dark&width=550px',
   credit:publisher+' 官方 X · 站内实测 '+verifiedHeight+'p'
  };
 }
 if(player.okVideo)return {
  label:'OK Video',
  embedUrl:`https://ok.ru/videoembed/${player.okVideo.id}?autoplay=1&silent=1`,
  credit:`OK Video · ${player.okVideo.uploader} 转载`
 };
 if(player.vimeo)return {
  label:'Vimeo',
  embedUrl:`https://player.vimeo.com/video/${player.vimeo.id}?autoplay=1&muted=1&dnt=1&playsinline=1&quality=4k`,
  credit:`Vimeo · ${player.vimeo.publisher}`
 };
 if(!player.rutube||!player.uploader)return null;
 return {
  label:'RUTUBE',
  embedUrl:`https://rutube.ru/play/embed/${player.rutube}?autostartmute=true&q=1080`,
  credit:`RUTUBE · ${player.uploader} 转载`
 };
}
