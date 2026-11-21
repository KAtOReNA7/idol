import sources from '../../data/verified-work-players.json';
import type {StageVideo} from './types';
import {stageSourceKey,stageSourceMatchesUrl,youtubeEmbedUrl} from './stage-source';

export type PlaybackSource = {label:string;embedUrl:string;credit:string};

type PublicPlayer = {original:string;rutube:string;uploader:string};
const byWork:Readonly<Record<string,PublicPlayer>>=sources;

const bilibiliByOriginal:Readonly<Record<string,PlaybackSource>>={
 Gz_yRl6703c:{
  label:'B站',
  embedUrl:'https://player.bilibili.com/player.html?bvid=BV1TGNWeDEdv&cid=28248899991&p=1&autoplay=1&muted=1&danmaku=0',
  credit:'B站 · pcyxjy 转载'
 },
 'Vk5-c_v4gMU':{
  label:'B站官方',
  embedUrl:'https://player.bilibili.com/player.html?bvid=BV12r421t7nu&cid=1480859605&p=1&autoplay=1&muted=1&danmaku=0',
  credit:'B站 · ILLIT 官方账号'
 },
};

// A public player represents the same complete edit; the canonical ID continues to bind scores.
export function workPlayback(workId:string,videoId:string|null,view:'mv'|'stage',stage:StageVideo|null){
 const player=Object.hasOwn(byWork,workId)?byWork[workId]:undefined;
 if(!player||player.original!==videoId)return null;
 if(view==='stage'&&(!stage?.reusesOriginalVideo||stageSourceKey(stage)!==videoId||!stageSourceMatchesUrl(stage)))return null;
 const mirror:PlaybackSource={
  label:'RUTUBE 高清',
  embedUrl:`https://rutube.ru/play/embed/${player.rutube}?autostartmute=true&q=1080`,
  credit:`RUTUBE · ${player.uploader} 转载`
 };
 const originalEmbed=youtubeEmbedUrl(player.original);
 if(!originalEmbed)return null;
 const original:PlaybackSource={label:'YouTube 原版',embedUrl:originalEmbed,credit:'YouTube · 原版视频'};
 const bilibili=bilibiliByOriginal[player.original];
 return bilibili?{...bilibili,fallbackPlayers:[mirror,original]}:{...mirror,fallbackPlayers:[original]};
}
