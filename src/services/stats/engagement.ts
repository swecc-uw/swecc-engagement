import { AttendanceSession } from '../../types';

export interface SessionStats {
  label: string;
  value: number;
}

type StatHandler = (sessions: AttendanceSession[]) => SessionStats;

const getAverageAttendance = (sessions: AttendanceSession[]): SessionStats => {
  let sum = 0;

  for (const session of sessions) {
    sum += session.attendees.length;
  }

  return {
    label: 'Average',
    value: parseFloat((sum / sessions.length).toFixed(2)),
  };
};

const getTotalSessionCount = (sessions: AttendanceSession[]): SessionStats => {
  return { label: 'Total Sessions', value: sessions.length };
};

const minAttendance = (sessions: AttendanceSession[]): SessionStats => {
  if (sessions.length === 0) {
    return { label: 'Min Attendance', value: 0 };
  }

  return {
    label: 'Min Attendance',
    value: sessions.reduce((prev, curr) =>
      curr.attendees.length < prev.attendees.length ? curr : prev
    ).attendees.length,
  };
};

const maxAttendance = (sessions: AttendanceSession[]): SessionStats => {
  if (sessions.length === 0) {
    return { label: 'Max Attendance', value: 0 };
  }

  return {
    label: 'Max Attendance',
    value: sessions.reduce((prev, curr) =>
      curr.attendees.length > prev.attendees.length ? curr : prev
    ).attendees.length,
  };
};

export const calculateSessionStats = (
  sessions: AttendanceSession[]
): SessionStats[] => {
  const statHandlers: StatHandler[] = [
    getTotalSessionCount,
    minAttendance,
    maxAttendance,
    getAverageAttendance,
  ];

  return statHandlers.map((statHandler, _) => {
    const ret = statHandler(sessions);
    return ret;
  });
};
