import { getAppConfig } from '../config/env';
import {
  ApiClientError,
  ApiResponse,
  ApiTimeoutError,
  HealthData,
} from './types';

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

export async function getHealth(): Promise<HealthData> {
  const { apiBaseUrl, apiTimeoutMs } = getAppConfig();
  const response = await fetchWithTimeout(
    `${apiBaseUrl}/api/v1/health`,
    { method: 'GET', headers: { Accept: 'application/json' } },
    apiTimeoutMs,
  );

  let body: ApiResponse<HealthData>;
  try {
    body = (await response.json()) as ApiResponse<HealthData>;
  } catch {
    throw new ApiClientError('Malformed API response', 'MALFORMED_RESPONSE', response.status);
  }

  if (!body.success) {
    throw new ApiClientError(body.error.message, body.error.code, response.status);
  }

  return body.data;
}
