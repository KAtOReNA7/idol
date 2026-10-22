'use client';

import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import type {TimelineFilters} from '../lib/idol/timeline/types';
import {
  canUseTimelineReturn, createTimelineReturnState, isTimelineReturnIdentity,
  readTimelineReturnState, sameTimelineReturnIdentity, withTimelineReturnState,
  type TimelineReturnIdentity,
} from '../lib/idol/timeline/return-state';

const triggerSelector = '[data-timeline-event-trigger][data-timeline-target-kind][data-timeline-target-id]';
const detailsSelector = 'details[data-timeline-details-key]';
const maximumRestoreFrames = 120;
const currentPath = () => location.pathname + location.search;

function visible(element: HTMLElement): boolean {
  if (document.hidden || element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
  const style = getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse' && element.getClientRects().length > 0;
}

function modalOpen(): boolean {
  return [...document.querySelectorAll<HTMLElement>('[aria-modal="true"], dialog[open]')].some(visible);
}

function identityOf(element: HTMLElement): TimelineReturnIdentity | null {
  const value = {eventId: element.dataset.timelineEventTrigger, kind: element.dataset.timelineTargetKind, targetId: element.dataset.timelineTargetId};
  return isTimelineReturnIdentity(value) ? value : null;
}

function readyRoot(root: HTMLElement): boolean {
  const markedReady = root.matches('[data-timeline-ready="true"][data-timeline-style-ready="true"]') ||
    Boolean(root.querySelector('[data-timeline-ready="true"][data-timeline-style-ready="true"]'));
  const timeline = root.matches('.artist-timeline') ? root : root.querySelector<HTMLElement>('.artist-timeline');
  // Supplied readiness alone cannot establish that the real timeline CSS has
  // loaded. This sentinel is declared inside that stylesheet, never inline.
  return markedReady && timeline !== null && getComputedStyle(timeline).getPropertyValue('--at-style-ready').trim() === '1';
}

/**
 * The host supplies its actual data/style gate through ready and its existing
 * dirty/uncertain-save guard state through blocked. This hook does not navigate,
 * authorize navigation, write drafts, or substitute for those host guards.
 */
export function useTimelineReturn({ready, routeKey, blocked = false, filters, captureClicks = true}: {ready: boolean; routeKey: string; blocked?: boolean; filters?: TimelineFilters; captureClicks?: boolean}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const latest = useRef({ready, routeKey, blocked, filters});
  latest.current = {ready, routeKey, blocked, filters};
  const restoring = useRef(false);
  const takeover = useRef(false);
  const restoreFocus = useRef(false);

  const gates = useCallback((root: HTMLElement, allowTakeover: boolean, guardApproved = false) => canUseTimelineReturn({
    ready: latest.current.ready,
    styleReady: readyRoot(root), dataReady: readyRoot(root),
    visible: visible(root), blocked: !guardApproved && latest.current.blocked,
    modal: modalOpen(), userTakeover: !allowTakeover && takeover.current,
  }), []);

  const rememberTarget = useCallback((identity: TimelineReturnIdentity, rootElement?: HTMLElement | null, guardApproved = false): boolean => {
    const root = rootElement ?? rootRef.current;
    if (!root || restoring.current || latest.current.routeKey !== currentPath() || !gates(root, true, guardApproved) || !isTimelineReturnIdentity(identity)) return false;
    const target = [...root.querySelectorAll<HTMLElement>(triggerSelector)].find(node => {
      const candidate = identityOf(node);
      return candidate && sameTimelineReturnIdentity(identity, candidate);
    });
    if (!target || target.matches(':disabled') || !visible(target)) return false;
    const openDetails = [...root.querySelectorAll<HTMLDetailsElement>(detailsSelector)].filter(node => node.open).map(node => node.dataset.timelineDetailsKey!);
    const saved = createTimelineReturnState(currentPath(), identity, {openDetails, scrollY: window.scrollY, filters: latest.current.filters});
    if (!saved) return false;
    try { history.replaceState(withTimelineReturnState(history.state, saved), '', location.href); return true; } catch { return false; }
  }, [gates]);

  // Reset only for a different route, not when CSS or data become ready later.
  // Interactions while waiting therefore cancel a late focus/scroll takeover.
  useLayoutEffect(() => {
    takeover.current = false;
    const stop = () => { if (!restoreFocus.current) takeover.current = true; };
    const focus = (event: FocusEvent) => {
      if (event.target !== document.body && event.target !== document.documentElement) stop();
    };
    const names = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    names.forEach(name => addEventListener(name, stop, {capture: true, passive: true}));
    addEventListener('focusin', focus, true);
    return () => {
      names.forEach(name => removeEventListener(name, stop, true));
      removeEventListener('focusin', focus, true);
    };
  }, [routeKey]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const capture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(triggerSelector) : null;
      if (!target || !root.contains(target)) return;
      const identity = identityOf(target);
      if (identity) rememberTarget(identity, root);
    };
    const refresh = () => {
      const saved = readTimelineReturnState(history.state?.timelineReturn, currentPath());
      if (saved) rememberTarget(saved.identity, root);
    };
    if (captureClicks) root.addEventListener('click', capture, true);
    root.addEventListener('toggle', refresh, true);
    addEventListener('pagehide', refresh);
    return () => {
      root.removeEventListener('click', capture, true);
      root.removeEventListener('toggle', refresh, true);
      removeEventListener('pagehide', refresh);
    };
  }, [rememberTarget, routeKey, ready, captureClicks]);

  useLayoutEffect(() => {
    if (!ready || blocked || routeKey !== currentPath() || takeover.current) return;
    const saved = readTimelineReturnState(history.state?.timelineReturn, routeKey);
    if (!saved) return;
    let active = true;
    let frame = 0;
    let attempts = 0;
    let expanded = false;
    restoring.current = true;
    let focused = false;
    let observer: ResizeObserver | undefined;
    const fonts = document.fonts;
    const stop = () => { active = false; restoring.current = false; cancelAnimationFrame(frame); observer?.disconnect(); };
    const schedule = () => { if (active) { cancelAnimationFrame(frame); frame = requestAnimationFrame(apply); } };
    const apply = () => {
      if (!active || takeover.current || latest.current.blocked || latest.current.routeKey !== routeKey || currentPath() !== routeKey || modalOpen()) { stop(); return; }
      const root = rootRef.current;
      if (!focused && ++attempts > maximumRestoreFrames) { stop(); return; }
      if (!root || !gates(root, false)) { frame = requestAnimationFrame(apply); return; }
      const currentFilters = latest.current.filters;
      if (currentFilters && (currentFilters.type !== saved.filters.type || currentFilters.importance !== saved.filters.importance || currentFilters.order !== saved.filters.order)) { frame = requestAnimationFrame(apply); return; }
      const target = [...root.querySelectorAll<HTMLElement>(triggerSelector)].find(node => {
        const candidate = identityOf(node);
        return candidate && sameTimelineReturnIdentity(saved.identity, candidate);
      });
      if (!target || target.matches(':disabled')) { frame = requestAnimationFrame(apply); return; }
      if (!expanded) {
        const openKeys = new Set(saved.openDetails);
        root.querySelectorAll<HTMLDetailsElement>(detailsSelector).forEach(node => { node.open = openKeys.has(node.dataset.timelineDetailsKey!); });
        const ancestors: HTMLDetailsElement[] = [];
        for (let parent = target.parentElement; parent && parent !== root; parent = parent.parentElement) if (parent.tagName === 'DETAILS') ancestors.push(parent as HTMLDetailsElement);
        ancestors.reverse().forEach(node => { node.open = true; });
        expanded = true;
        // Let details layout settle before moving focus or restoring scroll.
        frame = requestAnimationFrame(apply);
        return;
      }
      if (!visible(target)) { frame = requestAnimationFrame(apply); return; }
      restoreFocus.current = true;
      try {
        if (!focused) { target.focus({preventScroll: true}); focused = document.activeElement === target; }
        window.scrollTo({top: saved.scrollY, behavior: 'instant'});
      } finally { restoreFocus.current = false; }
      // Retry late layout only while this hook still owns the restoration.
      if (Math.abs(window.scrollY - saved.scrollY) > 2) frame = requestAnimationFrame(apply);
      else restoring.current = false;
    };
    observer = new ResizeObserver(schedule);
    observer.observe(document.querySelector('main') ?? document.body);
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    events.forEach(name => addEventListener(name, stop, {capture:true,passive:true}));
    void fonts?.ready.then(schedule);
    fonts?.addEventListener('loadingdone',schedule);
    frame = requestAnimationFrame(apply);
    return () => { stop(); events.forEach(name => removeEventListener(name,stop,true)); fonts?.removeEventListener('loadingdone',schedule); };
  }, [ready, blocked, routeKey, gates, filters?.type, filters?.importance, filters?.order]);

  return {rootRef, rememberTarget};
}
