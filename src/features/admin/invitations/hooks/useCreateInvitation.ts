import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { invitationsKeys } from "../data/invitations.keys";
import * as invitationsApi from "../data/invitations.api";
import type { CreateInvitationPayload } from "../types/invitations.types";

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInvitationPayload) => {
      const res = await invitationsApi.createInvitation(payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude crear la invitación")
        );
      }

      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: invitationsKeys.lists(),
      });
    },
  });
}