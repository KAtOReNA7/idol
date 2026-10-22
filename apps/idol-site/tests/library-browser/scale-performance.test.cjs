const test=require('node:test'),assert=require('node:assert/strict'),os=require('node:os'),fs=require('node:fs'),path=require('node:path');
const {fixture,defaults,load,SEED}=require('./scale-fixture.cjs');
const {buildLibraryModel}=load('lib/idol/library-browser/query-model.ts');
const {indexWorkNames,matchingWorks,sortWorks}=load('lib/idol/watch-sequence.ts');
const {stageMatches}=load('lib/idol/stage-display.ts');
const queues=['all','high','surprise','tonight','unrated','rewatch'],stages=['all','ready','alternative','pending'];
const summary=values=>{const a=[...values].sort((a,b)=>a-b);return {samplesMs:values,medianMs:a[Math.floor(a.length/2)],p95Ms:a[Math.ceil(a.length*.95)-1]};};
const report={kind:'SYNTHETIC client-loaded pure model benchmark',seed:SEED,node:process.version,platform:process.platform,cpu:os.cpus()[0]?.model,build:'esbuild CommonJS, no minification; Node execution, not browser production',method:'Frozen fixture construction excluded. Parity before timing. One first measured sample after parity (not a process-cold measurement), then one untimed warm-up and seven warm samples. Existing oracle baseline includes all six queue and four stage facets. p95 is descriptive for small samples. No browser performance inference.',sizes:[]};
for(const size of [100,1000,5000])test(`SYNTHETIC ${size}: full order/facets parity, page bounds and raw performance`,()=>{
 const data=fixture(size);assert.ok(Object.isFrozen(data)&&Object.isFrozen(data.works)&&Object.isFrozen(data.works[1]));
 const baseline=f=>{const index=indexWorkNames(data.works,data.groups),scope=matchingWorks(index,f);return {ids:sortWorks(scope.filter(w=>stageMatches(w,f.stageFilter)),f.sort).map(w=>w.id),queue:Object.fromEntries(queues.map(queue=>[queue,matchingWorks(index,{...f,queue}).filter(w=>stageMatches(w,f.stageFilter)).length])),stage:Object.fromEntries(stages.map(stage=>[stage,scope.filter(w=>stageMatches(w,stage)).length]))};};
 for(let i=0;i<48;i++){const f={...defaults(),queue:queues[i%6],watch:['all','watched','unwatched','unmarked'][Math.floor(i/6)%4],stageFilter:stages[Math.floor(i/3)%4],sort:['default','release-desc','release-asc','score-desc'][Math.floor(i/2)%4],search:i%5===0?'song':i%7===0?'Japanese':'',group:i%11===0?'recG1':'all',generation:i%13===0?'第五代':'all'};const expected=baseline(f),actual=buildLibraryModel(data,f,1000,i%2?24:48);assert.deepEqual(actual.orderedIds,expected.ids);assert.deepEqual(actual.facetCounts,{queue:expected.queue,stage:expected.stage});assert.ok(actual.rows.length<=48);}
 const f={...defaults(),sort:'release-desc'};const measure=fn=>{const start=performance.now();fn();return performance.now()-start;};
 const firstMeasuredAfterParityMs=measure(()=>buildLibraryModel(data,f,1,24));buildLibraryModel(data,f,1,24);baseline(f);
 const model=[],oracle=[];for(let i=0;i<7;i++){model.push(measure(()=>buildLibraryModel(data,f,Math.ceil(size/24),24)));oracle.push(measure(()=>baseline(f)));}
 const initial=buildLibraryModel(data,f,1,24),deep=buildLibraryModel(data,f,1000,48);report.sizes.push({size,parityCases:48,firstMeasuredAfterParityMs,model:summary(model),existingOracle:summary(oracle),initialRows:initial.rows.length,deepPageRows:deep.rows.length});
 console.log('MODEL_PERFORMANCE '+JSON.stringify(report.sizes.at(-1)));
});
test.after(()=>{if(process.env.LIBRARY_MODEL_PERFORMANCE_OUT){const dest=path.resolve(process.env.LIBRARY_MODEL_PERFORMANCE_OUT);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');}});
