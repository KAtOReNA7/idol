# 真实 React 宿主合成验证

只在 tests 范围内提供明确缺失的公开资料形状。没有生产 JSON、图像、私人快照、凭证或 API。

## 命令

使用项目已有依赖；不执行安装。若验证依赖由外部只读 runtime 提供，先设置 `NODE_PATH` 指向该目录。

```bash
node --test tests/timeline-host-matrix.test.cjs
node tests/timeline-host-preview.cjs /absolute/path/preview
python3 tests/fixtures/timeline-host/serve.py /absolute/path/preview --port 4173
# 可选：仅使用已有 Playwright，不安装依赖；缺运行时退出 2（未执行）
node tests/timeline-host-browser.cjs /absolute/path/preview /absolute/path/browser-results
```

打开 `http://127.0.0.1:4173/`。Python 仅绑定 localhost，给 `/artists/fixture-*` 提供静态页面 fallback；POST 拒绝，不实现任何资料/保存 API。构建后附 `preview.js.metafile.json` 与 `preview.js.aliases.json`，用于核查实际导入源码及精确替代清单。

## 可操作场景

- 三个 recFixture 合成团：A 具备现有／历史成员、多成员多作品同事件、关联子事件、显式发行关联、年／月精度、未知生效日、延期／取消和待核事件；B 提供切换隔离；C 是合法空态。
- 原生分类／重要性／顺序按钮，来源 summary 可通过 Tab + Enter 展开。
- 下拉选择 loading、错误后重试、部分身份缺失、跨团身份拒绝导航、全部待核、非法 schema。
- styleReady 门、模拟 dirty／uncertain 阻塞、可见 modal、多个目标分别回调、模拟离页和浏览器 Back 返回，以及重挂宿主。
- 手工验证 320、390、1280 px 的长中文、长 URL、多来源、44px 控件、焦点可见及横向溢出。

## 准确范围

SSR 矩阵实际 import 51 个 Page、13 个旧团组件（XG／aespa 双分支）和 37 个真实 design，并通过显式只读 Provider 分别渲染 overview／updates。Catalog 的公开 groupId 仅用于识别真实宿主；所有成员／作品是 recFixture 合成身份，评分为 null、备注和观看状态为空。三个交互团本身也使用 recFixture groupId。

`ALIAS_MANIFEST.json` 逐项列出缺失 data JSON、姓名 helper 和有限 routeUrl 的替代形状与未验证能力。原生产 import 不改；替代仅由本 fixture 的 esbuild 插件启用。真实 React、现有宿主组件、timeline 组件、样式和焦点／滚动 hook 没有被 mock。

journey 缺口仅替代 `artist-preview.ts` 精确导入的 routeUrl 字符串格式化；不代表全局导航授权。页面中的 dirty／uncertain、目标页和导航批准是清楚标示的宿主回调演示，不实现或验证缺失的编辑器、私人 API 或保存守卫。真实照片范围、字体和生产资料未验证。完整应用 tsc／build、全站浏览器导航与旧评分播放器回归仍需 dot 的完整环境。

当前会话浏览器实测未执行：已有 primary runtime Playwright 已实际调用，但 Chromium headless shell 可执行文件缺失；可选 runner 已实际返回退出码 2，而不是通过。SSR 与静态 bundle 不能替代真实浏览器结论。
