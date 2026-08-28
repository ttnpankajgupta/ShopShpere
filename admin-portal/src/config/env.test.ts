import { describe, expect, it } from 'vitest';
import { getAppConfig } from '../config/env';

describe('getAppConfig', () => {
  it('returns API configuration from environment', () => {
    const config = getAppConfig();
    expect(config.apiBaseUrl).toBe('http://localhost:3000');
    expect(config.apiTimeoutMs).toBe(10000);
  });
});
