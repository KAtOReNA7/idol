import test from 'node:test';
import assert from 'node:assert/strict';
import {planIdentityQualityReplacements} from '../scripts/replace-mv-identity-quality.mjs';
const baseSha='a'.repeat(64);
function fixture(){
 const before={id:'rating:old',workId:'work',videoId:'video',memberId:'member',qualityTier:'card_only',src:'/artist/mv-identity-20261025/identities/old.jpg',sha256:'b'.repeat(64),width:600,height:400,byteLength:20,legacyProof:{original:['retain','all']}};
 const after={...before,id:undefined,ratingId:'rating',qualityTier:'source_resolution',src:'/artist/mv-identity-batch-w-20261027/identities/new.jpg',sha256:'c'.repeat(64),width:1200,height:1600,byteLength:50,checkedAt:'2026-10-27',sourceCrop:{x:0,y:0,width:1200,height:1600},sourcePageUrl:'https://example.com/series',evidenceLevel:'source_named_photo_set',identityBasis:'source_named',faceIdentityInferred:false,preserveOriginal:true,actual3By4ContactSheetReviewed:true,kind:'concept_photo',label:'同系列概念照 · 认人参考',photoSet:{id:'series',title:'Named set',sourcePageUrl:'https://example.com/series',sourceMemberName:'Member',nameEvidence:'Named caption',seriesEvidence:'Published series',workAssociation:'recognition_reference',workAssociationEvidence:'Recognition only; no claim of contemporaneous video costume',publisherKind:'fan',purpose:'recognition_reference'},photoReview:{reviewed:true,naturalExpression:true,faceClear:true,compositionComplete:true,sameSetReviewed:true,noUpscale:true}};
 delete after.id;
 const audit={identityImages:[before],alternateIdentityImages:[],summary:{identityImages:1,identitySourceRecords:1,cardOnlyImages:1,missingRelationshipImages:3},workCoverage:[{workId:'work',videoId:'video',publicIdentityCount:1,missingIdentityRelationships:[{memberId:'other'}]}],covers:[{videoId:'video'}],personalData:{rating:0,notes:'private note',watched:true},permissions:{ownerOnlySave:true}};
 return {audit,delta:{baseAuditSha256:baseSha,replacements:[{expectedBefore:structuredClone(before),after,review:{approved:true,actual3By4Reviewed:true,reason:'Named coherent high-resolution reference, original preserved'}}]}};
}
const run=(f,verify=()=>{})=>planIdentityQualityReplacements(f.audit,f.delta,verify,baseSha);

test('quality replacement preserves complete old evidence, existing relation and private state',()=>{
 const f=fixture(),initial=structuredClone(f.audit),verified=[];const {audit,replaced}=run(f,r=>verified.push(r.sha256));
 assert.equal(replaced.length,1);assert.deepEqual(audit.alternateIdentityImages,[initial.identityImages[0]]);assert.deepEqual(f.audit,initial);
 for(const k of ['workCoverage','covers','personalData','permissions'])assert.deepEqual(audit[k],initial[k]);
 assert.equal(audit.summary.missingRelationshipImages,3);assert.equal(audit.summary.identityImages,1);assert.equal(audit.summary.cardOnlyImages,0);assert.equal(audit.summary.identitySourceRecords,2);assert.equal(verified.length,2);
 assert.equal(audit.identityImages[0].photoSet.workAssociation,'recognition_reference');
});
test('stale audit or selected metadata, wrong tuple, and changed rating identity are rejected',()=>{
 for(const mutate of [f=>f.delta.baseAuditSha256='d'.repeat(64),f=>f.delta.replacements[0].expectedBefore.width=999,f=>f.delta.replacements[0].after.videoId='other',f=>f.delta.replacements[0].after.ratingId='other']){
  const f=fixture();mutate(f);assert.throws(()=>run(f));assert.equal(f.audit.identityImages[0].qualityTier,'card_only');
 }
});
test('duplicates and replacements of already good selections cannot silently change chosen photos',()=>{
 const d=fixture();d.delta.replacements.push(structuredClone(d.delta.replacements[0]));assert.throws(()=>run(d),/Duplicate/);
 const g=fixture();g.audit.identityImages[0].qualityTier='source_resolution';g.delta.replacements[0].expectedBefore.qualityTier='source_resolution';assert.throws(()=>run(g),/low-resolution/);
});
test('unreviewed, undersized, fake-MV or unproven photo-set candidates remain rejected',()=>{
 for(const mutate of [r=>r.photoReview.faceClear=false,r=>r.sourceCrop={x:0,y:0,width:300,height:400},r=>r.exactVideoEvidence={verified:true},r=>r.photoSet.nameEvidence='',r=>r.sourceCrop.width=1199]){const f=fixture();mutate(f.delta.replacements[0].after);assert.throws(()=>run(f));}
 const f=fixture();f.delta.replacements[0].review.approved=false;assert.throws(()=>run(f),/quality review/);
});
test('either original failing byte verification aborts without partial mutation',()=>{
 for(const fail of ['b','c']){const f=fixture(),initial=structuredClone(f.audit);assert.throws(()=>run(f,r=>{if(r.sha256.startsWith(fail))throw Error('Changed bytes')}),/Changed bytes/);assert.deepEqual(f.audit,initial);}
});
