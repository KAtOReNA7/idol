# 15团动作身份与导航接入

`attachActionIdentities({root,artist,route,scope,onValid,onInvalid,navigate})` 在当前root委托click/submit/change。每次激活重新计算真实实体身份，验证原stamp，动态插入的图片预览/关闭按钮也在实际激活时处理。主站从 `onValid({event,element,identity})` 取操作上下文，不按数组位置、标题或图片推导。

作品身份包括 groupId、entityId或candidateKey、workId、videoId、videoType、slotType、parentWorkIds、originalVideoTypes、videoSourceUrl、returnTo。`videoType` 是公开输入中的原值；`slotType` 独立为MV/STAGE/RELEASE。stage保留全部已有关联父ID，不能把STAGE写进原始videoType。`shared/video-identity-baseline.js` 是输入171条真实作品原类型的只读字面索引，排除5条原输入placeholder；不是新建生产对象。工作模型自身原类型与输入冲突时拒绝动作。

两项原有extra舞台候选（i-dle的TOMBOY Music Bank、NewJeans的Super Shy SBS）没有MV父关系，继续workId:null、videoType:null，不借其他版本；NewJeans SBS原记录没有YouTube videoId，继续null，用原SBS公开URL存于videoSourceUrl。candidateKey与实际source URL仍可精确定位，生产ID始终保持空。

列表进入详情时，`decorateNavigationLinks` 为同团详情href加入完整 `returnTo`，并保留未知重复query和空值；详情Back只恢复有效同团hash路径，主导航入口不被误改成Back。`returnRoute`/`returnQuery` 仍表示当前页面完整状态，`returnTo` 表示来源列表/入口。相邻成员或对应版本沿用有效来源，不不断嵌套returnTo。非法外部、跨团或冲突的多个returnTo回落到本团列表，不跳转外部。

`createHashNavigation({window,onNavigate})` 是不持久化的宿主桥：同时观察hashchange、popstate，对同一次相同hash去重；`sync(reason,{force:true})` 可明确重试，`destroy()` 幂等并只移除自身两个监听。宿主仍使用浏览器原生hash历史栈，组件不新建保存系统。

嵌入时提供 `mountArtist({...,onNavigate(request)})`。mount给团体render/afterRender注入 `helpers.navigate('#/本团/...')`；团体筛选只请求导航，不直接写全局location。`createScopedNavigation` 在回调前验证当前scope所有权、同团路径和真实成员/作品目标，向宿主给出groupId、href、fromRoute、toRoute、完整queryEntries、identity、returnTo、signal和isCurrent。无onNavigate时返回unhandled而不写global；旧scope返回stale。宿主执行异步流程前后都应检查request.isCurrent()/signal，不提交晚到导航。

未修饰的左键同团内部href也走同一注入桥（先通知完整onActivation，再preventDefault和onNavigate）；Ctrl/Meta/Shift/Alt、非左键、target=_blank或download维持原生语义。onActivation已经取消的事件不会再次导航。隔离app显式回调写它自己window.location.hash；主站可在回调中先经过其现有离开保护与路由，不必换全局导航文件。直接使用attachActionIdentities的非mount调用若不传navigate，保留原生链接行为。

隔离示范宿主 `createArtistHost` 接入该桥，拥有自己的mount句柄/样式/回调；scope以当前root的宿主所有权为界，清理回调重入期间旧监听即刻失效。旧宿主销毁、异常catch和晚到模块不会清除新页面。主站可直接用mountArtist及自己的导航守卫；若使用示范host嵌入，传 `manageDocumentTitle:false` 由主站决定标题。返回焦点按精确href＋sourceId＋data-focus-key或同目标出现序号恢复，不把同URL的第二个来源链接误落到第一个。

宿主图片error只处理当前host根内图片；后续有效load清除自身media-failed和过期失败aria，恢复原标签/alt语义。若当前图片仍未完成或naturalWidth为0，晚到load不能清除新失败状态；source/alt已经变化时不恢复旧照片标签，调用方后加的标签也不被覆盖。不重新下载、不新增图片重试或保存系统。

测试：`node --test tests/navigation-integration.test.mjs tests/identity.test.mjs`。前者遍历15真实模块中478作品库动作、312影像详情实际生成的官方动作，并核原始输入171类型和143精确父视频pair；以原生EventTarget进行激活、篡改拒绝、动态预览、宿主异常/重入/晚到和历史事件协议测试。可设置 `SOL_NAVIGATION_REPORT=qa/navigation-identity-audit.json` 输出实际312/478动作证据。

这些是源码/序列化控件及原生事件契约检查，不是浏览器DOM、浏览器Back/Forward或截图验收；真实视觉、键盘焦点和主站导航守卫最终由dot验证。没有生产写入、评分保存、飞书或私人记录操作。
