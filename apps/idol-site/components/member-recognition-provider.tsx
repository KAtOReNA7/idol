'use client';
import {createContext,useContext,useMemo,type ReactNode} from 'react';
import {createRecognitionSelector,type RecognitionEdition,type RecognitionSelector} from '@/lib/idol/recognition-edition-lookup';

const RecognitionContext=createContext<RecognitionSelector|undefined>(undefined);
export function MemberRecognitionProvider({editions,children}:{editions:RecognitionEdition[];children:ReactNode}){
 const select=useMemo(()=>createRecognitionSelector(editions),[editions]);
 return <RecognitionContext.Provider value={select}>{children}</RecognitionContext.Provider>;
}
export function useMemberRecognition(){return useContext(RecognitionContext);}
