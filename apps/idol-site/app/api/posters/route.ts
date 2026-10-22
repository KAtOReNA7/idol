import {readPublishedPoster} from '@/lib/idol/public-images';
import {ownerForRequest} from '@/lib/idol/public-access';
import {requireUser,failure} from '@/lib/idol/http';
import {posterQuery,readPoster} from '@/lib/idol/mv-poster-storage';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const user=await ownerForRequest();if(!user)return await readPublishedPoster(request);return await readPoster(user.userId,posterQuery(request)!);}catch(e){return failure(e);}}
