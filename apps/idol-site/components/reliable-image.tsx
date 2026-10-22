'use client';

import {cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ImgHTMLAttributes, type ReactElement, type ReactNode} from 'react';
import {activateImageSession, cachedImageResult, canRetryImage, commitImageResult, createImagePresentation, deactivateImageSession, imageAttemptSource, imageInputKey, IMAGE_RETRY_COOLDOWN_MS, isImageRetryActivationKey, isImageSessionCurrent, retryImagePresentation, type ImageStatus} from '../lib/idol/image-presentation';
import './reliable-image.css';

export interface ReliableImageState {
  status: ImageStatus;
  attempt: number;
  generation: string;
  /** Actual URL for the current attempt; external URLs remain byte-for-byte intact. */
  src: string | null;
  canRetry: boolean;
  /** Safe after unmount/input changes: stale generation callbacks return false. */
  retry: () => boolean;
}
export interface ReliableImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string | null;
  alt: string;
  identityKey?: string;
  /** An explicit host generation, without remounting any surrounding detail/editor. */
  attemptKey?: string | number;
  priority?: boolean;
  missing?: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  fallbackStyle?: CSSProperties;
  retryMode?: 'inline' | 'external' | 'manual' | 'none';
  retryLabel?: string;
  retryClassName?: string;
  retryCooldownMs?: number;
  onStateChange?: (state: ReliableImageState) => void;
}

interface RecoveryEntry { id: string; label: string; state: ReliableImageState }
interface RecoveryRegistration { put: (entry: RecoveryEntry) => void; remove: (id: string) => void }
// Stable registration and changing failure lists deliberately use separate
// contexts: one failure must not broadcast a rerender to 600 image consumers.
const RecoveryRegistrationContext = createContext<RecoveryRegistration | null>(null);
const RecoveryEntriesContext = createContext<readonly RecoveryEntry[]>([]);
const interactiveAncestor = 'a, button, summary, label, [role="button"], [role="link"], [contenteditable="true"]';

export function ImageRecoveryProvider({children}: {children: ReactNode}) {
  const [entries, setEntries] = useState<RecoveryEntry[]>([]);
  const put = useCallback((entry: RecoveryEntry) => setEntries(current => {
    const previous = current.find(item => item.id === entry.id);
    if (previous?.state === entry.state && previous.label === entry.label) return current;
    return previous ? current.map(item => item.id === entry.id ? entry : item) : [...current, entry];
  }), []);
  const remove = useCallback((id: string) => setEntries(current => current.some(item => item.id === id) ? current.filter(item => item.id !== id) : current), []);
  const registration = useMemo(() => ({put, remove}), [put, remove]);
  return <RecoveryRegistrationContext.Provider value={registration}><RecoveryEntriesContext.Provider value={entries}>{children}</RecoveryEntriesContext.Provider></RecoveryRegistrationContext.Provider>;
}

export function ImageRetryControl({state, label = '重试图片', className = '', style, onRetryStarted}: {state?: ReliableImageState | null; label?: string; className?: string; style?: CSSProperties; onRetryStarted?: () => void}) {
  if (!state || state.status !== 'error') return null;
  return <button type="button" className={`ri-retry ${className}`.trim()} style={style} disabled={!state.canRetry}
    onPointerDown={event => event.stopPropagation()} onKeyDown={event => { if (isImageRetryActivationKey(event.key)) event.stopPropagation(); }}
    onClick={event => { event.preventDefault(); event.stopPropagation(); const ownsFocus = !!event.currentTarget && event.currentTarget.ownerDocument?.activeElement === event.currentTarget; if (state.retry() && ownsFocus) onRetryStarted?.(); }}>{label}</button>;
}

