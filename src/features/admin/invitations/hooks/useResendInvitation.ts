import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { invitationsKeys } from "../data/invitations.keys";
import * as invitationsApi from "../data/invitations.api";

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await invitationsApi.resendInvitation(invitationId);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude reenviar la invitación")
        );
      }

      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: invitationsKeys.lists(),
      });
    },
  });
}