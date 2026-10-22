const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ids=Object.fromEntries([...fs.readFileSync('lib/idol/artist-navigation.ts','utf8').matchAll(/export const (\w+_GROUP_ID)='([^']+)'/g)].map(m=>[m[1],m[2]]));
function harness(groupId){
 const prefix=fs.readFileSync(path.join(__dirname,'editor-flow.test.cjs'),'utf8').split('(async()=>{')[0].replace('const localRequire=n=>{','const localRequire=n=>{if(n===\'@/lib/idol/artist-navigation\')return '+JSON.stringify(ids)+';');
 const h=vm.runInNewContext('(function(require,__dirname){'+prefix+'\nreturn {wp,find,txt,render:()=>w.render(wp),requests};})',{console,crypto:globalThis.crypto,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,setImmediate,structuredClone})(require,__dirname);
 h.wp.work={...h.wp.work,groupIds:[groupId],releaseDate:'2024-10-16',stage:{...h.wp.work.stage,publishedDate:'2024-10-17'}};return h;
}
for(const [groupId,heading]of [[ids.SAYMYNAME_GROUP_ID,'saymyname-work-heading'],[ids.XG_GROUP_ID,'expanded-work-heading']]){
 test(heading+' displays the active video date and never borrows the MV date for an unknown stage',()=>{
  const h=harness(groupId),text=()=>h.txt(h.find(h.render(),n=>n.props.className===heading));assert.match(text(),/2024-10-16/);assert.doesNotMatch(text(),/2024-10-17/);
  h.find(h.render(),n=>n.props.id==='stage-tab').props.onClick();assert.match(text(),/2024-10-17/);assert.doesNotMatch(text(),/2024-10-16/);
  h.wp.work={...h.wp.work,stage:{...h.wp.work.stage,publishedDate:''}};assert.doesNotMatch(text(),/2024-10-1[67]/);assert.match(text(),/舞台/);
  h.wp.work={...h.wp.work,stage:null};assert.doesNotMatch(text(),/2024-10-16/);
  h.find(h.render(),n=>n.props.id==='mv-tab').props.onClick();assert.match(text(),/2024-10-16/);assert.equal(h.requests.length,0);
 });
}
test('all repeated group headings consistently select the active source date',()=>{const s=fs.readFileSync('app/page.tsx','utf8');assert.doesNotMatch(s,/\[work.releaseDate,view==='stage'\?'舞台'/);assert.equal((s.match(/\[view==='stage'\?stage\?\.publishedDate:work.releaseDate,view==='stage'\?'舞台'/g)||[]).length,12);});
