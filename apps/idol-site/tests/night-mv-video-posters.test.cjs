// Superseded missing-cover/legacy-precedence assertions are covered by the full inventory test.
const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const evidence=require('../evidence/night-mv-video-posters.json');
checkOriginals('night-mv',evidence.entries??evidence.assets);
