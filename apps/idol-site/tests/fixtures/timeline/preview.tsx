import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArtistTimeline} from '../../../components/artist-timeline';
import baseline from './synthetic-baseline.json';
import context from './synthetic-registry.json';
import type {ArtistTimeline as TimelineDocument, TimelineEvent, TimelineFilters} from '../../../lib/idol/timeline/types';

const template = baseline.events[0] as TimelineEvent;
const input: TimelineDocument = {
  ...baseline as TimelineDocument,
  events: [
    {...template, title: '合成测试：' + '长标题换行与日期语义'.repeat(12)},
    {...template, id: 'synthetic-year', eventDate: {value: '2024', precision: 'year'}, title: '合成测试：年精度事件'},
    {...template, id: 'synthetic-release', eventType: 'release', eventDate: {value: '2024-03', precision: 'month'}, title: '合成测试：月精度发行', releaseKey: 'synthetic-release-key', importance: 'supporting'},
    {...template, id: 'synthetic-plan', eventDate: null, eventType: 'release', plannedDate: {value: '2020-01-01', precision: 'day'}, status: 'postponed', title: '合成测试：日期已过仍为延期'},
    {...template, id: 'synthetic-unknown', eventDate: null, eventType: 'agency_change', title: '合成测试：公司变化生效日未明'},
    {...template, id: 'synthetic-hold', title: 'NEVER_RENDER_HELD_ASSERTION', reviewStatus: 'hold', holdReasons: ['合成待核原因']},
  ],
};

function Preview() {
  const [mode, setMode] = useState('events');
  const [filters, setFilters] = useState<TimelineFilters>({type: 'all', importance: 'major', order: 'recent'});
  const [destination, setDestination] = useState('尚未跳转');
  return <main style={{maxWidth: 880, margin: '0 auto', padding: 12}}>
    <h1>时间轴 · 独立合成测试</h1><p>仅用于工程验证；不是任何真实团体事件或迁移结果。所有操作停留本页。</p>
    <div aria-label="合成场景">{[['events','事件场景'], ['empty','空态场景'], ['loading','加载场景'], ['error','错误场景'], ['invalid','无效场景']].map(([key,label]) => <button type="button" key={key} aria-pressed={mode===key} onClick={()=>setMode(key)}>{label}</button>)}</div>
    <p role="status" aria-label="合成导航结果">{destination}</p>
    <ArtistTimeline input={mode==='invalid'?{}:mode==='empty'?{...input,events:[]}:input} context={context}
      loading={mode==='loading'} error={mode==='error'?'合成读取失败':''}
      filters={filters} onFiltersChange={setFilters}
      onMember={(id,eventId)=>setDestination(`成员回调 ${id} ${eventId}`)}
      onWork={(id,eventId)=>setDestination(`作品回调 ${id} ${eventId}`)}
      memberLabels={{recSyntheticMember:'合成成员'}} workLabels={{recSyntheticWork:'合成作品'}}
      background={<p>合成旧资料背景保留区。</p>}/>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
