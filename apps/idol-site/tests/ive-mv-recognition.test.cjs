const test = require('node:test');
const assert = require('node:assert/strict');
const {currentDetail, turn, posts} = require('./helpers/current-work-detail.cjs');
const load = require('./helpers/public-artist-loader.cjs');
const {appendPhotoCandidates} = load('lib/idol/photo-append-candidates.ts');
const loveDive = 'recvxyHuKMaCIP';
const afterLike = 'recvxyHuKMC56f';

function reviewedRows(workId) {
  const h = currentDetail(workId);
  const candidates = appendPhotoCandidates.filter(c => c.workId === workId && c.candidateVersion === 'mv-look.20261018.ive1');
  const seed = h.wp.data.ratings[0];
  h.wp.data.members = candidates.map(c => ({id:c.memberId, stageName:c.memberName.split(' · ')[1], groupIds:h.wp.work.groupIds}));
  h.wp.data.ratings = candidates.map((c, i) => ({
    ...seed, id:c.ratingId, memberIds:[c.memberId], workIds:[c.workId],
    photo:{table:'ratings', recordId:c.ratingId, fieldId:'photos', sourceKind:'mv_look_photo', index:i+1,
      approvedLookIdentity:{sameLook:true, memberId:c.memberId, workId:c.workId, videoId:c.videoId}},
    referencePhoto:{table:'ratings', recordId:c.ratingId, fieldId:'photos', sourceKind:'mv_still', index:0},
  }));
  return {h, candidates};
}
const cast = h => h.find(h.tree(), n => n.props.className === 'section cast-section');
const card = (h, id) => h.find(cast(h), n => n.props.id === 'mv-cast-'+id);
const primary = (h, node) => h.find(node, n => n.type?.name === 'MvIdentityPhoto');
const reference = (h, node) => h.find(node, n => n.type?.name === 'MvPhotoReference');

test('LOVE DIVE retains its member navigation, work editor and one rating editor per recognition card', async () => {
  const {h,candidates} = reviewedRows(loveDive);
  let opened;
  h.wp.onMember = id => {opened=id;};
  await h.settle();
  const first = card(h,candidates[0].ratingId);
  h.find(first, n => n.props.className === 'member-name').props.onClick();
  assert.equal(opened,candidates[0].memberId);
  const editors = Array.from(h.walk(cast(h))).filter(x => x.node.props.table === 'ratings');
  assert.deepEqual(editors.map(x => x.node.props.id), candidates.map(c => c.ratingId));
  const editor = () => h.walk(h.tree()).find(x => x.node.props.table === 'works');
  const mount = editor();
  await turn(h,'stage');
  assert.equal(cast(h).props.hidden,true);
  assert.equal(editor().path,mount.path);
  assert.equal(editor().node.key,mount.node.key);
  await turn(h,'mv');
  assert.equal(cast(h).props.hidden,false);
  assert.equal(posts(h).length,0);
});

test('missing or ambiguously bound photos cannot supply the personal recognition image', async () => {
  const {h} = reviewedRows(loveDive);
  const original = h.wp.data.ratings[0];
  for (const change of [{photo:null}, {photo:{...original.photo, recordId:'wrong'}},
    {memberIds:['unknown']}, {memberIds:[...original.memberIds,'other']}, {workIds:[loveDive,afterLike]},
    {photo:{...original.photo, approvedLookIdentity:{...original.photo.approvedLookIdentity, workId:afterLike}}}]) {
    h.wp.data.ratings[0] = {...original,...change};
    await h.settle();
    assert.equal(primary(h,card(h,original.id)).props.photo,null);
  }
});

test('the five LOVE DIVE and three After LIKE original approvals retain their exact work, member and reference', async () => {
  for (const [id, count] of [[loveDive,5],[afterLike,3]]) {
    const {h,candidates} = reviewedRows(id);
    assert.equal(candidates.length,count);
    const before = JSON.stringify(h.wp.data);
    await h.settle();
    for (const [i,c] of candidates.entries()) {
      const row = card(h,c.ratingId), photo = primary(h,row).props, original = reference(h,row).props;
      assert.equal(photo.work.id,c.workId);
      assert.equal(new URL(photo.work.url).searchParams.get('v'),c.videoId);
      assert.equal(photo.memberId,c.memberId);
      assert.equal(photo.photo.recordId,c.ratingId);
      assert.equal(photo.photo.index,i+1);
      assert.equal(original.referencePhoto.recordId,c.ratingId);
      assert.equal(original.referencePhoto.index,0);
    }
    assert.equal(JSON.stringify(h.wp.data),before);
  }
});

test('an IZ*ONE card uses its own work and retains its original reference image', async () => {
  const h=currentDetail('recvxyH5pza6ks');
  const rating=h.wp.data.ratings[0];
  rating.photo={table:'ratings',recordId:rating.id,fieldId:'photos',index:2};
  rating.personalPhotoEligible=true;
  rating.referencePhoto={...rating.photo,index:0};
  await h.settle();
  const row=card(h,rating.id);
  assert.equal(primary(h,row).props.work.id,h.wp.work.id);
  assert.equal(primary(h,row).props.photo.index,2);
  assert.equal(reference(h,row).props.referencePhoto.index,0);
});
