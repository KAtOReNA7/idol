# 女团项目安全源码交接包

Base SHA: 3f316e72f9c0ae88707bdc23bb65fa983737867c

这是长期工程协作的可构建源码副本，首个完整交付目标为全 51 团大事时间轴。唯一 schema 是 HANDOFF/timeline-event.schema.json。技术任务见同目录 Sol_全51团大事时间轴_技术执行要求.txt。公共资料、51 团路由和产品源码保留；该包不能直接覆盖生产。

## 安全边界
- data/snapshot.json、data/backup.ts、data/snapshot-import.json 全部是新生成的纯合成演示数据，未复制真实用户的评分、备注、观看状态或附件信息。51 个公开团体路由 ID 保留，成员、作品、关系均使用 recHandoff 合成 ID。
- 本 GitHub 文本版明确省略所有二进制图片和字体。既有图片错误处理显示缺图占位；字体使用现有 CSS 后备字体。没有恢复、重编码或上传二进制原件。这只是可构建开发副本，不可覆盖生产素材或样式。省略路径与 hash 见 TEXT_TREE_OMISSIONS.json。
- 不含 .git、.env、凭证、运行导出、依赖、dist、缓存或私人快照。hosting project、飞书 base/table 标识为沙盒占位，不得连生产或创建新凭证。
- 公开 metadata 中的音乐节目分数、来源注释不等于用户个人评分；测试 fixtures 的评分/备注均为合成样例。

## 文件责任与禁止范围
- Sol 负责 artist 专页组件、全团 timeline 共用组件/helper/schema 校验与合成测试；保持现有团体风格与默认关系。
- dot 当前独占个人记录检索：禁止 Sol 修改 app/page.tsx、lib/idol/journey.ts、components/use-browse-journey.ts，以及个人记录数据接口（app/api 下的个人/目录/评分/备注/观看/保存接口及对应 lib/idol/catalog、save、native-save、native-reader、live、feishu 等数据读写层）。
- 时间轴导航应使用 artist 专页导航/历史返回机制，不改上述全局 journey。若时间轴确实需要这些文件或以上接口改动，先在报告中说明必要性和精确文件/最小改动，交 dot 决定，不能自行修改。
- Astra 独占 data/artist-timelines 的真实事件数据与来源证据。Sol 只读集成；仅在 tests/fixtures/timeline 下创建合成时间轴数据。禁止把示例文件误当真实增量上线。
- 不改用户评分、备注、观看、照片来源绑定、历史成员关系，不扩大分享，不部署、不推送、不向生产或第三方上传，不新增权限或凭证。

## 安装、运行、验证
建议 Node >=22.13。首次运行 npm ci（或项目既有 npm run install:ci），随后 npm run dev。无需任何账号/生产凭证，运行时使用合成只读 snapshot。使用页面展示的本地地址。

node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
node HANDOFF/run-safe-tests.mjs
node HANDOFF/smoke-fixture.cjs

实际验证结果见 VALIDATION.json 和 TEST_SCOPE.md。原始全套中依赖真实快照或图片字节的测试不能在这个包上作为生产验收；不得因此放宽产品安全校验。

## 回传要求
1. 在你自己的解包目录建立本地 Git 基线，完整记录交接输入，再只提交本次功能修改；不要把 .git 归档发送。
2. 回传相对该安全基线的 unified patch（包含新增的源码/合成测试），另附改动文件清单、运行命令/结果、已知限制与截图。声明 base SHA 为上述生产基线并给出输入压缩包 SHA-256。
3. 禁止回传任何 data/snapshot.json、data/backup.ts、data/snapshot-import.json、public 占位图、.openai/hosting.json、沙盒 identifier 替换、HANDOFF 验证清单本身、node_modules、dist、.env 或凭证改动。尤其不能发送整个安全副本要求覆盖生产。
4. data/*artist.json 等公开事实与来源默认只读，不用编码方便为由改日期、关系或制造事件；实际时间轴事实由 Astra 提供。
5. 若需修改一个被沙盒替换的源码文件，应只回传功能 hunks，并明确说明沙盒标识须由 dot 保留生产原值；不得夹带替换。
6. dot 审核后在真实主线上应用、全套测试、图片/历史关系检查和发布。Sol 不自行部署。

## 交付与接续节奏
用户亲自发送本任务指令后，可将本任务的最小 patch、合成 fixture 源码、报告和必要截图组成 ZIP，保存到当前会话资料库，并返回真实文件 ID/附件。这里的“不上传”是禁止向生产或第三方上传，不禁止上述明确授权的当前会话交付；工具若另需批准，仍须遵守，不猜造文件 ID，也不要求绕过审批。

白天由 Astra、Sol、dot 按文件责任并行推进；北京时间凌晨由 dot 独立接续其已获授权的部分。Sol 每次完成或暂停时，必须交可复现检查点：输入 base/hash、最小 patch、精确命令与结果、已完成和未完成模块、阻塞点及下一步。不得静默交出半成品或同时占用同一共享文件。该协作节奏不授权任何新定时任务，不新增提醒/自动化。

## GitHub 文本版说明（优先于旧 ZIP 的素材说明）
本目录是原安全 ZIP 的正常 UTF-8 源码树，不是 ZIP/base64 转码。原 ZIP SHA-256 为 870dc6a1f0412b7ec8af663a0b6dcc9ce150dc211cdb18f1537e5ea10db6d318，仍在同一 handoff 目录单独保留。
无需二进制字体/图片即可安装、类型检查和 build：字体仅通过绝对 CSS URL 引用，失败时用既有 fallback；图片通过 URL 引用，加载失败时走已有缺图 UI。它们不是 JS import，也不是功能代码缺失。不得为预览补回生产资产、权限或密钥。真实字体/照片视觉验收由 dot 在生产资产环境完成。
大体积非运行舞台研究历史及旧发布审计省略；仅保留现有适用测试直接读取的两项公共证据。当前文件/hash 以 HANDOFF/TEXT_TREE_MANIFEST.json 为准，省略项以 HANDOFF/TEXT_TREE_OMISSIONS.json 为准。不能直接覆盖生产或将省略文件当作删除补丁回传。只回传相对本安全目录初始内容的最小功能变更。
