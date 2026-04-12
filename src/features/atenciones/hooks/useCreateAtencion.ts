import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";
import type { CreateAtencionPayload } from "../types/atenciones.types";

export function useCreateAtencion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAtencionPayload) => {
      const res = await atencionesApi.createAtencion(payload);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude crear la atención")
        );
      }
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["recaladas", "atenciones", variables.recaladaId],
      });
    },
  });
}
