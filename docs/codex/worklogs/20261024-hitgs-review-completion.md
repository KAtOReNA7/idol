# HITGS 逐团网页交付（2026-10-24）

## 开工与范围

- 用户“同意，继续开发”确认 VCHA 新审阅站 v1。本轮仅推进 HITGS，完成后等待本团网页确认，不开始 AtHeart。
- 仓库 KAtOReNA7/idol，正式工程 `apps/idol-site`；分支 `codex/hitgs-review-completion`，基线 `9670b97ee1a33af09fe6cabdaf5d72c1839dff42`。开工工作树干净，显式 fetch VCHA 并核对远端同 HEAD；没有 HITGS 远端分支或接续 PR。
- 原图、稳定 ID、评分/备注/观看状态与权限保持；主站 v186 不覆盖，不合并 main。
- 新增独立团页、五成员具名肖像、七发行与曲目、八已有具名作品/五舞台、七事件、搜索/原图/共享手帐往返。原有空白作品保留原状，不补造名称或关系。

## 设计与资料依据

- 实际 Chrome 导航 `https://www.nventertainment.net/sub/hitgs/main.html`、`https://hmusic.co.kr/`、`https://ssqent.com/` 均为 ERR_CERT_AUTHORITY_INVALID；没有绕过证书警告，未看到官网视觉。
- 实际查看 [Genie 官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=15198)，以浅蓝团照、粉彩与专辑视觉作原创延展，弃用仓库黄绿拼贴刊物风格。**不是官网复刻。**
- 五张同系列肖像来自 [Kprofiles 具名成员条目](https://kprofiles.com/project-h-2025-members-profile/)，属具名转载，不冒称官网原图。中文名沿用已有 evidence 映射，不声称已核官方汉字正名。
- 七发行及曲目重新读取 [Bugs 艺人发行目录](https://music.bugs.co.kr/artist/14195064/albums) 和逐张专辑。Vol.3 的中文 Ctrl C 明确 VV solo，不推断全员出演。
- 复用 VCHA 新站 v1 的路由与公开投影、TRACER 至 VCHA 原图查看/恢复/只读机制及共享手帐布局；团页视觉独立重写，共享手帐换色。交审必须说明复用范围。

## 环境

代码、服务与 Playwright 均在用户 Windows 本机。Browser plugin not available，使用已有 Playwright + Chrome，无新增浏览器依赖。目标主流程：团页 → 成员 → 既有作品/手帐 → 精确返回；另验搜索、原图、失败恢复、五种真实视口。

Figma 沿用 `zeLNExz4TbpWRW3uiahef7`，HITGS 会话 `53d85e72-05f4-4d2d-8b04-20fbb1a87890`。新审阅站 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a` 当前 v1，owner-private/零外部访客；本轮拟增量 v2 并保护 VCHA 文件原字节。



## 已交付网页

[HITGS 新审阅站 v2](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/hitgs/index.html)。团页独立视觉、五位成员同尺寸肖像/搜索/原图、七发行16曲目/搜索/封面、13视频精确版本、七时间轴事件和原生手帐往返已接入。修复最初发行卡片无反应：共享安全路由仅接受 `section=works&release=...`，发行目录自身仍使用 `section=records`。

保留团体 `rec28ldfRTiE4q`、五成员ID、八已有具名作品及五既有关系。空白作品 `rec28ldfRTrHPm` 保留原状、未投影、未赋名。26张图片为原字节（25新增、1既有团照），SHA写入资产清单；无压缩/裁图替换。评分、备注、观看状态及照片token均不进入公开浏览器投影；不改生产数据、保存、身份或访问权限。

## 分层验证

| 层级 | 结果与边界 |
| --- | --- |
| 自动测试 | `node --test tests/hitgs-native-review.test.mjs tests/vcha-native-review.test.mjs tests/katseye-review.test.mjs`：22/22通过，含精确ID、原字节、关系拒绝和只读写入隔离 |
| 类型 | `npx tsc --noEmit --incremental false`通过 |
| 正式构建 | `npm run build`通过；发行路由修复后复跑通过 |
| 审阅构建 | 28资产49,213,430 bytes；5真实关系；9个API隔离检查通过 |
| 布局 | 320/390/1440/2048/2560真实viewport，9种页面×5宽=45；无横溢出、坏图或pageerror，见browser-layout.json |
| 交互 | 31项通过：搜索/空态/原图Esc与焦点、五成员×两宽手帐往返、13影像精确版本往返、时间轴与图像失败重试；见browser-interactions.json |
| 页面基本健康 | 本地标题和URL正确，有主内容，无框架错误层，无相关console/pageerror，截图已实际查看 |
| 线上 | Sites native返回succeeded；IAB导航/读取40秒超时，最终读取再次35秒超时，未宣称线上交互通过；open_in_codex返回queued |
| 尚未验证 | 实际生产保存、实际视频播放、80%/125%原生浏览器缩放、线上完整流程 |

Browser plugin not available；本地使用已有Playwright/Chrome，不安装额外浏览器依赖。主流程：团页→成员/发行/视频详情→既有手帐→精确回原上下文。检查/截图位于本机 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/hitgs/`；跨电脑可重跑审阅构建，公开结果已随worklog入仓。测试和只读审阅不构成生产保存通过。

## Figma实际状态

[HITGS设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1145-1095)：21个可编辑画板，七种视图×1440/390/320，包括首页、成员、成员详情、影像目录、影像详情、时间轴与共享手帐。使用Space Grotesk及已有Ke/Action组件；正文用Inter/Noto Sans SC替代网页Arial/Microsoft YaHei，不能称逐字保真。实际读取6个不同关键画板截图，修正导航圆角、时间轴文字和图标错位。

图像capture首次长期pending后完成，取得团照/成员/视频图；补入5张封面。仍有2张大封面导入不完整：`album-4118440.jpg`（13,109,753 bytes）capture `25a93601-ba0c-4cf9-b361-06c739d8c9b9` 长期pending，`album-4122559.jpg`（9,051,093 bytes）capture完成但图片fill为空。因此发行目录/发行详情×3宽的6画板尚未建立，不以空画板/页面截图冒充可编辑设计。不更改网页原图绕过。完整字体/旋转/装饰和逐板像素对照仍待完成。具体ID见figma-frames.json。

## 发布与保留证明

- 同一owner-private新站v2，project `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`；实际source commit `abeb43afc696a726ec1fb415b615abb0a0c4a0d8`，deployment `appgdep_6adca46cc62881918d9c1167b88fe15a`。
- 28个既有非root文件SHA完全相同；34新增文件；root索引仅新增HITGS入口。临时Figma捕获HTML未打包。旧站v33不动，主站v186不动。
- 发布sourceFingerprint `ecd6f385fa98137e262642f3a925e5eeaba9f58dbad5dd7ab1b819613ea5ef00`。发布后仅清除app/page.tsx、components/hitgs-artist.tsx及测试文件的末尾空白行，重建fingerprint `abcd6995508a8544437b86171caa3ddc65fe8829c07fae292c4b164d9baf8ee8`；JS/CSS/HTML/手帐CSS原字节完全相同，只有manifest源码哈希变化，见public-delivery.json。没有把两个源码标识混称同一版本。
- 仓库已核PUBLIC，新增只含公开来源/素材和已清空个人字段的投影，不扩展现有授权。tsbuildinfo本轮产物已恢复基线；未合并main。

## 接续与验收边界

本轮停止在HITGS网页交审，等待用户确认后才开始AtHeart。Figma6发行画板、完整保真、真实保存/播放/缩放及线上完整交互保持未完成。GitHub活动分支和本日志是换机入口。源文件/运行：`apps/idol-site`使用现有npm依赖；`npm run dev -- --host 127.0.0.1`为正式工程开发；只读包通过上述build-hitgs-review脚本独立输出，再以普通静态HTTP服务查看。不能把本机localhost当云端链接。
