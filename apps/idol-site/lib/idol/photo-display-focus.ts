/** Pure presentation constraints for exact reviewed original bytes.
 * This is not photo admission evidence. Use only after server approval has bound
 * the candidate ID and SHA. Never infer focus from a member, song or filename.
 * Keep the 700x612 original available separately; do not rewrite its image bytes.
 * Nxde must not become a live default until card rendering applies this focus.
 */
export type PhotoDisplayFocus = Readonly<{
 sourceWidth:number;sourceHeight:number;
 sourceCrop:Readonly<{x:number;y:number;width:number;height:number}>;
 qualityTier:'card_only';maxEffectiveWidth:number;preserveOriginal:true;
}>;
const rightHalf:PhotoDisplayFocus=Object.freeze({
 sourceWidth:700,sourceHeight:612,
 sourceCrop:Object.freeze({x:350,y:0,width:350,height:612}),
 qualityTier:'card_only',maxEffectiveWidth:350,preserveOriginal:true,
});
const reviewedOriginals:readonly Readonly<{candidateId:string;sha256:string}>[]=Object.freeze([
 Object.freeze({"candidateId":"recvxARiP2SvGc:mv-look.20261019.soldelta4:f273785926c0c8895c7128c7bc049bcf7682292bfde40bfb8616b8bd988e09f7","sha256":"f273785926c0c8895c7128c7bc049bcf7682292bfde40bfb8616b8bd988e09f7"}),
 Object.freeze({"candidateId":"recvxARiP2zH0q:mv-look.20261019.soldelta4:ae76173048105b271b83cb7db7dd6d33bc790be8c58bbbc7e2204d64adf59588","sha256":"ae76173048105b271b83cb7db7dd6d33bc790be8c58bbbc7e2204d64adf59588"}),
 Object.freeze({"candidateId":"recvxARiP22f9m:mv-look.20261019.soldelta4:15183e04703b96ef172346bd6c66750b74fb77d8a2b038f424f59b0e4d7fad46","sha256":"15183e04703b96ef172346bd6c66750b74fb77d8a2b038f424f59b0e4d7fad46"}),
 Object.freeze({"candidateId":"recvxARiP2fYjn:mv-look.20261019.soldelta4:96f6bda8acdbe1042501f175d4a26df786124be03d3dfdf3e6ac2fb076f165f1","sha256":"96f6bda8acdbe1042501f175d4a26df786124be03d3dfdf3e6ac2fb076f165f1"}),
 Object.freeze({"candidateId":"recvxARiP2xniJ:mv-look.20261019.soldelta4:46011f56f82824c9acbe2ccdbbfc676835b3cc582cfa21013333da077c3f4f54","sha256":"46011f56f82824c9acbe2ccdbbfc676835b3cc582cfa21013333da077c3f4f54"}),
]);
export function photoDisplayFocus(candidateId:string|null|undefined,sha256:string|null|undefined):PhotoDisplayFocus|null{
 if(!candidateId||!sha256)return null;
 return reviewedOriginals.some(row=>row.candidateId===candidateId&&row.sha256===sha256)?rightHalf:null;
}
