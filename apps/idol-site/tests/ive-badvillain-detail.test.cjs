const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {currentDetail,turn,assertDetailLinks,assertWorkDrafts}=require('./helpers/current-work-detail.cjs');
const {approvedVideoPoster}=require('./helpers/public-artist-loader.cjs')('lib/idol/approved-video-poster.ts');

for (const [group,id] of [['IVE','recvxyHuKMG1Mr'],['BADVILLAIN','rec28ldfRTrQ0L']]) {
  test(group+' uses the exact MV cover and keeps stage changes out of MV playback',async()=>{
    const h=currentDetail(id); await h.settle();
    const player=h.player(), video=new URL(h.wp.work.url).searchParams.get('v');
    assert.equal(player.props.videoId,video); assert.equal(player.props.sourceKey,null);
    assert.equal(player.props.posterSrc,approvedVideoPoster(id,video,'mv').src);
    assert.equal(approvedVideoPoster('wrong-record',video,'mv'),null);
    assert.equal(approvedVideoPoster(id,'wrong-video','mv'),null);
    await turn(h,'stage'); assert.equal(h.player().props.videoId,h.wp.work.stage.videoId);
    assert.notEqual(h.player().props.posterSrc,player.props.posterSrc);
  });
  test(group+' preserves decimal, zero and null across tabs, conflicts and retries',()=>assertWorkDrafts(id));
  test(group+' routes the group and return actions through the parent',()=>assertDetailLinks(id));
}
test('the nine originally approved MV photos and all accompanying release and logo files retain their bytes',()=>{
  const manifest=require('./fixtures/editorial-detail-assets.json');
  assert.equal(manifest.filter(x=>x.mediaType==='mv-preview').length,9);
  for(const asset of manifest){
    const bytes=fs.readFileSync(path.join(__dirname,'../public',asset.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
    assert.ok(asset.width>0 && asset.height>0);
  }
});
