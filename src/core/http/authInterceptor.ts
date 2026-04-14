import { expireSessionAndRedirect } from "../auth/sessionLifecycle";
import { useSessionStore } from "../auth/sessionStore";
import { refreshAccessToken } from "./refresh";
import { request, requestEnvelope } from "./apiClient";
import type { ApiEnvelopeResult, ApiRequestOptions, ApiResult } from "./types";

const EXPECTED_AUDIENCE = "mobile";

function decodeJwtPayload(token: string): { aud?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isValidAccessToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.aud !== EXPECTED_AUDIENCE) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
}

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
  if (token) {
    if (!isValidAccessToken(token)) {
      await runForcedLogoutOnce();
      return {
        ok: false,
        error: {
          status: 401,
          code: "INVALID_TOKEN",
          message: "Token inválido. Inicia sesión nuevamente.",
        },
      };
    }
    headers.Authorization = `Bearer ${token}`;
  }

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

export async function authRequestEnvelope<T, M = unknown>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<ApiEnvelopeResult<T, M>> {
  const token = useSessionStore.getState().accessToken;

  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (token) {
    if (!isValidAccessToken(token)) {
      await runForcedLogoutOnce();
      return {
        ok: false,
        error: {
          status: 401,
          code: "INVALID_TOKEN",
          message: "Token inválido. Inicia sesión nuevamente.",
        },
      };
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await requestEnvelope<T, M>(path, { ...opts, headers });

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

  const retryRes = await requestEnvelope<T, M>(path, {
    ...opts,
    headers: retryHeaders,
  });

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