'use client';
import {createContext,useContext,type ReactNode} from 'react';
const Access=createContext(false);
export function PublicAccessProvider({canEdit,children}:{canEdit:boolean;children:ReactNode}){return <Access.Provider value={canEdit}>{children}</Access.Provider>;}
export function useCanEdit(){return useContext(Access);}
