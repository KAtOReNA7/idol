# BABYMONSTER《BILLIONAIRE》播放故障

正式作品 `rec28ldfRTrLku` 使用 2025 年 2 月 7 日韩国发行的 EXCLUSIVE PERFORMANCE VIDEO。2025 年 2 月 14 日另有一支舞蹈版。用户的 Chrome 在 YouTube 站内播放器及 YouTube 原站都遇到了验证页。团体 Weverse 页面也嵌入同一 YouTube 视频。[YG 当日公告](https://ygfamily.com/cn/news/report/6728) · [两版本的公告](https://www.ygfamily.com/en/news/report/6722) · [Weverse](https://weverse.io/babymonster/media/0-155528344)

B 站上传者 pcyxjy 在北京时间 2025 年 2 月 6 日 23:14 发布本片，距离韩国首发约 14 分钟。平台将该投稿标为转载，第一分 P 的 CID 为 `28248899991`，时长 164 秒。在当前 Chrome 的 B 站页面，播放时间从 00:41 走到 00:55。团体自己的 B 站账号搜索同曲只列出 01:17 的预告。[播放页](https://www.bilibili.com/video/BV1TGNWeDEdv/?p=1&cid=28248899991) · [团体投稿](https://space.bilibili.com/3493127232948989/search?keyword=BILLIONAIRE)

作品页按精确作品和官方视频 ID 提供两个播放来源。舞台页只在该完整原片复用为舞台时提供同一入口。B 站站内与外链都指定 BV、CID 和分 P。评分沿用原有来源身份。

## v206 正式回读及画质问题

v206 正式站中，B 站播放器从 00:23 走到 00:49。随后在 Codex 自带浏览器复现用户反馈：B 站实际只解码 640 × 294，并提示前往 B 站观看更高清。切换至标准 YouTube 域名的本地候选也会遇到真人验证。v206 的 Windows／Linux 完整套件各新增一个隔离渲染失败：旧用例提取了新版 JSX，缺少其中新增的变量。该缺口在下一版修正。[v206 部署与清晰度](../evidence/20261121-billionaire-playback/v206.json) · [两平台测试](../evidence/20261121-billionaire-playback/v206-tests.json)

## 单一站内播放器

RUTUBE 的公开投稿标明本作完整题名，上传人为 MARI DOBREV。平台提供公开嵌入地址。在 Codex 自带浏览器使用其官方静音参数，实播从 0.22 秒走到 25.62 秒，解码 1920 × 884，片长约 163.5 秒，未要求登录。该作品采用一个站内播放器，署名标明转载。切换到同一作品的另一视频或舞台片段时，匹配须重新成立。[公开投稿](https://rutube.ru/video/9d692403740a2ae5e84dbd5a8ec167d0/) · [平台嵌入及清晰度参数](https://rutube.ru/info/embed/)
