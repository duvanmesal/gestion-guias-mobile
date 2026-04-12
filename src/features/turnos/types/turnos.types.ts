export type TurnoStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

export interface TurnoGuiaUsuario {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
}

export interface TurnoGuiaRef {
  id: string;
  usuario?: TurnoGuiaUsuario | null;
}

export interface TurnoRecaladaRef {
  id: number;
  codigoRecalada: string;
  status?: string;
  operationalStatus?: string;
}

export interface TurnoAtencionRef {
  id: number;
  recaladaId: number;
  status?: string;
  operationalStatus?: string;
  fechaInicio?: string;
  fechaFin?: string;
  recalada?: TurnoRecaladaRef | null;
}

export interface TurnoItem {
  id: number;
  atencionId: number;
  guiaId: string | null;
  numero: number;
  status: TurnoStatus;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  canceledAt?: string | null;
  cancelReason?: string | null;
  canceledById?: string | null;
  createdById?: string | null;
  createdAt?: string;
  updatedAt?: string;
  guia?: TurnoGuiaRef | null;
  atencion?: TurnoAtencionRef | null;
}

export interface TurnoListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListTurnosParams {
  dateFrom?: string;
  dateTo?: string;
  atencionId?: number;
  recaladaId?: number;
  status?: TurnoStatus;
  guiaId?: string;
  assigned?: boolean;
  page?: number;
  pageSize?: number;
}

export type ListTurnosMeParams = Omit<ListTurnosParams, "assigned" | "guiaId">;
