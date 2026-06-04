import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";
import type { CloseAtencionPayload } from "../types/atenciones.types";

type CloseAtencionInput =
  | number
  | {
      id: number;
      payload?: CloseAtencionPayload;
    };

export function useCloseAtencion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CloseAtencionInput) => {
      const id = typeof input === "number" ? input : input.id;
      const payload = typeof input === "number" ? undefined : input.payload;
      const res = await atencionesApi.closeAtencion(id, payload);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cerrar la atención")
        );
      }
      return res.data;
    },
    onSuccess: async (_data, input) => {
      const id = typeof input === "number" ? input : input.id;
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.summary(id),
      });
    },
  });
}
