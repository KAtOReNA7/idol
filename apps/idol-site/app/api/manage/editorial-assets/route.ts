import { unsupportedEditorialMethod } from '@/lib/idol/editorial-asset-service';
import { editorialAssetService } from '@/lib/idol/editorial-asset-host';
import { editorialFailure, editorialJson } from '@/lib/idol/editorial-asset-service';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try {
    return editorialJson(await (await editorialAssetService()).status(request));
}
catch (error) {
    return editorialFailure(error);
} }
export async function PUT(request: Request) { try {
    const result = await (await editorialAssetService()).upload(request);
    return editorialJson(result, result.state === 'verified' ? 200 : result.state === 'unknown' ? 503 : 409);
}
catch (error) {
    return editorialFailure(error);
} }
export const POST = unsupportedEditorialMethod;
export const PATCH = unsupportedEditorialMethod;
export const DELETE = unsupportedEditorialMethod;
export const OPTIONS = unsupportedEditorialMethod;
export const HEAD = unsupportedEditorialMethod;
