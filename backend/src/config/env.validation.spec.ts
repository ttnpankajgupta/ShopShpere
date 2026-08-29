import { validate } from './env.validation';

describe('Environment validation', () => {
  const validConfig = {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    REDIS_URL: 'redis://localhost:6379',
    CORS_ORIGINS: 'http://localhost:5173',
    JWT_SECRET: 'test-secret-key-for-unit-tests-only',
  };

  it('accepts valid configuration', () => {
    const result = validate(validConfig);
    expect(result.DATABASE_URL).toBe(validConfig.DATABASE_URL);
  });

  it('rejects missing DATABASE_URL', () => {
    const { DATABASE_URL: _, ...config } = validConfig;
    expect(() => validate(config)).toThrow(/Configuration validation failed/);
  });

  it('rejects missing REDIS_URL', () => {
    const { REDIS_URL: _, ...config } = validConfig;
    expect(() => validate(config)).toThrow(/Configuration validation failed/);
  });
});
