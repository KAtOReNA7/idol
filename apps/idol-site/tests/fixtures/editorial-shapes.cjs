const path = require('node:path');
const shapes = require('./editorial-shapes.json');
const root = path.resolve(__dirname,'../..');

// Only substitute recorded imports at their reviewed call site. New imports still
// reach the original metafile guard and fail if a real data file entered a fixture.
function fixtureForImport(specifier, importer) {
 const actual = specifier.startsWith('@/')
   ? path.join(root, specifier.slice(2))
   : path.resolve(path.dirname(importer), specifier);
 const name = path.relative(path.join(root, 'data'), actual).split(path.sep).join('/');
 const from = path.relative(root, importer).split(path.sep).join('/');
 const contract = shapes[name];
 if (contract?.from.includes(from)) return {name, data: contract.fixture};
}

function syntheticEditorial() {
 return {name:'synthetic-editorial-data',setup(build){
  build.onResolve({filter:/\.json$/}, args=>{
   const fixture = fixtureForImport(args.path, args.importer);
   if (fixture) return {namespace:'editorial-fixture',path:fixture.name,pluginData:fixture.data};
  });
  build.onLoad({filter:/.*/,namespace:'editorial-fixture'}, args=>({contents:JSON.stringify(args.pluginData),loader:'json'}));
 }};
}
module.exports={syntheticEditorial, fixtureForImport};
