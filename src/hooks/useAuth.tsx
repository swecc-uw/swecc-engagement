import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [member, setMember] = useState<Member>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser()
        .then((mem) => {
          setMember(mem);
          const groups = mem.groups?.map((value) => value.name);
          setIsAdmin(groups?.includes('is_admin') ?? false);
          setIsVerified(groups?.includes('is_verified') ?? false);
          setLoading(false);
        })
        .catch((err) => {
          devPrint('Failed to get current user:', err);
          setMember(undefined);
        });
    } else {
      setMember(undefined);
    }
  }, [isAuthenticated]);

  const getSession = async (): Promise<void> => {
    try {
      await api.get('/auth/session/');
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const res = await api.post('/auth/login/', { username, password });

      if (res.status === 200) {
        getCSRF();
        setIsAuthenticated(true);
        setError('');
      } else {
        handleLoginError(res.data);
      }
    } catch (err: any) {
      handleLoginError(err.response?.data);
    }
  };

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

  const logout = async (): Promise<void> => {
    try {
      const res = await api.post('/auth/logout/');

      if (res.status === 200) {
        devPrint('Logout successful');
        getCSRF();
        setIsAuthenticated(false);
      } else {
        devPrint('Logout failed');
      }
    } catch (err) {
      devPrint('Logout failed');
    }
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
      const res = await api.post('/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        discord_username: discordUsername,
      });

      if (res.status !== 201) throw new Error('Registration failed.');

      const data = res.data;
      setError(
        `Registration successful. Please type /verify in the swecc server and enter ${username}`
      );
      getCSRF();
      return data.id;
    } catch (err: any) {
      devPrint('Registration failed:', err.response?.data);
      setError(
        err.response?.data?.detail || 'Registration failed. Please try again.'
      );
      return;
    }
  };

  const clearError = (): void => {
    setError(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
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
