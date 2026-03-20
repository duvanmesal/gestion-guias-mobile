import type { Role, ProfileStatus } from "../../../../core/auth/types";

export type InvitationStatus = "PENDING" | "USED" | "EXPIRED";
export type InvitationAction = "CREATED" | "RESENT";

export interface InvitationActor {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
}

export interface InvitationLinkedUser {
  id: string;
  email: string;
  profileStatus: ProfileStatus;
}

export interface InvitationItem {
  id: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  inviter: InvitationActor | null;
  user: InvitationLinkedUser | null;
}

export interface CreateInvitationPayload {
  email: string;
  role: Role;
}

export interface CreateInvitationResponse {
  action: InvitationAction;
  invitation: Pick<
    InvitationItem,
    "id" | "email" | "role" | "status" | "expiresAt"
  >;
  tempPassword?: string;
}

export interface ListInvitationsParams {
  status?: InvitationStatus;
  email?: string;
}