'use client';
import {ArtistInformation} from '@/components/artist-information';

import {useEffect, useMemo, useState, useSyncExternalStore, type ReactNode} from 'react';
import {UnisNativeText, UnisNativeColourDots, UnisNativeSurface, UnisNativeScreenContext, UnisNativeTimelineAxis, type UnisNativeScreen} from './unis-native-artwork';
import {ArtistTimelineHost, useArtistTimelineHostOptions} from '@/components/artist-timeline-host';
import {MemberCareerFacts} from '@/components/member-career-facts';
import {MemberPhysicalFacts} from '@/components/member-physical-facts';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ImageRecoveryControls, ImageRecoveryProvider, ReliableImage} from '@/components/reliable-image';
import {useArtistScroll} from '@/components/use-artist-scroll';
import {artistCollection, artistMemberUrl, artistWorkRows, artistWorkScoreLabel, artistWorkUrl} from '@/lib/idol/artist-preview';
import {candidatePortrait} from '@/lib/idol/candidate/portrait';
import type {CandidateContent} from '@/lib/idol/candidate/types';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {safeGroupLink} from '@/lib/idol/group-detail';
import {memberChineseName, memberDisplayName} from '@/lib/idol/member-display-name';
import {memberWorks} from '@/lib/idol/member-works';
import {newArtistHistoryState} from '@/lib/idol/timeline/history-state';
import type {CatalogView, Member, Work} from '@/lib/idol/types';
import {getUNISEditorialRelease, type UNISEditorialRelease} from '@/lib/idol/unis-editorial';
import {orderUNISMembers, UNIS_FEATURED_RELEASE, UNIS_FEATURED_WORK, UNIS_PATH, unisDisplayReleases, unisHasStage, unisReleaseDate, unisReleaseFromUrl, unisReleaseWorks, unisRouteUrl, unisWorkRelease, unisReleaseCover, unisReleaseCoverDetails} from '@/lib/idol/design-review/unis-presentation';

import {reviewArtistRoute as artistRoute, productionReturn} from '@/lib/idol/design-review/artist-route';

const navigation = [['members', '成员'], ['works', '发行与影像'], ['updates', '时间轴']] as const;
const queues = [['all', '全部作品'], ['tonight', '待看'], ['rewatch', '高分重温'], ['unrated', '看过待评分']] as const;

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener('artist-location-change', listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('artist-location-change', listener);
  };
}

function Picture({src, alt, priority = false, identityKey}: {src?: string | null; alt: string; priority?: boolean; identityKey?: string}) {
  return <ReliableImage src={src} alt={alt} identityKey={identityKey ?? src ?? alt} priority={priority}
    missing={<span className="uf-image-state">图片暂缺</span>}
    errorFallback={<span className="uf-image-state">图片暂时无法加载</span>}/>;
}

function External({href, children, className = 'uf-button uf-pale'}: {href?: string | null; children: ReactNode; className?: string}) {
  const safe = safeGroupLink(href ?? undefined);
  return safe ? <a className={className} href={safe} target="_blank" rel="noopener noreferrer">{children}</a> : null;
}

function Title({en, children, level = 1}: {en: 'MEMBERS' | 'MUSIC / VIDEO' | 'TIMELINE'; children: ReactNode; level?: 1 | 2}) {
  const Tag = level === 1 ? 'h1' : 'h2';
  const role = level === 2 ? 'homeMembers' : en === 'MEMBERS' ? 'membersTitle' : en === 'MUSIC / VIDEO' ? 'libraryTitle' : 'timelineTitle';
  return <div className="uf-title uf-native-host"><UnisNativeSurface slot="title-rule" className="uf-native-rule"/><Tag><UnisNativeText role={role} label={en}/></Tag><p>{children}</p></div>;
}

function ReleaseImage({release, priority = false}: {release: UNISEditorialRelease; priority?: boolean}) {
  const cover = unisReleaseCover(release), details = unisReleaseCoverDetails(release);
  return <span className={`uf-square${details?.previewOnly ? ' uf-preview-cover' : ''}`} data-image-role="release-cover" data-cover-release-key={release.releaseKey} data-cover-quality={details?.previewOnly ? '200px-preview' : 'source-rendition'}>
    {cover ? <Picture src={cover.image} alt={`${release.title} · 发行封面${details?.editionLabel ? ` · ${details.editionLabel}` : ''}`} priority={priority}/>
      : <span className="uf-music-placeholder" role="img" aria-label={`${release.title} 发行封面暂缺`}>♪</span>}
  </span>;
}

