# 视频配图展示约束

`resolveMediaPresentation(asset, {context, mediaRole})` 是唯一展示策略；`helpers.image(asset, alt, options)` 使用同一结果输出实际 CSS 和操作属性。`context` 为 `card`、`feature`、`detail`、`enlargement`；首页/hero映射feature，lightbox/modal映射enlargement，缺省或未知context按card安全处理。`withMediaContext(helpers, context)` 为挂载渲染绑定默认值，局部显式context优先。

31张已判定 `qualityLevel: card` 的图保持原等级，包括26张1280×720。卡片及首页推荐最多240px，详情及查看窗口最多320px，并同时受原下载自然尺寸限制。返回 `recommendedUse: bounded-video-preview`、`operation: bounded-preview`、`allowPrimaryVisual: false`、`allowEnlargement: false`，动作名称为“查看缩略预览”。这里的查看是有界缩略图查看，不提供原图大小、缩放至大视觉或高清之类操作。图缺少实际尺寸时不渲染为可扩大图片。

明确合格的managed primary视频图保留自然像素上限。既有未评级视频图可显式传 `mediaRole: video-preview` 来获得完整contain和自然像素约束；不会因为其尺寸或既有使用状态新增primary等级。未传role的旧成员照、封面等保持原展示规则。所有策略只决定CSS，不重新编码、裁切、放大、去水印或改资产字段。

图片实际输出 `max-width/max-height`、`width:min(100%,...)`、`height:auto`、`object-fit:contain`、`transform:none` 的inline important约束；card另有居中留白。操作适配层可以读取 `data-media-context`、`data-media-operation`、`data-media-max-width/height`、`data-natural-width/height`、`data-recommended-use`、`data-allow-enlargement`、`data-allow-primary-visual` 与 `data-media-action-label`。查看器必须再次按真实work.image运行 `resolveMediaPresentation(asset,{context:enlargement,mediaRole:video-preview})` 或 `resolveMediaViewer`，不应信任被修改的DOM标记升级质量。

测试覆盖31张实际card资产的四种输出路径、26张高像素card不升级、小图不超过原像素、未知尺寸安全退回、context绑定、操作语义与旧未评级视频角色；这些是Node实际HTML/CSS输出及纯策略检查，不是浏览器截图或计算布局验收。主站浏览器仍需检查卡片、首页、详情、查看窗口、窄屏、失败及晚加载。
