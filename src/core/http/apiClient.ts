import { ENV } from "../config/env";
import { normalizeError } from "./errorNormalizer";
import type { ApiRequestOptions, ApiResult } from "./types";
import { isApiEnvelope } from "./apiEnvelope";

function unwrap<T>(json: unknown): T {
  if (isApiEnvelope(json)) {
    // Si viene envelope, devolvemos SOLO data
    return (json.data ?? undefined) as unknown as T;
  }
  return json as T;
}

export async function request<T>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, headers = {}, signal } = opts;
  const url = `${ENV.apiUrl}${path}`;

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    });

    const isEmpty =
      res.status === 204 || res.headers.get("content-length") === "0";

    if (isEmpty) {
      if (res.ok) return { ok: true, data: undefined as unknown as T };
      return {
        ok: false,
        error: { status: res.status, code: "HTTP_ERROR", message: res.statusText },
      };
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      if (res.ok) return { ok: true, data: undefined as unknown as T };
      return {
        ok: false,
        error: { status: res.status, code: "PARSE_ERROR", message: "Invalid JSON" },
      };
    }

    if (res.ok) return { ok: true, data: unwrap<T>(json) };

    // si vino envelope con error, úsalo
    if (isApiEnvelope(json) && json.error) {
      return { ok: false, error: { status: res.status, ...json.error } };
    }

    return {
      ok: false,
      error: normalizeError(
        { ...((json && typeof json === "object") ? json : {}), status: res.status },
        res.statusText
      ),
    };
  } catch (err: unknown) {
    return { ok: false, error: normalizeError(err, "Network request failed") };
  }
}