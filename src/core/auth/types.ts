export type Role = "GUIA" | "SUPERVISOR" | "SUPER_ADMIN";
export type ProfileStatus = "INCOMPLETE" | "COMPLETE";
export type SessionStatus = "loading" | "guest" | "authed";
export type UserDocumentType = "CC" | "CE" | "PASSPORT" | "TI";

export type AuthNoticeKind = "info" | "success" | "warning" | "danger";

export interface AuthNotice {
  kind: AuthNoticeKind;
  message: string;
}

export interface SessionUser {
  id: string;
  nombre?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string | null;
  documentType?: UserDocumentType | null;
  documentNumber?: string | null;
  role: Role;
  profileStatus: ProfileStatus;
  profileCompletedAt?: string | null;
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
  authNotice: AuthNotice | null;

  setLoading: () => void;
  setGuest: () => void;
  setAuthedSession: (payload: AuthedPayload) => void;
  setAccessToken: (token: string | null) => void;
  setAuthNotice: (notice: AuthNotice | null) => void;
  clearAuthNotice: () => void;
  hardLogout: () => void;
}