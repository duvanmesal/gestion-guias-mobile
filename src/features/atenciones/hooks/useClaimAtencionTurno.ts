import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";
import { turnosKeys } from "../../turnos/data/turnos.keys";

export function useClaimAtencionTurno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await atencionesApi.claimAtencionTurno(id);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude tomar un turno disponible")
        );
      }
      return res.data;
    },
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: atencionesKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: atencionesKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: atencionesKeys.turnos(id) }),
        queryClient.invalidateQueries({ queryKey: atencionesKeys.summary(id) }),
        queryClient.invalidateQueries({ queryKey: turnosKeys.all }),
        queryClient.invalidateQueries({ queryKey: turnosKeys.meLists() }),
        queryClient.invalidateQueries({ queryKey: turnosKeys.meNext() }),
        queryClient.invalidateQueries({ queryKey: turnosKeys.meActive() }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
