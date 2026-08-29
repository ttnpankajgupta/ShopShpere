# ShopSphere S1 API Contract

**Version:** v1  
**Base path:** `/api/v1`  
**Sprint:** S1 — Customer Authentication and Account Security

## Authentication

Customer endpoints use `Authorization: Bearer <accessToken>` unless noted as public.

Refresh requests send the refresh token in the JSON body (not as Bearer).

## Endpoints

### POST /api/v1/auth/register

Create a customer account in `PENDING_VERIFICATION` state and issue an OTP.

If the email already exists with `PENDING_VERIFICATION` status (user never completed OTP), registration is allowed again: profile/password are updated and a fresh OTP is issued. Verified (`ACTIVE`) emails still return `EMAIL_ALREADY_EXISTS` (409).

**Request**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "firstName": "Jane",
  "lastName": "Doe",
  "mobile": "+15551234567"
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "userId": "cuid",
    "email": "user@example.com",
    "status": "PENDING_VERIFICATION",
    "otpSent": true,
    "otpExpiresInSeconds": 600
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/send-otp

Resend OTP for registration, login, or password reset.

**Request**

```json
{
  "email": "user@example.com",
  "purpose": "REGISTRATION"
}
```

`purpose`: `REGISTRATION` | `LOGIN` | `PASSWORD_RESET`

**Response 200**

```json
{
  "success": true,
  "data": {
    "otpSent": true,
    "otpExpiresInSeconds": 600,
    "resendAvailableInSeconds": 60
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/verify-otp

Verify OTP and complete registration or login OTP flow.

**Request**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "purpose": "REGISTRATION"
}
```

**Response 200** (registration/login success)

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "opaque-token",
    "expiresIn": 900,
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "status": "ACTIVE"
    }
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/login

**Request** (password mode)

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "opaque-token",
    "expiresIn": 900,
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "status": "ACTIVE"
    }
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/refresh

**Request**

```json
{
  "refreshToken": "opaque-token"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "new-opaque-token",
    "expiresIn": 900
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/logout

**Request**

```json
{
  "refreshToken": "opaque-token"
}
```

**Response 200**

```json
{
  "success": true,
  "data": { "loggedOut": true },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/forgot-password

**Request**

```json
{
  "email": "user@example.com"
}
```

**Response 200** (always generic message to prevent enumeration)

```json
{
  "success": true,
  "data": {
    "message": "If an account exists, a reset code has been sent.",
    "otpExpiresInSeconds": 600
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### POST /api/v1/auth/reset-password

**Request**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass1!"
}
```

**Response 200**

```json
{
  "success": true,
  "data": { "passwordReset": true },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### GET /api/v1/users/me

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "mobile": "+15551234567",
    "status": "ACTIVE"
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

## Error Codes (S1)

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `INVALID_OTP` | 400 | Wrong OTP code |
| `OTP_EXPIRED` | 400 | OTP has expired |
| `OTP_MAX_ATTEMPTS` | 429 | Too many OTP verification attempts |
| `RESEND_COOLDOWN` | 429 | OTP resend not yet available |
| `RATE_LIMITED` | 429 | Too many requests |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked |
| `EMAIL_ALREADY_EXISTS` | 409 | Duplicate email |
| `MOBILE_ALREADY_EXISTS` | 409 | Duplicate mobile |
| `ACCOUNT_NOT_VERIFIED` | 403 | Account pending verification |
| `WEAK_PASSWORD` | 400 | Password policy violation |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid or revoked |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

## Password Policy

- Minimum 8 characters
- At least one uppercase letter, one lowercase letter, one digit, and one symbol

## OTP Policy

- 6-digit numeric code
- 10-minute expiry
- 60-second resend cooldown
- Maximum 5 verification attempts per OTP
- OTP stored hashed server-side; never logged

## Token Policy

- Access token: JWT, 15 minutes
- Refresh token: opaque, rotated on refresh, 7 days
- Logout revokes refresh token
- Password reset revokes all refresh tokens for user
