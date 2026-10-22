const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const React=require('react'),{renderToString}=require('react-dom/server'),{build}=require('esbuild');
test('real App SSR keeps the nonempty private loading shell without starting any group import or read',async()=>{
 const result=await build({entryPoints:['app/page.tsx'],bundle:true,platform:'node',format:'cjs',write:false,packages:'external',jsx:'automatic',plugins:[{name:'css-only-test-loader',setup(b){b.onResolve({filter:/\.css(?:\?url)?$/},args=>({path:args.path,namespace:'test-css'}));b.onLoad({filter:/.*/,namespace:'test-css'},()=>({contents:'export default undefined',loader:'js'}));}}]});
 const module={exports:{}};let reads=0;
 vm.runInNewContext('(function(require,module,exports){'+result.outputFiles[0].text+'})',{console,URL,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch:()=>{reads++;throw Error('SSR must not read catalog or modules');}})(require,module,module.exports);
 for(let i=0;i<2;i++){
  const html=renderToString(React.createElement(module.exports.default));
  assert.match(html,/正在打开你的私人放映室/);assert.match(html,/<main>/);assert.match(html,/主导航/);assert.match(html,/团体索引/);
  assert.doesNotMatch(html,/data-module-status|group-index-card|MV 分数/);
 }
 assert.equal(reads,0);
});
