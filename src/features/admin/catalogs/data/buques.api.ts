import {
  authRequest,
  authRequestEnvelope,
} from "../../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../../core/http/types";
import type {
  BuqueDetail,
  BuqueLookupItem,
  BuqueListItem,
  CatalogPaginationMeta,
  ListBuquesParams,
  UpsertBuquePayload,
} from "../types/catalogs.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildSearch(params: ListBuquesParams = {}) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (typeof params.paisId === "number" && Number.isFinite(params.paisId)) {
    search.set("paisId", String(params.paisId));
  }
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));

  return search.toString();
}

export function getBuques(
  params: ListBuquesParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<BuqueListItem[], CatalogPaginationMeta>> {
  const query = buildSearch(params);

  return authRequestEnvelope<BuqueListItem[], CatalogPaginationMeta>(
    `/buques${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}

export function getBuqueById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<BuqueDetail>> {
  return authRequest<BuqueDetail>(`/buques/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function createBuque(
  body: UpsertBuquePayload
): Promise<ApiResult<BuqueDetail>> {
  return authRequest<BuqueDetail>("/buques", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updateBuque(
  id: number,
  body: Partial<UpsertBuquePayload>
): Promise<ApiResult<BuqueDetail>> {
  return authRequest<BuqueDetail>(`/buques/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function deleteBuque(id: number): Promise<ApiResult<void>> {
  return authRequest<void>(`/buques/${id}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}

export function getBuquesLookup(
  signal?: AbortSignal
): Promise<ApiResult<BuqueLookupItem[]>> {
  return authRequest<BuqueLookupItem[]>("/buques/lookup", {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}