const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const entries=require('../data/izna-video-posters.json').entries,assets=require('../data/izna-assets.json');
checkOriginals('izna',entries.map(p=>({...assets.find(a=>a.url===p.src),src:p.src})));
