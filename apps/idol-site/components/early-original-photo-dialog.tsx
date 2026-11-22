// A cold visit can display the SSR photograph before React attaches its handlers.
// Install this beside the artist layout so the first pointer or keyboard activation works.
const earlyPhotoScript = `(() => {
  const registration = Symbol.for('stage.originalPhotoListener');
  if (window[registration]) return;
  Object.defineProperty(window, registration, {value:true});
  function view(dialog) {
    const image = dialog.querySelector('img');
    const error = dialog.querySelector('[role="status"]');
    const close = dialog.querySelector('[data-close]');
    let trigger;
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      dialog.classList.remove('photo-lightbox');
      image.removeAttribute('src');
      if (trigger?.isConnected) trigger.focus({preventScroll:true});
      trigger = undefined;
    });
    image.addEventListener('error', () => { if (dialog.open) error.hidden = false; });
    error.querySelector('button').addEventListener('click', () => {
      if (trigger) { error.hidden = true; image.src = trigger.href; close.focus(); }
    });
    return link => {
      trigger = link;
      trigger.focus({preventScroll:true});
      const label = link.querySelector('img')?.alt || link.getAttribute('aria-label') || '团体原图';
      image.alt = label;
      error.hidden = true;
      image.src = link.href;
      dialog.classList.add('photo-lightbox');
      dialog.showModal();
      close.focus({preventScroll:true});
    };
  }
  const dialogs = new WeakMap();
  function activate(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.type === 'click' ? event.button !== 0 : event.key !== ' ' || event.repeat) return;
    const link = event.target.closest?.('a[data-original-photo]');
    if (!link) return;
    if (!link.dispatchEvent(new Event('stage-original-photo-open', {cancelable:true}))) {
      event.preventDefault();
      return;
    }
    const dialog = document.getElementById('artist-original-before-hydration');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    if (dialog.open) return;
    if (!dialogs.has(dialog)) dialogs.set(dialog, view(dialog));
    dialogs.get(dialog)(link);
  }
  document.addEventListener('click', activate, true);
  document.addEventListener('keydown', activate, true);
})();`;

export function EarlyOriginalPhotoDialog() {
  return <>
    <dialog id="artist-original-before-hydration" aria-labelledby="artist-early-photo-caption" suppressHydrationWarning>
      <button className="photo-lightbox-close" type="button" data-close aria-label="关闭大图">关闭</button>
      <figure>
        <img alt="" decoding="async" suppressHydrationWarning/>
        <p role="status" className="photo-lightbox-error" hidden suppressHydrationWarning>图片暂时打不开。 <button type="button">重试图片</button></p>
        <figcaption id="artist-early-photo-caption">团体原图</figcaption>
      </figure>
    </dialog>
    <script dangerouslySetInnerHTML={{__html: earlyPhotoScript}}/>
  </>;
}
