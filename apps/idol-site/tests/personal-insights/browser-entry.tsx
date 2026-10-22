/** TEST ONLY. The input is entirely synthetic and never sent to an API. */
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PersonalInsights} from '../../components/personal-insights/PersonalInsights';
import {catalog, deepFreeze, group, member, rating, stage, work} from './fixtures';
import {runPersonalInsightsBrowserChecks} from './browser-checks';

function makeFixture(size: number) {
  const groups = Array.from({length: 51}, (_, i) => group('test-group-' + i));
  const members = Array.from({length: 30}, (_, i) => member('test-member-' + i));
  const works = Array.from({length: size}, (_, i) => work('test-work-' + i, {
    name: 'TEST ONLY · 合成作品 ' + i,
    song: 'TEST ONLY · 同名歌曲 ' + (i % 4),
    version: i % 2 ? '合成现场版' : '合成原版',
    groupIds: i % 8 === 0 ? [groups[i % 51].id, groups[(i + 1) % 51].id] : [groups[i % 51].id],
    score: i % 5 === 0 ? null : i % 11,
    stage: i % 3 === 0 ? stage() : null,
    stageScore: i % 3 === 0 ? (i + 4) % 11 : null,
    watched: ['已观看', '未观看', '', 'TEST ONLY other'][i % 4],
    ratingIds: ['test-rating-' + i],
  }));
  const ratings = works.map((item, i) => rating('test-rating-' + i, {
    workIds: [item.id],
    memberIds: i % 17 === 0 ? [members[i % 30].id, members[(i + 1) % 30].id] : [members[i % 30].id],
    score: i % 4 === 0 ? null : i % 11,
    stylingScore: i % 6 === 0 ? null : (i + 3) % 11,
  }));
  return deepFreeze(catalog({groups, members, works, ratings}));
}
const fixtureSizes = [0, 100, 1000, 5000] as const;

function Fixture() {
  const [size, setSize] = useState<number>(100);
  const [data, setData] = useState(() => makeFixture(100));
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [checks, setChecks] = useState('not_run');
  function record(kind: string, id: string) {setEvents(items => [kind + ': ' + id, ...items].slice(0, 8));}
  return <main>
    <aside style={{padding: 16, borderBottom: '2px solid #714b79'}}>
      <h1>TEST ONLY · 个人偏好分析</h1>
      <p>全部为合成夹具。模型、SSR、浏览器和性能执行结果以实际报告为准。</p>
      <label>规模 <select value={size} onChange={event => {
        const value = Number(event.target.value); setSize(value); setData(makeFixture(value));
      }}>{fixtureSizes.map(value => <option key={value}>{value}</option>)}</select></label>{' '}
      <label><input type="checkbox" checked={disabled}
        onChange={event => setDisabled(event.target.checked)}/> 禁用模块交互</label>{' '}
      <button type="button" disabled={checks === 'running'} onClick={async () => {
        const container = document.getElementById('browser-check-container');
        if (!container) return;
        setChecks('running');
        try {setChecks(JSON.stringify(await runPersonalInsightsBrowserChecks(container), null, 2));}
        catch (error) {setChecks('failed: ' + String(error));}
      }}>运行真实浏览器断言</button>
      <pre aria-label="浏览器断言结果" style={{whiteSpace: 'pre-wrap'}}>{checks}</pre>
      <p>宿主回调记录：{events.join('；') || '尚无'}</p>
    </aside>
    <PersonalInsights catalog={data} memberLabel={item => item.name} disabled={disabled}
      isStageScoreEligible={() => true}
      onGroup={id => record('group', id)} onMember={id => record('member', id)}
      onWork={id => record('work', id)}/>
    <section aria-label="独立浏览器断言容器" id="browser-check-container"/>
  </main>;
}
const target = document.getElementById('fixture');
if (!target) throw new Error('Missing TEST ONLY fixture root');
createRoot(target).render(<Fixture/>);
