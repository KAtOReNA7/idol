import {requireBuildAssetOwner} from '@/lib/idol/build-asset-host';
import BuildAssetsClient from './client';
export const dynamic = 'force-dynamic';
export default async function BuildAssetsPage() {
 try { await requireBuildAssetOwner(); }
 catch { return <main><h1>构建图片维护仅限站点所有者</h1><a href="/manage">返回管理</a></main>; }
 return <BuildAssetsClient/>;
}
