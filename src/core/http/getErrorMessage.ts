type MessageLike = { message?: unknown };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export function getErrorMessage(err: unknown, fallback = "Algo salió mal"): string {
  if (typeof err === "string") return err;

  if (err instanceof Error) return err.message || fallback;

  if (isRecord(err)) {
    const msg = (err as MessageLike).message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }

  return fallback;
}