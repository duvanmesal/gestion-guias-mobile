import type { SessionUser } from "../../../core/auth/types";
import type { UserMeResponse } from "../types/users.types";

export function mapUserMeToSessionUser(dto: UserMeResponse): SessionUser {
  const nombres = dto.nombres ?? dto.nombre;
  const apellidos = dto.apellidos ?? dto.apellido;

  return {
    id: dto.id,
    nombre:
      [nombres, apellidos].filter(Boolean).join(" ").trim() ||
      dto.nombre ||
      undefined,
    nombres,
    apellidos,
    email: dto.email,
    telefono: dto.telefono ?? null,
    documentType: dto.documentType ?? null,
    documentNumber: dto.documentNumber ?? dto.documento ?? null,
    role: dto.rol ?? dto.role ?? "GUIA",
    profileStatus: dto.profileStatus,
    profileCompletedAt: dto.profileCompletedAt ?? null,
    emailVerifiedAt: dto.emailVerifiedAt ?? null,
    activo: dto.activo,
  };
}