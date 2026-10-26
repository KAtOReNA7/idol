import {readPublicCatalog,publicQuery} from '@/lib/idol/public-reader';
import {ownerForRequest} from '@/lib/idol/public-access';
import {requestedArtist,projectArtistCatalog} from '@/lib/idol/artist-catalog';
import {projectBrowserCatalog,requestedBrowserCatalog} from '@/lib/idol/browser-catalog';
import {ownControl,assertSourceUnchanged} from '@/lib/idol/native-storage';
import {readNativeCatalog} from '@/lib/idol/native-reader';
import {getReadableCatalog} from '@/lib/idol/durable-catalog';
import {requireUser,json,failure} from '@/lib/idol/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const user=await ownerForRequest();if(!user){const query=publicQuery(request,['artist','shape'],['shape']);requestedBrowserCatalog(query);return json(await readPublicCatalog(requestedArtist(query)));}const params=new URL(request.url).searchParams;const artist=requestedArtist(params),browserView=requestedBrowserCatalog(params);const before=await ownControl(user.userId);const force=['1','background'].includes(params.get('refresh')??'');const native=await readNativeCatalog(user.userId,force);const result=native??await getReadableCatalog(user.userId,force);await assertSourceUnchanged(user.userId,before);const scoped=artist?projectArtistCatalog(result,artist):result;return json(browserView?projectBrowserCatalog(scoped):scoped);}catch(e){return failure(e);}}
