/** Test-only shape port; not the withheld timeline/global navigation guard. */
export function newArtistHistoryState(current:unknown){return current&&typeof current==='object'&&!Array.isArray(current)?{...current}:{};}
