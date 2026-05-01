import { authRequest } from "../../../core/http/authInterceptor";
import { request } from "../../../core/http/apiClient";
import type { ApiResult } from "../../../core/http/types";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  MeResponse,
  VerifyEmailRequest,
  VerifyEmailConfirmRequest,
  VerifyEmailConfirmResponse,
} from "../types/auth.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LogoutAllRequest {
  verification: {
    method: "code";
    code: string;
  };
}

export function login(payload: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function refresh(payload: RefreshRequest): Promise<ApiResult<RefreshResponse>> {
  return request<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function logout(): Promise<ApiResult<void>> {
  return authRequest<void>("/auth/logout", {
    method: "POST",
    headers: { ...PLATFORM_HEADER },
  });
}

export function logoutAll(payload: LogoutAllRequest): Promise<ApiResult<void>> {
  return authRequest<void>("/auth/logout-all", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function requestLogoutAllCode(): Promise<ApiResult<{ message: string }>> {
  return authRequest<{ message: string }>("/auth/logout-all/request", {
    method: "POST",
    headers: { ...PLATFORM_HEADER },
  });
}

export function me(): Promise<ApiResult<MeResponse>> {
  return authRequest<MeResponse>("/auth/me", {
    headers: { ...PLATFORM_HEADER },
  });
}

export function requestEmailVerification(
  payload: VerifyEmailRequest
): Promise<ApiResult<{ message: string }>> {
  return request<{ message: string }>("/auth/verify-email/request", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function confirmEmailVerification(
  payload: VerifyEmailConfirmRequest
): Promise<ApiResult<VerifyEmailConfirmResponse>> {
  return request<VerifyEmailConfirmResponse>("/auth/verify-email/confirm", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function changePassword(
  payload: ChangePasswordRequest
): Promise<ApiResult<{ message: string }>> {
  return authRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function forgotPassword(payload: {
  email: string;
}): Promise<ApiResult<{ message: string }>> {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}

export function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<ApiResult<{ message: string }>> {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload,
    headers: { ...PLATFORM_HEADER },
  });
}
