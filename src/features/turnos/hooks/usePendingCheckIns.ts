import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";
import type { PendingCheckInsParams } from "../types/turnos.types";

export function usePendingCheckIns(
  params: PendingCheckInsParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: turnosKeys.pendingCheckIns(),
    queryFn: async ({ signal }) => {
      const res = await turnosApi.getPendingCheckIns(params, signal);
      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar check-ins pendientes"));
      }
      return { items: res.data ?? [], meta: res.meta };
    },
    enabled,
    staleTime: 10_000,
  });
}
