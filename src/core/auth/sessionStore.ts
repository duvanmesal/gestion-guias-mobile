import { create } from "zustand";
import { adminDebug } from "../debug/adminDebug";
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
    set((prev) => {
      const next = {
        status: "loading" as const,
      };

      adminDebug("sessionStore.setLoading", {
        prevStatus: prev.status,
        nextStatus: next.status,
        prevUserRole: prev.user?.role ?? null,
      });

      return next;
    }),

  setGuest: () =>
    set((prev) => {
      adminDebug("sessionStore.setGuest", {
        prevStatus: prev.status,
        nextStatus: GUEST_BASE.status,
        prevUserRole: prev.user?.role ?? null,
      });

      return {
        ...GUEST_BASE,
      };
    }),

  setAuthedSession: ({ user, accessToken }) =>
    set((prev) => {
      adminDebug("sessionStore.setAuthedSession", {
        prevStatus: prev.status,
        nextStatus: "authed",
        userId: user.id,
        userRole: user.role,
        profileStatus: user.profileStatus,
        emailVerifiedAt: user.emailVerifiedAt ?? null,
        hasAccessToken: Boolean(accessToken),
      });

      return {
        status: "authed",
        user,
        accessToken,
      };
    }),

  setAccessToken: (accessToken) =>
    set((prev) => {
      adminDebug("sessionStore.setAccessToken", {
        status: prev.status,
        userRole: prev.user?.role ?? null,
        hadAccessToken: Boolean(prev.accessToken),
        hasAccessToken: Boolean(accessToken),
      });

      return {
        accessToken,
      };
    }),

  setAuthNotice: (authNotice) =>
    set(() => {
      adminDebug("sessionStore.setAuthNotice", {
        noticeKind: authNotice?.kind ?? null,
        noticeMessage: authNotice?.message ?? null,
      });

      return {
        authNotice,
      };
    }),

  clearAuthNotice: () =>
    set(() => {
      adminDebug("sessionStore.clearAuthNotice");

      return {
        authNotice: null,
      };
    }),

  hardLogout: () =>
    set((prev) => {
      adminDebug("sessionStore.hardLogout", {
        prevStatus: prev.status,
        prevUserRole: prev.user?.role ?? null,
      });

      return {
        ...GUEST_BASE,
      };
    }),
}));