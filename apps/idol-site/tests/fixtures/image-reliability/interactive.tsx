import {StrictMode,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ReliableImage,ImageRecoveryProvider,ImageRecoveryControls,ImageRetryControl,type ReliableImageState} from '../../../components/reliable-image';
import {PhotoLightbox} from '../../../components/photo-lightbox';

const sources:Record<string,string|null>={success:'/image-fixture/good.svg',missing:null,error:'/image-fixture/error.svg',recover:'/image-fixture/recover.svg',slow:'/image-fixture/slow.svg',api:'/api/media?table=ratings&record=recFixtureImageRating&index=0'};
function ImageFixture(){
 const [scenario,setScenario]=useState('success');const [identity,setIdentity]=useState('A');const [attempt,setAttempt]=useState(0);
 const [snapshot,setSnapshot]=useState<ReliableImageState|null>(null);const [parentClicks,setParentClicks]=useState(0);
 const [draft,setDraft]=useState('合成编辑草稿：切换图片不能重置');const [mounted,setMounted]=useState(true);
 const [modal,setModal]=useState<{src:string;label:string}|null>(null);const [callbackVersion,setCallbackVersion]=useState(0);
 const src=sources[scenario];
 const props={src,identityKey:`fixture-member:${identity}`,alt:`合成成员 ${identity} 完整图片`,attemptKey:attempt,width:600,height:400,style:{objectFit:'contain' as const},onStateChange:setSnapshot};
 return <main>
  <h1>统一图片 · 实际 React 合成验证</h1><p>开发构建的 StrictMode；只访问 localhost。图片是固定尺寸合成 SVG，不是真实人物照片。不是性能报告或全站 Editor 验收。</p>
  <div className="fixture-tools"><label>图片状态<select aria-label="图片状态" value={scenario} onChange={event=>setScenario(event.target.value)}>{[['success','成功'],['missing','缺失'],['error','永久错误'],['recover','同 URL 首次失败后恢复'],['slow','延迟 1200ms'],['api','既有 ratings retry 协议']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   <button type="button" onClick={()=>setIdentity(value=>value==='A'?'B':'A')}>同 src 切换身份 A/B</button>
   <button type="button" onClick={()=>setAttempt(value=>value+1)}>显式新 attempt</button>
   <button type="button" onClick={()=>setMounted(value=>!value)}>{mounted?'卸载图片':'重新挂载图片'}</button>
   <button type="button" onClick={()=>setCallbackVersion(value=>value+1)}>仅重建关闭回调</button>
  </div>
  <label>宿主草稿<input aria-label="宿主草稿" value={draft} onChange={event=>setDraft(event.target.value)}/></label>
  <p data-fixture-score>合成评分 0.0 · 多成员 FIXTURE_A / FIXTURE_B · 父级激活次数 {parentClicks}</p>
  <p className="fixture-state" role="status">{snapshot?`${snapshot.status} · attempt ${snapshot.attempt} · canRetry ${snapshot.canRetry} · ${snapshot.generation}`:'尚未挂载'}</p>
  <ImageRecoveryProvider>
   <section className="fixture-cards" aria-label="父级交互与图片">
    <div className="fixture-card"><h2>button 宿主</h2><button className="fixture-parent" type="button" onClick={()=>setParentClicks(value=>value+1)}>{mounted&&<ReliableImage {...props}/>}</button><ImageRetryControl state={snapshot} label="外置重试当前图片"/></div>
    <div className="fixture-card"><h2>缩略图与大图错误独立</h2><button type="button" onClick={()=>setModal({src:'/image-fixture/full-error.svg',label:'合成完整大图 · 保持当前身份 '+identity})}><ReliableImage src="/image-fixture/good.svg" identityKey="fixture:thumbnail" alt="合成缩略图" width={600} height={400}/></button><p>缩略图成功时，大图仍可单独失败和重试。</p></div>
    <div className="fixture-card"><h2>link 宿主</h2><a href="#fixture-target" onClick={event=>{event.preventDefault();setParentClicks(value=>value+1);}}><ReliableImage src="/image-fixture/error-link.svg" identityKey="fixture:link-image" alt="链接内合成失败图" width={600} height={400}/><span>原父级链接</span></a></div>
   </section>
   <ImageRecoveryControls/>
  </ImageRecoveryProvider>
  <button type="button" onClick={()=>setModal({src:src||'/image-fixture/good.svg',label:'合成当前原图 '+identity})}>打开当前原图</button>
  <p>场景：失败→重试；A 失败→B→A；延迟图切换后旧事件；快速重复重试；卸载后等待；关闭再开；长标题、320/390/桌面；来源完整 contain。</p>
  {modal&&<PhotoLightbox src={modal.src} label={modal.label} onClose={()=>{void callbackVersion;setModal(null);}}/>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><ImageFixture/></StrictMode>);
