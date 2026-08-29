import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthUser } from '../../api/types';
import { ApiClientError } from '../../api/types';
import { tokenStorage } from '../../storage/tokenStorage';
import { authApi } from './api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'session_expired';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  signIn: (session: { accessToken: string; refreshToken: string; user: AuthUser }) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const signIn = useCallback(
    async (session: { accessToken: string; refreshToken: string; user: AuthUser }) => {
      await tokenStorage.saveTokens(session.accessToken, session.refreshToken);
      setUser(session.user);
      setStatus('authenticated');
    },
    [],
  );

  const signOut = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Clear local state even if server logout fails
      }
    }
    await tokenStorage.clearTokens();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const restoreSession = useCallback(async () => {
    setStatus('loading');
    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      setStatus('unauthenticated');
      return;
    }

    try {
      const me = await authApi.getMe(accessToken);
      setUser(me);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        try {
          const refreshed = await authApi.refresh(refreshToken);
          await tokenStorage.saveTokens(refreshed.accessToken, refreshed.refreshToken);
          const me = await authApi.getMe(refreshed.accessToken);
          setUser(me);
          setStatus('authenticated');
          return;
        } catch {
          await tokenStorage.clearTokens();
          setUser(null);
          setStatus('session_expired');
          return;
        }
      }
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      pendingEmail,
      setPendingEmail,
      signIn,
      signOut,
      restoreSession,
      getAccessToken: tokenStorage.getAccessToken,
    }),
    [status, user, pendingEmail, signIn, signOut, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
