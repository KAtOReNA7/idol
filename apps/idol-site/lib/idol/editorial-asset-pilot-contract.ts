/** Fixed public slot names only. Historical two-slot fixtures remain testable; no arbitrary subset. */
export const editorialPilotLabels: Readonly<Record<string, string>> = Object.freeze({
  "udtt-hero": "UDTT 团体图",
  "udtt-risako": "Risako 成员图",
  "udtt-han-chaehee": "Han Chaehee 成员图",
  "udtt-gu-hanna": "Gu Hanna 成员图",
  "udtt-kwon-yejin": "Kwon Yejin 成员图",
  "udtt-woojung": "Woojung 既有成员槽位图",
  "udtt-retry-cover": "Retry 封面",
  "udtt-school-rush-cover": "School Rush 封面",
  "udtt-viper-cover": "Viper 封面",
  "udtt-really-really-mv": "Really Really MV",
  "udtt-really-really-stage": "Really Really 舞台"
});
export function exactEditorialPilotSlots(ids: readonly string[]) {
    const expected = ids.length === 2 ? ['udtt-hero', 'udtt-risako'] : Object.keys(editorialPilotLabels);
    return ids.length === expected.length && new Set(ids).size === ids.length && expected.every(id => ids.includes(id));
}
