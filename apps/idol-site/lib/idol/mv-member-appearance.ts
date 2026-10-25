import evidence from '../../data/mv-member-appearance.json';
import {videoId} from './values';
import type {Work} from './types';

/** Missing pictures/relationships never imply that the members do not appear. */
export function mvMemberAbsence(work:Pick<Work,'id'|'url'>){
 const id=videoId(work.url);
 return id?evidence.entries.find(row=>row.workId===work.id&&row.videoId===id&&row.status==='confirmed-no-members')??null:null;
}
