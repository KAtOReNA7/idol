# 主站嵌入、退出与图片预览

每个根调用 `mountArtist({root,module,route,helpers,scheduler,onActivation,onIdentityError,onNavigate})`，取得 `{id,artist,scope,ready,destroy}`。`ready` 只在仍归本句柄时返回 `mounted`；晚到或被取代返回 `stale`。当前实例的 render / afterRender 异常回滚自己的DOM与资源并拒绝ready；已经失活的晚到异常不再覆盖新页。主站只销自己的句柄，不能在旧异步catch里调用全局销毁来清新页。

同根采用 **latest invocation wins**。新句柄先登记，再销旧实例；退出/清理回调中再次请求挂载，其请求较晚，因此新内层获胜，外层预约会被销毁并返回stale。独立的实际DOM归属表确保旧内容被清理，而尚未提交的新渲染失败不遗留已死旧页；旧句柄重复destroy也不会抹新页面。不同根各自拥有句柄、样式、observer、dialog和事件。

afterRender得到受所有权约束的root facade：仍支持旧 `#local-id` 查询，但实例失活后不能query/write/append/replace新根、修改新dataset/style/classList或添加新根监听。使用scope管理资源：

- `scope.on(target,type,fn,options)` 返回幂等off；手动off立即释放清理引用。
- `scope.own(node)` 管理本实例新增style、link、按钮或其他节点。
- `scope.ownObserver(observer)` 管理disconnect。
- `scope.trackDialog(dialog)` 只管理该具体dialog；不用全局dialog选择器。
- `scope.owns(node)` / `scope.release(node)` 可检查或显式结束本实例所有权。
- `scope.setTimeout/setInterval/requestAnimationFrame` 的任务在退出时取消，已排队旧回调仍检查实例归属。
- `scope.guardAsync(promise,commit)` 提供scope作第二参数；异步回调内部再次await后，用 `scope.commit(()=>同步提交)` 或受保护root facade检查最后提交。任意第三方直接操作document或捕获的新页DOM不属于这个安全契约，不能把全局清理函数作为本页cleanup。

退出后调用own/ownObserver/trackDialog的新对象会立即释放，包括实际await晚到新建的样式、observer和已打开dialog；已经属于其他scope的对象不会被旧scope关闭、移除或disconnect。相同对象有意转交新scope后，旧清理按对象所有权跳过。cleanup异常被记录为 `scope.cleanupErrors`，其余清理继续，重复destroy无额外作用。

`helpers.navigate(href,{reason})` 是每次mount独立注入的同团导航请求，不写global location。`onNavigate(request)` 由主站提交，收到完整group上下文、原始/目标query与信号；筛选走同一入口。内部普通左键链接由共享身份代理先核身份后接管，`onActivation` 已preventDefault时不重复导航；新窗口/修饰键不拦。未提供onNavigate则返回unhandled，组件不偷偷写浏览器地址；主站必须提供自己的回调。失活后的helper调用返回stale，跨团或无效实体返回invalid。clearTimeout/clearInterval同样只取消本scope登记的token，旧scope不能取消新scope任务。

媒体默认上下文在mount中绑定：work详情为detail、首页为feature、其他为card；各团显式context优先。详情当前work.image的真实模型若有尺寸和可用源，安装 `button[data-action="media-preview"]`。按钮插在现有链接外，并带精确data-work-key。卡片级文案为“查看缩略预览”，质量决策从真实asset再次读取，不能通过DOM data属性、点击、图片载入或1280像素原尺寸升级。

预览框是本根内的 `dialog[data-media-viewer-owner]`，当前作品上下文继续交给共享身份代理。关闭按钮为 `button[data-action="media-preview-close"]`，图片为 `img[data-media-context="enlargement"]`。卡片级最大320px并受自然尺寸限制，无放大、全屏或原尺寸升级控件；其他视频图也不超过原像素。发行封面保留release-cover用途，不冒充视频。完整contain、auto比例、禁止transform和自然像素cap随框内图片一起输出，边框盒子限制在视口内。

关闭、Escape、取消返回当前仍在本根的打开按钮；Tab维持在唯一关闭控件。退出/被替换关闭自身dialog时不还焦点给旧页面，不关闭另一个根或新实例的框。每次关闭即时移除临时监听与dialog记录。error显式display:none!important、aria-hidden与简洁失败状态；load恢复display:block!important并移除自有失败状态，不修改quality/cap。关闭或失活后旧图load/error不会复活旧框或更改新框。

实测边界：`tests/runtime-ownership.test.mjs` 使用原生EventTarget与明确元素/资源契约，覆盖重入、双根、异常、late、焦点和真实widget操作；`tests/audit-runtime-embed.mjs` 实际调用十五团模块render/afterRender各两次，并对261个有图视频详情逐个从实际输出取得图片源，再构建并操作真实预览组件，输出 `qa/runtime-embed-fifteen.json`。这不是HTML/CSS布局或浏览器点击模拟，不能证明320/390/1440截图、人脸、水印裁切或真实键盘焦点通过；最终浏览器终验仍由dot完成。
