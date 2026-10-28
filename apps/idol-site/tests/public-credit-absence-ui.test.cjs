const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {PublicWorkCredits}=require('./helpers/shared-journal-dependency-loader.cjs').sharedJournalDependency('@/components/public-work-credits');
const load=require('./helpers/public-artist-loader.cjs');
const {publicCreditForWork}=load('lib/idol/public-work-credits.ts');
const {mvMemberAbsence}=load('lib/idol/mv-member-appearance.ts');
const source=require('../data/public-work-credits.json').records;
const credit=source.find(r=>r.workId==='recvxyH5pzr7Nc');
function harness(){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0];
 return vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,requests,walk,find,txt,Editor:exportsObj.Editor,render:()=>w.render(wp)};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
}
function setup(h,delta={}){
 h.wp.work={...h.wp.work,id:credit.workId,groupIds:[credit.groupId],url:'https://www.youtube.com/watch?v='+credit.videoId,...delta};
 h.wp.data={...h.wp.data,members:credit.memberIds.map((id,i)=>({id,name:'Public singer '+i,stageName:'Singer '+i,groupIds:[credit.groupId]})),ratings:[{id:'synthetic-private-relation',workIds:[h.wp.work.id],memberIds:[credit.memberIds[0]],score:7,stylingScore:8,note:'private sentinel',memory:'keep memory'}]};
}
test('exact animated Stranger displays read-only singer references while the actual WorkDetail suppresses every member editor',()=>{
 assert(credit);assert.match(credit.label,/录音|演唱/);const h=harness();setup(h);const before=JSON.stringify({work:h.wp.work,data:h.wp.data}),tree=h.render();
 assert(mvMemberAbsence(h.wp.work));assert(publicCreditForWork(h.wp.work));
 assert(h.find(tree,n=>n.type===PublicWorkCredits),'the actual work page mounts the public reference section');
 assert(h.find(tree,n=>n.props.className==='mv-no-members'));
 assert.equal(h.find(tree,n=>n.props.className==='section cast-section'),undefined);
 assert.equal(h.find(tree,n=>n.type===h.Editor&&n.props.table==='ratings'),undefined);
 assert(h.find(tree,n=>n.type===h.Editor&&n.props.table==='works'),'MV editor remains in place');
 assert.equal(h.find(tree,n=>n.props.className==='mv-member-shortcuts'),undefined);
 assert.equal(h.requests.length,0);assert.equal(JSON.stringify({work:h.wp.work,data:h.wp.data}),before);
 const html=renderToStaticMarkup(React.createElement(PublicWorkCredits,{work:h.wp.work,data:h.wp.data,onMember(){}}));
 assert.match(html,/没有成员真人出镜/);assert.match(html,/不提供成员评分/);assert.match(html,/公开录音阵容/);
 assert.equal((html.match(/class="mv-identity-frame/g)||[]).length,6);
 assert.doesNotMatch(html,/<input|<form|cast-scores|private sentinel|keep memory/);
});
test('another Stranger video is not silently assigned the Korean animation absence or singers, and existing private editors remain intact',()=>{
 const h=harness();setup(h,{url:'https://www.youtube.com/watch?v=FY9PFBxxKR8'});const before=JSON.stringify(h.wp.data),tree=h.render();
 assert.equal(mvMemberAbsence(h.wp.work),null);assert.equal(publicCreditForWork(h.wp.work),null);
 assert.equal(h.find(tree,n=>n.props.className==='mv-no-members'),undefined);
 assert(h.find(tree,n=>n.type===h.Editor&&n.props.table==='ratings'));
 assert(h.find(tree,n=>n.type===h.Editor&&n.props.table==='works'));
 assert.equal(renderToStaticMarkup(React.createElement(PublicWorkCredits,{work:h.wp.work,data:h.wp.data,onMember(){}})),'');
 assert.equal(JSON.stringify(h.wp.data),before);assert.equal(h.requests.length,0);
});
