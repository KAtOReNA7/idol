import {readPublishedEditorialViewer} from '@/lib/idol/public-images';
import {editorialJson,editorialFailure,unsupportedEditorialMethod} from '@/lib/idol/editorial-asset-service';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{return editorialJson(await readPublishedEditorialViewer(request));}catch(error){return editorialFailure(error);}}
export const POST=unsupportedEditorialMethod;
export const PUT=unsupportedEditorialMethod;
export const PATCH=unsupportedEditorialMethod;
export const DELETE=unsupportedEditorialMethod;
export const HEAD=unsupportedEditorialMethod;
export const OPTIONS=unsupportedEditorialMethod;
