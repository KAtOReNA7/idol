// The production IAB check and the local browser runner use the same card selectors.
const groups = require('./artist-media-order.cjs');
const registry = require('../../data/artist-timeline-registry.json');
const native = {
  ifeye: {
    home:['.video-section .work-card[data-work-key*="-mv-"]','.release-section .release-card'],
    works:['.catalog-results .work-card','.catalog-results .release-card','video'],
    records:['.catalog-results .work-card','.catalog-results .release-card','album'],
  },
  izna: {
    home:['.home-films .film[data-video-key*="-mv-"]','.record-section .release-focus'],
    works:['.library-films .film','.record-grid article.record'],
    records:['.library-films .film','.record-grid article.record','album'],
  },
  udtt: {
    home:['[data-home-module="mv"] .ud-film-card','.ud-home-works .ud-edition'],
    works:['.ud-films .ud-film-card','.ud-edition'],
    records:['.ud-films .ud-film-card','.ud-edition','album'],
  },
};

const routes = [];
for (const group of registry) {
  const design = groups.get(group.slug);
  const views = native[group.slug] || {
    home:design.hero
      ? [design.hero.video+', '+design.homeVideo,design.hero.release+', '+design.homeRelease]
      : [group.slug === 'vcha' ? '.vc-video[href*="view=works"]' : design.homeVideo,design.homeRelease],
    works:[design.worksVideo,design.worksRelease],
    records:[design.recordsVideo,design.recordsRelease],
  };
  for (const [view, [video,album,mode='mixed']] of Object.entries(views)) {
    if (!video || !album) continue;
    const path = group.path + (view === 'home' ? '' : '?section=' + view);
    routes.push({slug:group.slug,view,path,video,album,mode});
  }
}
module.exports = routes;
