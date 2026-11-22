import {Play} from 'lucide-react';
import {ReliableImage} from '@/components/reliable-image';
import {artistWorkScoreLabel, artistWorkUrl} from '@/lib/idol/artist-preview';
import {publicVideoCover} from '@/lib/idol/mv-public-media';
import type {Work} from '@/lib/idol/types';
import {videoId} from '@/lib/idol/values';
import './library.css';

export function LibraryFilm({work, returnTo, remember}: {work: Work; returnTo: string; remember: () => void}) {
  const title = work.song || work.name;
  const id = videoId(work.url);
  const cover = id ? publicVideoCover(id)?.src ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  const version = work.version || work.videoType || 'MV';
  return <article className="sr-work sr-library-film" data-work-id={work.id}>
    <a className="sr-library-film-link" href={artistWorkUrl(work, false, returnTo)} onClick={remember}
      data-member-work-trigger={`work-mv:${work.id}`}
      aria-label={`观看《${title}》${version}与评分`}>
      <div className="sr-film-art">
        <ReliableImage src={cover} alt={title+' · '+version+'封面'} identityKey={cover ?? work.id}
          missing={<span>{title}</span>} errorFallback={<span>{title}</span>}/>
        <span className="sr-play" aria-hidden="true"><Play size={16}/></span>
      </div>
      <div className="sr-work-copy">
        <h3>{title}</h3>
        <small>{version}{work.releaseDate && <> · <time dateTime={work.releaseDate}>{work.releaseDate}</time></>}</small>
      </div>
    </a>
    <div className="sr-library-record">
      <span>MV 评分 {artistWorkScoreLabel(work.score)}</span>
      {!!(work.stage || work.stageSupplement?.alternatives.length) &&
        <a href={artistWorkUrl(work, true, returnTo)} onClick={remember}
          data-member-work-trigger={`work-stage:${work.id}`}>舞台与其他现场 ↗</a>}
    </div>
  </article>;
}
