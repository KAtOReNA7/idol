import type {CatalogView} from '../types';
export function catalogBelongs(catalog:unknown):boolean;
export function createUdttNative(options:{host:HTMLElement;catalog:CatalogView;viewer:unknown;production:object;canEdit?:boolean;nativePortrait?:NativePortraitBinding;onStatus?:(message:string)=>void}):{ready:Promise<unknown>;destroy:()=>void};

export type NativePortraitBinding={destroy:()=>void};
export function prepareUdttNativePortrait(options:{catalog:CatalogView;viewer:unknown;production:object;window:Window;publicMode?:boolean;signal:AbortSignal}):Promise<NativePortraitBinding>;
