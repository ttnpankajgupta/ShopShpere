export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: { requestId: string; timestamp: string };
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown[] };
  meta: { requestId: string; timestamp: string };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthData {
  status: 'ok';
  service: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiTimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'ApiTimeoutError';
  }
}
