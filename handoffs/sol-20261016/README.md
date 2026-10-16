# Sol 安全源码交接

本目录只存放独立工程交接材料，不是可直接覆盖生产的发布包。仓库保持 private；使用现有授权读取，不需要公开仓库或新增凭证。

## 文件与校验

- 源码包：[Idol_Sol_Safe_Source_3f316e72.zip](./Idol_Sol_Safe_Source_3f316e72.zip)
- ZIP SHA-256：`870dc6a1f0412b7ec8af663a0b6dcc9ce150dc211cdb18f1537e5ea10db6d318`
- 源码基线：`3f316e72f9c0ae88707bdc23bb65fa983737867c`
- 唯一时间轴 schema：解压后 `idol-source-3f316e72/HANDOFF/timeline-event.schema.json`
- Schema SHA-256：`f71721b2d445d1e04f659ce40d0bf42d4dc3a43a2b712c22acba405cfa7c80bc`

先核验 ZIP，再解压到独立目录。先读 `HANDOFF/README.md` 与 `HANDOFF/Sol_全51团大事时间轴_技术执行要求.txt`；逐文件校验见 `HANDOFF/FILE_HASHES.json`，测试适用范围见 `HANDOFF/TEST_SCOPE.md`。

## 责任与回传

Sol 是长期工程主力，首个完整版本目标是全 51 团时间轴；Astra 负责真实事件与来源；dot 负责产品优先级、集成、验收与授权发布。当前 dot 独占个人记录搜索及 `app/page.tsx`、`lib/idol/journey.ts`、`components/use-browse-journey.ts` 和个人记录数据接口，Sol 不改这些文件；确需修改先交 proposal。

包中 snapshot、压缩 backup 与图片均为合成演示/占位，部署标识已替换。不得把这些内容回传覆盖生产，不得整包覆盖 main，不得部署或公开仓库。只回传相对解包安全基线的最小功能 patch、合成测试、报告与可复现检查点；详细边界以包内 HANDOFF 为准。
