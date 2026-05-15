export type RecaladaOperationalStatus =
  | "SCHEDULED"
  | "ARRIVED"
  | "DEPARTED"
  | "CANCELED";

export type RecaladaSource = "MANUAL" | "IMPORT";

export interface RecaladaBuqueRef {
  id: number;
  nombre: string;
}

export interface RecaladaPaisRef {
  id: number;
  codigo: string;
  nombre: string;
}

export interface RecaladaSupervisorUser {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
}

export interface RecaladaSupervisorRef {
  id: number;
  usuario: RecaladaSupervisorUser;
}

export interface RecaladaItem {
  id: number;
  codigoRecalada: string;
  fechaLlegada: string;
  fechaSalida: string | null;
  arrivedAt: string | null;
  departedAt: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  status: string;
  operationalStatus: RecaladaOperationalStatus;
  terminal: string | null;
  muelle: string | null;
  pasajerosEstimados: number | null;
  tripulacionEstimada: number | null;
  observaciones: string | null;
  fuente: RecaladaSource;
  createdAt: string;
  updatedAt: string;
  buque: RecaladaBuqueRef;
  paisOrigen: RecaladaPaisRef;
  supervisor: RecaladaSupervisorRef;
}

export interface RecaladaListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  from?: string;
  to?: string;
  q?: string;
  filters: {
    operationalStatus?: RecaladaOperationalStatus;
    buqueId?: number;
    paisOrigenId?: number;
    overdueDeparture?: boolean;
  };
}

export interface ListRecaladasParams {
  from?: string;
  to?: string;
  operationalStatus?: RecaladaOperationalStatus | "";
  buqueId?: number;
  paisOrigenId?: number;
  q?: string;
  // Filtro operativo: recaladas ARRIVED cuyo zarpe programado ya venció.
  overdueDeparture?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateRecaladaPayload {
  buqueId: number;
  paisOrigenId: number;
  fechaLlegada: string;
  fechaSalida?: string;
  terminal?: string;
  muelle?: string;
  pasajerosEstimados?: number;
  tripulacionEstimada?: number;
  observaciones?: string;
  fuente?: RecaladaSource;
}

export interface UpdateRecaladaPayload {
  buqueId?: number;
  paisOrigenId?: number;
  fechaLlegada?: string;
  fechaSalida?: string;
  terminal?: string;
  muelle?: string;
  pasajerosEstimados?: number;
  tripulacionEstimada?: number;
  observaciones?: string;
  fuente?: RecaladaSource;
}

export interface RecaladaAtencionTurno {
  id: number;
  numero: number;
  status: string;
  guiaId: string | null;
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecaladaAtencionItem {
  id: number;
  recaladaId: number;
  supervisorId: number;
  turnosTotal: number;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  status: string;
  operationalStatus: string;
  createdById: string;
  canceledAt: string | null;
  cancelReason: string | null;
  canceledById: string | null;
  createdAt: string;
  updatedAt: string;
  supervisor: RecaladaSupervisorRef;
  turnos: RecaladaAtencionTurno[];
}
