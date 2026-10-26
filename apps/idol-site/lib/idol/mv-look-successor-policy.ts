import type {MvLookApproval,MvLookTarget} from './mv-look-policy';

// Server projection only. This registry cannot approve/import an image. Each
// attachment must first pass approvedMvLookPhoto against the current exact row.
export type QualifiedMvLookPhoto=Readonly<{index:number;approval:MvLookApproval}>;
export type MvLookPhotoKey=Readonly<{candidateId:string;sha256:string}>;
export type ReviewedMvLookSuccessor=Readonly<{
 ratingId:string;memberId:string;workId:string;videoId:string;
 predecessor:MvLookPhotoKey;successor:MvLookPhotoKey;
}>;

// Populate only after independent admission of BOTH immutable candidates.
// Append explicit reviewed edges; never remove/rewrite the old candidate or
// attachments. The exported registry deeply freezes each exact edge.
// Five independently admitted Nxde original-to-successor pairs, 2026-10-19.
// Exact old records and their source image objects remain recoverable.
const reviewedSuccessorEntries:readonly ReviewedMvLookSuccessor[]=[
  {
    "ratingId": "recvxARiP2zH0q",
    "memberId": "recvxyIzFgRD0w",
    "workId": "recvxyOz5X93Kc",
    "videoId": "fCO7f0SmrDc",
    "predecessor": {
      "candidateId": "recvxARiP2zH0q:mv-look.20261019.soldelta4:ae76173048105b271b83cb7db7dd6d33bc790be8c58bbbc7e2204d64adf59588",
      "sha256": "ae76173048105b271b83cb7db7dd6d33bc790be8c58bbbc7e2204d64adf59588"
    },
    "successor": {
      "candidateId": "recvxARiP2zH0q:mv-look.20261019.soldelta5:15e09f16546bfe8fa342b95c8e5fc37453272f2aad1ad08652e762093d4c28c9",
      "sha256": "15e09f16546bfe8fa342b95c8e5fc37453272f2aad1ad08652e762093d4c28c9"
    }
  },
  {
    "ratingId": "recvxARiP22f9m",
    "memberId": "recvxyICzHYDdj",
    "workId": "recvxyOz5X93Kc",
    "videoId": "fCO7f0SmrDc",
    "predecessor": {
      "candidateId": "recvxARiP22f9m:mv-look.20261019.soldelta4:15183e04703b96ef172346bd6c66750b74fb77d8a2b038f424f59b0e4d7fad46",
      "sha256": "15183e04703b96ef172346bd6c66750b74fb77d8a2b038f424f59b0e4d7fad46"
    },
    "successor": {
      "candidateId": "recvxARiP22f9m:mv-look.20261019.soldelta5:9c6eb4cc168de3c4e83e921ca6bdf589a8b7e890cd212d382cc65dc245a16346",
      "sha256": "9c6eb4cc168de3c4e83e921ca6bdf589a8b7e890cd212d382cc65dc245a16346"
    }
  },
  {
    "ratingId": "recvxARiP2fYjn",
    "memberId": "recvxyICzH4cgr",
    "workId": "recvxyOz5X93Kc",
    "videoId": "fCO7f0SmrDc",
    "predecessor": {
      "candidateId": "recvxARiP2fYjn:mv-look.20261019.soldelta4:96f6bda8acdbe1042501f175d4a26df786124be03d3dfdf3e6ac2fb076f165f1",
      "sha256": "96f6bda8acdbe1042501f175d4a26df786124be03d3dfdf3e6ac2fb076f165f1"
    },
    "successor": {
      "candidateId": "recvxARiP2fYjn:mv-look.20261019.soldelta5:9230d7f8e7a465735debae745732f60875159199a51b0c17ba456a77891bef14",
      "sha256": "9230d7f8e7a465735debae745732f60875159199a51b0c17ba456a77891bef14"
    }
  },
  {
    "ratingId": "recvxARiP2SvGc",
    "memberId": "recvxyICzHZFRP",
    "workId": "recvxyOz5X93Kc",
    "videoId": "fCO7f0SmrDc",
    "predecessor": {
      "candidateId": "recvxARiP2SvGc:mv-look.20261019.soldelta4:f273785926c0c8895c7128c7bc049bcf7682292bfde40bfb8616b8bd988e09f7",
      "sha256": "f273785926c0c8895c7128c7bc049bcf7682292bfde40bfb8616b8bd988e09f7"
    },
    "successor": {
      "candidateId": "recvxARiP2SvGc:mv-look.20261019.soldelta5:5c6375c0ab8a5a697052da38ed5c9601b26a8300d929c69d1824489beeb64fc4",
      "sha256": "5c6375c0ab8a5a697052da38ed5c9601b26a8300d929c69d1824489beeb64fc4"
    }
  },
  {
    "ratingId": "recvxARiP2xniJ",
    "memberId": "recvxyICzHP2fv",
    "workId": "recvxyOz5X93Kc",
    "videoId": "fCO7f0SmrDc",
    "predecessor": {
      "candidateId": "recvxARiP2xniJ:mv-look.20261019.soldelta4:46011f56f82824c9acbe2ccdbbfc676835b3cc582cfa21013333da077c3f4f54",
      "sha256": "46011f56f82824c9acbe2ccdbbfc676835b3cc582cfa21013333da077c3f4f54"
    },
    "successor": {
      "candidateId": "recvxARiP2xniJ:mv-look.20261019.soldelta5:ca07067a1c3ce69dcc3efd96487b3844c3e58ae22fea016f4db00cf7ee55ee6d",
      "sha256": "ca07067a1c3ce69dcc3efd96487b3844c3e58ae22fea016f4db00cf7ee55ee6d"
    }
  }
];
export const reviewedMvLookSuccessors:readonly ReviewedMvLookSuccessor[]=Object.freeze(
 reviewedSuccessorEntries.map(r=>Object.freeze({...r,
  predecessor:Object.freeze({...r.predecessor}),successor:Object.freeze({...r.successor}),
 })),
);

