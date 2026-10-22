const test = require('node:test'), assert = require('node:assert/strict');
const {harness, walk} = require('./helpers/triples-image-recovery-harness.cjs');
const find = (node, predicate) => walk(node).find(predicate);
const dialog = (h, className) => h.find(node => node.type === 'dialog' && node.props.className === className);
const recoveries = h => h.all(node => node.props.className === 'ri-recovery');
const retries = h => h.all(node => node.props.className === 'ri-retry' && String(node.props.children).startsWith('重试：'));
const detailImage = h => find(dialog(h, 'detail-dialog'), node => node.type === 'img');
const zoomImage = h => find(dialog(h, 'image-dialog'), node => node.type === 'img');
function openWork(h) {
  const tile = h.find(node => node.type === 'a' && node.props.className === 'video-tile');
  assert.ok(tile, 'the real MV list provides an actionable work');
  tile.props.onClick(); h.render();
  assert.equal(dialog(h, 'detail-dialog').dom.open, true);
}
function openZoom(h) {
  const button = find(dialog(h, 'detail-dialog'), node => node.type === 'button' && node.props.className === 'zoom-button');
  assert.ok(button, 'the real work detail owns a zoom trigger');
  button.props.onClick(); h.render();
  assert.equal(dialog(h, 'image-dialog').dom.open, true);
}
function assertRecoveryOwner(h, owner) {
  assert.equal(recoveries(h).length, 1, 'exactly one recovery region is rendered');
  const region = recoveries(h)[0];
  assert.equal(region.dom.closest('dialog[open]')?.props.className ?? 'main', owner);
  for (const button of retries(h)) {
    assert.equal(button.dom.closest('dialog[open]')?.props.className ?? 'main', owner);
    assert.ok(!button.dom.parent.closest('button,a'), 'retries never nest inside zoom/card interactions');
  }
}

test('real work image failure has one accessible retry in the active detail, not inert main', () => {
  const h = harness(); h.render(); openWork(h);
  const before = JSON.stringify(h.catalog), image = detailImage(h);
  image.props.onError(); h.render();
  assertRecoveryOwner(h, 'detail-dialog');
  const retry = retries(h)[0];
  let stops = 0, prevents = 0;
  retry.props.onClick({stopPropagation() {stops++;}, preventDefault() {prevents++;}});
  h.render();
  assert.equal(stops, 1); assert.equal(prevents, 1);
  assert.equal(detailImage(h).props.src, image.props.src, 'retry preserves the exact verified source');
  assert.notEqual(detailImage(h).dom, image.dom, 'retry mounts a fresh native image attempt');
  assert.equal(recoveries(h).length, 0);
  assert.equal(h.document.activeElement, dialog(h, 'detail-dialog').dom, 'last retry stays in its own dialog instead of the inert main');
  assert.equal(dialog(h, 'detail-dialog').dom.open, true);
  assert.equal(dialog(h, 'image-dialog').dom.open, false);
  assert.equal(JSON.stringify(h.catalog), before);
  assert.equal(h.requests.length, 0); assert.equal(h.assigns.length, 0);
  h.unmount();
});

test('zoom above a work owns the only recovery region; closing returns recovery to the work', () => {
  const h = harness(); h.render(); openWork(h);
  detailImage(h).props.onError(); h.render();
  assertRecoveryOwner(h, 'detail-dialog'); openZoom(h);
  assert.equal(dialog(h, 'detail-dialog').dom.open, true);
  assert.equal(h.document.body.style.overflow, 'hidden');
  assertRecoveryOwner(h, 'image-dialog');
  zoomImage(h).props.onError(); h.render();
  assertRecoveryOwner(h, 'image-dialog'); assert.equal(retries(h).length, 2, 'each failed image instance has one retry, with no duplicate control regions');
  dialog(h, 'image-dialog').props.onCancel(); h.render();
  assert.equal(dialog(h, 'image-dialog').dom.open, false);
  assert.equal(dialog(h, 'detail-dialog').dom.open, true);
  assert.equal(h.document.body.style.overflow, 'hidden');
  assertRecoveryOwner(h, 'detail-dialog'); assert.equal(retries(h).length, 1, 'unmounted zoom failure unregisters');
  dialog(h, 'detail-dialog').props.onCancel(); h.render();
  assert.equal(dialog(h, 'detail-dialog').dom.open, false);
  assert.equal(h.document.body.style.overflow, '');
  assert.equal(recoveries(h).length, 0); assert.equal(h.listenerCount > 0, true);
  h.unmount(); assert.equal(h.listenerCount, 0);
});

