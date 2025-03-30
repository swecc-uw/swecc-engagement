/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getCSRF } from '../services/api';
import { devPrint } from '../components/utils/RandomUtils';
import { Member } from '../types';
import { getCurrentUser } from '../services/member';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  member?: Member;
  error?: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    discordUsername: string
  ) => Promise<number | undefined>;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

const checkSession = async (): Promise<boolean> => {
  try {
    await api.get('/auth/session/');
    return true;
  } catch (err) {
    return false;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();

  const sessionQuery = useQuery({
    queryKey: ['authSession'],
    queryFn: checkSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!sessionQuery.isPending) {
      setIsAuthenticated(sessionQuery.data === true);
    }
  }, [sessionQuery.data, sessionQuery.isPending]);

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated === undefined || isAuthenticated === true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry(failureCount) {
      return failureCount < 1;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      return api.post('/auth/login/', { username, password });
    },
    onSuccess: (res) => {
      if (res.status === 200) {
        getCSRF();
        setIsAuthenticated(true);
        setError('');

        queryClient.invalidateQueries({ queryKey: ['authSession'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } else {
        handleLoginError(res.data);
      }
    },
    onError: (err: any) => {
      handleLoginError(err.response?.data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api.post('/auth/logout/');
    },
    onSuccess: (res) => {
      if (res.status === 200) {
        devPrint('Logout successful');
        getCSRF();
        setIsAuthenticated(false);

        queryClient.invalidateQueries({ queryKey: ['authSession'] });
        queryClient.resetQueries({ queryKey: ['currentUser'] });
      } else {
        devPrint('Logout failed');
      }
    },
    onError: (err) => {
      devPrint('Logout failed', err);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      username,
      email,
      password,
      discordUsername,
    }: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
      discordUsername: string;
    }) => {
      return api.post('/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        discord_username: discordUsername,
      });
    },
    onSuccess: (res) => {
      if (res.status === 201) {
        const data = res.data;
        setError(
          `Registration successful. Please type /verify in the swecc server and enter ${
            data.username || res.data.username
          }`
        );
        getCSRF();
        return data.id;
      }
      throw new Error('Registration failed.');
    },
    onError: (err: any) => {
      devPrint('Registration failed:', err.response?.data);
      setError(
        err.response?.data?.detail || 'Registration failed. Please try again.'
      );
    },
  });

  const handleLoginError = (errorData: any) => {
    if (
      errorData?.detail ===
      'Your account does not have a Discord ID associated with it.'
    ) {
      setError(
        `Your discord is not verified. Please type /verify in the swecc server and enter ${errorData.username}`
      );
    } else {
      setError('Invalid credentials. Please try again.');
      setIsAuthenticated(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const register = async (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    discordUsername: string
  ): Promise<number | undefined> => {
    try {
      const result = await registerMutation.mutateAsync({
        firstName,
        lastName,
        username,
        email,
        password,
        discordUsername,
      });
      return result?.data?.id;
    } catch (err) {
      return undefined;
    }
  };

  const clearError = (): void => {
    setError(undefined);
  };

  const member = userQuery.data;
  const groups = member?.groups?.map((value) => value.name) || [];
  const isAdmin = groups.includes('is_admin');
  const isVerified = groups.includes('is_verified');

  const loading =
    sessionQuery.isPending ||
    isAuthenticated === undefined ||
    (isAuthenticated && userQuery.isPending);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated === true,
        error,
        loading,
        member,
        isAdmin,
        isVerified,
        login,
        logout,
        register,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
