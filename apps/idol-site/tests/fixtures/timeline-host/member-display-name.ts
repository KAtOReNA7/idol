/** Test-only fallback; does not validate real Chinese-name/alias metadata. */
export function memberDisplayName(member:{stageName?:string;name?:string}) {
  return member.stageName||member.name||'合成成员';
}

export function memberChineseName(member:{cnName?:string}) { return member.cnName||''; }
