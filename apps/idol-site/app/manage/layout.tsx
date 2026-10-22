import {ownerForRequest} from '@/lib/idol/public-access';
import type {ReactNode} from 'react';
export default async function ManageLayout({children}:{children:ReactNode}){if(!await ownerForRequest())return <main><h1>管理仅限所有者</h1><a href="/signin-with-chatgpt?return_to=%2Fmanage">所有者登录</a></main>;return children;}
