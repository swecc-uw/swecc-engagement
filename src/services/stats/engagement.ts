import { AttendanceSession } from '../../types';

export interface StatsDisplay {
  label: string;
  value: number;
}

type StatHandler = (sessions: AttendanceSession[]) => StatsDisplay;

const getAverageAttendance = (sessions: AttendanceSession[]): StatsDisplay => {
  let sum = 0;

  for (const session of sessions) {
    sum += session.attendees.length;
  }

  return { label: 'Average', value: sum / sessions.length };
};

const getTotalSessionCount = (sessions: AttendanceSession[]): StatsDisplay => {
  return { label: 'Total Sessions', value: sessions.length };
};

const minAttendance = (sessions: AttendanceSession[]): StatsDisplay => {
  return {
    label: 'Min Attendance',
    value: sessions.reduce((prev, curr) =>
      curr.attendees.length < prev.attendees.length ? curr : prev
    ).attendees.length,
  };
};

const maxAttendance = (sessions: AttendanceSession[]): StatsDisplay => {
  return {
    label: 'Max Attendance',
    value: sessions.reduce((prev, curr) =>
      curr.attendees.length > prev.attendees.length ? curr : prev
    ).attendees.length,
  };
};

export const getStats = (sessions: AttendanceSession[]): StatsDisplay[] => {
  const statHandlers: StatHandler[] = [
    getTotalSessionCount,
    minAttendance,
    maxAttendance,
    getAverageAttendance,
  ];

  return statHandlers.map((statHandler, _) => statHandler(sessions));
};
