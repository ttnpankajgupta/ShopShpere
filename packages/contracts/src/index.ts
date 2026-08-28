/** ShopSphere S0 shared API contract types */

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  meta: ResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthData {
  status: 'ok';
  service: string;
}

export interface ReadinessChecks {
  database: 'up' | 'down';
  redis: 'up' | 'down';
}

export interface ReadyData {
  status: 'ready';
  checks: ReadinessChecks;
}

export const API_PATHS = {
  health: '/api/v1/health',
  ready: '/api/v1/ready',
} as const;
