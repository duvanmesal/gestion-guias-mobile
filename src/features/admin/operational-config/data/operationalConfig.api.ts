import { authRequest } from "../../../../core/http/authInterceptor";
import type { ApiResult } from "../../../../core/http/types";
import type { TurnoAssignmentMode } from "../../../../core/auth/types";
import type { OperationalConfig } from "../types/operationalConfig.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

export function getOperationalConfig(): Promise<ApiResult<OperationalConfig>> {
  return authRequest<OperationalConfig>("/operational-config", {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateTurnoAssignmentMode(
  mode: TurnoAssignmentMode
): Promise<ApiResult<OperationalConfig>> {
  return authRequest<OperationalConfig>("/operational-config/turnos-assignment-mode", {
    method: "PATCH",
    body: { mode },
    headers: { ...PLATFORM_HEADER },
  });
}
