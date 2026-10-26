import {readPublishedEditorial} from '@/lib/idol/public-images';
import {ownerForRequest} from '@/lib/idol/public-access';
import { unsupportedEditorialMethod } from '@/lib/idol/editorial-asset-service';
import { editorialAssetService } from '@/lib/idol/editorial-asset-host';
import { editorialFailure } from '@/lib/idol/editorial-asset-service';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try {
    if(!await ownerForRequest())return await readPublishedEditorial(request);
    return await (await editorialAssetService()).read(request);
}
catch (error) {
    return editorialFailure(error);
} }
export const PUT = unsupportedEditorialMethod;
export const POST = unsupportedEditorialMethod;
export const PATCH = unsupportedEditorialMethod;
export const DELETE = unsupportedEditorialMethod;
export const OPTIONS = unsupportedEditorialMethod;
export const HEAD = unsupportedEditorialMethod;
