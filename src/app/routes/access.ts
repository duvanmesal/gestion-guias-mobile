import type {
  Role,
  SessionStatus,
  SessionUser,
} from "../../core/auth/types";

export type AuthStage =
  | "loading"
  | "guest"
  | "unverified"
  | "onboarding"
  | "ready";

export interface SessionSnapshot {
  status: SessionStatus;
  user: SessionUser | null;
}

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  roles?: Role[];
}

function normalizePath(path: string): string {
  if (!path) return "/";
  const clean = path.split("?")[0].split("#")[0];
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export function getAuthStage(snapshot: SessionSnapshot): AuthStage {
  const { status, user } = snapshot;

  if (status === "loading") return "loading";
  if (status !== "authed" || !user) return "guest";
  if (!user.emailVerifiedAt) return "unverified";
  if (user.profileStatus !== "COMPLETE") return "onboarding";
  return "ready";
}

export function resolveAppEntry(snapshot: SessionSnapshot): string {
  const stage = getAuthStage(snapshot);

  switch (stage) {
    case "guest":
      return "/login";
    case "unverified":
      return "/verify-email";
    case "onboarding":
      return "/onboarding";
    case "ready":
      return "/profile";
    case "loading":
    default:
      return "/";
  }
}

export function isReadyForInternalModules(snapshot: SessionSnapshot): boolean {
  return getAuthStage(snapshot) === "ready";
}

export function canAccessRole(
  snapshot: SessionSnapshot,
  allowedRoles: Role[]
): boolean {
  return (
    getAuthStage(snapshot) === "ready" &&
    !!snapshot.user?.role &&
    allowedRoles.includes(snapshot.user.role)
  );
}

export function getAccessRedirect(
  targetPath: string,
  snapshot: SessionSnapshot
): string | null {
  const path = normalizePath(targetPath);
  const stage = getAuthStage(snapshot);

  if (stage === "loading") return null;

  // Guest-only
  if (path === "/login") {
    return stage === "guest" ? null : resolveAppEntry(snapshot);
  }

  // Verify flow
  if (path === "/verify-email") {
    switch (stage) {
      case "guest":
        return "/login";
      case "unverified":
        return null;
      case "onboarding":
        return "/onboarding";
      case "ready":
        return "/profile";
      default:
        return "/login";
    }
  }

  // Onboarding flow
  if (path === "/onboarding") {
    switch (stage) {
      case "guest":
        return "/login";
      case "unverified":
        return "/verify-email";
      case "onboarding":
        return null;
      case "ready":
        return "/profile";
      default:
        return "/login";
    }
  }

  // Cualquier ruta protegida/interna
  switch (stage) {
    case "guest":
      return "/login";
    case "unverified":
      return "/verify-email";
    case "onboarding":
      return "/onboarding";
    case "ready":
      return null;
    default:
      return "/login";
  }
}

export function filterNavigationItems(
  items: NavigationItem[],
  snapshot: SessionSnapshot
): NavigationItem[] {
  const stage = getAuthStage(snapshot);

  if (stage !== "ready") return [];

  return items.filter((item) => {
    if (!item.roles?.length) return true;
    return !!snapshot.user?.role && item.roles.includes(snapshot.user.role);
  });
}