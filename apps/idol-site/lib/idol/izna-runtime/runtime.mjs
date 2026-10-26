import {deepActiveElement} from './focus.mjs';
// Private module state coordinates BODY fallback across independently owned hosts.
const sharedKeyboardDialogs=new WeakMap();
/* Owned public presentation scopes. No private API, authentication or persistence. */
export function createAstraRuntime(window){
const document=window.document,location=window.location;
'use strict';
const scopes=new Set(),owners=new WeakMap(),dialogOwners=new WeakMap(),keyboardDialogs=sharedKeyboardDialogs,bootstraps=new WeakMap(),rootStates=new WeakMap(),scopeDisposers=new WeakMap();let serial=0;
const widthThresholds=Object.freeze([320,359,360,479,480,599,600,639,640,699,700,767,768,799,800,899,900,959,960,991,992,1023,1024,1199,1200,1279,1280,1439,1440,1599,1600,1919,1920,2559,2560]);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(v,base){if(!v)return '';try{const u=new URL(String(v),base||location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch(_){return '';}}
function assetUrl(a,base){if(!a)return '';if(typeof a==='string')return safeUrl(a,base);if(a.localSrc)return safeUrl(a.localSrc,base);const b=window.ASTRA_ASSET_BASE;if(b!=null&&a.path?.startsWith('/')&&!a.path.includes('..'))return safeUrl(String(b).replace(/\/$/,'')+a.path,base);return safeUrl(a.url||a.src||a.path,base);}
const assetQualityPolicies=Object.freeze([{"key":"groups/izna/assets/group-original.png","slug":"izna","aliases":["groups/izna/assets/group-original.png","assets/group-original.png"],"nativeWidth":1500,"nativeHeight":2100,"maxWidth":1500,"maxHeight":2100,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["hero"],"eligibility":{"standardMemberPortrait":false,"groupVisual":true,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/portrait-rec28ldbniBc6L.jpg","slug":"izna","aliases":["groups/izna/assets/portrait-rec28ldbniBc6L.jpg","assets/portrait-rec28ldbniBc6L.jpg"],"nativeWidth":900,"nativeHeight":900,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/portrait-rec28ldbniBcnd.jpg","slug":"izna","aliases":["groups/izna/assets/portrait-rec28ldbniBcnd.jpg","assets/portrait-rec28ldbniBcnd.jpg"],"nativeWidth":900,"nativeHeight":900,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/portrait-rec28ldbniBcvH.jpg","slug":"izna","aliases":["groups/izna/assets/portrait-rec28ldbniBcvH.jpg","assets/portrait-rec28ldbniBcvH.jpg"],"nativeWidth":900,"nativeHeight":900,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/portrait-rec28ldbniBcDI.jpg","slug":"izna","aliases":["groups/izna/assets/portrait-rec28ldbniBcDI.jpg","assets/portrait-rec28ldbniBcDI.jpg"],"nativeWidth":900,"nativeHeight":900,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/portrait-rec28ldbniBcMa.jpg","slug":"izna","aliases":["groups/izna/assets/portrait-rec28ldbniBcMa.jpg","assets/portrait-rec28ldbniBcMa.jpg"],"nativeWidth":900,"nativeHeight":900,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/portrait-rec28ldbniBcVa.jpg","slug":"izna","aliases":["groups/izna/assets/portrait-rec28ldbniBcVa.jpg","assets/portrait-rec28ldbniBcVa.jpg"],"nativeWidth":900,"nativeHeight":900,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/c-task03-izna-yoon-ji-yoon.display.webp","slug":"izna","aliases":["groups/izna/assets/c-task03-izna-yoon-ji-yoon.display.webp","assets/c-task03-izna-yoon-ji-yoon.display.webp"],"nativeWidth":900,"nativeHeight":1259,"maxWidth":900,"maxHeight":1259,"grade":"historical_reference","fit":"contain","fullComposition":true,"roles":["historical_reference"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"历史资料照","sourceUrl":"https://www.spotvnews.co.kr/news/articleView.html?idxno=716361"},{"key":"groups/izna/assets/cover-izna-na.jpg","slug":"izna","aliases":["groups/izna/assets/cover-izna-na.jpg","assets/cover-izna-na.jpg"],"nativeWidth":2560,"nativeHeight":2560,"maxWidth":2560,"maxHeight":2560,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/n-a/"},{"key":"groups/izna/assets/cover-izna-13.jpg","slug":"izna","aliases":["groups/izna/assets/cover-izna-13.jpg","assets/cover-izna-13.jpg"],"nativeWidth":2560,"nativeHeight":2560,"maxWidth":2560,"maxHeight":2560,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/sign/"},{"key":"groups/izna/assets/cover-izna-12.jpg","slug":"izna","aliases":["groups/izna/assets/cover-izna-12.jpg","assets/cover-izna-12.jpg"],"nativeWidth":2560,"nativeHeight":2560,"maxWidth":2560,"maxHeight":2560,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/beep/"},{"key":"groups/izna/assets/cover-izna-11.jpg","slug":"izna","aliases":["groups/izna/assets/cover-izna-11.jpg","assets/cover-izna-11.jpg"],"nativeWidth":2560,"nativeHeight":2560,"maxWidth":2560,"maxHeight":2560,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/not-just-pretty/"},{"key":"groups/izna/assets/cover-izna-10.jpg","slug":"izna","aliases":["groups/izna/assets/cover-izna-10.jpg","assets/cover-izna-10.jpg"],"nativeWidth":2560,"nativeHeight":2560,"maxWidth":2560,"maxHeight":2560,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/set-the-tempo/"},{"key":"groups/ifeye/assets/hero.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/hero.jpg","assets/hero.jpg"],"nativeWidth":1600,"nativeHeight":833,"maxWidth":1440,"maxHeight":750,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["hero"],"eligibility":{"standardMemberPortrait":false,"groupVisual":true,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/portrait-recvxAPQCFX60u.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/portrait-recvxAPQCFX60u.jpg","assets/portrait-recvxAPQCFX60u.jpg"],"nativeWidth":642,"nativeHeight":900,"maxWidth":560,"maxHeight":785,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/portrait-recvxAPQCFjuA9.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/portrait-recvxAPQCFjuA9.jpg","assets/portrait-recvxAPQCFjuA9.jpg"],"nativeWidth":642,"nativeHeight":900,"maxWidth":560,"maxHeight":785,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/portrait-recvxAPQCFVvLu.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/portrait-recvxAPQCFVvLu.jpg","assets/portrait-recvxAPQCFVvLu.jpg"],"nativeWidth":642,"nativeHeight":900,"maxWidth":560,"maxHeight":785,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/portrait-recvxAPQCFJZLq.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/portrait-recvxAPQCFJZLq.jpg","assets/portrait-recvxAPQCFJZLq.jpg"],"nativeWidth":642,"nativeHeight":900,"maxWidth":560,"maxHeight":785,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/portrait-recvxAPQCFkzV2.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/portrait-recvxAPQCFkzV2.jpg","assets/portrait-recvxAPQCFkzV2.jpg"],"nativeWidth":642,"nativeHeight":900,"maxWidth":560,"maxHeight":785,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/portrait-recvxAPQCFuwFz.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/portrait-recvxAPQCFuwFz.jpg","assets/portrait-recvxAPQCFuwFz.jpg"],"nativeWidth":642,"nativeHeight":900,"maxWidth":560,"maxHeight":785,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["member_portrait"],"eligibility":{"standardMemberPortrait":true,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.hihat.co.kr/eng/artist/458"},{"key":"groups/ifeye/assets/cover-erlu-blue.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/cover-erlu-blue.jpg","assets/cover-erlu-blue.jpg"],"nativeWidth":600,"nativeHeight":600,"maxWidth":600,"maxHeight":600,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://www.genie.co.kr/detail/albumInfo?axnm=86055117"},{"key":"groups/izna/assets/vnext2-cover-izna-love-all-japanese.jpg","slug":"izna","aliases":["groups/izna/assets/vnext2-cover-izna-love-all-japanese.jpg","assets/vnext2-cover-izna-love-all-japanese.jpg"],"nativeWidth":1200,"nativeHeight":1200,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://music.bugs.co.kr/album/39903774?wl_ref=list_ab_01_ar"},{"key":"groups/izna/assets/vnext2-cover-izna-dumb-hot-japanese.jpg","slug":"izna","aliases":["groups/izna/assets/vnext2-cover-izna-dumb-hot-japanese.jpg","assets/vnext2-cover-izna-dumb-hot-japanese.jpg"],"nativeWidth":1200,"nativeHeight":1200,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://music.bugs.co.kr/album/40771053?wl_ref=M_contents_01_04"},{"key":"groups/izna/assets/vnext2-cover-izna-handle-with-care.jpg","slug":"izna","aliases":["groups/izna/assets/vnext2-cover-izna-handle-with-care.jpg","assets/vnext2-cover-izna-handle-with-care.jpg"],"nativeWidth":1200,"nativeHeight":1200,"maxWidth":600,"maxHeight":600,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://music.bugs.co.kr/album/40842515"},{"key":"groups/ifeye/assets/vnext2-cover-ifeye-sweet-tang.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/vnext2-cover-ifeye-sweet-tang.jpg","assets/vnext2-cover-ifeye-sweet-tang.jpg"],"nativeWidth":1200,"nativeHeight":1200,"maxWidth":800,"maxHeight":800,"grade":"visual_main_or_portrait","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://music.bugs.co.kr/album/4123168"},{"key":"groups/ifeye/assets/vnext2-cover-ifeye-as-if.jpg","slug":"ifeye","aliases":["groups/ifeye/assets/vnext2-cover-ifeye-as-if.jpg","assets/vnext2-cover-ifeye-as-if.jpg"],"nativeWidth":1200,"nativeHeight":1200,"maxWidth":700,"maxHeight":700,"grade":"card_only","fit":"contain","fullComposition":true,"roles":["release_cover"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":true,"nativeBrandVector":false,"exactOriginalVideoPreview":false},"caption":"","sourceUrl":"https://music.bugs.co.kr/album/4145455?wl_ref=list_tr_11_mab"},{"key":"groups/izna/assets/izna-publisher-preview-_kxr2D8-tq8.jpg","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-_kxr2D8-tq8.jpg","assets/izna-publisher-preview-_kxr2D8-tq8.jpg"],"nativeWidth":2560,"nativeHeight":1440,"maxWidth":960,"maxHeight":540,"grade":"preview_only","fit":"contain","fullComposition":true,"roles":["video_preview"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":true},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/izna-publisher-preview-NQRGAh7ukh8.jpg","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-NQRGAh7ukh8.jpg","assets/izna-publisher-preview-NQRGAh7ukh8.jpg"],"nativeWidth":1920,"nativeHeight":1080,"maxWidth":960,"maxHeight":540,"grade":"preview_only","fit":"contain","fullComposition":true,"roles":["video_preview"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":true},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/izna-publisher-preview-2fyFx2u5fbU.png","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-2fyFx2u5fbU.png","assets/izna-publisher-preview-2fyFx2u5fbU.png"],"nativeWidth":490,"nativeHeight":266,"maxWidth":490,"maxHeight":266,"grade":"preview_only","fit":"contain","fullComposition":true,"roles":["video_preview"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":true},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"},{"key":"groups/izna/assets/izna-publisher-preview-d3mqW9wqqx0.jpg","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-d3mqW9wqqx0.jpg","assets/izna-publisher-preview-d3mqW9wqqx0.jpg"],"nativeWidth":1920,"nativeHeight":1080,"maxWidth":960,"maxHeight":540,"grade":"preview_only","fit":"contain","fullComposition":true,"roles":["video_preview"],"eligibility":{"standardMemberPortrait":false,"groupVisual":false,"sameBoundReleaseCover":false,"nativeBrandVector":false,"exactOriginalVideoPreview":true},"caption":"","sourceUrl":"https://wake-one.com/en/artists/izna/"}]);
const qualityAliases=new Map(),qualityAbsoluteAliases=new Map();
function indexQualityAlias(map,key,policy){if(!map.has(key))map.set(key,policy);else if(map.get(key)!==policy)map.set(key,null);}
for(const policy of assetQualityPolicies)for(const alias of policy.aliases){indexQualityAlias(qualityAliases,policy.slug+'\0'+alias,policy);if(/^https?:\/\//.test(alias)||alias.startsWith('groups/')||alias.startsWith('/'))indexQualityAlias(qualityAbsoluteAliases,alias,policy);}
function positive(value){const n=Number(value);return Number.isFinite(n)&&n>0?n:0;}
function lowerPositive(...values){const nums=values.map(positive).filter(Boolean);return nums.length?Math.min(...nums):0;}
function matchQualityAlias(raw,slug,base){
 if(typeof raw!=='string'||!raw)return null;const value=raw.startsWith('./')?raw.slice(2):raw,scopedKey=slug+'\0'+value;
 if(slug&&qualityAliases.has(scopedKey))return qualityAliases.get(scopedKey);
 if(qualityAbsoluteAliases.has(value)){const exact=qualityAbsoluteAliases.get(value);return exact&&(!slug||exact.slug===slug)?exact:null;}
 let matched=null;
 if(base)for(const policy of assetQualityPolicies){if(slug&&policy.slug!==slug)continue;for(const alias of policy.aliases){if(!alias.startsWith('assets/'))continue;if(safeUrl(alias,base)===value){if(matched&&matched!==policy)return null;matched=policy;}}}
 return matched;
}
function qualityPolicy(asset,slug,base){
 // localSrc is authoritative because both resolvedAsset and assetUrl preserve it.
 // Without it, host-path and URL priorities depend on host configuration. Every
 // supplied render/reuse candidate must agree on the same exact reviewed file;
 // unknown/conflicting candidates fail closed without calling the host resolver.
 if(typeof asset==='string')return matchQualityAlias(asset,slug,base);
 if(!asset||typeof asset!=='object')return null;
 if(asset.localSrc)return matchQualityAlias(asset.localSrc,slug,base);
 const values=[asset.existingPublicPath,asset.path,asset.existingPath,asset.url,asset.src].filter(value=>typeof value==='string'&&value);
 if(!values.length)return null;let matched=null;
 for(const value of values){const policy=matchQualityAlias(value,slug,base);if(!policy||matched&&matched!==policy)return null;matched=policy;}
 return matched;
}

// Identity evidence is inherited from the accepted image manifest, never from a URL.
const canonicalAssetIdentityRows=Object.freeze([{"assetKey":"groups/izna/assets/group-original.png","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"31139045704dc66a4101af43a9e74bb067f37e403a2d8b6e1d4f753316e9fe2c","bytes":5568135,"width":1500,"height":2100,"aliases":["groups/izna/assets/group-original.png","assets/group-original.png"]},{"assetKey":"groups/izna/assets/portrait-rec28ldbniBc6L.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"2afceb0450c61ade0eba305818c9715739d25a07c6d871c8aa16193418e81ec9","bytes":216817,"width":900,"height":900,"aliases":["groups/izna/assets/portrait-rec28ldbniBc6L.jpg","assets/portrait-rec28ldbniBc6L.jpg"]},{"assetKey":"groups/izna/assets/portrait-rec28ldbniBcnd.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"037a6167f8e8d46e305a0fa787f6155d8f08a231aadc90655cad748293eddec1","bytes":224490,"width":900,"height":900,"aliases":["groups/izna/assets/portrait-rec28ldbniBcnd.jpg","assets/portrait-rec28ldbniBcnd.jpg"]},{"assetKey":"groups/izna/assets/portrait-rec28ldbniBcvH.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"00eca03289d8b41e5dafebebad857a017f25d697a18ed0a112818c5b68410dd0","bytes":216686,"width":900,"height":900,"aliases":["groups/izna/assets/portrait-rec28ldbniBcvH.jpg","assets/portrait-rec28ldbniBcvH.jpg"]},{"assetKey":"groups/izna/assets/portrait-rec28ldbniBcDI.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"8d1cb307812623c29da9f309d16024473838dceee9691c716cc879031dec7666","bytes":202622,"width":900,"height":900,"aliases":["groups/izna/assets/portrait-rec28ldbniBcDI.jpg","assets/portrait-rec28ldbniBcDI.jpg"]},{"assetKey":"groups/izna/assets/portrait-rec28ldbniBcMa.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"19e301feec0276c9b5bd87093a46b9e0d1dbb70961abe129cb76c97e945a838e","bytes":237857,"width":900,"height":900,"aliases":["groups/izna/assets/portrait-rec28ldbniBcMa.jpg","assets/portrait-rec28ldbniBcMa.jpg"]},{"assetKey":"groups/izna/assets/portrait-rec28ldbniBcVa.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"675d3bbdf84a374e449d2e58e5b89ee9fc3930f56c66242a9498035a7e3d9e2f","bytes":205719,"width":900,"height":900,"aliases":["groups/izna/assets/portrait-rec28ldbniBcVa.jpg","assets/portrait-rec28ldbniBcVa.jpg"]},{"assetKey":"groups/izna/assets/c-task03-izna-yoon-ji-yoon.display.webp","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"16d38555d27b650b17e21a5b9ced0c18a922712fe9e186a4dddfeb136e56eeba","bytes":181526,"width":900,"height":1259,"aliases":["groups/izna/assets/c-task03-izna-yoon-ji-yoon.display.webp","assets/c-task03-izna-yoon-ji-yoon.display.webp"]},{"assetKey":"groups/izna/assets/cover-izna-na.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"5be8c048c833efdd87d680a9d47970eda247fe4dd91cd9d19527b99203bc7479","bytes":623988,"width":2560,"height":2560,"aliases":["groups/izna/assets/cover-izna-na.jpg","assets/cover-izna-na.jpg"]},{"assetKey":"groups/izna/assets/cover-izna-13.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"0a8bfc8cbc3d65da80fdffac9a1aa72545647c6ba3b119cb39fca9ba190a51e7","bytes":304990,"width":2560,"height":2560,"aliases":["groups/izna/assets/cover-izna-13.jpg","assets/cover-izna-13.jpg"]},{"assetKey":"groups/izna/assets/cover-izna-12.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"7cb0c186a7a9837f61d092b55e1f9fa300829d0e4b353582a52b7cf67e025f2f","bytes":968234,"width":2560,"height":2560,"aliases":["groups/izna/assets/cover-izna-12.jpg","assets/cover-izna-12.jpg"]},{"assetKey":"groups/izna/assets/cover-izna-11.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"bc0e720c14847083a5edefaac48cc4ea21d86f09de8baa39dadc1cbd55baa739","bytes":400903,"width":2560,"height":2560,"aliases":["groups/izna/assets/cover-izna-11.jpg","assets/cover-izna-11.jpg"]},{"assetKey":"groups/izna/assets/cover-izna-10.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"a3872153996e57669369dfcbf6a4abbe7becc3cf3c98b614ff5b2ad6c179a1b4","bytes":1168302,"width":2560,"height":2560,"aliases":["groups/izna/assets/cover-izna-10.jpg","assets/cover-izna-10.jpg"]},{"assetKey":"groups/ifeye/assets/hero.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"686ce12e9d653f33bf4c6114da187d1cb185d193cf7e70a8a8dc978d8c7119a5","bytes":359064,"width":1600,"height":833,"aliases":["groups/ifeye/assets/hero.jpg","assets/hero.jpg"]},{"assetKey":"groups/ifeye/assets/portrait-recvxAPQCFX60u.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"ad30c73c6ea17d3785f4da4b49dc15880d49f7fd088ce03aa7655b413d2b126d","bytes":122041,"width":642,"height":900,"aliases":["groups/ifeye/assets/portrait-recvxAPQCFX60u.jpg","assets/portrait-recvxAPQCFX60u.jpg"]},{"assetKey":"groups/ifeye/assets/portrait-recvxAPQCFjuA9.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"8647a28695b1391dae0a7333766d609395e2adbde328327d87d8f6c07484bebe","bytes":152616,"width":642,"height":900,"aliases":["groups/ifeye/assets/portrait-recvxAPQCFjuA9.jpg","assets/portrait-recvxAPQCFjuA9.jpg"]},{"assetKey":"groups/ifeye/assets/portrait-recvxAPQCFVvLu.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"fc224ad23bca4a10fc86c3e899653ba81a3ebe450748a25ace20148a02c09b8c","bytes":122414,"width":642,"height":900,"aliases":["groups/ifeye/assets/portrait-recvxAPQCFVvLu.jpg","assets/portrait-recvxAPQCFVvLu.jpg"]},{"assetKey":"groups/ifeye/assets/portrait-recvxAPQCFJZLq.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"7f06bac47b8cf79d37d560666e734d5672d80c1cc357df4c05dc1be448db3711","bytes":134304,"width":642,"height":900,"aliases":["groups/ifeye/assets/portrait-recvxAPQCFJZLq.jpg","assets/portrait-recvxAPQCFJZLq.jpg"]},{"assetKey":"groups/ifeye/assets/portrait-recvxAPQCFkzV2.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"f5435b3d0ea17e7f76ee653749465eef2471b2394476b42b2e8324d55f3f3bc5","bytes":110864,"width":642,"height":900,"aliases":["groups/ifeye/assets/portrait-recvxAPQCFkzV2.jpg","assets/portrait-recvxAPQCFkzV2.jpg"]},{"assetKey":"groups/ifeye/assets/portrait-recvxAPQCFuwFz.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"bd843d74a80c66a2be943d9e7b8bcbff1997898438575c83a467272b71861d8c","bytes":117596,"width":642,"height":900,"aliases":["groups/ifeye/assets/portrait-recvxAPQCFuwFz.jpg","assets/portrait-recvxAPQCFuwFz.jpg"]},{"assetKey":"groups/ifeye/assets/cover-erlu-blue.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"362b36e472040a9f9ff3d94400c1354a847097aae1a7cc4799a1ebe490ae6ca4","bytes":58974,"width":600,"height":600,"aliases":["groups/ifeye/assets/cover-erlu-blue.jpg","assets/cover-erlu-blue.jpg"]},{"assetKey":"groups/izna/assets/vnext2-cover-izna-love-all-japanese.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"34519a6fd6556e8c4ded80cc29328d3cb898a215339e1fbf90a5ac9613b38173","bytes":681247,"width":1200,"height":1200,"aliases":["groups/izna/assets/vnext2-cover-izna-love-all-japanese.jpg","assets/vnext2-cover-izna-love-all-japanese.jpg"]},{"assetKey":"groups/izna/assets/vnext2-cover-izna-dumb-hot-japanese.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"d82a1f766ae1be3f2340dd2975eaddc3271bcf7c20e9a628d5ae91a209d7bcc2","bytes":495648,"width":1200,"height":1200,"aliases":["groups/izna/assets/vnext2-cover-izna-dumb-hot-japanese.jpg","assets/vnext2-cover-izna-dumb-hot-japanese.jpg"]},{"assetKey":"groups/izna/assets/vnext2-cover-izna-handle-with-care.jpg","groupId":"rec28ldfRTiCpp","slug":"izna","sha256":"d82a1f766ae1be3f2340dd2975eaddc3271bcf7c20e9a628d5ae91a209d7bcc2","bytes":495648,"width":1200,"height":1200,"aliases":["groups/izna/assets/vnext2-cover-izna-handle-with-care.jpg","assets/vnext2-cover-izna-handle-with-care.jpg"]},{"assetKey":"groups/ifeye/assets/vnext2-cover-ifeye-sweet-tang.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"d8d5cf7eee2d35f59351e4a5afb6489ddebf6f2f1baa2a3cbfe7ff0fe6391962","bytes":457532,"width":1200,"height":1200,"aliases":["groups/ifeye/assets/vnext2-cover-ifeye-sweet-tang.jpg","assets/vnext2-cover-ifeye-sweet-tang.jpg"]},{"assetKey":"groups/ifeye/assets/vnext2-cover-ifeye-as-if.jpg","groupId":"rec28ldfRTiCGa","slug":"ifeye","sha256":"b6dd1571c3f918a179be288dd8d3fb0523ca9ed97bc4a4375830752c21e40764","bytes":572975,"width":1200,"height":1200,"aliases":["groups/ifeye/assets/vnext2-cover-ifeye-as-if.jpg","assets/vnext2-cover-ifeye-as-if.jpg"]},{"assetKey":"groups/izna/assets/izna-publisher-preview-_kxr2D8-tq8.jpg","sha256":"8f4d589b32a69c0b8effd52a1b521ea3b445894a98c83055fc4538b2fb895f7c","bytes":329525,"width":2560,"height":1440,"groupId":"rec28ldfRTiCpp","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-_kxr2D8-tq8.jpg","assets/izna-publisher-preview-_kxr2D8-tq8.jpg"]},{"assetKey":"groups/izna/assets/izna-publisher-preview-NQRGAh7ukh8.jpg","sha256":"1772b4a9836dccea8e3937b184a8cdef27c1d96f478a09b359106b603d637241","bytes":192948,"width":1920,"height":1080,"groupId":"rec28ldfRTiCpp","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-NQRGAh7ukh8.jpg","assets/izna-publisher-preview-NQRGAh7ukh8.jpg"]},{"assetKey":"groups/izna/assets/izna-publisher-preview-2fyFx2u5fbU.png","sha256":"a925f610f73969aec1a1f50bf4ba83a1ec0bac3584b14f009f7b65ba91680b0b","bytes":246997,"width":490,"height":266,"groupId":"rec28ldfRTiCpp","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-2fyFx2u5fbU.png","assets/izna-publisher-preview-2fyFx2u5fbU.png"]},{"assetKey":"groups/izna/assets/izna-publisher-preview-d3mqW9wqqx0.jpg","sha256":"04be26d1684ef164e65b5ae66d36b048fefebb17735a05a9d8cf6a8789a40b58","bytes":1056371,"width":1920,"height":1080,"groupId":"rec28ldfRTiCpp","slug":"izna","aliases":["groups/izna/assets/izna-publisher-preview-d3mqW9wqqx0.jpg","assets/izna-publisher-preview-d3mqW9wqqx0.jpg"]}].map(row=>Object.freeze(row)));
const canonicalAssetIdentityMap=new Map(canonicalAssetIdentityRows.map(row=>[row.assetKey,row]));
function canonicalAssetIdentity(asset,slug,base){
 const q=qualityPolicy(asset,slug,base);let key=q?.key||null;
 if(!key&&asset&&typeof asset==='object'&&typeof asset.localSrc==='string'){
  const local=asset.localSrc.replace(/^\.\//,'');
  if(/^assets\/[A-Za-z0-9_.\/-]+$/.test(local)&&!local.split('/').includes('..'))key='groups/'+slug+'/'+local;
 }
 const entry=key&&canonicalAssetIdentityMap.get(key);
 return entry&&entry.slug===slug?entry:null;
}
function assetQuality(asset,purpose='card',slug,base){
 const requested=String(purpose||'card'),policy=qualityPolicy(asset,slug,base),a=asset&&typeof asset==='object'?asset:{};
 const vector=policy?.grade==='vector_only',nativeWidth=positive(policy?.nativeWidth)||positive(a.width)||positive(a.expectedDimensions?.width),nativeHeight=positive(policy?.nativeHeight)||positive(a.height)||positive(a.expectedDimensions?.height);
 let maxWidth=vector?0:lowerPositive(policy?.maxWidth,nativeWidth,a.width,a.expectedDimensions?.width,a.recommendedMaxDisplayPixels),maxHeight=vector?0:lowerPositive(policy?.maxHeight,nativeHeight,a.height,a.expectedDimensions?.height,a.recommendedMaxDisplayPixels);
 let effectivePurpose=requested,caption=policy?.caption||'',allowZoom=!!policy&&policy.grade==='visual_main_or_portrait'&&nativeWidth>200&&nativeHeight>200&&maxWidth>200&&maxHeight>200;
 const related=policy?.key.includes('/soompi-')||a.usage==='mv_related_article_illustration';
 const historical=policy?.grade==='historical_reference'||/historical/.test(a.qualityScope||a.usage||'');
 if(requested==='video-preview'&&!policy?.eligibility.exactOriginalVideoPreview){effectivePurpose=related?'related-illustration':'unavailable';allowZoom=false;}
 if(related){effectivePurpose='related-illustration';caption='报道配图';allowZoom=false;}
 else if(historical){effectivePurpose=policy?.eligibility.sameBoundReleaseCover&&requested.startsWith('release-')?requested:'related-illustration';caption||=policy?.key.includes('yuina')?'历史成员资料图':'历史资料照';allowZoom=false;}
 else if(policy?.grade==='card_only'){effectivePurpose=requested.startsWith('release-')?requested:policy.roles.includes('member_portrait')?'member-card':'card';allowZoom=false;}
 if(vector){effectivePurpose='logo';allowZoom=false;}
 if(policy?.grade==='unusable'){effectivePurpose='unavailable';allowZoom=false;}
 if(!asset||requested==='logo'||requested==='related-illustration'||effectivePurpose==='unavailable')allowZoom=false;
 const capWidth=maxWidth?'max-width:min(100%, '+maxWidth+'px)!important;':'max-width:100%!important;',capHeight=maxHeight?'max-height:'+maxHeight+'px!important;':'';
 const full='border-radius:0!important;clip-path:none!important;mask:none!important;-webkit-mask:none!important;';
 const ratio=nativeWidth&&nativeHeight?'aspect-ratio:'+nativeWidth+' / '+nativeHeight+'!important;':'';
 const containerStyle='display:block!important;box-sizing:border-box!important;width:100%!important;height:auto!important;min-width:0!important;min-height:0!important;'+capWidth+capHeight+ratio+full+'overflow:hidden!important;margin-inline:auto!important;';
 const imageStyle='display:block!important;box-sizing:border-box!important;width:100%!important;height:auto!important;min-width:0!important;min-height:0!important;'+capWidth+capHeight+'object-fit:contain!important;object-position:center!important;'+full;
 return{sourceUrl:policy?.sourceUrl||a.sourceUrl||null,key:policy?.key||null,nativeWidth:nativeWidth||null,nativeHeight:nativeHeight||null,maxWidth:maxWidth||null,maxHeight:maxHeight||null,fit:'contain',allowZoom,fullComposition:true,caption,containerStyle,imageStyle,effectivePurpose};
}
function image(a,alt,o={},base,quality){
 const q=quality||assetQuality(a,o.purpose||'card',null,base),src=q.effectivePurpose==='unavailable'?'':assetUrl(a,base),label=String(alt||'图片'),w=q.nativeWidth||0,h=q.nativeHeight||0;
 const dims=w&&h?' width="'+w+'" height="'+h+'"':'',native=(w?' data-astra-native-width="'+w+'"':'')+(h?' data-astra-native-height="'+h+'"':'');
 const policyAttrs=' data-astra-quality-key="'+esc(q.key||'')+'" data-astra-purpose="'+esc(q.effectivePurpose)+'" data-astra-quality-zoom="'+(q.allowZoom?'true':'false')+'"'+(q.maxWidth?' data-astra-quality-max-width="'+q.maxWidth+'"':'')+(q.maxHeight?' data-astra-quality-max-height="'+q.maxHeight+'"':'')+(q.sourceUrl?' data-astra-source="'+esc(safeUrl(q.sourceUrl,base))+'"':'');
 const retryable=o.purpose==='member-detail'?' data-astra-image-retryable="true"':'';
 const fallback='<span class="asset-fallback"'+(src?' aria-hidden="true"':' role="img" aria-label="'+esc(label)+'"')+'><span>'+esc(label)+'</span></span>';
 const body='<span class="asset-frame '+esc(o.className||'')+(src?'':' failed')+'"'+native+policyAttrs+' style="'+esc(q.containerStyle+(src?'':'min-height:120px!important;'))+'">'+(src?'<img src="'+esc(src)+'" alt="'+esc(label)+'"'+dims+retryable+' style="'+esc(q.imageStyle)+'" loading="'+(o.eager?'eager':'lazy')+'" decoding="async">':'')+fallback+'</span>';
 const zoom=o.zoom&&src&&q.allowZoom;
 const rendered=zoom?'<button type="button" class="asset-zoom" data-astra-zoom="'+esc(src)+'" data-astra-alt="'+esc(label)+'"'+native+policyAttrs+' style="'+esc(q.containerStyle)+'" aria-label="放大'+esc(label)+'">'+body+'</button>':body;
 const credit=q.caption||(o.showCredit&&(a?.label||a?.caption)?a.label||a.caption:'');return rendered+(credit?'<span class="astra-asset-credit">'+esc(credit)+'</span>':'');
}
function href(page,id,params){const p=new URLSearchParams();for(const[k,v]of Object.entries(params||{}))if(v!=null&&v!=='')p.set(k,String(v));return '#/'+(page||'home')+(id?'/'+encodeURIComponent(id):'')+(p.size?'?'+p:'');}
function parse(hash){const raw=(hash||'#/home').replace(/^#\/?/,''),i=raw.indexOf('?'),path=i<0?raw:raw.slice(0,i),[page='home',encoded='']=path.split('/');let id='';try{id=decodeURIComponent(encoded);}catch(_){}return{page,id,params:new URLSearchParams(i<0?'':raw.slice(i+1))};}
const route=()=>parse(location.hash);
const formatDate=v=>String((v&&typeof v==='object'?v.value||v.display:v)||'').replace(/T.*$/,'').replace(/-/g,'.');
async function loadData(url,options={}){const r=await fetch(url||'data.json',{credentials:'omit',signal:options.signal});if(!r.ok)throw Error('页面资料暂未打开');const d=await r.json();if(!d.group||!['members','releases','works','events'].every(k=>Array.isArray(d[k])))throw Error('页面资料格式不完整');return d;}
function rejectPrivate(p){for(const k of ['score','rating','ratings','note','notes','watched','favorite','snapshot','credentials'])if(Object.hasOwn(p,k))throw Error('Presentation does not accept private state');}
function emitIntegration(detail,target){const p={...detail};rejectPrivate(p);p.returnTo||=location.hash||'#/home';const e=new CustomEvent('astra:integration-request',{detail:p,bubbles:true,composed:true,cancelable:true});return{handled:!(target||document).dispatchEvent(e),detail:p};}
const functional='.astra-image-dialog img[hidden],.astra-viewer-error[hidden]{display:none!important}.asset-frame{display:block;position:relative;overflow:hidden}.asset-frame>img{display:block;width:100%;height:100%;object-fit:contain}.asset-fallback{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:16px;text-align:center;overflow-wrap:anywhere}.asset-frame.failed>.asset-fallback{display:flex}.asset-frame.failed>img{opacity:0}.asset-zoom{display:block;width:100%;height:100%;padding:0;border:0;background:none;color:inherit;cursor:zoom-in}.astra-asset-credit{display:block;font-size:12px;line-height:1.5;overflow-wrap:anywhere}.astra-overlay-anchor{position:relative;height:0;width:100%;z-index:60}.astra-image-dialog{position:absolute;inset:auto;left:12px;top:0;margin:0;padding:0;border:0;width:max-content;max-width:calc(100% - 24px);max-height:calc(100dvh - 24px);background:#151515;color:white}.astra-image-dialog::backdrop{background:#101010bb}.astra-image-dialog figure{margin:0}.astra-image-dialog figure>img{display:block;width:auto;height:auto;max-width:100%;max-height:calc(100dvh - 112px);object-fit:contain}.astra-image-dialog figcaption{padding:16px;overflow-wrap:anywhere}.astra-zoom-close{display:block;position:sticky;top:0;margin-left:auto;min-height:48px;min-width:64px;border:1px solid currentColor;background:#151515;color:white;font:inherit}.astra-image-dialog :focus-visible{outline:3px solid white;outline-offset:-4px}';
function scopedCss(css,s){return css.replace(/(^|})([^{}]+)\{/g,(_,b,ss)=>b+ss.split(',').map(x=>s+' '+x.trim()).join(',')+'{');}
const hostAttributeNames=['data-astra-group','data-astra-instance','data-astra-min-width','data-astra-max-width'];
const claimRequestLimit=32,claimDrainLimit=128;
function readHostAttributes(el){return Object.fromEntries(hostAttributeNames.map(name=>[name,el.getAttribute(name)]));}
function rootStateFor(el){let state=rootStates.get(el);if(!state){state={baseline:readHostAttributes(el),transaction:null,restoring:false,resolvingAsset:0};rootStates.set(el,state);}return state;}
function claimReentryError(phase,limit){const error=Error(limit?'Root claim reentry limit exceeded':'Root claim is not allowed during '+phase);error.name='ScopeClaimReentryError';error.code=limit?'ASTRA_SCOPE_CLAIM_LIMIT':'ASTRA_SCOPE_CLAIM_REENTRY';error.phase=phase;error.limit=limit||null;return error;}
function rememberClaimError(transaction,error){if(!transaction.errors.includes(error))transaction.errors.push(error);}
function throwClaimErrors(transaction){if(transaction.errors.length){const error=transaction.errors[0];const rest=transaction.errors.slice(1);if(rest.length)error.claimCleanupErrors=rest;throw error;}}
function cancelPendingStart(el,transaction){const pending=bootstraps.get(el);if(!pending)return;pending.active=false;bootstraps.delete(el);try{pending.controller?.abort();}catch(error){rememberClaimError(transaction,error);}}
function drainRootClaims(el,state,transaction){
 while(bootstraps.has(el)||owners.has(el)){
  transaction.drainPasses++;
  if(transaction.drainPasses>claimDrainLimit&&!transaction.exhausted){transaction.exhausted=true;rememberClaimError(transaction,claimReentryError('draining',claimDrainLimit));}
  cancelPendingStart(el,transaction);
  const previous=owners.get(el);if(!previous)continue;
  const dispose=scopeDisposers.get(previous)||previous.destroy;
  try{dispose.call(previous);}catch(error){rememberClaimError(transaction,error);}
  if(owners.get(el)===previous){
   // A same-runtime disposer always releases its owner before user callbacks.
   // Do not overwrite an owner whose foreign/broken disposer could not release it.
   transaction.exhausted=true;rememberClaimError(transaction,claimReentryError('unreleased-owner',claimDrainLimit));break;
  }
 }
}
function createScope(o={}){
 const el=o.element,d=o.data,slug=o.slug;
 if(!el?.ownerDocument||!/^[a-z0-9-]+$/.test(slug||''))throw Error('Mount requires element and stable slug');
 if(!d?.group||!['members','releases','works','events'].every(k=>Array.isArray(d[k])))throw Error('Incomplete public artist input');
 const doc=el.ownerDocument,win=doc.defaultView||window,id='astra-'+slug+'-'+(++serial),selector='[data-astra-instance="'+id+'"]';
 const baseUrl=safeUrl(o.baseUrl||'./',doc.baseURI||location.href),cssUrl=safeUrl(o.cssUrl||'design.css',baseUrl);
 if(!baseUrl||!cssUrl)throw Error('Invalid group base or stylesheet URL');
 const rootState=rootStateFor(el);
 if(rootState.restoring)throw claimReentryError('host-attribute-restoration');
 if(rootState.resolvingAsset)throw claimReentryError('asset-resolution');
 if(rootState.transaction?.phase==='initializing')throw claimReentryError('scope-initialization');
 const outerClaim=!rootState.transaction;
 if(outerClaim&&!owners.has(el))rootState.baseline=readHostAttributes(el);
 const transaction=rootState.transaction||{phase:'draining',requests:0,drainPasses:0,exhausted:false,errors:[]};
 if(transaction.exhausted||transaction.requests>=claimRequestLimit){transaction.exhausted=true;const error=claimReentryError('draining',claimRequestLimit);rememberClaimError(transaction,error);throw error;}
 transaction.requests++;if(outerClaim)rootState.transaction=transaction;
 const priorClaimPhase=transaction.phase;

 let active=true,constructing=true,claimed=false,replacedContent=false,pageChanging=false,pageEpoch=0;
 let hash=o.initialRoute||(o.syncHash?win.location.hash:'')||'#/home',zoom=null,zoomAnchor=null,origin=null,pageController=null;
 let style=null,css=null,widthObserver=null,widthValue=null,widthAttrsClaimed=false;
 const listeners=new Set(),routes=new Set(),timers=new Set(),frames=new Set(),guards=new Set(),pageCleanups=new Set(),controllers=new Set(),ownedDialogs=new Set();
 const dialogTracks=new Set(),dialogTrackByNode=new WeakMap();let dialogLayoutFrame=null,dialogGeometryObserver=null,dialogTrackingGeneration=0;const dialogTrackingOff=[];
 const assetResolutionCache=new Map();
 // Member-detail recovery belongs to one image, page epoch and scope owner.
 const imageRecoveries=new Map(),imageRecoveryPanels=new WeakMap();let imageRecoveryInput='pointer';
 const noop=()=>{};
 function ownerIdentity(){return claimed&&owners.get(el)===scope;}
 function ownsRoot(){return active&&ownerIdentity()&&el.getAttribute('data-astra-instance')===id&&el.getAttribute('data-astra-group')===slug;}
 function usable(){return ownsRoot()&&!pageChanging;}
 function collect(errors,fn){try{fn();}catch(error){errors.push(error);}}
 function throwCleanup(errors){if(errors.length){const error=errors[0];if(errors.length>1)error.cleanupErrors=errors.slice(1);throw error;}}
 function releaseListener(entry){
  if(!entry.active)return;
  entry.active=false;listeners.delete(entry);
  const target=entry.target,wrapped=entry.wrapped,type=entry.type,options=entry.options,signal=entry.abortSignal,abortListener=entry.abortListener;
  entry.target=null;entry.fn=null;entry.wrapped=null;entry.options=null;entry.abortSignal=null;entry.abortListener=null;
  if(signal&&abortListener)signal.removeEventListener('abort',abortListener);
  if(target)target.removeEventListener(type,wrapped,options);
 }
 function listen(target,type,fn,options){
  if(!usable())return noop;
  if(target===doc&&['click','submit','close','cancel','load','error','keydown','input','change','focusin','focusout'].includes(type))target=el;
  if(!target||typeof target.addEventListener!=='function'||typeof fn!=='function')throw TypeError('Scoped listener requires target and callback');
  const page=!!(options&&typeof options==='object'&&options.lifecycle==='page');
  const nativeOptions=options&&typeof options==='object'?{...options}:options;
  if(nativeOptions&&typeof nativeOptions==='object')delete nativeOptions.lifecycle;
  if(nativeOptions&&typeof nativeOptions==='object'&&nativeOptions.signal?.aborted)return noop;
  const entry={target,type,fn,wrapped:null,options:nativeOptions,active:true,page:page?pageEpoch:null,abortSignal:null,abortListener:null};
  entry.wrapped=function(event){
   if(!entry.active||!usable()||entry.page!==null&&entry.page!==pageEpoch)return;
   if(entry.target===el&&event.target?.nodeType&&event.target!==el&&!el.contains(event.target))return;
   if(entry.target!==el&&entry.target!==win&&entry.target!==doc&&entry.target?.nodeType&& !el.contains(entry.target))return;
   const callback=entry.fn;if(!callback)return;
   if(entry.options&&typeof entry.options==='object'&&entry.options.once)releaseListener(entry);
   return callback.call(this,event);
  };
  listeners.add(entry);
  try{
   target.addEventListener(type,entry.wrapped,nativeOptions);
   if(nativeOptions&&typeof nativeOptions==='object'&&nativeOptions.signal){entry.abortSignal=nativeOptions.signal;entry.abortListener=()=>releaseListener(entry);entry.abortSignal.addEventListener('abort',entry.abortListener,{once:true});}
  }catch(error){try{releaseListener(entry);}catch(cleanupError){error.cleanupError=cleanupError;}throw error;}
  return()=>releaseListener(entry);
 }
 function get(local){
  if(!ownsRoot())return null;
  if(local==='app')return el;
  const q=String(local).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  return el.querySelector('[data-astra-local-id="'+q+'"]')||el.querySelector('[id="'+q+'"]');
 }
 function query(s){return ownsRoot()?el.querySelector(s):null;}
 function queryAll(s){return ownsRoot()?[...el.querySelectorAll(s)]:[];}
 function ownDialog(dialog){if(dialog){ownedDialogs.add(dialog);dialogOwners.set(dialog,scope);}return dialog;}
 function updateHostWidth(value){
  if(!ownsRoot())return;const width=Number(value);if(!Number.isFinite(width)||width<0)return;
  const min=widthThresholds.filter(threshold=>width>=threshold).join(' '),max=widthThresholds.filter(threshold=>width<=threshold).join(' ');
  widthAttrsClaimed=true;
  if(el.getAttribute('data-astra-min-width')!==min)el.setAttribute('data-astra-min-width',min);
  if(!ownsRoot())return;
  if(el.getAttribute('data-astra-max-width')!==max)el.setAttribute('data-astra-max-width',max);
  widthValue=width;
 }
 function measureHostWidth(){
  const client=Number(el.clientWidth);
  if(Number.isFinite(client)&&client>=0){
   let padding=0;
   if(typeof win.getComputedStyle==='function'){
    const computed=win.getComputedStyle(el);
    for(const [property,cssProperty]of [['paddingLeft','padding-left'],['paddingRight','padding-right']]){
     const amount=parseFloat(computed?.[property]||computed?.getPropertyValue?.(cssProperty)||'0');if(Number.isFinite(amount))padding+=amount;
    }
   }
   return Math.max(0,client-padding);
  }
  const width=typeof el.getBoundingClientRect==='function'?Number(el.getBoundingClientRect().width):0;
  return Number.isFinite(width)&&width>=0?width:0;
 }
 function installHostWidthTracking(){
  updateHostWidth(measureHostWidth());
  const NativeObserver=win.ResizeObserver||globalThis.ResizeObserver;
  if(typeof NativeObserver==='function'){
   widthObserver=new NativeObserver(entries=>{
    if(!ownsRoot())return;
    const entry=Array.from(entries||[]).find(entry=>entry.target===el);
    const width=Number(entry?.contentRect?.width);
    updateHostWidth(Number.isFinite(width)&&width>=0?width:measureHostWidth());
   });
   widthObserver.observe(el);
  }else listen(win,'resize',()=>updateHostWidth(measureHostWidth()));
 }
 function dialogTrackValid(entry){return !!entry?.active&&usable()&&entry.epoch===pageEpoch&&entry.dialog&&dialogTrackByNode.get(entry.dialog)===entry&&dialogOwners.get(entry.dialog)===scope&&el.contains(entry.dialog);}
 function geometryNumber(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function readGeometry(node){const r=typeof node?.getBoundingClientRect==='function'?node.getBoundingClientRect():null;if(!r)return null;return{left:geometryNumber(r.left),top:geometryNumber(r.top),width:Math.max(0,geometryNumber(r.width,geometryNumber(r.right)-geometryNumber(r.left))),height:Math.max(0,geometryNumber(r.height,geometryNumber(r.bottom)-geometryNumber(r.top)))};}
 function numericStyle(node,name){if(typeof win.getComputedStyle!=='function')return 0;const style=win.getComputedStyle(node),value=parseFloat(style?.getPropertyValue?.(name)||style?.[name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]||'0');return Number.isFinite(value)?value:0;}
 function coordinateBox(node,fallbackScale){
  const rect=readGeometry(node);if(!rect)return null;
  const borderLeft=numericStyle(node,'border-left-width'),borderRight=numericStyle(node,'border-right-width'),borderTop=numericStyle(node,'border-top-width'),borderBottom=numericStyle(node,'border-bottom-width');
  const clientWidth=Math.max(0,geometryNumber(node.clientWidth,rect.width-borderLeft-borderRight)),clientHeight=Math.max(0,geometryNumber(node.clientHeight,rect.height-borderTop-borderBottom));
  const layoutWidth=geometryNumber(node.offsetWidth,clientWidth+borderLeft+borderRight),layoutHeight=geometryNumber(node.offsetHeight,clientHeight+borderTop+borderBottom);
  const scaleX=rect.width>0&&layoutWidth>0?rect.width/layoutWidth:fallbackScale?.x||1,scaleY=rect.height>0&&layoutHeight>0?rect.height/layoutHeight:fallbackScale?.y||1;
  const left=rect.left+geometryNumber(node.clientLeft,borderLeft)*scaleX,top=rect.top+geometryNumber(node.clientTop,borderTop)*scaleY;
  return{left,top,width:clientWidth*scaleX,height:clientHeight*scaleY,scaleX,scaleY,scrollLeft:geometryNumber(node.scrollLeft),scrollTop:geometryNumber(node.scrollTop)};
 }
 function visualBounds(){const viewport=win.visualViewport,left=geometryNumber(viewport?.offsetLeft),top=geometryNumber(viewport?.offsetTop),width=geometryNumber(viewport?.width,geometryNumber(win.innerWidth)),height=geometryNumber(viewport?.height,geometryNumber(win.innerHeight));return{left,top,right:left+width,bottom:top+height,width,height};}
 function writeGeometry(style,name,value){if(style.getPropertyValue(name)!==value)style.setProperty(name,value);}
 function writeImageGeometry(style,name,value){if(style.getPropertyValue(name)!==value||style.getPropertyPriority?.(name)!=='important')style.setProperty(name,value,'important');}
 function currentNativeSize(entry,image){
  const attributeWidth=geometryNumber(image?.getAttribute?.('width')),attributeHeight=geometryNumber(image?.getAttribute?.('height'));
  let width=Math.max(0,geometryNumber(entry.options.nativeWidth,attributeWidth)),height=Math.max(0,geometryNumber(entry.options.nativeHeight,attributeHeight));
  const expected=image?.src||image?.getAttribute?.('src')||'',current=image?.currentSrc||'';
  if(image?.complete!==false&&(!current||current===expected)){const actualWidth=geometryNumber(image?.naturalWidth),actualHeight=geometryNumber(image?.naturalHeight);if(actualWidth>0)width=width>0?Math.min(width,actualWidth):actualWidth;if(actualHeight>0)height=height>0?Math.min(height,actualHeight):actualHeight;}
  return{width,height};
 }
 function restoreTrackedVisibility(entry){
  if(!entry.suspended)return;const dialog=entry.dialog;entry.suspended=false;
  if(!ownsRoot()||!dialog||dialogOwners.get(dialog)!==scope||dialogTrackByNode.get(dialog)!==entry)return;
  if(entry.originalVisibility)dialog.style.setProperty('visibility',entry.originalVisibility,entry.originalVisibilityPriority||'');else dialog.style.removeProperty('visibility');
 }
 function refreshTrackedDialog(entry){
  if(!dialogTrackValid(entry))return false;
  const dialog=entry.dialog;if(!dialog.open){stopDialogTrack(entry);return false;}
  const root=coordinateBox(el);if(!root||root.width<=0||root.height<=0){if(!entry.suspended){entry.originalVisibility=dialog.style.getPropertyValue('visibility');entry.originalVisibilityPriority=typeof dialog.style.getPropertyPriority==='function'?dialog.style.getPropertyPriority('visibility'):'';entry.suspended=true;}writeGeometry(dialog.style,'visibility','hidden');writeGeometry(dialog.style,'max-width','0px');writeGeometry(dialog.style,'max-height','0px');return false;}
  restoreTrackedVisibility(entry);
  const viewport=visualBounds();let visible={left:root.left,top:root.top,right:root.left+root.width,bottom:root.top+root.height};
  if(viewport.width>0&&viewport.height>0){const intersection={left:Math.max(visible.left,viewport.left),top:Math.max(visible.top,viewport.top),right:Math.min(visible.right,viewport.right),bottom:Math.min(visible.bottom,viewport.bottom)};if(intersection.right>intersection.left&&intersection.bottom>intersection.top)visible=intersection;}
  const margin=Math.max(0,geometryNumber(entry.options.margin,12)),mx=Math.min(margin*root.scaleX,Math.max(0,(visible.right-visible.left-1)/2)),my=Math.min(margin*root.scaleY,Math.max(0,(visible.bottom-visible.top-1)/2));
  const bounds={left:visible.left+mx,top:visible.top+my,right:visible.right-mx,bottom:visible.bottom-my};
  const requestedAnchor=entry.options.anchor,actualParent=dialog.offsetParent;
  const anchor=requestedAnchor&&el.contains(requestedAnchor)?requestedAnchor:actualParent&&el.contains(actualParent)?actualParent:el;
  const parent=coordinateBox(anchor,{x:root.scaleX,y:root.scaleY});if(!parent)return false;
  const availableWidth=Math.max(1,(bounds.right-bounds.left)/parent.scaleX),availableHeight=Math.max(1,(bounds.bottom-bounds.top)/parent.scaleY);
  writeGeometry(dialog.style,'position','absolute');writeGeometry(dialog.style,'right','auto');writeGeometry(dialog.style,'bottom','auto');writeGeometry(dialog.style,'margin','0px');writeGeometry(dialog.style,'box-sizing','border-box');writeGeometry(dialog.style,'min-width','0px');writeGeometry(dialog.style,'min-height','0px');
  writeGeometry(dialog.style,'max-width',availableWidth+'px');writeGeometry(dialog.style,'max-height',availableHeight+'px');writeGeometry(dialog.style,'overflow','auto');writeGeometry(dialog.style,'--astra-host-height',availableHeight+'px');
  const image=entry.options.image&&dialog.contains(entry.options.image)?entry.options.image:dialog.querySelector('img');
  if(image){const native=currentNativeSize(entry,image);writeImageGeometry(image.style,'max-width',native.width?'min(100%, '+native.width+'px)':'100%');const chrome=Math.max(0,geometryNumber(dialog.scrollHeight)-geometryNumber(image.offsetHeight));const imageHeight=Math.max(1,availableHeight-chrome);writeImageGeometry(image.style,'max-height',Math.min(native.height||imageHeight,imageHeight)+'px');}
  if(!dialogTrackValid(entry)||!dialog.open)return false;
  const box=readGeometry(dialog);if(!box)return false;
  const trigger=entry.options.trigger,triggerRect=trigger&&el.contains(trigger)?readGeometry(trigger):null;
  const desiredTop=entry.options.align==='visible-top'||!triggerRect?bounds.top:triggerRect.top;
  const desiredLeft=bounds.left;
  const top=Math.max(bounds.top,Math.min(desiredTop,Math.max(bounds.top,bounds.bottom-box.height))),left=Math.max(bounds.left,Math.min(desiredLeft,Math.max(bounds.left,bounds.right-box.width)));
  writeGeometry(dialog.style,'left',((left-parent.left)/parent.scaleX+parent.scrollLeft)+'px');writeGeometry(dialog.style,'top',((top-parent.top)/parent.scaleY+parent.scrollTop)+'px');
  entry.last={left,top,maxWidth:availableWidth,maxHeight:availableHeight,nativeWidth:image?currentNativeSize(entry,image).width:0};return true;
 }
 function cancelDialogFrame(){if(dialogLayoutFrame===null)return;const handle=dialogLayoutFrame;dialogLayoutFrame=null;for(const entry of [...frames])if(entry.handle===handle)cancelScheduled(frames,entry,win.cancelAnimationFrame);}
 function queueDialogLayout(){
  if(!usable()||!dialogTracks.size||dialogLayoutFrame!==null)return;const generation=dialogTrackingGeneration;
  dialogLayoutFrame=raf(()=>{dialogLayoutFrame=null;if(!usable()||generation!==dialogTrackingGeneration)return;for(const entry of [...dialogTracks]){if(generation!==dialogTrackingGeneration)break;refreshTrackedDialog(entry);}});
 }
 function clearDialogTrackingResources(){
  dialogTrackingGeneration++;cancelDialogFrame();const errors=[];
  for(const off of dialogTrackingOff.splice(0))collect(errors,off);
  if(dialogGeometryObserver){const observer=dialogGeometryObserver;dialogGeometryObserver=null;collect(errors,()=>observer.disconnect());}
  throwCleanup(errors);
 }
 function rebuildDialogTrackingResources(){
  clearDialogTrackingResources();if(!usable()||!dialogTracks.size)return;
  const generation=dialogTrackingGeneration,valid=()=>usable()&&generation===dialogTrackingGeneration;
  const schedule=()=>{if(valid())queueDialogLayout();};
  const scroll=event=>{if(!valid())return;const target=event.target;if(target===doc||target===win||target===el||target?.contains?.(el)||el.contains(target))queueDialogLayout();};
  dialogTrackingOff.push(listen(win,'resize',schedule));dialogTrackingOff.push(listen(win,'scroll',schedule,true));dialogTrackingOff.push(listen(doc,'scroll',scroll,true));
  const viewport=win.visualViewport;if(viewport&&typeof viewport.addEventListener==='function'){dialogTrackingOff.push(listen(viewport,'resize',schedule));dialogTrackingOff.push(listen(viewport,'scroll',schedule));}
  const NativeObserver=win.ResizeObserver||globalThis.ResizeObserver;
  if(typeof NativeObserver==='function'){
   const observer=new NativeObserver(()=>{if(valid())queueDialogLayout();});dialogGeometryObserver=observer;
   const nodes=new Set([el]);for(const entry of dialogTracks){if(!dialogTrackValid(entry))continue;nodes.add(entry.dialog);const image=entry.options.image||entry.dialog.querySelector('img');if(image)nodes.add(image);const anchor=entry.options.anchor;if(anchor&&el.contains(anchor))nodes.add(anchor);}
   try{for(const node of nodes){observer.observe(node);if(!valid()){if(dialogGeometryObserver===observer)dialogGeometryObserver=null;observer.disconnect();return;}}}catch(error){if(dialogGeometryObserver===observer)dialogGeometryObserver=null;try{observer.disconnect();}catch(cleanupError){error.cleanupError=cleanupError;}throw error;}
  }
 }
 function stopDialogTrack(entry,rebuild=true){
  if(!entry?.active)return;restoreTrackedVisibility(entry);entry.active=false;dialogTracks.delete(entry);const dialog=entry.dialog;if(dialogTrackByNode.get(dialog)===entry)dialogTrackByNode.delete(dialog);if(keyboardDialogs.get(doc)===dialog)keyboardDialogs.delete(doc);entry.keyboardOff?.();entry.keyboardOff=null;entry.dialog=null;entry.options=null;entry.last=null;entry.originalVisibility=null;entry.originalVisibilityPriority=null;
  if(rebuild)rebuildDialogTrackingResources();
 }
 function stopAllDialogTracking(){for(const entry of [...dialogTracks])stopDialogTrack(entry,false);clearDialogTrackingResources();}
 function dialogKeyboard(entry,event){
  if(!dialogTrackValid(entry)||!entry.dialog.open||event.defaultPrevented||!['Tab','Escape'].includes(event.key))return;
  const dialog=entry.dialog,focused=deepActiveElement(doc),inside=dialog.contains(focused);
  // A non-modal viewer does not take keys from another focused host control.
  // Recover keys lost to BODY only for the most recently active owned viewer.
  if(!inside&&!(keyboardDialogs.get(doc)===dialog&&(!focused||focused===doc.body||focused===doc.documentElement)))return;
  keyboardDialogs.set(doc,dialog);event.preventDefault();event.stopPropagation();
  if(event.key==='Escape'){dialog.close();return;}
  const targets=[...dialog.querySelectorAll('button,a[href],input:not([type="hidden"]),select,textarea,[tabindex]')].filter(node=>
   !node.disabled&&!node.hasAttribute('disabled')&&Number(node.getAttribute('tabindex')||0)>=0&&
   !node.closest('[hidden],[inert],[aria-hidden="true"]')&&
   (typeof node.getClientRects!=='function'||node.getClientRects().length));
  targets.sort((a,b)=>{const ai=Number(a.getAttribute('tabindex'))||0,bi=Number(b.getAttribute('tabindex'))||0;return ai===bi?0:ai===0?1:bi===0?-1:ai-bi;});
  if(!targets.length){dialog.setAttribute('tabindex','-1');dialog.focus({preventScroll:true});return;}
  const at=targets.indexOf(focused),next=at<0?(event.shiftKey?targets.length-1:0):(at+(event.shiftKey?-1:1)+targets.length)%targets.length;
  targets[next].focus({preventScroll:true});
 }
 function trackDialog(dialog,options={}){
  if(!usable())return noop;
  if(!dialog||dialog.tagName!=='DIALOG'||!el.contains(dialog)||!dialog.open)throw TypeError('trackDialog requires an open owned non-modal dialog');
  const previous=dialogTrackByNode.get(dialog);if(previous)stopDialogTrack(previous,false);
  ownDialog(dialog);const entry={dialog,options:{...options},active:true,epoch:pageEpoch,last:null};dialogTracks.add(entry);dialogTrackByNode.set(dialog,entry);
  try{keyboardDialogs.set(doc,dialog);entry.keyboardOff=listen(win,'keydown',event=>dialogKeyboard(entry,event),true);rebuildDialogTrackingResources();refreshTrackedDialog(entry);queueDialogLayout();}catch(error){try{stopDialogTrack(entry);}catch(cleanupError){error.cleanupError=cleanupError;}throw error;}
  return()=>stopDialogTrack(entry);
 }
 function captureDialogs(){if(ownsRoot()&&(replacedContent||zoomAnchor))for(const dialog of el.querySelectorAll('dialog'))ownDialog(dialog);}
 function closeOwnedDialogs(errors,remove){
  origin=null;zoom=null;
  for(const dialog of [...ownedDialogs]){
   ownedDialogs.delete(dialog);
   if(dialogOwners.get(dialog)!==scope)continue;
   dialogOwners.delete(dialog);
   collect(errors,()=>{if(dialog.open&&typeof dialog.close==='function')dialog.close();});
   if(remove)collect(errors,()=>dialog.remove());
  }
  if(zoomAnchor){const anchor=zoomAnchor;zoomAnchor=null;collect(errors,()=>anchor.remove());}
 }
 function releaseCleanup(entry,errors){
  if(!entry.active)return;entry.active=false;pageCleanups.delete(entry);const fn=entry.fn;entry.fn=null;if(fn)collect(errors,fn);
 }
 function onPageExit(fn){
  if(!usable())return noop;if(typeof fn!=='function')throw TypeError('Page cleanup must be a function');
  const entry={fn,active:true,epoch:pageEpoch};pageCleanups.add(entry);
  return()=>{const errors=[];releaseCleanup(entry,errors);throwCleanup(errors);};
 }
 function removeGuard(entry){guards.delete(entry);entry.fn=null;}
 function guard(fn,options={}){
  if(!usable())return noop;if(typeof fn!=='function')throw TypeError('Scoped guard requires callback');
  const entry={fn,epoch:options.page===false?null:pageEpoch};guards.add(entry);
  return function(...args){if(!entry.fn||!usable()||entry.epoch!==null&&entry.epoch!==pageEpoch)return;return entry.fn.apply(this,args);};
 }
 function cancelScheduled(set,entry,cancel){
  if(!set.has(entry))return;set.delete(entry);const handle=entry.handle;entry.fn=null;entry.handle=null;if(handle!==null)cancel.call(win,handle);
 }
 function schedule(set,request,cancel,fn,delay){
  if(!usable())return null;if(typeof fn!=='function')throw TypeError('Scoped schedule requires callback');
  const entry={handle:null,fn,epoch:pageEpoch};set.add(entry);
  const run=()=>{if(!set.has(entry))return;set.delete(entry);const callback=entry.fn;entry.fn=null;entry.handle=null;if(callback&&usable()&&entry.epoch===pageEpoch)callback();};
  try{entry.handle=delay===undefined?request.call(win,run):request.call(win,run,delay);}catch(error){set.delete(entry);entry.fn=null;throw error;}
  return entry.handle;
 }
 function raf(fn){return schedule(frames,win.requestAnimationFrame,win.cancelAnimationFrame,fn);}
 function timeout(fn,ms){return schedule(timers,win.setTimeout,win.clearTimeout,fn,ms);}
 function removeController(entry){
  if(!controllers.has(entry))return;controllers.delete(entry);
  const c=entry.controller,listener=entry.listener;entry.controller=null;entry.listener=null;
  if(c&&listener)c.signal.removeEventListener('abort',listener);
  if(pageController===c)pageController=null;
 }
 function abortController(options={}){
  if(!usable())return null;
  const NativeController=win.AbortController||globalThis.AbortController;
  if(typeof NativeController!=='function')throw Error('AbortController is required for scoped asynchronous work');
  const controller=new NativeController(),entry={controller,listener:null,epoch:options.lifecycle==='scope'?null:pageEpoch};
  entry.listener=()=>removeController(entry);controllers.add(entry);
  try{controller.signal.addEventListener('abort',entry.listener,{once:true});}catch(error){controllers.delete(entry);entry.controller=null;entry.listener=null;throw error;}
  return controller;
 }
 function abortEntry(entry,errors){const c=entry.controller;removeController(entry);if(c&&!c.signal.aborted)collect(errors,()=>c.abort());}
 function exitPage(){
  const errors=[],oldEpoch=pageEpoch;pageChanging=true;pageEpoch++;
  captureDialogs();collect(errors,stopAllDialogTracking);
  for(const entry of [...frames])collect(errors,()=>cancelScheduled(frames,entry,win.cancelAnimationFrame));
  for(const entry of [...timers])collect(errors,()=>cancelScheduled(timers,entry,win.clearTimeout));
  for(const entry of [...controllers])if(entry.epoch!==null&&entry.epoch<=oldEpoch)abortEntry(entry,errors);
  for(const entry of [...guards])if(entry.epoch!==null&&entry.epoch<=oldEpoch)removeGuard(entry);
  for(const entry of [...listeners])if(entry.page!==null||entry.target!==el&&entry.target!==win&&entry.target!==doc&&entry.target?.nodeType)collect(errors,()=>releaseListener(entry));
  for(const entry of [...pageCleanups])if(entry.epoch<=oldEpoch)releaseCleanup(entry,errors);
  closeOwnedDialogs(errors,true);
  pageChanging=false;throwCleanup(errors);
 }
 function namespaceHTML(html){
  const ids=new Map();let s=String(html).replace(/(?<=\s)id=(['"])(.*?)\1/g,(_,q,local)=>{ids.set(local,id+'--'+local);return 'id='+q+id+'--'+local+q+' data-astra-local-id='+q+local+q;});
  s=s.replace(/(?<=\s)(for|aria-labelledby|aria-describedby|aria-controls|aria-owns|aria-activedescendant|headers)=(['"])(.*?)\2/g,(_,a,q,refs)=>a+'='+q+refs.split(/\s+/).map(x=>ids.get(x)||x).join(' ')+q);
  return s.replace(/(?<=\s)href=(['"])#([^/'"\s][^'"\s]*)\1/g,(_,q,ref)=>'href='+q+'#'+(ids.get(ref)||ref)+q);
 }
 function setHTML(html){
  if(!usable())return;const next=namespaceHTML(html);exitPage();if(!ownsRoot())return;
  replacedContent=true;el.innerHTML=next;captureDialogs();
 }
 function onRoute(fn){
  if(!usable())return noop;if(typeof fn!=='function')throw TypeError('Route subscriber requires callback');
  const entry={fn};routes.add(entry);return()=>{routes.delete(entry);entry.fn=null;};
 }
 function notifyRoutes(){for(const entry of [...routes]){if(!usable())break;const fn=entry.fn;if(fn)fn();}}
 function notifyHostRoute(previous,source){
  if(!usable()||typeof o.onNavigate!=='function')return;
  o.onNavigate(Object.freeze({groupId:d.group.id,slug,route:hash,previousRoute:previous,source}));
 }
 function navigate(next){
  if(!usable())return;if(!/^#\//.test(String(next)))throw Error('Internal artist route required');
  const previous=hash;hash=String(next);if(o.syncHash&&win.location.hash!==hash)win.history.pushState(null,'',hash);notifyRoutes();
  if(usable())notifyHostRoute(previous,'navigate');
 }
 function validatedRequest(detail){
  const p={...detail};rejectPrivate(p);
  if(p.groupId!==d.group.id)throw Error('Host groupId mismatch');
  if(!p.returnTo||!/^#\//.test(p.returnTo))throw Error('Host returnTo is required');
  if(['open-work','open-record','open-rating'].includes(p.action)){
   if(!['workId','videoId','videoType','slotType'].every(k=>Object.hasOwn(p,k)))throw Error('Complete work/video/original type/slot tuple required');
   const matches=d.works.filter(w=>(w.id??null)===p.workId&&w.videoId===p.videoId&&w.type===p.slotType&&(w.videoType??null)===p.videoType);
   if(matches.length!==1||p.action!=='open-work'&&!p.workId)throw Error('One exact work/video/original type/slot tuple required');
  }else if(p.action==='open-release'){
   const r=d.releases.find(r=>r.key===p.releaseKey);
   if(!r||p.releaseRecordId!==(r.recordId??null)||Object.hasOwn(p,'workId'))throw Error('Exact release key and nullable project record ID required');
  }else if(p.action==='open-member'){
   if(!d.members.some(m=>m.id===p.memberId))throw Error('Exact member ID required');
  }else throw Error('Unsupported presentation request');
  return Object.freeze(p);
 }
 function canRequest(detail){
  if(!usable()||typeof o.onRequest!=='function'||typeof o.canRequest!=='function')return false;
  let p;try{p=validatedRequest(detail);}catch(_){return false;}
  if(['open-work','open-record','open-rating'].includes(p.action)&&!p.workId)return false;
  if(p.action==='open-release'&&!p.releaseRecordId)return false;
  try{return o.canRequest(p)===true&&usable();}catch(_){return false;}
 }
 function scopedEmit(detail){
  if(!usable())return{handled:false,inactive:true,detail:null};
  const p=validatedRequest(detail);
  if(o.requireHostCapabilities===true&&!canRequest(p))return{handled:false,unavailable:true,detail:p};
  const EventConstructor=win.CustomEvent||globalThis.CustomEvent;
  const event=new EventConstructor('astra:integration-request',{detail:p,bubbles:true,composed:true,cancelable:true});
  if(typeof o.onRequest==='function'&&o.onRequest(p)===true)event.preventDefault();
  if(!usable())return{handled:event.defaultPrevented,inactive:true,detail:p};
  return{handled:!el.dispatchEvent(event),detail:p};
 }
 function resolvedAsset(a){
  if(!usable()||!a)return null;
  if(typeof o.resolveAsset==='function'){
   const identity=canonicalAssetIdentity(a,slug,baseUrl);
   if(!identity||identity.groupId!==d.group.id)throw Error('Asset identity is not approved for this artist');
   if(assetResolutionCache.has(identity.assetKey))return assetResolutionCache.get(identity.assetKey);
   const input=typeof a==='object'?Object.freeze({...a,...(a.expectedDimensions?{expectedDimensions:Object.freeze({...a.expectedDimensions})}:{})}):a;
   let binding;rootState.resolvingAsset++;
   try{binding=o.resolveAsset(input,Object.freeze({slug,groupId:d.group.id,identity}));}finally{rootState.resolvingAsset--;}
   if(!usable())return null;
   if(binding==null){assetResolutionCache.set(identity.assetKey,null);return null;}
   if(typeof binding!=='object'||typeof binding.then==='function')throw Error('Asset resolver requires a synchronous verified binding object');
   rejectPrivate(binding);
   for(const key of ['assetKey','groupId','sha256','bytes','width','height'])if(binding[key]!==identity[key])throw Error('Asset binding identity mismatch: '+key);
   const url=safeUrl(binding.url,baseUrl);
   if(!url||new URL(url).username||new URL(url).password)throw Error('Asset binding requires an HTTP(S) address without embedded credentials');
   assetResolutionCache.set(identity.assetKey,url);return url;
  }
  if(typeof a==='string'||a.localSrc)return a;
  const publicPath=a.existingPublicPath||a.path;
  const existing=o.assetBaseUrl&&publicPath?.startsWith('/')&&!publicPath.includes('..')?safeUrl(String(o.assetBaseUrl).replace(/\/$/,'')+publicPath,baseUrl):'';
  return existing?{...a,url:existing,src:null,path:null}:a;
 }
 function hideFailedImage(image){
  image.hidden=true;image.style.setProperty('display','none','important');
  const frame=image.closest('.asset-frame');
  if(frame){frame.classList.add('failed');const fallback=frame.querySelector('.asset-fallback');if(fallback){fallback.removeAttribute('aria-hidden');fallback.setAttribute('role','img');fallback.setAttribute('aria-label',image.alt+' · 图片暂时无法加载');fallback.textContent=image.alt+' · 图片暂时无法加载';}}
  const message=image.closest('.astra-image-dialog')?.querySelector('.astra-viewer-error');if(message)message.hidden=false;
 }
 function restoreLoadedImage(image){
  image.hidden=false;image.style.setProperty('display','block','important');
  const frame=image.closest('.asset-frame');
  if(frame){frame.classList.remove('failed');const fallback=frame.querySelector('.asset-fallback');if(fallback){fallback.setAttribute('aria-hidden','true');fallback.removeAttribute('role');fallback.removeAttribute('aria-label');fallback.textContent=image.alt;}}
  const message=image.closest('.astra-image-dialog')?.querySelector('.astra-viewer-error');if(message)message.hidden=true;
 }
 function updateImageZoom(image){
  const trigger=image.closest('[data-astra-zoom]');
  if(!trigger||!el.contains(trigger))return;
  const quality=triggerQuality(trigger),width=lowerPositive(quality.nativeWidth,trigger.dataset.astraNativeWidth,image.naturalWidth),height=lowerPositive(quality.nativeHeight,trigger.dataset.astraNativeHeight,image.naturalHeight);
  const capWidth=lowerPositive(width,quality.maxWidth,trigger.dataset.astraQualityMaxWidth),capHeight=lowerPositive(height,quality.maxHeight,trigger.dataset.astraQualityMaxHeight);
  trigger.disabled=!quality.allowZoom||trigger.dataset.astraQualityZoom!=='true'||!positive(image.naturalWidth)||!positive(image.naturalHeight)||!capWidth||!capHeight||capWidth<=200||capHeight<=200;
 }
 function imageRecoveryValid(entry){return !!entry?.active&&usable()&&entry.epoch===pageEpoch&&imageRecoveries.get(entry.image)===entry&&el.contains(entry.media)&&el.contains(entry.panel);}
 function stopImageAttempt(entry){
  const attempt=entry.attempt;if(!attempt)return;
  entry.attempt=null;attempt.active=false;
  for(const off of attempt.off)off();attempt.off.length=0;
  // Removing the exact detached source asks the browser to cancel its image
  // load. The owner/attempt guards also ignore an already-queued late event.
  attempt.image.removeAttribute('src');attempt.image=null;
 }
 function discardImageRecovery(entry){
  if(!entry.active)return;entry.active=false;stopImageAttempt(entry);
  imageRecoveries.delete(entry.image);imageRecoveryPanels.delete(entry.panel);
  const release=entry.release;entry.release=null;release?.();
  entry.panel.remove();entry.image=null;entry.media=null;entry.frame=null;entry.retry=null;entry.cancel=null;entry.status=null;entry.panel=null;
 }
 function recoveryStatus(entry,state,message){
  entry.panel.dataset.state=state;entry.status.textContent=message;
  const loading=state==='loading';entry.frame.setAttribute('aria-busy',String(loading));
  // Keep the retry control focusable while loading. Native disabled would
  // drop a keyboard user's focus before the completion can restore it.
  entry.retry.setAttribute('aria-disabled',String(loading));
  entry.retry.textContent=loading?'加载中…':state==='ready'?'重新加载本图':'重试本图';
  entry.cancel.hidden=!loading;
 }
 function refocusRecovery(entry,previous){
  if(imageRecoveryInput!=='keyboard'||!imageRecoveryValid(entry)||!entry.panel.contains(previous))return;
  const target=entry.media.matches('[data-astra-zoom]')&&!entry.media.disabled?entry.media:entry.retry;
  if(target.isConnected&&!target.closest('[hidden],[inert],[aria-hidden="true"]'))target.focus({preventScroll:true});
 }
 function ensureImageRecovery(image){
  if(image.getAttribute('data-astra-image-retryable')!=='true'||image.closest('.astra-image-dialog'))return null;
  const old=imageRecoveries.get(image);if(old)return old;
  const frame=image.closest('.asset-frame'),media=image.closest('[data-astra-zoom]')||frame;
  const src=safeUrl(image.getAttribute('src')||image.currentSrc,baseUrl);
  if(!frame||!media||!src||!el.contains(media))return null;
  const panel=doc.createElement('span');panel.className='astra-image-recovery';panel.setAttribute('role','group');panel.setAttribute('aria-label',image.alt+' · 图片加载');
  const status=doc.createElement('span');status.setAttribute('data-astra-image-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const retry=doc.createElement('button');retry.type='button';retry.setAttribute('data-astra-image-retry','');retry.setAttribute('aria-label','重新加载'+image.alt);
  const cancel=doc.createElement('button');cancel.type='button';cancel.setAttribute('data-astra-image-cancel','');cancel.setAttribute('aria-label','取消加载'+image.alt);cancel.textContent='取消加载';
  panel.append(status,retry,cancel);
  // A recovery button must be a sibling of the zoom button, never inside it.
  media.after(panel);
  const entry={image,frame,media,panel,status,retry,cancel,src,active:true,epoch:pageEpoch,attempt:null,keyboard:false,release:null};
  imageRecoveries.set(image,entry);imageRecoveryPanels.set(panel,entry);
  entry.release=onPageExit(()=>discardImageRecovery(entry));
  recoveryStatus(entry,'failed','图片暂时无法加载，请重试本图。');return entry;
 }
 function retryMemberImage(entry,event){
  if(!imageRecoveryValid(entry)||entry.attempt)return;
  entry.keyboard=event.detail===0&&entry.panel.contains(deepActiveElement(doc));imageRecoveryInput=entry.keyboard?'keyboard':'pointer';
  const next=doc.createElement('img');
  for(const attribute of entry.image.attributes)if(!['src','srcset','hidden'].includes(attribute.name))next.setAttribute(attribute.name,attribute.value);
  next.hidden=false;next.style.setProperty('display','block','important');next.loading='eager';
  const attempt={image:next,active:true,off:[]};entry.attempt=attempt;
  recoveryStatus(entry,'loading','正在重新加载本图…');
  const fallback=entry.frame.querySelector('.asset-fallback');if(fallback){fallback.textContent=entry.image.alt+' · 图片加载中…';fallback.setAttribute('aria-label',fallback.textContent);}
  const valid=()=>imageRecoveryValid(entry)&&entry.attempt===attempt&&attempt.active;
  // General scope.listen correctly rejects detached DOM targets. A pending
  // image therefore owns exactly these two listeners, removed on every
  // completion/cancel/page-exit path without weakening the general boundary.
  const listenAttempt=(type,callback)=>{
   let listening=true;
   const wrapped=event=>{if(!listening)return;listening=false;next.removeEventListener(type,wrapped);if(valid())callback(event);};
   next.addEventListener(type,wrapped);
   return()=>{if(!listening)return;listening=false;next.removeEventListener(type,wrapped);};
  };
  const finishFailure=()=>{
   if(!valid())return;const previous=deepActiveElement(doc);stopImageAttempt(entry);
   hideFailedImage(entry.image);if(entry.media.matches('[data-astra-zoom]'))entry.media.disabled=true;recoveryStatus(entry,'failed','图片仍无法加载，请重试本图。');refocusRecovery(entry,previous);
  };
  attempt.off.push(listenAttempt('error',finishFailure));
  attempt.off.push(listenAttempt('load',()=>{
   if(!valid())return;
   if(!positive(next.naturalWidth)||!positive(next.naturalHeight)){finishFailure();return;}
   const previous=deepActiveElement(doc),old=entry.image;
   entry.attempt=null;attempt.active=false;for(const off of attempt.off)off();attempt.off.length=0;attempt.image=null;
   // Adopt the already-loaded element itself: assigning src a second time
   // would start another request and could regress to a broken image.
   old.replaceWith(next);imageRecoveries.delete(old);entry.image=next;imageRecoveries.set(next,entry);
   restoreLoadedImage(next);updateImageZoom(next);recoveryStatus(entry,'ready','图片已加载。');refocusRecovery(entry,previous);
  }));
  try{next.src=entry.src;}catch(_){finishFailure();}
 }
 function cancelMemberImage(entry,event){
  if(!imageRecoveryValid(entry)||!entry.attempt)return;
  const previous=deepActiveElement(doc);entry.keyboard=event.detail===0&&entry.panel.contains(previous);imageRecoveryInput=entry.keyboard?'keyboard':'pointer';
  stopImageAttempt(entry);recoveryStatus(entry,'cancelled','已取消加载，可重试本图。');
  const fallback=entry.frame.querySelector('.asset-fallback');if(fallback){fallback.textContent=entry.image.alt+' · 图片加载已取消';fallback.setAttribute('aria-label',fallback.textContent);}
  if(entry.keyboard&&entry.panel.contains(previous))entry.retry.focus({preventScroll:true});
 }
 function triggerQuality(trigger){return assetQuality(trigger.dataset.astraQualityKey||null,'zoom',slug,baseUrl);}
 function abortError(){const E=win.DOMException||globalThis.DOMException;return typeof E==='function'?new E('Artist page is no longer active','AbortError'):Object.assign(Error('Artist page is no longer active'),{name:'AbortError'});}
 async function scopedLoadData(url,options={}){
  if(!usable())throw abortError();const epoch=pageEpoch,controller=abortController(),external=options.signal;
  let detach=noop,release=noop;
  try{
   if(external){const abort=()=>controller.abort();if(external.aborted)abort();else{external.addEventListener('abort',abort,{once:true});detach=()=>external.removeEventListener('abort',abort);release=onPageExit(detach);}}
   const result=await loadData(safeUrl(url||'data.json',baseUrl),{signal:controller.signal});
   if(!usable()||epoch!==pageEpoch||controller.signal.aborted)throw abortError();return result;
  }finally{release();detach();for(const entry of [...controllers])if(entry.controller===controller)removeController(entry);}
 }
 const api=Object.freeze({
  esc:v=>usable()?esc(v):'',href:(...a)=>usable()?href(...a):'',route:()=>usable()?parse(hash):null,
  image:(a,t,p={})=>{if(!usable())return '';const quality=assetQuality(a,p.purpose||'card',slug,baseUrl),asset=resolvedAsset(a);return usable()?image(asset,t,p,baseUrl,quality):'';},
  assetQuality:(a,p='card')=>usable()?assetQuality(a,p,slug,baseUrl):null,
  assetIdentity:a=>usable()?canonicalAssetIdentity(a,slug,baseUrl):null,
  canRequest,
  qualityStyle:(a,p='card')=>usable()?assetQuality(a,p,slug,baseUrl).containerStyle:'',
  zoomAllowed:(a,p='zoom')=>usable()?assetQuality(a,p,slug,baseUrl).allowZoom:false,
  assetUrl:a=>{if(!usable())return '';const asset=resolvedAsset(a);return usable()?assetUrl(asset,baseUrl):'';},
  formatDate:v=>usable()?formatDate(v):'',loadData:scopedLoadData,emitIntegration:scopedEmit
 });
 function destroy(){
  if(!active)return;
  const errors=[];collect(errors,captureDialogs);active=false;pageChanging=true;pageEpoch++;assetResolutionCache.clear();collect(errors,stopAllDialogTracking);
  for(const entry of [...listeners])collect(errors,()=>releaseListener(entry));
  for(const entry of [...routes])entry.fn=null;routes.clear();
  for(const entry of [...guards])removeGuard(entry);
  if(widthObserver){const observer=widthObserver;widthObserver=null;collect(errors,()=>observer.disconnect());}
  if(ownerIdentity()){
   rootState.restoring=true;
   try{
    // Release the root before any abort/close/page callback may synchronously mount.
    // Attribute/DOM restoration itself is a short critical section.
    owners.delete(el);
    if(replacedContent)collect(errors,()=>el.replaceChildren());
    for(const name of hostAttributeNames){const value=rootState.baseline[name];collect(errors,()=>value===null?el.removeAttribute(name):el.setAttribute(name,value));}
   }finally{rootState.restoring=false;}
  }
  for(const entry of [...timers])collect(errors,()=>cancelScheduled(timers,entry,win.clearTimeout));
  for(const entry of [...frames])collect(errors,()=>cancelScheduled(frames,entry,win.cancelAnimationFrame));
  for(const entry of [...controllers])abortEntry(entry,errors);
  closeOwnedDialogs(errors,true);
  for(const entry of [...pageCleanups])releaseCleanup(entry,errors);
  if(style){const node=style;style=null;collect(errors,()=>node.remove());}
  if(css){const node=css;css=null;collect(errors,()=>node.remove());}
  widthValue=null;widthAttrsClaimed=false;scopes.delete(scope);scopeDisposers.delete(scope);pageChanging=false;throwCleanup(errors);
 }
 const scope={element:el,data:d,api,baseUrl,id,get hash(){return ownsRoot()?hash:'';},get alive(){return ownsRoot();},ownsRoot,
  get signal(){if(!usable())return null;if(!pageController||pageController.signal.aborted)pageController=abortController();return pageController.signal;},
  get,setHTML,navigate,listen,raf,timeout,destroy,query,queryAll,onRoute,onPageExit,use:onPageExit,guard,abortController,trackDialog,
  inspect:()=>({id,slug,alive:ownsRoot(),ownsRoot:ownsRoot(),listeners:listeners.size,timers:timers.size,frames:frames.size,routeCallbacks:routes.size,pageCleanups:pageCleanups.size,guards:guards.size,abortControllers:controllers.size,dialogs:ownedDialogs.size,pageEpoch,width:widthValue,widthObserver:!!widthObserver,widthAttributes:widthAttrsClaimed,dialogTrackers:dialogTracks.size,dialogLayoutFrames:dialogLayoutFrame===null?0:1,dialogGeometryObserver:!!dialogGeometryObserver,imageRecoveryPanels:imageRecoveries.size,imageRetryTasks:[...imageRecoveries.values()].filter(entry=>entry.attempt).length})};
 scopeDisposers.set(scope,destroy);
 try{
  drainRootClaims(el,rootState,transaction);throwClaimErrors(transaction);
  transaction.phase='initializing';owners.set(el,scope);claimed=true;el.setAttribute('data-astra-group',slug);el.setAttribute('data-astra-instance',id);
  style=doc.createElement('style');style.dataset.astraOwned=id;style.textContent=selector+'{container-type:inline-size}'+scopedCss(functional,selector);(el.getRootNode()?.host?el.getRootNode():doc.head).append(style);
  css=doc.createElement('link');css.rel='stylesheet';css.href=cssUrl;css.dataset.astraOwned=id;(el.getRootNode()?.host?el.getRootNode():doc.head).append(css);
  scopes.add(scope);
  installHostWidthTracking();
  listen(el,'error',event=>{if(event.target?.tagName==='IMG'){hideFailedImage(event.target);const trigger=event.target.closest('[data-astra-zoom]');if(trigger&&el.contains(trigger))trigger.disabled=true;ensureImageRecovery(event.target);}},true);
  listen(el,'load',event=>{if(event.target?.tagName==='IMG'){restoreLoadedImage(event.target);updateImageZoom(event.target);for(const entry of dialogTracks)if(entry.dialog.contains(event.target)){queueDialogLayout();break;}}},true);
  listen(el,'close',event=>{if(event.target?.open)return;const tracking=dialogTrackByNode.get(event.target),previous=tracking?.options.trigger||(event.target===zoom?origin:null);if(tracking)stopDialogTrack(tracking);if(event.target===zoom)origin=null;if(previous?.isConnected&&el.contains(previous)&&!previous.disabled&&!previous.closest('[hidden],[inert],[aria-hidden="true"]')&&(typeof previous.getClientRects!=='function'||previous.getClientRects().length))previous.focus({preventScroll:true});else if(previous)(get('main')||get('content'))?.focus({preventScroll:true});},true);
  // Observe only input modality, including host controls outside this artist.
  // Both listeners are owned by this scope; neither intercepts a key or pointer.
  listen(win,'pointerdown',()=>{imageRecoveryInput='pointer';},true);
  listen(win,'keydown',event=>{if(['Tab','Enter',' '].includes(event.key))imageRecoveryInput='keyboard';},true);
  listen(el,'keydown',event=>{if(event.key==='Escape'&&zoom?.open){event.preventDefault();zoom.close();}});
  listen(el,'click',event=>{
   const recoveryButton=event.target.closest?.('[data-astra-image-retry],[data-astra-image-cancel]');
   if(recoveryButton&&el.contains(recoveryButton)){
    const panel=recoveryButton.closest('.astra-image-recovery'),entry=imageRecoveryPanels.get(panel);
    if(entry){event.preventDefault();if(recoveryButton.hasAttribute('data-astra-image-retry'))retryMemberImage(entry,event);else cancelMemberImage(entry,event);return;}
   }
   const a=event.target.closest?.('a[href]');
   if(a&&el.contains(a)&&!a.target&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&!event.defaultPrevented){
    const to=a.getAttribute('href');
    if(to?.startsWith('#/')){event.preventDefault();navigate(to);return;}
    if(to?.startsWith('#'+id+'--')){const node=get(to.slice(('#'+id+'--').length));if(node){event.preventDefault();node.focus();node.scrollIntoView?.({block:'start'});return;}}
   }
   const trigger=event.target.closest?.('[data-astra-zoom]');
   if(trigger&&el.contains(trigger)){
    const src=safeUrl(trigger.dataset.astraZoom,baseUrl);if(!src)return;
    const quality=triggerQuality(trigger),preview=trigger.querySelector('img'),width=lowerPositive(quality.nativeWidth,quality.maxWidth,trigger.dataset.astraNativeWidth,preview?.naturalWidth,trigger.dataset.astraQualityMaxWidth),height=lowerPositive(quality.nativeHeight,quality.maxHeight,trigger.dataset.astraNativeHeight,preview?.naturalHeight,trigger.dataset.astraQualityMaxHeight);
    if(!quality.allowZoom||trigger.dataset.astraQualityZoom!=='true'||!width||!height||width<=200||height<=200)return;const host=coordinateBox(el);if(!host||host.width<=0||host.height<=0)return;origin=trigger;
    if(!zoom){
     zoomAnchor=doc.createElement('div');zoomAnchor.className='astra-overlay-anchor';el.append(zoomAnchor);
     zoom=ownDialog(doc.createElement('dialog'));zoom.className='astra-image-dialog';zoom.setAttribute('aria-label','查看图片');zoom.setAttribute('aria-modal','false');zoomAnchor.append(zoom);
    }
    zoom.innerHTML='<button class="astra-zoom-close" type="button" data-astra-close aria-label="关闭图片">关闭</button><figure><img src="'+esc(src)+'" alt="'+esc(trigger.dataset.astraAlt||'')+'"'+' style="object-fit:contain!important;border-radius:0!important;clip-path:none!important;mask:none!important;max-width:min(100%,'+width+'px)!important;max-height:'+height+'px!important;"'+'><figcaption>'+esc(trigger.dataset.astraAlt||'')+(safeUrl(trigger.dataset.astraSource,baseUrl)?'<br><a href="'+esc(safeUrl(trigger.dataset.astraSource,baseUrl))+'" target="_blank" rel="noopener noreferrer">图片来源</a>':'')+'</figcaption></figure><p class="astra-viewer-error" hidden role="status">图片暂时无法加载，请关闭后重试。</p>';
    if(!zoom.open)zoom.show();
    trackDialog(zoom,{anchor:zoomAnchor,trigger,image:zoom.querySelector('img'),nativeWidth:width,nativeHeight:height,align:'trigger'});
    zoom.querySelector('[data-astra-close]')?.focus();return;
   }
   if(event.target.closest?.('[data-astra-close]')&&zoom)zoom.close();
  });
  if(o.syncHash)listen(win,'hashchange',()=>{const previous=hash;hash=win.location.hash||'#/home';notifyRoutes();if(usable())notifyHostRoute(previous,'history');});
  constructing=false;return scope;
 }catch(error){
  transaction.phase='draining';try{destroy();}catch(cleanupError){error.cleanupError=cleanupError;rememberClaimError(transaction,cleanupError);}
  if(outerClaim){drainRootClaims(el,rootState,transaction);const remaining=transaction.errors.filter(item=>item!==error);if(remaining.length)error.claimCleanupErrors=remaining;}
  throw error;
 }finally{if(outerClaim){if(rootState.transaction===transaction)rootState.transaction=null;}else transaction.phase=priorClaimPhase;}
}
return Object.freeze({version:'astra-izna-ifeye-main-1',assetIdentities:canonicalAssetIdentityRows,esc,href,image,assetUrl,formatDate,createScope,inspect:()=>({activeScopes:scopes.size,scopes:[...scopes].map(s=>s.inspect())})});
}
