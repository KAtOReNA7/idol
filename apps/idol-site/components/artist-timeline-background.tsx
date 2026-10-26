import type {TimelineBackground} from '../lib/idol/timeline/production';
import {safeTimelineSourceUrl} from '../lib/idol/timeline/validate';
/** Retains useful roster/source context without duplicating superseded event lists. */
export function ArtistTimelineBackground({background}:{background:TimelineBackground}) {
  return <div>

    <p>团体介绍与资料来源可在下方查阅；事件日期与状态以时间轴标注为准。</p>
    <ul>{background.links.filter(link=>safeTimelineSourceUrl(link.url)).map(link=><li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul>
  </div>;
}
