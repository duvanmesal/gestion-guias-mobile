import { authRequest } from "../../../core/http/authInterceptor";
import type { ApiResult } from "../../../core/http/types";
import type {
  CompleteProfileRequest,
  CompleteProfileResponse,
  GuidesLookupResponse,
  GuideAvailabilityResponse,
  SessionsResponse,
  UpdateMeRequest,
  UpdateMeResponse,
  UserMeResponse,
} from "../types/users.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

export function completeProfile(
  body: CompleteProfileRequest
): Promise<ApiResult<CompleteProfileResponse>> {
  return authRequest<CompleteProfileResponse>("/users/me/profile", {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateMe(
  body: UpdateMeRequest
): Promise<ApiResult<UpdateMeResponse>> {
  return authRequest<UpdateMeResponse>("/users/me", {
    method: "PATCH",
    body,
  });
}

export function getGuides(params?: {
  activo?: boolean;
  disponible?: boolean;
  penalizado?: boolean;
}): Promise<ApiResult<GuidesLookupResponse>> {
  const search = new URLSearchParams();
  if (typeof params?.activo === "boolean") search.set("activo", String(params.activo));
  if (typeof params?.disponible === "boolean") search.set("disponible", String(params.disponible));
  if (typeof params?.penalizado === "boolean") search.set("penalizado", String(params.penalizado));
  const qs = search.toString();

  return authRequest<GuidesLookupResponse>(`/users/guides${qs ? `?${qs}` : ""}`, {
    headers: { ...PLATFORM_HEADER },
  });
}

export function getMe(): Promise<ApiResult<UserMeResponse>> {
  return authRequest<UserMeResponse>("/users/me", {
    method: "GET",
    headers: {
      "X-Client-Platform": "MOBILE",
    },
  });
}

export function getMyAvailability(): Promise<ApiResult<GuideAvailabilityResponse>> {
  return authRequest<GuideAvailabilityResponse>("/users/me/disponibilidad", {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateMyAvailability(
  disponible: boolean
): Promise<ApiResult<GuideAvailabilityResponse>> {
  return authRequest<GuideAvailabilityResponse>("/users/me/disponibilidad", {
    method: "PATCH",
    body: { disponible },
    headers: { ...PLATFORM_HEADER },
  });
}

export function getSessions(): Promise<ApiResult<SessionsResponse>> {
  return authRequest<SessionsResponse>("/auth/sessions", {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
  });
}

export function revokeSession(sessionId: string): Promise<ApiResult<void>> {
  return authRequest<void>(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}
