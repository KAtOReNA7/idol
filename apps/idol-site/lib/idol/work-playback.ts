import sources from '../../data/verified-work-players.json';
import type {StageVideo} from './types';
import {stageSourceKey,stageSourceMatchesUrl} from './stage-source';

type PublicPlayer = {original:string;rutube:string;uploader:string};
const byWork:Readonly<Record<string,PublicPlayer>>=sources;

// A public player represents the same complete edit; the canonical ID continues to bind scores.
export function workPlayback(workId:string,videoId:string|null,view:'mv'|'stage',stage:StageVideo|null){
 const player=Object.hasOwn(byWork,workId)?byWork[workId]:undefined;
 if(!player||player.original!==videoId)return null;
 if(view==='stage'&&(!stage?.reusesOriginalVideo||stageSourceKey(stage)!==videoId||!stageSourceMatchesUrl(stage)))return null;
 return {
  embedUrl:`https://rutube.ru/play/embed/${player.rutube}?autostartmute=true&q=1080`,
  credit:`RUTUBE · ${player.uploader} 转载`
 };
}
