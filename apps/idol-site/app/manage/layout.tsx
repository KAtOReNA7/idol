import {ownerForRequest} from '@/lib/idol/public-access';
import type {ReactNode} from 'react';
import {SiteSignInLink} from '@/components/site-sign-in-link';
export default async function ManageLayout({children}:{children:ReactNode}){if(!await ownerForRequest())return <main><h1>管理仅限所有者</h1><SiteSignInLink returnTo="/manage">所有者登录</SiteSignInLink></main>;return children;}
