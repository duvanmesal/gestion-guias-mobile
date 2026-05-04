import { request } from "./apiClient";
import { tokenService } from "../auth/tokenService";
import { useSessionStore } from "../auth/sessionStore";
import { socketClient } from "../socket/socketClient";
import type { RefreshResponse } from "../../features/auth/types/auth.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

let inFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const rt = await tokenService.getRefreshToken();
    if (!rt) return null;

    const res = await request<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: rt },
      headers: { ...PLATFORM_HEADER },
    });

    if (!res.ok) return null;

    const { accessToken, refreshToken } = res.data.tokens;

    useSessionStore.getState().setAccessToken(accessToken);
    socketClient.connect(accessToken);

    if (refreshToken) {
      await tokenService.setRefreshToken(refreshToken);
    }

    return accessToken;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}