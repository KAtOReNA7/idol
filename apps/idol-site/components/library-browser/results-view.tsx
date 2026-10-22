'use client';

import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import type {PageSize, ResultsViewProps} from '../../lib/idol/library-browser/contract';
import {paginate, resolveRestoreTarget} from '../../lib/idol/library-browser/paging-model';
import './results.css';

/** Controlled, bounded rendering. History and layout stabilization belong to the host. */
export function ResultsView({model, page, pageSize, onPageChange, renderWork, onOpenWork,
  sequence, restoreTarget, restoreReady = false, onRestoreReady, loading = false,
  error, searchId}: ResultsViewProps) {
  const paging = paginate(model.orderedWorks.length, page, pageSize);
  const rows = model.orderedWorks.slice((paging.page - 1) * paging.pageSize, paging.page * paging.pageSize);
  const uid = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<{page: number; size: PageSize} | null>(null);
  const completedRestore = useRef<string | null>(null);
  const requestedPage = useRef<string | null>(null);
  const [jump, setJump] = useState(String(paging.page));
  const [jumpError, setJumpError] = useState('');
  const restoreKey = restoreTarget ? JSON.stringify(restoreTarget) : null;

  useEffect(() => {setJump(String(paging.page)); setJumpError('');}, [paging.page, paging.pageSize]);
  useLayoutEffect(() => {
    if (restoreKey === null) {completedRestore.current = null; requestedPage.current = null;}
    if (!restoreTarget || loading || error) return;
    const resolution = resolveRestoreTarget(model.orderedIds, paging.pageSize, restoreTarget);
    const completionKey = `${restoreKey}:${JSON.stringify(resolution)}`;
    if (completionKey === completedRestore.current) return;
    if (paging.page !== resolution.page) {
      const request = `${restoreKey}:${resolution.page}:${paging.pageSize}`;
      if (requestedPage.current !== request) {
        requestedPage.current = request;
        onPageChange(resolution.page, paging.pageSize);
      }
      return;
    }
    // Never restore focus/geometry while the host is waiting for images or fonts.
    if (!restoreReady) return;
    const anchor = resolution.anchorId
      ? Array.from(container.current?.querySelectorAll<HTMLElement>('[data-lb-work-id]') ?? [])
        .find(element => element.dataset.lbWorkId === resolution.anchorId)
      : undefined;
    if (resolution.focus === 'anchor' && !anchor) return;
    const requestedFocus = restoreTarget.focusId ? document.getElementById(restoreTarget.focusId) : null;
    const focus = resolution.focus === 'anchor'
      ? (requestedFocus && anchor?.contains(requestedFocus) ? requestedFocus
        : anchor?.querySelector<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]') ?? anchor)
      : ((searchId ? document.getElementById(searchId) : null) ?? heading.current);
    focus?.focus({preventScroll: true});
    completedRestore.current = completionKey;
    requestedPage.current = null;
    pendingFocus.current = null;
    onRestoreReady?.(resolution);
  }, [restoreKey, restoreTarget, restoreReady, model.orderedIds, paging.page, paging.pageSize,
    loading, error, onPageChange, onRestoreReady, searchId]);

  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending || loading || error || pending.page !== paging.page || pending.size !== paging.pageSize) return;
    // Focus only after an explicit paging gesture, never on ordinary mount/refresh.
    pendingFocus.current = null;
    heading.current?.focus();
  }, [paging.page, paging.pageSize, loading, error]);

  function changePage(next: number, size: PageSize = paging.pageSize) {
    if (loading || error) return;
    const nextPage = paginate(model.orderedWorks.length, next, size).page;
    if (nextPage === paging.page && size === paging.pageSize) return;
    pendingFocus.current = {page: nextPage, size};
    onPageChange(nextPage, size);
  }
  function submitJump(event: FormEvent) {
    event.preventDefault();
    if (loading || error) return;
    const value = jump.trim();
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > paging.pageCount) {
      setJumpError(`请输入 1 至 ${paging.pageCount} 的整数页码。`);
      return;
    }
    setJumpError('');
    changePage(Number(value));
  }

  return <section className="lb-results" aria-busy={loading} aria-labelledby={`${uid}-title`}>
    <h2 id={`${uid}-title`} className="lb-results-heading" tabIndex={-1} ref={heading}>作品浏览</h2>
    <p className="lb-results-summary" role="status" aria-live="polite" aria-atomic="true">
      {loading ? '正在加载作品…' : error ? '作品暂时无法显示。' : paging.total
        ? `第 ${paging.start}–${paging.end} 项，共 ${paging.total} 项；第 ${paging.page} / ${paging.pageCount} 页`
        : '共 0 项作品'}
    </p>
    {error ? <p role="alert" className="lb-results-error">{error}</p> : null}
    {!loading && !error && !paging.total ? <p className="lb-results-empty">{model.activeConditions.length
      ? '没有符合当前条件的作品，请撤销上方条件后重试。' : '作品库暂无作品。'}</p> : null}
    <div ref={container} className="lb-results-grid" data-lb-results-grid="" aria-label="本页作品">
      {!loading && !error && rows.map(work => <div key={work.id} className="lb-results-card" data-lb-work-id={work.id}
        tabIndex={-1} aria-label={work.name}>
        {renderWork(work, () => {
          if (loading || error) return;
          // Safari/touch and programmatic clicks do not necessarily focus buttons.
          // Capture the actual opened card before the host snapshots its history anchor.
          const card = Array.from(container.current?.querySelectorAll<HTMLElement>('[data-lb-work-id]') ?? [])
            .find(element => element.dataset.lbWorkId === work.id);
          (card?.querySelector<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]') ?? card)?.focus({preventScroll:true});
          onOpenWork(work.id, sequence);
        })}
      </div>)}
    </div>
    <nav className="lb-results-paging" aria-label="作品分页">
      <button type="button" disabled={loading || !!error || paging.page <= 1} onClick={() => changePage(paging.page - 1)}>上一页</button>
      <span aria-current="page">第 {paging.page} / {paging.pageCount} 页</span>
      <button type="button" disabled={loading || !!error || paging.page >= paging.pageCount} onClick={() => changePage(paging.page + 1)}>下一页</button>
      <label htmlFor={`${uid}-size`}>每页</label>
      <select id={`${uid}-size`} value={paging.pageSize} disabled={loading || !!error}
        onChange={event => {const size = Number(event.target.value); if (size === 24 || size === 48) changePage(1, size);}}>
        <option value={24}>24 项</option><option value={48}>48 项</option>
      </select>
      <form className="lb-results-jump" onSubmit={submitJump} noValidate>
        <label htmlFor={`${uid}-jump`}>跳至页码</label>
        <input id={`${uid}-jump`} type="text" inputMode="numeric" value={jump} disabled={loading || !!error || !paging.total}
          aria-invalid={!!jumpError} aria-describedby={jumpError ? `${uid}-jump-error` : undefined}
          onChange={event => {setJump(event.target.value); setJumpError('');}} />
        <button type="submit" disabled={loading || !!error || !paging.total}>前往</button>
      </form>
    </nav>
    {jumpError ? <p id={`${uid}-jump-error`} className="lb-results-error" role="alert">{jumpError}</p> : null}
  </section>;
}
