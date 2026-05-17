import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TurnoAssignmentMode } from "../../../../core/auth/types";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import * as api from "../data/operationalConfig.api";

export const operationalConfigKeys = {
  root: ["operational-config"] as const,
};

export function useOperationalConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: operationalConfigKeys.root,
    queryFn: async () => {
      const res = await api.getOperationalConfig();
      if (!res.ok) throw new Error(getErrorMessage(res.error, "No pude cargar la configuración"));
      return res.data;
    },
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (mode: TurnoAssignmentMode) => {
      const res = await api.updateTurnoAssignmentMode(mode);
      if (!res.ok) throw new Error(getErrorMessage(res.error, "No pude actualizar el modo"));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationalConfigKeys.root });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    config: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updateModeAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
