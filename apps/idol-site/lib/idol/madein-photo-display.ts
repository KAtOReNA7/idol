/** Exact local presentation derivatives only. Original URLs remain the lightbox/provenance identity. */
const displayDerivatives:Readonly<Record<string,string>>=Object.freeze({
 '/artist/madein/independent-20261016/girl-meets-boy-press-01.jpg':'/artist/madein/independent-20261016/display-q95/girl-meets-boy-press-01-q95.webp',
 '/artist/madein/independent-20261016/girl-meets-boy-press-02.jpg':'/artist/madein/independent-20261016/display-q95/girl-meets-boy-press-02-q95.webp',
 '/artist/madein/independent-20261016/girl-meets-boy-press-04.jpg':'/artist/madein/independent-20261016/display-q95/girl-meets-boy-press-04-q95.webp',
});
export function madeinDisplayPhoto(original:string):string{
 return Object.hasOwn(displayDerivatives,original)?displayDerivatives[original]:original;
}
