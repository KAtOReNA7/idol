'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startImageLightboxSession } = require('../lib/idol/image-lightbox-session.ts');

function environment() {
  const element = (name, inside = false) => ({ name, inside, isConnected: true, enabled: true });
  const trigger = element('trigger'), close = element('close', true), retry = element('retry', true), main = element('main'), body = element('body');
  const state = {
    active: trigger, targets: [close], listeners: new Set(), focused: [], writes: [], closes: [],
    overflow: { overflow: { value: 'auto', priority: '' }, x: { value: 'auto', priority: 'important' }, y: { value: 'scroll', priority: '' } },
    onClose() { state.closes.push('initial'); },
  };
  const ports = {
    scrollTarget: body,
    readOverflow: () => structuredClone(state.overflow),
    writeOverflow(value) { state.overflow = structuredClone(value); state.writes.push(structuredClone(value)); },
    getActiveElement: () => state.active,
    getInitialFocus: () => close,
    getFocusable: () => state.targets,
    getFallbackFocus: () => main,
    isInside: target => target.inside,
    isDocumentFallback: target => target === body,
    canFocus: target => target.enabled,
    focus(target) { state.active = target; state.focused.push(target.name); },
    requestClose: () => state.onClose(),
    listenKeydown(listener) { state.listeners.add(listener); return () => state.listeners.delete(listener); },
  };
  function key(name, options = {}) {
    const event = { key: name, prevented: 0, stopped: 0, preventDefault() { this.prevented += 1; this.defaultPrevented = true; }, stopPropagation() { this.stopped += 1; }, ...options };
    for (const listener of [...state.listeners]) listener(event);
    return event;
  }
  return { element, trigger, close, retry, main, body, state, ports, key };
}

test('actual lifecycle acquires a scroll lock and initially focuses close, retaining all original overflow priorities', () => {
  const env = environment();
  const before = structuredClone(env.state.overflow);
  const dispose = startImageLightboxSession(env.ports);
  assert.equal(env.state.active, env.close);
  assert.equal(env.state.overflow.overflow.value, 'hidden');
  assert.equal(env.state.overflow.x.priority, 'important');
  dispose();
  assert.deepEqual(env.state.overflow, before);
  assert.equal(env.state.active, env.trigger);
  assert.equal(env.state.listeners.size, 0);
});

test('latest close callback is used without replacing the session, lock, or focus', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  env.state.onClose = () => env.state.closes.push('updated');
  const event = env.key('Escape');
  assert.deepEqual(env.state.closes, ['updated']);
  assert.equal(env.state.writes.length, 1);
  assert.deepEqual(env.state.focused, ['close']);
  assert.equal(event.prevented, 1);
  assert.equal(event.stopped, 1);
  dispose();
});

test('Tab and Shift+Tab cycle through dynamically available close and retry controls', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  env.state.targets.push(env.retry);
  env.key('Tab'); assert.equal(env.state.active, env.retry);
  env.key('Tab'); assert.equal(env.state.active, env.close);
  env.key('Tab', { shiftKey: true }); assert.equal(env.state.active, env.retry);
  env.key('Tab', { shiftKey: true }); assert.equal(env.state.active, env.close);
  env.retry.enabled = false;
  env.key('Tab'); assert.equal(env.state.active, env.close);
  env.retry.enabled = true; env.retry.isConnected = false;
  env.key('Tab', { shiftKey: true }); assert.equal(env.state.active, env.close);
  dispose();
});

test('focus outside the modal enters the first or last available control on Tab', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  env.state.targets.push(env.retry);
  env.state.active = env.body;
  env.key('Tab', { shiftKey: true }); assert.equal(env.state.active, env.retry);
  env.state.active = env.body;
  env.key('Tab'); assert.equal(env.state.active, env.close);
  env.state.targets = [];
  env.state.active = env.body;
  env.key('Tab'); assert.equal(env.state.active, env.close);
  dispose();
});

test('ignored keys, already-handled events and composition do not close or change focus', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  assert.equal(env.key('ArrowRight').prevented, 0);
  assert.equal(env.key('Escape', { defaultPrevented: true }).prevented, 0);
  assert.equal(env.key('Escape', { isComposing: true }).prevented, 0);
  assert.deepEqual(env.state.closes, []);
  assert.deepEqual(env.state.focused, ['close']);
  dispose();
});

test('a removed or disabled trigger restores a connected safe fallback', () => {
  for (const state of ['removed', 'disabled']) {
    const env = environment();
    const dispose = startImageLightboxSession(env.ports);
    if (state === 'removed') env.trigger.isConnected = false;
    else env.trigger.enabled = false;
    dispose();
    assert.equal(env.state.active, env.main);
  }
});

test('cleanup does not steal a new navigation or other-modal focus target', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  const other = env.element('other-modal-control');
  env.state.active = other;
  dispose();
  assert.equal(env.state.active, other);
});

