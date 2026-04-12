import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";
import type { UpdateAtencionPayload } from "../types/atenciones.types";

interface UpdateAtencionArgs {
  id: number;
  body: UpdateAtencionPayload;
}

export function useUpdateAtencion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: UpdateAtencionArgs) => {
      const res = await atencionesApi.updateAtencion(id, body);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar la atención")
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
