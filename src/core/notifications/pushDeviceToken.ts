import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"

import { STORAGE_KEYS } from "../storage/keys"
import { deactivatePushToken } from "./pushTokenApi"

export async function persistCurrentPushToken(token: string): Promise<void> {
  await Preferences.set({ key: STORAGE_KEYS.PUSH_TOKEN, value: token })
}

export async function getCurrentPushToken(): Promise<string | null> {
  const result = await Preferences.get({ key: STORAGE_KEYS.PUSH_TOKEN })
  return result.value
}

export async function deactivateCurrentPushToken(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const token = await getCurrentPushToken()
  await deactivatePushToken(token)
  await Preferences.remove({ key: STORAGE_KEYS.PUSH_TOKEN })
}
