const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('MADEIN history entry accurately labels its existing MADEIN timeline destination',()=>{
 const source=fs.readFileSync('components/candidate/madein-design.tsx','utf8');
 assert.doesNotMatch(source,/查看相关前史|>LIMELIGHT <ArrowUpRight/);
 assert.match(source,/href="\/artists\/madein\?section=updates">查看团体历程 →/);
 assert.match(source,/>团体历程<\/p><a href="\/artists\/madein\?section=updates">MADEIN/);
});
