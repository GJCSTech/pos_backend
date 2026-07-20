export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  code: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorBody;
}

export function ok<T>(
  data: T,
  metaOrMessage?: Record<string, unknown> | object | string,
  message = 'Success',
): ApiSuccessResponse<T> {
  if (typeof metaOrMessage === 'string') {
    return { success: true, message: metaOrMessage, data };
  }

  return metaOrMessage
    ? {
        success: true,
        message,
        data,
        meta: metaOrMessage as Record<string, unknown>,
      }
    : { success: true, message, data };
}

export function fail(
  message: string,
  errors: ApiErrorBody,
): ApiErrorResponse {
  return {
    success: false,
    message,
    errors,
  };
}