const sameKey=(key:MvLookPhotoKey,approval:MvLookApproval)=>
 key.candidateId===approval.candidateId&&key.sha256===approval.sha256;
const validKey=(key:MvLookPhotoKey|null|undefined):key is MvLookPhotoKey=>
 !!key&&typeof key.candidateId==='string'&&!!key.candidateId.trim()&&/^[a-f0-9]{64}$/.test(key.sha256);

/** Select only an already-qualified singleton or one exact reviewed pair.
 * No timestamp, version ordering, attachment order, or client preference is
 * evidence. null preserves the caller's existing ambiguous/legacy fallback.
 * One edge per target is supported intentionally. Multi-step chains, forks,
 * merges, duplicates and cycles remain unresolved, even if an intermediate
 * image is not attached. A future chain policy needs separate review/tests.
 */
export function selectReviewedMvLookPhoto(
 qualified:readonly QualifiedMvLookPhoto[],target:MvLookTarget,
 reviews:readonly ReviewedMvLookSuccessor[]=reviewedMvLookSuccessors,
):QualifiedMvLookPhoto|null{
 // Preserve the existing singleton decision, including before successor upload.
 if(qualified.length===1)return qualified[0];
 if(qualified.length!==2||target.memberIds.length!==1||target.workIds.length!==1||
    !target.memberExists||!target.workExists||!target.videoId)return null;
 if(qualified.some(x=>!Number.isSafeInteger(x.index)||x.index<0)||qualified[0].index===qualified[1].index)return null;
 if(qualified.some(({approval:a})=>a.ratingId!==target.ratingId||a.memberId!==target.memberIds[0]||
    a.workId!==target.workIds[0]||a.videoId!==target.videoId))return null;

 // A contradictory entry must not disappear just because it claims another
 // tuple. Count entries sharing this rating OR either qualified candidate ID.
 const candidateIds=new Set(qualified.map(x=>x.approval.candidateId));
 const relevant=reviews.filter(r=>r.ratingId===target.ratingId||
  candidateIds.has(r.predecessor?.candidateId??'')||candidateIds.has(r.successor?.candidateId??''));
 if(relevant.length!==1)return null;
 const review=relevant[0];
 if(review.ratingId!==target.ratingId||review.memberId!==target.memberIds[0]||
    review.workId!==target.workIds[0]||review.videoId!==target.videoId||
    !validKey(review.predecessor)||!validKey(review.successor)||
    review.predecessor.candidateId===review.successor.candidateId||
    review.predecessor.sha256===review.successor.sha256)return null;
 const predecessor=qualified.filter(x=>sameKey(review.predecessor,x.approval));
 const successor=qualified.filter(x=>sameKey(review.successor,x.approval));
 return predecessor.length===1&&successor.length===1?successor[0]:null;
}
