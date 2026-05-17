import type { TurnoAssignmentMode } from "../../../../core/auth/types";

export interface OperationalConfig {
  id: string;
  turnoAssignmentMode: TurnoAssignmentMode;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
}
