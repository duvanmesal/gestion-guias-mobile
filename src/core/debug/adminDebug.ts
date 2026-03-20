import type { SessionSnapshot } from "../../app/routes/access";
import type { Role, SessionUser } from "../auth/types";

type DebugPayload = Record<string, unknown>;

const DEBUG_STORAGE_KEY = "debug:admin";

function readLocalDebugFlag(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isAdminDebugEnabled(): boolean {
  return Boolean(import.meta.env.DEV) || readLocalDebugFlag();
}

function formatPrefix(scope: string) {
  const now = new Date().toISOString();
  return `[ADMIN-DEBUG][${now}][${scope}]`;
}

export function adminDebug(scope: string, payload?: DebugPayload) {
  if (!isAdminDebugEnabled()) return;

  if (payload) {
    console.log(formatPrefix(scope), payload);
    return;
  }

  console.log(formatPrefix(scope));
}

export function adminWarn(scope: string, payload?: DebugPayload) {
  if (!isAdminDebugEnabled()) return;

  if (payload) {
    console.warn(formatPrefix(scope), payload);
    return;
  }

  console.warn(formatPrefix(scope));
}

export function adminError(scope: string, payload?: DebugPayload) {
  if (!isAdminDebugEnabled()) return;

  if (payload) {
    console.error(formatPrefix(scope), payload);
    return;
  }

  console.error(formatPrefix(scope));
}

export function describeUser(user: SessionUser | null) {
  return {
    id: user?.id ?? null,
    role: user?.role ?? null,
    profileStatus: user?.profileStatus ?? null,
    emailVerifiedAt: user?.emailVerifiedAt ?? null,
    activo: user?.activo ?? null,
    nombre: user?.nombre ?? null,
  };
}

export function describeSession(snapshot: SessionSnapshot) {
  return {
    status: snapshot.status,
    user: describeUser(snapshot.user),
  };
}

export function describeRoleCheck(
  snapshot: SessionSnapshot,
  allowed: Role[],
  granted: boolean
) {
  return {
    ...describeSession(snapshot),
    allowed,
    granted,
  };
}