test('zoom retries only its chosen image and duplicate activation cannot start a second attempt', () => {
  const h = harness(); h.render(); openWork(h); openZoom(h);
  const old = zoomImage(h), detail = detailImage(h);
  old.props.onError(); h.render(); assertRecoveryOwner(h, 'image-dialog');
  assert.equal(recoveries(h)[0].props.style.color, 'white', 'recovery text retains the existing light caption color on the dark image surface');
  const retry = retries(h)[0]; retry.props.onClick();
  // Repeat the production callback without inventing a second native focus event.
  retry.dom.props.onClick({currentTarget: retry.dom, preventDefault() {}, stopPropagation() {}}); h.render();
  const next = zoomImage(h);
  assert.notEqual(next.dom, old.dom); assert.equal(next.key, 1);
  assert.equal(next.props.src, old.props.src); assert.equal(detailImage(h).dom, detail.dom);
  assert.ok(h.document.activeElement === dialog(h, 'image-dialog').dom, 'last zoom retry retains topmost dialog focus');
  assert.equal(dialog(h, 'image-dialog').dom.open, true);
  assert.equal(h.requests.length, 0); assert.equal(h.assigns.length, 0);
  next.props.onError(); h.render(); assert.equal(retries(h)[0].props.disabled, true);
  h.advance(801); assert.equal(retries(h)[0].props.disabled, false);
  h.unmount();
});

test('closed zoom late load/error and stale retry cannot alter a freshly reopened zoom', () => {
  const h = harness(); h.render(); openWork(h); openZoom(h);
  const old = zoomImage(h); old.props.onError(); h.render(); const staleRetry = retries(h)[0];
  dialog(h, 'image-dialog').props.onCancel(); h.render(); openZoom(h);
  const current = zoomImage(h);
  const focused = h.document.activeElement;
  old.props.onLoad(); old.props.onError(); staleRetry.props.onClick(); h.render();
  assert.equal(h.document.activeElement, focused, 'detached recovery controls cannot focus a later dialog');
  assert.equal(zoomImage(h).dom, current.dom); assert.equal(zoomImage(h).key, 0);
  assert.equal(recoveries(h).length, 0);
  current.props.onError(); h.render(); assertRecoveryOwner(h, 'image-dialog');
  old.props.onLoad(); old.props.onError(); staleRetry.props.onClick(); h.render();
  assertRecoveryOwner(h, 'image-dialog'); assert.equal(retries(h).length, 1);
  assert.equal(dialog(h, 'image-dialog').dom.open, true);
  assert.equal(h.requests.length, 0); h.unmount();
});

test('Back/Forward and repeated close/open transfer recovery ownership without leaving duplicate controls', () => {
  const h = harness(); h.render();
  const background = h.find(node => node.type === 'img'); background.props.onError(); h.render();
  assertRecoveryOwner(h, 'main');
  for (let iteration = 0; iteration < 3; iteration++) {
    openWork(h); assertRecoveryOwner(h, 'detail-dialog'); openZoom(h); assertRecoveryOwner(h, 'image-dialog');
    h.history.back(); h.render();
    assert.equal(dialog(h, 'image-dialog').dom.open, false); assert.equal(dialog(h, 'detail-dialog').dom.open, false);
    assert.equal(h.document.body.style.overflow, ''); assertRecoveryOwner(h, 'main');
    h.history.forward(); h.render(); assertRecoveryOwner(h, 'detail-dialog');
    dialog(h, 'detail-dialog').props.onCancel(); h.render(); assertRecoveryOwner(h, 'main');
  }
  h.unmount(); assert.equal(h.listenerCount, 0); assert.equal(h.document.body.style.overflow, '');
});

test('without a modal the last retry still returns focus to main, and multiple failures retain summary focus', () => {
  const h = harness(); h.render();
  const images = h.all(node => node.type === 'img').slice(0, 2);
  for (const image of images) image.props.onError();
  h.render(); assertRecoveryOwner(h, 'main'); assert.equal(retries(h).length, 2);
  retries(h)[0].props.onClick(); h.render();
  assert.equal(h.document.activeElement.tagName, 'SUMMARY');
  retries(h)[0].props.onClick(); h.render();
  assert.equal(h.document.activeElement.tagName, 'MAIN');
  assert.equal(recoveries(h).length, 0); h.unmount();
});

test('a superseded detail recovery callback cannot move focus away from a newer zoom dialog', () => {
  const h = harness(); h.render(); openWork(h);
  detailImage(h).props.onError(); h.render(); const oldRetry = retries(h)[0];
  openZoom(h); const current = zoomImage(h); current.props.onError(); h.render();
  const currentDialog = dialog(h, 'image-dialog').dom;
  currentDialog.focus();
  oldRetry.dom.props.onClick({currentTarget: oldRetry.dom, preventDefault() {}, stopPropagation() {}});
  h.render();
  assert.ok(h.document.activeElement === currentDialog, 'older recovery does not steal newer modal focus');
  assertRecoveryOwner(h, 'image-dialog');
  assert.equal(retries(h).length, 1, 'only the current zoom failure remains after the explicitly invoked old work retry');
  h.unmount();
});

test('recovery focus never falls through a closed owning dialog to another dialog or main', () => {
  const h = harness(); h.render(); openWork(h);
  detailImage(h).props.onError(); h.render(); const retry = retries(h)[0];
  dialog(h, 'detail-dialog').dom.close();
  h.document.activeElement = retry.dom;
  const attempts = h.focusAttempts.length;
  retry.dom.props.onClick({currentTarget: retry.dom, preventDefault() {}, stopPropagation() {}});
  assert.equal(h.focusAttempts.length, attempts, 'a no-longer-open owning dialog cancels focus restoration');
  h.unmount();
});
