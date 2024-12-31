import { useState, useEffect } from 'react';
import api from '../services/api';
import { toAPIFormat } from '../localization';
import { AttendanceSession } from '../types';
import { getAllSessions } from '../services/engagement';

export function useAttendanceSessions() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await getAllSessions();
      setSessions(allSessions);
    } catch (err) {
      setError('Failed to fetch sessions');
      console.error(err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (
    title: string,
    key: string,
    expiresDate: Date
  ) => {
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
