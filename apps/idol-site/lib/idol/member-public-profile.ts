import type {Member} from './types';

type ProfileMember = Pick<Member, 'id' | 'groupIds' | 'formerGroupIds' | 'profile'>;
type ProfileCopy = Readonly<{groupId: string; source: string; text: string}>;

// Presentation only. Exact identity, relationship and source text guard each
// reviewed rewrite; later data corrections and unrelated profiles pass through.
// Raw profiles, exports, notes, scores and viewing states are never changed.
const reviewedProfiles: Readonly<Record<string, ProfileCopy>> = {
  recvxyICzHSB1r: {
    groupId: 'recvxyEBDZ8A0W',
    source: 'Kep1er队长，官方个人页明列其领导职位；1996年8月12日出生。',
    text: 'Kep1er 队长，1996 年 8 月 12 日出生。',
  },
  recvxyICzHCOwh: {
    groupId: 'recvxyEBDZ8A0W',
    source: 'Kep1er出道成员，官方名录列其生日为2002年4月26日；现六人阵容成员。',
    text: 'Kep1er 出道成员，2002 年 4 月 26 日出生；现六人阵容成员。',
  },
  recvxyICzHkiWq: {
    groupId: 'recvxyEBDZ8A0W',
    source: 'Kep1er出道成员，2003年3月2日出生；公司目前六人成员名录持续列示。',
    text: 'Kep1er 出道成员，2003 年 3 月 2 日出生；名列公司公布的六人成员名单。',
  },
  recvxyICzHvPnL: {
    groupId: 'recvxyEBDZ8A0W',
    source: 'Kep1er出道成员，公开报道明确为美国国籍，不能因韩国出生或K组经历改填韩国籍。',
    text: 'Kep1er 出道成员，美国籍。',
  },
};

export function publicMemberProfile(member: ProfileMember): string {
  const copy = reviewedProfiles[member.id];
  if (!copy || member.profile !== copy.source) return member.profile;
  const belongs = member.groupIds.includes(copy.groupId)
    || member.formerGroupIds?.includes(copy.groupId);
  return belongs ? copy.text : member.profile;
}
