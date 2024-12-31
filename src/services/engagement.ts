import { devPrint } from '../components/utils/RandomUtils';
import { parseAnyDate } from '../localization';
import { AttendanceSession, RawAttendanceSession } from '../types';
import api from './api';

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

export const getAllSessions = async (): Promise<AttendanceSession[]> => {
  const url = `/engagement/attendance/`;

  const res = await api.get(url);

  if (
    res.status !== 200 ||
    !Object.prototype.hasOwnProperty.call(res, 'data')
  ) {
    throw new Error('Failed to fetch all sessions');
  }

  const allSessions: AttendanceSession[] = [];

  for (const session of res.data) {
    allSessions.push(deserializeSessionData(session));
  }

  return allSessions;
};
