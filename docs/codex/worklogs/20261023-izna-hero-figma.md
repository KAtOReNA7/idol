# izna 首屏 Figma 调整

- 日期：2026-10-23，北京时间；分支 `codex/izna-native-integration`，本轮基线 `1a39c91d5a3970d88c3b808aea668264c89e8fb5`；沿用 draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6)。
- 用户反馈：首屏照片占比小，两侧元素空且喧宾夺主，希望接近官方页更简洁、和谐的照片展示，先在 Figma 调整。
- 阶段：1440/390 两个既有首页的首屏已修改，实际团照已导入，截图及设计上下文已核对；等待用户审阅设计。网页仍为旧 v13，本轮没有修改应用代码或部署。GENBLUE/WOOAH 和下一团未动。

## 实际设计

| 项目 | 调整后 |
| --- | --- |
| 桌面首页 | [812:19251](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=812-19251)，1440 宽；导航 80 高，仅小团名和 WAKEONE；重复大团名隐藏 |
| 桌面照片 | 从原 Figma 的 620 宽改为 1120 宽，占画板 77.8%；左右各 160；从页面 y105 开始，展示视窗 1120×746.67 |
| 构图 | 完整 PNG 子层 1120×1568，y=-634.67；对应原图 x0/y850/1500×1000，收去部分夜空和草地，保留六人头顶到鞋底；没有改写原图字节、拉伸或加滤镜 |
| 手机首页 | [812:19340](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=812-19340)，390 宽；两侧 16；照片 358×501.2，完整原比例 FIT |
| 图下入口 | 成员／作品／时间轴／查看原图；44 高横排，无按钮色块或侧边装饰。Figma 的查看原图文字有官方 PNG URL，未做点击验收 |

当前 Figma 本身没有网页里的圆环；本次调整不引入圆环或两侧索引。后续网页同步应删去旧圆环和侧栏，不能把“Figma 未使用”写成“网页已删除”。最初考虑整幅放大到 1120×1568，检查人物在原图中的位置后改为上述展示视窗，避免首屏只见夜空。手机仍展示整幅。

## 素材和上传验证

- 来源：已核对的 [WAKEONE izna 页](https://wake-one.com/en/artists/izna/)；映射见 `apps/idol-site/docs/artist-evidence/izna.json`。
- 原始文件：`apps/idol-site/public/artist/izna/batch-b-20261016/group-original.png`；1500×2100，5,568,135 B；SHA256 `31139045704dc66a4101af43a9e74bb067f37e403a2d8b6e1d4f753316e9fe2c`。
- 第一次单次链接 raw POST 于 60 秒超时，无最终响应；两次独立读回仍是 solid 占位，因此不能说第一次上传成功。
- 第二次使用新链接和较长等待窗口；同一原 PNG、image/png、HTTP/1.1，未更换代理设置或凭证。45.662 秒返回 HTTP 200、success=true、sizeBytes=5,568,135、placedOnNodeId=812:19265；随后独立读回 imageHash `2b559a69f818be778715f5271e87a25692c2392b` 及1500×2100尺寸。手机复用这个已确认的图片引用。
- 不保留单次上传地址、临时截图地址或临时素材地址。上传成功不用于推断历史 405 原因。

## 证据与检查

证据目录：[20261023-izna-hero-figma](evidence/20261023-izna-hero-figma/)。

- `before-layout.json`：修改前首屏、导航和父层布局。
- `executed-figma-edit.js` / `edit-result.json`：实际执行的设计编辑及返回节点。脚本会新建图片子层，只作归档，不应盲目重跑。
- `upload-result.json` / `final-verification.json`：上传结果、独立图片读回、最终结构；桌面/手机导航及图下入口没有文字越界；隐藏的重复标题保持可恢复。
- `home-desktop.png` / `home-mobile.png`：真实 Figma 整页导出，分别从1440/390画板缩放导出；下方原有占位可见，不将其当成整页实图完成。
- `hero-desktop.png`：本次实际首屏主体截图。
- `desktop-design-context.tsx` / `mobile-design-context.tsx`：对 `812:19259` / `812:19348` 的实际 get_design_context 返回；临时 URL 已清除，只作取稿证据，不是应用源码。
- 主执行者和独立评审均查看了实际导出：六人头顶、鞋底和左右人物完整，比例正常；桌面照片主导，手机整图清楚；可见入口没有重叠。此为本轮首屏可见效果检查，不代替用户审美确认、入口点击或整团验收。
- 只有 Figma 与文档证据发生改动，应用代码未改，未重跑网站构建/单测；此前 v13 测试不被引用为本稿网页验证。

## 下一步

1. 用户审阅本轮 Figma 首屏；此反馈不构成 izna 整团确认。
2. 按确认后的取舍同步正式工程 `apps/idol-site` 的 izna 首页，并给新的可打开审阅网页；保护 GENBLUE/WOOAH。网页实现须保留原图查看器，桌面裁切以人物完整为验收条件。
3. Figma 下方成员/发行实图及其他页面仍待落地；11个视频预览、80%/125%原生浏览器缩放、真实保存与主站全量发布等既有缺口继续单独记录。
4. 用户明确确认 izna 前，不开发 ifeye 或下一团。主站 v186 和审阅站 v13 均未被本轮设计编辑替换。

## 后续接续

用户随后回复“可以 继续开发”，批准继续实现本稿。网页同步、最终浏览器检查及 v14 私有审阅发布见 [网页工作日志](20261023-izna-hero-web.md)。上文保留 Figma 设计轮的历史状态；当前以该网页日志及 STATUS 为准，izna 整团仍待用户确认。
