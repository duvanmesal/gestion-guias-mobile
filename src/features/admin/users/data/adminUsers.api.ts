import {
  authRequest,
  authRequestEnvelope,
} from "../../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../../core/http/types";
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUsersPaginationMeta,
  CreateAdminUserPayload,
  ListAdminUsersParams,
  UpdateAdminUserPayload,
} from "../types/adminUsers.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildSearch(params: ListAdminUsersParams = {}) {
  const search = new URLSearchParams();

  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.rol) search.set("rol", params.rol);
  if (typeof params.activo === "boolean") {
    search.set("activo", String(params.activo));
  }
  if (params.profileStatus) search.set("profileStatus", params.profileStatus);

  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  search.set("orderBy", "createdAt");
  search.set("orderDir", "desc");

  return search.toString();
}

export function getAdminUsers(
  params: ListAdminUsersParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<AdminUserListItem[], AdminUsersPaginationMeta>> {
  const query = buildSearch(params);

  return authRequestEnvelope<AdminUserListItem[], AdminUsersPaginationMeta>(
    `/users${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}

export function getAdminUserById(
  id: string,
  signal?: AbortSignal
): Promise<ApiResult<AdminUserDetail>> {
  return authRequest<AdminUserDetail>(`/users/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function createAdminUser(
  body: CreateAdminUserPayload
): Promise<ApiResult<AdminUserDetail>> {
  return authRequest<AdminUserDetail>("/users", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateAdminUser(
  id: string,
  body: UpdateAdminUserPayload
): Promise<ApiResult<AdminUserDetail>> {
  return authRequest<AdminUserDetail>(`/users/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function deactivateAdminUser(id: string): Promise<ApiResult<void>> {
  return authRequest<void>(`/users/${id}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}