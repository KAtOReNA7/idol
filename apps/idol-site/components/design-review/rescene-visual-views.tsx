'use client';

import {useEffect, useId, useRef, type ReactNode} from 'react';
import type {SolMember, SolSource, SolViewProps, SolWork, SolWorkDetailProps} from '../../lib/idol/design-review/sol-review-types';
import type {TimelineDate, TimelineEvent} from '../../lib/idol/timeline/types';

const formatDate = (value: string | null | undefined) => value ? value.replaceAll('-', '.') : '日期未收录';
const workKind = (kind: SolWork['kind']) => ({release: '发行', mv: 'MV', stage: '舞台'}[kind]);
const eventKinds: Record<TimelineEvent['eventType'], string> = {
  member_join: '成员加入', member_departure: '成员离开', debut: '正式出道', release: '作品发行',
  disband: '解散', agency_change: '所属公司变更', contract_end: '合约结束', rename: '名称变更',
  hiatus: '暂停活动', resume: '恢复活动', notice: '公告', other: '其他事件',
};
const eventStatuses: Record<TimelineEvent['status'], string> = {
  confirmed: '已确认', announced: '已公布', planned: '计划中', postponed: '已延期', cancelled: '已取消', uncertain: '待核实',
};
const datePrecision: Record<TimelineDate['precision'], string> = {day: '精确到日', month: '精确到月', year: '精确到年'};
const eventDate = (event: TimelineEvent) => event.eventDate ?? event.announcementDate ?? event.plannedDate;
const eventDateMeaning = (event: TimelineEvent) => event.eventDate
  ? event.eventType === 'release' ? '发行发生日' : event.eventType === 'debut' ? '正式出道日' : '事件发生日'
  : event.announcementDate ? '公告日，非发生日' : event.plannedDate ? '计划日，非发生日' : '事件日期未收录';
const newestWorks = (works: SolWork[]) => [...works].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.key.localeCompare(b.key));
const sortedEvents = (events: readonly TimelineEvent[], recent = false) => [...events].sort((a, b) => {
  const aDate = eventDate(a)?.value, bDate = eventDate(b)?.value;
  if (!aDate) return bDate ? 1 : a.id.localeCompare(b.id);
  if (!bDate) return -1;
  return (recent ? -1 : 1) * aDate.localeCompare(bDate) || a.id.localeCompare(b.id);
});
const workFields = (work: SolWork) => work.kind === 'release'
  ? {section: 'works', release: work.key}
  : {section: 'works', format: work.kind, media: work.key};

function Eyebrow({children}: {children: ReactNode}) {
  return <div className="eyebrow">{children}</div>;
}

function Sources({items, title = '资料与图片来源', children}: {items: SolSource[]; title?: string; children?: ReactNode}) {
  return <details className="source-details">
    <summary>{title}{items.length > 0 ? ` · ${items.length} 处` : ''}</summary>
    {items.length ? items.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)
      : <p className="source-empty">暂无可展示的来源链接。</p>}
    {children}
  </details>;
}

function WorkDate({work}: {work: SolWork}) {
  return <>{work.date ? <time dateTime={work.date}>{formatDate(work.date)}</time> : '日期未收录'} · {work.dateLabel || (work.kind === 'release' ? '发行日' : work.kind === 'mv' ? 'MV 公开日' : '舞台视频公开日')}</>;
}

function Portrait({member, index, view}: {member: SolMember; index: number; view: SolViewProps}) {
  const {Link, Picture, href} = view;
  return <Link className="portrait-card" href={href({section: 'members', member: member.id})} data-design-node={`member-card-${member.key}`}>
    <div className="portrait"><Picture src={member.image} alt={`${member.stageName} · ${member.name} 成员肖像`} /></div>
    <span className="scent-tag">RESCENE / {String(index + 1).padStart(2, '0')}</span>
    <div className="portrait-meta"><div><h3>{member.stageName.toUpperCase()}</h3><span className="cn">{member.name}</span></div><span className="arrow" aria-hidden="true">↗</span></div>
  </Link>;
}

function ReleaseCard({work, view}: {work: SolWork; view: SolViewProps}) {
  const {Link, Picture, href} = view;
  return <Link className="release-card" href={href(workFields(work))} data-design-node={`release-${work.key}`}>
    <div className="release-art"><Picture src={work.image} alt={`${work.title} 发行封面`} /></div>
    <h3>{work.title}</h3><p>{work.subtype || '发行'}<br /><WorkDate work={work} /></p>
  </Link>;
}

