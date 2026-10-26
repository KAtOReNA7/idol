const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const entries=require('../data/vcha-video-posters.json').entries,assets=require('../data/vcha-review-assets.json').assets;
checkOriginals('VCHA',entries.map(p=>({...assets.find(a=>a.url===p.src),src:p.src})));
