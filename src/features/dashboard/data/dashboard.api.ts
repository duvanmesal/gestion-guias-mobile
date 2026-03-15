import { authRequest } from "../../../core/http/authInterceptor";
import type { ApiResult } from "../../../core/http/types";
import type { DashboardOverviewResponse } from "../types/dashboard.types";

interface GetDashboardOverviewParams {
  tzOffsetMinutes?: number;
  upcomingLimit?: number;
  availableAtencionesLimit?: number;
  signal?: AbortSignal;
}

export function getDashboardOverview(
  params: GetDashboardOverviewParams = {}
): Promise<ApiResult<DashboardOverviewResponse>> {
  const {
    tzOffsetMinutes = -new Date().getTimezoneOffset(),
    upcomingLimit = 6,
    availableAtencionesLimit = 6,
    signal,
  } = params;

  const search = new URLSearchParams({
    tzOffsetMinutes: String(tzOffsetMinutes),
    upcomingLimit: String(upcomingLimit),
    availableAtencionesLimit: String(availableAtencionesLimit),
  });

  return authRequest<DashboardOverviewResponse>(
    `/dashboard/overview?${search.toString()}`,
    {
      method: "GET",
      headers: {
        "X-Client-Platform": "MOBILE",
      },
      signal,
    }
  );
}