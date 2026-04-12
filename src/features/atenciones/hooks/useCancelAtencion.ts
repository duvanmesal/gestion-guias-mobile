import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";

interface CancelAtencionArgs {
  id: number;
  reason: string;
}

export function useCancelAtencion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: CancelAtencionArgs) => {
      const res = await atencionesApi.cancelAtencion(id, { reason });
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cancelar la atención")
        );
      }
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.detail(variables.id),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.turnos(variables.id),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.summary(variables.id),
      });
    },
  });
}
