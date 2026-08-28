import Constants from 'expo-constants';

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
}

export function getAppConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra as Partial<AppConfig> | undefined;
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? extra?.apiBaseUrl;

  if (!apiBaseUrl) {
    throw new Error('Missing API base URL configuration');
  }

  return {
    apiBaseUrl,
    apiTimeoutMs: extra?.apiTimeoutMs ?? 10000,
  };
}
