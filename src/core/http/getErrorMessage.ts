type MessageLike = { message?: unknown; code?: unknown; status?: unknown };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/**
 * Common error patterns mapped to human-friendly Spanish messages.
 */
const ERROR_MAP: Record<string, string> = {
  // Auth errors
  invalid_credentials: "Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.",
  invalid_password: "La contraseña ingresada no es correcta.",
  user_not_found: "No encontramos una cuenta con ese correo.",
  email_not_verified: "Tu cuenta necesita verificar el correo antes de continuar.",
  account_locked: "Tu cuenta ha sido bloqueada temporalmente. Intenta más tarde.",
  account_disabled: "Tu cuenta está deshabilitada. Contacta a soporte si necesitas ayuda.",
  too_many_requests: "Demasiados intentos. Espera unos minutos antes de intentar de nuevo.",
  session_expired: "Tu sesión expiró. Por favor, inicia sesión nuevamente.",
  
  // Network errors
  network_error: "Tu conexión no respondió bien. Verifica tu internet e intenta nuevamente.",
  timeout: "La solicitud tardó demasiado. Intenta nuevamente.",
  server_error: "Ocurrió un problema en el servidor. Intenta más tarde.",
  
  // Validation errors
  validation_error: "Algunos datos no son válidos. Revisa el formulario.",
  
  // Token/verification errors
  invalid_token: "El enlace o código ya no es válido. Solicita uno nuevo.",
  token_expired: "El código ha expirado. Solicita uno nuevo.",
  invalid_code: "El código ingresado no es correcto. Revísalo e intenta de nuevo.",
};

/**
 * Patterns to detect in error messages and map to friendly messages.
 */
const MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /invalid.*(credential|password|email)/i, message: ERROR_MAP.invalid_credentials },
  { pattern: /not.*found|no.*exist/i, message: ERROR_MAP.user_not_found },
  { pattern: /not.*verified|verify.*email/i, message: ERROR_MAP.email_not_verified },
  { pattern: /locked|blocked|suspended/i, message: ERROR_MAP.account_locked },
  { pattern: /disabled|inactive/i, message: ERROR_MAP.account_disabled },
  { pattern: /too.*many|rate.*limit|throttl/i, message: ERROR_MAP.too_many_requests },
  { pattern: /expired.*session|session.*expired/i, message: ERROR_MAP.session_expired },
  { pattern: /network|connection|offline/i, message: ERROR_MAP.network_error },
  { pattern: /timeout|timed.*out/i, message: ERROR_MAP.timeout },
  { pattern: /server.*error|internal.*error|500/i, message: ERROR_MAP.server_error },
  { pattern: /invalid.*(token|code)/i, message: ERROR_MAP.invalid_token },
  { pattern: /expired.*(token|code)|code.*expired/i, message: ERROR_MAP.token_expired },
];

/**
 * Normalizes API errors into user-friendly Spanish messages.
 */
export function getErrorMessage(err: unknown, fallback = "Ocurrió un problema inesperado. Intenta otra vez."): string {
  // Direct string
  if (typeof err === "string") {
    const cleaned = err.trim();
    if (cleaned.length > 0 && cleaned.length < 200) {
      return matchPatternOrReturn(cleaned) ?? cleaned;
    }
    return fallback;
  }

  // Error instance
  if (err instanceof Error) {
    const msg = err.message?.trim();
    if (msg && msg.length > 0 && msg.length < 200) {
      return matchPatternOrReturn(msg) ?? msg;
    }
    return fallback;
  }

  // Record with message/code
  if (isRecord(err)) {
    const record = err as MessageLike;

    // Check for error code first
    if (typeof record.code === "string" && ERROR_MAP[record.code]) {
      return ERROR_MAP[record.code];
    }

    // Check message
    const msg = record.message;
    if (typeof msg === "string" && msg.trim().length > 0 && msg.length < 200) {
      return matchPatternOrReturn(msg.trim()) ?? msg.trim();
    }

    // Check HTTP status
    if (typeof record.status === "number") {
      if (record.status === 401) return ERROR_MAP.invalid_credentials;
      if (record.status === 403) return ERROR_MAP.account_disabled;
      if (record.status === 429) return ERROR_MAP.too_many_requests;
      if (record.status >= 500) return ERROR_MAP.server_error;
    }
  }

  return fallback;
}

/**
 * Matches error message against known patterns.
 */
function matchPatternOrReturn(message: string): string | null {
  for (const { pattern, message: friendlyMessage } of MESSAGE_PATTERNS) {
    if (pattern.test(message)) {
      return friendlyMessage;
    }
  }
  return null;
}
