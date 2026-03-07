export type Role = "GUIA" | "SUPERVISOR" | "SUPER_ADMIN";
export type ProfileStatus = "INCOMPLETE" | "COMPLETE";
export type SessionStatus = "loading" | "guest" | "authed";

export interface SessionUser {
  id: string;
  nombre?: string;
  email?: string;
  role: Role;
  profileStatus: ProfileStatus;
  emailVerifiedAt?: string | null;
  activo?: boolean;
}

export interface AuthedPayload {
  user: SessionUser;
  accessToken: string;
}

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  accessToken: string | null;
  setLoading: () => void;
  setGuest: () => void;
  setAuthedSession: (payload: AuthedPayload) => void;
  setAccessToken: (token: string | null) => void;
  hardLogout: () => void;
}