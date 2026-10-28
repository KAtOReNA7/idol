import reference from '@/data/reviewed-native-recognition.json';
import {videoId} from './values';
import type {Photo,Work} from './types';

/** Public recognition reference only; the owner's native photo remains available. */
export function reviewedNativeRecognition(work:Pick<Work,'id'|'url'>,memberId:string,photo?:Photo|null){
 if(!photo||photo.table!=='ratings')return null;
 return reference.records.find(row=>row.workId===work.id&&row.videoId===videoId(work.url)&&row.memberId===memberId&&row.nativeRecordId===photo.recordId&&row.nativeIndex===photo.index)??null;
}
