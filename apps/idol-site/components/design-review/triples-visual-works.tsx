'use client';

import type {ComponentType, FormEvent, ReactNode} from 'react';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {resolvePublicArtistEntity, type PublicArtistCatalog} from '@/lib/idol/public-artist-bridge';
import {videoId} from '@/lib/idol/values';
import {triplesPublicTitle} from '@/lib/idol/triples-design-catalog';
import {
  filteredReviewMusic,
  reviewDimensionKey,
  reviewMusicFields,
  reviewMusicList,
  reviewVerifiedParticipants,
  triplesReviewDimensions,
  triplesReviewHref,
  triplesReviewReleases,
  triplesReviewStages,
  triplesReviewVideos,
  type ReviewFields,
  type ReviewMember,
  type ReviewMusic,
  type ReviewRoute,
} from '@/lib/idol/design-review/triples-visual-model';

type Format = ReviewRoute['format'];
const TYPES: Record<Format, string> = {release: '发行', mv: 'MV', stage: '舞台'};
const FORMATS: readonly Format[] = ['release', 'mv', 'stage'];

export type WorksLinkProps = {
  href: string | null;
  children: ReactNode;
  className?: string;
  'aria-current'?: 'page' | 'true';
  'data-release-key'?: string;
  'data-video-key'?: string;
};
export type WorksPictureProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  zoom?: boolean;
};
type SharedProps = {
  Link: ComponentType<WorksLinkProps>;
  Picture: ComponentType<WorksPictureProps>;
  Rail: ComponentType<{active: readonly number[]}>;
};
export type WorksViewProps = SharedProps & {
  route: ReviewRoute;
  members: readonly ReviewMember[];
  onFilter: (fields: ReviewFields) => void;
};
export type WorkDetailProps = SharedProps & {
  item: ReviewMusic;
  members: readonly ReviewMember[];
  catalog: PublicArtistCatalog | null;
  route?: ReviewRoute;
  onClose: () => void;
  onMediaAction: (item: ReviewMusic, action: 'play' | 'records') => void;
};

function formatDate(value: string | null) {
  return value?.replace(/-/g, '.') ?? '';
}
function itemFormat(item: ReviewMusic): Format {
  return item.kind === 'mv' ? 'mv' : item.kind === 'stage' ? 'stage' : 'release';
}
function unitFor(item: ReviewMusic) {
  const key = reviewDimensionKey(item);
  return triplesReviewDimensions.find(unit => unit.key === key);
}
function dateLabel(item: ReviewMusic) {
  if (item.kind === 'stage') return item.dateSemantics === 'broadcast_date' ? '播出' : '公开';
  if (item.kind === 'mv') return 'MV公开';
  return item.dateSemantics === 'official_japanese_release_date' ? '日本发行' : '发行';
}
/** Keep only canonical works-list fields. MV and stage never inherit a release participant filter. */
function listFields(route: ReviewRoute | undefined, format: Format, patch: ReviewFields = {}): ReviewFields {
  const fields: ReviewFields = {
    section: 'works',
    ...(format === 'release' ? {} : {format}),
    ...(route?.query ? {q: route.query} : {}),
    ...(route?.unit && triplesReviewDimensions.some(unit => unit.key === route.unit) ? {unit: route.unit} : {}),
    ...(route ? {sort: route.sort} : {}),
    ...(format === 'release' && route?.participant ? {participant: route.participant} : {}),
    ...patch,
  };
  if (!fields.q) delete fields.q;
  if (!fields.unit) delete fields.unit;
  if (format !== 'release') delete fields.participant;
  return fields;
}
function detailHref(item: ReviewMusic, route?: ReviewRoute) {
  return triplesReviewHref({...listFields(route, itemFormat(item)), ...reviewMusicFields(item)});
}
function PlayIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 4 9 6-9 6Z" /></svg>;
}
function MusicTile({item, route, Link, Picture}: Pick<WorksViewProps, 'route' | 'Link' | 'Picture'> & {item: ReviewMusic}) {
  const type = itemFormat(item);
  const unit = unitFor(item);
  const title = triplesPublicTitle(item);
  if (type === 'release') return (
    <Link className="release-tile" data-release-key={item.key} href={detailHref(item, route)}>
      <Picture src={item.localImage} className="cover" alt={`${title} 封面`} />
      <h3>{title}</h3>
      <div className="tile-meta">
        {item.date && <time dateTime={item.date}>{formatDate(item.date)}</time>}
        {unit && <span>{unit.name}</span>}
      </div>
    </Link>
  );
  return (
    <Link className="video-tile" data-video-key={item.key} href={detailHref(item, route)}>
      <div className="video-preview">
        <Picture src={item.localImage} className="video" alt={`${title}${type === 'stage' ? ' 舞台' : ' MV'} 预览`} />
        <span className="video-play"><PlayIcon /></span>
      </div>
      <h3>{title}</h3>
      <div className="tile-meta">
        <span>{type === 'stage' ? `${item.programme || '舞台'}${item.episode ? ` · ${item.episode}` : ''}` : 'MV'}</span>
        {item.date && <time dateTime={item.date}>{formatDate(item.date)}</time>}
      </div>
    </Link>
  );
}

