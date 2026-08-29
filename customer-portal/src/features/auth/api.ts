import { getAppConfig } from '../../config/env';
import {
  ApiClientError,
  ApiResponse,
  ApiTimeoutError,
  AUTH_API_PATHS,
  AuthSession,
  AuthUser,
  OtpPurpose,
} from '../../api/types';

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const { apiBaseUrl, apiTimeoutMs } = getAppConfig();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetchWithTimeout(
    `${apiBaseUrl}${path}`,
    { ...options, headers },
    apiTimeoutMs,
  );

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('Malformed API response', 'MALFORMED_RESPONSE', response.status);
  }

  if (!body.success) {
    throw new ApiClientError(body.error.message, body.error.code, response.status);
  }

  return body.data;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile?: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<{ userId: string; email: string; otpSent: boolean }>(AUTH_API_PATHS.register, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  sendOtp: (email: string, purpose: OtpPurpose) =>
    request<{ otpSent: boolean; resendAvailableInSeconds: number }>(AUTH_API_PATHS.sendOtp, {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),

  verifyOtp: (email: string, code: string, purpose: OtpPurpose) =>
    request<AuthSession>(AUTH_API_PATHS.verifyOtp, {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    }),

  login: (email: string, password: string) =>
    request<AuthSession>(AUTH_API_PATHS.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      AUTH_API_PATHS.refresh,
      { method: 'POST', body: JSON.stringify({ refreshToken }) },
    ),

  logout: (refreshToken: string) =>
    request<{ loggedOut: boolean }>(AUTH_API_PATHS.logout, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>(AUTH_API_PATHS.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    request<{ passwordReset: boolean }>(AUTH_API_PATHS.resetPassword, {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),

  getMe: (accessToken: string) =>
    request<AuthUser>(AUTH_API_PATHS.me, { method: 'GET' }, accessToken),
};
