import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";

export function useMyNextTurno(enabled = true) {
  return useQuery({
    queryKey: turnosKeys.meNext(),
    enabled,
    queryFn: async ({ signal }) => {
      const res = await turnosApi.getMyNextTurno(signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar tu próximo turno")
        );
      }
      return res.data ?? null;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
