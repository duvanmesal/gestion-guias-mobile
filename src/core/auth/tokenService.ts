import { secureVault } from "../storage/secureVault";
import { useSessionStore } from "./sessionStore";

export const tokenService = {
  getRefreshToken: () => secureVault.getRefreshToken(),
  setRefreshToken: (t: string) => secureVault.setRefreshToken(t),
  clearRefreshToken: () => secureVault.clearRefreshToken(),
  getDeviceId: () => secureVault.getDeviceId(),
  setAccessToken: (t: string | null) =>
    useSessionStore.getState().setAccessToken(t),
};
