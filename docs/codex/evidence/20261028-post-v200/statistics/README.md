# v200后统计与事实日期研究

基线 `c023153`，研究日期2026-10-28。此目录只提供证据与提案；本研究代理未修改应用、提交Git、部署、使用Chrome或读写私人数据。

`research.json`覆盖10项未知统计、7项事实日期和tripleS独立差额，共18项。原VCHA品牌范围、Circle Album/Retail区别及“未发现不等于真实0”保持。

可采用的两项数量提案：

- `geenius-retail-proposal.json`：Geenius《Spoiler Book (WITHVUU)》Circle Retail 2026-05-18单日217。只标已核单日零售下界，全渠道累计仍未知。原记录保留。观测见`geenius-retail-observations.json`；6月榜、4周榜及13个补充日榜没有目标行，不代表0，所有重叠期间都不另加。
- `triples-weekly-proposal.json`：4条官方Album周榜共5,847，与对应版本既有月行/两项Cosmo年替换不重叠。来源覆盖下界2,092,239可增至2,098,086；保存的2,458,789汇总差额剩360,703，仍未完全解释。原36月行与两年替换保留。只用期内Album_CNT，不用Total_CNT，不混Retail、Hanteo或日本销量。

`udtt-jessica-source-proposal.json`提供2025-04-30本人采访，比原5/8来源早，能补公开参与说明；实际入团日期、临时/永久性质仍未证。7项canonical hold全部保持。

UDTT的社区首周132没有Hanteo原链；Ktown4u两SKU页面Sales16与3只作快照研究。School Rush旧记录17与当前16的变动原因未知，商品计数字段与已出货净件数定义未完全核实，**不建议采用19为销量下界**。详见`udtt-merchant-candidate-hold.json`。Ktown4u直接HTTP虽200，但实为accessRestriction页，已停止直接路线；没有绕过或探测隐藏接口。

其他未解决项分别需要：原始销量数量、全时期一位覆盖、已公布计划的实际生效证明。VVUP官方VVON实体改期2026-10-29，本轮10/28不能补未来销量。X403、Fandom402、Circle个别连接异常与缺乏证据分别留档；Soridata下载/验证码路线未重试。

`verify-statistics-evidence.py`离线复核原始行、期间、数值、同版去重及提案算术；34项通过，见`evidence-validation.json`。这是证据一致性检查，不能替代父代理的应用测试或线上部署验证。全部公开来源可能继续变化，快照与历史记录不能静默互相覆盖。
