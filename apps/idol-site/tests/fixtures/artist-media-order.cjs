const groups = new Map();
function register(slugs, homeVideo, homeRelease, worksVideo = homeVideo, worksRelease = null) {
  for (const slug of slugs.split(' ')) {
    groups.set(slug, {homeVideo, homeRelease, worksVideo, worksRelease});
  }
}

// The selectors point to real cards or their primary action in each approved design.
register('triples madein rescene qwer purplekiss illit ive', '.sr-work', '.sr-release', '.sr-work', '.sr-release');
register('meovv', '.mf-work-featured', '.mf-release-image', '.mf-work', '.mf-release-image');
register('genblue', '.gb-video-row', '.gb-release-focus a', '.gb-video-row', '.gb-release-row');
register('unis', '.uf-work-grid a', '.uf-featured-release', '.uf-work-row', '.uf-release-row');
register('badvillain', 'article.film', '.lead-record', 'article.film', 'article.record');
register('vvup', '.vu-video', '.vu-releases a');
register('youngposse bewave', '.video-row', 'article.record', '.video-row', 'article.record');
register('candyshop', '.cs-video-row', '.cs-record', '.cs-video-row', '.cs-record');
for (const [slug, prefix] of Object.entries({
  oddyouth:'oy', adya:'idol-adya', geenius:'idol-geenius', tracer:'tr', witchx:'wk', spia:'sp',
})) {
  register(slug, '.'+prefix+'-video', '.'+prefix+'-release', '.'+prefix+'-video', '.'+prefix+'-release');
}
for (const [slug, prefix] of Object.entries({vcha:'vc', hitgs:'hg', atheart:'ah'})) {
  register(slug, '.'+prefix+'-video', 'button.'+prefix+'-release');
}
register('idle', '.idv-hero-mv', '.idv-latest-cover', '.idv-film', '.idv-release');
for (const [slug, prefix] of Object.entries({
  izone:'iz', fromis9:'f9', everglow:'eg', rocketpunch:'rp', cherrybullet:'cb', weeekly:'wk',
})) {
  register(slug, 'article.'+prefix+'-film', 'article.'+prefix+'-release');
}
register('loona', '[data-home-video-id]', '[data-release-key]', '.ln-inner-work', '.ln-inner-release-grid article');
register('wooah', '.wa-video-mv', '.wa-release-home', '.wa-video-mv', '.wa-record');
register('billlie', '.bf-hero-mv', '.bf-hero .bf-square', '.bf-work', '[data-design-release]');
register('kep1er', '.kf-work-row', '.kf-home-releases', '.kf-work-row', '.kf-release-card');
register('newjeans', '.nj-media-grid article', '.nj-feature-release', '#newjeans-videos article', '#newjeans-releases article');
register('babymonster', '.as-featured', '.as-releases a', '.as-work-row');
register('aespa xg', '.nx-work', '.nx-releases a');
register('kissoflife', '.kf-release-song a', '.kf-album-cover', '.kf-work');
register('stayc', '.sc-release-song a', '.sc-album-cover', '.sc-work');
register('lesserafim', '.lf-release-song a', '.lf-album-cover', '.lf-work');
register('nmixx', '.nx-work', '.nx-discography a');
register('itzy', '.iz-work', '.iz-discography a');
register('hearts2hearts', '.h2h-watch a', '.h2h-music-cover', '.h2h-work');
register('kiiikiii', '.kk-work', '.kk-release-grid article');
register('saymyname', '.smn-work', '.smn-lead-release');
register('katseye', '.ke-work', '.ke-latest-art');
// Several legacy records URLs reuse the works directory. MEOVV has its own list of linked MVs.
const recordsMix = new Set(["meovv","genblue","unis","badvillain","youngposse","bewave","candyshop","oddyouth","adya","geenius","tracer","witchx","spia","loona","billlie","kep1er","newjeans"]);
for (const [slug, scope] of groups) {
  if (recordsMix.has(slug)) {
    scope.recordsVideo = slug === 'meovv' ? '.mf-record-list a' : scope.worksVideo;
    scope.recordsRelease = scope.worksRelease;
  }
}
module.exports = groups;
