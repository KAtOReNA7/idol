# GENBLUE 与 WOOAH 原生接入候选

这是待接入源码包，不是可部署版本。GENBLUE v2.2 与 WOOAH v1.2 的 57 个 overlay 文件保持冻结字节：54 项新增、3 项覆盖；不改变设计、真实 API、权限、评分或观看状态。

## 目录与差异

正式源码位于 apps/idol-site，本候选位于 handoffs/codex-20261022/combined-integration。overlay 内路径均相对正式源码根目录。覆盖路径仅有：

- app/artists/genblue/page.tsx
- app/artists/wooah/page.tsx
- data/public-artist-navigation-keys.json

共享注册图保留原 4 团及顶层元数据，再依次追加 GENBLUE、WOOAH。完整新增/覆盖列表和 before/after SHA 见 OVERLAY-SHA256.json。正式 v186 的三项 before SHA 全部吻合，57 文件只读检查及源码补丁 apply-check 通过；未实际应用。

## 仓库根目录只读检查

    python3 handoffs/codex-20261022/combined-integration/check-overlay.py --target apps/idol-site
    git apply --check --verbose --directory=apps/idol-site handoffs/codex-20261022/combined-integration/native-source.patch

须从仓库根执行并确认 patch 覆盖非空，不能将嵌套目录下跳过所有文件的 exit 0 当通过。

遇到冲突应人工合并，不得覆盖更新的导航条目。实际应用仅在独立开发副本进行，并保留可恢复旧版本。源码补丁不含二进制资产，新增图片和字体在 overlay/public。若副本用了硬链接，应用时必须采用临时文件加原子替换，不得原位截断。

后续类型检查可在独立副本应用候选后，把本目录 TARGETED-TYPECHECK-CONFIG.json 复制为 apps/idol-site/tsconfig.native-two-groups.json，并在 apps/idol-site 运行：

    NODE_OPTIONS=--max-old-space-size=1536 ./node_modules/.bin/tsc -p tsconfig.native-two-groups.json --incremental false

合并目标的类型检查尚未执行。仓库根 Next tsconfig 应排除 handoffs/codex-20261022，避免候选与正式源码混编。

## 资产与发布阻断

相对 source/public 净新增 41 文件、3,611,670 B，这不是部署增量。75 文件保留闭包共 8,744,805 B，其中 5,133,135 B 复用正式源，不在候选重复复制。REQUIRED-PUBLIC-ASSETS.json 的站内 URL 对应 apps/idol-site/public 或候选 overlay/public。

GENBLUE 旧 batch-b 目录中 7 张原图共 912,978 B 曾被部署裁剪，重新使用不能算 0 发布增量。旧 pruner 还会因新源码引用此目录而 fail-closed，详见 PACKAGING-GATE.json。须单独审核保留规则，不能降质图片、删引用或盲目刷新 guard。本包没有修改 pruner。

实际部署增量与完整展开 TAR 的容量仍待最终授权构建实测。硬上限为 256 MiB，并须至少保留 2 MiB 余量。

## 验证边界

原私有合成 QA 的关键浏览器流程已通过，WOOAH 普通 80%/125% 缩放已检查；精确 320/390/1440/2048/2560 断点未验证。合成 QA 不代表真实 catalog、编辑器保存、权限与脏状态守卫的整体验收。原测试范围与尚未便携化部分见 tests/README.md。

本包未在新仓库跑产品测试、目标类型检查或全站构建，也未应用或发布。正式接入与发布须另行验收；本交接不授权新增凭证、框架密钥、推送或部署。
