export type AstraSlug='izna'|'ifeye';
export type AssetIdentity=Readonly<{assetKey:string;groupId:string;sha256:string;bytes:number;width:number;height:number}>;
export type AssetBinding=AssetIdentity&Readonly<{url:string}>;
export type AssetContext=Readonly<{slug:AstraSlug;groupId:string;identity:AssetIdentity}>;
export type ReadonlyAssetResolver=(asset:unknown,context:AssetContext)=>AssetBinding|null;
export type PublicRequest=Readonly<{action:string;groupId:string;returnTo:string;memberId?:string;workId?:string|null;videoId?:string;videoType?:string|null;slotType?:'MV'|'STAGE'}>;
export type NativeBinding=Readonly<{kind:'member'|'video';groupId:string;evidence:string;memberId?:string;workId?:string;videoId?:string;videoType?:string|null;slotType?:'MV'|'STAGE';sourceKey?:string;parentWorkIds?:readonly string[];clip?:null;scoreBindingVerified?:boolean}>;
export type NativeServices=Readonly<{
  bindings:readonly NativeBinding[];
  routeUrl:(route:any)=>string;
  safeArtistReturn:(value:string)=>string|null;
  open:(request:PublicRequest,context:Readonly<{href:string;resume:()=>void}>)=>boolean;
}>;
export type ReviewHandle=Readonly<{ready:Promise<{status:string}>;root:HTMLElement;shadow:ShadowRoot;navigate:(hash:string)=>boolean;destroy:()=>void;inspect:()=>{activeScopes:number;scopes:unknown[]}}>;
export function mountAstraIznaIfeyeReview(options:{host:HTMLElement;data:unknown;resolveAsset?:ReadonlyAssetResolver;native?:NativeServices;onStatus?:(message:string)=>void}):ReviewHandle;
