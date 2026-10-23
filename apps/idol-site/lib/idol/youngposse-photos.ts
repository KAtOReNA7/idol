/** Resolve only the retained, named YOUNG POSSE official portrait family. */
export function youngposseOriginalPhoto(src:string){
 const match=/^\/artist\/youngposse\/batch-b-20261016(?:-webp-v1)?\/(group|sunhye|yeonjung|jiana|doeun|jieun)-display\.webp$/.exec(src);
 return match?`/artist/youngposse/batch-b-20261016/${match[1]}-original.${match[1]==='group'?'png':'jpg'}`:src;
}
