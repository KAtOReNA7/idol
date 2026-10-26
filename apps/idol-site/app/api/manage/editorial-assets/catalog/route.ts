import { editorialAssetService } from '@/lib/idol/editorial-asset-host';
import { editorialFailure, editorialJson, unsupportedEditorialMethod } from '@/lib/idol/editorial-asset-service';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try { return editorialJson(await (await editorialAssetService()).catalog(request)); }
    catch (error) { return editorialFailure(error); }
}
export const POST = unsupportedEditorialMethod;
export const PUT = unsupportedEditorialMethod;
export const PATCH = unsupportedEditorialMethod;
export const DELETE = unsupportedEditorialMethod;
export const OPTIONS = unsupportedEditorialMethod;
export const HEAD = unsupportedEditorialMethod;
