import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {careerPeriodEvents} from '../lib/idol/member-career-core.ts';

// Public evidence only. Precompute the existing presentation without changing it.
export function projectMemberCareers(data){
 const eventSets=[],indexes=new Map(),usedSources=new Set();
 const periods=data.periods.flatMap(period=>{
  const events=careerPeriodEvents(period);
  if(!events.length)return [];
  const display={events,sourceIds:period.sourceIds};
  const key=JSON.stringify(display);
  let eventSet=indexes.get(key);
  if(eventSet===undefined){eventSet=eventSets.length;indexes.set(key,eventSet);eventSets.push(display);}
  period.sourceIds.forEach(id=>usedSources.add(id));
  return [{periodId:period.periodId,memberId:period.memberId,groupId:period.groupId,eventSet}];
 });
 return {periods,eventSets,sources:data.sources.filter(source=>usedSources.has(source.sourceId))};
}

// Keep audited originals intact. Display projections enter pages; career guard inputs stay server-side.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pick=(value,keys)=>Object.fromEntries(keys.filter(key=>Object.hasOwn(value,key)).map(key=>[key,value[key]]));
const projectionSources={
 'member-careers/source-ids.json':'../research/member-careers/data/source-index.json',
 'member-careers/trusted-hashes.json':'../research/member-careers/data/adoption-ledger.json',
 'member-careers/accepted-claims.json':'../research/member-careers/data/canonical.json',
};
export const projections={
 'member-careers/source-ids.json':data=>data.sources.map(s=>s.sourceId),
 'member-careers/trusted-hashes.json':data=>Object.fromEntries(data.records.map(c=>[c.id,c.adoptedClaimHash])),
 'member-careers/accepted-claims.json':data=>data.memberClaims.filter(c=>c.kind==='member_patch'&&['accepted','accepted_with_revision'].includes(c.decision)),
 'member-careers/periods.json':projectMemberCareers,
 'hearts2hearts-figma-assets.json':data=>pick(data,['members','heroImage','releaseImages']),
 'billlie-figma-catalog.json':data=>({...data,
  releases:data.releases.map(({projectReleaseId,externalCollectionIdentity,...display})=>display),
  works:data.works.map(work=>({id:work.id,
   mv:work.mv?pick(work.mv,['id','src']):work.mv,
   stage:work.stage?pick(work.stage,['id','src']):work.stage})),
 }),
 'idle-design-public.json':data=>({...data,assets:Object.fromEntries(Object.entries(data.assets).map(([key,asset])=>[key,pick(asset,['src','width','height','alt'])]))}),
};
export function generate({check=false}={}){
 const stale=[];
 for(const [name,project] of Object.entries(projections)){
  const source=JSON.parse(readFileSync(path.join(root,'data',projectionSources[name]??name),'utf8'));
  const output=JSON.stringify(project(source),null,2)+'\n';
  const destination=path.join(root,'data/runtime',name);
  if(check){let current;try{current=readFileSync(destination,'utf8');}catch{}if(current!==output)stale.push(name);}
  else{mkdirSync(path.dirname(destination),{recursive:true});writeFileSync(destination,output);}
 }
 if(stale.length)throw new Error(`Stale runtime data: ${stale.join(', ')}. Run node scripts/build-artist-runtime-data.mjs`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))generate({check:process.argv.includes('--check')});
