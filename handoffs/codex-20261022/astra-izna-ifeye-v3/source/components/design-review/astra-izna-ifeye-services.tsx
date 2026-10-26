'use client';
import {createContext,useContext,type ReactNode} from 'react';
import type {ReadonlyAssetResolver,NativeServices} from '@/lib/idol/design-review/astra-izna-ifeye-runtime/host.mjs';

export type AstraIznaIfeyeServices=Readonly<{
  resolveAsset?:ReadonlyAssetResolver;
  native?:Omit<NativeServices,'routeUrl'|'safeArtistReturn'>;
}>;
const emptyServices: AstraIznaIfeyeServices=Object.freeze({});
const Context=createContext<AstraIznaIfeyeServices>(emptyServices);

/** Dot may inject an existing read-only address map and independently verified
 * native bindings here. This provider creates no storage/API/admission policy.
 */
export function AstraIznaIfeyeServicesProvider({value,children}:{value:AstraIznaIfeyeServices;children:ReactNode}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useAstraIznaIfeyeServices=()=>useContext(Context);
