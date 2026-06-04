import {
  authRequest,
  authRequestEnvelope,
} from "../../../../core/http/authInterceptor";
import type {
  ApiEnvelopeResult,
  ApiResult,
} from "../../../../core/http/types";
import type {
  CatalogPaginationMeta,
  ListPuertosParams,
  PuertoDetail,
  PuertoListItem,
  PuertoLookupItem,
  UpsertPuertoPayload,
} from "../types/catalogs.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildSearch(params: ListPuertosParams = {}) {
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

export function getPuertos(
  params: ListPuertosParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<PuertoListItem[], CatalogPaginationMeta>> {
  const query = buildSearch(params);

  return authRequestEnvelope<PuertoListItem[], CatalogPaginationMeta>(
    `/puertos${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}

export function getPuertoById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<PuertoDetail>> {
  return authRequest<PuertoDetail>(`/puertos/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function createPuerto(
  body: UpsertPuertoPayload
): Promise<ApiResult<PuertoDetail>> {
  return authRequest<PuertoDetail>("/puertos", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updatePuerto(
  id: number,
  body: Partial<UpsertPuertoPayload>
): Promise<ApiResult<PuertoDetail>> {
  return authRequest<PuertoDetail>(`/puertos/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function deletePuerto(id: number): Promise<ApiResult<void>> {
  return authRequest<void>(`/puertos/${id}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}

export function getPuertosLookup(
  signal?: AbortSignal
): Promise<ApiResult<PuertoLookupItem[]>> {
  return authRequest<PuertoLookupItem[]>("/puertos/lookup", {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}