export function WorksView({route, members, Link, Picture, Rail, onFilter}: WorksViewProps) {
  const type = route.format;
  const query = route.query;
  const selectedDimension = triplesReviewDimensions.find(unit => unit.key === route.unit);
  const selectedUnit = selectedDimension?.key ?? '';
  const selectedMember = type === 'release' ? members.find(member => member.id === route.participant) : undefined;
  const filtered = filteredReviewMusic(route);
  const counts: Record<Format, number> = {release: triplesReviewReleases.length, mv: triplesReviewVideos.length, stage: triplesReviewStages.length};
  const featured = type === 'release' && !query.trim() && !selectedUnit && !route.participant
    ? triplesReviewReleases.find(item => item.key === 'assemble24') : undefined;
  const featuredVideo = featured ? triplesReviewVideos.find(video => video.releaseKey === featured.key) : undefined;
  const featureParticipants = featured ? new Set(reviewVerifiedParticipants(featured)) : new Set<string>();
  const featureSequence = [...new Set(members.filter(member => featureParticipants.has(member.id)).map(member => member.sNumber))].sort((a, b) => a - b);
  const clearHref = triplesReviewHref({section: 'works', ...(type === 'release' ? {} : {format: type}), sort: route.sort});
  const activeFilters = [query.trim() ? `“${query.trim()}”` : '', selectedDimension?.name, selectedMember?.name].filter(Boolean);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const q = String(data.get('q') ?? '').slice(0, 200).trim();
    const candidateUnit = String(data.get('unit') ?? '');
    const unit = triplesReviewDimensions.some(row => row.key === candidateUnit) ? candidateUnit : '';
    const sort = data.get('sort') === 'oldest' ? 'oldest' : 'newest';
    onFilter(listFields(route, type, {q, unit, sort}));
  }

  return (
    <section className="works-page page-shell" id="works-content">
      <header className="page-head works-page-head">
        <div><h1>作品<span className="works-title-dot" aria-hidden="true">.</span></h1></div>
        <div className="works-totals" aria-label={`${counts.release}个发行，${counts.mv}支MV，${counts.stage}个舞台`}>
          <span><b>{counts.release}</b>发行</span><span><b>{counts.mv}</b>MV</span><span><b>{counts.stage}</b>舞台</span>
        </div>
      </header>
      <nav className="works-types" aria-label="作品类型">
        {FORMATS.map(format => <Link key={format} className={`works-type${format === type ? ' is-current' : ''}`} href={triplesReviewHref(listFields(route, format))} aria-current={format === type ? 'page' : undefined}>
          <span>{TYPES[format]}</span><span className="works-type-count">{counts[format]}</span>
        </Link>)}
      </nav>
      <div className="works-layout">
        <aside className="works-index">
          <p className="works-index-label">组合索引</p>
          <nav aria-label="按组合浏览作品">
            {[{key: '', name: '全部作品'}, ...triplesReviewDimensions].map(unit => {
              const active = unit.key === selectedUnit;
              const count = reviewMusicList(type).filter(item => !unit.key || reviewDimensionKey(item) === unit.key).length;
              return <Link key={unit.key} className={`works-unit-link${active ? ' is-current' : ''}`} href={triplesReviewHref(listFields(route, type, {unit: unit.key}))} aria-current={active ? 'true' : undefined}>
                <span>{unit.name}</span><span>{count}</span>
              </Link>;
            })}
          </nav>
          <Link className="works-members-link text-link" href={triplesReviewHref({section: 'members', rosterView: 'units'})}>认识成员与子团 ↗</Link>
        </aside>
        <div className="works-main">
          {featured && <section className="works-feature" aria-labelledby="works-feature-title">
            <Link className="works-feature-art" href={detailHref(featured, route)}>
              <Picture src={featured.localImage} className="works-feature-cover" alt={`${featured.title} 封面`} priority />
            </Link>
            <div className="works-feature-copy">
              <p className="works-kicker"><span>发行选集</span><span>{featured.date?.slice(0, 4)} / {reviewVerifiedParticipants(featured).length}</span></p>
              <h2 id="works-feature-title">{featured.title}</h2>
              <p className="works-feature-date">{formatDate(featured.date)}</p>
              <div className="works-feature-bottom">
                <p>{featuredVideo ? triplesPublicTitle(featuredVideo) : unitFor(featured)?.name ?? 'tripleS'}</p>
                <Link className="text-link" href={detailHref(featured, route)}>进入发行<span aria-hidden="true"> ↗</span></Link>
              </div>
              {!!featureSequence.length && <Rail active={featureSequence} />}
            </div>
          </section>}
          <section className="works-catalogue" aria-labelledby="works-catalogue-title">
            <header className="works-catalogue-head">
              <h2 id="works-catalogue-title">{selectedMember ? `${selectedMember.name} · ${TYPES[type]}` : selectedDimension?.name ?? TYPES[type]}<span className="works-result-count">{filtered.length}</span></h2>
              <form key={`${type}:${query}:${selectedUnit}:${route.sort}:${route.participant ?? ''}`} className="works-filter-form" data-filter-form role="search" aria-label="搜索作品" onSubmit={submitFilters}>
                <input type="hidden" name="section" value="works" />
                {type !== 'release' && <input type="hidden" name="format" value={type} />}
                {type === 'release' && route.participant && <input type="hidden" name="participant" value={route.participant} />}
                <label className="works-search"><span className="visually-hidden">搜索作品名称或组合</span><input name="q" type="search" defaultValue={query} maxLength={200} placeholder="搜索作品" autoComplete="off" /><span aria-hidden="true">⌕</span></label>
                <label className="works-unit-select"><span className="visually-hidden">组合</span><select name="unit" defaultValue={selectedUnit} onChange={event => event.currentTarget.form?.requestSubmit()}>
                  <option value="">全部组合</option>
                  {triplesReviewDimensions.map(unit => <option key={unit.key} value={unit.key}>{unit.name}</option>)}
                </select></label>
                <label className="works-sort"><span className="visually-hidden">排序</span><select name="sort" defaultValue={route.sort} onChange={event => event.currentTarget.form?.requestSubmit()}><option value="newest">从新到旧</option><option value="oldest">从早到晚</option></select></label>
                <button className="works-submit button" type="submit">搜索</button>
              </form>
            </header>
            {!!activeFilters.length && <div className="works-active-filters"><p>{activeFilters.join(' · ')}</p><Link className="text-link" href={clearHref}>清除筛选</Link></div>}
            {filtered.length ? <div className={type === 'release' ? 'release-grid works-catalogue-grid' : 'video-grid works-video-catalogue'}>
              {filtered.map(item => <MusicTile key={item.key} item={item} route={route} Link={Link} Picture={Picture} />)}
            </div> : <div className="works-empty"><span className="works-empty-mark" aria-hidden="true">∅</span><h3>没有符合条件的作品</h3><Link className="button" href={clearHref}>清除筛选</Link></div>}
          </section>
        </div>
      </div>
    </section>
  );
}

