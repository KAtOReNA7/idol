import {buildAssetService} from '@/lib/idol/build-asset-host';
import {buildAssetFailure, buildAssetJson, unsupportedBuildAssetMethod} from '@/lib/idol/build-asset-service';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try { return buildAssetJson(await buildAssetService().status(request)); } catch (error) { return buildAssetFailure(error); } }
export async function PUT(request: Request) { try {
 const result = await buildAssetService().upload(request);
 return buildAssetJson(result, result.state === 'verified' ? 200 : result.state === 'unknown' ? 503 : 409);
} catch (error) { return buildAssetFailure(error); } }
export const HEAD = unsupportedBuildAssetMethod;
export const POST = unsupportedBuildAssetMethod;
export const PATCH = unsupportedBuildAssetMethod;
export const DELETE = unsupportedBuildAssetMethod;
export const OPTIONS = unsupportedBuildAssetMethod;
