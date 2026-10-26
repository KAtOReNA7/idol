'use client';
/* eslint-disable @next/next/no-html-link-for-pages -- Preserve the existing full-document handoff to the private notebook. */
import {usePathname} from 'next/navigation';
/** The unaccepted candidate must never inherit the released designs' acceptance wording. */
export function DesignReviewLabel({defaultSummary}: {defaultSummary: string}) {
  const path = usePathname();
  const candidates: Record<string, {name: string; href: string}> = {'/design-review/sol15/vcha-container': {name: 'VCHA', href: '/artists/vcha'}, '/design-review/sol15/vcha-container/frame/320': {name: 'VCHA', href: '/artists/vcha'}, '/design-review/sol15/vcha-container/frame/390': {name: 'VCHA', href: '/artists/vcha'}, '/design-review/sol15/vcha-container/frame/1440': {name: 'VCHA', href: '/artists/vcha'}, '/design-review/sol15/vcha': {name: 'VCHA', href: '/artists/vcha'}, '/design-review/sol15/udtt': {name: 'UDTT', href: '/artists/udtt'}, '/design-review/triples-v2': {name: 'tripleS', href: '/artists/triples'}, '/design-review/rescene-v1': {name: 'RESCENE', href: '/artists/rescene'}, '/design-review/purplekiss-v1': {name: 'PURPLE KISS', href: '/artists/purplekiss'}};
  const candidate = candidates[path ?? ''];
  return <details className="design-review-label" data-design-review="preview"><summary>{candidate ? `${candidate.name} · 未验收视觉候选` : defaultSummary}</summary><p>{candidate ? `独立视觉候选，尚未获得 Figma 或浏览器视觉验收；正式 ${candidate.name} 页面未替换。` : '此处为独立设计预览；正式团体页面使用相同设计。'}</p><nav aria-label="设计审阅">{candidate ? <a href={candidate.href}>正式 {candidate.name} 页面</a> : <><a href="/design-review/unis">UNIS 预览</a><a href="/design-review/kep1er">Kep1er 预览</a></>}<a href="/">返回手帐</a></nav><p>观看与编辑沿用现有手帐，返回按钮会回到正式团体页；浏览器后退可回到预览。</p></details>;
}
