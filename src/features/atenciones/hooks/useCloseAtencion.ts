import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";

export function useCloseAtencion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await atencionesApi.closeAtencion(id);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cerrar la atención")
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
        queryKey: atencionesKeys.summary(id),
      });
    },
  });
}
