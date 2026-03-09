import type {
  Role,
  ProfileStatus,
  UserDocumentType,
} from "../../../core/auth/types";

export type DocumentType = UserDocumentType;

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
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  email?: string;
  telefono?: string | null;
  documento?: string | null;
  documentType?: UserDocumentType | null;
  documentNumber?: string | null;
  rol?: Role;
  role?: Role;
  profileStatus: ProfileStatus;
  profileCompletedAt?: string | null;
  emailVerifiedAt?: string | null;
  activo?: boolean;
}

export type GuidesLookupResponse = GuideLookupItem[];