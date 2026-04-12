import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";
import type { ListAtencionesParams } from "../types/atenciones.types";

export function useAtencionesList(params: ListAtencionesParams) {
  return useQuery({
    queryKey: atencionesKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await atencionesApi.getAtenciones(params, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar las atenciones")
        );
      }
      return { items: res.data ?? [], meta: res.meta };
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}
