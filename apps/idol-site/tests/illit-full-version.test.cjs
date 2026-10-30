const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const load=require('./helpers/public-artist-loader.cjs');
const {withVerifiedVersionDisplay,versionIdentityFields}=load('lib/idol/verified-version-display.ts');
const {F}=load('lib/idol/fields.ts');
const reviewed=require('../data/versions/verified-display.json');
const stages=require('../data/stage-videos.json');
const receipt=require('../../../docs/codex/evidence/20261029-group-followup/illit-full-version.json');
const full='rec28ldfRTrKtW',short='rec28ldfRTrKy2';
const fieldMap={name:F.works.name,song:F.works.song,url:F.works.url,videoType:F.works.videoType,version:F.works.version,releaseDate:F.works.releaseDate,officialTitle:F.works.officialTitle,channel:F.works.channel,channelUrl:'fld6Ab27Zx',performerUnit:'fld2UfUVYO',groupIds:F.works.groups};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])):value;
function fixture(){
 const identities=reviewed.identities.filter(w=>[full,short].includes(w.workId));
 const tables={works:{fields:Object.values(fieldMap).map(field_id=>({field_id})),records:identities.map(w=>({recordId:w.workId,fields:Object.fromEntries(Object.entries(fieldMap).map(([key,id])=>[id,key==='groupIds'?w.groupIds.map(recordId=>({recordId})):w[key]]))}))}};
 const catalog={mode:'live',works:identities.map(w=>({...w,id:w.workId,stage:structuredClone(stages[w.workId]),score:w.workId===short?0:8,stageScore:w.workId===short?0:9,note:'synthetic '+w.workId,watched:w.workId===short?'未观看':'已观看',ratingIds:['synthetic-'+w.workId]})),ratings:identities.map(w=>({id:'synthetic-'+w.workId,workIds:[w.workId],memberIds:['synthetic-member'],score:w.workId===short?0:7,note:'synthetic member note'})),groups:[],members:[]};
 return {catalog,tables};
}

test('ILLIT full song and short performance use only the existing records and edge with explicit reciprocal scope labels',()=>{
 const {catalog,tables}=fixture(),out=withVerifiedVersionDisplay(catalog,tables);
 assert.equal(reviewed.identities.length,receipt.before.identityCount);
 assert.equal(hash(JSON.stringify(sorted(reviewed.identities))),receipt.before.identitiesSha256);
 assert.deepEqual(reviewed.tags.slice(0,receipt.before.tagCount),receipt.before.tags);
 assert.deepEqual(reviewed.relations.map(({displayLabels,...edge})=>edge),receipt.before.relations);
 assert.equal(reviewed.relations.filter(edge=>'displayLabels' in edge).length,1,'the label override belongs only to this reviewed edge');
 for(const [source,target,tag,label] of [[short,full,'约 60 秒短版表演','完整歌曲版'],[full,short,'完整歌曲版','约 60 秒短版表演']]){
  const display=out.works.find(w=>w.id===source).versionDisplay;
  assert.deepEqual(display.tags,[tag]);assert.equal(display.links.length,1);
  assert.deepEqual(display.links[0],{workId:target,title:"It's Me",labels:[label],categories:['其他版本']});
 }
});

test('ILLIT scope labels keep every identity field and both endpoints fail-closed',()=>{
 assert.equal(versionIdentityFields.length,12);
 for(const id of [full,short])for(const [key,field] of Object.entries(fieldMap)){
  const {catalog,tables}=fixture();tables.works.records.find(row=>row.recordId===id).fields[field]=key==='groupIds'?[]:'changed';
  const out=withVerifiedVersionDisplay(catalog,tables);
  assert.equal(out.works.find(w=>w.id===id).versionDisplay,undefined,`${id}/${key}`);
  assert.equal(out.works.find(w=>w.id!==id).versionDisplay.links.length,0,`no link to changed ${id}/${key}`);
 }
 for(const mutation of [f=>f.catalog.mode='snapshot',f=>f.tables.works.fields=[],f=>f.tables.works.records.push(f.tables.works.records[0])]){
  const f=fixture();mutation(f);assert.ok(withVerifiedVersionDisplay(f.catalog,f.tables).works.every(w=>!w.versionDisplay));
 }
});

test('ILLIT version navigation metadata preserves separate private values, personal relations and both formal stage sources',()=>{
 const f=fixture(),before=structuredClone(f),out=withVerifiedVersionDisplay(f.catalog,f.tables);
 assert.deepEqual(f,before);
 assert.deepEqual({...out,works:out.works.map(({versionDisplay,...w})=>w)},f.catalog);
 for(const id of [full,short])assert.deepEqual(out.works.find(w=>w.id===id).stage,receipt.before.targetStages[id]);
 assert.equal(out.works.find(w=>w.id===full).stage.videoId,'00IPFnp2Tdg');
 assert.equal(out.works.find(w=>w.id===short).stage.videoId,'a2AvaSdqN28');
 assert.equal(out.works.find(w=>w.id===short).score,0);assert.equal(out.works.find(w=>w.id===short).stageScore,0);
 assert.deepEqual(out.ratings,f.catalog.ratings);
 for(const [relative,digest] of Object.entries(receipt.protectedFilesBefore))assert.equal(hash(fs.readFileSync(path.join(__dirname,'..',relative))),digest,relative);
});
