'use client';
import {publicVideoCover} from '@/lib/idol/mv-public-covers';

import type {ComponentProps, CSSProperties, ReactNode} from 'react';
import type {Photo, Work} from '../lib/idol/types';
import {videoId} from '../lib/idol/values';
import {katseyeVideoArt} from '../lib/idol/katseye-editorial';
import {approvedStagePoster,approvedVideoPoster,stagePreviewFallback,workReferencePoster,type VideoPoster} from '../lib/idol/approved-video-poster';
import {ReliableImage} from './reliable-image';

type ImageStateListener = ComponentProps<typeof ReliableImage>['onStateChange'];

/** Image pixels only. The owning App retains links, captions, scores and Editor. */
export function CatalogPhotoImage({photo,live=true,label,identityKey,priority=false,fit,fallback,missing,retryable=true,onStateChange}:{
  photo:Photo|null; live?:boolean; label:string; identityKey?:string; priority?:boolean;
  fit?:CSSProperties['objectFit']; fallback?:ReactNode; missing?:ReactNode;
  retryable?:boolean; onStateChange?:ImageStateListener;
}) {
  const src=photo&&live?`/api/media?table=${photo.table}&record=${photo.recordId}&index=${photo.index}`:null;
  const image=<ReliableImage src={src} identityKey={identityKey??`${photo?.table??'missing'}:${photo?.recordId??''}:${photo?.index??''}:${live}:${label}`}
    alt={label} priority={priority} style={fit?{objectFit:fit}:undefined} fallback={fallback} missing={missing}
    retryMode={retryable?'external':'none'} onStateChange={onStateChange}/>;
  // Server projection supplies focus only after exact candidate ID + byte hash approval.
  const f=photo?.sourceKind==='mv_look_photo'?photo.displayFocus:null;
  const focused=f?.sourceWidth===700&&f.sourceHeight===612&&f.sourceCrop.x===350&&f.sourceCrop.y===0&&f.sourceCrop.width===350&&f.sourceCrop.height===612&&f.preserveOriginal===true;
  return focused&&src?<span className="mv-reviewed-focus" data-photo-focus="right-half">{image}</span>:image;
}

/** Reviewed local display image for the exact work, video and view, never a substitute video. */
export function katseyeVideoPoster(workId:string,activeVideoId:string|null,view:'mv'|'stage'):VideoPoster|null {
  if(!activeVideoId)return null;
  const art=katseyeVideoArt[workId]?.[view];
  return art?.id===activeVideoId?{src:art.image,label:view==='mv'?'MV 来源影像':'舞台来源影像'}:null;
}

export function WorkCoverImage({work,label,fallback,onStateChange}:{
  work:Pick<Work,'id'|'url'|'song'|'name'>; label?:string; fallback?:ReactNode; onStateChange?:ImageStateListener;
}) {
  const id=videoId(work.url),poster=approvedVideoPoster(work.id,id,'mv')??katseyeVideoPoster(work.id,id,'mv');
  return <ReliableImage src={poster?.src??(id?(publicVideoCover(id)?.src??`https://i.ytimg.com/vi/${id}/hqdefault.jpg`):null)}
    identityKey={`work:${work.id}:video-cover`} alt={poster?`${work.song||work.name} · ${poster.label}`:label??`${work.song||work.name} 官方视频封面`} style={poster?{objectFit:poster.fit??'contain',maxWidth:poster.intrinsicSize?.width,maxHeight:poster.intrinsicSize?.height}:undefined}
    loading="lazy" referrerPolicy="no-referrer" fallback={fallback} onStateChange={onStateChange}/>;
}

/** Card art follows the same exact source and work-reference rules as the player. */
export function ArtistWorkPreview({work,stage=false}:{work:Work;stage?:boolean}) {
 const title=work.song||work.name;
 if(!stage)return work.url?<span className="artist-work-preview"><WorkCoverImage work={work}/></span>:null;
 const source=work.stage;
 const photo=source
  ?(!source.clip&&(source.platform??'youtube')==='youtube'&&videoId(source.url)===source.videoId?katseyeVideoPoster(work.id,source.videoId,'stage'):null)??approvedStagePoster(work.id,source)??stagePreviewFallback(work,source,true)
  :work.stageSupplement?.alternatives.length?workReferencePoster(work):null;
 if(!photo)return <span>{title} · 舞台预览暂缺</span>;
 return <span className="artist-work-preview">
  <ReliableImage src={photo.src} alt={`${title} · ${photo.label}`} identityKey={`stage:${work.id}:${photo.src}`} loading="lazy"/>
  {photo.workReference&&<small className="work-preview-label">{photo.label}</small>}
 </span>;
}

export function ConceptPhotoImage({src,memberId,label}:{src:string|null|undefined;memberId:string;label:string}) {
  return <ReliableImage src={src} identityKey={`member:${memberId}:concept:${label}`} alt={label} priority/>;
}
