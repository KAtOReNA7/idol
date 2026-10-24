# AtHeart 官网风格页面与只读审阅

## 本轮范围（2026-10-24）

- 用户最新“同意，继续开发”确认 HITGS 新站 v2 网页，授权推进 AtHeart。本轮不开始下一团。
- 基线 `b9e07d0855888d023327998f96d104f98fa67e94`，分支 `codex/atheart-review-completion`。开工工作树干净，显式 fetch 后 HEAD/FETCH_HEAD 一致；GitHub 未发现同任务分支或 PR。
- 正式工程 `apps/idol-site/`；只更新新审阅站 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`。当前 v2，owner-only/custom、唯一 owner、0 外部访客。旧审阅站 v33 与主站 v186 不改。
- 保留原图、稳定 ID、关系、个人字段和权限；公开投影清除个人字段，仅展示既有精确关系。两条具名作品保留，原生空白作品不赋名。

## 参考与设计决定

- 实际用本机 Chrome 打开 https://atheart.me/、https://atheart.me/profile、https://atheart.me/discography 。IAB 首次导航 30 秒超时；Browser 插件不在技能目录，按前端测试技能采用 Playwright Chrome。
- 官网为黑色标识栏、白色图标导航、黑底、大幅团照与有细边框的发行卡。弃用旧米色书信折页，按该语言重做；项目新增成员/发行搜索、详情、时间轴与手帐往返，不宣称全站逐像素复刻。官网部分懒加载图片未在截屏中完成；官网团照、整体结构和文字已实际读到。
- 日本官网 https://atheart.jp/contents/menu/176621 支持七份成员具名肖像与生日；中文展示名沿用已存音译证据，不冒称官方汉字名。官网名册不等同实时活动阵容。
- https://atheart.jp/contents/menu/132956 的九项发行，逐项读取官方详情，18曲目及24个嵌入视频，加既有 M COUNTDOWN 舞台，共25影像槽。成员合作《내 마음 한 조각》单独注明范围。
- 复用 HITGS v2 路由、公开投影与 TRACER 至 HITGS 原图/恢复/只读机制；共享手帐沿用 VCHA v1 布局、改为黑白。交审必须披露。

## 实施与验证

已完成七成员、九发行18曲、25视频槽（15音乐影像、10表演/现场）、八条ready时间轴事件和既有手帐往返。原生十事件中两条hold继续隐藏；两条具名作品、四精确MV/舞台槽与六既有关系，空白作品 `rec28ldfRTrHT6` 保留不赋名。成员合作《내 마음 한 조각》范围已按主办方核为 Seohyeon、Bome、Nahyun，来源 https://www.sjcf.or.kr/hangeul/www/bbs/view.do?key=2504150021&pstSn=2610140005 。

43图片资产原字节22,377,342 bytes；含1字体共44资产22,539,446 bytes。35新增图片；资产SHA固定在 `atheart-review-assets.json`。共享成员手帐补入具名肖像解析器。导航登记补齐groupId/units及时间轴ID；正式入口 `use client` 恢复为首语句。发行外链实际通向官网详情，按钮已准确命名。

## 验证分层

- `node --test tests/atheart-native-review.test.mjs tests/hitgs-native-review.test.mjs tests/vcha-native-review.test.mjs`：24/24通过，含原字节、精确ID、隐私清除、拒绝歧义关系及只读写入隔离。
- `npx tsc --noEmit --incremental false`：通过。`npm run build`：最终修正客户端边界后通过。
- 审阅构建：44资产、6已有关系、9个API隔离检查；最终fingerprint `c3827ac3ce44366ff2a9a3491b3fcc4e06b6fc78bd4cc8fadadc3d3559c4f0aa`。
- 45真实viewport：9类页面 × 320/390/1440/2048/2560；无横向溢出、坏图、pageerror/console error。不是iframe模拟。见browser-layout.json。
- 61交互检查：26主流程与35补查，覆盖七成员×两宽共享档案/照片/精确返回、四既有视频往返、25精确预览/播放URL/手帐入口绑定、搜索清空、原图Esc与焦点、时间轴、图片失败重试、reload/newtab/back-forward、只读请求、五宽已知EasyList规则、无效视频恢复。21个未关联视频不提供手帐入口。见两个browser交互JSON。
- 本机Windows静态服务4192、已有Playwright与Chrome；Browser插件不可用，按前端测试技能fallback，未安装新浏览器。页面URL、标题、主内容和图片正常，关键截图实际查看。
- 没有进行真实生产保存、实际YouTube播放、80%/125%原生浏览器缩放。静态注入catalog不验证生产API错误恢复；现有共享超时机制复用。

## Figma与视觉对照

[AtHeart设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1166-1095)：27个可编辑画板，9视图 × 1440/390/320；7个不同关键节点实际get_design_context取稿并查看图像。使用已有Ke/Action实例、可编辑文本/AutoLayout/原生SVG与离散原图fill。素材捕获根 `1165:1095` 已在转移全部43原图hash后删除；没有把完整UI截图放入交付画板。节点与计数见figma-frames.json。

已修复Figma黑底logo不可见（保留原始imageHash，以alpha mask显示白色）、三个尺寸时间轴图标挤占正文、发行按钮文案。字体Arial/Microsoft YaHei在Figma不可用，明确替换Inter/Noto Sans SC；字体保真验证为未通过。完整逐字间距、搜索控件及全量逐板像素对照仍未完成，不将27画板等同设计完全通过。

实际视觉对照：官网黑白双层页头与图标导航已采用；大幅团照保留完整七人构图；成员同尺寸同行/手机两列；发行细边框卡片与黑底白字；搜索、详情、时间轴和共享手帐为项目扩展。官网截图部分懒加载内页图片未载入，未假称完整官网复刻。网页与Figma字体存在上述差异。

## 发布进度

正在发布同一owner-private新站，正式主站v186和旧站v33不改。62个既有非root文件SHA不变，50新增文件，root仅新增AtHeart入口；临时figma-assets.html未打包。源码边界修正后重建，JS/CSS/HTML原字节不变，manifest已更新到最终源码hash后才发布。发布结果随后补记。
