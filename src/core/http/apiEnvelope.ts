export type ApiError = {
  code: string;
  message: string;
  details: unknown;
  stack?: string;
};

export type ApiEnvelope<T> = {
  data: T | null;
  meta: unknown | null;
  error: ApiError | null;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export const isApiEnvelope = (v: unknown): v is ApiEnvelope<unknown> => {
  if (!isRecord(v)) return false;
  return "data" in v && "meta" in v && "error" in v;
};