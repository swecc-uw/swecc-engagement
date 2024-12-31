import { devPrint } from '../components/utils/RandomUtils';
import { RawStatsResponseRecord, StatsResponseRecord } from '../types';
import api from './api';
import { deserializeMember } from './member';

function deserializeDiscordStatsResponseRecord({
  member,
  ...rest
}: RawStatsResponseRecord): StatsResponseRecord {
  return {
    member: deserializeMember(member),
    ...rest,
  };
}

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
