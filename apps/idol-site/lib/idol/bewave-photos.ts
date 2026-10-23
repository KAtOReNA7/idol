/** Retained originals, with explicit families so unrelated URLs are unchanged. */
export function bewaveOriginalPhoto(src:string){
 if(/^\/artist\/bewave\/batch-b-20261016(?:-webp-v1)?\/group-display\.webp$/.test(src))return '/artist/bewave/batch-b-20261016/group-original.jpg';
 const match=/^\/artist\/bewave\/batch-c-20261016\/(c-task02-bewave-(?:jiun|gowoon|lena|ain|yunseul|zena)-interview-portrait)\.display\.webp$/.exec(src);
 return match?`/artist/bewave/batch-c-20261016/${match[1]}.original.jpg`:src;
}
