'use client';

import {useEffect, useId, useRef, useState, type Dispatch, type SetStateAction} from 'react';
import {defaultInsightsViewState, type InsightsViewState} from '../../lib/idol/personal-insights/view-state';
import type {CatalogView, Member, Work} from '../../lib/idol/types';
import {analyzeCatalog} from '../../lib/idol/personal-insights';
import './personal-insights.css';

export interface PersonalInsightsProps {
  catalog: Readonly<CatalogView>;
  memberLabel: (member: Readonly<Member>) => string;
  isStageScoreEligible?: (work: Readonly<Work>) => boolean;
  onGroup?: (id: string) => void;
  onMember?: (id: string) => void;
  onWork?: (id: string, intent?: {video: 'mv' | 'stage'}) => void;
  viewState?: InsightsViewState;
  onViewStateChange?: Dispatch<SetStateAction<InsightsViewState>>;
  disabled?: boolean;
}

type InsightModel = ReturnType<typeof analyzeCatalog>;
type ScoreStats = InsightModel['mv'];
type GroupRow = InsightModel['mvGroups'][number];
type MemberRow = InsightModel['members']['rows'][number];
type RevisitRow = InsightModel['mvRevisit']['highRated'][number];
type ScoreDomain = 'mv' | 'stage';
type GroupSort = 'mean' | 'samples' | 'high';
type MemberMetric = 'performance' | 'styling';
type RevisitKind = 'high-score' | 'watched-unrated';
type FocusSection = 'groups' | 'members' | 'revisit' | 'trace' | 'member-return';

const numberFormat = new Intl.NumberFormat('zh-CN', {maximumFractionDigits: 2});
function count(value: number): string { return numberFormat.format(value); }
function score(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '—' : numberFormat.format(value);
}
function ratio(numerator: number, denominator: number): string {
  return denominator > 0 ? numberFormat.format(numerator / denominator * 100) + '%' : '—';
}
function meanOrder(a: number | null, b: number | null): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return b - a;
}

function usePage<T>(items: readonly T[], pageSize: number, requestedPage: number, setRequestedPage: (page: number) => void) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  // Refreshes can mutate Catalog in place. Clamp the rendered slice immediately.
  useEffect(() => {
    if (requestedPage !== page) setRequestedPage(page);
  }, [requestedPage, page]);
  return {
    page, pageCount, total: items.length,
    rows: items.slice((page - 1) * pageSize, page * pageSize),
    setPage: setRequestedPage,
    reset: () => setRequestedPage(1),
  };
}

