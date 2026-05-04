import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../data/users.api";
import { usersKeys } from "../data/users.keys";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import type { SessionsResponse, UserSessionItem } from "../types/users.types";

function normalizeSessions(payload: SessionsResponse | null | undefined): UserSessionItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.sessions)) return payload.sessions;
  return [];
}

export function useSessions() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: usersKeys.sessions(),
    queryFn: async () => {
      const res = await usersApi.getSessions();
      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar tus sesiones"));
      }
      return normalizeSessions(res.data);
    },
    staleTime: 60_000,
  });

  const revoke = useMutation<void, Error, string>({
    mutationFn: async (sessionId) => {
      const res = await usersApi.revokeSession(sessionId);
      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cerrar esa sesión"));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.sessions() });
    },
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    revokeSession: revoke.mutateAsync,
    isRevokingSession: revoke.isPending,
  };
}

