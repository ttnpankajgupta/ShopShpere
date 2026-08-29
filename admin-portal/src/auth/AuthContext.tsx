import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AdminAuthStatus, AdminAuthUser, adminAuthService } from './authService';

interface AuthState {
  status: AdminAuthStatus;
  user: AdminAuthUser | null;
  permissions: string[];
}

interface AuthContextValue extends AuthState {
  /** S0 stub login for dashboard demo — replaced in Sprint 2 */
  loginStub: () => void;
  markSessionExpired: () => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    status: 'unauthenticated',
    user: null,
    permissions: [],
  });

  const loginStub = useCallback(() => {
    setAuth({
      status: 'authenticated',
      user: { id: 'stub', email: 'admin@shopsphere.local', permissions: ['dashboard:view'] },
      permissions: ['dashboard:view'],
    });
  }, []);

  const markSessionExpired = useCallback(() => {
    setAuth({ status: 'session_expired', user: null, permissions: [] });
  }, []);

  const logout = useCallback(async () => {
    await adminAuthService.logout();
    setAuth({ status: 'unauthenticated', user: null, permissions: [] });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...auth,
      loginStub,
      markSessionExpired,
      logout,
      hasPermission: (permission) => auth.permissions.includes(permission),
    }),
    [auth, loginStub, markSessionExpired, logout],
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
