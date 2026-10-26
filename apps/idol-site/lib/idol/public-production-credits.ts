import source from '@/data/public-production-credits.json';
import type {Work} from './types';
import {videoId} from './values';
export function publicProductionForWork(work:Work){
 if(work.placeholder)return null;
 return source.records.find(row=>row.workId===work.id&&work.groupIds.includes(row.groupId)&&videoId(work.url)===row.videoId)??null;
}
