import 'server-only';
import {requireUser} from './http';
import {AppError} from './feishu';
// Capability only; never serialize the authenticated identity into page props.
export async function ownerForRequest(){
 try{return await requireUser();}
 catch(error){if(error instanceof AppError&&(error.status===401||error.status===403))return null;throw error;}
}