function Empty({title, children}: {title: string; children: ReactNode}) {
  return <section className="empty-state" role="status"><h2>{title}</h2>{children}</section>;
}

function Home(view: SolViewProps) {
  const {data, events, Link, Picture, href} = view;
  const latest = newestWorks(data.works.filter(work => work.kind === 'release')).slice(0, 3);
  const featured = data.works.find(work => work.key === 'mv-love-attack') ?? data.works.find(work => work.kind === 'mv');
  const earliest = sortedEvents(events).slice(0, 3);
  return <>
    <div className="page-width hero" data-design-node="home-hero">
      <div className="hero-copy"><Eyebrow>RESCENE / 01</Eyebrow><h1>RE<br /><em>SCENE</em></h1>
        <p className="intro">WONI · LIV · MINAMI<br />MAY · ZENA</p>
        <div className="button-row"><Link className="button filled" href={href({section: 'works'})}>作品 <span aria-hidden="true">↗</span></Link><Link className="button" href={href({section: 'members'})}>成员 <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="hero-visual"><Picture src={data.hero} alt="RESCENE 五位成员团体摄影" className="hero-photo" priority zoom />
        <div className="hero-caption">RESCENE<span>团体照片</span></div><div className="scent-seal" aria-hidden="true">RESCENE<br />·<br />MEMBERS</div>
      </div>
    </div>
    <div className="home-note" data-design-node="concept-note"><span>RESCENE</span><p>成员 · 作品 · 时间轴</p></div>
    <section className="page-width section" data-design-node="home-members">
      <div className="section-head"><div><Eyebrow>MEMBERS</Eyebrow><h2>成员</h2><p className="subtitle">WONI · LIV · MINAMI · MAY · ZENA</p></div><Link className="text-link" href={href({section: 'members'})}>成员 <span aria-hidden="true">↗</span></Link></div>
      <div className="members-ribbon">{data.members.map((member, index) => <Portrait key={member.id} member={member} index={index} view={view} />)}</div>
      {data.status && <p className="status-note">团体资料状态：{data.status}{data.statusDate ? ` · 核对日期 ${formatDate(data.statusDate)}` : ''}</p>}
    </section>
    <section className="release-section" data-design-node="home-releases"><div className="page-width section">
      <div className="section-head"><div><Eyebrow>RELEASES</Eyebrow><h2>发行</h2><p className="subtitle">专辑与单曲</p></div><Link className="text-link" href={href({section: 'works'})}>全部作品 <span aria-hidden="true">↗</span></Link></div>
      {latest.length ? <div className="release-shelf">{latest.map(work => <ReleaseCard key={work.key} work={work} view={view} />)}</div> : <Empty title="暂无发行"><p>暂无可展示的发行条目。</p></Empty>}
    </div></section>
    {featured && <section className="page-width section feature-video" data-design-node="home-feature-video">
      <div><Link className="film-still" href={href(workFields(featured))} aria-label={`查看 ${featured.title} MV 详情`}><Picture src={featured.image} alt={`${featured.title} MV 预览`} /><span className="play" aria-hidden="true">▷</span></Link><p className="video-caption">{featured.title} · OFFICIAL MV</p></div>
      <div><Eyebrow>MUSIC VIDEO</Eyebrow><h2>{featured.title}</h2><p>{featured.description}</p><Link className="button" href={href(workFields(featured))}>查看 MV <span aria-hidden="true">↗</span></Link></div>
    </section>}
    <section className="page-width home-timeline" data-design-node="home-timeline"><div><Eyebrow>TIMELINE</Eyebrow><h2>时间轴</h2><Link className="text-link" href={href({section: 'updates', timelineOrder: 'earliest'})}>查看时间轴 <span aria-hidden="true">↗</span></Link></div><div>
      {earliest.map(event => <Link className="mini-event" key={event.id} href={href({section: 'updates', event: event.id})}><time dateTime={eventDate(event)?.value}>{formatDate(eventDate(event)?.value)}</time><div><h3>{event.title}</h3><p>{eventDateMeaning(event)}</p></div></Link>)}
      {!earliest.length && <p className="status-note">{view.timelineLoading ? '正在载入时间轴…' : '时间轴暂未载入，可前往时间轴页面查看。'}</p>}
    </div></section>
  </>;
}

