// Public provenance is reviewed separately; runtime keeps only exact display bindings.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {photoSetLabels} from './import-mv-identity-batch.mjs';
const evidence=JSON.parse(fs.readFileSync('../../docs/codex/mv-identity-asset-audit-20261025.json','utf8'));
const safe=row=>{
 if(!/^\/artist\/mv-identity-(?:20261025|20261026|batch-[abcdefghijklm]-20261026|batch-[nopqrstuv]-20261027)\/[\w./-]+$/.test(row.src)||row.src.includes('..'))throw Error('Invalid public asset path');
 if(row.evidenceLevel==='source_named_photo_set'&&(!Object.hasOwn(photoSetLabels,row.kind)||row.label!==photoSetLabels[row.kind]))throw Error('Photo-set reference must not be labeled as an MV still');
 const bytes=fs.readFileSync('public'+row.src);
 if(createHash('sha256').update(bytes).digest('hex')!==row.sha256)throw Error('Original SHA changed: '+row.src);
 if(!Number.isSafeInteger(row.width)||!Number.isSafeInteger(row.height)||row.width<=0||row.height<=0)throw Error('Dimensions missing');
 const crop=row.sourceCrop;
 if(crop&&(!(crop.width>0&&crop.height>0)||crop.x<0||crop.y<0||crop.x+crop.width>row.width||crop.y+crop.height>row.height))throw Error('Crop outside original');
 return row;
};
const covers=evidence.covers.map(safe).map(p=>({...p.workId?{workId:p.workId}:{},videoId:p.videoId,src:p.src,width:p.width,height:p.height,label:'对应视频封面',...p.sourceCrop?{sourceCrop:p.sourceCrop}:{}}));
const portraits=evidence.identityImages.map(safe).map(p=>({workId:p.workId,videoId:p.videoId,memberId:p.memberId,src:p.src,width:p.width,height:p.height,label:p.label,sourceUrl:p.sourcePageUrl,objectPosition:p.objectPosition??'50% 50%',...p.sourceCrop?{sourceCrop:p.sourceCrop}:{},...p.evidenceLevel==='source_named_photo_set'?{photoKind:p.kind,photoSetId:p.photoSet.id}:{}}));
for(const [rows,key]of [[covers,p=>p.videoId],[portraits,p=>[p.workId,p.videoId,p.memberId].join(':')]])if(new Set(rows.map(key)).size!==rows.length)throw Error('Duplicate media binding');
const output=JSON.stringify({schemaVersion:1,covers,portraits},null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync('data/mv-public-media.json','utf8')!==output)throw Error('Public media projection is stale');}else fs.writeFileSync('data/mv-public-media.json',output);
console.log(JSON.stringify({covers:covers.length,portraits:portraits.length}));
