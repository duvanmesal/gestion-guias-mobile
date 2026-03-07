import { create } from "zustand";
import type { SessionState } from "./types";

const GUEST: Pick<SessionState, "status" | "user" | "accessToken"> = {
  status: "guest",
  user: null,
  accessToken: null,
};

export const useSessionStore = create<SessionState>((set) => ({
  status: "loading",
  user: null,
  accessToken: null,

  setLoading: () => set({ status: "loading" }),
  setGuest: () =>
    set({
      status: "guest",
      user: null,
      accessToken: null,
    }),
  setAuthedSession: ({ user, accessToken }) =>
    set({
      status: "authed",
      user,
      accessToken,
    }),
  setAccessToken: (accessToken) => set({ accessToken }),
  hardLogout: () => set(GUEST),
}));
