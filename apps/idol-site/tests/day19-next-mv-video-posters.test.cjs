// Superseded missing-cover/legacy-precedence assertions are covered by the full inventory test.
const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const evidence=require('../evidence/day19-next-mv-video-posters.json');
checkOriginals('day19-next-mv',evidence.entries??evidence.assets);
