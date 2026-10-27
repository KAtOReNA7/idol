# 待核舞台按新偏好重审

用户要求优先普通音乐节目打歌版或练习室，不采用演唱会版；已明确否决三个精确视频。此次只审既有资料，无新网络请求、应用修改、私人记录操作、提交或部署。

## 数量与口径

- 原待核作品仍123。按**现有运行时候选**分流：{"当前候选不符": 59, "其他待定／需重新找": 61, "音乐节目方向": 3}。没有新增已匹配作品。
- 123作品共77条运行时只读候选：{"音乐节目方向": 4, "当前候选不符": 63, "其他待定／需重新找": 10}。其中排出演唱会/活动33条、已有版本不符30条。
- 另审既有搜索索引1742条出现记录，1742个作品/视频组合；只按题名分流，不宣称目标歌曲与语种已核。分类{"音乐节目方向": 144, "当前候选不符": 652, "其他待定／需重新找": 920, "练习室方向": 26}。
- 搜索索引命中的音乐节目/练习室可能是另一首歌；不据此给123作品标已解决。练习室获允许，当前运行时没有合格练习室候选不等于今后不找。

## 三个精确否决

| 视频ID | 决定 | 当前运行时 |
|---|---|---|
| [l9GLV8Kd-MU](https://www.youtube.com/watch?v=l9GLV8Kd-MU) | 用户精确否决；光阳音乐节记者现场，不按普通打歌/练习室采用。 | 不在supplements；研究记录保留并标不采用 |
| [saY9KS7mKvI](https://www.youtube.com/watch?v=saY9KS7mKvI) | 用户精确否决；COUNTDOWN JAPAN音乐节，不再作为优先候选。 | 不在supplements；研究记录保留并标不采用 |
| [BnmwjH-suLg](https://www.youtube.com/watch?v=BnmwjH-suLg) | 用户精确否决此Not Shy/WANNABE两曲MTV练习串烧；英语版本未证。仅否决此ID，不否决其他练习室视频。 | 不在supplements；研究记录保留并标不采用 |

## 运行时应隐藏优先入口或标不采用的条目

所有位置均为 `apps/idol-site/data/stages/supplements.json` JSON Pointer。只读候选排除不等于删除历史证据或改变个人评分关系。

| 范围 | 作品ID | 精确来源ID | 字段位置 | 原因 |
|---|---|---|---|
| 123待核内 | rec28ldfRTrIkV | 5ae0vFdR4xY | `/works/rec28ldfRTrIkV/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMCSdB | DmbiyCSEC_8 | `/works/recvxyHuKMCSdB/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMiDs4 | 5ClWDIInX0M | `/works/recvxyHuKMiDs4/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMLz7L | 0aEgFTk7B9o | `/works/recvxyHuKMLz7L/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMlNfX | 0aEgFTk7B9o | `/works/recvxyHuKMlNfX/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMxwnW | 0aEgFTk7B9o | `/works/recvxyHuKMxwnW/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMisqR | 82CnK4M2sxo | `/works/recvxyHuKMisqR/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMlAhN | TE6aw22GfUo | `/works/recvxyHuKMlAhN/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMyy5i | tX3G0yzQqD4 | `/works/recvxyHuKMyy5i/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMlGJW | HEiiTiLCymg | `/works/recvxyHuKMlGJW/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKMwjsI | HEiiTiLCymg | `/works/recvxyHuKMwjsI/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5X7zV3 | IZAv5Tj8a8A | `/works/recvxyOz5X7zV3/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XmMQe | IOKMx1jeCjY | `/works/recvxyOz5XmMQe/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyHuKM2Gwu | dHdABwhhDj8 | `/works/recvxyHuKM2Gwu/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XnOv7 | wJwUjuKr_54 | `/works/recvxyOz5XnOv7/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XQMJt | wJwUjuKr_54 | `/works/recvxyOz5XQMJt/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5X7Tw7 | LiNxfFkymTk | `/works/recvxyOz5X7Tw7/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyH5pzFAPL | WWvGUnPKeAg | `/works/recvxyH5pzFAPL/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyH5pzoMAf | 6fkcQGNr-g0 | `/works/recvxyH5pzoMAf/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5Xa1EK | eZRmP-l3Nz0 | `/works/recvxyOz5Xa1EK/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5X3Fd8 | L2XP2WOibxw | `/works/recvxyOz5X3Fd8/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | rec28ldfRTrNsK | ctfS0Rcq-gs | `/works/rec28ldfRTrNsK/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | rec28ldfRTrOTb | FWOh8wKclYQ | `/works/rec28ldfRTrOTb/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XJWXT | tH1WVlGhnHQ | `/works/recvxyOz5XJWXT/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XVlTp | ZmPJyC0eVM8 | `/works/recvxyOz5XVlTp/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | rec28ldfRTrNcl | H3Ncs0HIXoU | `/works/rec28ldfRTrNcl/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | rec28ldfRTrNcl | d8anBYGFEzU | `/works/rec28ldfRTrNcl/alternatives/1` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrFYu | 0xRvDU-6zmY | `/works/rec28ldfRTrFYu/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XKzE5 | NnTEZCxhxF4 | `/works/recvxyOz5XKzE5/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | recvxyOz5XkyEY | mH4CIO_YArc | `/works/recvxyOz5XkyEY/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyOz5XkyEY | 1_sylBku10M | `/works/recvxyOz5XkyEY/alternatives/1` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | rec28ldfRTrF2E | bE25vNsyrtY | `/works/rec28ldfRTrF2E/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrFGi | D4MWfp4aVjI | `/works/rec28ldfRTrFGi/watchLeads/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxDMFHNHFyM | 5vGxmlqHRAs | `/works/recvxDMFHNHFyM/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxDMFHNJME3 | gXZwK_WihLM | `/works/recvxDMFHNJME3/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyH5pzJov0 | cQLtH8sY5R4 | `/works/recvxyH5pzJov0/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrMwG | tPhhxMMkSoQ | `/works/rec28ldfRTrMwG/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyOz5XlqWP | EnouZqsFhRY | `/works/recvxyOz5XlqWP/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 123待核内 | rec28ldfRTrAUD | wyZC2BcFz1A | `/works/rec28ldfRTrAUD/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrCzF | Ybd8Ax0noI4 | `/works/rec28ldfRTrCzF/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrCDJ | KhUE3qy-PIY | `/works/rec28ldfRTrCDJ/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxDMFHNyyeA | TqhDyb4c_TE | `/works/recvxDMFHNyyeA/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrGj0 | nd9bPkKg3og | `/works/rec28ldfRTrGj0/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxDMFHN97Px | Iftbp9dB8go | `/works/recvxDMFHN97Px/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZLpET3tB | EIfk7XSGPag | `/works/recvxIZLpET3tB/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyOz5X1VFs | -_vX7v3HxsY | `/works/recvxyOz5X1VFs/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyOz5X0JJ9 | It1ZDGGGziQ | `/works/recvxyOz5X0JJ9/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZRWKy9zg | XHNZYGNgRUc | `/works/recvxIZRWKy9zg/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZy35rUeY | VFsQW-jTwcM | `/works/recvxIZy35rUeY/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZy35Xwr7 | O-p-euu4gIE | `/works/recvxIZy35Xwr7/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZy3525BF | c3MYVf7QecY | `/works/recvxIZy3525BF/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyH5pzQxpW | 5nf6NO_WA2Y | `/works/recvxyH5pzQxpW/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyHuKMXVDa | MTf-E7FS4gM | `/works/recvxyHuKMXVDa/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrOXn | 2086355939263930837 | `/works/rec28ldfRTrOXn/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrJne | 312_u68JpTA | `/works/rec28ldfRTrJne/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrOnV | qrl0w3bIYHo | `/works/rec28ldfRTrOnV/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrCrz | fy5Yr42RSZY | `/works/rec28ldfRTrCrz/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrKqc | sQ3zqlBsuqs | `/works/rec28ldfRTrKqc/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | rec28ldfRTrK1S | QuEToahkbUU | `/works/rec28ldfRTrK1S/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyHuKMh5bM | 61314532 | `/works/recvxyHuKMh5bM/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZnIaGCNq | YHsuyYkqPOI | `/works/recvxIZnIaGCNq/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxyH5pzbluu | Pgy5mTSga1c | `/works/recvxyH5pzbluu/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 123待核内 | recvxIZFpVLU0R | yRNslSmbiW0 | `/works/recvxIZFpVLU0R/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 待核外提醒 | recvxyOz5Xr6ek | Xw-rOxA0ItI | `/works/recvxyOz5Xr6ek/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 待核外提醒 | rec28ldfRTrN03 | Iccsdu-GjSU | `/works/rec28ldfRTrN03/alternatives/0` | 现有证据已标别版/截短/阵容差异；即使形式合格也不能当目标原版已匹配。 |
| 待核外提醒 | recvxyHuKMCtUB | crGAr4NQRa4 | `/works/recvxyHuKMCtUB/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 待核外提醒 | recvxyHuKM2wRG | 6Gwokju3QE4 | `/works/recvxyHuKM2wRG/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 待核外提醒 | recvxyHuKM2wRG | _rn2nefy610 | `/works/recvxyHuKM2wRG/alternatives/1` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 待核外提醒 | recvxDMFHNSckK | bJFwXeWBn5o | `/works/recvxDMFHNSckK/alternatives/0` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |
| 待核外提醒 | recvxDMFHNSckK | nd2aaJ9AQjA | `/works/recvxDMFHNSckK/alternatives/1` | 既有类型/标题显示演唱会、音乐节、粉丝/发布活动；不列普通打歌/练习室优先候选。 |

## 边界与易错点

- Golden Wave/WAVE、CRUSH虽由JTBC播出且旧字段写broadcast_stage，属于活动来源，不能据电视台身份当普通打歌节目。XG MILLION PLACES巡演及NewJeans Lollapalooza同样排出优先候选。它们在123待核集合之外的部分已有选择记录，仅作为父代理保留评分前提下处理的提醒。
- STUDIO CHOOM、Suit Dance、Performance Video、Live Clip不自动等于练习室；没有明确节目/练习证据的归其他待定。
- IVE年末Song Festival、ITZY MBC Music Festival单列特别节目，且当前两条另有版本不符证据；不是仅因特别节目就一概禁用。
- NewJeans Right Now的7XhRd6cVIyI保留音乐节目方向，但实际语种未证；旧“韩语版本”报道只明确Supernatural，不能继续误用。
- 串烧/短版/客演或成员不同、语言或Remix不同仍需单独核。用户否决BnmwjH-suLg不构成“所有练习室不采用”的政策。

## 123项去向

| 作品 | ID | 新路线 | 运行时候选数 | 下一步 |
|---|---|---|---:|---|
| Love In My Heart | rec28ldfRTrAUD | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| DEBUT SONG | rec28ldfRTrAfx | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| DOPAMINE | rec28ldfRTrCDJ | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Untitled | rec28ldfRTrCrz | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| DADARIDA | rec28ldfRTrCzF | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| FAKE IDOL (가짜 아이돌) | rec28ldfRTrF2E | 其他待定／需重新找 | 2 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| 4 Life | rec28ldfRTrFGi | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| YOUNG POSSE UP (feat. Verbal Jint, NSW yoon, Token) | rec28ldfRTrFYu | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Best Friendz | rec28ldfRTrGY0 | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| 나의 이름은 (ROTY) | rec28ldfRTrGj0 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| STYLE | rec28ldfRTrI8S | 音乐节目方向 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Moonride | rec28ldfRTrIC0 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| FOCUS | rec28ldfRTrIkV | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LIT RIGHT NOW | rec28ldfRTrJne | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| little monster | rec28ldfRTrK1S | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| SUPA DUPA LUV | rec28ldfRTrKWv | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Sunday Morning | rec28ldfRTrKm3 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| NOT ME | rec28ldfRTrKqc | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| See U Tonight (feat. YUNAH & MINJU of ILLIT) | rec28ldfRTrLFz | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Ghost | rec28ldfRTrLow | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Painting | rec28ldfRTrMwG | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Love All | rec28ldfRTrNO2 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| DUMB HOT! | rec28ldfRTrNYh | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| ShaLala (Japanese version) | rec28ldfRTrNcl | 当前候选不符 | 2 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| BEEP (Japan Edition) | rec28ldfRTrNsK | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Cherry Gene | rec28ldfRTrO2v | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Baby Flower (Japanese Ver.) | rec28ldfRTrOTb | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Dream Dress | rec28ldfRTrOXn | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Password | rec28ldfRTrOnV | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| DNA | rec28ldfRTrP1t | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Welcome to Heaven | rec28ldfRTrP5H | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Milky Way | rec28ldfRTrQ8F | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| 4 SEASONS | recvxDMFHN97Px | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| IYKYK | recvxDMFHNHFyM | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| IN THE RAIN | recvxDMFHNJME3 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| O.R.B (Obviously Reads Bro) | recvxDMFHNyyeA | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| ROCK THE BOAT | recvxDMFHNzJyr | 音乐节目方向 | 2 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| VOODOO DOLL | recvxIYG1FSCws | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| loverfory | recvxIZFpVLU0R | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Our Voyage | recvxIZLpET3tB | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I.L.Y | recvxIZRQAko79 | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I.L.Y | recvxIZRWKBgDC | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I.L.Y | recvxIZRWKKCeh | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I know | recvxIZRWKntfT | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| SHOW DOWN | recvxIZRWKy9zg | 其他待定／需重新找 | 2 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I.L.Y | recvxIZXUpORHf | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Pilot2 | recvxIZY0lR25A | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I.L.Y | recvxIZY0lVCCr | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| kawa | recvxIZY0lX8bP | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Gameboy | recvxIZnIaGCNq | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Gulliver! | recvxIZy3525BF | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Cherry Blossom | recvxIZy35Xwr7 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Little By Little | recvxIZy35rUeY | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| 미스터 2026 | recvxJ03dOg1Gc | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Breath | recvxyH5pz4ojC | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Promise | recvxyH5pz6LHw | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| ドキドキLOVE | recvxyH5pzA9lj | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Buenos Aires | recvxyH5pzEDfw | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| DOREMI | recvxyH5pzFAPL | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Top Secret | recvxyH5pzJov0 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| 7days Tension | recvxyH5pzMCLp | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| SUMMER | recvxyH5pzQxpW | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LIT | recvxyH5pzVn2k | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Vampire | recvxyH5pzYOf3 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Bubble Up! | recvxyH5pzZ4x9 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Shining On You | recvxyH5pzZfyK | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| MWUAH | recvxyH5pzbluu | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| MEOW | recvxyH5pzdckl | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| D-D-DANCE | recvxyH5pzi1oo | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Happy Christmas | recvxyH5pzoIOD | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Teddy Bear | recvxyH5pzoMAf | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Love | recvxyH5pzoaOZ | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| WXW (Wish With W) | recvxyH5pzrrSO | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| ELEVEN -Japanese ver.- | recvxyHuKM2Gwu | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Be Alright | recvxyHuKM5r64 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Get Goin' | recvxyHuKMBHQA | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Armageddon (Flava D Remix) | recvxyHuKMCSdB | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Welcome To MY World (Feat. nævis) | recvxyHuKMDFye | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LEMONADE (2Spade Remix) | recvxyHuKMLz7L | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| SUMMER FESTA | recvxyHuKMNnpu | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Regret of the Times (2024 aespa Remake Ver.) | recvxyHuKMXVDa | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| KISS N TELL | recvxyHuKMZLFT | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I WANT | recvxyHuKMh5bM | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Girls (BRLLNT Remix) | recvxyHuKMiDs4 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Next Level (Habstrakt Remix) | recvxyHuKMisqR | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Rich Man (Yellow Claw Remix) | recvxyHuKMlAhN | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Supernova (Grimes Remix) | recvxyHuKMlGJW | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LEMONADE (Marlon Hoffstadt Remix) | recvxyHuKMlNfX | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Supernova (Grimes Remix) (The Other World Ver.) | recvxyHuKMwjsI | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| BANG BANG (MINIVE VER.) | recvxyHuKMwrIt | 其他待定／需重新找 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LEMONADE (Zedd Remix) | recvxyHuKMxwnW | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Spicy (Nitepunk Remix) | recvxyHuKMyy5i | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Revenge | recvxyOz5X0JJ9 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| I Want That | recvxyOz5X1VFs | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Oh my god | recvxyOz5X3Fd8 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Yum | recvxyOz5X5dQ5 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Caution | recvxyOz5X6G1q | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| FEARLESS (Japanese Ver.) | recvxyOz5X7Tw7 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LOCO (Japanese Ver.) | recvxyOz5X7zV3 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Like Magic | recvxyOz5X9qGD | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| RESCUE TAYO | recvxyOz5XCY9Z | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| HULA HOOP | recvxyOz5XEgYP | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Touchdown | recvxyOz5XFVzt | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Last Dance | recvxyOz5XGYPC | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Right Now | recvxyOz5XHEju | 音乐节目方向 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| SPAGHETTI | recvxyOz5XJWXT | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| UNFORGIVEN (Japanese Ver.) | recvxyOz5XKzE5 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| CRAZY (Japanese Ver.) | recvxyOz5XQMJt | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Be Who You Are (Real Magic) | recvxyOz5XQZhy | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| 蜚蜚 (FEIFEI) | recvxyOz5XRfn5 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Supernatural | recvxyOz5XVlTp | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LATATA | recvxyOz5Xa1EK | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Voltage | recvxyOz5XkyEY | 当前候选不符 | 2 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Boys Like You | recvxyOz5XlqWP | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| SUPERPOWERS | recvxyOz5XmFwB | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Not Shy (English Ver.) | recvxyOz5XmMQe | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| CRAZY (English Ver.) | recvxyOz5XnOv7 | 当前候选不符 | 1 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Hey Gabby! | recvxyOz5Xo5fW | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| MEXE | recvxyOz5Xqy0Q | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Beautiful Restriction | recvxyOz5Xr917 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Sprinkle Party | recvxyOz5XsgVc | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| LUMINOUS | recvxyOz5XueI9 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |
| Sugar Rush | recvxyOz5Xvsk1 | 其他待定／需重新找 | 0 | 找精确版本音乐节目/练习室，核实际音频与完整首尾 |

完整候选、字段位置、原版本标签、排除依据和1742条索引记录见pending-audit.json。未进行整片播放或全量重新搜索；不把这些研究分类写成事实性出镜/语种或作品完整性证明。
