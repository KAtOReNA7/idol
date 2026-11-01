'use client';
import {MemberWorkIdentityPhoto} from '@/components/member-work-identity-photo';

import {MvPhotoReference} from '@/components/mv-photo-reference';
import {useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';
import {ArtistTimelineHost, useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {MemberPublicCredits} from '@/components/public-work-credits';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ReliableImage, ImageRecoveryProvider, ImageRecoveryControls} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import {memberDisplayName, memberChineseName} from '@/lib/idol/member-display-name';
import {historicalRosterMembers, memberAffiliationLabel} from '@/lib/idol/member-affiliation';
import {artistCollection, artistMemberUrl, artistRoute, artistRouteUrl, artistWorkRows, artistWorkScoreLabel, artistWorkUrl, type ArtistSection} from '@/lib/idol/artist-preview';
import {safeArtistReturn} from '@/lib/idol/artist-navigation';
import {memberWorks, memberWorkSummary} from '@/lib/idol/member-works';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {loonaHistoricalPortraits, loonaImageDimensions} from '@/lib/idol/loona-curation';
import {loonaHomeAsset, loonaHomePortrait, loonaHomeUnits, loonaHomeReleases} from '@/lib/idol/loona-home';
import LoonaHome from '@/components/candidate/loona-home';
import type {CatalogView, Member, Photo, Work} from '@/lib/idol/types';
import type {CandidateContent} from '@/lib/idol/candidate/types';

const PATH = '/artists/loona';
const sections: [ArtistSection, string][] = [['overview', '首页'], ['members', '历史成员'], ['works', '作品库'], ['updates', '时间轴'], ['records', '我的记录']];
const queues = [['all', '全部作品'], ['tonight', '待看'], ['rewatch', '高分重温'], ['unrated', '看过待评分']];
const number = (value: number | null) => value === null ? '未评分' : value.toFixed(1);
const media = (photo: Photo) => `/api/media?table=${photo.table}&record=${photo.recordId}&index=${photo.index}`;
const name = (member: Member) => memberChineseName(member) || memberDisplayName(member);
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener('artist-location-change', listener);
  return () => {window.removeEventListener('popstate', listener); window.removeEventListener('artist-location-change', listener);};
}
// Preserve the exact allowed source query, including an absent versus explicit history scope.
export function loonaReturnUrl(url: string) {
  const parsed = new URL(url, 'https://site.invalid');
  const original = parsed.pathname + parsed.search;
  return safeArtistReturn(original) ? original : artistRouteUrl(artistRoute(url), PATH);
}
function Link({href, children, className, external = false, focusKey}: {href?: string | null; children: ReactNode; className?: string; external?: boolean; focusKey?: string}) {
  const safe = external ? safeGroupLink(href ?? undefined) : href;
  return safe ? <a href={safe} className={className} data-member-work-trigger={focusKey} {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>{children}</a> : <span className={className}>{children}</span>;
}
function Picture({src, alt, identityKey, priority = false, width, height}: {src?: string | null; alt: string; identityKey: string; priority?: boolean; width?: number; height?: number}) {
  const ratio = width && height && width > 0 && height > 0 ? `${width} / ${height}` : undefined;
  return <ReliableImage src={src} identityKey={identityKey} alt={alt} priority={priority} width={width} height={height}
    style={{objectFit: 'contain', ...(ratio ? {aspectRatio: ratio, width: '100%', height: 'auto'} : {})}}
    fallbackStyle={ratio ? {aspectRatio: ratio, width: '100%', minHeight: 0} : undefined} referrerPolicy="no-referrer"
    missing={<span className="ln-image-message">照片暂缺</span>} errorFallback={<span className="ln-image-message">图片暂时无法加载</span>}/>;
}
const workArt: Record<string, {file: string; cover?: boolean}> = {
  recvxyOz5XueI9: {file: 'luminous.png', cover: true}, recvxyOz5XKztg: {file: 'flip-that.jpg'},
  recvxyOz5XEgYP: {file: 'hula-hoop.png', cover: true}, recvxyOz5X4k6N: {file: 'ptt-album.jpg', cover: true},
  recvxyOz5XLBUV: {file: 'star.jpg'}, recvxyOz5XL5xq: {file: 'why-not.jpg'},
  recvxyOz5X09bu: {file: 'so-what-album.jpg', cover: true}, recvxyOz5X7G95: {file: 'butterfly.jpg'},
  recvxyOz5X7Pt4: {file: 'hi-high.jpg'}, recvxyOz5XKqG0: {file: 'favorite.jpg'},
};
function WorkEntry({work, returnTo}: {work: Work; returnTo: string}) {
  const art = workArt[work.id];
  return <article className="ln-inner-work" data-work-id={work.id}>
    {art && <Link className={`ln-inner-work-art${art.cover ? ' is-cover' : ''}`} href={artistWorkUrl(work, false, returnTo)} focusKey={`work-art:${work.id}`}><Picture src={loonaHomeAsset(art.file)} alt={`${work.song || work.name} · ${art.cover ? '发行封面' : 'MV 预览'}`} identityKey={`inner-work:${work.id}`}/>{art.cover && <span><strong>关联发行</strong><small>发行封面</small></span>}</Link>}
    {!art?.cover && art && <small>MV 预览</small>}
    <h3><Link focusKey={`work-title:${work.id}`} href={artistWorkUrl(work, false, returnTo)}>{work.song || work.name}</Link></h3><p>{work.version}</p>
    {work.releaseDate && <p>作品日期 <time dateTime={work.releaseDate}>{work.releaseDate}</time></p>}
    <p className="ln-inner-record">我的 MV 分 <b>{artistWorkScoreLabel(work.score)}</b> · <span>{work.watched === '已观看' ? '已看' : work.watched === '未观看' ? '未看' : '未标记'}</span></p>
    <Link className="ln-inner-action" focusKey={`work-mv:${work.id}`} href={artistWorkUrl(work, false, returnTo)}>查看作品 →</Link>
    {!!(work.stage || work.stageSupplement?.alternatives.length) && <Link className="ln-inner-action" focusKey={`work-stage:${work.id}`} href={artistWorkUrl(work, true, returnTo)}>看舞台 →</Link>}
  </article>;
}

export default function LoonaDesign({content}: {content: CandidateContent}) {
  const options = useArtistTimelineHostOptions();
  const [fetchedState, setState] = useState<{data: CatalogView | null; error: string; loading: boolean}>({data: null, error: '', loading: true});
  const state = options.catalog !== undefined ? {data: options.catalog, error: options.error ?? '', loading: options.loading ?? false} : fetchedState;
  const [unitFilter, setUnitFilter] = useState('all');
  const [libraryTab, setLibraryTab] = useState('works');
  const [lightbox, setLightbox] = useState<{src: string; label: string} | null>(null);
  const url = useSyncExternalStore(subscribe, () => window.location.href, () => options.serverRoute ?? PATH);
  const route = useMemo(() => artistRoute(url), [url]);
  const returnTo = loonaReturnUrl(url);
  const rememberScroll = useArtistScroll(!!state.data, url);
  const previousMember = useRef<string | null>(null);
  useLayoutEffect(() => {
    const departed = previousMember.current;
    previousMember.current = route.member;
    if (!state.data || route.member) return;
    const saved = window.history.state?.artistRosterFocus;
    const exactKey = saved?.path === window.location.pathname + window.location.search && typeof saved.key === 'string' && saved.key.startsWith('loona:') ? saved.key : null;
    if (!departed && !exactKey) return;
    const frame = requestAnimationFrame(() => {
      const exact = exactKey ? [...document.querySelectorAll<HTMLElement>('[data-loona-member-trigger]')].find(node => node.dataset.loonaMemberTrigger === exactKey && node.getClientRects().length) : null;
      const target = exact ?? [...document.querySelectorAll<HTMLElement>('[data-artist-member-trigger]')].find(node => node.dataset.artistMemberTrigger === departed && node.getClientRects().length);
      target?.focus({preventScroll: true});
      if (!window.history.state?.artistScroll) target?.scrollIntoView({block: 'nearest'});
    });
    return () => cancelAnimationFrame(frame);
  }, [state.data, route.member, url]);
  useEffect(() => {
    if (options.catalog !== undefined) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await catalogReadWithDeadline(async signal => {
          const response = await fetch('/api/catalog?artist=loona&shape=display-v1', {cache: 'no-store', signal});
          if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('暂时没有连上你的资料库。');
          const result = await response.json() as CatalogView;
          if (!result || !Array.isArray(result.groups) || !Array.isArray(result.members) || !Array.isArray(result.works) || !Array.isArray(result.ratings)) throw new Error('资料暂时没有加载完整。');
          return result;
        }, controller.signal);
        if (!controller.signal.aborted) setState({data, error: '', loading: false});
      } catch (error) {
        if (!controller.signal.aborted) setState({data: null, error: error instanceof Error ? error.message : '资料暂时无法读取。', loading: false});
      }
    }
    void load();
    return () => controller.abort();
  }, [options.catalog]);

  const collection = useMemo(() => state.data ? artistCollection(state.data, content.groupId) : null, [state.data, content.groupId]);
  // This historical reading scope matches the index without changing current associations.
  const roster = useMemo(() => historicalRosterMembers(state.data?.members ?? [], content.groupId, true), [state.data, content.groupId]);
  const works = collection?.works ?? [];
  const member = roster.find(item => item.id === route.member);
  const portrait = (m: Member) => candidatePortrait(m, {...content.portraits, ...loonaHistoricalPortraits});
  const rows = artistWorkRows(works, route.queue, route.search).filter(work => route.format === 'stage' ? !!(work.stage || work.stageSupplement?.alternatives.length) : route.format === 'mv' ? !!work.url : true);
  function navigate(patch: Partial<ReturnType<typeof artistRoute>>, replace = false, target = 'artist-content', memberFocusKey?: string) {
    rememberScroll();
    if (memberFocusKey) window.history.replaceState({...window.history.state, artistRosterFocus: {path: window.location.pathname + window.location.search, key: memberFocusKey}}, '', window.location.href);
    window.history[replace ? 'replaceState' : 'pushState'](newArtistHistoryState(window.history.state), '', artistRouteUrl({...route, ...patch}, PATH));
    window.dispatchEvent(new Event('artist-location-change'));
    if (!replace) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({block: 'start'}));
  }
  const unitLabel = (m: Member) => loonaHomeUnits.find(unit => unit.members.includes(m.id))?.title ?? 'SOLO';
  const visibleRoster = roster.filter(m => unitFilter === 'all' || (unitFilter === 'solo' ? m.id === 'recvxyICzHj5HJ' : loonaHomeUnits.find(unit => unit.key === unitFilter)?.members.includes(m.id)));
  const people = <section className="ln-inner-directory" id="loona-people"><h1>十二位成员</h1><p className="ln-inner-muted">{roster.length} 位成员 · 按公开顺序</p>
    <div className="ln-inner-filter"><button aria-pressed={unitFilter === 'all'} onClick={() => setUnitFilter('all')}>全部 {roster.length} 人</button><button aria-pressed={unitFilter === 'solo'} onClick={() => setUnitFilter('solo')}>SOLO · 林汝真</button></div>
    <div className="ln-inner-units">{loonaHomeUnits.map(unit => <button key={unit.key} aria-pressed={unitFilter === unit.key} onClick={() => setUnitFilter(unit.key)}><img src={loonaHomeAsset(`logo-unit-${unit.key}.png`)} alt={unit.title}/><span>{unit.key === '13' ? '1/3' : unit.key === 'oec' ? 'OEC' : 'yyxy'}</span></button>)}</div>
    <div className="ln-inner-roster">{visibleRoster.map(m => <button key={m.id} className="ln-inner-person" data-artist-member-trigger={m.id} data-loona-member-trigger={`loona:index:${m.id}`} onClick={() => navigate({member: m.id}, false, 'artist-content', `loona:index:${m.id}`)}><div className="ln-inner-portrait"><Picture src={loonaHomePortrait(m) ?? portrait(m)?.image} alt={memberDisplayName(m)} identityKey={`directory:${m.id}`}/></div><strong>{name(m)}</strong><span>{m.stageName}</span><small>{String(roster.indexOf(m) + 1).padStart(2, '0')} · {unitLabel(m)}</small></button>)}</div>
    {!visibleRoster.length && <p>尚无关联的成员记录。</p>}</section>;
  const timeline = <section className="ln-timeline-wrap"><div className="timeline-intro"><h1>大事时间轴</h1><p>最早优先 · 只读</p></div><ArtistTimelineHost groupId={content.groupId} catalog={state.data} loading={state.loading} error={state.error} onRetry={options.onRetry}/></section>;
  function library(filtered: boolean) {
    const releases = loonaHomeReleases(works);
    const displayRows = (filtered ? rows : works).filter(work => libraryTab !== 'stage' || !!(work.stage || work.stageSupplement?.alternatives.length));
    return <section className="catalog ln-inner-library"><h1>{route.section === 'records' ? '我的观看记录' : '作品库'}</h1><p className="ln-inner-muted">MUSIC / VIDEO / STAGE</p><p className="ln-inner-lede">从一首作品，进入 LOONA 的音乐与舞台。</p>
    {filtered && <div className="ln-tools"><input aria-label="搜索本团作品" placeholder="搜索作品名称" value={route.search} onChange={event => navigate({search: event.target.value}, true)}/><div>{queues.map(([key, title]) => <button key={key} aria-pressed={route.queue === key} onClick={() => navigate({queue: key})}>{title}</button>)}</div><div aria-label="播放内容">{([['all', '全部'], ['mv', 'MV'], ['stage', '可看舞台']] as const).map(([key, title]) => <button key={key} aria-pressed={route.format === key} onClick={() => navigate({format: key})}>{title}</button>)}</div></div>}
    <div className="ln-inner-tabs">{[['works', `作品 ${works.length}`], ['releases', '关联发行'], ['stage', '舞台']].map(([key, title]) => <button key={key} aria-pressed={libraryTab === key} onClick={() => {setLibraryTab(key); requestAnimationFrame(() => document.getElementById(key === 'releases' ? 'loona-inner-releases' : 'loona-inner-works')?.scrollIntoView({block: 'start'}));}}>{title}</button>)}</div>
    <h2 id="loona-inner-works">{libraryTab === 'stage' ? '舞台' : '全部作品'}</h2><p className="ln-inner-muted">{displayRows.length} 支作品</p><div className="ln-inner-work-grid">{displayRows.map(work => <WorkEntry key={work.id} work={work} returnTo={returnTo}/>)}</div>
    {!displayRows.length && <p>没有符合条件的作品。<button onClick={() => {setLibraryTab('works'); navigate({queue: 'all', search: '', format: 'all'});}}>查看全部</button></p>}
    <section id="loona-inner-releases"><h2>关联发行</h2><div className="ln-inner-release-grid">{releases.map(entry => <article key={entry.releaseKey}><Link href={entry.work ? artistWorkUrl(entry.work, false, returnTo) : undefined}><Picture src={loonaHomeAsset(entry.file)} identityKey={`library-release:${entry.releaseKey}`} alt={`${entry.title} 发行封面`}/><h3>{entry.title}</h3><p>{entry.song}</p><time dateTime={entry.date}>{entry.date}</time></Link></article>)}</div></section>
    </section>;}
  function memberPage(m: Member) {
    if (!state.data) return null;
    const existingPortrait = portrait(m), selectedPortrait = loonaHomePortrait(m) ? {...existingPortrait, image: loonaHomePortrait(m)!} : existingPortrait, items = memberWorks(state.data, m.id), summary = memberWorkSummary(items);
    return <section className="detail"><button className="back" onClick={() => navigate({member: null}, false, ['overview', 'members'].includes(route.section) ? 'loona-people' : 'artist-content')}>← 返回{route.section === 'works' ? '作品库' : route.section === 'updates' ? '时间轴' : route.section === 'records' ? '我的记录' : '历史名册'}</button>
      <div className="member-layout" data-member-layout="ordered-v1" data-member-id={m.id} data-member-module="identity"><figure className="member-photo"><button disabled={!selectedPortrait} aria-label={`放大${memberDisplayName(m)}的资料照`} aria-haspopup="dialog" onClick={() => selectedPortrait && setLightbox({src: selectedPortrait.image, label: memberDisplayName(m)})}><Picture src={selectedPortrait?.image} {...(loonaHomePortrait(m) ? {width: 800, height: 1200} : loonaImageDimensions(selectedPortrait?.image))} alt={memberDisplayName(m)} identityKey={'member:' + m.id} priority/></button><figcaption>{selectedPortrait?.credit}<br/><Link href={selectedPortrait?.sourceUrl} external>图片来源 ↗</Link></figcaption></figure>
        <div className="member-copy"><p className="eyebrow">{String(roster.indexOf(m) + 1).padStart(2, '0')} / {roster.length}</p><h1 className="member-display-name">{name(m)}</h1><p className="member-stage">{m.stageName}</p><p className="ln-inner-unit-label">{unitLabel(m)}</p><p>LOONA</p><button className="ln-inner-action is-primary" disabled={!selectedPortrait} onClick={() => selectedPortrait && setLightbox({src: selectedPortrait.image, label: memberDisplayName(m)})}>查看完整照片</button><button className="ln-inner-action" onClick={() => document.getElementById('loona-member-works')?.scrollIntoView({block: 'start'})}>选择作品后评分</button><section className="ln-inner-facts" data-member-module="basic"><h2 className="member-profile-heading">个人资料</h2><p className="bio">LOONA 历史成员<br/>{memberAffiliationLabel(m, content.groupId)}</p><MemberPhysicalFacts member={m}/><MemberCareerFacts member={m} part="intro"/>
          {(m.country || m.birthDate) && <p>{[m.country, m.birthDate].filter(Boolean).join(' · ')}</p>}{m.role && <p>{m.role}</p>}
          <p>{summary.ratedWorks} 支作品已评</p>
          <div className="links"><Link className="link-button" focusKey={`member-profile:${m.id}`} href={artistMemberUrl(m.id, returnTo)}>个人档案与记录 ↗</Link><button className="link-button" onClick={() => navigate({section: 'works', member: null})}>LOONA 作品库 ↗</button></div></section></div></div>
<div className="ln-scores" data-member-module="scores"><div><small>作品综合分</small><strong>{number(summary.composite)}</strong></div><div><small>表现均分</small><strong>{number(summary.performanceMean)}</strong></div><div><small>造型均分</small><strong>{number(summary.stylingMean)}</strong></div></div>

      <section className="ln-looks-section" id="loona-member-works"><div className="section-heading"><h2>LOONA 作品</h2></div><div className="ln-looks" data-member-module="works">{items.map(item => <article key={item.work.id}>
        <MemberWorkIdentityPhoto work={item.work} memberId={m.id} label={memberDisplayName(m)+' · '+item.work.song} photo={item.photo} live={state.data?.mode==='live'} className={'ln-look-photo'+(item.photo?.sourceKind==='mv_look_photo'?' mv-look-native':'')} onOpen={setLightbox} maxHeight={460} fallback={workArt[item.work.id] && <Link className="ln-inner-member-cover" href={artistWorkUrl(item.work, false, returnTo)}><Picture src={loonaHomeAsset(item.work.id === 'recvxyOz5X7G95' ? 'butterfly-album.jpg' : workArt[item.work.id].file)} alt={`${item.work.song} ${workArt[item.work.id].cover || item.work.id === 'recvxyOz5X7G95' ? '发行封面' : 'MV 预览'}`} identityKey={`member-work:${m.id}:${item.work.id}`}/></Link>}/><MvPhotoReference photo={item.photo} referencePhoto={item.referencePhoto} label={memberDisplayName(m)+' · '+item.work.song} live={state.data?.mode==='live'}/><a data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work, false, returnTo)}><h3>{item.work.song || item.work.name} ↗</h3><p>表现 {number(item.performance)} · 造型 {number(item.styling)}</p></a>
        {!!(item.work.stage || item.work.stageSupplement?.alternatives.length) && <Link focusKey={item.work.id + ':stage'} href={artistWorkUrl(item.work, true, returnTo)}>看舞台 ↗</Link>}
      </article>)}</div>{!items.length && <p>这位成员尚无已关联的作品记录。</p>}</section>
      <div className="member-switch"><h2>继续浏览成员</h2><div className="ln-inner-adjacent">{[-1, 1].map(offset => {const adjacent = roster[(roster.indexOf(m) + offset + roster.length) % roster.length]; return adjacent && <button key={offset} onClick={() => navigate({member: adjacent.id})}><Picture src={loonaHomePortrait(adjacent) ?? portrait(adjacent)?.image} alt={name(adjacent)} identityKey={`adjacent:${adjacent.id}`}/><span><small>{offset < 0 ? '← 上一位' : '下一位 →'}</small><strong>{name(adjacent)}</strong></span></button>;})}</div></div>
{state.data&&<MemberPublicCredits memberId={m.id} data={state.data} renderLink={(work,label)=><a href={artistWorkUrl(work,false,returnTo)}>{label}</a>}/>}
<MemberCareerFacts member={m} part="history"/>
<MemberCareerFacts member={m} part="sources"/>

