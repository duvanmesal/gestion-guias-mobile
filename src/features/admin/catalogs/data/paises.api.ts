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
  ListPaisesParams,
  PaisDetail,
  PaisListItem,
  PaisLookupItem,
  UpsertPaisPayload,
} from "../types/catalogs.types";

const PLATFORM_HEADER = { "X-Client-Platform": "MOBILE" } as const;

function buildSearch(params: ListPaisesParams = {}) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.codigo?.trim()) search.set("codigo", params.codigo.trim());
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));

  return search.toString();
}

export function getPaises(
  params: ListPaisesParams = {},
  signal?: AbortSignal
): Promise<ApiEnvelopeResult<PaisListItem[], CatalogPaginationMeta>> {
  const query = buildSearch(params);

  return authRequestEnvelope<PaisListItem[], CatalogPaginationMeta>(
    `/paises${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { ...PLATFORM_HEADER },
      signal,
    }
  );
}

export function getPaisById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResult<PaisDetail>> {
  return authRequest<PaisDetail>(`/paises/${id}`, {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}

export function createPais(
  body: UpsertPaisPayload
): Promise<ApiResult<PaisDetail>> {
  return authRequest<PaisDetail>("/paises", {
    method: "POST",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function updatePais(
  id: number,
  body: Partial<UpsertPaisPayload>
): Promise<ApiResult<PaisDetail>> {
  return authRequest<PaisDetail>(`/paises/${id}`, {
    method: "PATCH",
    body,
    headers: { ...PLATFORM_HEADER },
  });
}

export function deletePais(id: number): Promise<ApiResult<PaisDetail>> {
  return authRequest<PaisDetail>(`/paises/${id}`, {
    method: "DELETE",
    headers: { ...PLATFORM_HEADER },
  });
}

export function getPaisesLookup(
  signal?: AbortSignal
): Promise<ApiResult<PaisLookupItem[]>> {
  return authRequest<PaisLookupItem[]>("/paises/lookup", {
    method: "GET",
    headers: { ...PLATFORM_HEADER },
    signal,
  });
}