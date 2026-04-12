import type { TurnoStatus } from "../types/turnos.types";

export function getTurnoTone(
  status: TurnoStatus
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "AVAILABLE":
      return "info";
    case "ASSIGNED":
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELED":
    case "NO_SHOW":
      return "danger";
    default:
      return "info";
  }
}

export function getTurnoLabel(status: TurnoStatus): string {
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
      return "No se presentó";
    default:
      return status;
  }
}

export function formatTurnoDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
