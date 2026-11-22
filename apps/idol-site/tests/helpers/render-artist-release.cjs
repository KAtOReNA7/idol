const Module = require('node:module');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {buildSync} = require('esbuild');
const {parse} = require('next/dist/compiled/node-html-parser');

module.exports = function renderRelease(entryPoint) {
  const build = buildSync({
    entryPoints:[entryPoint], bundle:true, write:false,
    platform:'node', format:'cjs', jsx:'automatic', external:['react','react/*','next/navigation'],
    loader:{'.css':'empty'}, logLevel:'silent',
  });
  const compiled = new Module(__filename);
  compiled.require = require;
  compiled._compile(build.outputFiles[0].text, __filename);
  return parse(renderToStaticMarkup(React.createElement(compiled.exports.default)));
};
