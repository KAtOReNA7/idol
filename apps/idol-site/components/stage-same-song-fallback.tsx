import type {StageVideo} from '@/lib/idol/types';
import {validSameSongFallback} from '@/lib/idol/stage-source';

export function StageSameSongFallback({stage}:{stage:StageVideo}){
 if(!validSameSongFallback(stage))return null;
 const fallback=stage.sameSongFallback!;
 return <div className="stage-version-note" aria-label="同曲后备说明" data-stage-same-song-fallback={fallback.targetWorkId}>
  <p><strong>同曲后备{fallback.completeness==='excerpt'?' · 节选':''}{fallback.version==='different'?' · 不同版本':fallback.version==='unconfirmed'?' · 版本未核':''}</strong></p>
  <p>{fallback.differences.join('；')}</p>
  <p>{fallback.version==='unconfirmed'?'当前表演与目标作品是否使用同一录音尚未核实，当前评分仅对应这支视频。':'原目标版本的完整演出尚未取得，当前评分仅对应这支视频。'}</p>
 </div>;
}
