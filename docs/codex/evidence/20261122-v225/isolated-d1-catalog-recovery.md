# 五个目录入口的隔离 D1 断线对照

同一台 Windows 主机使用 Node 24.16.0、Miniflare、workerd 和临时 D1，从 HTTP 进入真实 `/api/catalog`。两次分别加载 v224 `05e8060b`、v225 `9a82573d` 的路由代码。作品及团体使用既有公开 ID，库内只放合成记录。目录首次读取版本号时注入 `D1_ERROR`，其底层错误为 `Network connection lost.`，后续语句交给隔离 D1 执行。

| 首次读中断的入口 | v224 | v225 | v225 响应的 Server-Timing |
| --- | --- | --- | --- |
| IZ*ONE《Panorama》 | 502 | 200，作品 ID 正确 | `catalog-retry` |
| fromis_9《Vitamin ME》 | 502 | 200，作品 ID 正确 | `catalog-retry` |
| ILLIT 首页 | 502 | 200，团体 ID 正确 | `catalog-retry` |
| aespa 首页 | 502 | 200，团体 ID 正确 | `catalog-retry` |
| STAYC 首页 | 502 | 200，团体 ID 正确 | `catalog-retry` |

相同五次首读中断，获得正确内容从 0/5 到 5/5。健康作品读取两版均返回 200，响应均无恢复标记。连续中断在 v225 恰好执行两次失败读取，最后保留 `502 REQUEST_FAILED`。显式刷新遇到相同中断只读取一次。v225 输出 5 条 `recovered` 和 1 条 `failed` 恢复事件。线上实际补读次数由正式站另行统计。

## 复跑

在正式工程 `apps/idol-site/` 下执行以下 PowerShell。它使用仓库已有隔离测试的建库和认证夹具，分别运行两个已提交版本。

```powershell
$evidence = Get-Content -Raw -Encoding utf8 -LiteralPath '../../docs/codex/evidence/20261122-v225/isolated-d1-catalog-recovery.md'
$probe = [regex]::Match($evidence, '(?ms)^```javascript\r?\n(.*?)\r?\n```').Groups[1].Value
foreach ($version in 'v224','v225') {
  $probe | node - $version
  if ($LASTEXITCODE -ne 0) { throw "隔离 D1 测试失败 $version" }
}
```

<details>
<summary>隔离 D1 测试代码</summary>

```javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const {execFileSync} = require('node:child_process');

const version = process.argv[2];
const revisions = {v224:'05e8060b', v225:'9a82573d'};
assert.ok(Object.hasOwn(revisions, version));
const fixture = path.resolve('tests/work-detail-d1.test.cjs');
const route = 'apps/idol-site/app/api/catalog/route.ts';
const entry = new Module(fixture, module);
entry.filename = fixture;
entry.paths = Module._nodeModulePaths(path.dirname(fixture));
entry.probeRoute = execFileSync('git', ['show', revisions[version]+':'+route], {encoding:'utf8'});

// Extend only the local fixture's Worker. All statements after the injected
// disconnect use the live Miniflare D1 binding and the normal route.
async function inject(request, db, withEnv, readCatalog) {
  let remaining = Number(request.headers.get('X-Probe-Faults'));
  let checks = 0;
  const tracked = {prepare(sql) {
    const stmt = db.prepare(sql);
    if (!sql.includes('AS catalog_generation')) return stmt;
    return {async first() {
      checks++;
      if (remaining-- > 0) throw new Error('D1_ERROR', {cause:new Error('Network connection lost.')});
      return stmt.first();
    }};
  }};
  const result = await withEnv({DB:tracked}, () => readCatalog(request));
  result.headers.set('X-Probe-Generation-Checks', String(checks));
  return result;
}

async function measure(before) {
  const works = ['recvxyH5pzBdad','recvxyOz5XaZIt'];
  for (const id of works) await seed('works',id,{
    [F.works.groups]:['recGroup'],[F.works.song]:'Synthetic film',[F.works.url]:'https://youtu.be/abcdefghijk'
  });
  const groups = {illit:'rec28ldfRTiBON',aespa:'recvxyEBDZxfeD',stayc:'recvxyEBDZ2V3c'};
  for (const [name,id] of Object.entries(groups)) await seed('groups',id,{[F.groups.name]:'Synthetic '+name});
  async function sample(label, work, artist, faults, refresh=false) {
    const url = new URL('/api/catalog?shape=display-v1',await runtime.ready);
    if (artist) url.searchParams.set('artist',artist);
    if (refresh) url.searchParams.set('refresh','1');
    const response = await fetch(url,{headers:{Prefer:'omit-stage-candidates'+(work?', work-detail='+work:''),
      'X-Probe-Faults':String(faults)}});
    const data = await response.json();
    const ok = faults===0 || (!before && faults===1 && !refresh);
    assert.equal(response.status,ok?200:502);
    const marker = response.headers.get('Server-Timing');
    assert.equal(marker,ok && faults===1?'catalog-retry':null);
    if (ok) assert.deepEqual(data.scope,work?{type:'work',workId:work}:{type:'artist',groupId:groups[artist]});
    else assert.equal(data.error,'REQUEST_FAILED');
    const checks = Number(response.headers.get('X-Probe-Generation-Checks'));
    if (!ok) assert.equal(checks,!before && faults===2?2:1);
    console.log(JSON.stringify({label,status:response.status,scope:data.scope?.type??null,marker,checks}));
  }
  for (const [index,id] of works.entries()) await sample(['Panorama','Vitamin ME'][index],id,null,1);
  for (const artist of Object.keys(groups)) await sample(artist,null,artist,1);
  await sample('healthy',works[0],null,0);
  await sample('continuous disconnect',works[0],null,2);
  await sample('explicit refresh',null,'aespa',1,true);
}

let program = fs.readFileSync(fixture,'utf8').split(/^test\(/m)[0];
const plugin = '      build.onResolve(';
const routeRead = "          if (url.pathname === '/api/catalog' && request.method === 'GET') {";
assert.ok(program.includes(plugin) && program.includes(routeRead));
program = program.replace(plugin,
  "      build.onLoad({filter:/[\\\\/]app[\\\\/]api[\\\\/]catalog[\\\\/]route\\.ts$/},args=>({contents:module.probeRoute,loader:'ts',resolveDir:path.dirname(args.path)}));\n"+plugin);
program = program.replace(routeRead,routeRead+"\n            if(request.headers.has('X-Probe-Faults'))return ("+
  inject.toString()+")(request,env.DB,withEnv,readCatalog);");
program += '\ntest("isolated D1 catalog recovery",()=>('+measure.toString()+')('+(version==='v224')+'));';
entry._compile(program,fixture);
```

</details>
