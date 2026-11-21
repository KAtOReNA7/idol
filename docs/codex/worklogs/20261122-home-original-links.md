# 首页团照首次打开原图

2026-11-22，Cherry Bullet、Rocket Punch 和 Weeekly。正式站 v216 中，三个首页的团照入口在照片刚出现时第一次点击均未打开，待页面交互就绪后再点击才出现原图。

首屏 HTML 现在直接提供原件链接。页面交互就绪后，普通点击、Enter 或空格打开原有原图弹窗，Esc 返回触发入口。修饰键点击沿用浏览器的链接操作。四张首页 WebP 预览继续按原优先级显示。

| 团体 | 从首页 HTML 直接打开原图，修改前 → 修改后 | 原件 |
| --- | --- | --- |
| Cherry Bullet | 0 → 1 个有效链接 | `/artist/cherrybullet/official/group-fashion-house.jpg` |
| Rocket Punch | 0 → 1 个有效链接 | `/artist/rocketpunch/official-boom/boom-1-group-original.jpg` |
| Weeekly | 0 → 1 个有效链接 | `/artist/weeekly/official/group-1.jpg` |

以相同项目快照渲染首页，逐一比对初始 HTML 的链接与原件地址。三套静态审阅包的路由转换均保持这些地址。TypeScript 检查通过，51 团图片路由、共用组件、弹窗及三个静态审阅包专项共 257 项通过。正式站的首次点击和返回由本次整合发布实测。

## 七团共用首页

IVE、ILLIT、MADEIN、PURPLE KISS、QWER、RESCENE 和 tripleS 的首页共用团照组件。IVE 的《LOVE DIVE》学院概念照和 2022 年 STARSHIP 官网档案照各有一个独立入口。其余六团各有一个团照入口。八处均沿用此前弹窗的原件，现可由首屏 HTML 直接访问。逐条核对了图片文件、静态链接以及弹窗接收的地址，图片、组件及弹窗专项 221 项通过。
