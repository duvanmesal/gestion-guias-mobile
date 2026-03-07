import { authRequest } from "../../../core/http/authInterceptor";
import type { ApiResult } from "../../../core/http/types";
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
  GuidesLookupResponse,
  UserMeResponse
} from "../types/users.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

export function updateProfile(
  body: UpdateProfileRequest
): Promise<ApiResult<UpdateProfileResponse>> {
  return authRequest<UpdateProfileResponse>("/users/me/profile", {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
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