function WorkRow({work, returnTo, format = 'all', index = 0}: {work: Work; returnTo: string; format?: string; index?: number}) {
  const release = unisWorkRelease(work);
  const hasMV = !!safeGroupLink(work.url);
  const hasStage = unisHasStage(work);
  return <article className="uf-work-row" data-work-id={work.id}>
    <div className="uf-work-art uf-native-host" data-image-role="release-cover">
      {release ? <ReleaseImage release={release}/> : <span className="uf-music-placeholder uf-native-host" role="img" aria-label="发行封面暂缺"><UnisNativeSurface slot="work-art-placeholder"/>♪</span>}
    </div>
    <div className="uf-work-copy">
      <h3><a data-member-work-trigger={work.id} href={artistWorkUrl(work, format === 'stage', returnTo)}>{work.song || work.name}</a></h3>
      <p>{work.videoType || 'MV'}{release && unisReleaseCover(release) && <span> · 发行封面</span>}</p>
      <p className="uf-work-score">我的 {format === 'stage' ? '舞台' : 'MV'} 分 <b>{artistWorkScoreLabel(format === 'stage' ? work.stageScore : work.score)}</b></p>
    </div>
    <div className="uf-work-actions">
      {format !== 'stage' && hasMV && <a className="uf-button uf-primary uf-native-host" href={artistWorkUrl(work, false, returnTo)}><UnisNativeSurface slot={`work-${index}-mv`}/><span className="uf-desktop-label">观看 MV</span><span className="uf-mobile-label">MV ↗</span></a>}
      {format !== 'mv' && hasStage && <a className="uf-button uf-pale uf-native-host" href={artistWorkUrl(work, true, returnTo)}><UnisNativeSurface slot={`work-${index}-stage`}/><span className="uf-desktop-label">观看舞台</span><span className="uf-mobile-label">舞台 ↗</span></a>}
      {!hasMV && !hasStage && <a className="uf-button uf-pale" href={artistWorkUrl(work, false, returnTo)}>查看记录</a>}
    </div>
    <UnisNativeSurface slot="rule" className="uf-native-rule"/>
  </article>;
}

