import { useSessionStore } from "../auth/sessionStore";
import { expireSessionAndRedirect } from "../auth/sessionLifecycle";
import { refreshAccessToken } from "./refresh";
import { request } from "./apiClient";
import type { ApiRequestOptions, ApiResult } from "./types";

let forcedLogoutInFlight: Promise<void> | null = null;

async function runForcedLogoutOnce(): Promise<void> {
  if (!forcedLogoutInFlight) {
    forcedLogoutInFlight = expireSessionAndRedirect().finally(() => {
      forcedLogoutInFlight = null;
    });
  }

  await forcedLogoutInFlight;
}

export async function authRequest<T>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  const token = useSessionStore.getState().accessToken;

  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res: ApiResult<T> = await request<T>(path, { ...opts, headers });

  if (res.ok) return res;

  if (res.error.status !== 401) return res;

  const newToken = await refreshAccessToken();

  if (!newToken) {
    await runForcedLogoutOnce();
    return {
      ok: false,
      error: {
        status: 401,
        code: "SESSION_EXPIRED",
        message: "Tu sesión expiró. Inicia sesión nuevamente.",
      },
    };
  }

  const retryHeaders: Record<string, string> = { ...(opts.headers ?? {}) };
  retryHeaders.Authorization = `Bearer ${newToken}`;

  const retryRes = await request<T>(path, { ...opts, headers: retryHeaders });

  if (!retryRes.ok && retryRes.error.status === 401) {
    await runForcedLogoutOnce();
    return {
      ok: false,
      error: {
        status: 401,
        code: "SESSION_EXPIRED",
        message: "Tu sesión expiró. Inicia sesión nuevamente.",
      },
    };
  }

  return retryRes;
}