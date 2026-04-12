export type AtencionStatus = "ACTIVE" | "INACTIVE";

export type AtencionOperationalStatus =
  | "PLANNED"
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "CLOSED";

export type TurnoStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

export interface AtencionSupervisorUser {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
}

export interface AtencionSupervisorRef {
  id: number;
  usuario: AtencionSupervisorUser;
}

export interface AtencionRecaladaRef {
  id: number;
  codigoRecalada: string;
  operationalStatus: string;
  fechaLlegada: string;
  fechaSalida: string | null;
  buque?: { id: number; nombre: string };
}

export interface AtencionTurnoGuia {
  id: string;
  usuario?: {
    id: string;
    email: string;
    nombres: string;
    apellidos: string;
  } | null;
}

export interface AtencionTurno {
  id: number;
  numero: number;
  status: TurnoStatus;
  guiaId: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  canceledAt?: string | null;
  guia?: AtencionTurnoGuia | null;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface AtencionItem {
  id: number;
  recaladaId: number;
  supervisorId: number;
  turnosTotal: number;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  status: AtencionStatus;
  operationalStatus: AtencionOperationalStatus;
  createdById: string;
  canceledAt: string | null;
  cancelReason: string | null;
  canceledById: string | null;
  createdAt: string;
  updatedAt: string;
  supervisor?: AtencionSupervisorRef;
  recalada?: AtencionRecaladaRef;
  turnos?: AtencionTurno[];
}

export interface AtencionListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  from?: string;
  to?: string;
  filters?: {
    recaladaId?: number;
    supervisorId?: string;
    status?: AtencionStatus;
    operationalStatus?: AtencionOperationalStatus;
  };
}

export interface ListAtencionesParams {
  from?: string;
  to?: string;
  recaladaId?: number;
  supervisorId?: string;
  status?: AtencionStatus;
  operationalStatus?: AtencionOperationalStatus | "";
  page?: number;
  pageSize?: number;
}

export interface AtencionSummary {
  turnosTotal: number;
  availableCount: number;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  canceledCount: number;
  noShowCount: number;
}

export interface CreateAtencionPayload {
  recaladaId: number;
  fechaInicio: string;
  fechaFin: string;
  turnosTotal: number;
  descripcion?: string;
}

export interface UpdateAtencionPayload {
  fechaInicio?: string;
  fechaFin?: string;
  turnosTotal?: number;
  descripcion?: string | null;
  status?: AtencionStatus;
}
