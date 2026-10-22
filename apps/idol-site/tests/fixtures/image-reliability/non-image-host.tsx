/** Explicit test-only signature stub for the withheld, non-image timeline host.
 * Only read-only Catalog/serverRoute injection and background pass-through are
 * supplied. This does not implement timeline/navigation/save behavior.
 */
import {createContext,useContext,type ReactNode} from 'react';
import type {CatalogView} from '../../../lib/idol/types';
export interface FixtureHostOptions {catalog?:CatalogView|null;serverRoute?:string;loading?:boolean;error?:string;onRetry?:()=>void;hideLegacyBackground?:boolean}
const context=createContext<FixtureHostOptions>({});
export function ArtistTimelineHostProvider({value,children}:{value:FixtureHostOptions;children:ReactNode}){return <context.Provider value={value}>{children}</context.Provider>;}
export function useArtistTimelineHostOptions(){return useContext(context);}
export function ArtistTimelineHost({background}:{groupId:string;catalog:CatalogView|null;loading?:boolean;error?:string;onRetry?:()=>void;background?:ReactNode;showTitle?:boolean}){return <aside data-image-fixture-nonimage="timeline-background">{background}</aside>;}