/** Place once outside all card buttons/anchors; no image fetching or bulk retry. */
export function ImageRecoveryControls({label = '图片恢复', style}: {label?: string; style?: CSSProperties}) {
  const entries = useContext(RecoveryEntriesContext);
  const [limit, setLimit] = useState(12);
  const summary = useRef<HTMLElement>(null);
  const restoreFocus = () => {
    const node = summary.current;
    if (!node?.isConnected) return;
    const dialog = node.closest<HTMLDialogElement>('dialog');
    if (dialog && !dialog.open) return;
    // The last retry removes this recovery region. Stay in its own open dialog,
    // if any; a page landmark outside showModal() is inert and cannot take focus.
    const target = entries.length > 1 ? node : dialog ?? node.closest<HTMLElement>('main,[role="main"]') ?? node.ownerDocument.querySelector<HTMLElement>('main,[role="main"]');
    if (!target?.isConnected) return;
    const temporary = !target.hasAttribute('tabindex') && target.tagName !== 'SUMMARY';
    if (temporary) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
    if (temporary) target.removeAttribute('tabindex');
  };
  if (!entries.length) return null;
  return <section className="ri-recovery" aria-label={label} style={style}><details><summary ref={summary}>{label} · {entries.length} 张图片暂未加载</summary>
    <p>每次只重试所选图片，不改变图片来源或当前记录。</p><ul>{entries.slice(0, limit).map(entry => <li key={entry.id}>
      <span>{entry.label || '图片'}</span><ImageRetryControl state={entry.state} label={`重试：${entry.label || '图片'}`} onRetryStarted={restoreFocus}/>
    </li>)}</ul>{entries.length > limit && <button type="button" className="ri-retry" onClick={() => setLimit(current => current + 12)}>显示更多失败图片</button>}
  </details></section>;
}

function statusNode(node: ReactNode, status: 'missing' | 'error', alt: string, ratio: number | null, fallbackStyle?: CSSProperties): ReactNode {
  const style: CSSProperties = {...(ratio ? {aspectRatio: String(ratio), width: '100%', minHeight: 0} : {}), ...fallbackStyle};
  const label = `${alt ? alt + ' · ' : ''}${status === 'missing' ? '暂无对应图片' : '图片暂时无法加载'}`;
  if (isValidElement(node) && typeof node.type === 'string') {
    const element = node as ReactElement<{style?: CSSProperties; className?: string; role?: string; 'aria-label'?: string}>;
    return cloneElement(element, {style: {...style, ...element.props.style}, className: [element.props.className, 'ri-fallback'].filter(Boolean).join(' '), role: element.props.role ?? 'img', 'aria-label': element.props['aria-label'] ?? label, ...{'data-image-status': status}});
  }
  return <div className="ri-placeholder ri-fallback" style={style} role="img" aria-label={label} data-image-status={status}>{node}</div>;
}

/** Direct native img preserves host child selectors, SSR discovery and layout. */
export function ReliableImage(props: ReliableImageProps) {
  const identityKey = props.identityKey ?? props.alt;
  const inputKey = imageInputKey(props.src, identityKey, props.attemptKey);
  return <ImageGeneration key={inputKey} {...props} identityKey={identityKey} inputKey={inputKey}/>;
}

