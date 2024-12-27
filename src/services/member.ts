import { devPrint } from '../components/utils/RandomUtils';
import { parseAnyDate, toAPIFormat } from '../localization';
import { Member, RawMemberData } from '../types';
import api from './api';

export function deserializeMember({
  first_name: firstName,
  last_name: lastName,
  grad_date: gradDate,
  discord_username: discordUsername,
  resume_url: resumeUrl,
  discord_id: discordId,
  profile_picture_url: profilePictureUrl,
  created,
  ...rest
}: RawMemberData): Member {
  return {
    ...rest,
    firstName,
    lastName,
    discordUsername,
    resumeUrl,
    discordId,
    profilePictureUrl,
    created: parseAnyDate(created),
    gradDate: gradDate ? parseAnyDate(gradDate) : undefined,
  };
}

export function serializeMember({
  firstName: first_name,
  lastName: last_name,
  gradDate: grad_date,
  discordUsername: discord_username,
  resumeUrl: resume_url,
  discordId: discord_id,
  profilePictureUrl: profile_picture_url,
  created,
  ...member
}: Partial<Member>): Partial<RawMemberData> {
  return {
    ...member,
    first_name,
    last_name,
    discord_username,
    resume_url,
    discord_id,
    profile_picture_url,
    created: created ? toAPIFormat(created) : undefined,
    grad_date: grad_date ? toAPIFormat(grad_date, false) : undefined,
  };
}

export async function getCurrentUser(): Promise<Member> {
  const url = '/members/profile/';
  const res = await api.get(url);

  devPrint('res:', res);

  if (res.status !== 200) throw new Error('Failed to get current user');

  if (!Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get current user');

  return deserializeMember(res.data);
}

export async function resetPassword(
  uid: string,
  token: string,
  newPassword: string
): Promise<void> {
  const url = `/auth/password-reset-confirm/${uid}/${token}/`;
  const res = await api.post(url, { new_password: newPassword });

  devPrint('res:', res);

  if (res.status !== 200) throw new Error('Failed to get current user');
}

export async function getMemberProfile(userId: number): Promise<Member> {
  const url = `/members/${userId}/`;
  const res = await api.get(url);

  devPrint('res:', res);

  if (res.status !== 200) throw new Error('Failed to get member profile');

  if (!Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get member profile');

  return deserializeMember(res.data);
}

export async function updateMemberProfile(
  profile: Partial<Member>
): Promise<Member> {
  const url = `/members/profile/`;

  const res = await api.put(url, serializeMember(profile));
  devPrint('res:', res);

  if (res.status !== 200 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to update member profile');

  return deserializeMember(res.data);
}

// TODO: please god give me an endpoint for this
export async function isCurrentMemberVerified(): Promise<boolean> {
  return getCurrentUser()
    .then(
      (member) =>
        member.groups?.map((group) => group.name).includes('is_verified') ??
        false
    )
    .catch(() => false);
}
