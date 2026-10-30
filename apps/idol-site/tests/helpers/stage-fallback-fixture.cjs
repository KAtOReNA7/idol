const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),env={...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONIOENCODING:'utf-8'};
const workId='recSameSongFixture',groupId='recSameSongGroup',now=new Date().toISOString();
const evidence={note:'Reviewed same-song performance, exact actual version and source scope.',urls:['https://example.org/performance']};
const base=(overrides={})=>({videoId:'fallsource1',sourceClass:'official',platform:'youtube',completeness:'full',type:'broadcast_stage',selection:{occasion:'music_program',evidence},eligibility:'eligible',versionMatch:true,scorePolicy:'score',title:'Synthetic music-program performance',channel:'Synthetic channel',url:'https://www.youtube.com/watch?v=fallsource1',sourceUrl:'https://example.org/performance',checkedAt:now,publishedAt:'2026-01-01',languageVersionEvidence:{basis:'Actual version reviewed'},likes:{value:10,display:'10',precision:'exact'},...overrides});
function fallback({completeness='excerpt',version='different',...overrides}={}){
 return base({completeness,versionMatch:false,performerScope:'full_group',originalPerformerScope:'full_group',sameSongFallback:{sameSong:true,targetWorkId:workId,groupId,targetSong:'Synthetic Song (Japanese Ver.)',performedSong:'Synthetic Song',reason:'No matching complete Japanese performance was found in the reviewed sources.',completeness,version,performerScope:'full_group',originalPerformerScope:'full_group',differences:[...(completeness==='excerpt'?['只含歌曲节选，非完整演出']:[]),...(version==='different'?['韩语原版，目标为日语版']:[])],evidence},...overrides});
}
function temporary(fn){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'idol-same-song-'));try{return fn(temp);}finally{fs.rmSync(temp,{recursive:true,force:true});}}
function normalize(selected,candidates=[selected],recordId=workId){
 return temporary(temp=>{const input=path.join(temp,'reviewed.json');fs.writeFileSync(input,JSON.stringify({checkedAt:now,items:[{recordId,status:'verified',selected,candidates,reason:'Synthetic reviewed candidate set',checkedAt:now}]}));return cp.spawnSync('python',['scripts/normalize-stage-patch.py',input],{cwd:root,env,encoding:'utf8'});});
}
function merge(batch,{previous,score=null,journal=[],capturedAt=now,published,omitSchema=false,sourceWork,additionalWorks=[],additionalVideos={},scores={}}={}){
 return temporary(temp=>{
  fs.mkdirSync(path.join(temp,'scripts'),{recursive:true});fs.mkdirSync(path.join(temp,'data/stages'),{recursive:true});
  for(const f of ['merge-stage-batch.py','stage_selection_policy.py','stage_source_identity.py'])fs.copyFileSync(path.join(root,'scripts',f),path.join(temp,'scripts',f));
  const write=(name,obj)=>fs.writeFileSync(path.join(temp,name),JSON.stringify(obj,null,2)+'\n');
  const videos={...additionalVideos,...(previous?{[workId]:previous}:{})};if(sourceWork)videos[sourceWork.recordId]=sourceWork.stage;
  const inventory=[{recordId:workId,groupIds:[groupId],song:'Synthetic Song (Japanese Ver.)',mv:{videoId:'originalMV1',officialTitle:'Original Official MV'}}];
  for(const w of additionalWorks)inventory.push({groupIds:[groupId],mv:{videoId:'extraMVid12',officialTitle:'Additional Original Official MV'},...w});
  if(sourceWork)inventory.push({recordId:sourceWork.recordId,groupIds:sourceWork.groupIds??[groupId],song:sourceWork.song,mv:{videoId:'anotherMV12',officialTitle:'Another Official MV'}});
  if(new Set(inventory.map(w=>w.recordId)).size!==inventory.length)throw new Error('Duplicate synthetic inventory work');
  write('data/stages/inventory.json',{works:inventory});write('data/stages/status.json',{inventoryCount:inventory.length,works:Object.fromEntries(inventory.map(w=>[w.recordId,{status:videos[w.recordId]?'verified':'pending',reason:'Synthetic',checkedAt:now}]))});write('data/stage-videos.json',videos);
  const before=fs.readFileSync(path.join(temp,'data/stage-videos.json'));write('batch.json',batch);
  write('fresh.json',{source:'native',formatVersion:'idol.native-data-export.v1',capturedAt,tables:{works:{fields:omitSchema?[]:[{field_id:'fld641ausT'}],records:inventory.map(w=>({recordId:w.recordId,fields:{fld641ausT:Object.hasOwn(scores,w.recordId)?scores[w.recordId]:w.recordId===workId?score:null}}))}},journal,siteMetadata:{stageVideos:published??videos}});
  const protectedFiles=['data/stage-videos.json','data/stages/status.json','data/stages/inventory.json','fresh.json'];
  const readProtected=()=>Object.fromEntries(protectedFiles.map(f=>[f,fs.readFileSync(path.join(temp,f))]));const beforeFiles=readProtected();
  const result=cp.spawnSync('python',[path.join(temp,'scripts/merge-stage-batch.py'),path.join(temp,'batch.json'),path.join(temp,'fresh.json')],{cwd:temp,env,encoding:'utf8'});
  const after=fs.readFileSync(path.join(temp,'data/stage-videos.json'));return {...result,before,after,beforeFiles,afterFiles:readProtected(),videos:JSON.parse(after),artifact:fs.existsSync(path.join(temp,'data/stages/evidence/batch.json'))};
 });
}
function validate(stage,edit,sourceWork,{additionalWorks=[],additionalVideos={}}={}){
 return temporary(temp=>{
  const files=['data/stage-videos.json','data/stages/inventory.json','data/stages/status.json','data/stages/selection-policy-baseline-20261028.json'];
  const records=Object.fromEntries(files.map(f=>[f,JSON.parse(fs.readFileSync(path.join(root,f)))]));
  const copy=structuredClone(stage);edit?.(copy);
  Object.assign(records[files[0]],additionalVideos);records[files[0]][workId]=copy;records[files[1]].works.push({recordId:workId,groupIds:[groupId],song:'Synthetic Song (Japanese Ver.)',mv:{videoId:'originalMV1'}});
  for(const w of additionalWorks){records[files[1]].works.push({groupIds:[groupId],mv:{videoId:'extraMVid12'},...w});records[files[2]].works[w.recordId]={status:records[files[0]][w.recordId]?'verified':'pending',reason:'Synthetic sibling version',checkedAt:now};}
  if(sourceWork){records[files[0]][sourceWork.recordId]=sourceWork.stage;records[files[1]].works.push({recordId:sourceWork.recordId,groupIds:sourceWork.groupIds??[groupId],song:sourceWork.song,mv:{videoId:'anotherMV12'}});records[files[2]].works[sourceWork.recordId]={status:'verified',reason:'Synthetic referenced source',checkedAt:now};}
  records[files[2]].inventoryCount=records[files[1]].works.length;records[files[2]].works[workId]={status:'verified',reason:'Synthetic fallback',checkedAt:now};
  for(const f of files){fs.mkdirSync(path.dirname(path.join(temp,f)),{recursive:true});fs.writeFileSync(path.join(temp,f),JSON.stringify(records[f]));}
  return cp.spawnSync(process.execPath,[path.join(root,'scripts/validate-stages.mjs')],{cwd:temp,encoding:'utf8'});
 });
}
module.exports={root,workId,groupId,now,evidence,base,fallback,normalize,merge,validate};
