import type { ListInvitationsParams } from "../types/invitations.types";

export const invitationsKeys = {
  all: ["admin", "invitations"] as const,
  lists: () => ["admin", "invitations", "list"] as const,
  list: (params: ListInvitationsParams) =>
    ["admin", "invitations", "list", params] as const,
};