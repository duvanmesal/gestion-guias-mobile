import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";
import type { AtencionEvaluationPayload } from "../types/atenciones.types";

interface UpsertAtencionEvaluationInput {
  id: number;
  payload: AtencionEvaluationPayload;
}

export function useUpsertAtencionEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpsertAtencionEvaluationInput) => {
      const res = await atencionesApi.upsertAtencionEvaluation(id, payload);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude guardar la evaluación")
        );
      }
      return res.data;
    },
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: atencionesKeys.lists(),
      });
    },
  });
}
