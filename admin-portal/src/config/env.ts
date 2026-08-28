export interface AppConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
}

export function getAppConfig(): AppConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('Missing VITE_API_BASE_URL environment variable');
  }

  return {
    apiBaseUrl,
    apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000),
  };
}
