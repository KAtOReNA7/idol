'use strict';
// Builds a localhost-only real React host fixture, with no dependency installation.
const path=require('node:path');
const fs=require('node:fs');
const {buildFixture}=require('./fixtures/timeline-host/build.cjs');
async function main(){
 const target=path.resolve(process.argv[2]||'.timeline-host-preview');
 fs.mkdirSync(target,{recursive:true});
 await buildFixture({entry:'preview.tsx',output:path.join(target,'preview.js'),platform:'browser'});
 fs.writeFileSync(path.join(target,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>时间轴真实宿主合成验证</title><link rel="stylesheet" href="/preview.css"><style>body{margin:0;background:#f5f6f8;color:#182331;font-family:system-ui,sans-serif}button,select{min-height:44px}main{max-width:960px;margin:auto;padding:12px;box-sizing:border-box}.fixture-tools{display:flex;flex-wrap:wrap;gap:8px}.fixture-state{padding:12px;background:#e7edf4;overflow-wrap:anywhere}label{display:inline-flex;align-items:center;gap:5px;margin:5px}dialog{max-width:80vw}.fixture-logs{white-space:pre-wrap;overflow-wrap:anywhere}</style><div id="root"></div><script src="/preview.js"></script></html>');
 console.log(target);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