function Members(view: SolViewProps) {
  const {data, route, onFilter} = view;
  const search = route.query.trim().toLocaleLowerCase();
  const members = data.members.filter(member => [member.stageName, member.name, member.koreanName].join(' ').toLocaleLowerCase().includes(search));
  return <div className="page-width">
    <section className="page-intro" data-design-node="members-intro"><div className="directory-intro"><Eyebrow>MEMBERS</Eyebrow><h1 className="page-title">成员</h1><p className="subcopy">RESCENE 成员资料</p></div><span className="page-count">{String(data.members.length).padStart(2, '0')} MEMBERS / RESCENE</span></section>
    <div className="toolbar" data-design-node="member-search"><label className="searchbox"><span>查找成员</span><input type="search" placeholder="中文名 / 艺名 / 韩文名" value={route.query} autoComplete="off" onChange={event => onFilter({section: 'members', q: event.target.value || null})} /></label><p className="result-count" aria-live="polite">{members.length} / {data.members.length} MEMBERS</p></div>
    {members.length ? <div className="member-grid" data-design-node="member-directory-grid">{members.map(member => <Portrait key={member.id} member={member} index={data.members.indexOf(member)} view={view} />)}</div>
      : <Empty title="未找到成员"><p>可按中文名、艺名或韩文名搜索。</p><button type="button" className="button" onClick={() => onFilter({section: 'members', q: null})}>查看全部成员 ↗</button></Empty>}
  </div>;
}

function MemberDetail(view: SolViewProps) {
  const {data, route, Link, Picture, href, onMemberAction, onReturn} = view;
  const index = data.members.findIndex(member => member.id === route.member || member.key === route.member);
  const member = data.members[index];
  if (!member) return <NotFound view={view} />;
  const previous = data.members[(index + data.members.length - 1) % data.members.length];
  const next = data.members[(index + 1) % data.members.length];
  const releases = newestWorks(data.works.filter(work => work.kind === 'release')).slice(0, 3);
  return <div className="page-width">
    <nav className="breadcrumb" aria-label="当前位置"><Link href={href({section: 'overview'})}>首页</Link><span aria-hidden="true">/</span><button type="button" className="breadcrumb-return" onClick={onReturn}>成员</button><span aria-hidden="true">/</span><span aria-current="page">{member.stageName}</span></nav>
    <article className="member-profile" data-design-node={`member-detail-${member.key}`}>
      <div className="profile-photo"><Picture src={member.image} alt={`${member.stageName} · ${member.name} 成员肖像`} priority zoom /><p className="photo-credit">{member.imageCredit || '照片版权归原权利人所有。'}</p></div>
      <div className="profile-copy"><Eyebrow>MEMBER / {String(index + 1).padStart(2, '0')}</Eyebrow><h1>{member.stageName.toUpperCase()}</h1><p className="native-name">{member.name} {member.koreanName && <span>· {member.koreanName}</span>}</p><p className="member-note">{member.profile}</p>
        <dl className="facts"><div><dt>所属团体</dt><dd>RESCENE</dd></div><div><dt>艺名</dt><dd>{member.stageName}</dd></div><div><dt>团内角色</dt><dd>{member.role || '成员'}</dd></div>{member.birthDate && <div><dt>生日</dt><dd><time dateTime={member.birthDate}>{formatDate(member.birthDate)}</time></dd></div>}{member.status && <div><dt>成员状态</dt><dd>{member.status}</dd></div>}{member.period && <div><dt>活动时期</dt><dd>{member.period}</dd></div>}</dl>
        <div className="button-row profile-actions"><Link className="button filled" href={href({section: 'works'})}>作品 <span aria-hidden="true">↗</span></Link><button type="button" className="button" onClick={() => onMemberAction(member)}>查看我的成员记录 <span aria-hidden="true">↗</span></button></div>
        <Sources items={member.sources} title="资料与照片来源" />
      </div>
    </article>
    <nav className="sibling-nav" aria-label="其他成员"><Link href={href({section: 'members', member: previous.id})}>← 上一位<strong>{previous.stageName} · {previous.name}</strong></Link><Link className="next-member" href={href({section: 'members', member: next.id})}>下一位 →<strong>{next.stageName} · {next.name}</strong></Link></nav>
    <section className="section member-related" data-design-node="member-related-releases"><div className="section-head"><div><Eyebrow>RELEASES</Eyebrow><h2>团体发行</h2><p className="subtitle">RESCENE 专辑与单曲</p></div><Link className="text-link" href={href({section: 'works'})}>全部作品 ↗</Link></div><div className="release-shelf">{releases.map(work => <ReleaseCard key={work.key} work={work} view={view} />)}</div></section>
  </div>;
}

