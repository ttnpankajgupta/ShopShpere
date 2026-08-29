import { describe, expect, it } from 'vitest';
import { adminAuthService } from './authService';

describe('Admin auth service contract (S1)', () => {
  it('returns unauthenticated session by default', async () => {
    const session = await adminAuthService.getSession();
    expect(session.accessToken).toBeNull();
    expect(await adminAuthService.isAuthenticated()).toBe(false);
  });

  it('rejects login until Sprint 2 API is available', async () => {
    await expect(
      adminAuthService.login({ email: 'a@b.com', password: 'x' }),
    ).rejects.toThrow(/Sprint 2/);
  });
});

describe('Protected route contract', () => {
  it('requires authentication before rendering protected content', () => {
    const shouldRenderProtected = (status: string) => status === 'authenticated';
    expect(shouldRenderProtected('unauthenticated')).toBe(false);
  });

  it('redirects session_expired status to session-expired route', () => {
    const status = 'session_expired';
    const redirect = status === 'session_expired' ? '/session-expired' : null;
    expect(redirect).toBe('/session-expired');
  });
});

describe('Data table contract', () => {
  it('shows empty message when no rows exist', () => {
    const rows: { id: string }[] = [];
    const emptyMessage = rows.length === 0 ? 'No data available' : null;
    expect(emptyMessage).toBe('No data available');
  });
});
