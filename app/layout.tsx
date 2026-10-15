import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'stage. · 私人女团手帐',description:'留住每一支 MV 里，真正打动你的瞬间。',robots:{index:false,follow:false}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>;}
