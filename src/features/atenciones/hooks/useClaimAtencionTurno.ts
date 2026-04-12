import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";

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
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.turnos(id),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.summary(id),
      });
    },
  });
}
