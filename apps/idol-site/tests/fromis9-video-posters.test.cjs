// Superseded missing-cover/legacy-precedence assertions are covered by the full inventory test.
const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const evidence=require('../evidence/fromis9-video-posters.json');
checkOriginals('fromis9',evidence.entries??evidence.assets);
