# 多平台视频准入与当前进度发布（2026-10-29）

基线PR47 `0a27db8feffb79233c8dc2d0f7bd0b46559b2220`，本轮开工干净，五远端分支已fetch，PR47远端一致且draft/open/unmerged。正式v201源`374ebe6de70a2e51641361740dde68246aed8b1c`，public/revision2；原生epoch6、原快照、done206。本轮先完成来源扩展，后获用户明确正式发布授权。

允许B站及非官方转载，保留内容版本、完整性、阵容及场合要求。实现Bili的BV/CID/P键、保存及导入保护、精确外链、来源文案；旧497条源对象不迁移。六项新路线查BEEP日版、SHOW DOWN、KISS N TELL、LUMINOUS、Teddy Bear日版、NOT ME，可采用0，研究记录见 `../evidence/20261029-multiplatform/research-*.json`。不再因非官方排除；缺精确媒体身份、完整播放或有阵容疑点的仍保留。用户不会确认BEEP准确首尾，不重复询问。

验证、发布包、GitHub和正式站回执将在本文件及该证据目录补全。没有私人写入，不把候选发现记为缺口关闭。

最终单次148项/19文件全部通过；TypeScript与Sites正式checkout构建通过。对照旧497对象、BV/CID/P身份、跨平台择源、未知赞、新鲜导出、空分/日志、真实native保存函数的合成SQL、owner拒绝、幂等重试和SSR。core:148的旧“整理时间”断言在HEAD同样失败，当前数据没有变化；未以改数据或放宽历史SHA掩盖。无真实私人保存或新增浏览器排版验收。

## 实际GitHub与正式发布

实现d95f3ca45c98b970ac29622351eec71254f7160b已推送PR47并API读回。Sites源58dae62aea7df71b599e989452f8f682f247ea15，v202保存成功并于2026-10-29T10:54:51.449087Z部署succeeded（appgdep_6ae325ed5c108191aff9d92bb62a088f）。本次授权从“暂不部署”变为“当前全部进度发布”；没有创建第二个正式站或更改受众。

包1,427文件逐字节匹配构建，65应用增量与GitHub相同，30既有源码差异保留，229保护源码不变。43个本机可见远端投递副本和10受限副本按既有规则从生成包排除，原件保留；累计远端规则5,418项。新电脑checkout行尾在构建时触发原件检查，最终用逐文件Git blob对齐恢复精确字节并重新完整构建，随后保护检查通过；未改变原件或哈希门槛。源仓库短期凭证到期后正常续期，未落盘或入仓。

发布后访问public/revision2/1owner/0external/0groups，原生epoch6/原快照/done206保持；私人写入0。一次IAB新页打开超时，原生打开工具返回queued，画面验收保留未完成；匿名命令行catalog GET为403，未尝试绕过。所有发布字段以release-publication.json及release-package-verification.json为准。后续只推送回执与交接，不重复部署。
