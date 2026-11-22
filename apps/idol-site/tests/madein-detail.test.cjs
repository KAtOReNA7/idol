const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {currentDetail,turn,input,assertWorkDrafts,assertDetailLinks}=require('./helpers/current-work-detail.cjs');
const {groupArtistUrl}=require('./helpers/public-artist-loader.cjs')('lib/idol/artist-navigation.ts');

const superObvious='rec28ldfRTrPen';
const saturn='rec28ldfRTrCHR';
const madein='rec28ldfRTiCzI';
const publicDir=path.join(__dirname,'../public');
const originalImages='/artist/madein/figma-20261017/';

// Re-render the actual work page when its catalog entry is corrected in place.
function playerAfterChange(h,work){
  h.wp.work=work;
  return h.find(h.renderWork(),node=>node.props.workId===work.id && 'embedUrl' in node.props).props;
}

test('MADEIN imagery matches stable work ID and exact source, and rejects reused stage clips',async()=>{
  const h=currentDetail(superObvious);
  await h.settle();
  const work=h.wp.work, player=h.player().props;
  assert.deepEqual(work.groupIds,[madein]);
  assert.equal(player.videoId,'yE6yETkVI3Q');
  assert.equal(player.posterSrc,'/artist/mv-identity-20261025/covers/yE6yETkVI3Q.jpg');
  assert.equal(playerAfterChange(h,{...work,id:'recOther',groupIds:[]}).posterSrc,undefined);
  assert.equal(playerAfterChange(h,{...work,url:'https://www.youtube.com/watch?v=abcdefghijk'}).posterSrc,undefined);
  playerAfterChange(h,work);
  await turn(h,'stage');
  assert.match(work.stage.title,/Mnet.*260212/);
  assert.equal(h.player().props.videoId,'eucm0SOw4QQ');
  assert.equal(h.player().props.posterSrc,'/artist/stage-video-previews/eucm0SOw4QQ.webp');
  assert.equal(h.player().props.posterLabel,'对应舞台视频封面');
  for(const change of [{videoId:'abcdefghijk'},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{clip:{startSeconds:10,endSeconds:20}}]){
    assert.equal(playerAfterChange(h,{...work,stage:{...work.stage,...change}}).posterSrc,undefined);
  }
});

test('MADEIN rating switches preserve Editor position, decimal zero, clear-to-null and failed drafts',async()=>{
  const h=currentDetail(superObvious);
  await h.settle();
  assert.equal(input(h,'MV 分数').props.step,'0.1');
  await assertWorkDrafts(superObvious);
});

test('MADEIN navigation uses guarded artist callback and preserves non-MADEIN branch',async()=>{
  await assertDetailLinks(superObvious);
  assert.equal(groupArtistUrl(madein),'/artists/madein');
  const h=currentDetail(superObvious);
  h.wp.work={...h.wp.work,groupIds:['recOtherGroup']};
  h.wp.data.groups=[{id:'recOtherGroup',name:'Other group'}];
  let target;
  h.wp.onGroup=id=>{target=id;};
  const links=h.find(h.renderWork(),node=>node.type?.name==='GroupLinks');
  const button=h.find(links.type(links.props),node=>node.type==='button');
  assert.equal(h.txt(button),'Other group');
  button.props.onClick();
  assert.equal(target,'recOtherGroup');
  assert.equal(groupArtistUrl(target),null);
  for(const name of ['madein-logo.png','super-obvious-mv.jpg','saturn-mv.jpg','love-afraid-mv.jpg','super-obvious-ep916-figma-render.png']){
    assert.ok(fs.statSync(path.join(publicDir,originalImages,name)).size>0,name);
  }
});

test('missing MADEIN rating artwork is omitted without an audit placeholder',async()=>{
  const h=currentDetail(superObvious);
  const rating=h.wp.data.ratings[0];
  h.wp.data.ratings.push({...rating,id:'recForeignRating',workIds:[saturn]});
  await h.settle();
  const card=h.find(h.tree(),node=>node.props.id==='mv-cast-'+rating.id);
  const photo=h.find(card,node=>node.type?.name==='MvIdentityPhoto');
  assert.equal(photo.props.work.id,superObvious);
  assert.equal(photo.props.memberId,rating.memberIds[0]);
  assert.equal(photo.props.photo,null);
  assert.equal(h.find(card,node=>node.props.table==='ratings').props.id,rating.id);
  const editors=h.walk(h.tree()).filter(({node})=>node.props.table==='ratings');
  assert.deepEqual(Array.from(editors,({node})=>node.props.id),[rating.id]);
  assert.doesNotMatch(h.txt(card),/封面待补|来源待确认/);
});

test('SATURN stage artwork matches the production dated performance and fails closed on source drift',async()=>{
  const h=currentDetail(saturn);
  await h.settle();
  const work=h.wp.work, stage=work.stage;
  assert.equal(h.player().props.videoId,'PVbqyKzfAjI');
  assert.equal(h.player().props.posterSrc,'/artist/mv-identity-20261025/covers/PVbqyKzfAjI.jpg');
  await turn(h,'stage');
  assert.equal(stage.videoId,'Xc1x-CuRjj0');
  assert.match(stage.title,/THE SHOW 250311/);
  assert.equal(h.player().props.url,stage.url);
  assert.equal(h.player().props.posterSrc,'/artist/stage-video-previews/Xc1x-CuRjj0.webp');
  assert.equal(h.player().props.posterLabel,'对应舞台视频封面');
  for(const change of [{videoId:'abcdefghijk'},{url:'https://www.youtube.com/watch?v=abcdefghijk'},{clip:{startSeconds:1,endSeconds:5}}]){
    assert.equal(playerAfterChange(h,{...work,stage:{...stage,...change}}).posterSrc,undefined);
  }
  h.wp.work={...work,stage:null};
  assert.equal(h.find(h.renderWork(),node=>node.props.workId===saturn && 'embedUrl' in node.props),undefined);
  const other=playerAfterChange(h,{...work,id:'recOther',groupIds:[]});
  assert.equal(other.view,'mv');
  assert.equal(other.posterSrc,undefined);
  // The retained SBS image refers to this same broadcast, separately from the current video cover.
  const evidence=require('../data/madein-stage-image-evidence.json');
  assert.equal(evidence.workId,saturn);
  assert.equal(evidence.videoId,stage.videoId);
  assert.equal(evidence.url,stage.url);
  assert.match(evidence.observedTitle,/THE SHOW 250311/);
  const bytes=fs.readFileSync(path.join(publicDir,evidence.image));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),evidence.sha256);
  assert.equal(evidence.exactYouTubeOriginalThumbnail,false);
});
