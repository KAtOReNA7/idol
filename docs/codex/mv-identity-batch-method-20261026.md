# 具名MV认人图的批量补齐方式

本轮从v9的1579条已有作品成员缺图关系出发。以作品/视频/成员三元组处理，不能用团体当前照片补所有历史MV，也不能凭相同歌名跨韩语、日语、舞台或其他视频版本复用。

1. 从主审计`workCoverage.missingIdentityRelationships`导出准确缺口，按团体与作品集中检索。
2. 优先采用官方MV拍摄专题中逐张具名的现场图；再采用含精确视频与成员图注的图库、具名成员文章中的MV章节。官方拍摄照片与MV截图分别标注。只含宣传/封面拍摄描述的概念照不纳入。
3. 章节没有YouTube ID时，核对成员文章身份、MV标题、年代/语种与目录版本。只能消歧到唯一现有视频的才纳入，并明确`sourceEmbedsExactVideo=false`；同歌多版本仍有歧义时留空，不把“唯一章节推定”写成独立逐帧核验。
4. 下载原字节，保留来源页、原URL、SHA、原始尺寸与证据级别。自动检查黑白边与最低可读尺寸，再看每张实际3:4联系表。脸部被特效遮挡、严重切脸/低清、文字覆盖或身份说明带猜测的候选留pending。
5. 用展示裁切统一3:4并修正主体位置；不压缩、重绘、扩图或改动原文件。高清源尺寸不等于每张脸部细节均高清，保留来源质量限制。
6. 经图片审查的增量交给`apps/idol-site/scripts/import-mv-identity-batch.mjs`。默认dry-run，核对冻结主审计SHA、已有精确关系、源文件SHA/字节/实际尺寸、裁切边界、重复绑定和来源类型；全部通过后才可`--apply`。该脚本不抓网页、不新增关系、不写私人评分、不自动批准候选。
7. 生成运行数据后验证原图、绑定与成员评分规则；本地检查全部新增作品的手机/桌面显示，线上核对原图与代表作品，再将本轮报告和待补CSV上传GitHub。缺图始终不作为关闭成员评分的依据。

## 同一冻结批次的用法

在`apps/idol-site/`运行（先保留研究delta及原图，人工/代理看图审查完成后再导入）：

```powershell
node scripts/import-mv-identity-batch.mjs ../../docs/codex/mv-batch-a-20261026.json ../../docs/codex/mv-batch-b-20261026.json ../../docs/codex/mv-batch-c-20261026.json
node scripts/import-mv-identity-batch.mjs ../../docs/codex/mv-batch-a-20261026.json ../../docs/codex/mv-batch-b-20261026.json ../../docs/codex/mv-batch-c-20261026.json --apply
node scripts/build-mv-public-media.mjs
```

三个增量必须来自同一主审计SHA并一次导入；应用后不能重复执行同批数据。实际尺寸读取使用当前工程依赖中的`image-size`。本轮只允许明确的原图目录，不允许任意路径或替换既有已审图；替换旧图另行审查。
