# 2026-10-28 销量差异续查

仅研究和建议；没有修改运行时数据、提交、发布或个人记录。用 `python -X utf8 docs/codex/evidence/20261028-followup/statistics/reconcile-sales.py` 可重算 JSON。原月榜行完整保留；这里的数量是实体发行 Circle 出货减退货口径，不与 Hanteo、Oricon 或零售日榜混加。

## 可采用候选：fromis_9 的 463 差额已精确复算

| 发行/版本 | 期间 | 已存月榜和 | 年榜 | 净调整 |
|---|---|---:|---:|---:|
| FUN FACTORY 标准版 | 2019 | 49,850+5,406+1,212=56,468 | 56,121 | -347 |
| from our Memento Box 标准版 | 2022 | 137,232+20,640=157,872 | 158,682 | +810 |
| 合计调整 | | | | +463 |

1,151,613 - 347 + 810 = **1,152,076**，等于 Soridata 艺人汇总。推荐把原39行作为历史月榜证据保留，以独立 annualReplacements 记录上述两次替换；不能把年榜再加到月榜中。FUN FACTORY (KiT) 5,136、Memento Box (Weverse) 17,454+6,158、Memento Box (KiT) 11,251 均独立保留，共39,999，未含进标准版替换。其余34条月榜贡献不改。

可把这项来源差异改为 resolved-by-yearly-reconciliation；内部值/显示值候选1,152,076，scope应为“韩国Circle公开月榜及两项年榜修正累计，截至2026-07；来源覆盖下界”，不能称全球完整销量。这里只证明公开两总数的精确算式，不冒称查看了Soridata数据库内部算法，也不证明所有发行所有月份均覆盖。

来源层级与实际访问情况：

- [Soridata月榜](https://soridata.com/en/sales/fromis-9.html)：完整正文读取，39行与仓库一致。
- [Soridata口径说明](https://soridata.com/transparency.html)：完整正文读取；其说明年榜可替换同年月份和，包含退货修正与月榜未入榜差异。
- [2019 Circle年榜](https://circlechart.kr/page_chart/album.circle?hitYear=2019&nationGbn=T&targetTime=2019&termGbn=year&yearTime=3)：官方搜索索引明确第91名FUN FACTORY 56,121；直接open仅榜单壳，不能写成完整原榜已读取。
- [2019年榜可读复本](https://bestsellingalbums.org/year-end/South_Korea_Top_Albums_2019)：完整正文第91行56,121，标明Gaon Charts来源。
- [独立商品资料正文](https://kpopmerchandiseguide.com/discography/fromis-9-albums)：完整正文明确2019全年FUN FACTORY 56,121、年排名91，另述Kihno版本，不将它冒作官方来源。
- [2022 Circle年榜](https://circlechart.co.kr/page_chart/album.circle?hitYear=2022&nationGbn=T&targetTime=2022&termGbn=year&yearTime=3)：官方索引第92名Memento Box 158,682；直接open也只有壳。
- [Memento Box可读版本拆分复本](https://bestsellingalbums.org/album/62583)：完整正文明确标准版2022年榜158,682、KiT 11,251、Weverse23,612；总193,545。页面顶部更新时间早于年榜，只采用明确标注年度和版本的事实，不将顶部时间当数据截止日。
- [2022-07 Circle月榜](https://circlechart.kr/page_chart/album.circle?hitYear=2022&nationGbn=T&targetTime=07&termGbn=month&yearTime=3)：索引也显示标准版20,640 / 年累计158,682，作为交叉支持，未据此重复加入月份。

## tripleS 仍开放：不能用另一个总数覆盖差异

现存36月行2,087,073，Soridata汇总2,458,789，差371,716。来源已含子团，不得无证据归因“子团未算”或“日本销量”。

| 新比较源 | 逐发行和 | 与现存月和差 | 结论 |
|---|---:|---:|---|
| [Chukkae tripleS](https://chukkae.com/artists/triples)10行 | 2,095,426 | +8,353 | 无逐行榜期，不能解决Soridata差额 |
| [Korean Sales tripleS](https://koreansalestwt.blogspot.com/2023/03/triples-sales-summary.html)10行 | 2,123,697 | +36,624 | 页面韩国总数2,124,086仍差389；年行和2,143,415，口径/截止日不明 |

比较行顺序保存在JSON。Chukkae顺序为Love & Pop pt.1、Beyond Beauty、Assemble25、Performante、Assemble24、Mujuk、Muhan、Aesthetic、Assemble、Access。Korean Sales顺序为Access、Assemble、Aesthetic、Muhan、Mujuk、Assemble24、Performante、Assemble25、Beyond Beauty、Love & Pop pt.1；日本19,539独立，未加入韩国销量。

官方索引[2024年榜](https://circlechart.kr/page_chart/album.circle?hitYear=2024&nationGbn=T&targetTime=2024&termGbn=year&yearTime=3)有Performante Cosmo289,224，比现存2024月286,809多2,415，只是局部差，不能据此闭合371,716。2025年榜转录[报道](https://www.soompi.com/article/1812104wpp/circle)索引另有Assemble25 Cosmo406,744和Beyond Beauty Cosmo310,273，尚未据完整榜行执行年度替换。

[Chukkae fromis_9](https://chukkae.com/artists/fromis-9)13发行和1,170,893也不能替代。其9 WAY TICKET58,135低于现存包含2022补榜的62,599，表明聚合截止/覆盖不同，不保证“新的网页就是更完整的数据”。

## 已尝试的新路线与可用人工帮助

- Circle `.net` 官方首半年入口也仅返回壳；KPIA `idx=1189` 新闻502。没有绕过。
- Soridata数据库[公开下载入口](https://soridata.com/en/database_download.html)完整读取：SQL里artists releases包含sales，每6小时生成，但必须人工CAPTCHA。未尝试破解或联络站方。用户若愿意手工下载SQL，可进一步查tripleS按发行/年度的内部分解；这比反复替换聚合网站更有价值。
- BADVILLAIN额外搜索找到2024第23周PTT转录OVERSTEP2,962，但第24周2,405仍未取得具名可读原行；旧候选5,367没有因此直接采用，17未知统计不变。没有把“无检索结果”写成真实0。

建议本批仅采用fromis9的+463，并保留上述来源层级；tripleS与17未知继续开放。
