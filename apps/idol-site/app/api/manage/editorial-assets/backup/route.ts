import { unsupportedEditorialMethod } from '@/lib/idol/editorial-asset-service';
import { editorialAssetService } from '@/lib/idol/editorial-asset-host';
import { editorialFailure, editorialPrivateHeaders } from '@/lib/idol/editorial-asset-service';
import { encodeEditorialBackup } from '@/lib/idol/editorial-asset-backup-codec';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try {
    const bundle = await (await editorialAssetService()).backup(request), body = encodeEditorialBackup(bundle);
    return new Response(body, { headers: { ...editorialPrivateHeaders, 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="editorial-assets-${bundle.metadata.manifestHash}.json"` } });
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
