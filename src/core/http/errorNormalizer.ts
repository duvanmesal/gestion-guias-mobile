import type { ApiErrorNormalized } from "./types";

export function normalizeError(
  input: unknown,
  fallbackMessage = "Unknown error"
): ApiErrorNormalized {
  if (input instanceof TypeError) {
    return { status: 0, code: "NETWORK_ERROR", message: input.message || fallbackMessage };
  }
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const inner = (obj.error && typeof obj.error === "object" ? obj.error : obj) as Record<string, unknown>;
    return {
      status: typeof obj.status === "number" ? obj.status : 0,
      code: typeof inner.code === "string" ? inner.code : "UNKNOWN",
      message: typeof inner.message === "string" ? inner.message : fallbackMessage,
      details: inner.details,
    };
  }
  return { status: 0, code: "UNKNOWN", message: fallbackMessage };
}