function ImageGeneration({src, alt, identityKey, inputKey, attemptKey: _attemptKey, priority = false, missing, fallback, errorFallback, fallbackStyle, retryMode = 'external', retryLabel = '重试图片', retryClassName, retryCooldownMs = IMAGE_RETRY_COOLDOWN_MS, onStateChange, onLoad, onError, loading, fetchPriority, decoding, ...native}: ReliableImageProps & {identityKey: string; inputKey: string}) {
  const instance = useId();
  const registration = useContext(RecoveryRegistrationContext);
  const initial = useRef(createImagePresentation(src, identityKey));
  const current = useRef(initial.current);
  const [state, setState] = useState(initial.current);
  const lease = useRef({active: false, epoch: 0});
  const imageRef = useRef<HTMLImageElement | null>(null);
  const callbacks = useRef({onStateChange, onLoad, onError});
  callbacks.current = {onStateChange, onLoad, onError};
  const [nested, setNested] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  const [, tick] = useState(0);
  const cooldown = Number.isFinite(retryCooldownMs) && retryCooldownMs >= 0 ? retryCooldownMs : IMAGE_RETRY_COOLDOWN_MS;
  const retryPolicy = useRef({retryMode, cooldown});
  retryPolicy.current = {retryMode, cooldown};
  const source = imageAttemptSource(state.source, state.attempt);

  const measure = useCallback((image: HTMLImageElement) => {
    const rect = image.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) setRatio(rect.width / rect.height);
  }, []);
  const commit = useCallback((generation: number, result: 'loaded' | 'error', image: HTMLImageElement) => {
    if (!lease.current.active || image !== imageRef.current) return false;
    const next = commitImageResult(current.current, generation, result);
    if (next === current.current) return false;
    // Only failure replaces the native image with a sized placeholder. Successful
    // loads keep their DOM box and do not need a forced layout read.
    if (result === 'error') measure(image);
    if (result === 'error') setNested(Boolean(image.closest(interactiveAncestor)));
    current.current = next; setState(next); return true;
  }, [measure]);
  const retry = useCallback(() => {
    if (!lease.current.active || retryPolicy.current.retryMode === 'none') return false;
    const next = retryImagePresentation(current.current, state.generation, Date.now(), retryPolicy.current.cooldown);
    if (next === current.current) return false;
    current.current = next; setState(next); return true;
  }, [state.generation]);
  const retryable = retryMode !== 'none' && canRetryImage(state, Date.now(), cooldown);
  const snapshot = useMemo<ReliableImageState>(() => ({status: state.status, attempt: state.attempt, generation: `${instance}:${inputKey}:${state.generation}`, src: source, canRetry: retryable, retry}), [state.status, state.attempt, state.generation, instance, inputKey, source, retryable, retry]);

  useLayoutEffect(() => {
    const epoch = activateImageSession(lease.current);
    const image = imageRef.current;
    // Inline retry is opt-in and still never inserts a nested interactive control.
    if (image) setNested(Boolean(image.closest(interactiveAncestor)));
    queueMicrotask(() => {
      if (!image || !isImageSessionCurrent(lease.current, epoch) || image !== imageRef.current) return;
      const result = cachedImageResult(image);
      if (result) commit(state.generation, result, image);
    });
    return () => deactivateImageSession(lease.current);
  }, [commit, state.generation]);

  useEffect(() => {
    if (retryMode === 'none' || state.status !== 'error' || state.lastRetryAt === null || retryable) return;
    const timer = setTimeout(() => { if (lease.current.active) tick(value => value + 1); }, Math.max(0, cooldown - (Date.now() - state.lastRetryAt)) + 1);
    return () => clearTimeout(timer);
  }, [retryMode, state.status, state.lastRetryAt, cooldown, retryable]);
  useEffect(() => {
    if (lease.current.active && current.current.generation === state.generation && current.current.status === state.status) callbacks.current.onStateChange?.(snapshot);
  }, [snapshot, state.generation, state.status]);
  useEffect(() => {
    if (!registration || retryMode !== 'external') return;
    if (lease.current.active && current.current.generation === state.generation && current.current.status === 'error' && state.status === 'error') registration.put({id: instance, label: alt, state: snapshot});
    else registration.remove(instance);
    return () => registration.remove(instance);
  }, [registration, retryMode, instance, alt, snapshot, state.generation, state.status]);

  if (state.status === 'missing') return <>{statusNode(missing ?? fallback ?? '暂无对应图片', 'missing', alt, null, fallbackStyle)}</>;
  if (state.status === 'error') return <>{statusNode(errorFallback ?? fallback ?? '图片暂时无法加载', 'error', alt, ratio, fallbackStyle)}{retryMode === 'inline' && !nested && <ImageRetryControl state={snapshot} label={retryLabel} className={retryClassName}/>}</>;
  return <img {...native} key={state.generation} ref={imageRef} src={source!} alt={alt}
    loading={priority ? 'eager' : loading ?? 'lazy'} fetchPriority={priority ? 'high' : fetchPriority ?? 'auto'} decoding={decoding ?? 'async'}
    onLoad={event => { if (commit(state.generation, 'loaded', event.currentTarget)) callbacks.current.onLoad?.(event); }}
    onError={event => { if (commit(state.generation, 'error', event.currentTarget)) callbacks.current.onError?.(event); }}/>;
}
