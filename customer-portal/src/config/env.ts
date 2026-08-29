import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
}

const DEFAULT_API_PORT = 3000;

function getConfiguredBaseUrl(): string | undefined {
  const extra = Constants.expoConfig?.extra as Partial<AppConfig> | undefined;
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? extra?.apiBaseUrl;
}

function getExpoDevHost(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return undefined;
  }

  const withoutScheme = hostUri.replace(/^[a-z]+:\/\//i, '');
  const host = withoutScheme.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return undefined;
  }

  return host;
}

function getPortFromUrl(url: string): number {
  try {
    const parsed = new URL(url);
    if (parsed.port) {
      return Number(parsed.port);
    }
    return parsed.protocol === 'https:' ? 443 : DEFAULT_API_PORT;
  } catch {
    return DEFAULT_API_PORT;
  }
}

/**
 * Resolves API base URL for the current platform.
 * - Web / iOS simulator: localhost works
 * - Android emulator: localhost → 10.0.2.2 (host machine)
 * - Physical device (Expo Go): uses Metro bundler host IP when available
 */
export function resolveApiBaseUrl(configured?: string): string {
  const raw = configured ?? getConfiguredBaseUrl();
  if (!raw) {
    throw new Error('Missing API base URL configuration');
  }

  const normalized = raw.replace(/\/$/, '');
  const isLocalhost =
    normalized.includes('://localhost') || normalized.includes('://127.0.0.1');

  if (!isLocalhost) {
    return normalized;
  }

  if (Platform.OS === 'web') {
    return normalized;
  }

  const port = getPortFromUrl(normalized);
  const expoHost = getExpoDevHost();
  if (expoHost) {
    return `http://${expoHost}:${port}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }

  return normalized;
}

export function getAppConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra as Partial<AppConfig> | undefined;

  return {
    apiBaseUrl: resolveApiBaseUrl(),
    apiTimeoutMs: extra?.apiTimeoutMs ?? 10000,
  };
}
