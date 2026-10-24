# Weeekly 官方参考与资料核实 — 2026-10-25

以下是本轮研究记录的归档副本；研究阶段只写 scratch，随后随 Weeekly 交付保存到仓库。研究引用的截图与原始响应位于本机 weeekly-research/；页面采用的原图、发行与来源清单已随本提交入库。研究阶段未修改记录 ID、用户数据或发布站点。

## 可直接用于设计的实际视觉依据

1. **主参考：[Weeekly 官方 Weverse Highlight](https://weverse.io/weeekly/highlight)**。已在本机 Chrome 实际渲染并截图，文件 `weverse-highlight.png`、`weverse-highlight-browser.html/json`。白色轻导航，灰粉 Bliss 大横幅，横幅内黑色花体原字标及 serif「6th Mini Album」，左侧白色 Weeekly，粉色当前标签，白底栏目和细灰边界。默认英文 UI 测得 Pretendard / 系统 sans-serif；中文为 PingFang SC、Microsoft YaHei 等回退。字体检查只反映真实页面 computed font-family，未证明用户机器实际加载了每一种字体。
2. **辅助：[Genie《LIGHTS ON》官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14428)**。浏览器实际渲染成功，`genie-bliss.png`、`genie-bliss-browser.html/json`。网页是白色、灰细线、蓝色平台链接和窄幅中央文章；完整校园团照起首、发行信息与曲目表、录音花絮和 Official Photo 顺序展开。其常规 HTTP requests 请求返回安全策略拦截页，未绕过；正常 Chrome 浏览器页面可直接访问。不要把平台通用皮肤叫 Weeekly 独立官网设计。
3. **[IST 当前公司官网](https://www.istent.co.kr/)** 浏览器可加载，`ist.png` 与 `ist-browser.html/json`。当前为公司新站通用首页，标题 “Connecting Talent to the 1st Global Stage”，主页可见 About Us。未找到可用 Weeekly 专属艺人页。不能写“IST 官网整体失效”，也不应把当前公司泛用设计说成 Weeekly 历史官网。

推荐披露措辞：依据实际查看的 Weeekly 官方 Weverse《Bliss》灰粉、白、黑视觉和官方发行素材重新设计；目录、搜索、时间轴与私人手帐为项目扩展，不称独立官网或逐像素复刻。

## 原图交付

`official-assets.json` 包含 18 个资产的原 URL、具名来源页、原尺寸、字节数、SHA256、发布时间及保真说明。所有下载均保持源响应原字节，未缩放、转码或二次压缩。七个身份来自官方具名标题，不通过脸识别。

网页建议使用的 11 个文件，共 28,353,051 bytes：

| 用途 | 文件 | 尺寸 / 说明 |
| --- | --- | --- |
| 桌面首屏 | `assets/webHomeHeaderImage.png` | 1368×456，当前官方网页原 banner，含完整 Bliss 原字标 |
| 手机首屏 | `assets/homeHeaderImage.jpg` | 1080×1080，官方另设移动 header |
| 品牌图块 | `assets/logoImage.jpg` | 400×400，官方粉底 Weeekly 字标 |
| 完整六人照 | `assets/group-1.jpg` | 2800×2000，Bliss ON 系列；另有 group-2 备选 |
| LEE SOOJIN | `assets/soojin-1.jpg` | 2000×2800，2024-07-01 发布 |
| MONDAY | `assets/monday-1.jpg` | 2000×2800，2024-07-02 发布 |
| PARK SOEUN | `assets/soeun-1.jpg` | 2000×2800，2024-07-02 发布 |
| LEE JAEHEE | `assets/jaehee-1.jpg` | 2000×2800，2024-07-01 发布 |
| JIHAN | `assets/jihan-1.jpg` | 2000×2800，2024-07-01 发布 |
| ZOA | `assets/zoa-2.jpg` | 2000×2800，2024-07-02 发布；第 1 张是横版 |
| SHIN JIYOON | `assets/jiyoon-1.jpg` | 2000×3000，2022 AWAKE #W 历史照，2022-02-23 发布 |

六人照均属于官方命名的同一 Bliss ON 系列。申智润必须明确作为不同历史时期的档案，不能伪称七人同一摄影系列。拍摄日未知，发布时间不等于拍摄时间。当前 banner 的 URL 上传路径含 2025，但视觉仍是 Bliss 活动，不能据上传路径造新回归日期。

原 URL 来自实际浏览器加载的官方公开响应：`community.preview` 的 header/logo 字段，以及具名媒体页 `extension.image.photos`；照片记录明确 `downloadable: true`。不是搜索缩略图或 `?type=w670` 预览。原始证据存在 `banner-evidence.json`、`weverse-[name].json`，仅作可溯源研究材料。

官方配色配置：communityColor **#E9687E**，homeGradationColor 上方 **#e4b6b7**、下方 **#f2d0d1**。原花体已在官方 banner 中，无须仿造标识字体。

具名页面：
- [LEE SOOJIN](https://weverse.io/weeekly/media/4-169251832)
- [MONDAY](https://weverse.io/weeekly/media/0-144326168)
- [PARK SOEUN](https://weverse.io/weeekly/media/2-144334846)
- [LEE JAEHEE](https://weverse.io/weeekly/media/4-169251871)
- [JIHAN](https://weverse.io/weeekly/media/1-144295351)
- [ZOA](https://weverse.io/weeekly/media/2-144334917)
- [完整团照](https://weverse.io/weeekly/media/2-144406028)
- [SHIN JIYOON 历史照](https://weverse.io/weeekly/media/2-16710827)

## 发行目录

`releases.json`：以 [Bugs Weeekly 20110282 的发行目录](https://music.bugs.co.kr/artist/20110282/albums) 及 **22 个实际读取的发行详情页** 为据，22 项发行、58 条本团署名曲目行。包含伴奏、合作、OST 重收；不等于 58 首独立歌曲。每条曲目记录原 track ID、序号、署名和来源。合辑中其他歌手曲目已排除，原排除明细仍保留。

需要注意：`4076492`（2022-06-04 不朽的名曲儿童节合辑）的《이름이 뭐예요?》是 문채원 + Weeekly 联合署名。Bugs 表格首个可见艺人链接是 문채원；其完整多艺人菜单明确包含 Weeekly 20110282，因此应计入，不能只按首个艺人链接排除。

`covers/bugs-[albumId].jpg` 为每个详情页声明的 1200px `og:image` URL 的原响应字节，22 张共 9,477,980 bytes；没有从小图放大。所有封面尺寸、SHA 与原 URL 在 releases.json 中。图像为平台宣告的封面源版本，不声称拿到发行方无限分辨率母版。所有日期是音源发行日，不可当作 MV 上传日。

Bugs 当前许多发行（含 Bliss）显示 Beyond Music / Above Music，这是当前目录版权/流通元数据；不要倒推为原始发行时期的所属社，更不能据此认定团体当前属于 Above Music。

## 成员与日期

`timeline-evidence.json` 存储可供页面使用的简述、日期类型与限制：

- **2020-06-30**：We are 发行 / 出道作品。Bugs 日期与 Genie 出道专题相互支持，后者具名列七人。
- **2022-06-01**：IST 声明结束申智润团体活动，后续六人体制；该日期同时是公告与明确生效日期。本轮获得的是 Soompi / 韩国媒体转载公司声明，未获得可打开的原始官方公告页，必须如实标注来源层级。
- **2025-02-26**：IST 公布六人专属合约结束，Soompi 文章与原韩文声明图片已实际阅读。没有单独精确合同生效日，也没有在此声明中取得“正式解散”的明文。不要将公告日期写成已核实合约生效日或解散日。
- **2025-04-07 15:00 KST**：Digital Membership 停售。
- **2025-05-08 15:00 KST**：官方 Notice 26768 说明所有上传和服务结束，但 **频道保留**；不是站点删除或解散证明。Notice 25964 同时证实会员服务时间。

2024 六人照片只证明那个时期阵容。本轮未全面核实所有成员在 2026 年的经纪公司和活动，建议措辞为“后期六人 / 历年七人”，避免“当前六位现役成员”。

## 验证与边界

- 本地 SHA256 已复核全部 18 原图与封面 manifest。
- 已查看主参考及辅助页面实际渲染截图，图像页实际包含具名标题和相符素材；不只有 OG / 搜索卡片依据。
- 未绕过证书、登录、验证码或安全拦截。Weverse 部分列表仅动态加载当前内容，但具名媒体页公开可读。
- 没有沿用旧日记页视觉；本研究不替父代理声称最终网页、Figma、上线或保存/播放已验。
