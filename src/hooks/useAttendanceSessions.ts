import { useState, useEffect } from 'react';
import api from '../services/api';
import { toAPIFormat } from '../localization';
import { AttendanceSession } from '../types';
import { getAllSessions } from '../services/engagement';
import { useToast } from '@chakra-ui/react';

export function useAttendanceSessions() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toast = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await getAllSessions();
      setSessions(allSessions);
    } catch (err) {
      const errorMessage = (err as Error).message;

      setError(errorMessage);

      toast({
        status: 'error',
        title: 'Error',
        description: errorMessage,
        duration: 5000,
        isClosable: true,
      });

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
