'use client';

import {useLayoutEffect,type ReactNode} from 'react';
import {EarlyRecordReturnFocus} from './release-track-list';

export function ArtistDirectoryRecordLinks({route,ready,children}:{route:string; ready:boolean; children:ReactNode}) {
  useLayoutEffect(()=>{
    if (ready && location.hash) document.dispatchEvent(new Event('stage-directory-links-ready'));
  },[ready,route]);
  return <div data-directory-record-links={route}><EarlyRecordReturnFocus/>{children}</div>;
}
