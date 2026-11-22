import type {ReactNode} from 'react';
import {artistRecognitionEditions} from '@/lib/idol/artist-recognition-editions';
import {MemberRecognitionProvider} from './member-recognition-provider';

export function ArtistRecognition({slug,children}:{slug:string;children:ReactNode}){
 const editions=artistRecognitionEditions(slug);
 return editions.length?<MemberRecognitionProvider editions={editions}>{children}</MemberRecognitionProvider>:children;
}
