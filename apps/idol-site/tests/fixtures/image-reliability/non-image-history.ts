/** Test-only shape port; not the withheld timeline/global navigation guard. */
export function newArtistHistoryState(current:unknown){return current&&typeof current==='object'&&!Array.isArray(current)?{...current}:{};}

export function tryArtistHistoryChange(change: () => void): boolean {
  change();
  return true;
}

export function focusLinkedRelease(_anchor: HTMLAnchorElement | null): void {
  // The image fixture renders server markup, so it never mounts the release link ref.
}
