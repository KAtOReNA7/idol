import { unsupportedEditorialMethod } from '@/lib/idol/editorial-asset-service';
import { editorialAssetService } from '@/lib/idol/editorial-asset-host';
import { AssetError } from '@/lib/idol/editorial-asset-format';
import { boundedAssetBody, editorialFailure, editorialJson } from '@/lib/idol/editorial-asset-service';
import { decodeEditorialBackup, EDITORIAL_BACKUP_WIRE_MAX } from '@/lib/idol/editorial-asset-backup-codec';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    try {
        // Lazy body loader runs inside the shared gate AFTER owner, scope, origin and admission.
        const result = await (await editorialAssetService()).restore(request, async () => {
            if (request.headers.get('content-type') !== 'application/json')
                throw new AssetError('INVALID_CONTENT_TYPE', 400);
            const length = request.headers.get('content-length');
            if (length !== null && (!/^\d+$/.test(length) || Number(length) > EDITORIAL_BACKUP_WIRE_MAX))
                throw new AssetError('BACKUP_TOO_LARGE', 413);
            const bytes = await boundedAssetBody(request.body, EDITORIAL_BACKUP_WIRE_MAX, 10000);
            if (length !== null && bytes.byteLength !== Number(length))
                throw new AssetError('CONTENT_LENGTH_MISMATCH', 400);
            return decodeEditorialBackup(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        });
        return editorialJson(result, result.complete ? 200 : 503);
    }
    catch (error) {
        return editorialFailure(error);
    }
}
export const GET = unsupportedEditorialMethod;
export const PUT = unsupportedEditorialMethod;
export const PATCH = unsupportedEditorialMethod;
export const DELETE = unsupportedEditorialMethod;
export const OPTIONS = unsupportedEditorialMethod;
export const HEAD = unsupportedEditorialMethod;
