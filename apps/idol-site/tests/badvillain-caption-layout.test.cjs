const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('BADVILLAIN captions reserve an independent name column and bounded action',()=>{
 const css=fs.readFileSync('app/artists/badvillain/badvillain-artist.css','utf8');
 assert.match(css,/\.bv-design \.portrait-caption\{display:grid;grid-template-columns:minmax\(0,1fr\) auto/);
 assert.match(css,/\.bv-design \.portrait-caption>h3,\.bv-design \.portrait-caption>p\{grid-column:1/);
 assert.match(css,/\.bv-design \.portrait-caption>a\{grid-column:2;grid-row:1 \/ span 2;width:auto/);
 assert.match(css,/\.bv-design \.portrait-caption>a~a\{grid-column:1 \/ -1;grid-row:auto/);
});
