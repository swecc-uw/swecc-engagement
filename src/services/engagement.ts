import { devPrint } from '../components/utils/RandomUtils';
import { parseAnyDate } from '../localization';
import { AttendanceSession, RawAttendanceSession, UserStats } from '../types';
import api from './api';
import { RawStatsResponseRecord, StatsResponseRecord } from '../types';
import { deserializeMember } from './member';

const deserializeSessionData = ({
  session_id,
  expires,
  ...rest
}: RawAttendanceSession): AttendanceSession => {
  return {
    ...rest,
    sessionId: session_id,
    expires: parseAnyDate(expires),
  };
};

export const isSessionActive = (session: AttendanceSession): boolean => {
  return session.expires > new Date();
};

export const getAllSessions = async (): Promise<AttendanceSession[]> => {
  const url = `/engagement/attendance/`;

  const res = await api.get(url);

  if (
    res.status !== 200 ||
    !Object.prototype.hasOwnProperty.call(res, 'data')
  ) {
    throw new Error('Failed to fetch all sessions');
  }

  return res.data.map(deserializeSessionData);
};

function deserializeDiscordStatsResponseRecord({
  member,
  ...rest
}: RawStatsResponseRecord): StatsResponseRecord {
  return {
    member: deserializeMember(member),
    ...rest,
  };
}

/**
 *
 * @param input comma separated string of member ids
 * @returns array of member ids
 */
export const parseMemberIds = (input: string): number[] => {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')
    .map((id) => {
      const num = Number(id);
      return !isNaN(num) ? num : null;
    })
    .filter((id): id is number => id !== null);
};

/**
 *
 * @param input comma separated string of channel ids
 * @returns array of channel ids
 */
export const parseChannelIds = (input: string): string[] => {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '');
};

export function queryMessageStats(memberIds: number[], channelIds: string[]) {
  const baseUrl = '/engagement/message/query/';

  const memberIdParams =
    memberIds.length > 0
      ? memberIds.map((id) => `member_id=${id}`).join('&')
      : '';

  const channelIdParams =
    channelIds.length > 0
      ? channelIds.map((id) => `channel_id=${id}`).join('&')
      : '';

  const queryParams = [memberIdParams, channelIdParams]
    .filter((param) => param !== '')
    .join('&');

  const finalUrl = baseUrl + (queryParams ? `?${queryParams}` : '');

  devPrint('Querying message stats:', finalUrl);

  return api
    .get<RawStatsResponseRecord[]>(finalUrl)
    .then((response) =>
      response.data.map(deserializeDiscordStatsResponseRecord)
    );
}

export function getUserStats(memberId?: number): Promise<UserStats> {
  const baseUrl = '/engagement/user/';

  return api
    .get<UserStats>(memberId ? baseUrl + memberId : baseUrl)
    .then((response) => response.data)
    .catch((error) => {
      devPrint('Failed to fetch user stats:', error);
      throw error;
    });
}
