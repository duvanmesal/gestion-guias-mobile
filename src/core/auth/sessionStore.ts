import { create } from "zustand";
import type { SessionState } from "./types";

const GUEST_BASE: Pick<
  SessionState,
  "status" | "user" | "accessToken"
> = {
  status: "guest",
  user: null,
  accessToken: null,
};

export const useSessionStore = create<SessionState>((set) => ({
  status: "loading",
  user: null,
  accessToken: null,
  authNotice: null,

  setLoading: () =>
    set({
      status: "loading",
    }),

  setGuest: () =>
    set({
      ...GUEST_BASE,
    }),

  setAuthedSession: ({ user, accessToken }) =>
    set({
      status: "authed",
      user,
      accessToken,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
    }),

  setAuthNotice: (authNotice) =>
    set({
      authNotice,
    }),

  clearAuthNotice: () =>
    set({
      authNotice: null,
    }),

  hardLogout: () =>
    set({
      ...GUEST_BASE,
    }),
}));