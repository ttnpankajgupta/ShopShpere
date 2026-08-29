jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: 'http://localhost:3000',
        apiTimeoutMs: 10000,
      },
      hostUri: undefined,
    },
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import Constants from 'expo-constants';
import { getAppConfig, resolveApiBaseUrl } from './env';

describe('resolveApiBaseUrl', () => {
  it('keeps explicit remote URLs unchanged', () => {
    expect(resolveApiBaseUrl('https://api.shopsphere.com')).toBe('https://api.shopsphere.com');
  });

  it('uses 10.0.2.2 on Android when localhost is configured', () => {
    const { Platform } = jest.requireMock<{ Platform: { OS: string } }>('react-native');
    Platform.OS = 'android';
    expect(resolveApiBaseUrl('http://localhost:3000')).toBe('http://10.0.2.2:3000');
    Platform.OS = 'web';
  });

  it('uses Expo dev host on device when Metro exposes LAN IP', () => {
    const { Platform } = jest.requireMock<{ Platform: { OS: string } }>('react-native');
    Platform.OS = 'android';
    if (Constants.expoConfig) {
      Constants.expoConfig.hostUri = '192.168.1.42:8081';
    }
    expect(resolveApiBaseUrl('http://localhost:3000')).toBe('http://192.168.1.42:3000');
    if (Constants.expoConfig) {
      Constants.expoConfig.hostUri = undefined;
    }
    Platform.OS = 'web';
  });
});

describe('getAppConfig', () => {
  it('returns configured API base URL', () => {
    const config = getAppConfig();
    expect(config.apiBaseUrl).toBe('http://localhost:3000');
    expect(config.apiTimeoutMs).toBe(10000);
  });

  it('throws when API base URL is missing', () => {
    const originalExtra = Constants.expoConfig?.extra;
    if (Constants.expoConfig) {
      Constants.expoConfig.extra = {};
    }
    const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    expect(() => getAppConfig()).toThrow(/Missing API base URL/);

    if (Constants.expoConfig) {
      Constants.expoConfig.extra = originalExtra;
    }
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
  });
});
