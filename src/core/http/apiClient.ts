import { ENV } from "../config/env";
import { isApiEnvelope } from "./apiEnvelope";
import { normalizeError } from "./errorNormalizer";
import type { ApiEnvelopeResult, ApiRequestOptions, ApiResult } from "./types";

function unwrap<T>(json: unknown): T {
  if (isApiEnvelope(json)) {
    return (json.data ?? undefined) as unknown as T;
  }
  return json as T;
}

async function performRequest(path: string, opts: ApiRequestOptions = {}) {
  const { method = "GET", body, headers = {}, signal } = opts;
  const url = `${ENV.apiUrl}${path}`;

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  });

  const isEmpty =
    res.status === 204 || res.headers.get("content-length") === "0";

  if (isEmpty) {
    return { res, isEmpty: true as const, json: undefined as unknown };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return {
      res,
      isEmpty: false as const,
      parseError: true as const,
      json: undefined as unknown,
    };
  }

  return { res, isEmpty: false as const, parseError: false as const, json };
}

export async function request<T>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  try {
    const result = await performRequest(path, opts);

    if (result.isEmpty) {
      if (result.res.ok) return { ok: true, data: undefined as unknown as T };
      return {
        ok: false,
        error: {
          status: result.res.status,
          code: "HTTP_ERROR",
          message: result.res.statusText,
        },
      };
    }

    if (result.parseError) {
      if (result.res.ok) return { ok: true, data: undefined as unknown as T };
      return {
        ok: false,
        error: {
          status: result.res.status,
          code: "PARSE_ERROR",
          message: "Invalid JSON",
        },
      };
    }

    if (result.res.ok) return { ok: true, data: unwrap<T>(result.json) };

    if (isApiEnvelope(result.json) && result.json.error) {
      return {
        ok: false,
        error: { status: result.res.status, ...result.json.error },
      };
    }

    return {
      ok: false,
      error: normalizeError(
        {
          ...((result.json && typeof result.json === "object")
            ? result.json
            : {}),
          status: result.res.status,
        },
        result.res.statusText
      ),
    };
  } catch (err: unknown) {
    return { ok: false, error: normalizeError(err, "Network request failed") };
  }
}

export async function requestEnvelope<T, M = unknown>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<ApiEnvelopeResult<T, M>> {
  try {
    const result = await performRequest(path, opts);

    if (result.isEmpty) {
      if (result.res.ok) {
        return {
          ok: true,
          data: undefined as unknown as T,
          meta: null,
        };
      }
      return {
        ok: false,
        error: {
          status: result.res.status,
          code: "HTTP_ERROR",
          message: result.res.statusText,
        },
      };
    }

    if (result.parseError) {
      if (result.res.ok) {
        return {
          ok: true,
          data: undefined as unknown as T,
          meta: null,
        };
      }
      return {
        ok: false,
        error: {
          status: result.res.status,
          code: "PARSE_ERROR",
          message: "Invalid JSON",
        },
      };
    }

    if (result.res.ok) {
      if (isApiEnvelope(result.json)) {
        return {
          ok: true,
          data: (result.json.data ?? undefined) as T,
          meta: (result.json.meta ?? null) as M | null,
        };
      }

      return {
        ok: true,
        data: result.json as T,
        meta: null,
      };
    }

    if (isApiEnvelope(result.json) && result.json.error) {
      return {
        ok: false,
        error: { status: result.res.status, ...result.json.error },
      };
    }

    return {
      ok: false,
      error: normalizeError(
        {
          ...((result.json && typeof result.json === "object")
            ? result.json
            : {}),
          status: result.res.status,
        },
        result.res.statusText
      ),
    };
  } catch (err: unknown) {
    return { ok: false, error: normalizeError(err, "Network request failed") };
  }
}