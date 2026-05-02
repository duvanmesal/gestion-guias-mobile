import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { STORAGE_KEYS } from "./keys";

const isNative = Capacitor.isNativePlatform();

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  throw new Error("No secure RNG available");
}

// On web, refresh tokens use localStorage (survives page reload) instead of
// sessionStorage (cleared on tab close). The ideal solution is httpOnly cookies
// set by the backend, which this client cannot access via JS at all.
async function get(key: string): Promise<string | null> {
  try {
    if (isNative) {
      const { value } = await SecureStoragePlugin.get({ key });
      return value ?? null;
    }
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function set(key: string, value: string): Promise<void> {
  try {
    if (isNative) {
      await SecureStoragePlugin.set({ key, value });
      return;
    }
    localStorage.setItem(key, value);
  } catch {
    /* fail safe */
  }
}

async function remove(key: string): Promise<void> {
  try {
    if (isNative) {
      await SecureStoragePlugin.remove({ key });
      return;
    }
    localStorage.removeItem(key);
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
