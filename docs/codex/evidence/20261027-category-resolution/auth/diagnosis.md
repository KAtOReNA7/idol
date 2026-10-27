# 登录入口与会话诊断（2026-10-27）

## 已确认

- 应用公共浏览与本站 ChatGPT 登录是两个状态；公共目录成功不能证明私人会话存在。
- `app/chatgpt-auth.ts` 仅接收 Sites 注入的可信身份头；ID 或 email 缺失时返回匿名。
- `lib/idol/http.ts` 对匿名返回 `401 AUTH_REQUIRED`，对非所有者返回 `403 OWNER_ONLY`。`/api/status` 在存储读取之前执行此校验。
- 浏览器、工具和命令行各自的请求会话不能相互替代。根任务在同一 Chrome 的新标签页恢复调试连接后，正式站 `/api/status` 返回 200、`source=native`、`mode=live-ready`。因此未修改服务端鉴权。
- 本记录不包含身份值、令牌、私人评分或个人记录。

## 最小修复

1. 正常只读侧栏增加“登录编辑”原生链接，沿用现有文字按钮样式。
2. 管理页使用相同链接组件，统一 `target="_top"`。
3. 链接挂载及激活时保留实际路径、查询参数、片段；支持 SPA 导航及管理子路径。登录仍由 Sites 的 `/signin-with-chatgpt` 完成，不使用 fetch、路由预取或自建回调。

未改 `app/page.tsx` 的状态请求逻辑，未添加401自动跳转，以免在编辑期间自动导航造成未保存输入丢失。正常登录入口已补；已编辑会话过期时仍使用现有错误文案。

## 验证与边界

- 纯内存加载真实鉴权/状态路由代码，六场景通过：匿名、仅ID、仅邮箱、仅Bearer均401且未读取存储；非所有者双头403且未读取存储；所有者双头200并进入存储。未对线上发送伪造身份头。
- `node --test tests/sign-in-entry.test.cjs`：4项通过，覆盖原生顶层链接、回跳位置、SPA/管理子路径、只读入口及管理门禁保持。
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`：通过。
- 本子任务未执行真实登录/退出、私人保存、正式部署或浏览器视觉验收；这些不由单元测试替代。
- 服务端鉴权、owner权限、存储、个人记录与团体视觉样式文件未改。

对应源文件：`components/site-sign-in-link.tsx`、`components/music-shell.tsx`、`app/manage/layout.tsx`。
