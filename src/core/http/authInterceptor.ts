import { useSessionStore } from "../auth/sessionStore";
import { refreshAccessToken } from "./refresh";
import { request } from "./apiClient";
import type { ApiRequestOptions, ApiResult } from "./types";

export async function authRequest<T>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  const token = useSessionStore.getState().accessToken;

  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res: ApiResult<T> = await request<T>(path, { ...opts, headers });

  if (res.ok) return res;

  // si no es 401, no hay retry
  if (res.error.status !== 401) return res;

  // 401 -> intenta refresh una vez
  const newToken = await refreshAccessToken();
  if (!newToken) return res;

  const retryHeaders: Record<string, string> = { ...(opts.headers ?? {}) };
  retryHeaders.Authorization = `Bearer ${newToken}`;

  return request<T>(path, { ...opts, headers: retryHeaders });
}