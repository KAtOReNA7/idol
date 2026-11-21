import previewIds from '../../data/runtime/stage-video-previews.json';

const previews=new Set(previewIds);

/** Derived from the uploader thumbnail of a specific, uncut video. */
export function stageVideoPreview(id){
 return previews.has(id)?`/artist/stage-video-previews/${id}.webp`:null;
}
