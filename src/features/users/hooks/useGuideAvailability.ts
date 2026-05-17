import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import { useSessionStore } from "../../../core/auth/sessionStore";
import * as usersApi from "../data/users.api";
import { usersKeys } from "../data/users.keys";

export function useGuideAvailability(enabled = true) {
  const queryClient = useQueryClient();
  const user = useSessionStore((s) => s.user);
  const accessToken = useSessionStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: usersKeys.guideAvailability(),
    queryFn: async () => {
      const res = await usersApi.getMyAvailability();
      if (!res.ok) throw new Error(getErrorMessage(res.error, "No pude cargar tu disponibilidad"));
      return res.data;
    },
    enabled,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (disponible: boolean) => {
      const res = await usersApi.updateMyAvailability(disponible);
      if (!res.ok) throw new Error(getErrorMessage(res.error, "No pude actualizar tu disponibilidad"));
      return res.data;
    },
    onSuccess: (data) => {
      if (user) {
        useSessionStore.getState().setAuthedSession({
          accessToken: accessToken ?? "",
          user: {
            ...user,
            disponibleParaTurnos: data.disponibleParaTurnos,
            disponibilidadUpdatedAt: data.disponibilidadUpdatedAt,
            pendingPenalty: data.pendingPenalty,
            turnoAssignmentMode: data.turnoAssignmentMode ?? user.turnoAssignmentMode,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: usersKeys.guideAvailability() });
      queryClient.invalidateQueries({ queryKey: usersKeys.me() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: usersKeys.guidesLookup() });
    },
  });

  return {
    availability: query.data ?? null,
    isLoading: query.isLoading,
    setAvailability: mutation.mutate,
    setAvailabilityAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: query.error,
  };
}
