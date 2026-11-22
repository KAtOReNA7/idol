import identities from '../../data/shared-artist-member-identities.json';
import type {Member} from './types';

/** The public identity available before the visitor's catalog arrives. */
export type SharedArtistMember = Pick<Member,
  'id' | 'name' | 'cnName' | 'stageName' | 'groupIds' | 'formerGroupIds' |
  'status' | 'birthDate' | 'country' | 'role' | 'profile' | 'officialUrl'>;

const membersByGroup: Readonly<Record<string, readonly SharedArtistMember[]>> = identities;

export function sharedArtistMember(groupId: string, search: string): SharedArtistMember | null {
  const id = new URLSearchParams(search).get('member');
  return membersByGroup[groupId]?.find(member => member.id === id
    && (member.groupIds.includes(groupId) || member.formerGroupIds?.includes(groupId))) ?? null;
}
