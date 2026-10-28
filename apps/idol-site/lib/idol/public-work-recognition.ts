import source from '@/data/public-work-recognition.json';
import {publicCreditForWork} from './public-work-credits';
import {videoId} from './values';
import type {Work} from './types';

/** Recognition belongs to verified public credits, never to inferred rating rows. */
export function publicWorkRecognition(work:Work){
 const credit=publicCreditForWork(work);
 if(!credit)return [];
 const row=source.records.find(row=>row.workId===work.id&&work.groupIds.includes(row.groupId)&&row.videoId===videoId(work.url));
 return row?.portraits.filter(p=>credit.memberIds.includes(p.memberId))??[];
}
