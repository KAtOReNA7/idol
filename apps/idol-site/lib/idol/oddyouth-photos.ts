/** Resolve exact local display identities to retained original bytes. */
export function oddyouthOriginalPhoto(src:string){
 const match=/^\/artist\/oddyouth\/batch-b-20261016(?:-webp-v1)?\/(group|summer|myah|maika|kanie|yeeum)-display\.webp$/.exec(src);
 return match?`/artist/oddyouth/batch-b-20261016/${match[1]}-original.jpg`:src;
}