function Works(view: SolViewProps) {
  const {data, route, Link, Picture, href, onFilter} = view;
  const selected = data.works.find(work => work.key === (route.release ?? route.media));
  const kind = selected?.kind ?? route.format;
  const query = route.query.trim().toLocaleLowerCase();
  const filtered = data.works.filter(work => work.kind === kind && `${work.title} ${work.subtype} ${work.tracks.join(' ')}`.toLocaleLowerCase().includes(query));
  const works = [...filtered].sort((a, b) => {
    if (!a.date) return b.date ? 1 : a.key.localeCompare(b.key);
    if (!b.date) return -1;
    return (route.sort === 'oldest' ? 1 : -1) * a.date.localeCompare(b.date) || a.key.localeCompare(b.key);
  });
  const listFields = {section: 'works', format: kind, q: route.query || null, sort: route.sort};
  return <div className="page-width">
    <section className="page-intro" data-design-node="works-intro"><div><Eyebrow>WORKS</Eyebrow><h1 className="page-title">作品</h1><p className="subcopy">发行 · MV · 舞台</p></div><span className="page-count">RELEASES / MV / STAGE</span></section>
    <div className="toolbar works-toolbar" data-design-node="works-toolbar"><div className="tabs" role="group" aria-label="作品分类">{(['release', 'mv', 'stage'] as const).map(value => <button type="button" key={value} aria-pressed={value === kind} onClick={() => onFilter({...listFields, format: value, release: null, media: null})}>{workKind(value)}</button>)}</div>
      <label className="searchbox"><span>搜索</span><input type="search" value={route.query} placeholder="输入作品名称" autoComplete="off" onChange={event => onFilter({...listFields, q: event.target.value || null, release: null, media: null})} /></label>
      <label className="sortbox"><span>排序</span><select value={route.sort} onChange={event => onFilter({...listFields, sort: event.target.value, release: null, media: null})}><option value="newest">最新在前</option><option value="oldest">最早在前</option></select></label>
    </div>
    <p className="status-note" aria-live="polite">{works.length} 项{workKind(kind)}{query ? ` · 搜索“${route.query}”` : ''}。{kind === 'release' ? '日期指发行日期。' : kind === 'mv' ? '日期指 MV 公开日期，不等同于音源发行日。' : '公开日与演出发生日分别标注。'}</p>
    {works.length ? <div className={`work-grid${kind !== 'release' ? ' video-grid' : ''}`} data-design-node="work-collection-grid">{works.map(work => <Link key={work.key} className={`work-card${work.kind !== 'release' ? ' is-video' : ''}`} href={href({...listFields, ...workFields(work)})} data-design-node={`work-${work.key}`}>
      <Picture src={work.image} alt={`${work.title} ${work.kind === 'release' ? '发行封面' : '视频预览'}`} /><span className="type">{workKind(work.kind)} <span>· {work.subtype || (work.kind === 'release' ? '音乐发行' : '影像')}</span></span><h3>{work.title}</h3><span className="date"><WorkDate work={work} /></span><span className="arrow" aria-hidden="true">↗</span>
    </Link>)}</div> : <Empty title={query ? '未找到作品' : `暂无${workKind(kind)}`}><p>{query ? '换一个名称，或清空搜索继续浏览。' : `此处暂未收录${workKind(kind)}条目，你仍可从官方频道继续观看。`}</p>{query ? <button type="button" className="button" onClick={() => onFilter({...listFields, q: null, release: null, media: null})}>清空搜索 ↗</button> : <a className="button" href={data.channelUrl} target="_blank" rel="noopener noreferrer">RESCENE 官方频道 ↗</a>}</Empty>}
  </div>;
}

