import type { Role } from "../../../core/auth/types";

export type DashboardWidgetTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type DashboardWidgetType = "card" | "list" | "kpi" | "cta" | "alert";

export interface DashboardWidgetAction {
  label: string;
  action: "navigate" | "api";
  to?: string;
  method?: "POST" | "PATCH";
  endpoint?: string;
  body?: unknown;
}

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  subtitle?: string;
  tone?: DashboardWidgetTone;
  icon?: string;
  data?: unknown;
  actions?: DashboardWidgetAction[];
}

export interface DashboardMilestone {
  kind:
    | "RECALADA_ARRIVAL"
    | "RECALADA_DEPARTURE"
    | "ATENCION_START"
    | "ATENCION_END";
  at: string;
  title: string;
  ref: {
    recaladaId?: number;
    atencionId?: number;
    turnoId?: number;
  };
}

export interface TurnoLite {
  id: number;
  numero: number;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  atencion: {
    id: number;
    fechaInicio: string;
    fechaFin: string;
    recalada: {
      id: number;
      codigoRecalada: string;
      fechaLlegada: string;
      fechaSalida: string | null;
      operationalStatus: string;
      buque: {
        nombre: string;
      };
    };
  };
}

export interface AtencionDisponibleLite {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  operationalStatus: string;
  recalada: {
    id: number;
    codigoRecalada: string;
    fechaLlegada: string;
    fechaSalida: string | null;
    operationalStatus: string;
    buque: {
      nombre: string;
    };
  };
  availableTurnos: number;
}

export interface GuiaOverview {
  nextTurno: TurnoLite | null;
  activeTurno: TurnoLite | null;
  atencionesDisponibles: AtencionDisponibleLite[];
}

export interface SupervisorAlert {
  code: "OVERDUE_RECALADAS" | "UNASSIGNED_TURNOS" | "CANCELED_TURNOS" | string;
  label: string;
  count: number;
}

export interface SupervisorOverview {
  counts: {
    recaladas: number;
    atenciones: number;
    turnos: number;
    turnosAssigned?: number;
    turnosAvailable?: number;
    turnosInProgress?: number;
    turnosDone?: number;
    turnosCanceled?: number;
    overdueRecaladas?: number;
  };
  guides?: {
    activos: number;
    asignados: number;
    libres: number;
  };
  turnosBreakdown?: Record<string, number>;
  alerts?: SupervisorAlert[];
  upcoming: DashboardMilestone[];
}

export interface DashboardOverviewResponse {
  role: Role;
  date: string;
  tzOffsetMinutes: number;
  generatedAt: string;
  serverTime: string;
  dateContext: {
    date: string;
    timezoneHint: string;
  };
  widgets: DashboardWidget[];
  supervisor?: SupervisorOverview;
  guia?: GuiaOverview;
}