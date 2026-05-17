import type {
  Role,
  ProfileStatus,
  UserDocumentType,
  TurnoAssignmentMode,
} from "../../../core/auth/types";

export type DocumentType = UserDocumentType;

export interface CompleteProfileRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  documentType: DocumentType;
  documentNumber: string;
  currentPassword: string;
  newPassword: string;
}

export type CompleteProfileResponse = {
  profileStatus: ProfileStatus;
};

export interface UpdateMeRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
}

export interface UpdateMeResponse {
  id: string;
  email?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
  rol?: Role;
  role?: Role;
  activo?: boolean;
  profileStatus: ProfileStatus;
  profileCompletedAt?: string | null;
  emailVerifiedAt?: string | null;
  guiaId?: string | null;
  supervisorId?: string | null;
  disponibleParaTurnos?: boolean | null;
  disponibilidadUpdatedAt?: string | null;
  pendingPenalty?: boolean | null;
  turnoAssignmentMode?: TurnoAssignmentMode;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuideLookupItem {
  guiaId: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
  disponibleParaTurnos: boolean;
  disponibilidadUpdatedAt: string | null;
  pendingPenalty: boolean;
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
  guiaId?: string | null;
  supervisorId?: string | null;
  disponibleParaTurnos?: boolean | null;
  disponibilidadUpdatedAt?: string | null;
  pendingPenalty?: boolean | null;
  turnoAssignmentMode?: TurnoAssignmentMode;
}

export type GuidesLookupResponse = GuideLookupItem[];

export interface GuideAvailabilityResponse {
  guiaId: string;
  disponibleParaTurnos: boolean;
  disponibilidadUpdatedAt: string | null;
  pendingPenalty: boolean;
  turnoAssignmentMode?: TurnoAssignmentMode;
}

export interface UserSessionItem {
  id: string;
  userId: string;
  platform: "WEB" | "MOBILE";
  deviceId?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
  lastRotatedAt?: string | null;
  lastActivityAt?: string | null;
  isCurrent?: boolean;
}

export type SessionsResponse = UserSessionItem[] | { sessions?: UserSessionItem[] };
