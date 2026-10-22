'use client';
import {useSyncExternalStore} from 'react';
import {createDeferredModule} from '@/lib/idol/deferred-module';
import type {CatalogView} from '@/lib/idol/types';
import type {Route} from '@/lib/idol/journey';

const views=createDeferredModule(()=>import('./catalog-group-views'));
export function needsCatalogGroupViews(route:Route,catalog:CatalogView|null){
 // The unambiguous index route can overlap its module load with catalog IO.
 if(!route.work&&!route.member&&!route.groupId&&route.nav==='groups')return true;
 if(!catalog)return false;
 // Match App's resolved-record precedence, including stale/mixed-ID deep links.
 if(catalog.works.some(work=>work.id===route.work)||catalog.members.some(member=>member.id===route.member))return false;
 if(catalog.groups.some(group=>group.id===route.groupId))return true;
 return false;
}
export function useCatalogGroupViews(){
 const state=useSyncExternalStore(views.subscribe,views.getSnapshot,views.getServerSnapshot);
 return {...state,load:views.load};
}
