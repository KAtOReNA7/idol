// Superseded missing-cover/legacy-precedence assertions are covered by the full inventory test.
const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const evidence=require('../evidence/saymyname-video-posters.json');
checkOriginals('saymyname',evidence.entries??evidence.assets);
