import { Capacitor } from "@capacitor/core"

import { useSessionStore } from "../auth/sessionStore"
import { tokenService } from "../auth/tokenService"
import { request } from "../http/apiClient"

type PushPlatform = "ANDROID" | "IOS" | "WEB"

function currentPlatform(): PushPlatform {
  const platform = Capacitor.getPlatform()
  if (platform === "ios") return "IOS"
  if (platform === "android") return "ANDROID"
  return "WEB"
}

export async function registerPushToken(token: string): Promise<void> {
  const deviceId = await tokenService.getDeviceId()
  const accessToken = useSessionStore.getState().accessToken

  if (!accessToken) return

  await request("/notifications/push-token", {
    method: "POST",
    body: {
      token,
      platform: currentPlatform(),
      deviceId,
    },
    headers: {
      "X-Client-Platform": "MOBILE",
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function deactivatePushToken(token?: string | null): Promise<void> {
  const deviceId = await tokenService.getDeviceId()
  const accessToken = useSessionStore.getState().accessToken

  if (!accessToken) return

  await request("/notifications/push-token", {
    method: "DELETE",
    body: {
      ...(token ? { token } : {}),
      deviceId,
    },
    headers: {
      "X-Client-Platform": "MOBILE",
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
