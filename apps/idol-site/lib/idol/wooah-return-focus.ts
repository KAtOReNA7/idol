import {readWooahRoute} from './wooah-editorial';
export type WooahLinkFocus={path:string;href:string;key:string};
/** Entry-local keys bind a specific control to one finite native destination, never arbitrary selectors. */
export function readWooahLinkFocus(value:unknown,path:string):WooahLinkFocus|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 if(v.path!==path||v.href===path||typeof v.href!=='string'||typeof v.key!=='string'||!readWooahRoute(path))return null;
 const target=readWooahRoute(v.href);if(!target)return null;
 const keys=target.member?['member:','historical-member:','hero-member:','next-member:'].map(p=>p+target.member)
  :target.release?['release:','featured-release:','related-release:','next-release:'].map(p=>p+target.release)
  :target.media?['media-title:','media-arrow:','related-media:','hero-media:'].map(p=>p+target.media)
  :['return'];
 return (v.key==='return'||keys.includes(v.key))?{path,href:v.href,key:v.key}:null;
}
