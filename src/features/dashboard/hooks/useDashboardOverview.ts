import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as dashboardApi from "../data/dashboard.api";

export function useDashboardOverview() {
  const tzOffsetMinutes = -new Date().getTimezoneOffset();

  return useQuery({
    queryKey: ["dashboard", "overview", tzOffsetMinutes],
    queryFn: async ({ signal }) => {
      const res = await dashboardApi.getDashboardOverview({
        tzOffsetMinutes,
        signal,
      });

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el dashboard")
        );
      }

      return res.data;
    },
    staleTime: 45_000,
    refetchOnWindowFocus: false,
  });
}