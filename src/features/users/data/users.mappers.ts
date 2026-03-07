import type { SessionUser } from "../../../core/auth/types";
import type { UserMeResponse } from "../types/users.types";

export function mapUserMeToSessionUser(dto: UserMeResponse): SessionUser {
  return {
    id: dto.id,
    nombre: dto.nombre,
    email: dto.email,
    role: dto.role,
    profileStatus: dto.profileStatus,
    emailVerifiedAt: dto.emailVerifiedAt ?? null,
    activo: dto.activo,
  };
}