import {ArrowUpRight, Play} from 'lucide-react';
import {artistWorkScoreLabel, artistWorkUrl} from '@/lib/idol/artist-preview';
import {stageKindLabel} from '@/lib/idol/stage-display';
import {stageEmbedUrl, stageHasValidBinding} from '@/lib/idol/stage-source';
import type {Work} from '@/lib/idol/types';
import {ArtistWorkPreview} from './app-image-presentation';
import './artist-stage-directory-card.css';

export function ArtistStageDirectoryCard({work, returnTo, className}: {
  work: Work;
  returnTo: string;
  className: string;
}) {
  const title = work.song || work.name;
  const source = work.stage;
  const canRate = stageHasValidBinding(source);
  const hasRelatedWork = !!work.url && !source?.reusesOriginalVideo;
  const externalBili = source?.platform === 'bilibili' && !stageEmbedUrl(source);
  const action = externalBili ? '查看舞台记录' : canRate ? '观看舞台与评分' : source ? '观看舞台' : '查看其他现场';

  return <article className={className} data-artist-stage-card="" data-work-id={work.id}>
    <a className="stage-directory-primary" href={artistWorkUrl(work, true, returnTo)}
      data-member-work-trigger={`work-stage:${work.id}`}>
      <div className="stage-directory-image"><ArtistWorkPreview work={work} stage/></div>
      <div className="stage-directory-copy">
        <span className="stage-directory-kind">{source ? stageKindLabel(source.kind) : '其他现场'}</span>
        <h3>{title}</h3>
        {source && <>
          <p className="stage-directory-source">{source.title}</p>
          <p className="stage-directory-credit">{source.channel}{source.channel && source.publishedDate && ' · '}
            {source.publishedDate && <time dateTime={source.publishedDate}>{source.publishedDate}</time>}</p>
          {source.reusesOriginalVideo && <p>与原作品为同一支表演视频。</p>}
          {externalBili && <p>此舞台暂无站内高清片源。</p>}
        </>}
        {canRate
          ? <p className="stage-directory-score">我的整体舞台分 <b>{artistWorkScoreLabel(work.stageScore)}{work.stageScore !== null && ' / 10'}</b></p>
          : <p>{source ? '这版舞台暂时无法评分。' : '仅供观看'}</p>}
        <span className="stage-directory-action"><Play size={14} aria-hidden="true"/>{action}</span>
      </div>
    </a>
    {hasRelatedWork && <a className="stage-directory-related" href={artistWorkUrl(work, false, returnTo)}
      data-member-work-trigger={`work-mv:${work.id}`} aria-label={`观看《${title}》${/MV/i.test(work.videoType) ? 'MV' : '原作品'}`}>
      {/MV/i.test(work.videoType) ? 'MV' : '原作品'} <ArrowUpRight size={14} aria-hidden="true"/>
    </a>}
  </article>;
}
