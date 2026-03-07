import type { SessionUser } from "../../../core/auth/types";
import type { MeUserDTO } from "../types/auth.types";

export function mapMeToSessionUser(dto: MeUserDTO): SessionUser {
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