function TimelineSourceDetails({event}: {event: TimelineEvent}) {
  return <details className="source-details event-sources"><summary>展开来源 · {event.sources.length} 处</summary>{event.summary && <p>{event.summary}</p>}{event.scopeNote && <p className="evidence-scope">核实范围：{event.scopeNote}</p>}
    {event.sources.length ? <ol className="source-list">{event.sources.map((source, index) => <li key={`${source.id}-${index}`}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><p>{source.publisher}</p><dl className="source-dates">{source.sourcePublishedAt && <div><dt>来源发表日</dt><dd><time dateTime={source.sourcePublishedAt.value}>{formatDate(source.sourcePublishedAt.value)}</time> · {datePrecision[source.sourcePublishedAt.precision]}</dd></div>}<div><dt>核对日期</dt><dd><time dateTime={source.checkedAt}>{formatDate(source.checkedAt)}</time></dd></div></dl>{source.scopeNote && <p>{source.scopeNote}</p>}</li>)}</ol> : <p>暂无可展示的来源链接。</p>}
  </details>;
}

function Timeline(view: SolViewProps) {
  const {events, route, Link, Picture, href, onFilter, timelineLoading, timelineError, onTimelineRetry} = view;
  const listRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId().replaceAll(':', '');
  const recent = route.fields.timelineOrder === 'recent';
  const type = route.timelineType || 'all';
  const years = [...new Set(events.flatMap(event => eventDate(event)?.value.slice(0, 4) ?? []))].sort();
  const filterType = (event: TimelineEvent) => type === 'all' || (type === 'release' ? event.eventType === 'release' : type === 'members' ? ['member_join', 'member_departure'].includes(event.eventType) : !['release', 'member_join', 'member_departure'].includes(event.eventType));
  const filtered = sortedEvents(events, recent).filter(event => event.id === route.event || filterType(event) && (!route.year || eventDate(event)?.value.startsWith(route.year)));
  useEffect(() => {
    if (!route.event) return;
    const frame = requestAnimationFrame(() => {
      const target = listRef.current?.querySelector<HTMLElement>('[data-selected-event="true"]');
      target?.scrollIntoView({block: 'start', behavior: 'auto'});
      target?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [route.event, route.year, type, timelineLoading]);
  const filterFields = {section: 'updates', timelineType: type, timelineOrder: recent ? 'recent' : 'earliest', year: route.year, event: null};
  const selectedExists = !route.event || events.some(event => event.id === route.event);
  return <div className="page-width">
    <section className="page-intro" data-design-node="timeline-intro"><div><Eyebrow>TIMELINE</Eyebrow><h1 className="page-title">时间轴</h1><p className="subcopy">发行 · 成员 · 团体事件</p></div><span className="page-count">{recent ? 'LATEST FIRST' : 'EARLIEST FIRST'} / 只读</span></section>
    <div className="timeline-layout"><aside className="timeline-sidebar" data-design-node="timeline-guide"><Eyebrow>FILTER</Eyebrow><p>按年份与类型<br />筛选事件。</p>
      <label className="timeline-select">查看<select value={type} onChange={event => onFilter({...filterFields, timelineType: event.target.value})}><option value="all">全部事件</option><option value="release">作品发行</option><option value="members">成员变动</option><option value="organization">团体里程碑</option></select></label>
      <label className="timeline-select">时间顺序<select value={recent ? 'recent' : 'earliest'} onChange={event => onFilter({...filterFields, timelineOrder: event.target.value})}><option value="earliest">最早在前</option><option value="recent">最新在前</option></select></label>
      <nav className="year-links" aria-label="按年份浏览时间轴"><Link href={href({...filterFields, year: null})} aria-current={!route.year ? 'true' : undefined}>全部年份</Link>{years.map(year => <Link key={year} href={href({...filterFields, year})} aria-current={route.year === year ? 'true' : undefined}>{year} ↓</Link>)}</nav>
      <p className="timeline-count" aria-live="polite">显示 {filtered.length} / {events.length} 个事件</p>
    </aside><div className="timeline-axis" ref={listRef} data-design-node="timeline-single-axis" aria-busy={timelineLoading}>
      {timelineLoading && <p className="timeline-notice" role="status">正在载入时间轴…</p>}
      {timelineError && <div className="timeline-notice" role="alert"><p>{timelineError}</p><button type="button" className="button" onClick={onTimelineRetry}>重试时间轴 ↻</button></div>}
      {!selectedExists && !timelineLoading && <div className="timeline-notice" role="status"><p>这条事件未在当前时间轴中找到。</p><Link className="text-link" href={href({section: 'updates'})}>查看全部事件 ↗</Link></div>}
      {filtered.map(event => {
        const primaryDate = eventDate(event);
        const fields = view.timelineFields(event);
        const relatedWork = event.workIds.length ? view.data.works.find(work => work.workId && event.workIds.includes(work.workId)) : undefined;
        const isSelected = route.event === event.id;
        return <article className={`event${isSelected ? ' is-selected' : ''}`} key={event.id} id={`${idPrefix}-${event.id}`} tabIndex={-1} data-selected-event={isSelected ? 'true' : undefined} data-design-node={`timeline-event-${event.id}`}>
          <div className="event-dateline"><time dateTime={primaryDate?.value}>{formatDate(primaryDate?.value)}</time><span>{eventDateMeaning(event)}{primaryDate ? ` · ${datePrecision[primaryDate.precision]}` : ''}</span></div>
          <div className={`event-body${!relatedWork?.image ? ' without-art' : ''}`}><div><span className="event-type">{eventKinds[event.eventType]} · {eventStatuses[event.status]}{event.reviewStatus === 'hold' ? ' · 证据待复核' : ''}</span><h2><Link href={href({section: 'updates', event: event.id, timelineOrder: recent ? 'recent' : 'earliest'})} aria-current={isSelected ? 'true' : undefined}>{event.title}</Link></h2>
            {(event.announcementDate || event.plannedDate) && <dl className="event-dates">{event.announcementDate && <div><dt>公告日</dt><dd><time dateTime={event.announcementDate.value}>{formatDate(event.announcementDate.value)}</time> · {datePrecision[event.announcementDate.precision]}</dd></div>}{event.plannedDate && <div><dt>计划日</dt><dd><time dateTime={event.plannedDate.value}>{formatDate(event.plannedDate.value)}</time> · {datePrecision[event.plannedDate.precision]}</dd></div>}</dl>}
            {event.reviewStatus === 'hold' && event.holdReasons.length > 0 && <p className="event-hold">待核事项：{event.holdReasons.join('；')}</p>}
            {fields && <Link className="text-link event-work-link" href={href(fields)}>查看相关作品 ↗</Link>}
            <TimelineSourceDetails event={event} />
          </div>{relatedWork?.image && <figure className="event-art"><Picture src={relatedWork.image} alt={`${relatedWork.title} 相关作品图片`} zoom /><figcaption>相关作品：{relatedWork.title}</figcaption></figure>}</div>
        </article>;
      })}
      {!filtered.length && !timelineLoading && !timelineError && <Empty title="暂无事件"><p>当前筛选下暂无事件，可切换查看全部事件。</p><button type="button" className="button" onClick={() => onFilter({section: 'updates', timelineType: 'all', year: null, event: null, timelineOrder: 'earliest'})}>查看全部事件 ↗</button></Empty>}
    </div></div>
  </div>;
}

function NotFound({view}: {view: SolViewProps}) {
  const {Link, href} = view;
  return <div className="page-width section"><h1 className="page-title">未找到页面</h1><p className="subcopy">所选成员、作品或页面不存在。</p><Link className="button back-to-works" href={href({section: 'overview'})}>回到首页 →</Link></div>;
}

export function ResceneVisualView(view: SolViewProps) {
  const {route, data, Link, href} = view;
  const mainRef = useRef<HTMLElement>(null);
  const mainId = 'rescene-review-main';
  const section = route.member ? 'members' : route.release || route.media ? 'works' : route.section;
  const navigation = [{key: 'overview', label: '首页'}, {key: 'members', label: '成员'}, {key: 'works', label: '作品'}, {key: 'updates', label: '时间轴'}];
  return <>
    <a className="skip" href={`#${mainId}`} onClick={event => {event.preventDefault(); mainRef.current?.focus(); mainRef.current?.scrollIntoView({block: 'start'});}}>跳到内容</a>
    <header className="site-header" data-design-node="header"><Link className="wordmark" href={href({section: 'overview'})} aria-label="RESCENE 首页">RESCENE</Link><nav aria-label="主要导航">{navigation.map(item => <Link key={item.key} href={href({section: item.key})} aria-current={section === item.key ? 'page' : undefined}>{item.label}</Link>)}</nav><span className="header-note">成员 · 作品</span></header>
    <main id={mainId} tabIndex={-1} ref={mainRef}>{!route.valid ? <NotFound view={view} /> : route.member ? <MemberDetail {...view} /> : section === 'overview' || section === 'home' ? <Home {...view} /> : section === 'members' ? <Members {...view} /> : section === 'works' ? <Works {...view} /> : section === 'updates' || section === 'timeline' ? <Timeline {...view} /> : <NotFound view={view} />}</main>
    <footer className="footer" data-design-node="footer"><div className="wordmark">RESCENE</div><p>成员、作品与时间轴。</p><div><a href={data.channelUrl} target="_blank" rel="noopener noreferrer">官方 YouTube ↗</a><a className="footer-return" href="/artists/rescene">正式团体页 ↗</a></div><small>摄影与封面版权归原权利人所有 · 非官方资料页</small></footer>
  </>;
}

export function ResceneWorkDetail(view: SolWorkDetailProps) {
  const {work, data, Link, Picture, href, onMediaAction} = view;
  const titleKey = (value: string) => value.trim().toLocaleLowerCase();
  const related = data.works.filter(candidate => candidate.key !== work.key && (work.kind === 'release'
    ? candidate.kind === 'mv' && work.tracks.some(track => titleKey(track) === titleKey(candidate.title))
    : candidate.kind === 'release' && candidate.tracks.some(track => titleKey(track) === titleKey(work.title))));
  return <div className="dialog-content" data-design-node={`work-detail-${work.key}`}>
    <div className={`work-detail-art${work.kind !== 'release' ? ' is-video' : ''}`}><Picture src={work.image} alt={`${work.title} ${work.kind === 'release' ? '发行封面' : '视频预览'}`} zoom /><p className="photo-credit">{work.imageCredit || (work.kind === 'release' ? '发行封面，版权归原权利人所有。' : '视频预览图，版权归原权利人所有。')}</p></div>
    <div className="work-detail-copy"><Eyebrow>{work.kind === 'release' ? 'RELEASE' : 'MUSIC VIDEO'}</Eyebrow><span className="type">{workKind(work.kind)} / {work.subtype || (work.kind === 'release' ? '音乐发行' : '影像')}</span><h2 id="work-dialog-title">{work.title}</h2><p className="work-date"><WorkDate work={work} /></p><p className="work-description">{work.description}</p>
      {work.tracks.length > 0 && <><h3 className="track-heading">收录曲目</h3><ol className="track-list">{work.tracks.map((track, index) => <li key={`${track}-${index}`}>{track}</li>)}</ol></>}
      <div className="work-actions">{work.kind !== 'release' && work.actionable && <><button type="button" className="button filled" onClick={() => onMediaAction(work, 'play')}>播放{workKind(work.kind)} <span aria-hidden="true">▷</span></button><button type="button" className="button" onClick={() => onMediaAction(work, 'records')}>查看我的观看与评分记录 ↗</button></>}{work.url && <a href={work.url} target="_blank" rel="noopener noreferrer">{work.kind === 'release' ? '在音乐平台聆听' : '在原视频页面观看'} ↗</a>}</div>
      {work.kind === 'release' && <p className="record-note">发行条目用于浏览唱片资料；观看与评分记录保留在对应 MV 或舞台中。</p>}
      {work.kind !== 'release' && !work.actionable && <p className="record-note" role="status">此影像尚无可用的资料库记录入口。</p>}
      {work.url && <p className="external-note">外部平台将在新标签页打开。</p>}
    </div>
    {related.length > 0 && <section className="work-related"><h3>{work.kind === 'release' ? '相关 MV' : '同名曲目收录于'}</h3><p className="related-note">按同名曲目关联。</p><div className="related-links">{related.map(candidate => <Link key={candidate.key} href={href(workFields(candidate))}>{candidate.title}<span>{workKind(candidate.kind)} ↗</span></Link>)}</div></section>}
    <Sources items={work.sources} title="查看作品来源">{work.imageCaveat && <p className="image-caveat">{work.imageCaveat}</p>}</Sources>
  </div>;
}
