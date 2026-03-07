import { Preferences } from "@capacitor/preferences";
import { STORAGE_KEYS } from "./keys";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function get(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return null;
  }
}

async function set(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch {
    /* fail safe */
  }
}

async function remove(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch {
    /* fail safe */
  }
}

export const secureVault = {
  async getRefreshToken(): Promise<string | null> {
    return get(STORAGE_KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    return set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  async clearRefreshToken(): Promise<void> {
    return remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
  async getDeviceId(): Promise<string> {
    let id = await get(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = generateUUID();
      await set(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },
};
