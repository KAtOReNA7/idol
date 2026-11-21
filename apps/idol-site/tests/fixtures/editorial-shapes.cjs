const path = require('node:path');
const shapes = require('./editorial-shapes.json');
const root = path.resolve(__dirname,'../..');

// Only substitute recorded imports at their reviewed call site. New imports still
// reach the original metafile guard and fail if a real data file entered a fixture.
function syntheticEditorial() {
 return {name:'synthetic-editorial-data',setup(build){
  build.onResolve({filter:/\.json$/}, args=>{
   const actual = args.path.startsWith('@/') ? path.join(root,args.path.slice(2)) : path.resolve(args.resolveDir,args.path);
   const name = path.relative(path.join(root,'data'),actual).split(path.sep).join('/');
   const from = path.relative(root,args.importer).split(path.sep).join('/');
   const contract = shapes[name];
   if (!contract?.from.includes(from)) return;
   return {namespace:'editorial-fixture',path:name,pluginData:contract.fixture};
  });
  build.onLoad({filter:/.*/,namespace:'editorial-fixture'}, args=>({contents:JSON.stringify(args.pluginData),loader:'json'}));
 }};
}
module.exports={syntheticEditorial};
