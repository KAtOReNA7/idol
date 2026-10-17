# 唯一公开输入 schema v1

本轮 NewJeans 与 i-dle 的素材、构图、运行层和编译器共用此 schema。它是设计输入，不是生产资料迁移文件。完整原图保持原字节；没有私人评分、备注、观看状态、账户或凭证字段。没有事实支持的文字不写入页面。

唯一权威输入文件为 `newjeans-data.json`、`idle-data.json`；不另外复制 `*-input.json`，hashes、page/board与既有frame映射都回写同一份对应data。

```js
{
  schemaVersion: 1,
  slug: 'newjeans',             // 本轮另一个值为 idle
  group: 'NewJeans',            // 展示名；另一团为 i-dle
  groupId: 'recvxyEBDZ9qVl',    // idle 为 recvxyEBDZqkpg
  pageId: null, boardId: null,  // root 确认独立目标页后回写
  routeRoots: {},              // 可选 route→本页既有FRAME id，原地重构已存在草稿
  palette: {paper:'#......',ink:'#......',accent:'#......',muted:'#......',line:'#......',white:'#......'},
  fonts: {latin:'实际所选字体',sans:'实际所选字体',cjk:'实际所选中文字体'},
  navigation: [
    {label:'首页',semantic:'home'}, {label:'成员',semantic:'members'},
    {label:'作品',semantic:'library'}, {label:'时间轴',semantic:'timeline'}
  ],
  branding: {label:'NewJeans',logoKey:null,logoSvg:null,sourceUrl:null},
  hashes: {},                 // asset key → 已锚定 Figma image hash；由 root 导入后写入
  nativeMediaIds: [],          // 选定本轮原生详情/评分的明确MV与舞台id；其余已核影像可官方外链
  assets: [], members: [], releases: [], media: [], timeline: []
}
```

palette、fonts、navigation、branding 全部由各团研究与独立设计传入，不从旧团继承。可以增加具名色与字体 role；运行层不提供统一 header/footer/home 构图或营销文案。`pageId`、`boardId` 为空时可继续公开素材与代码工作，但不能执行 Native 构建。

## 素材

`assets[]`：`{key, originalPath, displayPath?, width, height, displayWidth?, displayHeight?, sourceUrl, sourcePhotoUrl?, alt?, memberId?, releaseId?, mediaId?}`。

- `key` 唯一，与 `hashes[key]`、实体 `imageKey` 完全相同；建议 hero、logo、member-稳定ID、cover-稳定ID、media-稳定ID，不按数组位置匹配。
- `originalPath` 相对 `newjeans-idle-design/`，指向完整原文件。`displayPath` 可选，指向与原图分开的 JPEG/PNG 显示派生图；不能覆盖 originalPath。width/height 为 originalPath 实测尺寸。
- `sourceUrl` 为真实公开来源页；`sourcePhotoUrl` 为实际原图 URL，未知则不造。需要写限制时放交付说明，不塞进页面审计文案。
- JPEG/PNG 可直接导入 Figma；WebP 必须另生成 JPEG/PNG 预览，仍完整交付 WebP 原文件。每个 createImage 在同一调用内建可见 asset-board RECT 填充持有 hash，避免跨调用 GC。
- 本轮Figma专用显示派生一律q85 JPEG（透明/团标保PNG），hero长边<=1600、成员<=900×1400、封面<=900、MV<=1280×720、舞台不超来源尺寸；原图与正式展示派生仍完整交付，不被这些传输图覆盖。明确的displayWidth/Height用于已审核裁切的比例；编译器保留它们。

## 成员

`members[]`：`{id,groupId,stageName,cn,existingRelation,profileListed,imageKey,sourceUrls}`。

- `id` **就是附件 memberId**，`cn` 就是 chineseDisplayName，stageName、groupId 与附件联合核对；不重新生成 id。保留成员稳定关系，`existingRelation` 原样为 groupIds 或 formerGroupIds。
- `profileListed` 仅表示本次公开官网资料页是否列出该人；NewJeans 4 人、i-dle 5 人。不能据此推断合约、离团日或完整当前活动阵容。页面用“官网资料”“历史档案”等自然栏目区分，构图由各团页面代码独立安排。
- 历史身份保留在 members 数组中，不删除。缺少可靠具名图时 imageKey 可暂为 null，不能生成占位/假肖像完成验收；需要呈现照片前补齐可靠历史来源。
- `sourceUrls` 为公开来源 URL 字符串数组。不要把人物出现在某时代合照推导成每条 MV/舞台个人出镜关系。

## 发行

`releases[]`：`{id,title,date,dateType,datePrecision,timeZone?,type,region?,version?,releaseFamilyId?,artistScope,artistCredit,imageKey,sourceUrl,sourceUrls?,tracks?}`。

- id 为稳定的公开发行身份，已有生产 ID 则沿用；新增研究项用本团命名空间清楚命名，不冒充生产 ID。
- date 为真实 YYYY-MM-DD；dateType 为 `release-date` 或 `announcement-date`，datePrecision 为 day/month/year（不是 day 的项目不可伪造完整日）。timeZone 仅有依据时填写，日期专属历法不能和 UTC 发布时间混用。
- artistScope 为 `group|collaboration|solo`，artistCredit 保留该版本/历史作品的真实艺人署名；i-dle 历史 (G)I-DLE 作品不强改历史署名。
- type 为自然发行类型；地区/版本与发行实体分开。tracks 可选 `{title,duration?}[]`，没有完整可靠曲目就不编。
- 多个实体版本保留各自id与version，并用releaseFamilyId组织同一发行；不能把三个版本冒称三张新专辑。成员个人页只通过artistScope=solo及明确artistCredit显示其真实个人发行，不从所属团体关系推个人参与。
- 未来计划与已发行不混淆；由 dateType 与来源事实决定呈现，不能根据目录里已有标题宣称发行完成。

