/** Transient modal lifecycle only; no history, image cache, player or save state. */
export interface ImageLightboxFocusTarget {
  readonly isConnected: boolean;
}
export interface ImageLightboxOverflowValue { value: string; priority: string }
export interface ImageLightboxOverflowState {
  overflow: ImageLightboxOverflowValue;
  x: ImageLightboxOverflowValue;
  y: ImageLightboxOverflowValue;
}
export interface ImageLightboxKeyEvent {
  key: string;
  shiftKey?: boolean;
  defaultPrevented?: boolean;
  isComposing?: boolean;
  preventDefault(): void;
  stopPropagation?(): void;
}
export interface ImageLightboxSessionPorts<T extends ImageLightboxFocusTarget> {
  /** Usually document.body; concurrent sessions share ownership of its lock. */
  scrollTarget: object;
  readOverflow(): ImageLightboxOverflowState;
  writeOverflow(value: ImageLightboxOverflowState): void;
  getActiveElement(): T | null;
  getInitialFocus(): T | null;
  getFocusable(): readonly T[];
  getFallbackFocus(): T | null;
  isInside(target: T): boolean;
  isDocumentFallback(target: T): boolean;
  canFocus(target: T): boolean;
  focus(target: T): void;
  /** Must call the latest callback; a new callback does not create a session. */
  requestClose(): void;
  listenKeydown(listener: (event: ImageLightboxKeyEvent) => void): () => void;
}

interface ScrollLock {
  owners: symbol[];
  previous: ImageLightboxOverflowState;
  applied: ImageLightboxOverflowState;
}
const scrollLocks = new WeakMap<object, ScrollLock>();

function sameOverflow(a: ImageLightboxOverflowState, b: ImageLightboxOverflowState): boolean {
  return (['overflow', 'x', 'y'] as const).every(key => a[key].value === b[key].value && a[key].priority === b[key].priority);
}

function acquireScrollLock<T extends ImageLightboxFocusTarget>(ports: ImageLightboxSessionPorts<T>): { isTopmost(): boolean; release(): void } {
  let lock = scrollLocks.get(ports.scrollTarget);
  if (!lock) {
    const previous = ports.readOverflow();
    const priority = previous.overflow.priority || previous.x.priority || previous.y.priority;
    const applied = {
      overflow: { value: 'hidden', priority },
      x: { value: 'hidden', priority },
      y: { value: 'hidden', priority },
    };
    ports.writeOverflow(applied);
    lock = { owners: [], previous, applied };
    scrollLocks.set(ports.scrollTarget, lock);
  }
  const owner = Symbol('image-lightbox-session');
  lock.owners.push(owner);
  const ownedLock = lock;
  let released = false;
  return {
    isTopmost: () => !released && scrollLocks.get(ports.scrollTarget) === ownedLock && ownedLock.owners[ownedLock.owners.length - 1] === owner,
    release() {
      if (released) return;
      released = true;
      const index = ownedLock.owners.indexOf(owner);
      if (index >= 0) ownedLock.owners.splice(index, 1);
      if (ownedLock.owners.length > 0) return;
      scrollLocks.delete(ports.scrollTarget);
      // A later owner may have changed scroll styling; do not overwrite it.
      if (sameOverflow(ports.readOverflow(), ownedLock.applied)) ports.writeOverflow(ownedLock.previous);
    },
  };
}

/** The component effect delegates to this exact, deterministically testable logic. */
export function startImageLightboxSession<T extends ImageLightboxFocusTarget>(ports: ImageLightboxSessionPorts<T>): () => void {
  const previous = ports.getActiveElement();
  const ownership = acquireScrollLock(ports);
  let active = true;
  const focus = (target: T | null) => {
    if (target && target.isConnected && ports.canFocus(target)) ports.focus(target);
  };
  focus(ports.getInitialFocus());
  const stopListening = ports.listenKeydown(event => {
    if (!active || !ownership.isTopmost() || event.defaultPrevented || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation?.();
      ports.requestClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = ports.getFocusable().filter(target => target.isConnected && ports.canFocus(target));
    event.preventDefault();
    event.stopPropagation?.();
    if (focusable.length === 0) { focus(ports.getInitialFocus()); return; }
    const current = ports.getActiveElement();
    const index = current ? focusable.indexOf(current) : -1;
    const next = index < 0 ? (event.shiftKey ? focusable.length - 1 : 0)
      : (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
    focus(focusable[next]);
  });
  return () => {
    if (!active) return;
    const wasTopmost = ownership.isTopmost();
    active = false;
    stopListening();
    ownership.release();
    // Removing an obscured session must not restore focus over its live owner.
    if (!wasTopmost) return;
    const current = ports.getActiveElement();
    // Avoid stealing a focus change already made by another modal/navigation.
    if (current && current.isConnected && !ports.isInside(current) && !ports.isDocumentFallback(current)) return;
    if (previous && previous.isConnected && ports.canFocus(previous)) focus(previous);
    else focus(ports.getFallbackFocus());
  };
}
