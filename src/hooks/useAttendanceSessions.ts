import { useState, useEffect } from 'react';
import api from '../services/api';
import { toAPIFormat } from '../localization';

export interface AttendanceSession {
  id: string;
  title: string;
  key: string;
  expires: string;
  attendees: string[];
}

export const isSessionActive = (session: AttendanceSession): boolean => {
  return new Date(session.expires) > new Date();
};

export function useAttendanceSessions() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/engagement/attendance/');
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to fetch sessions');
      console.error(err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (title: string, key: string, expiresDate: Date) => {
    setError('');
    const expiresISO = toAPIFormat(expiresDate, true);

    try {
      await api.post('/engagement/attendance/session', {
        title,
        key,
        expires: expiresISO,
      });
      await fetchSessions();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create session');
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    createSession,
    fetchSessions,
  };
}
