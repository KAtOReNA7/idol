# O 批研究与仍开放问题

2026-10-27，原706条清单按精确tuple继续；本轮只采用2条，不把97张图集原件等同于97条已补。

## 已采用

- MINJU / Tick-Tack：官方Weverse公开正文0-152290796有70张downloadable原图，SSR只暴露首图。具名转载MinjuGlobal/1857363859943936305明确标MINJU和MV Shoot；第2张转载与官方0-based第9张完整原件逐像素对应。官方图集早于Performance ver.发布；同时检查正式MV和表演版故事板，黑色造型属于正式MV序列。
- IROHA / jellyous：官方公开正文0-161514133有27张downloadable原图，具名转载illitupdates/1942910932315001026明确标IROHA和jellyous MV Shoot；转载第2张与官方0-based第19张完整原件对应。官方MV GkG60kISnfc的街景/游戏段落核对通过。

采用完整官方原件，姓名证据为第三方明确署名，并非官方逐人标注；原件及转载完整图同尺寸RGB差异记录于whole-image-matches.json。不是人脸识别，也不是由发型/衣服/站位推定身份。verify-evidence.py可在其他电脑离线复验全部像素、来源快照、原件SHA与裁切。该数值比较仅验证照片重现，不能单独证明人的姓名。

## 未采用与新路线

- Tick-Tack其余4人：官方70图读取已恢复，主要问题调整为逐人署名未证。MINJU以外不可按图集顺序分配姓名。
- IROHA自拍3-185480120明确说明Tick-Tack MV幕后，4张3000×2250已读取；照片头顶截断或前景手指干扰，暂不采用。可寻其他完整自拍/可靠具名转载与官方原件对应。
- MOKA Pinterest 410531322305691189的标题具名，图与官方58号裁切相符，但孤立二次署名较弱，等待补强来源；不计完成。证据仅为候选，不根据脸转移身份。
- Kpopping具名图集及原图403，未绕过挑战；搜索摘要/自动图像描述不能替代完整证据。
- WordPress现存五人章节图为MV截图，并非这批官方拍摄原照；仍需精确视频逐帧出处，未采用。
- ITZY Girls Will Be Girls搜到JACKET & TRAILER拍摄页，不能冒充MV拍摄；既有无逐人姓名的Melon正式MV图库仍需单独署名证据，本轮未新增ITZY图。

全部图集清单保存于evidence/tick-official-post.json和jelly-official-post.json。公开未登录页面正常返回READ_POST及downloadable图片，无账号登录、绕过权限或猜测资源地址。97份研究原件留在本机E:/project/idol-gap-o-research-20261027/；仓库仅保留2份选中原件及复核必要证据，跨电脑可用清单URL重新读取。
