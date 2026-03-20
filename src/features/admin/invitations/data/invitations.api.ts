import {
  authRequest,
  authRequestEnvelope,
} from "../../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../../core/http/types";
import type {
  CreateInvitationPayload,
  CreateInvitationResponse,
  InvitationItem,
  ListInvitationsParams,
} from "../types/invitations.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildSearch(params: ListInvitationsParams = {}) {
  const search = new URLSearchParams();

  if (params.status) search.set("status", params.status);
  if (params.email?.trim()) {
    search.set("email", params.email.trim().toLowerCase());
  }

  return search.toString();
}

export function getInvitations(
  params: ListInvitationsParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<InvitationItem[]>> {
  const query = buildSearch(params);

  return authRequestEnvelope<InvitationItem[]>(
    `/invitations${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}

export function createInvitation(
  body: CreateInvitationPayload
): Promise<ApiResult<CreateInvitationResponse>> {
  return authRequest<CreateInvitationResponse>("/invitations", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function resendInvitation(
  invitationId: string
): Promise<ApiResult<void>> {
  return authRequest<void>(`/invitations/${invitationId}/resend`, {
    method: "POST",
    headers: { ...PLATFORM_HEADER },
  });
}