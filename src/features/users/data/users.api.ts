import { authRequest } from "../../../core/http/authInterceptor";
import type { ApiResult } from "../../../core/http/types";
import type {
  CompleteProfileRequest,
  CompleteProfileResponse,
  GuidesLookupResponse,
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

export function getGuides(): Promise<ApiResult<GuidesLookupResponse>> {
  return authRequest<GuidesLookupResponse>("/users/guides", {
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