export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function ok<T>(
  data: T,
  meta?: Record<string, unknown> | object,
): ApiSuccessResponse<T> {
  return meta
    ? { success: true, data, meta: meta as Record<string, unknown> }
    : { success: true, data };
}
