import { queryClient } from "../../app/providers/QueryProvider";
import { request } from "../http/apiClient";
import { tokenService } from "./tokenService";
import { useSessionStore } from "./sessionStore";
import type { AuthNotice } from "./types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

interface FinalizeClientLogoutOptions {
  notice?: AuthNotice | null;
}

interface LogoutAllOptions {
  password: string;
}

function getAuthHeader(): Record<string, string> {
  const accessToken = useSessionStore.getState().accessToken;

  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}

export async function finalizeClientLogout(
  options: FinalizeClientLogoutOptions = {}
): Promise<void> {
  const { notice = null } = options;

  try {
    await tokenService.clearRefreshToken();
  } catch {
    // fail safe
  }

  try {
    queryClient.clear();
  } catch {
    // fail safe
  }

  useSessionStore.getState().hardLogout();
  useSessionStore.getState().setAuthNotice(notice);
}

export async function logoutCurrentSession(): Promise<void> {
  try {
    await request<void>("/auth/logout", {
      method: "POST",
      headers: {
        ...PLATFORM_HEADER,
        ...getAuthHeader(),
      },
    });
  } finally {
    await finalizeClientLogout({
      notice: {
        kind: "success",
        message: "Sesión cerrada correctamente.",
      },
    });
  }
}

export async function logoutAllSessions(
  options: LogoutAllOptions
): Promise<void> {
  try {
    await request<void>("/auth/logout-all", {
      method: "POST",
      body: {
        verification: {
          method: "password",
          password: options.password,
        },
      },
      headers: {
        ...PLATFORM_HEADER,
        ...getAuthHeader(),
      },
    });
  } finally {
    await finalizeClientLogout({
      notice: {
        kind: "success",
        message: "Se cerró tu sesión en este y todos tus dispositivos.",
      },
    });
  }
}

export async function expireSessionAndRedirect(): Promise<void> {
  await finalizeClientLogout({
    notice: {
      kind: "warning",
      message: "Tu sesión expiró. Inicia sesión nuevamente.",
    },
  });
}