/** Pure public-source reconciliation. This module never creates or saves records. */
import {applyImagery} from './apply-imagery.js';
export const nonEmpty = value => value !== null && value !== undefined && value !== '';

export function mergeNonEmpty(previous = {}, incoming = {}) {
  const result = {...previous};
  for (const [key, value] of Object.entries(incoming)) {
    if (!nonEmpty(value)) continue;
    result[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? mergeNonEmpty(previous[key] && typeof previous[key] === 'object' && !Array.isArray(previous[key]) ? previous[key] : {}, value)
      : value;
  }
  return result;
}

function uniqueSources(items) {
  const found = new Set();
  return items.filter(item => {
    if (!item) return false;
    const key = JSON.stringify(item);
    if (found.has(key)) return false;
    found.add(key); return true;
  });
}

export function projectEvent(event) {
  // A planned date is never an occurrence or an announcement date.
  const axisDate = event.eventDate ?? event.announcementDate ?? null;
  return {...event,
    date: axisDate?.value ?? null,
    precision: axisDate?.precision ?? null,
    dateKind: event.eventDate ? '事件日' : event.announcementDate ? '公告日' : null,
    canonicalEvent: event
  };
}

export function reconcileArtist(base, payload) {
  if (base.id !== payload.group.groupId || base.slug !== payload.group.slug) {
    throw new Error('Public reconciliation group identity mismatch');
  }
  const sourceMembers = new Map(payload.members.map(member => [member.memberId, member]));
  const sourceRows = payload.periodSources ?? [];
  const members = base.members.map(previous => {
    const original = sourceMembers.get(previous.id);
    if (!original) throw new Error(`Missing public member source: ${previous.id}`);
    const periods = payload.periods.filter(period => period.memberId === previous.id && period.groupId === base.id);
    const sourceIds = new Set(periods.flatMap(period => period.sourceIds ?? []));
    const careerSources = sourceRows.filter(source => sourceIds.has(source.sourceId));
    const merged = mergeNonEmpty(previous, original);
    const historical = original.formerGroupIds.includes(base.id) && !original.currentGroupIds.includes(base.id);
    const usePreviousProfile = original.profileExcerptOnly && nonEmpty(previous.profile);
    const officialSource = original.officialUrl ? [{url:original.officialUrl, label:'公开艺人资料'}] : [];
    return {...merged,
      id: previous.id, name: previous.name,
      nameZh: nonEmpty(original.cnName) ? original.cnName : previous.nameZh,
      officialStageName: original.stageName, stageName: original.stageName,
      profile: usePreviousProfile ? previous.profile : (original.profile || previous.profile),
      currentGroupIds: [...original.currentGroupIds], formerGroupIds: [...original.formerGroupIds],
      historical,
      history: typeof previous.history === 'boolean' || previous.history == null ? historical : previous.history,
      publicBaseline: original,
      legacyPublicBaseline: previous.publicBaseline ?? null,
      previousPublicMember: previous,
      careerPeriods: periods,
      careerSources,
      sources: uniqueSources([...(previous.sources ?? []), ...officialSource, ...careerSources]),
      profilePreservation: {sourceExcerptOnly:original.profileExcerptOnly === true,
        fullOriginalVerificationPending:original.needsLiveBeforeVerification?.includes('profile') === true,
        priorProfileRetained:!!usePreviousProfile}
    };
  });
  if (members.length !== payload.members.length) throw new Error('Public member source coverage mismatch');
  return applyImagery({...base,
    members,
    publicGroupBaseline: payload.group,
    memberCareerPeriods: payload.periods,
    memberCareerSources: payload.periodSources,
    sourceTimeline: payload.events,
    sourceTimelineGaps: payload.gaps,
    previousTimeline: base.timeline,
    timeline: payload.events.filter(event => event.reviewStatus === 'ready').map(projectEvent),
    reconciliationVersion: 1
  });
}
