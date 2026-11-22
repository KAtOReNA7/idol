// Public route IDs only. Unlisted records continue to use their ordinary directory return.
const kiofEvents:Record<string,string[]> = {
  "e-kissoflife-formal-debut": ['work-rec28ldfRTrB8a', 'work-rec28ldfRTrLRV', 'work-rec28ldfRTrLVT', 'work-rec28ldfRTrM01', 'work-rec28ldfRTrM44', 'work-rec28ldfRTrM8d'],
  "e-kissoflife-bornxx-release": ['work-rec28ldfRTrBcK', 'work-rec28ldfRTrBgQ'],
  "e-kissoflife-midas-touch-launch-showcase": ['work-rec28ldfRTrBl8', 'work-rec28ldfRTrMcf'],
  "e-kissoflife-midas-touch-music-release": ['work-rec28ldfRTrBl8'],
  "e-kissoflife-sticky-music-release": ['work-rec28ldfRTrBpe'],
  "e-kissoflife-sticky-mv": ['work-rec28ldfRTrBpe'],
  "e-kissoflife-rem-release": ['work-rec28ldfRTrBu6'],
  "e-kissoflife-lose-yourself-release": ['work-rec28ldfRTrByb'],
  "e-kissoflife-kiss-road-release": ['work-rec28ldfRTrMkm'],
  "e-kissoflife-224": ['work-rec28ldfRTrMp2'],
  "e-kissoflife-tokyo-mission-start-release": ['work-rec28ldfRTrMAF'],
  "e-kissoflife-lucky-kr-release": ['work-rec28ldfRTrMEN'],
};
const babymonsterEvents:Record<string,string[]> = {
  "e-babymonster-batter-up-predebut": ['work-rec28ldfRTrArg'],
  "e-babymonster-ahyeon-recording-return": ['member-rec28ldbniB9CH'],
  "e-babymonster-formal-seven-member-debut": ['work-rec28ldfRTrACM'],
  "e-babymonster-drip": ['work-rec28ldfRTrALg', 'work-rec28ldfRTrAPA', 'work-rec28ldfRTrAUD', 'work-rec28ldfRTrAYJ', 'work-rec28ldfRTrLku', 'work-rec28ldfRTrAGW'],
  "e-babymonster-rami-asia-tour-absence-announcement": ['member-rec28ldbniB9KV'],
  "e-babymonster-stuck-in-the-middle-release": ['work-rec28ldfRTrAyp'],
  "e-babymonster-forever-release": ['work-rec28ldfRTrAGW'],
  "e-babymonster-hot-sauce-release": ['work-rec28ldfRTrKKs'],
  "e-babymonster-we-go-up-release": ['work-rec28ldfRTrKOA', 'work-rec28ldfRTrKSn', 'work-rec28ldfRTrKWv'],
  "e-babymonster-choom-release": ['work-rec28ldfRTrL0g'],
  "e-babymonster-sugar-honey-ice-tea-release": ['work-rec28ldfRTrL4q'],
};
const kiofVideos:Record<string,boolean> = {
  rec28ldfRTrN03: true,
  rec28ldfRTrMW0: true,
  rec28ldfRTrMRu: true,
  rec28ldfRTrMMV: true,
  rec28ldfRTrMIP: true,
  rec28ldfRTrMEN: true,
  rec28ldfRTrMAF: true,
  rec28ldfRTrMwG: false,
  rec28ldfRTrMsR: true,
  rec28ldfRTrMp2: true,
  rec28ldfRTrMkm: true,
  rec28ldfRTrByb: true,
  rec28ldfRTrBu6: true,
  rec28ldfRTrMgm: true,
  rec28ldfRTrBpe: true,
  rec28ldfRTrMcf: true,
  rec28ldfRTrBl8: true,
  rec28ldfRTrBgQ: true,
  rec28ldfRTrBcK: true,
  rec28ldfRTrB8a: true,
  rec28ldfRTrM8d: true,
  rec28ldfRTrM44: true,
  rec28ldfRTrM01: true,
  rec28ldfRTrLRV: true,
  rec28ldfRTrLVT: true,
};
export function timelineLinkAnchor(eventId:string, kind:'member'|'work', id:string) {
  return 'event-'+eventId+'-'+kind+'-'+id;
}
export function workLinkAnchor(id:string, stage:boolean) { return (stage?'stage-':'mv-')+id; }

const valid = new Map<string,Set<string>>();
for (const [path,events] of [['/artists/kissoflife',kiofEvents],['/artists/babymonster',babymonsterEvents]] as const) {
  valid.set(path+'?section=updates',new Set(Object.entries(events).flatMap(([event,targets])=>targets.map(t=>'event-'+event+'-'+t))));
}
valid.set('/artists/kissoflife?section=works',new Set(Object.entries(kiofVideos).flatMap(([id,stage])=>
  stage?[workLinkAnchor(id,false),workLinkAnchor(id,true)]:[workLinkAnchor(id,false)])));

export function hasDirectoryRecordAnchor(base:string,anchor:string) {
  const url=new URL(base,'https://site.invalid');
  return !url.searchParams.has('member')&&!!valid.get(url.pathname+'?section='+url.searchParams.get('section'))?.has(anchor);
}

export function directoryRecordReturn(base:string,anchor:string) {
  return hasDirectoryRecordAnchor(base,anchor)?base+'#'+anchor:base;
}
