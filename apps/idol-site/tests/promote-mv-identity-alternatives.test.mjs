import test from 'node:test';
import assert from 'node:assert/strict';
import {planIdentityAlternativePromotions} from '../scripts/promote-mv-identity-alternatives.mjs';
const baseSha='a'.repeat(64),oldSha='b'.repeat(64),newSha='c'.repeat(64);
function fixture(){
 const common={workId:'work',videoId:'video',memberId:'member',width:1200,height:1600,byteLength:100,identityBasis:'source_named',faceIdentityInferred:false,contactSheetReviewed:true,preserveOriginal:true,sourcePixelsVerified:true,sourcePageUrl:'https://example.com/mv',sourceImageUrl:'https://example.com/member.jpg',label:'Third-party named MV still',evidenceLevel:'source_named_exact_mv_page',exactVideoEvidence:{videoId:'video',sourceEmbedsExactVideo:true}};
 const before={...common,id:'rating:historical:'+oldSha,qualityTier:'card_only',sha256:oldSha,src:'/artist/mv-identity-20261025/identities/old.jpg',historicalProvenance:{keep:['all','fields']}};
 const alternative={...common,ratingId:'rating',qualityTier:'source_resolution',sha256:newSha,src:'/artist/mv-identity-20261025/identities/new.jpg'};
 const audit={identityImages:[before],alternateIdentityImages:[alternative],unboundApprovedCandidates:[alternative],summary:{identityImages:1,cardOnlyImages:1,identitySourceRecords:2,missingRelationshipImages:7},workCoverage:[{workId:'work',videoId:'video',publicIdentityCount:1,missingIdentityRelationships:[{memberId:'other'}]}],covers:[{videoId:'video'}],personalData:{rating:0,notes:'keep',watched:true},constraints:{noMemberPolicy:'unchanged'}};
 const promotion={workId:'work',videoId:'video',memberId:'member',expectedBefore:{sha256:oldSha,src:before.src,qualityTier:'card_only'},afterSha256:newSha,afterSrc:alternative.src,sourceCrop:{x:150,y:0,width:900,height:1200},review:{approved:true,actual3By4Reviewed:true,sourceNamed:true,exactVideoIdVerified:true,reason:'Reviewed source-named exact video and actual portrait crop.'}};
 return {audit,delta:{baseAuditSha256:baseSha,checkedAt:'2026-10-26',promotions:[promotion]}};
}
const plan=({audit,delta},verify=()=>{})=>planIdentityAlternativePromotions(audit,delta,verify,baseSha);
test('promotes exactly one existing alternative and preserves the complete old record and non-media state',()=>{
 const f=fixture(),input=structuredClone(f.audit),verified=[];
 const {audit,promoted}=plan(f,p=>verified.push(p.sha256));
 assert.equal(promoted.length,1);assert.equal(audit.identityImages[0].sha256,newSha);
 assert.deepEqual(audit.alternateIdentityImages,[input.identityImages[0]]);
 assert.deepEqual(f.audit,input);assert.deepEqual(verified,[oldSha,newSha]);
 for(const field of ['workCoverage','covers','personalData','constraints','unboundApprovedCandidates'])assert.deepEqual(audit[field],input[field]);
 assert.equal(audit.summary.identitySourceRecords,2);assert.equal(audit.summary.missingRelationshipImages,7);assert.equal(audit.summary.cardOnlyImages,0);
 assert.deepEqual(audit.identityImages[0].sourceCrop,{x:150,y:0,width:900,height:1200});
});
test('rejects a changed or absent frozen audit SHA',()=>{
 for(const sha of ['d'.repeat(64),undefined]){const f=fixture();f.delta.baseAuditSha256=sha;assert.throws(()=>plan(f),/Frozen audit/);}
});
test('rejects an exact-video mismatch without changing either collection',()=>{
 const f=fixture();f.delta.promotions[0].videoId='another-video';assert.throws(()=>plan(f),/exact video/);assert.equal(f.audit.identityImages[0].sha256,oldSha);
});
test('rejects stale selected SHA and unknown alternative SHA',()=>{
 const before=fixture();before.delta.promotions[0].expectedBefore.sha256='d'.repeat(64);assert.throws(()=>plan(before),/Selected original/);
 const after=fixture();after.delta.promotions[0].afterSha256='d'.repeat(64);assert.throws(()=>plan(after),/existing alternative/);
});
test('rejects changed before or alternative metadata rather than trusting the review delta',()=>{
 const b=fixture();b.delta.promotions[0].expectedBefore.width=999;assert.throws(()=>plan(b),/Selected original metadata/);
 const a=fixture();a.delta.promotions[0].after={sourcePageUrl:'https://example.com/other-video'};assert.throws(()=>plan(a),/Alternative metadata/);
});
test('rejects duplicate promotions and duplicate alternatives',()=>{
 const p=fixture();p.delta.promotions.push(structuredClone(p.delta.promotions[0]));assert.throws(()=>plan(p),/Duplicate/);
 const a=fixture();a.audit.alternateIdentityImages.push(structuredClone(a.audit.alternateIdentityImages[0]));assert.throws(()=>plan(a),/unique reviewed/);
});
test('rejects out-of-bounds, non-3:4 and undersized display crops',()=>{
 for(const crop of [{x:400,y:0,width:900,height:1200},{x:0,y:0,width:1000,height:1200},{x:0,y:0,width:300,height:400}]){const f=fixture();f.delta.promotions[0].sourceCrop=crop;assert.throws(()=>plan(f),/3:4/);}
 const f=fixture();f.audit.alternateIdentityImages[0].sourceCrop={x:100,y:100,width:1000,height:1400};assert.throws(()=>plan(f),/borders/);
});
test('rejects incomplete manual review, unverified video provenance and different stable rating identity',()=>{
 const r=fixture();r.delta.promotions[0].review.actual3By4Reviewed=false;assert.throws(()=>plan(r),/completed source/);
 const v=fixture();v.audit.alternateIdentityImages[0].exactVideoEvidence.sourceEmbedsExactVideo=false;assert.throws(()=>plan(v),/exact-video provenance/);
 const id=fixture();id.audit.alternateIdentityImages[0].ratingId='different-rating';assert.throws(()=>plan(id),/rating identity/);
});
test('aborts when either original verifier rejects bytes or dimensions',()=>{
 for(const badSha of [oldSha,newSha]){const f=fixture();assert.throws(()=>plan(f,p=>{if(p.sha256===badSha)throw Error('Original SHA/bytes changed');}),/Original SHA/);assert.equal(f.audit.identityImages[0].sha256,oldSha);assert.equal(f.audit.alternateIdentityImages[0].sha256,newSha);}
});
