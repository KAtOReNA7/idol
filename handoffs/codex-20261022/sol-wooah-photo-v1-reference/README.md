# WOOAH Sol Photo v1：历史设计参考

本目录只保存经核验的 Photo v1 两文件增量、原 Figma 节点索引及历史差异元数据，供 Codex 对照设计来源。它不是可运行项目、生产补丁或完整素材包。

## 内容与身份

- `delta-source/groups/wooah/index.js`：22,976 字节，SHA-256 `870d52e388f948e80c7fa2a65fd8bee0a3dcb7fa3bb0b78e85f7e7df5b13209d`。
- `delta-source/groups/wooah/styles.css`：44,123 字节，SHA-256 `4a362bc635800213197e8956aaa0afca23bf2c2baf16e485842f42212dbd4daa`。
- `photo-round/FIGMA-NODES.json` 与 `.md`：原字节索引，51 个新实图画板 + 9 个保留画板。
- `photo-v1-audit/CHANGES-from-v0.json`：原字节历史 before/after 与验证元数据，不是本次重新运行的验证记录；它引用的完整 patch 没有收入本小包。
- `SHA256SUMS`：覆盖本 README、上述 5 份原文件及 `docs/codex/SOL-HANDOFF.md`；在仓库根目录运行 `sha256sum -c handoffs/codex-20261022/sol-wooah-photo-v1-reference/SHA256SUMS`。

来源为 Library `libfile_ce5307ba17fc819181bfb33ab9690f03` v1。原包报告大小 22,348,026 字节，SHA-256 `e2589e9028c41ab51599109061290a1b2ee12cd8ca5f0e88b4e16cc7b7a691d1`。本次核的是提取文件，不宣称重验原包整体。所有五份原文件经限定范围检查，未发现私有本机路径或常见凭证模式，故原字节保留，无需脱敏改写 CHANGES。

## 使用限制

生产仍为 v186。后续 WOOAH native v1.2 已进入相邻 `combined-integration` 候选，其设计遵循已审阅的 Sol Photo v1 画板。**不要用本目录两份旧式独立源码直接覆盖 native 候选或正式工程。** Windows 旧 6,922 字节 index.js 也不是此 Photo v1。

原 CHANGES 中 `browserTestPerformed: false` 是 Sol Photo v1 当时的历史范围，不表示后续网页 QA 全未做。后续私有合成候选的关键返回、队列、原图交互及普通 80%/125% 缩放已检查；真实 catalog、保存、精确视口和生产集成仍待验收。该历史记录不授予真实写入、权限、凭证、发布或共享范围变更权限。

本目录不含原图、截图、完整运行依赖或原始会话。Figma 映射可在节点索引内查找；`assetKey`（原 SHA-256）不可当作 Figma imageHash。完整 15 团及历史 6 团状态、缺图身份、既有 GitHub/Library 入口见 [Sol 最终交接补遗](../../../docs/codex/SOL-HANDOFF.md)。
