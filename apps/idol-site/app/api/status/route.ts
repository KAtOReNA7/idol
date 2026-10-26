import {ownControl} from '@/lib/idol/native-storage';
import {configured,TABLES} from '@/lib/idol/feishu';
import {json,requireUser,failure} from '@/lib/idol/http';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await requireUser();const control=await ownControl(user.userId);const native=control?.mode==='native'||control?.mode==='frozen'&&!!control.active_snapshot;return json({app:'idol-lens',configured:native||configured(),mode:control?.mode==='frozen'?'read-only':native||configured()?'live-ready':'snapshot-only',writesPaused:control?.mode==='frozen',tableCount:Object.keys(TABLES).length,writePolicy:'explicit-save-with-fresh-preimage',source:native?'native':'feishu',snapshotIsReadOnly:true});}catch(e){return failure(e);}}