</section>;
  }
  const isHome = route.section === 'overview' && !route.member;
  return <ImageRecoveryProvider><div className={`loona-history${isHome ? ' ln-approved-home' : ' ln-approved-inner'}`}>
    {isHome ? <header className="ln-home-header"><Link href="/?view=groups" className="ln-home-brand">STAGE</Link><nav aria-label="首页分区"><button onClick={() => document.getElementById('loona-releases')?.scrollIntoView({block: 'start'})}>作品</button><button onClick={() => document.getElementById('loona-people')?.scrollIntoView({block: 'start'})}>成员</button><button onClick={() => document.getElementById('loona-units')?.scrollIntoView({block: 'start'})}>分队</button><button className="ln-home-timeline-nav" onClick={() => navigate({section: 'updates', member: null})}>时间轴</button></nav></header> : <header className="ln-inner-header"><div className="ln-inner-brandrow"><button className="ln-inner-logo" aria-label="LOONA 首页" onClick={() => navigate({section: 'overview', member: null})}><img src={loonaHomeAsset('logo-loona.png')} alt="LOONA"/></button><span>{member ? name(member) : sections.find(([key]) => key === route.section)?.[1]}</span><button className="ln-inner-action" onClick={() => navigate({section: route.member ? 'members' : 'overview', member: null})}>返回</button></div><nav aria-label="团体内容">{([['members', '成员'], ['works', '作品'], ['updates', '时间轴']] as const).map(([key, title]) => <button key={key} aria-current={route.section === key && !member ? 'page' : undefined} onClick={() => navigate({section: key, member: null})}>{title}</button>)}</nav></header>}
    <main id="artist-content">
      {state.loading ? <div className="ln-empty" role="status">正在打开 LOONA 档案…<p><a href="">重新加载当前页</a></p></div>
        : state.error ? <div className="ln-empty" role="alert"><p>{state.error}</p><button onClick={() => options.onRetry ? options.onRetry() : window.location.reload()}>重新加载</button></div>
          : !collection ? <div className="ln-empty">暂未找到团体资料。<Link href="/?view=groups">返回团体索引</Link></div>
            : route.member ? member ? memberPage(member) : <div className="ln-empty">这个成员不在本团档案中。<button onClick={() => navigate({section: 'members', member: null})}>查看历史成员</button></div>
              : <>
                {route.section === 'overview' && <LoonaHome roster={roster} works={works} returnTo={returnTo} portrait={portrait} navigate={navigate} homeMember={(m, location) => navigate({member: m.id}, false, 'artist-content', `loona:${location}:${m.id}`)} setLightbox={setLightbox}/>}
                {route.section === 'members' && people}
                {route.section === 'updates' && timeline}
                {(route.section === 'works' || route.section === 'records') && library(true)}
              </>}
    </main>{isHome ? <footer className="ln-home-footer"><p>LOONA / 本月少女</p><p>音乐作品 · 历史成员 · 三支分队</p><span>STAGE · 私人观看与评分手帐 · 公开可读，只有本人可编辑</span></footer> : <footer><strong>LOOΠΔ</strong><Link href="/?view=groups">返回团体索引 ↗</Link><span>STAGE · 私人观看与评分手帐 · 公开可读，只有本人可编辑</span></footer>}
    {lightbox && <PhotoLightbox {...lightbox} onClose={() => setLightbox(null)}/>}
  </div><ImageRecoveryControls/></ImageRecoveryProvider>;
}
