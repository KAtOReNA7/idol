/** Exact, reviewed display wording. Canonical documents are never mutated. */
export type TimelineDisplayCopy = Readonly<Record<string,{before:string;after:string}>>;
export function timelineDisplayText(copy:TimelineDisplayCopy|undefined,key:string,original:string):string {
  const row=copy?.[key];
  return row&&row.before===original?row.after:original;
}
