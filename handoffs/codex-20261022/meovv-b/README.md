# MEOVV B 候选交接

主站仍为 v186。本目录是已审源码候选及历史图片读取证据，不是已发布版本、正式发布包或部署指令。本次交接未应用补丁、构建、裁剪或部署。

仓库约定：应用源码位于 `apps/idol-site`，本目录位于 `handoffs/codex-20261022/meovv-b`。四份 `readback-bodies` 是当时正常 owner 浏览器从固定 public GET 下载的实际响应体副本，不是从源码 JPEG 重新制作的验证材料；原图仍保留在应用源码中。

## 四段源码补丁

必须从精确的 v186 基线开始，依次处理，不可跳步或强行解决上下文冲突：

1. `patches/01-inspect-plus-b-source.patch`：f0391481cccd85a4eb53cbe9bf63cdd77d30e350 → 589b421dde4e419dee1e164d02dc79aeec3bc29e。包含 inspect 修复、四图最终显示点切换、严格裁剪审计及相关测试。
2. `patches/02-deferred-public-copy.patch`：589b421dde4e419dee1e164d02dc79aeec3bc29e → e3ef00ae2a26560a8411bed5a58f2c327a5bf745。构建进程结束后再完整复制 public，不减少素材、不改变运行时消费者。
3. `patches/03-compiled-carrier-pins.patch`：e3ef00ae2a26560a8411bed5a58f2c327a5bf745 → 69dc651d1f938433a2fa73c707c0ebb674fe7e51。绑定当次成功构建的精确编译载体，仍保持 pending。
4. `patches/04-reviewed-gate-and-fixtures.patch`：69dc651d1f938433a2fa73c707c0ebb674fe7e51 → 7d76d3d42acaed953f3158e659274ced9889b0d5。记录当次独立复核通过，并显式隔离 pending 测试 fixture。

各段 SHA256、完整 base/target commit、tree 和变更文件见 `patch-chain.json`。四份补丁均与冻结 Git diff 逐字节相同；已分别在精确基线的临时 index 上通过 `git apply --cached --check`，未实际应用。最终源码清单 `final-source-manifest.json` 覆盖 3972 文件，目标 tree 为 `6cea369d93db3293418ba6e6ebc788a847fe89b8`。旧 commit 是来源身份；在新单体仓库应用后会产生新的仓库 commit，不能冒称保留了旧 commit 身份。

## 便携核验与应用方式

先在仓库根目录验证交接文件：

```sh
(cd handoffs/codex-20261022/meovv-b && sha256sum -c SHA256SUMS)
```

以下是后续明确选择应用候选时的参考命令，本次交接没有执行。仅用于应用子树仍是精确 v186、工作区干净的独立候选分支；若已经合并 GENBLUE、WOOAH 或其他变更，先逐项评审，不要强制应用：

```sh
set -eu
test "$(git rev-parse HEAD:apps/idol-site)" = a1fbe5d034b23be8a88572a3ab25e4d68d67734e
git diff --quiet -- apps/idol-site
git diff --cached --quiet -- apps/idol-site
test -z "$(git ls-files --others --exclude-standard -- apps/idol-site)"
for patch in handoffs/codex-20261022/meovv-b/patches/0*.patch; do
  git apply --check --directory=apps/idol-site "$patch" || exit 1
  git apply --directory=apps/idol-site "$patch" || exit 1
done
```

每段先 check、再应用到候选分支，后段检查依赖前段结果。任何一步失败即停止；不要把一次基线检查当作所有后续变更的许可。应用完成后必须按完整源码清单核路径、bytes、SHA 和 Git mode，不得仅依据补丁命令退出码宣称源码一致。上述命令不构建、不裁剪、不上传、不部署。

## 已完成与未完成

2026-10-22 的同源独立构建成功；当时远端对旧188、YOUNG POSSE5、Candyshop1、MEOVV4执行的4次 dry-run 与4次原严格 apply均 exit 0。独立复核确认仅移除198文件、221843236 bytes；剩余2373文件、257775621 bytes、194目录，保留文件 bytes/SHA/mode 不变。删除5个原规则目录，另2个目录保留为空。

这些是当时构建和裁剪的事实，不是正式发布包验收。尚未完成正式源码同步、正式打包、完整 gzip 解压后 tar 容量检查（须至少留2MiB余量）及 B 部署。有效回滚必须使用保留四张原静态图的完整 v186 包；已裁剪包不能只关闭开关就视为完成回滚。

## 证据与后续边界

- `readback-evidence.json` 给出固定图片 URL/id、SHA、大小、尺寸、原 owner 读取日期和本次离线复验日期。没有进行当前联网复测。
- 历史匿名证据只是用户当时无痕可见的确认，不是匿名响应体、状态码或响应头验证，也不是未来所有访问或发布的授权。冻结源码中保留少量原验证标识，供严格审计绑定；本交接不附完整对话或原始内部报告。
- 未来重建可能改变随机鉴权值、BUILD_ID、RSC 标识和编译文件哈希。当前 pins 只适用于当次已审产物，不能盲用、删除校验或放宽消费者规则；必须重新做精确复核。
- 原194排除范围不得被扩大。GENBLUE 新接入7图与旧排除规则存在集成冲突，合并后必须先核活动消费者和保留策略；不能把本候选的198文件清单用于未经重新审查的新合并构建。
- 不改评分、备注、观看记录、原图库、其他团体设计或权限范围。四图仅在 MEOVV member detail / PhotoLightbox 的固定匹配点切换，roster 与 SOOIN 不在范围内。
- 不得复用旧短效凭证或把此前对本次框架密钥的批准当成后续新建、续期、重建或发布的授权。此目录不含任何凭证、秘密值或生成的 server 构建文件。
