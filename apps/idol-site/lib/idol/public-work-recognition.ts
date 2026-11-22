import source from '@/data/public-work-recognition.json';
import imported from '@/data/imported-work-credits-and-portraits.json';
import editions from '@/data/public-recognition-editions.json';
import {createRecognitionSelector} from './recognition-edition-lookup';
import {publicCreditForWork} from './public-work-credits';
import {videoId} from './values';
import type {Work} from './types';

const records = [...source.records, ...imported.recognition];
export const publicRecognitionEdition = createRecognitionSelector(editions);

/** Recognition belongs to verified public credits, never to inferred rating rows. */
export function publicWorkRecognition(work:Work){
 const credit=publicCreditForWork(work);
 if(!credit)return [];
 const row=records.find(row=>row.workId===work.id&&work.groupIds.includes(row.groupId)&&row.videoId===videoId(work.url));
 return row?.portraits.filter(p=>credit.memberIds.includes(p.memberId))??[];
}
