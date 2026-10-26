import {buildAssetService} from '@/lib/idol/build-asset-host';
import {buildAssetFailure, unsupportedBuildAssetMethod} from '@/lib/idol/build-asset-service';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try { return await buildAssetService().read(request); } catch (error) { return buildAssetFailure(error); } }
export const HEAD = unsupportedBuildAssetMethod;
export const PUT = unsupportedBuildAssetMethod;
export const POST = unsupportedBuildAssetMethod;
export const PATCH = unsupportedBuildAssetMethod;
export const DELETE = unsupportedBuildAssetMethod;
export const OPTIONS = unsupportedBuildAssetMethod;
