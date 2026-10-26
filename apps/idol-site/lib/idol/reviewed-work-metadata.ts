import type {Work} from './types';
import dates from '@/data/public-video-date-evidence.json';
import {videoId} from './values';

// Owner chose the original score's exact MV on 2026-10-25. This repairs only
// the known empty display metadata; raw source rows and personal values stay intact.
export function applyReviewedWorkMetadata<T extends Work>(work:T):T{
 if(work.id==='rec28ldfRTrEng'&&work.groupIds.length===1&&work.groupIds[0]==='rec28ldfRTiD0h'&&work.song==='HURRICANE'&&!work.url.trim())return {...work,url:'https://www.youtube.com/watch?v=00tUzCOPI6g',videoType:'MV',version:'Music Video',officialTitle:"BADVILLAIN - 'HURRICANE' MV",channel:'BPM Entertainment',releaseDate:work.releaseDate||'2024-07-10'};
 if(work.placeholder||work.releaseDate)return work;
 const date=dates.changes.find(row=>row.id===work.id&&work.groupIds.includes(row.groupId)&&videoId(work.url)===row.videoId);
 return date?{...work,releaseDate:date.proposedDate}:work;
}