test('cleanup leaves later external overflow changes untouched', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  env.state.overflow.y = { value: 'clip', priority: '' };
  const external = structuredClone(env.state.overflow);
  dispose();
  assert.deepEqual(env.state.overflow, external);
  assert.equal(env.state.writes.length, 1);
});

test('concurrent sessions share scroll ownership and only the last release restores styles', () => {
  const env = environment();
  const before = structuredClone(env.state.overflow);
  const disposeA = startImageLightboxSession(env.ports);
  const disposeB = startImageLightboxSession(env.ports);
  assert.equal(env.state.writes.length, 1);
  disposeA();
  assert.equal(env.state.overflow.overflow.value, 'hidden');
  disposeB();
  assert.deepEqual(env.state.overflow, before);
  assert.equal(env.state.writes.length, 2);
});

test('only the latest live session handles Escape and Tab even when its listener was registered last', () => {
  const env = environment();
  const closeB = env.element('close-B', true), retryB = env.element('retry-B', true);
  const disposeA = startImageLightboxSession({ ...env.ports, isInside: target => target === env.close || target === env.retry });
  const disposeB = startImageLightboxSession({ ...env.ports,
    getInitialFocus: () => closeB, getFocusable: () => [closeB, retryB],
    isInside: target => target === closeB || target === retryB,
    requestClose: () => env.state.closes.push('latest-B'),
  });
  const escape = env.key('Escape');
  assert.deepEqual(env.state.closes, ['latest-B']);
  assert.equal(escape.prevented, 1);
  assert.equal(escape.stopped, 1);
  const tab = env.key('Tab');
  assert.equal(tab.prevented, 1);
  assert.equal(env.state.active, retryB);
  env.key('Tab', { shiftKey: true });
  assert.equal(env.state.active, closeB);
  env.key('Tab', { shiftKey: true });
  assert.equal(env.state.active, retryB);
  disposeB();
  assert.equal(env.state.active, env.close, 'top session returns to the still-live previous lightbox');
  env.key('Escape');
  assert.deepEqual(env.state.closes, ['latest-B', 'initial']);
  disposeA();
  assert.equal(env.state.active, env.trigger);
});

test('disposing an obscured session removes only its own ownership without stealing focus or unlocking body', () => {
  const env = environment();
  const before = structuredClone(env.state.overflow);
  const closeB = env.element('close-B', true), retryB = env.element('retry-B', true);
  const disposeA = startImageLightboxSession({ ...env.ports, isInside: target => target === env.close || target === env.retry });
  const disposeB = startImageLightboxSession({ ...env.ports,
    getInitialFocus: () => closeB, getFocusable: () => [closeB, retryB],
    isInside: target => target === closeB || target === retryB,
    requestClose: () => env.state.closes.push('latest-B'),
  });
  env.close.isConnected = false;
  env.state.active = env.body; // Transient focus loss must not let obscured cleanup focus the page.
  const focusCount = env.state.focused.length;
  disposeA(); disposeA();
  assert.equal(env.state.focused.length, focusCount);
  assert.equal(env.state.active, env.body);
  assert.equal(env.state.overflow.overflow.value, 'hidden');
  assert.equal(env.state.listeners.size, 1);
  env.key('Tab'); assert.equal(env.state.active, closeB);
  env.key('Escape'); assert.deepEqual(env.state.closes, ['latest-B']);
  disposeB();
  assert.equal(env.state.active, env.main);
  assert.deepEqual(env.state.overflow, before);
  assert.equal(env.state.listeners.size, 0);
});

test('Strict-style setup→cleanup→setup and repeated open/close keep focus and lock balanced', () => {
  const env = environment();
  const before = structuredClone(env.state.overflow);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const dispose = startImageLightboxSession(env.ports);
    assert.equal(env.state.listeners.size, 1);
    assert.equal(env.state.active, env.close);
    dispose();
    assert.equal(env.state.listeners.size, 0);
    assert.equal(env.state.active, env.trigger);
    assert.deepEqual(env.state.overflow, before);
  }
});

test('disposed listeners and repeated cleanup cannot act on a subsequent session', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  const stale = [...env.state.listeners][0];
  dispose(); dispose();
  const nextDispose = startImageLightboxSession(env.ports);
  stale({ key: 'Escape', preventDefault() { throw new Error('stale callback ran'); } });
  assert.deepEqual(env.state.closes, []);
  assert.equal(env.state.listeners.size, 1);
  assert.equal(env.state.overflow.overflow.value, 'hidden');
  nextDispose();
  assert.equal(env.state.writes.length, 4);
});

test('detached fallback and disconnected controls are never focused', () => {
  const env = environment();
  const dispose = startImageLightboxSession(env.ports);
  env.trigger.isConnected = false;
  env.main.isConnected = false;
  env.state.targets = [env.retry]; env.retry.isConnected = false;
  env.key('Tab');
  dispose();
  assert.equal(env.state.focused.includes('main'), false);
  assert.equal(env.state.focused.includes('retry'), false);
});
