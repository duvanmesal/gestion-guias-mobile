import type { SessionUser, UserDocumentType } from "../../../core/auth/types";

const DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  TI: "Tarjeta de identidad",
  PASSPORT: "Pasaporte",
};

export function buildFullName(
  user: Pick<SessionUser, "nombres" | "apellidos" | "nombre">
): string {
  const full = [user.nombres, user.apellidos].filter(Boolean).join(" ").trim();
  return full || user.nombre || "Sin nombre registrado";
}

export function getDocumentTypeLabel(type?: UserDocumentType | null): string {
  if (!type) return "No registrado";
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

export function maskDocumentNumber(value?: string | null): string {
  if (!value) return "No registrado";

  const trimmed = value.trim();
  if (!trimmed) return "No registrado";
  if (trimmed.length <= 4) return trimmed;

  const visible = trimmed.slice(-4);
  const masked = "•".repeat(Math.max(trimmed.length - 4, 2));
  return `${masked}${visible}`;
}

export function getRoleLabel(role: SessionUser["role"]): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super administrador";
    case "SUPERVISOR":
      return "Supervisor";
    default:
      return "Guía";
  }
}

export function getVerificationLabel(
  user: Pick<SessionUser, "emailVerifiedAt">
): string {
  return user.emailVerifiedAt ? "Verificado" : "Pendiente";
}

export function getProfileStatusLabel(status: SessionUser["profileStatus"]): string {
  return status === "COMPLETE" ? "Completo" : "Incompleto";
}