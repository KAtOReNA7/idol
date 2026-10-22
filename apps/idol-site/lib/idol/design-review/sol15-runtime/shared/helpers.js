import {resolveMediaPresentation} from './media-policy.js';

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => entities[char]);
export const entityKey = entity => entity?.id != null && entity.id !== '' ? String(entity.id) : entity?.candidateKey ? String(entity.candidateKey) : null;
export function href(slug, page = 'home', key = null, query = {}) {
  const parts = [slug];
  if (page !== 'home') parts.push(page);
  if (key !== null && key !== undefined) parts.push(String(key));
  const params = query instanceof URLSearchParams ? query : new URLSearchParams(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''));
  return `#/${parts.map(encodeURIComponent).join('/')}${params.size ? `?${params}` : ''}`;
}
export function parseDate(value, precision) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText), month = Number(monthText ?? 1), day = Number(dayText ?? 1);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > days[month - 1]) return null;
  const actualPrecision = dayText ? 'day' : monthText ? 'month' : 'year';
  if (precision && !['day', 'month', 'year'].includes(precision)) return null;
  if (precision === 'day' && actualPrecision !== 'day' || precision === 'month' && actualPrecision === 'year') return null;
  const resolved = precision ?? actualPrecision;
  const sortKey = year * 10000 + (resolved === 'year' ? 1 : month) * 100 + (resolved === 'day' ? day : 1);
  return { year, month, day, precision: resolved, sortKey };
}
export function dateLabel(value, precision) {
  const date = parseDate(value, precision);
  if (!date) return '';
  return `${date.year}年${date.precision !== 'year' ? `${date.month}月` : ''}${date.precision === 'day' ? `${date.day}日` : ''}`;
}
export function sortTimeline(events = []) {
  return events.map((event, index) => ({event, index, date: parseDate(event.date, event.precision)}))
    .sort((a, b) => (a.date?.sortKey ?? Infinity) - (b.date?.sortKey ?? Infinity) || a.index - b.index)
    .map(({event}) => event);
}
export function filterWorks(works = [], {query = '', type = 'all'} = {}) {
  const needle = String(query ?? '').normalize('NFKC').toLocaleLowerCase().trim();
  return works.filter(work => (type === 'all' || work.type === type) && (!needle || [work.title, work.titleZh, work.name, work.description].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase().includes(needle)));
}
export function safeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;
  if (/^(?:https?:\/\/|\.\/|\.\.\/|\/)/i.test(url) && !/^[\s]*\/\//.test(url)) return url;
  if (/^(?:assets|groups)\/[\w./%+@()-]+$/i.test(url)) return url;
  return null;
}
export function image(asset, alt = '', options = {}) {
  const details = typeof asset === 'string' ? {src: asset} : asset ?? {};
  const src = safeUrl(details.src ?? details.path ?? details.url);
  const className = escape(options.className ?? '');
  const presentation=resolveMediaPresentation(details,{context:options.context,mediaRole:options.mediaRole});
  if (!src||!presentation.canRender) return `<span class="media-unavailable ${className}" role="img" aria-label="${escape(alt || '图片暂不可用')}">${escape(alt || '图片暂不可用')}</span>`;
  const dimensions = Number.isFinite(details.width) && Number.isFinite(details.height) && details.width > 0 && details.height > 0 ? ` width="${details.width}" height="${details.height}"` : '';
  const fit = options.fit === 'contain' ? 'contain' : 'cover';
  const position = /^[\d.%\s]+$/.test(options.position ?? '') ? options.position : '50% 50%';
  const loading = options.loading === 'eager' ? 'eager' : 'lazy';
  const capped=presentation.active;
  const naturalCap=capped?`;max-width:${presentation.maxWidth}px!important;max-height:${presentation.maxHeight}px!important;width:min(100%,${presentation.maxWidth}px)!important;height:auto!important;aspect-ratio:auto!important;object-fit:contain!important;transform:none!important${presentation.qualityLevel==='card'?';display:block!important;margin-inline:auto!important':''}`:'';
  const policyData=capped?` data-no-upscale="true" data-quality-level="${escape(presentation.qualityLevel??'')}" data-natural-width="${presentation.naturalWidth}" data-natural-height="${presentation.naturalHeight}" data-media-context="${presentation.context}" data-media-operation="${presentation.operation}" data-media-max-width="${presentation.maxWidth}" data-media-max-height="${presentation.maxHeight}" data-recommended-use="${presentation.recommendedUse}" data-allow-enlargement="${presentation.allowEnlargement}" data-allow-primary-visual="${presentation.allowPrimaryVisual}" data-media-action-label="${escape(presentation.actionLabel)}"`:'';
  const img = `<img class="${className}" src="${escape(src)}" alt="${escape(alt)}" loading="${loading}" decoding="async"${dimensions} style="object-fit:${fit};object-position:${position}${naturalCap}" data-original-src="${escape(src)}"${policyData}>`;
  return options.caption && details.credit ? `<figure class="media-figure">${img}<figcaption>${escape(details.credit)}</figcaption></figure>` : img;
}
export function sources(items = []) {
  return (Array.isArray(items) ? items : []).map(item => typeof item === 'string' ? {url: item, label: '来源'} : item).filter(item => /^https?:\/\//i.test(item?.url ?? '')).map(item => `<a href="${escape(item.url)}"${item.id||item.sourceId?` data-source-id="${escape(item.id??item.sourceId)}"`:''} target="_blank" rel="noopener noreferrer">${escape(item.label ?? item.title ?? '来源')}</a>`).join('');
}
export function videoHref(videoId) {
  return /^[A-Za-z0-9_-]{11}$/.test(String(videoId ?? '')) ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : null;
}
export function withMediaContext(baseHelpers,context){
  const originalImage=baseHelpers.image;
  return Object.freeze({...baseHelpers,image:(asset,alt='',options={})=>originalImage(asset,alt,{...options,context:options.context??context})});
}
export const helpers = Object.freeze({escape, entityKey, href, parseDate, dateLabel, sortTimeline, filterWorks, image, sources, safeUrl, videoHref,resolveMediaPresentation,withMediaContext});
