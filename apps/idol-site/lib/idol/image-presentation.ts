/** Shared image request state. No fetching, timers, persistence or source selection. */
export type ImageStatus = 'missing' | 'loading' | 'loaded' | 'error';
export const IMAGE_RETRY_COOLDOWN_MS = 800;
/** Leave Tab/Escape bubbling for the containing dialog's real focus cycle. */
export function isImageRetryActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
}
export interface ImagePresentationState {
  source: string | null;
  identityKey: string;
  generation: number;
  attempt: number;
  status: ImageStatus;
  lastRetryAt: number | null;
}
export interface ImageSessionLease { active: boolean; epoch: number }

export function imageSource(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function imageInputKey(source: string | null | undefined, identityKey: string, attemptKey: string | number = 0): string {
  return JSON.stringify([imageSource(source), identityKey, attemptKey]);
}

/** Only the already supported ratings-media retry protocol may change a URL. */
export function imageAttemptSource(source: string | null | undefined, attempt: number): string | null {
  const original = imageSource(source);
  if (!original || !Number.isSafeInteger(attempt) || attempt <= 0 || !original.startsWith('/api/media?')) return original;
  let url: URL;
  try { url = new URL(original, 'https://image.invalid'); } catch { return original; }
  const query = url.searchParams;
  if (url.pathname !== '/api/media' || query.getAll('table').length !== 1 || query.get('table') !== 'ratings' || query.getAll('record').length !== 1 || !/^rec[A-Za-z0-9]+$/.test(query.get('record') ?? '') || query.getAll('index').length !== 1 || !/^\d+$/.test(query.get('index') ?? '') || query.getAll('retry').length > 1) return original;
  const previous = query.get('retry');
  if (previous !== null && !/^\d+$/.test(previous)) return original;
  const next = Number(previous ?? 0) + attempt;
  if (!Number.isSafeInteger(next)) return original;
  query.set('retry', String(next));
  return url.pathname + '?' + query.toString() + url.hash;
}

export function createImagePresentation(source: string | null | undefined, identityKey: string): ImagePresentationState {
  const src = imageSource(source);
  return {source: src, identityKey, generation: 0, attempt: 0, status: src ? 'loading' : 'missing', lastRetryAt: null};
}

export function commitImageResult(state: ImagePresentationState, generation: number, result: 'loaded' | 'error'): ImagePresentationState {
  return state.generation === generation && state.status === 'loading' ? {...state, status: result} : state;
}

/** Read native cached completion after hydration without issuing another request. */
export function cachedImageResult(image: {complete: boolean; naturalWidth: number}): 'loaded' | 'error' | null {
  if (!image.complete || !Number.isFinite(image.naturalWidth) || image.naturalWidth < 0) return null;
  return image.naturalWidth > 0 ? 'loaded' : 'error';
}

export function canRetryImage(state: ImagePresentationState, now: number, cooldown = IMAGE_RETRY_COOLDOWN_MS): boolean {
  return state.status === 'error' && state.source !== null && Number.isFinite(now) && Number.isFinite(cooldown) && cooldown >= 0 &&
    (state.lastRetryAt === null || now - state.lastRetryAt >= cooldown);
}

export function retryImagePresentation(state: ImagePresentationState, generation: number, now: number, cooldown = IMAGE_RETRY_COOLDOWN_MS): ImagePresentationState {
  return state.generation === generation && canRetryImage(state, now, cooldown)
    ? {...state, generation: state.generation + 1, attempt: state.attempt + 1, status: 'loading', lastRetryAt: now}
    : state;
}

/** Layout-effect leases invalidate deferred work on cleanup, including Strict replay. */
export function activateImageSession(lease: ImageSessionLease): number {
  lease.active = true;
  lease.epoch += 1;
  return lease.epoch;
}
export function deactivateImageSession(lease: ImageSessionLease): void {
  lease.active = false;
  lease.epoch += 1;
}
export function isImageSessionCurrent(lease: ImageSessionLease, epoch: number): boolean {
  return lease.active && lease.epoch === epoch;
}