/** UNIS-only view. All mutable records and playback/editing stay in the existing app. */
export default function UnisDesignReview({content, basePath = UNIS_PATH}: {content: CandidateContent; basePath?: '/artists/unis' | typeof UNIS_PATH}) {
  const options = useArtistTimelineHostOptions();
  const [fetched, setFetched] = useState<{data: CatalogView | null; error: string; loading: boolean}>({data: null, error: '', loading: true});
  const [attempt, setAttempt] = useState(0);
  const state = options.catalog !== undefined ? {data: options.catalog, error: options.error ?? '', loading: options.loading ?? false} : fetched;
  const url = useSyncExternalStore(subscribe, () => window.location.href, () => options.serverRoute ?? basePath);
  const route = useMemo(() => artistRoute(url), [url]);
  const releaseRoute = useMemo(() => unisReleaseFromUrl(url), [url]);
  const returnTo = productionReturn(unisRouteUrl(route, releaseRoute.release?.releaseKey, basePath));
  const rememberScroll = useArtistScroll(!!state.data, url);
  const [lightbox, setLightbox] = useState<{src: string; label: string} | null>(null);

  useEffect(() => {
    if (options.catalog !== undefined) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const data = await catalogReadWithDeadline(async signal => {
          const response = await fetch('/api/catalog?artist=unis&shape=display-v1', {cache: 'no-store', signal});
          if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('暂时没有连上你的资料库。');
          const result = await response.json() as CatalogView;
          if (!result || !Array.isArray(result.groups) || !Array.isArray(result.members) || !Array.isArray(result.works) || !Array.isArray(result.ratings)) throw new Error('资料暂时没有加载完整。');
          return result;
        }, controller.signal);
        if (!controller.signal.aborted) setFetched({data, error: '', loading: false});
      } catch (error) {
        if (!controller.signal.aborted) setFetched({data: null, error: error instanceof Error ? error.message : '资料暂时无法读取。', loading: false});
      }
    })();
    return () => controller.abort();
  }, [options.catalog, attempt]);

  function retry() {
    if (options.catalog !== undefined) { options.onRetry?.(); return; }
    setFetched({data: null, error: '', loading: true});
    setAttempt(value => value + 1);
  }

  function navigate(patch: Partial<ReturnType<typeof artistRoute>>, releaseKey: string | null = null, replace = false) {
    rememberScroll();
    window.history[replace ? 'replaceState' : 'pushState'](newArtistHistoryState(window.history.state), '', unisRouteUrl({...route, ...patch}, releaseKey, basePath));
    window.dispatchEvent(new Event('artist-location-change'));
    if (!replace) window.scrollTo({top: 0, behavior: 'instant'});
  }

  const collection = useMemo(() => state.data ? artistCollection(state.data, content.groupId) : null, [state.data, content.groupId]);
  const members = orderUNISMembers(collection?.members ?? []);
  const member = members.find(item => item.id === route.member);
  const works = useMemo(() => [...(collection?.works ?? [])].sort((a, b) => (a.releaseDate || '9999').localeCompare(b.releaseDate || '9999') || a.id.localeCompare(b.id)), [collection]);
  const rows = artistWorkRows(works, route.queue, route.search).filter(work => route.format === 'stage' ? unisHasStage(work) : route.format === 'mv' ? !!safeGroupLink(work.url) : true);
  const featuredWork = works.find(work => work.id === UNIS_FEATURED_WORK);
  const featuredRelease = getUNISEditorialRelease(UNIS_FEATURED_RELEASE);
  const releases = unisDisplayReleases();
  const release = releaseRoute.release;
  const libraryActive = route.section === 'works' || route.section === 'records' || releaseRoute.requested;
  const home = !route.member && !releaseRoute.requested && route.section === 'overview';
  const nativeScreen: UnisNativeScreen = route.member ? 'profile' : releaseRoute.requested ? 'release' : home ? 'home' : route.section === 'members' ? 'members' : route.section === 'updates' ? 'timeline' : rows.length ? 'library' : 'empty';
  const name = (person: Member) => memberChineseName(person) || memberDisplayName(person);
  const portrait = (person: Member) => candidatePortrait(person, content.portraits);
  const goHome = () => navigate({section: 'overview', member: null, format: 'all', queue: 'all', search: ''});
  const goLibrary = () => navigate({section: 'works', member: null, format: 'all'});
  const goMembers = () => navigate({section: 'members', member: null});

  function roster() {
    return <div className="uf-roster">{members.map((person, index) => <button type="button" key={person.id} data-artist-member-trigger={person.id} className="uf-native-host" onClick={() => navigate({section: 'members', member: person.id})}>
      <UnisNativeSurface slot={`member-${index}`}/><span className="uf-square uf-native-host"><UnisNativeSurface slot={`portrait-${index}`}/><Picture src={portrait(person)?.image} identityKey={`member:${person.id}`} alt={`${name(person)} · ${person.stageName} 资料照`}/></span>
      <strong className="member-display-name">{name(person)}</strong><small>{person.stageName.toUpperCase()}</small>
    </button>)}{!members.length && <p className="uf-empty">尚无关联的成员记录。</p>}</div>;
  }

  function releaseRows(list: readonly UNISEditorialRelease[], homeList = false) {
    return <div className={homeList ? 'uf-home-release-list' : 'uf-release-list'}>{list.map((item, index) => <button type="button" key={item.releaseKey} className="uf-release-row uf-native-host" data-release-key={item.releaseKey} onClick={() => navigate({section: 'works', member: null}, item.releaseKey)}>
      <UnisNativeSurface slot={`release-row-${index}`}/><ReleaseImage release={item}/><span className="uf-release-copy"><strong>{item.title}</strong><time dateTime={item.eventDate?.value}>{unisReleaseDate(item)}</time></span><span className="uf-release-arrow" aria-hidden="true">↗</span><UnisNativeSurface slot="rule" className="uf-native-rule uf-release-rule"/>
    </button>)}</div>;
  }

  function personPage(person: Member) {
    const image = portrait(person);
    const items = state.data ? memberWorks(state.data, person.id) : [];
    return <>
      <button type="button" className="uf-back uf-native-host" onClick={goMembers}><UnisNativeSurface slot="profile-back"/>← 返回成员</button>
      <section className="uf-person">
        <button type="button" className="uf-square uf-portrait-button" disabled={!image} aria-label={`放大${name(person)}的照片`} aria-haspopup="dialog" onClick={() => image && setLightbox({src: image.image, label: `${name(person)} · ${person.stageName}`})}>
          <Picture src={image?.image} identityKey={`member:${person.id}`} alt={`${name(person)} · ${person.stageName} 资料照`} priority/>
        </button>
        <div className="uf-person-copy"><h1 className="member-display-name">{name(person)}</h1><h2>{person.id === 'recvxAPQCFgu8Z' ? <UnisNativeText role="nana" label="NANA"/> : person.stageName.toUpperCase()}</h2><p>UNIS</p>
          <div className="uf-person-actions"><a className="uf-button uf-pale" href={artistMemberUrl(person.id, returnTo)}>个人档案与记录 ↗</a>
            {image && <button type="button" className="uf-button uf-pale uf-native-host" aria-haspopup="dialog" onClick={() => setLightbox({src: image.image, label: `${name(person)} · ${person.stageName}`})}><UnisNativeSurface slot="profile-zoom"/>放大照片</button>}</div>
          <details className="uf-person-facts"><summary>更多成员资料</summary><MemberPhysicalFacts member={person}/><MemberCareerFacts member={person}/>{image?.sourceUrl && <External href={image.sourceUrl}>照片来源 ↗</External>}</details>
        </div>
      </section>
      {items.length > 0 && <section className="uf-person-records"><h2>个人作品记录</h2>{items.map(item => <a key={item.work.id} data-member-work-trigger={item.work.id} href={artistWorkUrl(item.work, false, returnTo)}><strong>{item.work.song || item.work.name}</strong><span>表现 {artistWorkScoreLabel(item.performance)} · 造型 {artistWorkScoreLabel(item.styling)}</span></a>)}</section>}
      <section className="uf-related"><UnisNativeSurface slot="rule" className="uf-native-rule uf-rule-top"/><h2>浏览 UNIS 作品</h2>{works.slice(0, 3).map((work, index) => <WorkRow index={index} key={work.id} work={work} returnTo={returnTo}/>)}<button type="button" className="uf-button uf-primary uf-bottom uf-native-host" onClick={goLibrary}><UnisNativeSurface slot="profile-library"/>进入发行与影像</button></section>
    </>;
  }

  function releasePage(item: UNISEditorialRelease) {
    const related = unisReleaseWorks(item, works), cover = unisReleaseCover(item), coverDetails = unisReleaseCoverDetails(item);
    return <><button type="button" className="uf-back uf-native-host" onClick={goLibrary}><UnisNativeSurface slot="release-back"/>← 返回发行与影像</button>
      <section className="uf-release-detail"><ReleaseImage release={item} priority/><div><h1>{item.releaseKey === UNIS_FEATURED_RELEASE ? <UnisNativeText role="swicy" label="SWICY"/> : item.title}</h1><p className="uf-release-kind">{item.releaseKey === UNIS_FEATURED_RELEASE ? '第二张迷你专辑' : coverDetails?.editionLabel ?? '音乐发行'}</p><time dateTime={item.eventDate?.value}>{unisReleaseDate(item)}</time><External className="uf-button uf-pale uf-native-host" href={cover?.sourceUrl ?? item.sources[0]?.url}><UnisNativeSurface slot="release-external"/>查看发行来源 ↗</External></div></section>
      <section className="uf-related"><UnisNativeSurface slot="rule" className="uf-native-rule uf-rule-top"/><h2>相关影像</h2>{related.map((work, index) => <WorkRow index={index} key={work.id} work={work} returnTo={returnTo}/>)}{!related.length && <p className="uf-empty">这张发行尚无已关联的影像记录。</p>}</section>
    </>;
  }

  return <ImageRecoveryProvider><UnisNativeScreenContext.Provider value={nativeScreen}><div className="unis-figma" data-figma-file="zeLNExz4TbpWRW3uiahef7">
    <a className="uf-skip" href="#artist-content">跳到内容</a>
    <span className="uf-header-surface"><UnisNativeSurface slot="header-bg"/></span><header className="uf-header"><UnisNativeSurface slot="header-rule" className="uf-native-rule"/><button type="button" className="uf-logo uf-native-host" aria-label="UNIS 首页" onClick={goHome}><UnisNativeSurface slot="nav-home"/><UnisNativeText role="header" label="UNIS"/></button>
      <nav className="uf-nav" aria-label="UNIS 导航">{navigation.map(([key, label]) => <button type="button" key={key} className="uf-native-host" aria-current={(key === 'works' ? libraryActive : route.section === key) ? 'page' : undefined} onClick={() => navigate({section: key, member: null, format: 'all'})}><UnisNativeSurface slot={key === 'works' ? 'nav-library' : key === 'updates' ? 'nav-timeline' : 'nav-members'}/><span className="uf-desktop-label">{label}</span><span className="uf-mobile-label">{key === 'works' ? '作品' : label}</span></button>)}</nav>
    </header>
    <main id="artist-content" className="uf-main" tabIndex={-1}>
      {state.loading ? <section className="uf-state" role="status"><h1>UNIS</h1><p>正在打开档案…</p></section>
        : state.error ? <section className="uf-state" role="alert"><h1>UNIS</h1><p>{state.error}</p><button type="button" className="uf-button uf-primary" onClick={retry}>重新加载</button></section>
        : !collection ? <section className="uf-state"><h1>UNIS</h1><p>暂未找到团体资料。</p><a className="uf-button uf-primary" href="/?view=groups">返回团体索引</a></section>
        : route.member ? member ? personPage(member) : <section className="uf-state"><p>这个成员不在本团档案中。</p><button type="button" className="uf-button uf-primary" onClick={goMembers}>查看成员</button></section>
        : releaseRoute.requested ? release ? releasePage(release) : <section className="uf-state"><p>未找到这张发行。</p><button type="button" className="uf-button uf-primary" onClick={goLibrary}>返回发行与影像</button></section>
        : <>
          {home && <>
<section className="uf-hero"><div className="uf-hero-identity"><h1><UnisNativeText role="hero" label="UNIS"/></h1><p>SWICY · 2025</p><UnisNativeColourDots/></div>
              <figure className="uf-hero-image"><Picture src={content.hero.image} identityKey={`hero:${content.groupId}`} alt="UNIS · SWICY 八人历史宣传照" priority/></figure>
              <div className="uf-hero-actions">{featuredWork && <a className="uf-button uf-primary uf-native-host" href={artistWorkUrl(featuredWork, false, returnTo)}><UnisNativeSurface slot="home-watch"/>观看 SWICY · MV</a>}<button type="button" className="uf-button uf-outline uf-native-host" onClick={goMembers}><UnisNativeSurface slot="home-members"/>认识成员</button></div>
            </section>
<ArtistInformation slug="unis"/>
<section className="uf-home-members"><Title en="MEMBERS" level={2}>成员</Title>{roster()}</section>
<section className="uf-home-releases uf-native-host"><UnisNativeSurface slot="home-panel"/><div className="uf-release-heading"><h2><UnisNativeText role="homeReleases" label="RELEASES"/></h2><p>发行</p></div>
              {featuredRelease && <div className="uf-featured-release"><ReleaseImage release={featuredRelease}/><div><h3>{featuredRelease.title}</h3><p><span className="uf-desktop-label">{unisReleaseDate(featuredRelease)} · </span>第二张迷你专辑</p><button type="button" className="uf-button uf-yellow uf-native-host" onClick={() => navigate({section: 'works', member: null}, featuredRelease.releaseKey)}><UnisNativeSurface slot="home-release"/><span className="uf-desktop-label">查看发行 ↗</span><span className="uf-mobile-label">查看发行</span></button></div></div>}
              <button type="button" className="uf-button uf-library-button uf-native-host" onClick={goLibrary}><UnisNativeSurface slot="home-library"/>浏览发行与影像</button>
              {releaseRows(releases.filter(item => item.releaseKey !== UNIS_FEATURED_RELEASE && !!item.cover).slice(0, 4), true)}
            </section>
<section className="uf-library" data-home-module="mv"><h2>MV</h2><div className="uf-work-grid">{works.slice(0,3).map(work=><a key={work.id} href={artistWorkUrl(work,false,returnTo)}><h3>{work.song||work.name}</h3><span>观看 MV ↗</span></a>)}</div></section>
<section className="uf-timeline-teaser uf-native-host"><UnisNativeSurface slot="home-teaser"/><time dateTime="2024-01-17">2024.01.17</time><h2>《Universe Ticket》最终八人成团</h2><button type="button" className="uf-button uf-native-host" onClick={() => navigate({section: 'updates', member: null})}><UnisNativeSurface slot="home-timeline"/>查看时间轴</button></section>
</>}
          {route.section === 'members' && <section className="uf-members-page"><Title en="MEMBERS">成员</Title>{roster()}<button type="button" className="uf-button uf-primary uf-bottom uf-native-host" onClick={goLibrary}><UnisNativeSurface slot="members-library"/>浏览发行与影像</button></section>}
          {libraryActive && <section className="uf-library"><Title en="MUSIC / VIDEO">发行与影像</Title>
            <div className="uf-library-tools"><label className="uf-search uf-native-host"><UnisNativeSurface slot="library-search"/><span className="uf-visually-hidden">搜索本团作品</span><input aria-label="搜索本团作品" type="search" placeholder="搜索歌曲或版本" value={route.search} onChange={event => navigate({search: event.target.value}, null, true)}/></label>
              <div className="uf-format" aria-label="影像类型">{[['all', '全部'], ['mv', 'MV'], ['stage', '舞台']].map(([format, label], index) => <button type="button" key={format} className="uf-native-host" data-format-value={format} aria-pressed={route.format === format} onClick={() => navigate({format})}><UnisNativeSurface slot={route.format === format ? 'format-0' : index === 0 ? 'format-1' : `format-${index}`}/>{label}</button>)}</div>
              <div className="uf-queues" aria-label="观看队列">{queues.map(([queue, label], index) => <button type="button" key={queue} className="uf-native-host" aria-pressed={route.queue === queue} onClick={() => navigate({queue})}><UnisNativeSurface slot={queue === 'unrated' && route.queue === 'unrated' ? 'queue-selected-unrated' : `queue-${index}`} screen={queue === 'unrated' && route.queue === 'unrated' ? 'empty' : 'library'}/>{label}</button>)}</div>
            </div>
            {rows.length ? <section className="uf-video-list"><h2>影像</h2>{rows.map((work, index) => <WorkRow index={index} key={work.id} work={work} returnTo={returnTo} format={route.format}/>)}</section>
              : <section className="uf-search-empty"><h2>没有符合条件的作品</h2><p>试试其他关键词，或查看全部。</p><button type="button" className="uf-button uf-primary uf-native-host" onClick={() => navigate({section: 'works', member: null, queue: 'all', search: '', format: 'all'})}><UnisNativeSurface slot="library-clear" screen="empty"/>清除搜索与筛选</button></section>}
            {route.queue === 'all' && !route.search && <section className="uf-all-releases"><h2>发行</h2>{releaseRows(releases)}</section>}
          </section>}
          {route.section === 'updates' && <section className="uf-timeline"><Title en="TIMELINE">时间轴</Title><div className="uf-timeline-data"><UnisNativeTimelineAxis/><ArtistTimelineHost groupId={content.groupId} catalog={state.data} loading={state.loading} error={state.error} onRetry={retry}/></div><button type="button" className="uf-button uf-primary uf-bottom uf-native-host" onClick={goHome}><UnisNativeSurface slot="timeline-home"/>返回首页</button></section>}
        </>}
      <ImageRecoveryControls/>
    </main>
    <footer className="uf-footer"><UnisNativeSurface slot="footer-rule" className="uf-native-rule uf-rule-top"/><button type="button" className="uf-logo" onClick={goHome}><UnisNativeText role="footer" label="UNIS"/></button><div><a href="/?view=groups">团体索引</a><button type="button" className="uf-native-host uf-footer-return" onClick={goHome}><UnisNativeSurface slot="footer-home"/>返回首页</button></div></footer>
    {lightbox && <PhotoLightbox {...lightbox} onClose={() => setLightbox(null)}/>}
  </div></UnisNativeScreenContext.Provider></ImageRecoveryProvider>;
}
