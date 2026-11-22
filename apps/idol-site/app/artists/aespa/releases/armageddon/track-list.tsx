'use client';

import type {ReactNode} from 'react';
import {useMemberWorkFocus} from '@/components/use-member-work-focus';

export function ArmageddonTrackList({children}: {children: ReactNode}) {
  useMemberWorkFocus(true, 'armageddon');
  return <ol role="list">{children}</ol>;
}
