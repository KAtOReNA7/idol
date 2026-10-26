/** Original bytes are retained; only exact, owned display families are mapped. */
export function candyshopOriginalPhoto(src:string){
 const main=/^\/artist\/candyshop\/batch-b-20261016(?:-webp-v1)?\/(group|soram|sui|sarang|julia)-display\.webp$/.exec(src);
 if(main)return `/artist/candyshop/batch-b-20261016/${main[1]}-original.jpg`;
 if(src==='/artist/candyshop/batch-c-20261016/c-task03-candyshop-yuina.display.webp')return '/artist/candyshop/batch-c-20261016/c-task03-candyshop-yuina.original.jpg';
 return src;
}
