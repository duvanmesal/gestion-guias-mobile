import type { TurnoAssignmentMode } from "../../../../core/auth/types";

export interface OperationalConfig {
  id: string;
  turnoAssignmentMode: TurnoAssignmentMode;
  /** Epica 6: duración (horas) de la penalización por NO_SHOW. Default 48. */
  noShowPenaltyDurationHours: number;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
}
