const Module = require('node:module');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {buildSync} = require('esbuild');
const {parse} = require('next/dist/compiled/node-html-parser');

const compiledEntries = new Map();
function releaseComponent(entryPoint) {
  if (compiledEntries.has(entryPoint)) return compiledEntries.get(entryPoint);
  const build = buildSync({
    entryPoints:[entryPoint], bundle:true, write:false,
    platform:'node', format:'cjs', jsx:'automatic', external:['react','react/*','next/navigation'],
    loader:{'.css':'empty'}, logLevel:'silent',
  });
  const compiled = new Module(__filename);
  compiled.require = require;
  compiled._compile(build.outputFiles[0].text, __filename);
  compiledEntries.set(entryPoint, compiled.exports.default);
  return compiled.exports.default;
}

module.exports = function renderRelease(entryPoint) {
  return parse(renderToStaticMarkup(React.createElement(releaseComponent(entryPoint))));
};

module.exports.withQuery = async function renderReleaseWithQuery(entryPoint, query) {
  const page = await releaseComponent(entryPoint)({searchParams: Promise.resolve(query)});
  return parse(renderToStaticMarkup(page));
};
