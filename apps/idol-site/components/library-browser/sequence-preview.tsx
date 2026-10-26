'use client';

import {useId, useLayoutEffect, useRef, useState} from 'react';
import type {PageSize, SequencePreviewProps, SequenceStatus} from '../../lib/idol/library-browser/contract';
import {paginate} from '../../lib/idol/library-browser/paging-model';
import {buildSequenceModel} from '../../lib/idol/library-browser/sequence-model';
import './sequence.css';

const statusLabels: Record<SequenceStatus, string> = {
  available: '可观看', missing: '已删除或不存在', unavailable: '来源不可用',
  filtered: '已不符合本次条件', 'member-unlinked': '成员关联已断开',
};

/** Read-only original session order; only the host may navigate through onNext. */
export function SequencePreview({sequence, currentId, catalog, onNext, nextDisabled = false}: SequencePreviewProps) {
  const model = buildSequenceModel(sequence, currentId, catalog);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(24);
  const paging = paginate(model.total, page, pageSize);
  const rows = model.rows.slice((paging.page - 1) * paging.pageSize, paging.page * paging.pageSize);
  const uid = useId();
  const summary = useRef<HTMLParagraphElement>(null);
  const deliberate = useRef(false);
  useLayoutEffect(() => {
    if (!deliberate.current) return;
    deliberate.current = false;
    summary.current?.focus();
  }, [paging.page, paging.pageSize]);
  const disabled = nextDisabled || !onNext || !model.nextId || model.unrecoverable;

  return <details className="lb-sequence">
    <summary className="lb-sequence-toggle">本次观看列表（{model.total} 项）</summary>
    <div className="lb-sequence-panel">
      <p className="lb-sequence-label">{sequence.label} · 只读预览</p>
      <p>{model.unrecoverable ? '当前作品不在原会话中，无法恢复会话位置。'
        : model.currentPosition === null ? '当前没有可恢复的作品位置。'
          : `原会话第 ${model.currentPosition} / ${model.total} 项`}</p>
      <p>当前可继续 {model.continuableCount} 项；原顺序与总数保持不变。</p>
      <p ref={summary} tabIndex={-1} className="lb-sequence-page-status" role="status" aria-live="polite" aria-atomic="true">
        {model.total ? `预览第 ${paging.start}–${paging.end} 项，第 ${paging.page} / ${paging.pageCount} 页` : '本次观看列表为空。'}
      </p>
      <ol className="lb-sequence-list" start={(paging.page - 1) * paging.pageSize + 1} aria-label="原会话顺序">
        {rows.map((row, index) => <li key={`${row.id}:${row.position}:${index}`} className="lb-sequence-row"
          data-lb-sequence-id={row.id} aria-current={row.current ? 'step' : undefined}>
          <span className="lb-sequence-name">{row.name}</span>
          <span className="lb-sequence-state">{row.current ? '当前作品 · ' : ''}{row.next ? '下一支 · ' : ''}{statusLabels[row.status]}</span>
        </li>)}
      </ol>
      <nav className="lb-sequence-paging" aria-label="观看列表预览分页">
        <button type="button" disabled={paging.page <= 1} onClick={() => {
          if (paging.page <= 1) return; deliberate.current = true; setPage(paging.page - 1);
        }}>预览上一页</button>
        <span aria-current="page">第 {paging.page} / {paging.pageCount} 页</span>
        <button type="button" disabled={paging.page >= paging.pageCount} onClick={() => {
          if (paging.page >= paging.pageCount) return; deliberate.current = true; setPage(paging.page + 1);
        }}>预览下一页</button>
        <label htmlFor={`${uid}-size`}>预览每页</label>
        <select id={`${uid}-size`} value={pageSize} onChange={event => {
          const size = Number(event.target.value);
          if (size !== 24 && size !== 48) return;
          deliberate.current = true; setPage(1); setPageSize(size);
        }}><option value={24}>24 项</option><option value={48}>48 项</option></select>
      </nav>
      {!model.nextId && !model.unrecoverable ? <p className="lb-sequence-end" role="status">本次观看已到末尾，没有可继续的下一支。</p> : null}
      {onNext ? <button className="lb-sequence-next" type="button" disabled={disabled}
        onClick={() => {if (!disabled) onNext();}}>下一支</button> : null}
    </div>
  </details>;
}
