import { isValidEmail, splitFullName, validatePassword } from './validation';

describe('auth validation', () => {
  it('validates email format', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });

  it('splits full name into first and last', () => {
    expect(splitFullName('Alex Johnson')).toEqual({ firstName: 'Alex', lastName: 'Johnson' });
    expect(splitFullName('Alex')).toBeNull();
  });

  it('enforces password policy', () => {
    expect(validatePassword('short')).toMatch(/8 characters/);
    expect(validatePassword('SecurePass1!')).toBeUndefined();
  });
});
