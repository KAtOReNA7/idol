import {ownerForRequest} from '@/lib/idol/public-access';
import type {ReactNode} from 'react';
export default async function ReviewLayout({children}:{children:ReactNode}){if(!await ownerForRequest())return <main><h1>未发布图片审阅仅限所有者</h1><a href="/">浏览公开资料</a></main>;return children;}
