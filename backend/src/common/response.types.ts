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

export function successResponse<T>(
  data: T,
  requestId: string,
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };
}
