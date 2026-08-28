import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  permissions: string[];
}

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, permissions: [] });

  const value = useMemo<AuthContextValue>(
    () => ({
      ...auth,
      login: () => setAuth({ isAuthenticated: true, permissions: ['dashboard:view'] }),
      logout: () => setAuth({ isAuthenticated: false, permissions: [] }),
      hasPermission: (permission) => auth.permissions.includes(permission),
    }),
    [auth],
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
