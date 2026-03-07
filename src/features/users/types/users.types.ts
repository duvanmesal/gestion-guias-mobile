import type { Role, ProfileStatus } from "../../../core/auth/types";

export type DocumentType = "CC" | "CE" | "PASSPORT" | "TI";

export interface UpdateProfileRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  documentType: DocumentType;
  documentNumber: string;
}

export interface UpdateProfileResponse {
  profileStatus: ProfileStatus;
}

export interface GuideLookupItem {
  id: string;
  nombre?: string;
  email?: string;
}

export interface UserMeResponse {
  id: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string | null;
  documento?: string | null;
  role: Role;
  profileStatus: ProfileStatus;
  emailVerifiedAt?: string | null;
  activo?: boolean;
}

export type GuidesLookupResponse = GuideLookupItem[];