## 影像

`media[]`：`{id,title,kind,imageKey,releaseId?,sourceUrl,sourceUrls?,platform?,date?,dateType?,datePrecision?,timeZone?,publishedAt?,artistScope?,artistCredit?}`。

- id 优先沿用附件 workId；kind 为 `mv|stage`，不能把 Performance Video、MV、音源发行无依据合并。已核成不同版本的影片必须不同 id。
- 已有53项最小映射未逐条核片和日期，不自动填入已核设计全集。只把确认的影片及真实图加入实际展示的 media。
- dateType 为 `video-publication-date|broadcast-date|performance-date`。publishedAt 若有精确时间用含 offset 的 ISO 字符串，date 需注明对应时区/本地日，不把 UTC 日直接当韩国/日本发布日期。
- 不含真实评分、个人出镜评级、观看状态。评分样板按 `[groupId,kind,id,'work']` 唯一身份；0 与 null 分开，0–10、步长0.1，只合成演示。

## 时间轴

`timeline[]`：`{id,title,date,dateType,datePrecision,timeZone?,kind,linkedId?,sourceUrls}`。

kind 为 `release|mv|stage|history`；只有来源明确的历史事实可用 history，不推演身份事件。linkedId 必须对应本输入的 releases/media ID；来源先于事件生成。dateType 沿用该事实含义。单条轴、只读、最早优先；同日用 id 稳定排序。不能从作品目录日期批量制造事件。

## 路由与代码边界

- route：`home:320`、`members:390`、`member:附件memberId:320`、`library:1440`、`release:稳定id:390`、`media:稳定workId:320`、`timeline:320`。
- score：`score:稳定mediaId:unrated:320`；十个有限状态为 unrated / zero / decimal / success / success-zero / success-unrated / failure / confirm-zero / confirm-decimal / confirm-failure。decimal、success、failure 为明确的8.5合成样例；zero完成进入success-zero并保留0.0，null完成进入success-unrated并保持未评分。失败演示仅从decimal进入且明写“查看8.5失败样例”。确认返回到同一个 media，不跨成员/作品。
- 独立页面根名称：`${group} · ${route}`，不使用共同 slash 分组前缀，以隔离 Figma 顶层页面的原型滚动分组；只在指定 page 内按 route 精确复用 root。运行层兼容旧 `${group} / ${route}` 并原地规范名称，不新建重复根。组件与真实图片锚仍使用本团 slash 工程名称，仅放该 page 的指定 board。
- 旧草稿名称不符合该格式时，root 可用 routeRoots 指定待原地重构的本页 frame；运行层核验归属后规范名称、清其旧子节点，不沿用旧布局/文案，也不生成旧版归档。
- 页面构图源码各自独立；共享运行层只提供 stack/text/image/button/paint/root/bind/finish 等机械功能。所有页面由 root 单写手执行 Figma。
- 导航动作使用 resetScrollPosition:true；同顶层 frame 自链接为只读跳过。Figma 的返回与滚动行为以实际点击证据为准；真实位置/焦点恢复由 dot 接入参考控制器，不冒称在 Figma 全位置恢复。
- `U.bind(node,{back:true})` / `U.button(...,{back:true})` 为互斥于route/url的通用“返回上一页”，仅发 `{type:'BACK'}`。本轮只在个人页额外使用；明确“成员目录”入口仍为NODE，评分多层退出仍为精确媒体NODE。BACK是否恢复历史滚动由root实际点击验证，运行层不预先声称恢复焦点或完整位置。
- 工具调用 code ≤50,000 UTF-16单位，图片传输块≤38,000字符；结果≤20KB且保留全部 affected IDs，过大则拆批，不静默删 ID。

## 本地机械工具

`python3 build-native.py --group newjeans --kind home --width all`：仅生成 `native-calls/` 调用源码及语法回执，不执行Figma。kind同路由；实体可传`--ids`稳定ID逗号串/all；media/score默认nativeMediaIds；score用`--states`十态逗号串/all。默认home/members/library/timeline三宽，其他390。只拼机械runtime及本团唯一页面源码的公共helpers+选中kind分支，剔除传输不需要的原图路径/原图URL/SVG重复串，不改原data。

`python3 prepare-imports.py --group idle --keys used --estimate`：只估算；去掉estimate才生成该团`native-imports/<slug>/manifest.json`与调用脚本。keys可为used/all/指定逗号串；同显示bytes合并aliases。root按manifest.jobs顺序执行，真实返回images[].aliases中的每个key都回填同一hash。小图合并，38K大图块的最后一块与commit同调用；createImage先被本团素材板可见RECT持有，再删除临时TEXT，不使用pluginData/clientStorage或隐藏归档。已开始执行的manifest冻结，不能边运行边重生成脚本。

机械运行层header/footer为空实现，各团独立页面负责实际构图。额外svg/track/api仅为本团向量和节点追踪，均受本页边界约束。Figma legacy.action/resetVideoPosition等额外字段不导致重复重写相同reaction。
