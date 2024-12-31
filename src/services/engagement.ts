import { parseAnyDate } from '../localization';
import { AttendanceSession, RawAttendanceSession, Member } from '../types';
import api from './api';
import { deserializeMember } from './member';

const deserializeSessionData = ({
  attendees,
  expires,
  session_id,
  ...rest
}: RawAttendanceSession): AttendanceSession => {
  let deserializedMembers: Member[] = [];

  for (const rawMember of attendees) {
    deserializedMembers = [
      ...deserializedMembers,
      deserializeMember(rawMember),
    ];
  }

  return {
    ...rest,
    sessionId: session_id,
    attendees: deserializedMembers,
    expires: parseAnyDate(expires),
  };
};

const getAllSessions = async () => {
  const url = `/engagement/attendance/`;

  const res = await api.get(url);

  if (
    res.status !== 200 ||
    !Object.prototype.hasOwnProperty.call(res, 'data')
  ) {
    throw new Error('Failed to fetch all sessions');
  }

  return deserializeSessionData(res.data);
};
