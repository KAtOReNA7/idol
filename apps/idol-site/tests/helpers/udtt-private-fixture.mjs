import {contract} from '../../lib/idol/design-review/sol15-runtime/contract.js';
import {artist} from '../../lib/idol/design-review/sol15-runtime/groups/udtt/index.js';
import {PRIVATE_IMAGE_IDS} from '../../lib/idol/design-review/sol15-runtime/private-images.mjs';
const originals=[artist.hero,...artist.members.map(row=>row.image),...artist.works.map(row=>row.image)];
export function fixture(){const manifestHash='a'.repeat(64);return {manifestHash,entries:Object.values(contract.assets).map(row=>{const original=originals.find(value=>value.src===row.path),assetId=PRIVATE_IMAGE_IDS[row.path];return {assetId,sha256:row.sha256,byteLength:row.bytes,mime:row.path.endsWith('.webp')?'image/webp':'image/jpeg',width:original.width,height:original.height,readUrl:'/api/editorial-assets?'+new URLSearchParams({manifest:manifestHash,asset:assetId,version:'b'.repeat(64)})};})};}
