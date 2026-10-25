const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const entries=require('../data/udtt-video-posters.json').entries;
checkOriginals('UDTT',entries.map(p=>({...p,sha256:p.src.match(/([a-f0-9]{64})\.jpg$/)[1]})));
