'use strict';
// Optional real React fixture builder. Uses host dependencies; never installs or fetches.
const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');
const target = path.resolve(process.argv[2] || '.timeline-preview');
fs.mkdirSync(target, { recursive: true });
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'fixtures/timeline/preview.tsx')], bundle: true,
  outfile: path.join(target, 'preview.js'), platform: 'browser', format: 'iife', jsx: 'automatic',
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [],
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning' });
fs.writeFileSync(path.join(target, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>时间轴独立合成验证</title><link rel="stylesheet" href="preview.css"><style>body{margin:0;background:#f4f5f7;color:#182331;font-family:system-ui,sans-serif}button{min-height:44px;margin:3px}main{box-sizing:border-box}h1{font-size:24px}</style><div id="root"></div><script src="preview.js"></script></html>');
console.log(target);
