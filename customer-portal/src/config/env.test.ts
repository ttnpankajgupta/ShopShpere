jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: 'http://localhost:3000',
        apiTimeoutMs: 10000,
      },
    },
  },
}));

import Constants from 'expo-constants';
import { getAppConfig } from '../config/env';

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
