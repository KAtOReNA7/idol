/** Local read-only verification: emit hashes/reasons only, never original records. */
import {readFileSync,writeFileSync} from 'node:fs';
import {hash,planClaim} from './guard.mjs';
const path=process.argv[2];if(!path)throw new Error('Pass local export path');
const load=n=>JSON.parse(readFileSync(new URL('./data/'+n,import.meta.url),'utf8'));
const data=load('canonical.json'),ledger=load('adoption-ledger.json').records,sourceIds=load('source-index.json').sources.map(s=>s.sourceId),exp=JSON.parse(readFileSync(path,'utf8'));
const fields={name:'fldkWtH5Dl',stageName:'fld1jPwSAP',cnName:'fld3ZUEOW4',role:'fldFqUenwo',status:'fld3U12Dow',profile:'fld2J3j9r8',officialUrl:'fld4QBGQoc'};
function text(v){if(v==null)return '';if(typeof v==='string')return v;if(Array.isArray(v))return v.map(text).join('');if(typeof v==='object')return text(v.text??v.name??v.link??v.url??v.value??'');return typeof v==='number'?String(v):'';}
const ids=v=>Array.isArray(v)?v:typeof v==='object'&&v?v.link_record_ids??[]:[];
const records=new Map(exp.tables.members.records.map(r=>[r.recordId,r]));
const options=exp.tables.members.fields.find(f=>f.field_id===fields.role).property.options.map(o=>o.name);
const context={adoptedClaimHashes:Object.fromEntries(ledger.map(l=>[l.id,l.adoptedClaimHash])),availableSourceIds:sourceIds,roleOptions:options,nowMs:0,observedAtMs:0};
const results=data.memberClaims.map(c=>{
 const raw=records.get(c.memberId)?.fields;if(!raw)return {id:c.id,ok:false,reason:'missing_member'};
 const publicFields=Object.fromEntries(Object.entries(fields).map(([k,id])=>[k,text(raw[id])]));
 const url=raw[fields.officialUrl];if(url&&typeof url==='object'&&!Array.isArray(url))publicFields.officialUrl=url.link??url.url??'';
 const current={memberId:c.memberId,publicFields,groupIds:[...ids(raw.fld6bhQOdO),...ids(raw.fldf1alCIu)],currentGroupIds:ids(raw.fld6bhQOdO),formerGroupIds:ids(raw.fldf1alCIu),roleLabels:raw[fields.role]};
 const result=planClaim(c,current,context);
 return {id:c.id,ok:result.ok,...(result.ok?{proposalHash:hash(result)}:{reason:result.reason})};
});
const counts={};for(const r of results){const key=r.ok?'snapshot_guard_pass':r.reason;counts[key]=(counts[key]||0)+1;}
const report={mode:'historical_snapshot_simulation_not_fresh_live_authorization',capturedAt:exp.capturedAt,counts,results};
if(counts.snapshot_guard_pass!==159||counts.not_accepted!==9||counts.current_overlay_target_required!==24)throw new Error('Unexpected local guard counts: '+JSON.stringify(counts));
writeFileSync(new URL('./data/local-guard.fixture.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(counts);
