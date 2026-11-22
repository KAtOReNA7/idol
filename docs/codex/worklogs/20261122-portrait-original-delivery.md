# 《Nobody Knows》四张发行原图按需投递

KISS OF LIFE《Nobody Knows》的四张成员卡仍从本站静态目录加载 WebP，合计 131,038 字节。打开 BELLE、HANEUL、JULIE 或 NATTY 的原图时，浏览器使用原来的本站地址。Worker 从已公开提交 `56648ecd` 读取对应的《Born to Be XX》完整 JPG。四张原图合计 13,217,788 字节。[作品与人物绑定](../../../apps/idol-site/data/mv-recognition-editions.json) · [四张原件及四张本地预览](../../../apps/idol-site/data/kissoflife-portrait-asset-delivery.json)

发布前分别从既有正式站和固定 GitHub 地址匿名取回四张 JPG，八次请求均返回 HTTP 200 和 `image/jpeg`，与本地原图逐字节相同。在本地直接调用生产 Worker 的原件处理函数，使用真实上游，四张图的 GET、HEAD 均为 200。上游仅收到图片类型和编码请求头，查询串退出本站请求边界，本地 WebP 仍走静态路径。既有 5,418 条固定原件、此前两批素材和 UDTT 受限原件在各自清单内单独验证。[匿名请求和 Worker 实测](../evidence/20261122-v239/kissoflife-original-delivery.json)
