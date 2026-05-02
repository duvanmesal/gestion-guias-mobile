import type { Role, SessionUser } from "../../../core/auth/types";

const LOCALE = "es-CO";

export function getGreetingByHour(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function getDisplayName(user: SessionUser | null | undefined): string {
  if (!user) return "equipo";

  return (
    user.nombres ||
    user.nombre ||
    [user.nombres, user.apellidos].filter(Boolean).join(" ").trim() ||
    user.email ||
    "equipo"
  );
}

export function getRoleLabel(role?: Role | null): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super admin";
    case "SUPERVISOR":
      return "Supervisor";
    case "GUIA":
    default:
      return "Guía";
  }
}

export function formatShortDate(dateLike?: string | null): string {
  if (!dateLike) return "Sin fecha";

  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(dateLike));
}

export function formatTime(dateLike?: string | null): string {
  if (!dateLike) return "--:--";

  return new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateLike));
}

export function formatDateTime(dateLike?: string | null): string {
  if (!dateLike) return "Sin fecha";

  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateLike));
}

export function formatTurnoStatus(status?: string | null): string {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "ASSIGNED":
      return "Asignado";
    case "IN_PROGRESS":
      return "En curso";
    case "COMPLETED":
      return "Completado";
    case "CANCELED":
      return "Cancelado";
    case "NO_SHOW":
      return "Ausente";
    default:
      return status ?? "Sin estado";
  }
}

export function formatMilestoneKind(kind?: string | null): string {
  switch (kind) {
    case "RECALADA_ARRIVAL":
      return "Llegada";
    case "RECALADA_DEPARTURE":
      return "Salida";
    case "ATENCION_START":
      return "Inicio atención";
    case "ATENCION_END":
      return "Fin atención";
    default:
      return kind ?? "Hito";
  }
}

export function pluralize(
  value: number,
  singular: string,
  plural?: string
): string {
  if (value === 1) return `1 ${singular}`;
  return `${value} ${plural ?? `${singular}s`}`;
}