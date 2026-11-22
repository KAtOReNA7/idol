import type {ReactNode} from 'react';
import {artistWorkUrl} from '@/lib/idol/artist-preview';
import type {Work} from '@/lib/idol/types';

type Binding = {
  work: Work;
  stage: boolean;
  scoreBindingValid: boolean;
  score: number | null | undefined;
};

export function artistFilmAction(binding: Binding | null, returnTo: string | null,
  source: string, hasRecord: boolean, catalog: {loading: boolean; error: string}) {
  const href = binding && returnTo ? artistWorkUrl(binding.work, binding.stage, returnTo) : null;
  const pending = !href && hasRecord && (catalog.loading || Boolean(catalog.error));
  const label = href ? '站内观看与评分' : pending ? '站内观看入口' : '在 YouTube 观看原片';
  let status = '此版本暂无站内播放或评分。';
  if (href && binding) {
    const score = binding.scoreBindingValid ? binding.score?.toFixed(1) ?? '未评分' : '此版本暂无可显示的评分';
    status = (binding.stage ? '舞台评分：' : '影像评分：') + score;
  } else if (pending) {
    status = catalog.loading ? '正在读取站内观看与评分入口…' : '暂时无法读取站内观看与评分入口。';
  }
  return {href, source, pending, label, status};
}

type FilmAction = Pick<ReturnType<typeof artistFilmAction>,'href'|'source'|'pending'|'label'>;

export function ArtistFilmPrimary({action, className, remember, children}: {
  action: FilmAction; className: string; remember: () => void; children?: ReactNode;
}) {
  const content = children ?? action.label;
  if (action.pending) return <div className={className} data-film-primary="pending">{content}</div>;
  if (action.href) return <a data-film-primary="onsite" className={className} href={action.href}
    onClick={remember} aria-label={action.label}>{content}</a>;
  return <a data-film-primary="source" className={className} href={action.source} target="_blank"
    rel="noopener noreferrer" aria-label={action.label}>{content}</a>;
}

export function ArtistFilmSource({action, className, publisher}: {
  action: FilmAction; className?: string; publisher?: string;
}) {
  if (!action.href && !action.pending) return publisher ? <span>视频发布者 · {publisher}</span> : null;
  return <a className={className} href={action.source} target="_blank" rel="noopener noreferrer">
    {publisher ? publisher+' · ' : ''}YouTube 原片出处 ↗
  </a>;
}

export function EditorialVideoActions({href, source, sources, stage, waiting, failed, retry, remember, buttonClass, sourcesClass}: {
  href: string | null; source: string; sources: {url: string; label: string}[]; stage: boolean;
  waiting: boolean; failed: boolean; retry: () => void; remember: () => void; buttonClass: string; sourcesClass: string;
}) {
  const pending = !href && (waiting || failed);
  const label = href ? (stage ? '观看舞台与评分' : '观看 MV 与评分') : '在 YouTube 观看原片';
  const action = {href, source, pending, label};
  const credits = sources.filter(item => item.url !== source);
  return <>
    {pending ? <div role={failed ? 'alert' : 'status'}>
      {failed ? <>站内观看入口暂时无法加载。 <button className={buttonClass} onClick={retry}>重试</button></> : '正在读取站内观看入口…'}
    </div> : <>
      {!href && <p>此版本暂无站内播放或评分。</p>}
      <ArtistFilmPrimary action={action} className={buttonClass} remember={remember}/>
    </>}
    {(href || pending || credits.length > 0) && <details className={sourcesClass}><summary>资料与图片来源</summary>
      <ArtistFilmSource action={action}/>
      {credits.map(({url,label}) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}
    </details>}
  </>;
}
