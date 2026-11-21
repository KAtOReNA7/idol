const fs=require('node:fs'),path=require('node:path');
const {DatabaseSync}=require('node:sqlite'),Module=require('node:module'),esbuild=require('esbuild');
const source=[
 "export * from './lib/idol/personal-mv-ratings';","export {nativeExportSnapshot,ownControl} from './lib/idol/native-storage';",
 "export {projectPublicCatalog} from './lib/idol/public-catalog';","export {projectBrowserCatalog} from './lib/idol/browser-catalog';",
 "export {projectCatalog} from './lib/idol/catalog';","export {memberWorks,memberWorkSummary} from './lib/idol/member-works';",
 "export {videoId} from './lib/idol/values';","export {mvMemberAbsence} from './lib/idol/mv-member-appearance';",
 "export {PublicAccessProvider} from './components/public-access';","export {WorkDetail} from './components/catalog/work-detail';",
 "export {POST} from './app/api/personal-mv-ratings/route';","export {stageOwnerPreflight} from './lib/idol/stage-owner-preflight';",
 "export {GET as downloadBackup} from './app/api/export/route';","export {validateArchive,archiveSummary} from './lib/idol/native-format';",
 "export {createArchive,stepArchive} from './lib/idol/archive-transfer';","export {backupManifest} from './lib/idol/archive-backup';",
 "export {hash} from './lib/idol/hash';","export {prepareCatalog,summarizeMembers} from './lib/idol/personal-insights';"
].join('\n');
const bundle=esbuild.buildSync({stdin:{contents:source,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',
 external:['react','react/*','react-dom','react-dom/*','cloudflare:workers','server-only','@/app/chatgpt-auth'],
 loader:{'.css':'empty'},logLevel:'silent'}).outputFiles[0].text;
function harness(){
 const sql=new DatabaseSync(':memory:');
 for(const file of fs.readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',file),'utf8'));
 const model={user:null,beforeBatch:null,failSecond:false,loseReply:false};
 const db={
  prepare(query){
   let values=[];
   const statement=sql.prepare(query);
   return {bind(...args){values=args;return this;},first(){return statement.get(...values)??null;},all(){return {results:statement.all(...values)};},
    run(){return query.trimStart().startsWith('SELECT')?{success:true,results:statement.all(...values)}:{success:true,meta:statement.run(...values)};}};
  },
  async batch(statements){
   if(model.beforeBatch){const run=model.beforeBatch;model.beforeBatch=null;run();}
   sql.exec('BEGIN');let results;
   try{results=statements.map((s,i)=>{if(i===1&&model.failSecond)throw Error('synthetic interruption');return s.run();});sql.exec('COMMIT');}
   catch(e){sql.exec('ROLLBACK');throw e;}
   if(model.loseReply){model.loseReply=false;throw Error('synthetic missing receipt');}return results;
  }
 };
 const blobs=new Map();
 const bucket={
  async head(key){const data=blobs.get(key);return data?{size:data.byteLength}:null;},
  async get(key){const data=blobs.get(key);return data?{arrayBuffer:async()=>Uint8Array.from(data).buffer}:null;},
  async put(key,data,options){if(options?.onlyIf&&blobs.has(key))return null;blobs.set(key,Uint8Array.from(data));return {};},
 };
 const compiled=new Module(__filename,module);compiled.filename=__filename;compiled.paths=module.paths;
 compiled.require=name=>name==='cloudflare:workers'?{env:{DB:db,BUCKET:bucket}}:name==='server-only'?{}:name==='@/app/chatgpt-auth'?{getChatGPTUser:async()=>model.user}:require(name);
 compiled._compile(bundle,__filename);const api=compiled.exports;
 sql.exec("INSERT INTO idol_storage_control VALUES('main','owner','native',1,'test-snapshot',NULL,0)");
 for(const name of ['works','ratings','members','groups'])sql.prepare('INSERT INTO idol_native_fields VALUES(?,?,?,?)').run('test-snapshot:'+name,'test-snapshot',name,'[]');
 function seed(table,id,fields){sql.prepare('INSERT INTO idol_native_records(key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at) VALUES(?,?,?,?,?,?,1,0)')
  .run('test-snapshot:'+table+':'+id,'test-snapshot',table,id,JSON.stringify(fields),id+'Rev');}
 const work={id:'recWork',url:'https://youtu.be/abcdefghijk',groupIds:['recGroup'],song:'Song'};
 const member={id:'recMember',groupIds:[],formerGroupIds:['recGroup']};
 const catalog={works:[work],members:[member],groups:[],ratings:[]};
 seed('works',work.id,{fldhBWXBZE:work.url,fld2wy1cqw:{recordIds:work.groupIds}});
 seed('members',member.id,{fldf1alCIu:[{record_ids:member.formerGroupIds}]});
 const read=async(user='owner')=>api.personalMvRatingsForOwner(user,await api.ownControl(user),catalog);
 const request=async(patch={})=>({scope:(await read()).scope,workId:work.id,memberId:member.id,videoId:'abcdefghijk',score:0,stylingScore:null,revision:0,operationId:crypto.randomUUID(),...patch});
 return {api,model,sql,seed,request,read,work,member,catalog,blobs};
}
module.exports={harness};
