# ShopSphere S0 API Contract

**Version:** v1  
**Base path:** `/api/v1`

## Response Envelope

All API responses use a standard envelope.

### Success

```json
{
  "success": true,
  "data": { },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO-8601"
  }
}
```

## Endpoints

### GET /api/v1/health

Liveness probe. Does not check external dependencies.

**Response 200**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "shopsphere-api"
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### GET /api/v1/ready

Readiness probe. Checks PostgreSQL and Redis connectivity.

**Response 200** — all dependencies healthy

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "checks": {
      "database": "up",
      "redis": "up"
    }
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

**Response 503** — one or more dependencies unhealthy

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service is not ready",
    "details": [{ "dependency": "database", "status": "down" }]
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

## Headers

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-Request-Id` | Request (optional) / Response (required) | Correlation ID; server generates UUID if absent |

## Error Codes (S0)

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Unhandled server error (no stack trace exposed) |
| `SERVICE_UNAVAILABLE` | 503 | Readiness check failed |

## OpenAPI

- Document served at `GET /api/docs`
- JSON spec at `GET /api/docs-json`
