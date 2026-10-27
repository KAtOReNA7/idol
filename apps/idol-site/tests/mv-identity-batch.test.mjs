import test from 'node:test';import assert from 'node:assert/strict';
import {planIdentityBatch,publicIdentityPath,batchReviewDate} from '../scripts/import-mv-identity-batch.mjs';
test('receipt date follows the reviewed batch and rejects missing, mixed or invalid dates',()=>{
 assert.equal(batchReviewDate([{checkedAt:'2026-10-27'}]),'2026-10-27');
 assert.equal(batchReviewDate([{checkedAt:'2026-10-26'},{checkedAt:'2026-10-26'}]),'2026-10-26');
 for(const rows of [[],[{}],[{checkedAt:'2026-10-27'},{}],[{checkedAt:'2026-02-30'}],[{checkedAt:'2026-10-26'},{checkedAt:'2026-10-27'}]])assert.throws(()=>batchReviewDate(rows),/review date/);
});
const row={workId:'work-a',videoId:'exact-video',memberId:'member-a',src:'/artist/mv-identity-batch-a-20261026/identities/test.jpg',width:600,height:800,byteLength:123,sha256:'a'.repeat(64),label:'第三方具名 MV 截图',sourcePageUrl:'https://example.test/named-mv',qualityTier:'source_resolution',evidenceLevel:'source_named_unique_mv_chapter',sourceCrop:{x:0,y:0,width:600,height:800}};
const fixture=()=>({identityImages:[],summary:{identitySourceRecords:0},workCoverage:[{workId:'work-a',videoId:'exact-video',groups:['Fixture'],relationshipCount:1,publicIdentityCount:0,missingIdentityRelationships:[{memberId:'member-a'}],memberScoringDecision:'keep',noExistingRelationships:false}],personalRecord:'unchanged sentinel'});
test('reviewed batch supplements an existing exact tuple without changing its relationship or scoring policy',()=>{const source=fixture(),before=structuredClone(source);const {audit,admitted}=planIdentityBatch(source,[{identityImages:[row]}],()=>{});assert.deepEqual(source,before);assert.equal(admitted.length,1);assert.equal(audit.workCoverage[0].relationshipCount,1);assert.equal(audit.workCoverage[0].memberScoringDecision,'keep');assert.equal(audit.personalRecord,before.personalRecord);assert.equal(audit.summary.missingRelationshipImages,0);});
test('same-song alternate video or an unbound member cannot receive the portrait',()=>{for(const change of [{videoId:'alternate-video'},{memberId:'unbound-member'},{workId:'other-work'}])assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[{...row,...change}]}],()=>{}),/No existing exact-video member relationship/);});
test('one failed original prevents partial application; duplicated tuples and traversal are rejected',()=>{const source=fixture(),before=structuredClone(source);assert.throws(()=>planIdentityBatch(source,[{identityImages:[row]}],()=>{throw Error('Original SHA changed');}),/Original SHA/);assert.deepEqual(source,before);assert.throws(()=>planIdentityBatch(source,[{identityImages:[row,row]}],()=>{}),/Duplicate/);assert.throws(()=>planIdentityBatch(source,[{identityImages:[{...row,src:'/artist/mv-identity-batch-a-20261026/identities/../test.jpg'}]}],()=>{}),/Invalid public/);});
test('pending concept provenance and out-of-frame crops cannot silently enter the public runtime',()=>{assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[{...row,evidenceLevel:'concept-photo-pending'}]}],()=>{}),/Unreviewed provenance/);assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[{...row,sourceCrop:{x:100,y:0,width:600,height:800}}]}],()=>{}),/Crop outside original/);});
test('the batch cannot reduce missing counts by admitting card-only low-resolution candidates',()=>{assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[{...row,qualityTier:'card_only'}]}],()=>{}),/quality threshold/);});
test('only reviewed A-M and the exact dated N directory extend the original path boundary',()=>{
 for(const batch of ['d','e','f','g','h','i','j','k','l','m'])assert.equal(planIdentityBatch(fixture(),[{identityImages:[{...row,src:`/artist/mv-identity-batch-${batch}-20261026/identities/test.jpg`}]}],()=>{}).admitted.length,1);
 assert.equal(planIdentityBatch(fixture(),[{identityImages:[{...row,src:'/artist/mv-identity-batch-n-20261027/identities/test.jpg'}]}],()=>{}).admitted.length,1);
 for(const src of ['/artist/mv-identity-batch-n-20261026/identities/test.jpg','/artist/mv-identity-batch-o-20261027/identities/test.jpg','/artist/mv-identity-batch-d-20261027/identities/test.jpg','/artist/mv-identity-batch-d-20261026/identities/nested/test.jpg','/artist/private/identities/test.jpg'])assert.equal(publicIdentityPath.test(src),false,src);
});
test('a high-resolution label cannot admit a small visible crop from a wide original',()=>{
 for(const change of [{width:736,height:491,sourceCrop:undefined},{width:539,height:1000,sourceCrop:undefined},{width:1200,height:1600,sourceCrop:{x:0,y:0,width:800,height:719}}]){
  const source=fixture(),before=structuredClone(source);
  assert.throws(()=>planIdentityBatch(source,[{identityImages:[{...row,...change}]}],()=>{}),/540px quality threshold/);
  assert.deepEqual(source,before);
 }
});
test('the exact 540px visible-width boundary is accepted without upscaling',()=>{
 assert.equal(planIdentityBatch(fixture(),[{identityImages:[{...row,width:1280,height:720,sourceCrop:undefined}]}],()=>{}).admitted.length,1);
});
const visualRow=()=>({...row,evidenceLevel:'source_named_frame_with_official_video_match',identityBasis:'source_named',faceIdentityInferred:false,independentFrameVerification:false,versionReview:{targetVideoId:row.videoId,reviewed:true,identityFromNamedSource:true,faceIdentityInferred:false,matchBasis:'Named source composition and graphics match the target video opening.',references:[{videoId:row.videoId,role:'target_mv',url:'https://i.ytimg.com/sb/exact-video/storyboard3_L2/M0.jpg',sha256:'b'.repeat(64),sampleTimestampSeconds:12}]}});
test('visual version evidence requires the named source and exact target video, not facial inference',()=>{
 assert.equal(planIdentityBatch(fixture(),[{identityImages:[visualRow()]}],()=>{}).admitted.length,1);
 for(const change of [{versionReview:undefined},{identityBasis:'visual_guess'},{faceIdentityInferred:true},{independentFrameVerification:true},{versionReview:{...visualRow().versionReview,targetVideoId:'other-video'}},{versionReview:{...visualRow().versionReview,references:[]}}])assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[{...visualRow(),...change}]}],()=>{}),/version review/i);
});
test('official scene evidence rejects wrong-video URLs, missing hashes and unreviewed timestamps',()=>{
 for(const change of [{url:'https://example.test/sb/exact-video/M0.jpg'},{url:'https://i.ytimg.com/sb/other-video/M0.jpg'},{sha256:''},{sampleTimestampSeconds:-1}]){
  const p=visualRow();Object.assign(p.versionReview.references[0],change);
  assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}),/storyboard reference/);
 }
});
test('a shoot article that does not say MV also needs separately documented official MV-shoot footage',()=>{
 const p=visualRow();p.evidenceLevel='official_named_shoot_with_official_mv_set_match';p.exactVideoEvidence={sourceExplicitlyNamesMvShoot:false};
 assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}),/separately reviewed/);
 Object.assign(p.versionReview,{officialBehindVideoId:'behindvid01',officialBehindTitle:'Official MV Shooting #2'});
 p.versionReview.references.push({videoId:'behindvid01',role:'official_mv_shoot',url:'https://i.ytimg.com/sb/behindvid01/storyboard3_L3/M1.jpg',sha256:'c'.repeat(64),sampleTimestampSeconds:90});
 assert.equal(planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}).admitted.length,1);
 p.exactVideoEvidence.sourceExplicitlyNamesMvShoot=true;
 assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}),/separately reviewed/);
});
const nativeFrame=()=>({...row,evidenceLevel:'official_named_mv_video_frame',identityBasis:'source_named',faceIdentityInferred:false,frameEvidence:{targetVideoId:row.videoId,scaled:false,sourceVideoWidth:row.width,sourceVideoHeight:row.height,timestampSeconds:12,sourceVideoSha256:'d'.repeat(64),sourceVideoId:row.videoId,sourceVideoUrl:'https://www.youtube.com/watch?v='+row.videoId,sourceVideoTitle:'Official MV',sourceVideoRole:'target_mv',extractionCommand:'ffmpeg -i original.mp4 -ss 12 -frames:v 1 original.png',targetVersionProof:'Downloaded the exact catalog video.',nameEvidence:{type:'in_frame_text',text:'Explicit member name'}}});
test('decoded frames retain native dimensions and require explicit name and video provenance',()=>{
 assert.equal(planIdentityBatch(fixture(),[{identityImages:[nativeFrame()]}],()=>{}).admitted.length,1);
 for(const change of [{scaled:true},{sourceVideoWidth:300},{sourceVideoSha256:''},{timestampSeconds:-1},{targetVideoId:'other-video'},{targetVersionProof:''}]){
  const p=nativeFrame();Object.assign(p.frameEvidence,change);assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}),/native named-video/);
 }
 for(const change of [{sourceVideoUrl:'https://www.youtube.com/watch?v=other-video'},{sourceVideoId:'other-video',sourceVideoUrl:'https://www.youtube.com/watch?v=other-video'},{nameEvidence:{type:'face_similarity',text:'Guess'}},{nameEvidence:{type:'official_manual_subtitle',text:'Name'}}]){
  const p=nativeFrame();Object.assign(p.frameEvidence,change);assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}),/video URL|explicit name/);
 }
 const p=nativeFrame();p.frameEvidence.nameEvidence={type:'official_manual_subtitle',text:'Name',subtitleSha256:'e'.repeat(64),autoGenerated:false,subtitleStartSeconds:11,subtitleEndSeconds:13};
 assert.equal(planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}).admitted.length,1);
 p.frameEvidence.timestampSeconds=14;
 assert.throws(()=>planIdentityBatch(fixture(),[{identityImages:[p]}],()=>{}),/explicit name/);
});
