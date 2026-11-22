# 团体资料的客户端下载量

KISS OF LIFE 团页直接引用的客户端 JS 静态依赖从 603,261 B 降到 543,177 B，按每个文件分别 gzip 6 计算，减少 60,084 B。48 个 React 团均有下降，中位数为 60,084 B，范围为 56,140–60,085 B。ifeye、izna 和 UDTT 的原生入口分别增加 14 B、10 B 和 222 B。[51 团逐项读数](../evidence/20261123-v258/group-information-client.json)

团体信息组件在生产浏览器构建中只带显示团名、社媒、销量、一位、统计日期和来源所需的字段。某团或指标尚缺新记录时，沿用相应历史行。服务端、原生调用方和调研使用的完整数据仍由原有模块提供。[构建投影](../../../apps/idol-site/build/group-information-display.mjs)

51 团和一个未收录团分别比较了没有目录、空社媒和含无效链接的目录，共 156 次。另用项目快照里的 51 条实际团体记录逐一比较，并用旧数据、部分完成及缺值组合比较 12 次。219 次生成的 HTML 逐字相同，团体 ID 也一致。专项测试 20/20，TypeScript 通过。[回归用例](../../../apps/idol-site/tests/group-information-display.test.mjs)

两次生产构建使用同一 Windows 工作树、同一份锁文件和 `727e6490`，Node 为 24.16.0，npm 为 11.13.0。第二次仅启用团体资料投影。从各团路由直接引用的客户端组件出发，按构建清单去重递归统计静态 JS。图片、HTML、CSS、动态加载模块、缓存命中和浏览器耗时另行计算。[测量条件与模块](../evidence/20261123-v258/group-information-client.json)
