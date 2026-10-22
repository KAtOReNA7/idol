'use client';

import {useRef, type ReactNode} from 'react';
import type {SolMember, SolSource, SolViewProps, SolWork, SolWorkDetailProps} from '../../lib/idol/design-review/sol-review-types';
import type {TimelineDate, TimelineEvent} from '../../lib/idol/timeline/types';

const OFFICIAL_HOME = 'https://purplekiss.co.kr/';
const SPOTIFY_ARTIST = 'https://open.spotify.com/artist/62T5PGHWJ9sxP2SJq20IHq';
const KIND_LABELS: Record<SolWork['kind'], string> = {release: '正式发行', mv: 'MV', stage: '舞台'};
const EVENT_LABELS: Record<TimelineEvent['eventType'], string> = {
  member_join: '成员加入', member_departure: '成员离团', debut: '出道',
  release: '音乐发行', disband: '团体解散', agency_change: '所属变更',
  contract_end: '合约结束', rename: '名称变更', hiatus: '活动暂停',
  resume: '活动恢复', notice: '公告', other: '团体节点',
};
const STATUS_LABELS: Record<TimelineEvent['status'], string> = {
  confirmed: '已确认', announced: '已公布', planned: '计划中',
  postponed: '已延期', cancelled: '已取消', uncertain: '待确认',
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function dateText(date: string | null | undefined) {
  return date ? date.replaceAll('-', '.') : '日期未收录';
}

function ExactDate({date}: {date: TimelineDate | null}) {
  if (!date) return <>日期未收录</>;
  return <><time dateTime={date.value}>{dateText(date.value)}</time>{date.precision !== 'day' && <span className="date-precision">（精确到{date.precision === 'year' ? '年' : '月'}）</span>}</>;
}

function sourceDate(event: TimelineEvent) {
  return event.eventDate ?? event.announcementDate ?? event.plannedDate;
}

function eventDateLabel(event: TimelineEvent) {
  if (!event.eventDate) return event.announcementDate ? '公告日期 · 事件日期未收录' : event.plannedDate ? '计划日期 · 尚非实际发生日' : '日期未收录';
  return event.eventType === 'release' ? '音乐发行日期' : '事件发生日期';
}

function eventCategory(event: TimelineEvent) {
  if (event.eventType === 'member_join' || event.eventType === 'member_departure') return 'members';
  if (event.eventType === 'release' || event.releaseKey) return 'release';
  return 'organization';
}

function orderedEvents(events: readonly TimelineEvent[]) {
  return [...events].sort((a, b) => (sourceDate(a)?.value ?? '9999').localeCompare(sourceDate(b)?.value ?? '9999') || a.id.localeCompare(b.id));
}

function updateFilters(props: SolViewProps, fields: Parameters<SolViewProps['onFilter']>[0]) {
  props.onFilter({...props.route.fields, ...fields});
}

function workHref(props: SolViewProps, work: SolWork) {
  return work.kind === 'release'
    ? props.href({section: 'works', release: work.key})
    : props.href({section: 'works', format: work.kind, media: work.key});
}

function External({url, children}: {url: string; children: ReactNode}) {
  return <a href={url} target="_blank" rel="noopener noreferrer">{children} <Arrow /></a>;
}

function Sources({sources, title = '资料与图片来源', children}: {sources: SolSource[]; title?: string; children?: ReactNode}) {
  return <details className="source-details">
    <summary>{title}</summary>
    {sources.length ? sources.map((source, index) => <p key={`${source.url}-${index}`}><External url={source.url}>{source.label}</External></p>) : <p>暂未提供可打开的来源链接。</p>}
    {children}
  </details>;
}

function SectionHeading({index, title, children}: {index: string; title: string; children?: ReactNode}) {
  return <div className="section-heading"><div><p className="section-index">{index}</p><h2>{title}</h2></div>{children}</div>;
}

function EmptyState({title = '暂无记录', children}: {title?: string; children: ReactNode}) {
  return <div className="empty-state" role="status"><h2>{title}</h2>{children}</div>;
}

function MemberCard({member, index, ...props}: SolViewProps & {member: SolMember; index: number}) {
  const {Link, Picture} = props;
  return <Link className="member-card" href={props.href({section: 'members', member: member.id})} data-design-node={`member-card-${member.key}`} aria-label={`阅读${member.name}（${member.stageName}）的成员资料`}>
    <div className="member-number">{String(index + 1).padStart(2, '0')}</div>
    <figure><Picture src={member.image} alt={`${member.name} · ${member.stageName}`} /><figcaption>{member.imageCredit || '成员资料照片 · 来源见个人资料'}</figcaption></figure>
    <div className="member-label"><h3>{member.name}</h3><span>{member.stageName}</span><Arrow /></div>
  </Link>;
}

function Sleeve({work, ...props}: SolViewProps & {work: SolWork}) {
  const {Link, Picture} = props;
  return <Link className="sleeve" href={workHref(props, work)} data-design-node={`sleeve-${work.key}`} aria-label={`查看${work.title}发行详情`}>
    <div className="sleeve-art"><Picture src={work.image} alt={`${work.title} · 正式发行封面`} /></div>
    <span className="sleeve-date">{dateText(work.date)} · {work.dateLabel || '发行日期'}{work.subtype ? ` · ${work.subtype}` : ''}</span>
    <h3>{work.title}</h3><span className="sleeve-open">查看唱片 <Arrow /></span>
  </Link>;
}

function Header(props: SolViewProps) {
  const {Link, Picture, data, route} = props;
  const active = route.member ? 'members' : route.release || route.media ? 'works' : route.section;
  return <header data-design-node="purplekiss-site-header">
    <Link className="brand" href={props.href({section: 'overview'})} aria-label="PURPLE KISS 首页">
      {data.logo && <Picture src={data.logo} alt="PURPLE KISS 官方标志" />}
      <span>PURPLE KISS<span className="brand-sub">资料库</span></span>
    </Link>
    <nav aria-label="PURPLE KISS 页面">
      {([['overview', '首页'], ['members', '成员'], ['works', '作品'], ['updates', '时间轴']] as const).map(([section, label]) =>
        <Link key={section} href={props.href({section})} aria-current={active === section || section === 'overview' && !active ? 'page' : undefined}>{label}</Link>)}
    </nav>
    <a className="header-source" href={OFFICIAL_HOME} target="_blank" rel="noopener noreferrer">官方主页 <Arrow /></a>
  </header>;
}

function Footer({data}: Pick<SolViewProps, 'data'>) {
  return <footer data-design-node="purplekiss-footer">
    <div className="footer-brand">PURPLE KISS</div>
    <p>成员 · 作品 · 时间轴</p>
    <div className="footer-bottom"><span>团体音乐与成员历史资料 · {data.status}{data.statusDate ? ` · ${dateText(data.statusDate)}` : ''}</span>
      <External url={SPOTIFY_ARTIST}>Spotify</External><External url={OFFICIAL_HOME}>官方来源</External>
    </div>
  </footer>;
}

function Overview(props: SolViewProps) {
  const {data, Link, Picture} = props;
  const members = data.members.filter(member => !member.historical);
  const releases = data.works.filter(work => work.kind === 'release');
  const cabin = releases.find(work => work.title === 'Cabin Fever');
  const chosen = ['HEADWAY', 'BXX', 'Geekyland'].flatMap(title => {
    const work = releases.find(row => row.title.toLocaleLowerCase() === title.toLocaleLowerCase());
    return work ? [work] : [];
  });
  const events = orderedEvents(props.events);
  const storyPreview = [
    events.find(event => event.eventDate?.value === '2021-03-15'),
    events.find(event => event.eventDate?.value === '2023-02-15'),
    events.find(event => event.eventDate?.value === data.statusDate && event.eventType !== 'release'),
  ].filter((event): event is TimelineEvent => Boolean(event));
  return <>
    <section className="home-masthead" data-design-node="home-masthead">
      <div className="masthead-title"><h1>PURPLE KISS</h1><p>成员 · 作品<br />时间轴</p></div>
      <div className="hero-composition">
        <figure className="hero-photo"><Picture src={data.hero} alt="PURPLE KISS · 六人时期团体资料照" priority zoom /><figcaption>六人时期团体资料照 · 完整历史名册另含朴志殷</figcaption></figure>
        <aside className="hero-note"><div className="note-rule" /><h2>PURPLE<br /><em>KISS</em></h2>
          <p>成员资料与音乐作品</p>
          <Link className="text-link" href={props.href({section: 'works'})}>查看作品 <Arrow /></Link>
          <div className="archive-status"><span>2021 — 2025</span><p>{data.status}<br />{data.statusDate ? dateText(data.statusDate) : '结束日期未收录'}</p></div>
        </aside>
      </div>
    </section>
    <section className="record-feature paper" data-design-node="home-record-feature">
      <div className="feature-number">01 / 发行</div>
      <div className={`feature-content${cabin ? '' : 'feature-content-empty'}`}>
        <div className="feature-copy"><h2>发行</h2><p>正式发行与封面</p><Link className="text-link" href={props.href({section: 'works'})}>进入作品库 <Arrow /></Link></div>
        {cabin && <><Link className="feature-cover" href={workHref(props, cabin)} aria-label="查看 Cabin Fever 发行详情"><Picture src={cabin.image} alt="Cabin Fever 正式发行封面" /></Link>
          <div className="feature-detail"><p className="small-label">{dateText(cabin.date)} · {cabin.dateLabel} · {cabin.subtype}</p><h3>{cabin.title}</h3>{cabin.description && <p>{cabin.description}</p>}<Link className="underline-button" href={workHref(props, cabin)}>唱片详情 <Arrow /></Link></div></>}
      </div>
    </section>
    <section className="people-section wrap" data-design-node="home-members">
      <SectionHeading index="02 / 成员" title="成员"><Link className="text-link" href={props.href({section: 'members'})}>成员目录 <Arrow /></Link></SectionHeading>
      <div className="home-members">{members.map((member, index) => <MemberCard key={member.id} {...props} member={member} index={index} />)}</div>
      {!members.length && <EmptyState title="成员资料暂未载入。"><p>请查看成员目录。</p></EmptyState>}
      <p className="section-footnote">最后公开六人阵容 · 另含出道成员朴志殷的历史资料</p>
    </section>
    <section className="selected-records wrap" data-design-node="home-selected-records"><SectionHeading index="03 / 发行" title="发行" /><div className="selected-sleeves">{chosen.map(work => <Sleeve key={work.key} {...props} work={work} />)}</div>{!chosen.length && <p className="section-footnote">精选发行暂未载入，请前往作品库。</p>}</section>
    <section className="history-invitation paper" data-design-node="home-history-invitation">
      <div><p className="section-index">04 / 时间轴</p><h2>时间轴</h2></div>
      <div className="history-preview">{storyPreview.map(event => <div key={event.id}><ExactDate date={sourceDate(event)} /><p><Link href={props.href({section: 'updates', event: event.id})}>{event.title}</Link></p></div>)}
        <Link className="text-link" href={props.href({section: 'updates'})}>查看时间轴 <Arrow /></Link>
      </div>
    </section>
  </>;
}

function Members(props: SolViewProps) {
  const {data, Link, Picture} = props;
  const current = data.members.filter(member => !member.historical);
  const historic = data.members.filter(member => member.historical);
  return <>
    <section className="page-heading wrap" data-design-node="members-heading"><p className="section-index">成员</p><h1>成员目录<span>PURPLE KISS</span></h1><p className="page-intro">最后公开六人阵容与历史成员。<br />{data.status}{data.statusDate && ` · ${dateText(data.statusDate)}`}。</p></section>
    <section className="member-directory wrap" data-design-node="members-directory" aria-label="团体活动结束时阵容">{current.map((member, index) => <MemberCard key={member.id} {...props} member={member} index={index} />)}{!current.length && <EmptyState title="暂未收录这一部分成员资料。"><p>历史成员资料见下方。</p></EmptyState>}</section>
    {historic.map(member => <section key={member.id} className="historical-member paper" data-design-node={`members-historical-${member.key}`}>
      <div><p className="section-index">历史成员</p><h2>历史成员</h2><p>{member.profile || `${member.name} · 历史成员`}</p></div>
      <Link className="historic-card" href={props.href({section: 'members', member: member.id})}><Picture src={member.image} alt={`历史成员${member.name} · ${member.stageName}`} /><div><span>{member.period || '活动时期未收录'}</span><h3>{member.name}</h3><p>{member.stageName}</p><span>阅读个人资料 <Arrow /></span></div></Link>
    </section>)}
    {!data.members.length && <div className="wrap"><Link className="text-link" href={props.href({section: 'overview'})}>返回首页 <Arrow /></Link></div>}
  </>;
}

function MemberDetail({member, ...props}: SolViewProps & {member: SolMember}) {
  const {data, Link, Picture} = props;
  const index = data.members.findIndex(row => row.id === member.id);
  const previous = index > 0 ? data.members[index - 1] : null;
  const next = index < data.members.length - 1 ? data.members[index + 1] : null;
  const releases = data.works.filter(work => work.kind === 'release');
  // Period association only. These release cards never assert recording or MV participation.
  const related = member.historical
    ? releases.filter(work => Boolean(work.date && work.date >= '2021-03-15' && work.date <= '2022-11-18')).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')).slice(0, 3)
    : ['Cabin Fever', 'BXX', 'HEADWAY'].flatMap(title => {
      const work = releases.find(row => row.title.toLocaleLowerCase() === title.toLocaleLowerCase());
      return work ? [work] : [];
    });
  return <>
    <div className="member-breadcrumb wrap"><button type="button" className="member-back" onClick={props.onReturn}>← 返回成员目录</button><span>PURPLE KISS / {member.stageName}</span></div>
    <section className="member-detail wrap" data-design-node={`member-detail-${member.key}`}>
      <figure className="detail-portrait"><Picture src={member.image} alt={`${member.name} · ${member.stageName}`} priority zoom /><figcaption>{member.imageCredit || '成员资料照片 · 详见来源'}</figcaption></figure>
      <div className="member-story"><p className="section-index">{member.historical ? '历史成员' : `成员 / ${String(index + 1).padStart(2, '0')}`}</p><h1>{member.name}</h1><p className="member-stage">{member.stageName}</p><p className="member-role">{member.role || '职责未收录'} · {member.status || (member.historical ? '历史成员' : '最后公开阵容')}</p><div className="profile-rule" />
        <p className="member-bio">{member.profile || '人物简介暂未收录。'}</p>
        <dl><div><dt>出生日期</dt><dd>{dateText(member.birthDate)}</dd></div><div><dt>团体活动时期</dt><dd>{member.period || '活动时期未收录'}</dd></div>{member.koreanName && <div><dt>韩文姓名</dt><dd>{member.koreanName}</dd></div>}<div><dt>资料范围</dt><dd>{member.historical ? '离团前的历史资料' : '团体官方活动结束时的历史资料'}</dd></div></dl>
        <Sources sources={member.sources}><p>人物与图片来源各自支持所标注的信息；不从团体作品推断个人出镜。</p><p>下方团体发行按活动时期关联，不据此推断个人录制、演出或 MV 出镜。</p></Sources>
        <div className="member-actions"><button type="button" className="record-action" onClick={() => props.onMemberAction(member)}>打开我的成员记录 <Arrow /></button><Link className="text-link" href={props.href({section: 'updates'})}>查看时间轴 <Arrow /></Link></div>
      </div>
    </section>
    <nav className="member-pagination wrap" aria-label="相邻成员">
      {previous ? <Link href={props.href({section: 'members', member: previous.id})}><span>← 上一位</span><strong>{previous.name} · {previous.stageName}</strong></Link> : <span className="pagination-end">已是第一位成员</span>}
      {next ? <Link href={props.href({section: 'members', member: next.id})}><span>下一位 →</span><strong>{next.name} · {next.stageName}</strong></Link> : <span className="pagination-end">已是最后一位成员</span>}
    </nav>
    <section className="member-records paper" data-design-node="member-group-records">
      <SectionHeading index="PURPLE KISS" title="团体作品"><Link className="text-link" href={props.href({section: 'works'})}>全部作品 <Arrow /></Link></SectionHeading>
      <div className="selected-sleeves">{related.map(work => <Sleeve key={work.key} {...props} work={work} />)}</div>
      {!related.length && <p>暂未收录可关联的团体发行。</p>}
      <p className="section-footnote">团体活动时期的发行</p>
    </section>
    <section className="other-voices wrap" data-design-node="member-other-voices"><h2>其他成员</h2><div>{data.members.filter(row => row.id !== member.id).map(row => <Link key={row.id} href={props.href({section: 'members', member: row.id})}>{row.name}<span>{row.stageName}{row.historical ? ' · 历史成员' : ''}</span><Arrow /></Link>)}</div></section>
  </>;
}

function Works(props: SolViewProps) {
  const {data, route, Link, Picture} = props;
  const query = route.query.trim().toLocaleLowerCase();
  const filtered = data.works.filter(work => work.kind === route.format && (!query || [work.title, work.subtype, work.date ?? '', work.description].join(' ').toLocaleLowerCase().includes(query)));
  const rows = [...filtered].sort((a, b) => {
    if (!a.date || !b.date) return a.date ? -1 : b.date ? 1 : a.key.localeCompare(b.key);
    return (route.sort === 'oldest' ? 1 : -1) * a.date.localeCompare(b.date) || a.key.localeCompare(b.key);
  });
  return <>
    <section className="page-heading wrap works-title" data-design-node="works-heading"><p className="section-index">作品</p><h1>作品库<span>PURPLE KISS</span></h1><p className="page-intro">正式发行 · MV · 舞台</p></section>
    <section className="works-controls wrap" data-design-node="works-controls" aria-label="筛选作品">
      <div className="type-tabs" role="group" aria-label="作品类别">{(['release', 'mv', 'stage'] as const).map(kind => <button key={kind} type="button" aria-pressed={route.format === kind} onClick={() => updateFilters(props, {section: 'works', format: kind, release: null, media: null})}>{kind === 'release' ? '发行' : KIND_LABELS[kind]} <span>{data.works.filter(work => work.kind === kind).length}</span></button>)}</div>
      <div className="work-filter-fields"><label className="search-label"><span>搜索作品</span><input type="search" placeholder="作品名、类别或年份" value={route.query} maxLength={200} autoComplete="off" onChange={event => updateFilters(props, {section: 'works', q: event.target.value || null, release: null, media: null})} /></label>
        <label className="work-sort"><span>日期排序</span><select value={route.sort} onChange={event => updateFilters(props, {section: 'works', sort: event.target.value, release: null, media: null})}><option value="newest">最新优先</option><option value="oldest">最早优先</option></select></label>
      </div>
    </section>
    <section className="works-results wrap" data-design-node="works-results">
      <p className="result-meta" role="status" aria-live="polite">{KIND_LABELS[route.format]} · {rows.length} 项 · {route.sort === 'oldest' ? '最早优先' : '最新优先'}</p>
      <div className={route.format === 'release' ? 'sleeve-grid' : 'video-list'}>{rows.length ? rows.map((work, index) => work.kind === 'release' ? <Sleeve key={work.key} {...props} work={work} /> :
        <Link className="video-row" key={work.key} href={workHref(props, work)} data-design-node={`video-${work.key}`} aria-label={`查看 ${work.title} ${KIND_LABELS[work.kind]}详情`}>
          <span className="video-index">{String(index + 1).padStart(2, '0')}</span>
          <figure><Picture src={work.image} alt={`${work.title} · ${KIND_LABELS[work.kind]}缩略预览`} /></figure>
          <div><span className="small-label">{work.subtype || KIND_LABELS[work.kind]}</span><h3>{work.title}</h3><span className="video-date-kind">{work.dateLabel || '来源标注日期'}</span><time dateTime={work.date ?? undefined}>{dateText(work.date)}</time></div>
          <span className="video-link">查看影像 <Arrow /></span>
        </Link>) : <EmptyState><p>{query ? '试试其他作品名、年份，或清空搜索。' : `暂无${KIND_LABELS[route.format]}记录。`}</p>{query && <button type="button" className="underline-button" onClick={() => updateFilters(props, {section: 'works', q: null})}>清空搜索</button>}<Link className="underline-button" href={props.href({section: 'works', format: 'release'})}>查看正式发行 <Arrow /></Link></EmptyState>}
      </div>
    </section>
    <aside className="works-boundary wrap"><details className="source-details"><summary>日期与图片说明</summary><p>日期按各条记录标注的含义展示。Bugs 上架日期仅表示音乐平台上架，并非 MV 首发日。</p><p>224 px 级平台预览用于辨认作品，保留原图比例；完整影像从详情中的来源链接打开。</p></details></aside>
  </>;
}

function EventSources({event}: {event: TimelineEvent}) {
  return <details className="source-details"><summary>展开来源与日期说明</summary>
    <p>日期含义：{eventDateLabel(event)}。</p>
    {event.summary && <p>{event.summary}</p>}
    {event.scopeNote && <p>{event.scopeNote}</p>}
    {event.announcementDate && <p>公告日期：<ExactDate date={event.announcementDate} /></p>}
    {event.plannedDate && <p>计划日期：<ExactDate date={event.plannedDate} />。计划日期与实际发生日期分别保留。</p>}
    {event.sources.map(source => <div className="event-source" key={source.id}><p><External url={source.url}>{source.publisher} · {source.title}</External></p>
      {source.sourcePublishedAt && <p>来源发布日期：<ExactDate date={source.sourcePublishedAt} /></p>}
      {source.scopeNote && <p>{source.scopeNote}</p>}
      <p>来源核验日期：{dateText(source.checkedAt)}</p>
    </div>)}
    {!event.sources.length && <p>暂未收录可打开的来源链接。</p>}
  </details>;
}

function Timeline(props: SolViewProps) {
  const {route, Link} = props;
  const all = orderedEvents(props.events);
  const years = [...new Set(all.flatMap(event => sourceDate(event)?.value.slice(0, 4) ?? []))];
  const selected = all.find(event => event.id === route.event);
  const rows = selected ? [selected] : all.filter(event => (!route.year || route.year === 'all' || sourceDate(event)?.value.startsWith(route.year)) && (route.timelineType === 'all' || !route.timelineType || eventCategory(event) === route.timelineType));
  const index = selected ? all.findIndex(event => event.id === selected.id) : -1;
  const eventLink = (event: TimelineEvent) => props.href({section: 'updates', event: event.id});
  return <>
    <section className="page-heading wrap" data-design-node="timeline-heading"><p className="section-index">时间轴</p><h1>时间轴<span>PURPLE KISS</span></h1><p className="page-intro">出道先行作品至官方团体活动结束。<br />发行 · 成员 · 团体</p></section>
    <section className="timeline-layout wrap" data-design-node="timeline-layout">
      <aside className="timeline-sidebar"><p className="section-index">{years.length ? `${years[0]} — ${years[years.length - 1]}` : '时间轴'}</p><h2>时间轴</h2>
        <label>年份<select value={route.year || 'all'} onChange={event => updateFilters(props, {section: 'updates', year: event.target.value === 'all' ? null : event.target.value, event: null})}><option value="all">全部年份</option>{years.map(year => <option value={year} key={year}>{year}年</option>)}</select></label>
        <label>事件类型<select value={route.timelineType || 'all'} onChange={event => updateFilters(props, {section: 'updates', timelineType: event.target.value, event: null})}><option value="all">全部事件</option><option value="release">发行</option><option value="members">成员</option><option value="organization">团体</option></select></label>
        <nav className="year-navigation" aria-label="时间轴年份导航"><Link href={props.href({section: 'updates'})} aria-current={!route.year && !route.event ? 'page' : undefined}>全部年份</Link>{years.map(year => <Link key={year} href={props.href({section: 'updates', year})} aria-current={route.year === year ? 'page' : undefined}>{year}</Link>)}</nav>
        <p>事件记录<br />最早优先 · 共 {all.length} 条</p>
      </aside>
      <div className="single-timeline">
        {props.timelineLoading && <p className="timeline-message" role="status">正在读取时间轴资料…</p>}
        {props.timelineError && <div className="timeline-message" role="alert"><p>{props.timelineError}</p><button type="button" className="underline-button" onClick={props.onTimelineRetry}>重试读取时间轴</button></div>}
        <p className="result-count" role="status" aria-live="polite">{selected ? '正在阅读单条事件' : `${rows.length} 条记录`} · 最早优先{all.length ? ` · 完整资料共 ${all.length} 条` : ''}</p>
        {selected && <div className="selected-event-navigation"><Link className="text-link" href={props.href({section: 'updates'})}>← 返回完整时间轴</Link><p>查看相邻事件</p></div>}
        {route.event && !selected && !props.timelineLoading && <div className="timeline-message" role="status"><p>没有找到这条事件。以下展示当前可用的时间轴记录。</p><Link className="underline-button" href={props.href({section: 'updates'})}>查看完整时间轴</Link></div>}
        {rows.map((event, eventIndex) => {
          const relatedFields = props.timelineFields?.(event);
          const relatedWork = relatedFields?.release ? props.data.works.find(work => work.kind === 'release' && work.key === relatedFields.release) : undefined;
          const Picture = props.Picture;
          const year = sourceDate(event)?.value.slice(0, 4);
          const previousYear = eventIndex > 0 ? sourceDate(rows[eventIndex - 1])?.value.slice(0, 4) : null;
          return <div className="timeline-entry" key={event.id}>{year && year !== previousYear && <h2 className="timeline-year-heading" id={`timeline-year-${year}`} tabIndex={-1}>{year}</h2>}<article id={event.id} tabIndex={-1} data-timeline-event={event.id} className={`timeline-event${selected?.id === event.id ? ' is-selected' : ''}`} key={event.id} data-date={sourceDate(event)?.value} data-design-node={`event-${event.id}`}>
            <div className="timeline-dot" aria-hidden="true" /><div className="event-date"><ExactDate date={sourceDate(event)} /><span>{eventDateLabel(event)}</span></div>
            <div className="event-copy"><p className="small-label">{EVENT_LABELS[event.eventType]} · {STATUS_LABELS[event.status]}</p><h2><Link href={eventLink(event)} aria-current={selected?.id === event.id ? 'page' : undefined}>{event.title}</Link></h2>
              {event.reviewStatus === 'hold' && <p className="event-caution">本条仍有待核验的信息；请结合来源范围阅读。</p>}
              {relatedFields && <Link className="underline-button" href={props.href(relatedFields)}>查看关联作品 <Arrow /></Link>}
              <EventSources event={event} />
              {event.relatedEventIds.length > 0 && <div className="related-event-links">{event.relatedEventIds.flatMap(id => { const related = all.find(row => row.id === id); return related ? [<Link key={id} href={eventLink(related)}>关联事件：{related.title} <Arrow /></Link>] : []; })}</div>}
            </div>{relatedWork?.image && <Picture src={relatedWork.image} alt={`${relatedWork.title}正式发行封面`} className="event-cover" />}
          </article></div>;
        })}
        {!rows.length && !props.timelineLoading && !props.timelineError && <EmptyState title="这个筛选下暂无记录。"><p>可切换年份或事件类型。</p><Link className="underline-button" href={props.href({section: 'updates'})}>重置筛选，查看全部事件 <Arrow /></Link></EmptyState>}
        {selected && <nav className="event-pagination" aria-label="相邻时间轴事件">{index > 0 ? <Link href={eventLink(all[index - 1])}>← 上一条<span>{all[index - 1].title}</span></Link> : <span className="pagination-end">已是最早一条</span>}{index < all.length - 1 ? <Link href={eventLink(all[index + 1])}>下一条 →<span>{all[index + 1].title}</span></Link> : <span className="pagination-end">已是最后一条</span>}</nav>}
      </div>
    </section>
  </>;
}

function NotFound(props: SolViewProps) {
  const {Link} = props;
  return <section className="page-heading wrap"><p className="section-index">资料库</p><h1>未找到资料</h1><p className="page-intro">当前目录中没有这条记录。</p><Link className="text-link" href={props.href({section: 'overview'})}>返回首页 <Arrow /></Link></section>;
}

/** Independent source composition. Routing, safe data and dialogs stay with the host. */
export function PurplekissVisualView(props: SolViewProps) {
  const mainRef = useRef<HTMLElement>(null);
  const member = props.route.member ? props.data.members.find(row => row.id === props.route.member || row.key === props.route.member) : null;
  const page = props.route.release || props.route.media ? 'works' : props.route.member ? 'member' : props.route.section || 'overview';
  return <div className="purplekiss-source-view" data-design="purplekiss-v1">
    <a className="skip" href="#purplekiss-review-main" onClick={event => {event.preventDefault(); mainRef.current?.focus({preventScroll: true}); mainRef.current?.scrollIntoView({block: 'start'});}}>跳到正文</a><Header {...props} />
    <main ref={mainRef} id="purplekiss-review-main" tabIndex={-1}>{!props.route.valid ? <NotFound {...props} /> : page === 'member' ? member ? <MemberDetail {...props} member={member} /> : <NotFound {...props} /> : page === 'members' ? <Members {...props} /> : page === 'works' ? <Works {...props} /> : page === 'updates' ? <Timeline {...props} /> : page === 'overview' ? <Overview {...props} /> : <NotFound {...props} />}</main>
    <Footer data={props.data} />
  </div>;
}

/** Content for the host's native dialog; no nested dialog or parallel score editor. */
export function PurplekissWorkDetail(props: SolWorkDetailProps) {
  const {work, data, Link, Picture} = props;
  const video = work.kind !== 'release';
  const sameKind = data.works.filter(row => row.kind === work.kind).sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.key.localeCompare(b.key));
  const index = sameKind.findIndex(row => row.key === work.key);
  const previous = index > 0 ? sameKind[index - 1] : null;
  const next = index >= 0 && index < sameKind.length - 1 ? sameKind[index + 1] : null;
  const versions = video ? data.works.filter(row => row.kind === work.kind && row.key !== work.key && row.title === work.title) : [];
  return <div className="purplekiss-work-detail">
    <div className="member-breadcrumb wrap"><button type="button" className="work-back" onClick={props.onReturn}>← 返回作品库</button><span>PURPLE KISS / {KIND_LABELS[work.kind]}</span></div>
    <section className="work-detail wrap" data-design-node={`work-detail-${work.key}`}>
      <div className={`work-stage ${video ? 'work-video-stage' : 'work-release-stage'}`}><p className="section-index">{KIND_LABELS[work.kind]}</p>
        <figure className={`work-art${video ? ' native-preview' : ''}`}><Picture src={work.image} alt={`${work.title} · ${video ? '影像缩略预览' : '正式发行封面'}`} zoom={!video} /><figcaption>{work.imageCredit || (video ? '影像来源预览图' : '正式发行封面')}</figcaption></figure>
        {video && work.url && <External url={work.url}>打开影像来源</External>}
      </div>
      <aside className="work-program paper"><p className="section-index">{KIND_LABELS[work.kind]} / {work.subtype || KIND_LABELS[work.kind]}</p><h2 id="work-dialog-title">{work.title}</h2><p className="work-language">{work.subtype || KIND_LABELS[work.kind]}</p><div className="profile-rule" />
        <dl><div><dt>{work.dateLabel || (video ? '来源标注日期' : '发行日期')}</dt><dd><time dateTime={work.date ?? undefined}>{dateText(work.date)}</time></dd></div><div><dt>类别</dt><dd>{KIND_LABELS[work.kind]}</dd></div></dl>
        {work.description && <p>{work.description}</p>}
        {work.tracks.length > 0 && <section className="work-tracklist" aria-label="收录曲目"><h3>曲目</h3><ol>{work.tracks.map((track, trackIndex) => <li key={`${trackIndex}-${track}`}>{track}</li>)}</ol></section>}
        <div className="work-official">{work.url && <External url={work.url}>{video ? '打开影像来源' : '在来源平台聆听'}</External>}</div>
        {video && <div className="work-actions">{work.actionable ? <><button type="button" className="record-action" onClick={() => props.onMediaAction(work, 'play')}>播放影像 <Arrow /></button><button type="button" className="record-action" onClick={() => props.onMediaAction(work, 'records')}>打开我的观看与评分记录 <Arrow /></button></> : <p className="action-unavailable" role="status">此影像暂未关联个人记录。</p>}</div>}
        <Sources sources={work.sources} title="作品与图片来源"><p>{work.dateLabel || '日期按来源标注保留'}。来源日期、音乐发行与 MV 公开日期分别处理。</p>{work.kind === 'mv' && <p className="work-date-note">若标注为 Bugs 上架日期，仅表示音乐平台上架；不将它视为 MV 首发日期。</p>}{video && <p>224 px 级缩略预览，保留原比例。</p>}{work.imageCaveat && <p>{work.imageCaveat}</p>}</Sources>
      </aside>
    </section>
    {versions.length > 0 && <section className="work-related wrap"><h2>其他版本</h2>{versions.map(row => <Link key={row.key} href={workHref(props, row)}>{row.title} · {row.subtype || KIND_LABELS[row.kind]} <Arrow /></Link>)}</section>}
    <nav className="work-pagination wrap" aria-label="相邻作品">{previous ? <Link href={workHref(props, previous)}>← 上一项<span>{previous.title}</span></Link> : <span className="pagination-end">已是此类别最早一项</span>}{next ? <Link href={workHref(props, next)}>下一项 →<span>{next.title}</span></Link> : <span className="pagination-end">已是此类别最后一项</span>}</nav>
    <section className="work-footer wrap"><button type="button" className="text-link work-back" onClick={props.onReturn}>返回作品库 <Arrow /></button><Link className="text-link" href={props.href({section: 'updates'})}>查看时间轴 <Arrow /></Link></section>
  </div>;
}
