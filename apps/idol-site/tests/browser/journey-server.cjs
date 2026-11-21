// Run from apps/idol-site alongside a local production preview. Open the printed URL in Codex.
// Only the anonymous GET surface of the loopback Worker is exposed. No browser is launched.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {buildSync} = require('esbuild');
const Module = require('node:module');
const registry = require('../../data/artist-timeline-registry.json');
const snapshot = require('../../data/snapshot.json');
const root = path.resolve(__dirname, '../..');
const port = Number(process.argv[2] || 8873);
const workerPort = Number(process.argv[3] || 8872);
if (![port,workerPort].every(n => Number.isInteger(n) && n > 0 && n < 65536) || port === workerPort) throw Error('Use two distinct loopback ports.');
const origin = 'http://127.0.0.1:' + port;
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'idol-journeys-'));
const built = buildSync({stdin:{contents:[
  "export {projectCatalog} from './lib/idol/catalog'",
  "export {projectBrowserCatalog} from './lib/idol/browser-catalog'",
  "export {projectArtistCatalog} from './lib/idol/artist-catalog'",
  "export {projectPublicCatalog} from './lib/idol/public-catalog'",
].join('\n'),resolveDir:root}, platform:'node',format:'cjs',bundle:true,write:false,
  external:['cloudflare:workers','server-only'],logLevel:'silent'});
const mod = new Module(__filename);
mod.require = key => key === 'cloudflare:workers' ? {env:{}} : key === 'server-only' ? {} : require(key);
mod._compile(built.outputFiles[0].text, __filename);
const api = mod.exports;
const data = api.projectCatalog(snapshot.tables,'live',snapshot.capturedAt);
// Only identities and public content are needed to navigate. Do not serve personal observations.
for (const row of [...data.groups,...data.members,...data.works,...data.ratings]) {
  for (const field of ['note','memory','watched']) if (field in row) row[field]='';
  for (const field of ['score','stageScore','stylingScore','average']) if (field in row) row[field]=null;
  if ('favorite' in row) row.favorite=false;
  if ('ratedCount' in row) row.ratedCount=0;
}
data.counts.ratedWorks=0;
data.counts.scoreSum=0;
const payloads = new Map();
const rows = [];
const progress = new Map();
function catalog(slug) {
  if (!payloads.has(slug)) {
    const scoped = slug ? api.projectArtistCatalog(data,registry.find(g=>g.slug===slug).groupId) : data;
    payloads.set(slug, JSON.stringify(api.projectPublicCatalog(api.projectBrowserCatalog(scoped))));
  }
  return payloads.get(slug);
}
function inventory(libraryOnly) {
  const helpers = libraryOnly ? null : require('../fixtures/artist-journey-routes.cjs');
  return registry.map(g=>({...g, routes:helpers?[...helpers.artistJourneys(g.slug),...helpers.nativeMemberJourneys(g.slug)]:[],
    members:data.members.filter(m=>[...m.groupIds,...(m.formerGroupIds||[])].includes(g.groupId)).map(m=>m.id),
    works:data.works.filter(w=>w.groupIds.includes(g.groupId)).map(w=>({id:w.id,title:w.song||w.name,mv:!!w.url&&!w.placeholder,stage:!!w.stage}))}));
}
const server = http.createServer(async (req,res)=>{
  try {
    if(req.headers.host !== '127.0.0.1:'+port) { res.writeHead(403).end(); return; }
    const url = new URL(req.url, origin);
    const send = (type,body) => {res.setHeader('Content-Type',type);res.end(body);};
    if(url.pathname==='/__qa/report' && req.method==='POST' && req.headers.origin===origin) {
      let bytes=0,body='';
      for await(const part of req) {bytes+=part.length;if(bytes>1048576) throw Error('oversized receipt');body+=part;}
      const items=JSON.parse(body);
      if(!Array.isArray(items)||items.length>1024) throw Error('invalid batch');
      for(const row of items) {
        if(!registry.some(g=>g.slug===row.slug) || typeof row.kind!=='string' || typeof row.ok!=='boolean') throw Error('invalid row');
        rows.push(row);progress.set(row.slug,row.kind);
      }
      fs.appendFileSync(path.join(output,'rows.ndjson'),items.map(r=>JSON.stringify(r)+'\n').join(''));
      return send('text/plain','OK');
    }
    if(req.method!=='GET') {res.writeHead(405).end();return;}
    if(url.pathname==='/__qa/') return send('text/html; charset=utf-8',fs.readFileSync(path.join(__dirname,'journeys.html')));
    if(url.pathname==='/__qa/runner.js') return send('text/javascript; charset=utf-8',fs.readFileSync(path.join(__dirname,'journeys.js')));
    if(url.pathname==='/__qa/inventory') return send('application/json',JSON.stringify(inventory(url.searchParams.get('mode')==='library')));
    if(url.pathname==='/__qa/progress') return send('application/json',JSON.stringify({rows:rows.length,failed:rows.filter(r=>!r.ok).length,latest:Object.fromEntries(progress)}));
    if(url.pathname==='/api/catalog') {
      const slug=url.searchParams.get('artist')||'';
      if(slug&&!registry.some(g=>g.slug===slug)) {res.writeHead(404).end();return;}
      return send('application/json; charset=utf-8',catalog(slug));
    }
    const proxy=http.request({hostname:'127.0.0.1',port:workerPort,path:url.pathname+url.search,method:'GET',headers:{accept:req.headers.accept||'*/*'}},upstream=>{
      res.statusCode=upstream.statusCode;
      for(const key of ['content-type','content-encoding','cache-control','content-length']) if(upstream.headers[key])res.setHeader(key,upstream.headers[key]);
      // No third-party player, asset or telemetry requests during the full catalogue walk.
      res.setHeader('Content-Security-Policy',"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'; form-action 'none'");
      upstream.pipe(res);
    });
    proxy.on('error',()=>res.writeHead(502).end());proxy.end();
  }catch(error){if(!res.headersSent)res.writeHead(500);res.end(String(error.message));}
});
server.listen(port,'127.0.0.1',()=>console.log(origin+'/__qa/\n'+output));
