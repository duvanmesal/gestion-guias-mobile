import type { Role, TurnoAssignmentMode } from "../../../core/auth/types";

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
  assignmentMode: TurnoAssignmentMode;
  disponibilidad: {
    guiaId: string | null;
    disponibleParaTurnos: boolean;
    disponibilidadUpdatedAt: string | null;
    pendingPenalty: boolean;
  };
  nextTurno: TurnoLite | null;
  activeTurno: TurnoLite | null;
  atencionesDisponibles: AtencionDisponibleLite[];
}

export interface SupervisorAlert {
  code: "OVERDUE_RECALADAS" | "UNASSIGNED_TURNOS" | "CANCELED_TURNOS" | string;
  label: string;
  count: number;
}

export interface WorkloadTrendDay {
  date: string;
  atenciones: number;
  turnos: number;
  completed: number;
  noShows: number;
  canceled: number;
  checkInsConfirmed: number;
}

export interface CheckInFlowStats {
  solicitados: number;
  pendientes: number;
  confirmados: number;
  rechazados: number;
  avgResponseTimeMin: number | null;
  pendientesAntiguos: number;
}

export interface GuideCapacityStats {
  activos: number;
  disponibles: number;
  asignados: number;
  libres: number;
  noDisponibles: number;
  penalizados: number;
  disponibilidadRate: number;
  utilizacionRate: number;
  penalizacionRate: number;
}

export interface EvaluationStats {
  atencionesEnRango: number;
  evaluadas: number;
  pendientesEval: number;
  avgCalificacion: number | null;
  distribucion: {
    SATISFACTORIA: number;
    CON_NOVEDADES: number;
    NO_SATISFACTORIA: number;
  };
}

export interface PriorityAction {
  type: string;
  count: number;
  label: string;
  to: string;
}

export interface SupervisorAnalytics {
  range: { startDate: string; endDate: string; days: number; tz: string };
  kpis: {
    assignmentRate: number;
    executionRate: number;
    noShowRate: number;
    guideAvailabilityRate: number;
    utilizacionRate: number;
    penalizacionRate: number;
    pendingCheckIns: number;
    overdueRecaladas: number;
    unresolvedTurnos: number;
    pendientesEval: number;
  };
  workloadTrend: WorkloadTrendDay[];
  turnoStatus: Record<string, number>;
  checkInFlow: CheckInFlowStats;
  guideCapacity: GuideCapacityStats;
  evaluations: EvaluationStats;
  priorityActions: PriorityAction[];
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
    disponibles?: number;
    noDisponibles?: number;
    penalizados?: number;
  };
  turnosBreakdown?: Record<string, number>;
  alerts?: SupervisorAlert[];
  upcoming: DashboardMilestone[];
  analytics?: SupervisorAnalytics;
}

export interface DashboardOverviewResponse {
  role: Role;
  turnoAssignmentMode: TurnoAssignmentMode;
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
