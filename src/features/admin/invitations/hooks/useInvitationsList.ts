import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { invitationsKeys } from "../data/invitations.keys";
import * as invitationsApi from "../data/invitations.api";
import type { ListInvitationsParams } from "../types/invitations.types";

export function useInvitationsList(params: ListInvitationsParams) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const status = useSessionStore((state) => state.status);

  return useQuery({
    queryKey: invitationsKeys.list(params),
    enabled: status === "authed" && Boolean(accessToken),
    queryFn: async ({ signal }) => {
      const res = await invitationsApi.getInvitations(params, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar las invitaciones")
        );
      }

      return res.data ?? [];
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}