/** The public key, exact URL, source video, and runtime Work must all agree. */
function hasExactMediaBinding(item: ReviewMusic, catalog: PublicArtistCatalog | null) {
  if (item.kind !== 'mv' && item.kind !== 'stage') return false;
  const resolved = resolvePublicArtistEntity('triples', {kind: item.kind, key: item.key}, catalog);
  if (!resolved || resolved.kind !== item.kind || (resolved.kind !== 'mv' && resolved.kind !== 'stage')) return false;
  const sourceUrl = resolved.kind === 'stage' ? resolved.work.stage?.url : resolved.work.url;
  return !!item.officialUrl && sourceUrl === item.officialUrl && videoId(item.officialUrl) === resolved.videoId && resolved.sourceKey === resolved.videoId;
}

export function WorkDetail({item, members, catalog, route, Link, Picture, onClose, onMediaAction}: WorkDetailProps) {
  const type = itemFormat(item);
  const title = triplesPublicTitle(item);
  const release = type === 'release' ? item : triplesReviewReleases.find(row => row.key === item.releaseKey);
  const related = type === 'release' ? triplesReviewVideos.filter(video => video.releaseKey === item.key) : [];
  const participantIds = type === 'release' ? reviewVerifiedParticipants(item) : [];
  const roster = members.filter(member => participantIds.includes(member.id)).slice().sort((a, b) => a.sNumber - b.sNumber);
  const association = unitFor(item);
  const publisher = 'publisher' in item && typeof item.publisher === 'string' ? item.publisher : null;
  const officialHref = safeGroupLink(type === 'release' ? item.officialLandingUrl : item.officialUrl);
  const sourceHref = officialHref ?? safeGroupLink(item.sourceUrl);
  const watchLabel = officialHref ? type === 'release' ? '前往音乐平台' : `观看官方${type === 'mv' ? ' MV' : '舞台'}` : '查看来源';
  const mediaAvailable = hasExactMediaBinding(item, catalog);
  const mediaAction = (action: 'play' | 'records') => {
    if (hasExactMediaBinding(item, catalog)) onMediaAction(item, action);
  };

  return (
    <article className={`detail-page detail-page-${type}`} aria-labelledby="work-dialog-title">
      <header className="detail-topbar"><p>{TYPES[type]}</p><button type="button" className="detail-close button" onClick={onClose} aria-label="关闭作品详情，返回原筛选">返回作品 <span aria-hidden="true">×</span></button></header>
      <div className="detail-opening">
        <div className={`detail-art detail-art-${type}`}><Picture src={item.localImage} className="detail-main-image" alt={`${title}${type === 'release' ? ' 发行封面' : ` ${TYPES[type]}预览`}`} priority zoom /></div>
        <div className="detail-identity">
          <p className="works-kicker">{association?.name ?? 'tripleS'}</p>
          <h2 id="work-dialog-title">{title}</h2>
          <dl className="detail-facts">
            {item.date && <div><dt>{dateLabel(item)}</dt><dd>{formatDate(item.date)}</dd></div>}
            {association && <div><dt>组合</dt><dd><Link className="text-link" href={triplesReviewHref({section: 'members', rosterView: 'units', unit: association.key})}>{association.name}</Link></dd></div>}
            {item.programme && <div><dt>节目</dt><dd>{item.programme}{item.episode ? ` · 第${item.episode}期` : ''}</dd></div>}
            {publisher && type === 'stage' && <div><dt>发布</dt><dd>{publisher}</dd></div>}
          </dl>
          <div className="detail-actions">
            {sourceHref && <a className="button detail-primary-link" href={sourceHref} target="_blank" rel="noopener noreferrer">{watchLabel}<span aria-hidden="true"> ↗</span><span className="visually-hidden">（新窗口）</span></a>}
            {mediaAvailable && <div className="detail-record-actions"><button type="button" className="button" onClick={() => mediaAction('play')}>播放器</button><button type="button" className="button" onClick={() => mediaAction('records')}>个人记录</button></div>}
          </div>
        </div>
      </div>
      {type !== 'release' && release && <section className="detail-release-relation" aria-labelledby="detail-release-heading">
        <h3 id="detail-release-heading">所属发行</h3>
        <Link className="detail-related-release" href={detailHref(release, route)}><Picture src={release.localImage} className="detail-related-cover" alt={`${release.title} 封面`} /><span>{release.title}</span><span aria-hidden="true">↗</span></Link>
      </section>}
      {!!roster.length && <section className="detail-roster" aria-labelledby="detail-roster-heading">
        <header><h3 id="detail-roster-heading">发行参与成员</h3><span>{roster.length}</span></header>
        <div className="detail-roster-list">{roster.map(member => <Link key={member.id} href={triplesReviewHref({section: 'members', member: member.id})}><span className="detail-roster-s">S{member.sNumber}</span><span>{member.name}</span><span className="detail-roster-stage">{member.stageName}</span></Link>)}</div>
      </section>}
      {!!related.length && <section className="detail-related-videos" aria-labelledby="detail-related-videos-heading">
        <h3 id="detail-related-videos-heading">MV</h3>
        <div className="detail-video-list">{related.map(video => <Link key={video.key} className="detail-video-link" href={detailHref(video, route)}><Picture src={video.localImage} className="detail-related-preview" alt={`${triplesPublicTitle(video)} MV预览`} /><div><span className="detail-video-kind">MV</span><h4>{triplesPublicTitle(video)}</h4>{video.date && <p>{formatDate(video.date)}</p>}</div><span aria-hidden="true">↗</span></Link>)}</div>
      </section>}
    </article>
  );
}
