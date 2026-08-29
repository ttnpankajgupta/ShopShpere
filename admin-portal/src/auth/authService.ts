/**
 * Admin authentication service contract — implementation reserved for Sprint 2.
 * S1 prepares the client-side interface and session state only.
 */
export interface AdminSession {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface AdminAuthUser {
  id: string;
  email: string;
  permissions: string[];
}

export type AdminAuthStatus = 'unknown' | 'authenticated' | 'unauthenticated' | 'session_expired';

export interface AdminAuthService {
  getSession(): Promise<AdminSession>;
  isAuthenticated(): Promise<boolean>;
  login(credentials: { email: string; password: string }): Promise<AdminAuthUser>;
  refresh(): Promise<AdminSession>;
  logout(): Promise<void>;
}

/** Sprint 2 placeholder — not wired to backend in S1 */
export const adminAuthService: AdminAuthService = {
  async getSession() {
    return { accessToken: null, refreshToken: null, expiresAt: null };
  },
  async isAuthenticated() {
    return false;
  },
  async login() {
    throw new Error('Admin authentication API is not available until Sprint 2');
  },
  async refresh() {
    throw new Error('Admin authentication API is not available until Sprint 2');
  },
  async logout() {
    return;
  },
};
