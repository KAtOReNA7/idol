> 2026-10-20 公开内容恢复增量 v2：本轮最新事实与测试见 `RECONCILIATION.md`；成员6人、原始经历10段、ready事件9条（日期轴8条＋无日期公告1条）。旧设计说明中的事件数量以本段为准。

# VCHA · 独立历史页面实现

VCHA 项目标识 `rec28ldfRTiE0h` 与 `/vcha` 路由保留。暖纸、深蓝衬线大字、细线阅读索引、唱片书脊行与成员登记页为本团构图；不采用 KATSEYE 深绿接触印样底板。首页、六人成员目录与所有详情、作品分类/搜索/空态/所有详情、单根只读最早优先时间轴已写成可运行 ESM 模块。根目录 `python serve.py` 后访问 `/#/vcha/home`；生产整合仍由 dot 负责。

## 本轮相对原资料的变化

- 以固定源码基线 `ea9c7b64c5498696f54338c2d6fa655adec714ae` 的 VCHA archive 方向及公开事实为起点，实现当前静态宿主接口，不替换生产 data 或私人记录。
- 保留六个 memberId、四个真实 MV workId。四份 stage 使用原 workId＋准确 videoId；stage 路由候选键不是新生产对象。唯一空作品占位记录原样留在 `reservedRecords`，没有生成虚假作品。
- 新增四张正式 VCHA 发行封面：Apple collection `1726030747`、`1733696760`、`1707071275`、`1717899490`。四份均为实际可解码 1200×1200 提供方尺寸版本，未本地放大/裁剪/去水印。原始请求 URL、提供的100px URL、尺寸、字节和SHA见 `references/apple-cover-metadata.json` 与 `asset-map.json`。
- MV／舞台若展示发行封面，明确标“发行封面”，不称该视频截图。GIRLSET 三作品与对应舞台保留为独立关联章节，不把当前四人照片套到 VCHA 六人历史。没有视频实播验证。

## 已复用的真实资料与图像

`libfile_58ff0316e3c481919bb5c4310386064a` 的 Only One 发行视觉原始下载字节；`libfile_697c55744c5c8191a1817752104203f0` 的 Lexi、Camila、Kendall、Kaylee 具名历史照片及原刊定位。四张个人照为此前已保存、具名来源候选，不把候选状态自行升级为生产核准。原刊文字、成员 ID、照片用途、署名、SHA均保留在逐图映射。Kendall 来源补充并未改变生产数据。

实际打开查看了 Only One 视觉、Girls of the Year 正式封面、Camila 原始发布图及当前 GIRLSET 的 Spotify 公开 OG 图；最后一张仅为后续品牌参考，不用于 VCHA 历史肖像。当前 Spotify HTML 正常读取成功，但不是完整浏览器画面的视觉验收。

品牌关系来源：Korea JoongAng Daily 2025-08-07，<https://www.koreajoongangdaily.com/entertainment/vcha-changes-name-to-girlset-enters-new-chapter-with-four-members/12038950>，正文第137—150行列出四位继续成员和 JYP 说明。VCHA 六人历史与2024-01-26出道由已缓存环球原刊与本轮正常公开检索相互支持：<https://www.universalmusic.com.br/2024/03/15/o-grupo-de-pop-feminino-vcha-faz-o-lancamento-duplo-de-only-one-e-favorite-girl/>。

## 当前缺项与已解决事项

1. KG、Savanna 历史肖像缺项已于2026-10-20由独立公开原刊补齐，六人成员页均有真实具名照片。KG为BNT/Nate 2024-01-20发布版680×850，Savanna为OSEN/Chosun 2024-01-19发布版530×662；均为下载原字节且已实看，不称相机原片或统一高清。新DOM定位、原图地址、署名、尺寸、字节与SHA见 `references/portrait-delta-20261020.json`。KG/Savanna旧hold仅是原始历史证据，已被本次新证据取代；无Bugs/Fnnews等被拒来源重试。
2. GIRLSET《Little Miss》《Tweak》《CHAT》及四份 stage 缺对应视频配图；现为可导航的文字节目单，有封面的 Girls of the Year 用正式封面并注明用途。没有借图。
3. Girls of the Year 原公开 work 记录 `releaseDate=2024-01-25T00:00:00.000Z` 与官方数字出道日期2024-01-26存在语义差异。本模块保留 `originalReleaseDate`，不把数字发行日冒充精确 MV 发布日期；该 MV 的 `date=null`，正式发行与时间轴使用 Apple／官方发行日期。需 dot 对当前记录逐项复核后决定是否修订。
4. 稳定发行生产 ID 未提供，四份外部发行 `id/projectReleaseId=null`，仅候选键用于预览导航，不创建关联。
5. 1440/390/320/宽屏 CSS 和减少动态规则已实现；没有本轮浏览器、实机、缩放或新 Figma 原生落地验收，不标最终设计完成。

## 设计与验证边界

第一张 ImageGen 概念含虚构姓名/日期/封面，已拒绝，不是通过稿。`references/vcha-corrected-concept.png` 只作为纠正后的离线构图参考；运行页全部由 HTML/CSS 与真实原始图片构成，不加载整页图、SVG 或合成照片充当页面。实际成员及日期以结构化资料为准。

`node --check groups/vcha/index.js` 已通过。真实覆盖、全路由静态渲染与基线 ID 检查由根测试报告提供，不能替代浏览器视觉验收。Figma 未调用；没有发布、存储系统、评分、备注或观看状态写入。

## 2026-10-20 最后成员肖像增量

仅更新原缺图两人成员image与来源，追加两张原始下载文件及具名DOM证据；未改变ID、布局、历史关系或KATSEYE。六人头像覆盖4→6。源刊与原图正常读取HTTP200；有重定向脚本的Newsen移动页未用于准入。没有继续采集MV同造型照。与上一包比较，消除了KG/Savanna名牌占位；新图仍交dot最终图片复核，不冒充已入生产。实际浏览器仍未验。
