export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiErrorNormalized {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export type ApiErrorShape = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorShape };

export type ApiEnvelopeResult<T, M = unknown> =
  | { ok: true; data: T; meta: M | null }
  | { ok: false; error: ApiErrorShape };

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}