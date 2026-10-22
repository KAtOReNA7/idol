import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArtistTimelineHost,ArtistTimelineHostProvider,type TimelineNavigationRequest} from '../../../components/artist-timeline-host';
import {syntheticCatalog} from './synthetic-catalog';
import {syntheticGroups,syntheticTimelines} from './synthetic-events';

/** Explicit host callback demonstration, not the missing site's save/navigation implementation. */
function Preview(){
 const [groupId,setGroupId]=useState('recFixtureGroupA');
 const [mode,setMode]=useState('ready');
 const [styleReady,setStyleReady]=useState(true);
 const [guard,setGuard]=useState('clean');
 const [logs,setLogs]=useState<string[]>([]);
 const [destination,setDestination]=useState<TimelineNavigationRequest|null>(null);
 const [modal,setModal]=useState(false);
 const [generation,setGeneration]=useState(0);
 const log=(value:string)=>setLogs(current=>[value,...current].slice(0,20));
 useEffect(()=>{
  if(!/^\/artists\/fixture-[abc]$/.test(location.pathname)){history.replaceState(history.state,'','/artists/fixture-a?section=updates');window.dispatchEvent(new Event('artist-location-change'));}
  const back=()=>{const group=syntheticGroups.find(item=>location.pathname==='/artists/'+item.slug);if(group)setGroupId(group.groupId);setDestination(null);setGeneration(current=>current+1);};
  window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);
 },[]);
 function changeGroup(next:string){const group=syntheticGroups.find(item=>item.groupId===next)!;history.pushState({},'','/artists/'+group.slug+'?section=updates');window.dispatchEvent(new Event('artist-location-change'));setGroupId(next);setMode('ready');setDestination(null);}

 let input:unknown=syntheticTimelines[groupId];
 if(mode==='invalid')input={schemaVersion:99};
 if(mode==='cross'&&groupId==='recFixtureGroupA')input={...syntheticTimelines[groupId],events:[...syntheticTimelines[groupId].events,{...syntheticTimelines[groupId].events[0],id:'fixture-cross-group',title:'合成测试：跨团身份不可导航',memberIds:['recFixtureMemberC'],workIds:['recFixtureWorkC']}]};
 if(mode==='hold')input={...syntheticTimelines[groupId],events:syntheticTimelines[groupId].events.filter(event=>event.reviewStatus==='hold')};
 const catalog=mode==='partial'?{...syntheticCatalog,members:syntheticCatalog.members.filter(member=>member.id!=='recFixtureFormerA'),works:syntheticCatalog.works.filter(work=>work.id!=='recFixtureWorkA2')}:syntheticCatalog;
 function navigate(request:TimelineNavigationRequest,beforeLeave:()=>boolean){
  if(guard!=='clean'){log(`宿主模拟守卫拒绝：${guard}`);return;}
  if(!beforeLeave()){log('尚未满足真实焦点捕获门槛；未模拟离页');return;}
  log(`已批准的合成回调：${JSON.stringify(request)}`);
  history.pushState({...history.state,fixtureDestination:{kind:request.kind,targetId:request.targetId}},'',location.href);
  setDestination(request);
 }
 return <main>
  <h1>时间轴真实宿主 · 合成工程验证</h1>
  <p>仅本地 React / CSS / 身份适配 / 焦点 hook；不是真实资料。不连接生产 API，也不替代全站 dirty / 保存 / journey 守卫。</p>
  <div className="fixture-tools" aria-label="宿主场景">
   <label>合成团<select aria-label="合成团" value={groupId} onChange={event=>changeGroup(event.target.value)}>{syntheticGroups.map(group=><option key={group.groupId} value={group.groupId}>{group.slug}</option>)}</select></label>
   <label>资料状态<select aria-label="资料状态" value={mode} onChange={event=>setMode(event.target.value)}>{[['ready','事件'],['loading','正在读取'],['error','读取失败'],['partial','部分身份缺失'],['cross','跨团身份拒绝导航'],['hold','全部待核'],['invalid','非法 schema']].map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label><input type="checkbox" checked={styleReady} onChange={event=>setStyleReady(event.target.checked)}/>样式就绪门</label>
   <label>宿主模拟守卫<select aria-label="宿主模拟守卫" value={guard} onChange={event=>setGuard(event.target.value)}><option value="clean">允许</option><option value="dirty">未保存：取消离开</option><option value="uncertain">保存状态不确定：取消离开</option></select></label>
   <button type="button" onClick={()=>setModal(true)}>打开模拟 modal</button>
   <button type="button" onClick={()=>{setGeneration(value=>value+1);log('重挂实际宿主，检查同一 history entry 的焦点恢复');}}>重挂宿主</button>
  </div>
  <p className="fixture-state">当前 {groupId}；状态 {mode}；styleReady={String(styleReady)}；guard={guard}。A→B→A 可检查输入隔离；A 有多成员、多作品、历史身份、关联子事件与日期精度。</p>
  {destination?<section className="fixture-state" aria-label="模拟目标页"><h2>合成 {destination.kind} 目标</h2><p>{destination.targetId} · eventId={destination.eventId}</p><p>实际目标页与全局保存守卫没有交付；本面板只演示宿主已批准回调和真实返回 hook。</p><button type="button" onClick={()=>history.back()}>浏览器 Back 返回时间轴</button></section>:
   <ArtistTimelineHostProvider value={{input,groups:syntheticGroups,catalog,loading:mode==='loading',error:mode==='error'?'合成读取失败':'',styleReady,blocked:guard!=='clean',onRetry:()=>{setMode('ready');log('重试回调已执行');},navigate}}>
    <ArtistTimelineHost key={generation} groupId={groupId} catalog={catalog} background={<p>合成旧资料背景：保留来源范围，不从旧文字推断事件日期。</p>}/>
   </ArtistTimelineHostProvider>}
  <details><summary>合成宿主回调日志</summary><pre className="fixture-logs" aria-live="polite">{logs.join('\n')||'尚无回调。'}</pre></details>
  {modal&&<div role="dialog" aria-modal="true" aria-label="合成 modal" style={{position:'fixed',inset:'20%',padding:20,background:'white',border:'2px solid',zIndex:20}}><h2>模拟 modal 已打开</h2><p>时间轴 hook 不应从此弹窗抢焦点。</p><button autoFocus type="button" onClick={()=>setModal(false)}>关闭 modal</button></div>}
  <p>验证尺寸：320、390、1280 px。Tab 聚焦来源 summary 后 Enter 展开；切换分类、重要性与顺序；展开关联子事件后分别点击成员／作品，返回检查准确按钮。样式未就绪、modal 或模拟守卫阻塞时应保留当前操作焦点。</p>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
