import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";
import type { ListTurnosMeParams } from "../types/turnos.types";

export function useMyTurnos(params: ListTurnosMeParams, enabled = true) {
  return useQuery({
    queryKey: turnosKeys.meList(params),
    queryFn: async ({ signal }) => {
      const res = await turnosApi.getMyTurnos(params, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar tus turnos")
        );
      }
      return { items: res.data ?? [], meta: res.meta };
    },
    enabled,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}
