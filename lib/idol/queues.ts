import type {Work,Group} from './types';
export function inQueue(work:Work,key:string,groups:Group[]){const gs=groups.filter(g=>work.groupIds.includes(g.id));if(key==='unrated')return work.watched==='已观看'&&work.score===null;if(key==='high')return work.score===null&&work.watched!=='已观看'&&!!work.url&&gs.some(g=>g.ratedCount>=2&&(g.average??0)>=9);if(key==='surprise')return work.score!==null&&work.score>=9&&!!work.url&&gs.some(g=>g.ratedCount>=2&&work.score!-(g.average??0)>=1);if(key==='tonight')return work.score===null&&work.watched!=='已观看'&&!!work.url;if(key==='rewatch')return work.score!==null&&work.score>=9;return true;}

export const queueLabels:Record<string,string>={all:'全部作品',tonight:'待看',unrated:'看过待评分',rewatch:'高分重温',high:'高分团补看',surprise:'团内惊喜'};
