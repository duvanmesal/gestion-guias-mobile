import type { ProfileStatus, Role } from "../../../../core/auth/types";

export interface AdminUsersPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListAdminUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  rol?: Role;
  activo?: boolean;
  profileStatus?: ProfileStatus;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: Role;
  activo: boolean;
  profileStatus: ProfileStatus;
  createdAt: string;
  updatedAt: string;
  guiaId?: string | null;
  supervisorId?: string | null;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: Role;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  guia?: {
    id: string;
    telefono?: string | null;
    direccion?: string | null;
  } | null;
  supervisor?: {
    id: string;
    telefono?: string | null;
  } | null;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  rol: Role;
}

export interface UpdateAdminUserPayload {
  nombres?: string;
  apellidos?: string;
  rol?: Role;
  activo?: boolean;
}