function Pager({label, page, pageCount, total, pageSize, disabled, onPage}: {
  label: string; page: number; pageCount: number; total: number; pageSize: number;
  disabled: boolean; onPage: (page: number) => void;
}) {
  if (total === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return <nav className="pi-pagination" aria-label={label + '分页'}>
    <p role="status" aria-live="polite" aria-atomic="true">
      第 {count(page)} / {count(pageCount)} 页
      <span> · 显示 {count(first)}–{count(last)} / {count(total)} 项</span>
    </p>
    <div className="pi-pagination-actions">
      <button type="button" className="pi-button" disabled={disabled || page <= 1}
        aria-label={label + '上一页'}
        onClick={() => { if (!disabled && page > 1) onPage(page - 1); }}>
        上一页
      </button>
      <button type="button" className="pi-button" disabled={disabled || page >= pageCount}
        aria-label={label + '下一页'}
        onClick={() => { if (!disabled && page < pageCount) onPage(page + 1); }}>
        下一页
      </button>
    </div>
  </nav>;
}

function ScoreSummary({stats, domainLabel}: {stats: ScoreStats; domainLabel: string}) {
  return <>
    <dl className="pi-summary">
      <div><dt>已评分作品</dt><dd>{count(stats.ratedCount)}</dd></div>
      <div><dt>{domainLabel} 均分</dt><dd>{score(stats.mean)}</dd></div>
      <div>
        <dt>高分作品 · 9 分起</dt><dd>{count(stats.highCount)}</dd>
        <small>占已评分作品 {ratio(stats.highCount, stats.ratedCount)}</small>
      </div>
      <div><dt>可比较作品</dt><dd>{count(stats.eligibleCount)}</dd></div>
    </dl>
    <p className="pi-caption">
      未填写评分 {count(stats.missingCount)} 部
      {stats.invalidCount > 0 && <> · 未计入的无效评分 {count(stats.invalidCount)} 条</>}
      。
    </p>

  </>;
}

function Histogram({stats, domainLabel}: {stats: ScoreStats; domainLabel: string}) {
  const bins = Array.from({length: 11}, (_, index) => stats.bins[index] ?? 0);
  const maximum = Math.max(0, ...bins);
  const label = (index: number) => index === 10 ? '10 分' : index + ' 分至不足 ' + (index + 1) + ' 分';
  return <div className="pi-histogram">
    <ol className="pi-histogram-bars" aria-label={domainLabel + '评分分布'}>
      {bins.map((value, index) => <li key={index} aria-label={label(index) + '：' + count(value) + ' 部'}>
        <span className="pi-bin-count">{count(value)}</span>
        <span className="pi-bin-track" aria-hidden="true">
          <span className="pi-bin-fill" style={{height: (maximum > 0 ? value / maximum * 100 : 0) + '%'}}/>
        </span>
        <span className="pi-bin-label" aria-hidden="true">{index}</span>
      </li>)}
    </ol>

    <details className="pi-histogram-data">
      <summary>查看评分分布与口径</summary>
      <p>0 分属于有效评分，不计作未填写。0–9 每格从该整数分起，至下一整数分之前；10 分单独统计。</p>
      <div className="pi-table-wrap">
        <table className="pi-table">
          <caption>{domainLabel}评分分布，共 {count(stats.ratedCount)} 部已评分作品</caption>
          <thead><tr><th scope="col">评分区间</th><th scope="col" className="pi-numeric">作品数</th></tr></thead>
          <tbody>{bins.map((value, index) => <tr key={index}>
            <th scope="row">{label(index)}</th><td className="pi-numeric">{count(value)}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  </div>;
}

export function PersonalInsights({
  catalog, memberLabel, isStageScoreEligible, onGroup, onMember, onWork, disabled = false, viewState, onViewStateChange,
}: PersonalInsightsProps) {
  // Object identity is not a freshness signal: recompute on every render.
  const model = analyzeCatalog(catalog, {isStageScoreEligible});
  const instanceId = useId();
  const [localViewState, setLocalViewState] = useState(defaultInsightsViewState);
  const state = viewState ?? localViewState;
  const setState = onViewStateChange ?? setLocalViewState;
  const {domain, groupSort, memberMetric, revisitKind, pageSize, selectedMemberId} = state;
  const setField = <K extends keyof InsightsViewState>(key: K, value: InsightsViewState[K]) =>
    setState(previous => ({...previous, [key]: value}));
  const setDomain = (value: ScoreDomain) => setField('domain', value);
  const setGroupSort = (value: GroupSort) => setField('groupSort', value);
  const setMemberMetric = (value: MemberMetric) => setField('memberMetric', value);
  const setRevisitKind = (value: RevisitKind) => setField('revisitKind', value);
  const setPageSize = (value: 10 | 20) => setField('pageSize', value);
  const setSelectedMemberId = (value: string | null) => setField('selectedMemberId', value);
  const groupsHeading = useRef<HTMLHeadingElement>(null);
  const membersHeading = useRef<HTMLHeadingElement>(null);
  const revisitHeading = useRef<HTMLHeadingElement>(null);
  const traceHeading = useRef<HTMLHeadingElement>(null);
  const traceTrigger = useRef<HTMLButtonElement | null>(null);
  const pendingFocus = useRef<FocusSection | null>(null);
  const domainLabel = domain === 'mv' ? 'MV' : '舞台';
  const stats = domain === 'mv' ? model.mv : model.stage;
  const hasWorkAnalysis = domain === 'mv' || typeof isStageScoreEligible === 'function';
  const groupOrder = new Map<string, number>();
  const memberOrder = new Map<string, number>();
  const membersById = new Map<string, Member>();
  const worksById = new Map<string, Work>();
  catalog.groups.forEach((group, index) => {
    if (!groupOrder.has(group.id)) groupOrder.set(group.id, index);
  });
  catalog.members.forEach((member, index) => {
    if (!memberOrder.has(member.id)) memberOrder.set(member.id, index);
    if (!membersById.has(member.id)) membersById.set(member.id, member);
  });
  catalog.works.forEach(work => {
    if (!worksById.has(work.id)) worksById.set(work.id, work);
  });

  const groupRows = [...(domain === 'mv' ? model.mvGroups : model.stageGroups)]
    .map((row, index) => ({row, index}))
    .sort((a, b) => {
      let comparison = 0;
      if (groupSort === 'mean') comparison = meanOrder(a.row.stats.mean, b.row.stats.mean);
      if (groupSort === 'samples') comparison = b.row.stats.ratedCount - a.row.stats.ratedCount;
      if (groupSort === 'high') comparison = b.row.stats.highCount - a.row.stats.highCount;
      return comparison
        || (groupOrder.get(a.row.groupId) ?? Number.MAX_SAFE_INTEGER)
          - (groupOrder.get(b.row.groupId) ?? Number.MAX_SAFE_INTEGER)
        || a.index - b.index;
    }).map(({row}) => row);
  const memberRows = [...model.members.rows].map((row, index) => ({row, index}))
    .sort((a, b) => meanOrder(a.row[memberMetric].mean, b.row[memberMetric].mean)
      || (memberOrder.get(a.row.memberId) ?? Number.MAX_SAFE_INTEGER)
        - (memberOrder.get(b.row.memberId) ?? Number.MAX_SAFE_INTEGER)
      || a.index - b.index).map(({row}) => row);

  // Watching is an MV observation, not an inferred stage viewing record.
  const revisitRows: readonly RevisitRow[] = revisitKind === 'watched-unrated'
    ? model.mvRevisit.watchedUnrated
    : domain === 'mv' ? model.mvRevisit.highRated : model.stageRevisit.highRated;
  const selectedMember: MemberRow | undefined = selectedMemberId === null ? undefined
    : model.members.rows.find(row => row.memberId === selectedMemberId);
  const selectedMemberRecord = selectedMember ? membersById.get(selectedMember.memberId) : undefined;
  const selectedMemberLabel = selectedMemberRecord ? memberLabel(selectedMemberRecord) : '成员资料暂不可用';
  const traceWorks = selectedMember
    ? selectedMember.workIds.map(workId => ({workId, work: worksById.get(workId)}))
    : [];
  const groupsPage = usePage<GroupRow>(groupRows, pageSize, state.groupsPage, page => setField('groupsPage', page));
  const membersPage = usePage<MemberRow>(memberRows, pageSize, state.membersPage, page => setField('membersPage', page));
  const revisitPage = usePage<RevisitRow>(revisitRows, pageSize, state.revisitPage, page => setField('revisitPage', page));
  const tracePage = usePage(traceWorks, 20, state.tracePage, page => setField('tracePage', page));

  useEffect(() => {
    if (selectedMemberId !== null && !selectedMember) setSelectedMemberId(null);
  }, [selectedMemberId, selectedMember]);

  // Focus changes only follow explicit paging/disclosure actions, never refresh.
  useEffect(() => {
    const section = pendingFocus.current;
    if (section === null) return;
    pendingFocus.current = null;
    const target = section === 'groups' ? groupsHeading.current
      : section === 'members' ? membersHeading.current
        : section === 'revisit' ? revisitHeading.current
          : section === 'trace' ? traceHeading.current
            : traceTrigger.current?.isConnected ? traceTrigger.current : membersHeading.current;
    if (target?.isConnected) target.focus({preventScroll: true});
  });
  function resetAllPages() {
    groupsPage.reset(); membersPage.reset(); revisitPage.reset(); tracePage.reset();
  }
  const watchingRows = [
    {key: 'watched', label: '已观看', value: model.watching.watched},
    {key: 'unwatched', label: '未观看', value: model.watching.unwatched},
    {key: 'unmarked', label: '未标记', value: model.watching.unmarked},
    {key: 'unknown', label: '其他观看状态', value: model.watching.unknown},
  ] as const;
  const revisitTitle = revisitKind === 'watched-unrated' ? 'MV 已看待评' : domainLabel + ' 高分重温';
  const excludedMembers = model.members.excluded;
  const unclearMemberRelations = excludedMembers.ambiguousRelations
    + excludedMembers.missingRelations + excludedMembers.unlinkedRatings;
  const hasExcludedMemberRecords = unclearMemberRelations > 0
    || excludedMembers.emptyScores > 0 || excludedMembers.invalidScores > 0;

  return <section className="pi-insights" aria-labelledby={instanceId + '-title'}>
    <header className="pi-header">
      <div>
        <p className="pi-eyebrow">我的偏好</p>
        <h2 id={instanceId + '-title'}>从评分里看看喜欢什么</h2>
        <p className="pi-intro">已收录 {count(model.uniqueWorkCount)} 部作品。作品评分、观看记录和成员评分分别统计。</p>
      </div>
      <label className="pi-field"><span>列表每页</span>
        <select value={pageSize} disabled={disabled} onChange={event => {
          if (disabled) return;
          const value = Number(event.target.value);
          if (value !== 10 && value !== 20) return;
          setPageSize(value); resetAllPages(); setSelectedMemberId(null);
        }}>
          <option value={10}>10 项</option><option value={20}>20 项</option>
        </select>
      </label>
    </header>

    <section className="pi-panel" aria-labelledby={instanceId + '-watching'}>
      <div className="pi-section-heading"><div>
        <h3 id={instanceId + '-watching'}>MV 观看记录</h3>
        <p>以下四类均以 {count(model.watching.total)} 部作品为分母。</p>
      </div></div>
      <dl className="pi-watching">{watchingRows.map(row => <div key={row.key}>
        <dt>{row.label}</dt><dd>{count(row.value)} <small>部</small></dd>
        <span>{ratio(row.value, model.watching.total)}</span>
      </div>)}</dl>
      {model.watching.total === 0 && <p className="pi-caption">暂时没有可统计的 MV 观看记录。</p>}
    </section>

    <section className="pi-panel" aria-labelledby={instanceId + '-scores'}>
      <div className="pi-section-heading">
        <div><h3 id={instanceId + '-scores'}>作品评分</h3><p>MV 与舞台分别计算，不混合均分。</p></div>
        <fieldset className="pi-domain" disabled={disabled}><legend>评分范围</legend>
          {(['mv', 'stage'] as const).map(value => <label key={value}>
            <input type="radio" data-insights-focus={value === domain ? 'fallback' : undefined} name={instanceId + '-domain'} value={value} checked={domain === value}
              onChange={() => {
                if (disabled) return;
                setDomain(value); resetAllPages(); setSelectedMemberId(null);
              }}/>
            <span>{value === 'mv' ? 'MV' : '舞台'}</span>
          </label>)}
        </fieldset>
      </div>
      {hasWorkAnalysis ? <>
        <ScoreSummary stats={stats} domainLabel={domainLabel}/>
        <h4 className="pi-subheading">{domainLabel} 评分分布</h4>
        <Histogram stats={stats} domainLabel={domainLabel}/>
      </> : <div className="pi-empty">
        <h4>暂时没有可比较的舞台评分</h4><p>MV 评分与观看记录仍可在对应范围查看。</p>
      </div>}
    </section>

    {hasWorkAnalysis && <section className="pi-panel" aria-labelledby={instanceId + '-groups'}>
      <div className="pi-section-heading">
        <div>
          <h3 id={instanceId + '-groups'} ref={groupsHeading} tabIndex={-1} className="pi-focus-target">团体比较 · {domainLabel}</h3>

        </div>
        <label className="pi-field"><span>排序</span>
          <select value={groupSort} disabled={disabled} onChange={event => {
            if (disabled) return;
            const value = event.target.value;
            if (value !== 'mean' && value !== 'samples' && value !== 'high') return;
            setGroupSort(value); groupsPage.reset();
          }}>
            <option value="mean">均分高到低</option>
            <option value="samples">评分样本多到少</option>
            <option value="high">高分作品多到少</option>
          </select>
        </label>
      </div>
      {groupRows.length > 0 ? <>
        <div className="pi-table-wrap" role="region" aria-label={domainLabel + '团体比较表，可横向滚动'} tabIndex={0}>
          <table className="pi-table pi-group-table">
            <caption>团体的 {domainLabel} 评分，当前页 {count(groupsPage.rows.length)} 项</caption>
            <thead><tr>
              <th scope="col">团体</th><th scope="col" className="pi-numeric">作品数</th>
              <th scope="col" className="pi-numeric">评分样本</th><th scope="col" className="pi-numeric">均分</th>
              <th scope="col" className="pi-numeric">9 分起</th><th scope="col" className="pi-numeric">高分占比</th>
            </tr></thead>
            <tbody>{groupsPage.rows.map(row => <tr key={row.groupId}>
              <th scope="row">{onGroup
                ? <button type="button" className="pi-text-button" disabled={disabled}
                  data-browse-anchor={'insights-group-' + row.groupId}
                  onClick={event => { if (!disabled) { event.currentTarget.focus({preventScroll: true}); onGroup(row.groupId); } }}>{row.name}</button>
                : row.name}</th>
              <td className="pi-numeric">{count(row.workCount)}</td>
              <td className="pi-numeric">{count(row.stats.ratedCount)}</td>
              <td className="pi-numeric">{score(row.stats.mean)}</td>
              <td className="pi-numeric">{count(row.stats.highCount)}</td>
              <td className="pi-numeric">{ratio(row.stats.highCount, row.stats.ratedCount)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <Pager label="团体比较" {...groupsPage} pageSize={pageSize} disabled={disabled}
          onPage={page => { if (disabled) return; pendingFocus.current = 'groups'; groupsPage.setPage(page); }}/>
      </> : <div className="pi-empty"><p>暂时没有可比较的团体作品。</p></div>}
    </section>}

    <section className="pi-panel" aria-labelledby={instanceId + '-members'}>
      <div className="pi-section-heading">
        <div>
          <h3 id={instanceId + '-members'} ref={membersHeading} tabIndex={-1} className="pi-focus-target">成员表现与造型</h3>
          <p>两项分别按有效评分条目计算，不合并分母，也不使用喜爱分。</p>
        </div>
        <label className="pi-field"><span>排序</span>
          <select value={memberMetric} disabled={disabled} onChange={event => {
            if (disabled) return;
            const value = event.target.value;
            if (value !== 'performance' && value !== 'styling') return;
            setMemberMetric(value); membersPage.reset(); tracePage.reset(); setSelectedMemberId(null);
          }}>
            <option value="performance">表现均分高到低</option><option value="styling">造型均分高到低</option>
          </select>
        </label>
      </div>
      {hasExcludedMemberRecords && <p className="pi-excluded">
        {unclearMemberRelations > 0 && <span>另有 {count(unclearMemberRelations)} 条关系尚未明确的记录未计入个人均分。</span>}
        {excludedMembers.emptyScores > 0 && <span>{count(excludedMembers.emptyScores)} 条记录尚无评分。</span>}
        {excludedMembers.invalidScores > 0 && <span>{count(excludedMembers.invalidScores)} 条记录的分数无效，未计入个人均分。</span>}
      </p>}
      {memberRows.length > 0 ? <>
        <div className="pi-table-wrap" role="region" aria-label="成员评分表，可横向滚动" tabIndex={0}>
          <table className="pi-table pi-member-table">
            <caption>成员表现和造型的独立均分与样本数</caption>
            <thead><tr>
              <th scope="col">成员</th><th scope="col" className="pi-numeric">表现均分</th>
              <th scope="col" className="pi-numeric">表现样本</th><th scope="col" className="pi-numeric">造型均分</th>
              <th scope="col" className="pi-numeric">造型样本</th><th scope="col">关联作品</th>
            </tr></thead>
            <tbody>{membersPage.rows.map(row => {
              const member = membersById.get(row.memberId);
              const label = member ? memberLabel(member) : '成员资料暂不可用';
              return <tr key={row.memberId}>
                <th scope="row">{member && onMember
                  ? <button type="button" className="pi-text-button" disabled={disabled}
                    data-browse-anchor={'insights-member-' + row.memberId}
                    onClick={event => { if (!disabled) { event.currentTarget.focus({preventScroll: true}); onMember(row.memberId); } }}>{label}</button>
                  : label}</th>
                <td className="pi-numeric">{score(row.performance.mean)}</td>
                <td className="pi-numeric">{count(row.performance.sampleCount)}</td>
                <td className="pi-numeric">{score(row.styling.mean)}</td>
                <td className="pi-numeric">{count(row.styling.sampleCount)}</td>
                <td><button type="button" className="pi-button pi-button-small"
                  disabled={disabled || row.workIds.length === 0}
                  data-browse-anchor={'insights-trace-toggle-' + row.memberId} aria-expanded={selectedMemberId === row.memberId} aria-controls={selectedMemberId === row.memberId ? instanceId + '-trace' : undefined}
                  aria-label={'查看' + label + '的 ' + count(row.workIds.length) + ' 部关联作品'}
                  onClick={event => {
                    if (disabled || row.workIds.length === 0) return;
                    event.currentTarget.focus({preventScroll: true});
                    traceTrigger.current = event.currentTarget;
                    setSelectedMemberId(row.memberId); tracePage.reset(); pendingFocus.current = 'trace';
                  }}>查看作品（{count(row.workIds.length)}）</button></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <Pager label="成员评分" {...membersPage} pageSize={pageSize} disabled={disabled}
          onPage={page => {
            if (disabled) return;
            setSelectedMemberId(null); pendingFocus.current = 'members'; membersPage.setPage(page);
          }}/>
      </> : <div className="pi-empty">
        <h4>暂时没有可比较的成员评分</h4><p>表现与造型有各自的样本数，未填写的维度不会当作 0 分。</p>
      </div>}

      {selectedMember && <section className="pi-trace" id={instanceId + '-trace'}
        aria-labelledby={instanceId + '-trace-title'} key={selectedMember.memberId}>
        <div className="pi-section-heading">
          <div>
            <h4 id={instanceId + '-trace-title'} ref={traceHeading} tabIndex={-1} className="pi-focus-target">{selectedMemberLabel} · 关联作品</h4>
            <p>表现样本 {count(selectedMember.performance.sampleCount)} 条，
              造型样本 {count(selectedMember.styling.sampleCount)} 条；
              共关联 {count(selectedMember.workIds.length)} 部作品。</p>
          </div>
          <button type="button" className="pi-button" disabled={disabled}
            onClick={() => {
              if (disabled) return;
              traceTrigger.current = document.querySelector<HTMLButtonElement>('[data-browse-anchor="insights-trace-toggle-' + selectedMember.memberId + '"]');
              pendingFocus.current = 'member-return'; setSelectedMemberId(null);
            }}>收起作品</button>
        </div>
        <ul className="pi-trace-list">{tracePage.rows.map(({workId, work}) => <li key={workId}>
          <span>{work ? work.song || work.name : '作品资料暂不可用'}
            {work?.version && <small>{work.version}</small>}</span>
          {work && onWork ? <button type="button" className="pi-button" disabled={disabled}
            aria-label={'打开作品：' + (work.song || work.name)}
            data-browse-anchor={'insights-trace-' + selectedMember.memberId + '-' + workId}
            onClick={event => { if (!disabled) { event.currentTarget.focus({preventScroll: true}); onWork(workId, {video: 'mv'}); } }}>打开作品</button>
            : <span className="pi-caption">{work ? '可在作品页查看评分' : '暂不可打开'}</span>}
        </li>)}</ul>
        <Pager label="成员关联作品" {...tracePage} pageSize={20} disabled={disabled}
          onPage={page => { if (disabled) return; pendingFocus.current = 'trace'; tracePage.setPage(page); }}/>
      </section>}
    </section>

    <section className="pi-panel" aria-labelledby={instanceId + '-revisit'}>
      <div className="pi-section-heading">
        <div>
          <h3 id={instanceId + '-revisit'} ref={revisitHeading} tabIndex={-1} className="pi-focus-target">{revisitTitle}</h3>
          <p>{revisitKind === 'watched-unrated'
            ? '只列出已有 MV 观看记录、尚未填写 MV 评分的作品。'
            : '从 ' + domainLabel + ' 已评分作品中，找回 9 分及以上的作品。'}</p>
        </div>
        <fieldset className="pi-domain" disabled={disabled}><legend>作品清单</legend>
          {([['high-score', '高分重温'], ['watched-unrated', 'MV 已看待评']] as const).map(([value, label]) => <label key={value}>
            <input type="radio" name={instanceId + '-revisit-kind'} value={value} checked={revisitKind === value}
              onChange={() => { if (disabled) return; setRevisitKind(value); revisitPage.reset(); }}/>
            <span>{label}</span>
          </label>)}
        </fieldset>
      </div>
      {revisitRows.length > 0 ? <>
        <ol className="pi-revisit-list" start={(revisitPage.page - 1) * pageSize + 1}>
          {revisitPage.rows.map(item => {
            const exists = worksById.has(item.workId);
            return <li key={item.workId}>
              <div className="pi-revisit-copy">
                <h4>{item.name}</h4>{item.version && <p>{item.version}</p>}
                <span className="pi-score-label">{revisitKind === 'watched-unrated'
                  ? 'MV 评分未填写' : domainLabel + ' 评分 ' + score(item.score)}</span>
              </div>
              {onWork && exists ? <button type="button" className="pi-button" disabled={disabled}
                aria-label={'打开作品：' + item.name}
                data-browse-anchor={'insights-revisit-' + item.workId}
                onClick={event => { if (!disabled) { event.currentTarget.focus({preventScroll: true}); onWork(item.workId, {video: revisitKind === 'watched-unrated' ? 'mv' : domain}); } }}>打开作品</button>
                : <span className="pi-caption">{exists ? '可在作品页查看' : '作品资料暂不可用'}</span>}
            </li>;
          })}
        </ol>
        <Pager label={revisitTitle} {...revisitPage} pageSize={pageSize} disabled={disabled}
          onPage={page => { if (disabled) return; pendingFocus.current = 'revisit'; revisitPage.setPage(page); }}/>
      </> : <div className="pi-empty"><p>{revisitKind === 'watched-unrated'
        ? '暂时没有 MV 已看待评作品。' : '暂时没有 ' + domainLabel + ' 高分重温作品。'}</p></div>}
    </section>
  </section>;
}

export default PersonalInsights;
