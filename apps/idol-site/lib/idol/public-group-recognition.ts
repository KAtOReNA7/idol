import source from '@/data/public-group-recognition.json';
import {publicCreditForWork} from './public-work-credits';
import {videoId} from './values';
import type {Work} from './types';

/** A separate, read-only group reference. It is never a work credit or rating relation. */
export function publicGroupRecognitionForWork(work:Work){
 if(work.placeholder||publicCreditForWork(work))return null;
 const target=source.works.find(row=>row.workId===work.id&&row.videoId===videoId(work.url)&&work.groupIds.includes(row.groupId));
 if(!target||target.scope!=='group_generic_recognition'||target.participationStatus!=='unverified_for_work')return null;
 return source.groups.find(group=>group.groupId===target.groupId)??null;
}
