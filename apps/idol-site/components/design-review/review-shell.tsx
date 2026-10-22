'use client';

import {useEffect, useRef, useState} from 'react';
import './review-shell.css';

const widths = [320, 390, 1440, 2560] as const;
const groups = ['unis', 'kep1er', 'triples-v2', 'rescene-v1', 'purplekiss-v1', 'sol15/udtt', 'sol15/vcha'] as const;
const groupLabels: Record<typeof groups[number], string> = {
  unis: 'UNIS',
  kep1er: 'Kep1er',
  'triples-v2': 'tripleS · 候选 v2',
  'rescene-v1': 'RESCENE · 候选 v1',
  'purplekiss-v1': 'PURPLE KISS · 候选 v1',
  'sol15/udtt': 'UDTT · 未验收候选',
  'sol15/vcha': 'VCHA · 未验收候选',
};
const sections = [['overview', '首页'], ['members', '成员'], ['works', '作品'], ['updates', '时间轴']] as const;

export default function DesignReviewShell() {
  const [group, setGroup] = useState<typeof groups[number]>('unis');
  const [width, setWidth] = useState<typeof widths[number]>(390);
  const [section, setSection] = useState<typeof sections[number][0]>('overview');
  const [fit, setFit] = useState(true);
  const [available, setAvailable] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const measure = () => setAvailable(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = fit && available !== null ? Math.min(1, available / width) : 1;
  const source = '/design-review/' + group + (group === 'sol15/udtt'
    ? ({overview:'',members:'#/udtt/members',works:'#/udtt/works',updates:'#/udtt/timeline'} as const)[section]
    : group === 'sol15/vcha'
      ? ({overview:'',members:'#/vcha/members',works:'#/vcha/works',updates:'#/vcha/timeline'} as const)[section]
    : section === 'overview' ? '' : '?section=' + section);
  const height = 1000;
  return <main className="design-review-shell">
    <header><h1>设计审阅 · 隔离预览</h1><p>下方为同一私有网站内的独立设计预览，布局宽度保持所选像素值。候选预览不代表正式页面已切换。</p></header>
    <div className="design-review-toolbar">
      <label>团体<select value={group} onChange={event => {
        const selected = groups.find(value => value === event.target.value);
        if (selected) setGroup(selected);
      }}>{groups.map(value => <option key={value} value={value}>{groupLabels[value]}</option>)}</select></label>
      <label>页面<select value={section} onChange={event => {
        const selected = sections.find(([value]) => value === event.target.value);
        if (selected) setSection(selected[0]);
      }}>{sections.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <fieldset><legend>布局宽度</legend>{widths.map(value => <button key={value} type="button" aria-pressed={width === value} onClick={() => setWidth(value)}>{value}px</button>)}</fieldset>
      <label className="design-review-fit"><input type="checkbox" checked={fit} onChange={event => setFit(event.target.checked)}/>缩放以适应屏幕</label>
      <button type="button" onClick={() => setRevision(value => value + 1)}>重新载入</button>
      <a href={source} target="_blank" rel="noopener noreferrer">单独打开此预览</a>
    </div>
    <p className="design-review-measure" aria-live="polite">页面实际布局：{width} × {height}px；外层显示比例：{Math.round(scale * 100)}%。{fit ? '缩放只影响外层显示。' : '可水平滚动查看完整宽度。'}</p>
    <div className="design-review-frame-host" ref={host}>
      <div className="design-review-frame-space" style={{width: width * scale, height: height * scale}}>
        <iframe key={group + ':' + section + ':' + revision} className="design-review-frame" title={`${groupLabels[group]} ${sections.find(([value]) => value === section)?.[1]} ${width}px 设计审阅`} src={source} width={width} height={height} style={{width, height, maxWidth: 'none', transform: `scale(${scale})`}}/>
      </div>
    </div>
    <p className="design-review-help">可在预览内滚动及切换团体页面。若平台不允许嵌入，请使用“单独打开此预览”；无需更改浏览器或网站安全设置。</p>
  </main>;
}
