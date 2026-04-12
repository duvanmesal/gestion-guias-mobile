import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";
import type { ListTurnosParams } from "../types/turnos.types";

export function useTurnosList(params: ListTurnosParams) {
  return useQuery({
    queryKey: turnosKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await turnosApi.getTurnos(params, signal);
      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar los turnos"));
      }
      return { items: res.data ?? [], meta: res.meta };
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}
