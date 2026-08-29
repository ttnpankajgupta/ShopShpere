export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;
export const ACCESS_TOKEN_EXPIRY_SECONDS = 900;
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_MINUTES = 15;
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MAX_REQUESTS = 20;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
